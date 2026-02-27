import { assign, emit, setup } from "xstate";
import { Logger } from "@debug/Logger";
import type { ObstacleInstance } from "@core/entities/obstacles/obstacleBase";
import { OBSTACLE_COLLISION_RADIUS } from "@core/entities/obstacles/obstacleBase";
import { TIME_TAX_CLIMB_DURATION_MS, HEALTH_TAX_DAMAGE } from "@data/balance.data";

const log = Logger.create("traversal");

// ── Types ─────────────────────────────────────────────────────────────────────

/** Stance the hero can be in during a traversal segment. */
export type HeroStance = "running" | "jumping" | "ducking" | "sprinting" | "climbing";

/** Snapshot of the traversal segment state used by the renderer each frame. */
export interface TraversalContext {
  /** Current run speed in pixels per second (design resolution 1920 wide). */
  speed: number;
  /** Base speed before sprint/slow modifiers — used to restore speed after climbing. */
  baseSpeed: number;
  /** Logical position within the current segment (0 = start, segmentLength = end). */
  heroPosition: number;
  /** Total logical length of this segment before an encounter or chapter end. */
  segmentLength: number;
  /** Current visual stance driving placeholder colour + animation selection. */
  heroStance: HeroStance;
  /** Obstacles placed in this segment. Once triggered they are marked so they don't fire twice. */
  obstacles: ObstacleInstance[];
  /** Current hero HP — decremented by health-tax obstacles. */
  currentHp: number;
  /** Maximum hero HP — used to display the health bar. */
  maxHp: number;
  /**
   * Remaining milliseconds of climb animation lock.
   * Positive value means the hero is stuck climbing and cannot run forward.
   */
  climbRemainingMs: number;
}

// ── Events ────────────────────────────────────────────────────────────────────

export type TraversalEvent =
  | {
      /** Advance the traversal by one frame. deltaMs = elapsed ms since last frame. */
      type: "TICK";
      deltaMs: number;
    }
  | { type: "JUMP" }
  | { type: "DUCK" }
  | { type: "STAND" }
  | { type: "SPRINT" }
  | { type: "SLOW" };

// ── Emitted events (for parent actors) ────────────────────────────────────────

export type TraversalEmitted =
  | { type: "SEGMENT_COMPLETE" }
  /** Fired when a health-tax obstacle damages the hero — parent updates HP. */
  | { type: "HEALTH_TAX_HIT"; damage: number }
  /** Fired when a time-tax obstacle is triggered — parent may penalise the run timer. */
  | { type: "TIME_TAX_HIT" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Checks whether the hero's position overlaps an untriggered obstacle.
 * Returns the first matching obstacle index, or -1 if none.
 */
function findTriggeredObstacleIndex(
  context: TraversalContext,
  heroPosition = context.heroPosition,
): number {
  return context.obstacles.findIndex(
    (o) => !o.triggered && Math.abs(heroPosition - o.position) <= OBSTACLE_COLLISION_RADIUS,
  );
}

function getProjectedHeroPosition(context: TraversalContext, event: TraversalEvent): number {
  if (event.type !== "TICK") return context.heroPosition;
  if (context.climbRemainingMs > 0) return context.heroPosition;
  return context.heroPosition + context.speed * (event.deltaMs / 1000);
}

// ── Machine ───────────────────────────────────────────────────────────────────

/**
 * Manages a single traversal segment. The hero auto-advances at `speed` px/s.
 * When `heroPosition >= segmentLength` the machine emits `SEGMENT_COMPLETE`
 * so the RunMachine (Sprint 11) can transition to a duel.
 *
 * Obstacle handling:
 * - If the hero is jumping when a TimeTax obstacle is reached, it is skipped cleanly.
 * - If not jumping, the hero enters a "climbing" state that pauses advance for a fixed duration.
 * - If the hero is jumping or ducking when a HealthTax obstacle is reached, it is skipped.
 * - Otherwise, the hero takes damage and emits HEALTH_TAX_HIT.
 *
 * Input is accepted via JUMP/DUCK/STAND/SPRINT/SLOW events — the machine
 * records the resulting stance and adjusts speed accordingly.
 */
export const traversalMachine = setup({
  types: {
    context: {} as TraversalContext,
    events: {} as TraversalEvent,
    emitted: {} as TraversalEmitted,
    input: {} as {
      speed: number;
      segmentLength: number;
      obstacles?: ObstacleInstance[];
      currentHp: number;
      maxHp: number;
    },
  },
  actions: {
    advancePosition: assign(({ context, event }) => {
      if (event.type !== "TICK") return {};

      // Still climbing — burn down the lock timer but don't move forward.
      if (context.climbRemainingMs > 0) {
        const remaining = Math.max(0, context.climbRemainingMs - event.deltaMs);
        const isDone = remaining === 0;
        return {
          climbRemainingMs: remaining,
          // When climb finishes, restore base speed and return to running stance.
          ...(isDone ? { heroStance: "running" as HeroStance, speed: context.baseSpeed } : {}),
        };
      }

      const newPosition = context.heroPosition + context.speed * (event.deltaMs / 1000);
      return { heroPosition: newPosition };
    }),

    checkObstacles: assign(({ context, event }) => {
      if (event.type !== "TICK") return {};

      const idx = findTriggeredObstacleIndex(context);
      if (idx === -1) return {};

      const obstacle = context.obstacles[idx];
      const updatedObstacles = context.obstacles.map((o, i) =>
        i === idx ? { ...o, triggered: true } : o,
      );

      if (obstacle.type === "timeTax") {
        // Jump clears a time-tax obstacle — no penalty.
        if (context.heroStance === "jumping") {
          return { obstacles: updatedObstacles };
        }
        // Hero must climb — lock position for the climb duration.
        return {
          obstacles: updatedObstacles,
          heroStance: "climbing" as HeroStance,
          climbRemainingMs: TIME_TAX_CLIMB_DURATION_MS,
          speed: 0,
        };
      }

      // healthTax: jump or duck clears it — otherwise take damage.
      if (context.heroStance === "jumping" || context.heroStance === "ducking") {
        return { obstacles: updatedObstacles };
      }
      const newHp = Math.max(0, context.currentHp - HEALTH_TAX_DAMAGE);
      return { obstacles: updatedObstacles, currentHp: newHp };
    }),

    emitSegmentComplete: emit({ type: "SEGMENT_COMPLETE" } as TraversalEmitted),

    emitTimeTax: emit({ type: "TIME_TAX_HIT" } as TraversalEmitted),

    emitHealthTax: emit({ type: "HEALTH_TAX_HIT", damage: HEALTH_TAX_DAMAGE } as TraversalEmitted),
  },
  guards: {
    segmentComplete: ({ context, event }) =>
      getProjectedHeroPosition(context, event) >= context.segmentLength,

    hitTimeTaxObstacle: ({ context, event }) => {
      const projectedPosition = getProjectedHeroPosition(context, event);
      const idx = findTriggeredObstacleIndex(context, projectedPosition);
      if (idx === -1) return false;
      const obs = context.obstacles[idx];
      return obs.type === "timeTax" && context.heroStance !== "jumping";
    },

    hitHealthTaxObstacle: ({ context, event }) => {
      const projectedPosition = getProjectedHeroPosition(context, event);
      const idx = findTriggeredObstacleIndex(context, projectedPosition);
      if (idx === -1) return false;
      const obs = context.obstacles[idx];
      return (
        obs.type === "healthTax" &&
        context.heroStance !== "jumping" &&
        context.heroStance !== "ducking"
      );
    },
  },
}).createMachine({
  id: "traversal",
  initial: "running",
  context: ({ input }) => ({
    speed: input.speed,
    baseSpeed: input.speed,
    heroPosition: 0,
    segmentLength: input.segmentLength,
    heroStance: "running",
    obstacles: input.obstacles ?? [],
    currentHp: input.currentHp,
    maxHp: input.maxHp,
    climbRemainingMs: 0,
  }),
  states: {
    running: {
      entry: () => log.debug("traversal running"),
      on: {
        TICK: [
          {
            // Segment complete — emit event then move to segmentDone
            guard: "segmentComplete",
            target: "segmentDone",
            actions: ["advancePosition", "checkObstacles", "emitSegmentComplete"],
          },
          {
            // Health-tax obstacle hit — emit damage event and advance
            guard: "hitHealthTaxObstacle",
            actions: ["advancePosition", "checkObstacles", "emitHealthTax"],
          },
          {
            // Time-tax obstacle hit — emit time penalty event and start climbing
            guard: "hitTimeTaxObstacle",
            actions: ["advancePosition", "checkObstacles", "emitTimeTax"],
          },
          {
            actions: ["advancePosition", "checkObstacles"],
          },
        ],
        JUMP: {
          actions: assign({ heroStance: "jumping" as HeroStance }),
        },
        DUCK: {
          actions: assign({ heroStance: "ducking" as HeroStance }),
        },
        STAND: {
          actions: assign({ heroStance: "running" as HeroStance }),
        },
        SPRINT: {
          actions: assign({
            heroStance: "sprinting" as HeroStance,
            // Sprint adds 50% to base speed
            speed: ({ context }) => context.baseSpeed * 1.5,
          }),
        },
        SLOW: {
          actions: assign({
            heroStance: "running" as HeroStance,
            // Slow reduces to 60% of base speed
            speed: ({ context }) => context.baseSpeed * 0.6,
          }),
        },
      },
    },
    segmentDone: {
      // Terminal state — the RunMachine listens for the SEGMENT_COMPLETE
      // emission and tears down this actor. Nothing further happens here.
      type: "final",
    },
  },
});
