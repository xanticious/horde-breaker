import { createActor } from "xstate";
import { describe, it, expect, vi } from "vitest";
import { traversalMachine } from "./traversalMachine";

/** Helper: create and start a traversal actor with given inputs. */
function makeActor(options?: { speed?: number; segmentLength?: number }) {
  const actor = createActor(traversalMachine, {
    input: {
      speed: options?.speed ?? 320,
      segmentLength: options?.segmentLength ?? 1000,
    },
  });
  actor.start();
  return actor;
}

describe("traversalMachine", () => {
  describe("initial state", () => {
    it("starts in running state", () => {
      const actor = makeActor();
      expect(actor.getSnapshot().value).toBe("running");
    });

    it("initialises heroPosition to 0", () => {
      const actor = makeActor();
      expect(actor.getSnapshot().context.heroPosition).toBe(0);
    });

    it("reflects the provided speed and segmentLength from input", () => {
      const actor = makeActor({ speed: 500, segmentLength: 2000 });
      const { speed, segmentLength } = actor.getSnapshot().context;
      expect(speed).toBe(500);
      expect(segmentLength).toBe(2000);
    });

    it("initialises heroStance to running", () => {
      const actor = makeActor();
      expect(actor.getSnapshot().context.heroStance).toBe("running");
    });
  });

  describe("TICK advances position", () => {
    it("advances heroPosition proportional to speed × deltaMs", () => {
      const actor = makeActor({ speed: 320, segmentLength: 10_000 });
      actor.send({ type: "TICK", deltaMs: 1000 }); // 1 second
      // 320 px/s × 1 s = 320 px
      expect(actor.getSnapshot().context.heroPosition).toBeCloseTo(320);
    });

    it("advances by a fractional amount for small deltaMs", () => {
      const actor = makeActor({ speed: 320, segmentLength: 10_000 });
      actor.send({ type: "TICK", deltaMs: 16.67 }); // ~1 frame at 60 fps
      // 320 × 0.01667 ≈ 5.33 px
      expect(actor.getSnapshot().context.heroPosition).toBeCloseTo(320 * (16.67 / 1000));
    });

    it("accumulates position across multiple ticks", () => {
      const actor = makeActor({ speed: 100, segmentLength: 10_000 });
      actor.send({ type: "TICK", deltaMs: 500 });
      actor.send({ type: "TICK", deltaMs: 500 });
      // 100 × 1 s = 100 px
      expect(actor.getSnapshot().context.heroPosition).toBeCloseTo(100);
    });
  });

  describe("segment completion", () => {
    it("transitions to segmentDone when position reaches segmentLength", () => {
      const actor = makeActor({ speed: 1000, segmentLength: 1000 });
      // One tick of 1 second at 1000 px/s should complete the segment
      actor.send({ type: "TICK", deltaMs: 1000 });
      expect(actor.getSnapshot().value).toBe("segmentDone");
    });

    it("emits SEGMENT_COMPLETE when segment is done", () => {
      const actor = makeActor({ speed: 1000, segmentLength: 500 });
      const emitted: unknown[] = [];
      actor.on("SEGMENT_COMPLETE", (e) => emitted.push(e));
      actor.send({ type: "TICK", deltaMs: 600 }); // overshoots by 100
      expect(emitted).toHaveLength(1);
    });

    it("does not emit SEGMENT_COMPLETE before the segment is done", () => {
      const actor = makeActor({ speed: 100, segmentLength: 1000 });
      const emitted: unknown[] = [];
      actor.on("SEGMENT_COMPLETE", (e) => emitted.push(e));
      actor.send({ type: "TICK", deltaMs: 500 }); // halfway
      expect(emitted).toHaveLength(0);
    });

    it("stays in segmentDone after completion (final state)", () => {
      const actor = makeActor({ speed: 1000, segmentLength: 100 });
      actor.send({ type: "TICK", deltaMs: 200 });
      // Sending more events after finalisation should not change state
      actor.send({ type: "TICK", deltaMs: 200 });
      expect(actor.getSnapshot().value).toBe("segmentDone");
    });
  });

  describe("stance changes", () => {
    it("changes heroStance to jumping on JUMP", () => {
      const actor = makeActor();
      actor.send({ type: "JUMP" });
      expect(actor.getSnapshot().context.heroStance).toBe("jumping");
    });

    it("changes heroStance to ducking on DUCK", () => {
      const actor = makeActor();
      actor.send({ type: "DUCK" });
      expect(actor.getSnapshot().context.heroStance).toBe("ducking");
    });

    it("returns heroStance to running on STAND", () => {
      const actor = makeActor();
      actor.send({ type: "JUMP" });
      actor.send({ type: "STAND" });
      expect(actor.getSnapshot().context.heroStance).toBe("running");
    });

    it("changes heroStance to sprinting on SPRINT and increases speed", () => {
      const actor = makeActor({ speed: 320 });
      actor.send({ type: "SPRINT" });
      const { heroStance, speed } = actor.getSnapshot().context;
      expect(heroStance).toBe("sprinting");
      expect(speed).toBeCloseTo(480); // 320 × 1.5
    });

    it("changes heroStance to running on SLOW and reduces speed", () => {
      const actor = makeActor({ speed: 320 });
      actor.send({ type: "SLOW" });
      const { heroStance, speed } = actor.getSnapshot().context;
      expect(heroStance).toBe("running");
      expect(speed).toBeCloseTo(192); // 320 × 0.6
    });
  });

  describe("ignored events", () => {
    it("ignores JUMP events in segmentDone state", () => {
      const actor = makeActor({ speed: 1000, segmentLength: 100 });
      actor.send({ type: "TICK", deltaMs: 200 }); // complete segment
      actor.send({ type: "JUMP" });
      expect(actor.getSnapshot().value).toBe("segmentDone");
    });
  });
});
