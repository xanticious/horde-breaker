import { assign, emit, setup } from "xstate";
import { Logger } from "@debug/Logger";

const log = Logger.create("traversal");

// ── Types ─────────────────────────────────────────────────────────────────────

/** Stance the hero can be in during a traversal segment. */
export type HeroStance = "running" | "jumping" | "ducking" | "sprinting" | "climbing";

/** Snapshot of the traversal segment state used by the renderer each frame. */
export interface TraversalContext {
  /** Current run speed in pixels per second (design resolution 1920 wide). */
  speed: number;
  /** Logical position within the current segment (0 = start, segmentLength = end). */
  heroPosition: number;
  /** Total logical length of this segment before an encounter or chapter end. */
  segmentLength: number;
  /** Current visual stance driving placeholder colour + animation selection. */
  heroStance: HeroStance;
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

export type TraversalEmitted = { type: "SEGMENT_COMPLETE" };

// ── Machine ───────────────────────────────────────────────────────────────────

/**
 * Manages a single traversal segment. The hero auto-advances at `speed` px/s.
 * When `heroPosition >= segmentLength` the machine emits `SEGMENT_COMPLETE`
 * so the RunMachine (Sprint 11) can transition to a duel.
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
    },
  },
  actions: {
    advancePosition: assign({
      heroPosition: ({ context, event }) => {
        if (event.type !== "TICK") return context.heroPosition;
        // Convert px/s speed to px per frame using deltaMs
        return context.heroPosition + context.speed * (event.deltaMs / 1000);
      },
    }),
    emitSegmentComplete: emit({ type: "SEGMENT_COMPLETE" }),
  },
  guards: {
    segmentComplete: ({ context }) => context.heroPosition >= context.segmentLength,
  },
}).createMachine({
  id: "traversal",
  initial: "running",
  context: ({ input }) => ({
    speed: input.speed,
    heroPosition: 0,
    segmentLength: input.segmentLength,
    heroStance: "running",
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
            actions: ["advancePosition", "emitSegmentComplete"],
          },
          {
            actions: ["advancePosition"],
          },
        ],
        JUMP: {
          actions: assign({ heroStance: "jumping" }),
        },
        DUCK: {
          actions: assign({ heroStance: "ducking" }),
        },
        STAND: {
          actions: assign({ heroStance: "running" }),
        },
        SPRINT: {
          actions: assign({
            heroStance: "sprinting",
            // Sprint adds 50% to speed
            speed: ({ context }) => context.speed * 1.5,
          }),
        },
        SLOW: {
          actions: assign({
            heroStance: "running",
            // Slow reduces speed to 60%
            speed: ({ context }) => context.speed * 0.6,
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
