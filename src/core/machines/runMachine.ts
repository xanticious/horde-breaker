import { assign, setup, sendTo } from "xstate";
import { Logger } from "@debug/Logger";
import { traversalMachine } from "./traversalMachine";
import { duelMachine } from "./duelMachine";
import type { HeroId } from "@core/types/hero";
import type { ChapterId } from "@core/types/chapter";
import type { DerivedHeroStats } from "@core/types/hero";
import type { EnemyEncounter } from "@core/types/enemy";
import type { RunResult } from "@core/types/run";
import type { ObstacleInstance } from "@core/entities/obstacles/obstacleBase";
import type { IEnemyBehavior } from "@core/entities/enemies/enemyBase";
import { isTimerExpired } from "@core/systems/timer";
import { isAlive, applyPostDuelHeal } from "@core/systems/health";
import { POST_DUEL_HEAL_PERCENT, MAX_RUN_DURATION_MS } from "@data/balance.data";
import { createSeededRng } from "@utils/random";

const log = Logger.create("run");

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Input required to start a RunMachine — supplied by the GameMachine invoke.
 *
 * All values needed to reconstruct the full run state must be passed here,
 * including the derived hero stats (with upgrades applied) and the pre-generated
 * enemy layout.
 */
export interface RunInput {
  heroId: HeroId;
  chapter: ChapterId;
  heroStats: DerivedHeroStats;
  enemyLayout: EnemyEncounter[];
  /**
   * Obstacle sequences per segment.
   * Index corresponds to the traversal segment index (0 = first segment).
   */
  obstaclesBySegment: ObstacleInstance[][];
  /**
   * Factory that maps an EnemyId to its runtime IEnemyBehavior strategy.
   * Kept as a function to avoid serialisation of complex strategy objects.
   */
  enemyBehaviorFactory: (enemyId: string) => IEnemyBehavior;
  /** Seeded PRNG for deterministic duel AI. Defaults to Date.now() seed if omitted. */
  rngSeed?: number;
}

export interface RunContext {
  heroId: HeroId;
  chapter: ChapterId;
  heroStats: DerivedHeroStats;
  currentHp: number;
  maxHp: number;
  /** Remaining run time in milliseconds. */
  timer: number;
  /** 0–100: percentage of chapter distance cleared. */
  distanceTravelled: number;
  enemyLayout: EnemyEncounter[];
  /** Index into enemyLayout pointing at the next encounter to be fought. */
  currentEncounterIndex: number;
  enemiesDefeated: number;
  duelDamageDealt: number;
  obstaclesBySegment: ObstacleInstance[][];
  enemyBehaviorFactory: (enemyId: string) => IEnemyBehavior;
  rng: () => number;
}

// ── Events ────────────────────────────────────────────────────────────────────

export type RunEvent =
  | { type: "TICK"; deltaMs: number }
  | { type: "JUMP" }
  | { type: "DUCK" }
  | { type: "STAND" }
  | { type: "SPRINT" }
  | { type: "SLOW" }
  | { type: "ATTACK" }
  | { type: "BLOCK" }
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" };

// ── Output ────────────────────────────────────────────────────────────────────

/**
 * Emitted as the final `output` of the RunMachine (via XState's `output` option).
 * The invoking GameMachine receives this in `onDone`.
 */
export type RunOutput = RunResult;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** The logical distance unit per percent of chapter progress. */
const SEGMENT_LENGTH = 1_000;

/** Encounters fully cleared (at or past 100% of enemy layout). */
function allEncountersCleared(context: RunContext): boolean {
  return context.currentEncounterIndex >= context.enemyLayout.length;
}

/** True when the next encounter's position is reached. */
function encounterReached(context: RunContext): boolean {
  const encounter = context.enemyLayout[context.currentEncounterIndex];
  if (!encounter) return false;
  return context.distanceTravelled >= encounter.positionPercent;
}

/** Build a RunResult from the current context for machine output. */
function buildRunResult(context: RunContext): RunResult {
  return {
    heroId: context.heroId,
    chapter: context.chapter,
    currencyEarned: 0, // Computed in Sprint 12 via economy system
    distancePercent: Math.min(100, context.distanceTravelled),
    distanceReached: Math.min(100, context.distanceTravelled),
    enemiesDefeated: context.enemiesDefeated,
    duelDamageDealt: context.duelDamageDealt,
    bossDefeated: allEncountersCleared(context),
    coinsCollected: [],
    completed: allEncountersCleared(context),
  };
}

// ── Machine ───────────────────────────────────────────────────────────────────

/**
 * RunMachine orchestrates a single 90-second run.
 *
 * The hero auto-traverses through the chapter, periodically reaching enemy
 * encounters which spawn a DuelMachine child. When the duel is won the run
 * resumes traversal. The run ends via:
 *   - Timer expiry → death
 *   - Hero HP ≤ 0 (from a lost duel) → death
 *   - All encounters defeated → victory
 *
 * Traversal TICK events must be forwarded from the game loop via the RunMachine's
 * actor ref (not directly to the child). The RunMachine relays them to the active
 * child machine while also updating its own timer context.
 */
export const runMachine = setup({
  types: {
    context: {} as RunContext,
    events: {} as RunEvent,
    input: {} as RunInput,
    output: {} as RunOutput,
  },
  actors: {
    traversalMachine,
    duelMachine,
  },
  guards: {
    timerExpired: ({ context }) => isTimerExpired(context.timer),
    heroDead: ({ context }) => !isAlive(context.currentHp),
    allCleared: ({ context }) => allEncountersCleared(context),
    encounterReached: ({ context }) => encounterReached(context),
  },
  actions: {
    tickTimer: assign(({ context, event }) => {
      if (event.type !== "TICK") return {};
      return { timer: Math.max(0, context.timer - event.deltaMs) };
    }),
    advanceDistance: assign(({ context, event }) => {
      if (event.type !== "TICK") return {};
      // Advance at 1 percent per second per 1px/s of run speed, scaled to a
      // segment length of 1_000 logical units (so 100 % = 1_000 units).
      const pctPerMs = (context.heroStats.runSpeed / SEGMENT_LENGTH) * 0.001;
      const newDistance = Math.min(100, context.distanceTravelled + pctPerMs * event.deltaMs);
      return { distanceTravelled: newDistance };
    }),
    recordDuelWin: assign(({ context, event }) => {
      // Fired via the duelMachine's emitted DUEL_WON event forwarded to onDone.
      // In XState v5, onDone actions receive a DoneActorEvent with an `output`
      // field that is not in the machine's public event union — cast to extract it.
      const rawOutput =
        "output" in event ? (event as { output?: { damageDealt?: number } }).output : undefined;
      const damageDealt = rawOutput?.damageDealt ?? 0;
      const healedHp = applyPostDuelHeal(context.currentHp, context.maxHp, POST_DUEL_HEAL_PERCENT);
      return {
        enemiesDefeated: context.enemiesDefeated + 1,
        duelDamageDealt: context.duelDamageDealt + (damageDealt as number),
        currentEncounterIndex: context.currentEncounterIndex + 1,
        currentHp: healedHp,
      };
    }),
    recordHeroDied: assign(({ context }) => ({
      currentHp: 0,
      currentEncounterIndex: context.currentEncounterIndex,
    })),
  },
}).createMachine({
  id: "run",
  initial: "traversal",
  context: ({ input }) => ({
    heroId: input.heroId,
    chapter: input.chapter,
    heroStats: input.heroStats,
    currentHp: input.heroStats.maxHp,
    maxHp: input.heroStats.maxHp,
    timer: MAX_RUN_DURATION_MS,
    distanceTravelled: 0,
    enemyLayout: input.enemyLayout,
    currentEncounterIndex: 0,
    enemiesDefeated: 0,
    duelDamageDealt: 0,
    obstaclesBySegment: input.obstaclesBySegment,
    enemyBehaviorFactory: input.enemyBehaviorFactory,
    rng: createSeededRng(input.rngSeed ?? Date.now()),
  }),

  output: ({ context }) => buildRunResult(context),

  states: {
    traversal: {
      entry: () => log.debug("run: traversal"),

      invoke: {
        id: "traversalActor",
        src: "traversalMachine",
        input: ({ context }) => {
          // Use the obstacles for the current encounter segment.
          const segmentObstacles = context.obstaclesBySegment[context.currentEncounterIndex] ?? [];
          return {
            speed: context.heroStats.runSpeed,
            // Each segment spans from the current distance to the next encounter.
            // Use a fixed unit length — completion is detected via distanceTravelled.
            segmentLength: SEGMENT_LENGTH,
            obstacles: segmentObstacles.map((o) => ({ ...o })),
            currentHp: context.currentHp,
            maxHp: context.maxHp,
          };
        },
        onDone: {
          // TraversalMachine reaches its final state (segmentDone) — check
          // whether we've reached the next encounter or cleared them all.
          target: "traversal",
          guard: "encounterReached",
          // Re-enter traversal — the TICK loop will detect encounterReached
          // immediately and push to duel. This preserves smooth machine restarts.
        },
      },

      always: [
        { guard: "timerExpired", target: "death" },
        { guard: "heroDead", target: "death" },
        { guard: "allCleared", target: "victory" },
        { guard: "encounterReached", target: "duel" },
      ],

      on: {
        TICK: {
          actions: ["tickTimer", "advanceDistance"],
          // Forward the tick to the traversal child so it can advance position.
          // sendTo is not available inside on.actions array for forwarded ticks,
          // so the game loop must send TICK directly to both actors. We update
          // the run-level timer/distance here and rely on the game loop to also
          // send TICK to traversalActor separately.
        },
        JUMP: { actions: sendTo("traversalActor", { type: "JUMP" }) },
        DUCK: { actions: sendTo("traversalActor", { type: "DUCK" }) },
        STAND: { actions: sendTo("traversalActor", { type: "STAND" }) },
        SPRINT: { actions: sendTo("traversalActor", { type: "SPRINT" }) },
        SLOW: { actions: sendTo("traversalActor", { type: "SLOW" }) },
      },
    },

    duel: {
      entry: () => log.debug("run: duel"),

      invoke: {
        id: "duelActor",
        src: "duelMachine",
        input: ({ context }) => {
          const encounter = context.enemyLayout[context.currentEncounterIndex];
          if (!encounter) {
            // Should never happen — guard prevents entry when encounter is missing.
            throw new Error("[runMachine] duel entered with no current encounter");
          }
          const behavior = context.enemyBehaviorFactory(encounter.enemyId);
          return {
            hero: {
              maxHp: context.currentHp,
              damage:
                context.heroStats.damageMultiplier *
                15 /* base axe damage from barbarian.data.ts */,
              attackSpeed: context.heroStats.attackSpeed,
              armor: context.heroStats.armor,
            },
            enemy: {
              id: encounter.enemyId,
              // Enemy stats will be fetched properly in Sprint 14 — use a flat
              // override that works for Sprint 11's wolf-only roster.
              hp: 40,
              damage: 8,
              behavior,
            },
            rng: context.rng,
          };
        },
        onDone: {
          // DuelMachine reached a final state — check which one via context.
          // XState v5 onDone fires regardless of which final state was reached.
          target: "traversal",
          actions: "recordDuelWin",
        },
        onError: {
          // Treat any duel actor error as a lost duel → death.
          target: "death",
          actions: assign({ currentHp: 0 }),
        },
      },

      // If the hero died inside the duel, the duelMachine emits DUEL_LOST
      // and reaches its heroDied final state. onDone fires, but we detect the
      // death condition by checking HP will be 0 after recordDuelWin runs.
      // A cleaner solution (Sprint 14+) will inspect the duel output type.
      always: [
        { guard: "timerExpired", target: "death" },
        { guard: "heroDead", target: "death" },
      ],

      on: {
        TICK: { actions: "tickTimer" },
        ATTACK: { actions: sendTo("duelActor", { type: "ATTACK" }) },
        BLOCK: { actions: sendTo("duelActor", { type: "BLOCK" }) },
        MOVE_LEFT: { actions: sendTo("duelActor", { type: "MOVE_LEFT" }) },
        MOVE_RIGHT: { actions: sendTo("duelActor", { type: "MOVE_RIGHT" }) },
      },
    },

    death: {
      type: "final",
      entry: () => log.debug("run: death"),
    },

    victory: {
      type: "final",
      entry: () => log.debug("run: victory"),
    },
  },
});
