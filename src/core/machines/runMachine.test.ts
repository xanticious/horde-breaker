import { createActor } from "xstate";
import { describe, it, expect } from "vitest";
import { runMachine } from "./runMachine";
import { HeroId } from "@core/types/hero";
import { ChapterId } from "@core/types/chapter";
import type { DerivedHeroStats } from "@core/types/hero";
import type { RunInput } from "./runMachine";
import type { IEnemyBehavior, EnemyAction } from "@core/entities/enemies/enemyBase";
import type { DuelState } from "@core/types/combat";
import { EnemyId } from "@core/types/enemy";
import { MAX_RUN_DURATION_MS } from "@data/balance.data";

// ── Helpers & fixtures ────────────────────────────────────────────────────────

const MOCK_HERO_STATS: DerivedHeroStats = {
  maxHp: 100,
  armor: 0,
  runSpeed: 320,
  damageMultiplier: 1,
  attackSpeed: 1,
  specialAbility: { damage: 30, cooldownMs: 8_000, durationMs: 600 },
};

const MOCK_ENEMY_BEHAVIOR: IEnemyBehavior = {
  decideAction(_state: DuelState, _rng: () => number): EnemyAction {
    return { type: "wait" };
  },
  getWindUpDuration(_action: EnemyAction): number {
    return 0;
  },
  getRecoveryDuration(_action: EnemyAction): number {
    return 0;
  },
};

const MOCK_BEHAVIOR_FACTORY = (): IEnemyBehavior => MOCK_ENEMY_BEHAVIOR;

function makeInput(overrides: Partial<RunInput> = {}): RunInput {
  return {
    heroId: HeroId.Barbarian,
    chapter: ChapterId.Chapter1,
    heroStats: MOCK_HERO_STATS,
    enemyLayout: [
      { enemyId: EnemyId.Wolf, positionPercent: 20, isBoss: false },
      { enemyId: EnemyId.Wolf, positionPercent: 50, isBoss: false },
    ],
    obstaclesBySegment: [[], []],
    enemyBehaviorFactory: MOCK_BEHAVIOR_FACTORY,
    rngSeed: 42,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("runMachine", () => {
  describe("initial state", () => {
    it("starts in traversal state", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      expect(actor.getSnapshot().value).toBe("traversal");
    });

    it("initialises hero HP from heroStats.maxHp", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      expect(actor.getSnapshot().context.currentHp).toBe(100);
    });

    it("starts with full timer", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      expect(actor.getSnapshot().context.timer).toBe(MAX_RUN_DURATION_MS);
    });

    it("starts at zero distance", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      expect(actor.getSnapshot().context.distanceTravelled).toBe(0);
    });
  });

  describe("TICK events", () => {
    it("decreases timer on TICK", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: 1_000 });
      expect(actor.getSnapshot().context.timer).toBe(MAX_RUN_DURATION_MS - 1_000);
    });

    it("increases distanceTravelled on TICK", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: 1_000 });
      expect(actor.getSnapshot().context.distanceTravelled).toBeGreaterThan(0);
    });

    it("timer does not go below 0", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: MAX_RUN_DURATION_MS + 5_000 });
      expect(actor.getSnapshot().context.timer).toBe(0);
    });
  });

  describe("timer expiry", () => {
    it("transitions to death when timer expires", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      // Send a single tick that exceeds the full run duration.
      actor.send({ type: "TICK", deltaMs: MAX_RUN_DURATION_MS + 1 });
      expect(actor.getSnapshot().value).toBe("death");
    });

    it("machine is done (final state) after death", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: MAX_RUN_DURATION_MS + 1 });
      expect(actor.getSnapshot().status).toBe("done");
    });
  });

  describe("output (RunResult)", () => {
    it("provides output when done via death", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: MAX_RUN_DURATION_MS + 1 });
      const output = actor.getSnapshot().output;
      expect(output).toBeDefined();
      expect(output?.heroId).toBe(HeroId.Barbarian);
      expect(output?.chapter).toBe(ChapterId.Chapter1);
      expect(output?.completed).toBe(false);
    });

    it("output enemiesDefeated starts at 0", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: MAX_RUN_DURATION_MS + 1 });
      expect(actor.getSnapshot().output?.enemiesDefeated).toBe(0);
    });
  });

  describe("victory when encounters cleared", () => {
    it("transitions to victory when all encounters cleared", () => {
      // Supply an empty layout — no encounters to fight.
      const actor = createActor(runMachine, {
        input: makeInput({
          enemyLayout: [],
          obstaclesBySegment: [],
        }),
      });
      actor.start();
      // With no encounters, allCleared guard fires immediately from traversal.
      expect(actor.getSnapshot().value).toBe("victory");
    });

    it("victory output marks completed = true", () => {
      const actor = createActor(runMachine, {
        input: makeInput({ enemyLayout: [], obstaclesBySegment: [] }),
      });
      actor.start();
      const output = actor.getSnapshot().output;
      expect(output?.completed).toBe(true);
    });
  });

  describe("encounter detection", () => {
    it("transitions to duel when encounter position is reached", () => {
      // Place encounter at position 0 so it's reached immediately.
      const actor = createActor(runMachine, {
        input: makeInput({
          enemyLayout: [{ enemyId: EnemyId.Wolf, positionPercent: 0, isBoss: false }],
          obstaclesBySegment: [[]],
        }),
      });
      actor.start();
      // With positionPercent: 0 the encounterReached guard fires immediately.
      expect(actor.getSnapshot().value).toBe("duel");
    });
  });

  describe("hero death mid-traversal", () => {
    it("death state is final", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: MAX_RUN_DURATION_MS + 1 });
      expect(["death", "victory"].includes(actor.getSnapshot().value as string)).toBe(true);
      expect(actor.getSnapshot().status).toBe("done");
    });
  });

  describe("enemy defeated tracking", () => {
    it("enemiesDefeated starts at 0", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      expect(actor.getSnapshot().context.enemiesDefeated).toBe(0);
    });
  });

  describe("context immutability", () => {
    it("heroStats are preserved through the run", () => {
      const actor = createActor(runMachine, { input: makeInput() });
      actor.start();
      actor.send({ type: "TICK", deltaMs: 500 });
      expect(actor.getSnapshot().context.heroStats).toEqual(MOCK_HERO_STATS);
    });

    it("enemyLayout is preserved through the run", () => {
      const input = makeInput();
      const actor = createActor(runMachine, { input });
      actor.start();
      expect(actor.getSnapshot().context.enemyLayout).toHaveLength(2);
    });
  });
});
