import { createActor } from "xstate";
import { describe, it, expect } from "vitest";
import { traversalMachine } from "./traversalMachine";
import type { ObstacleInstance } from "@core/entities/obstacles/obstacleBase";

const DEFAULT_HP = 100;

/** Helper: create and start a traversal actor with given inputs. */
function makeActor(options?: {
  speed?: number;
  segmentLength?: number;
  obstacles?: ObstacleInstance[];
  currentHp?: number;
}) {
  const actor = createActor(traversalMachine, {
    input: {
      speed: options?.speed ?? 320,
      segmentLength: options?.segmentLength ?? 1000,
      obstacles: options?.obstacles ?? [],
      currentHp: options?.currentHp ?? DEFAULT_HP,
      maxHp: DEFAULT_HP,
    },
  });
  actor.start();
  return actor;
}

/** Build a time-tax obstacle at a given position. */
function timeTax(position: number, id = "tt1"): ObstacleInstance {
  return { id, type: "timeTax", position, triggered: false };
}

/** Build a health-tax obstacle at a given position. */
function healthTax(position: number, id = "ht1"): ObstacleInstance {
  return { id, type: "healthTax", position, triggered: false };
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

    it("initialises HP from input", () => {
      const actor = makeActor({ currentHp: 80 });
      expect(actor.getSnapshot().context.currentHp).toBe(80);
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

    it("changes heroStance to sprinting on SPRINT and increases speed (× 1.5 base)", () => {
      const actor = makeActor({ speed: 320 });
      actor.send({ type: "SPRINT" });
      const { heroStance, speed } = actor.getSnapshot().context;
      expect(heroStance).toBe("sprinting");
      expect(speed).toBeCloseTo(480); // 320 × 1.5
    });

    it("SLOW uses baseSpeed so speed does not compound", () => {
      const actor = makeActor({ speed: 320 });
      actor.send({ type: "SLOW" });
      const { heroStance, speed } = actor.getSnapshot().context;
      expect(heroStance).toBe("running");
      expect(speed).toBeCloseTo(192); // 320 × 0.6
    });
  });

  describe("obstacle — time-tax (jumped)", () => {
    it("skips time-tax obstacle cleanly when jumping — no stance change, no emit", () => {
      // Obstacle sits at position 200; hero will arrive just after one tick at 320 px/s
      const obs = timeTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      const emittedTimeTax: unknown[] = [];
      actor.on("TIME_TAX_HIT", (e) => emittedTimeTax.push(e));

      actor.send({ type: "JUMP" });
      actor.send({ type: "TICK", deltaMs: 1000 }); // advances to pos 200

      expect(actor.getSnapshot().context.heroStance).toBe("jumping");
      expect(actor.getSnapshot().context.obstacles[0].triggered).toBe(true);
      expect(emittedTimeTax).toHaveLength(0);
    });
  });

  describe("obstacle — time-tax (not jumped)", () => {
    it("triggers climbing stance when hero is not jumping", () => {
      const obs = timeTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      const emittedTimeTax: unknown[] = [];
      actor.on("TIME_TAX_HIT", (e) => emittedTimeTax.push(e));

      actor.send({ type: "TICK", deltaMs: 1000 }); // no jump — hits obstacle

      expect(actor.getSnapshot().context.heroStance).toBe("climbing");
      expect(actor.getSnapshot().context.obstacles[0].triggered).toBe(true);
      expect(emittedTimeTax).toHaveLength(1);
    });

    it("hero position does not advance while climbing", () => {
      const obs = timeTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      actor.send({ type: "TICK", deltaMs: 1000 }); // triggers climb

      const posAfterHit = actor.getSnapshot().context.heroPosition;
      actor.send({ type: "TICK", deltaMs: 500 }); // still climbing

      // Should not advance while climb lock is active
      expect(actor.getSnapshot().context.heroPosition).toBeCloseTo(posAfterHit);
    });

    it("hero resumes running after climbRemainingMs reaches 0", () => {
      const obs = timeTax(200);
      // 2 000 ms climb duration
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      actor.send({ type: "TICK", deltaMs: 1000 }); // triggers climb
      actor.send({ type: "TICK", deltaMs: 2000 }); // burns off full climb duration

      expect(actor.getSnapshot().context.heroStance).toBe("running");
      expect(actor.getSnapshot().context.climbRemainingMs).toBe(0);
    });
  });

  describe("obstacle — health-tax (dodged)", () => {
    it("skips damage when hero is jumping", () => {
      const obs = healthTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      actor.send({ type: "JUMP" });
      actor.send({ type: "TICK", deltaMs: 1000 });
      expect(actor.getSnapshot().context.currentHp).toBe(DEFAULT_HP);
    });

    it("skips damage when hero is ducking", () => {
      const obs = healthTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      actor.send({ type: "DUCK" });
      actor.send({ type: "TICK", deltaMs: 1000 });
      expect(actor.getSnapshot().context.currentHp).toBe(DEFAULT_HP);
    });
  });

  describe("obstacle — health-tax (hit)", () => {
    it("reduces HP when hero is not jumping or ducking", () => {
      const obs = healthTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      const emittedHealthTax: { damage: number }[] = [];
      actor.on("HEALTH_TAX_HIT", (e) => emittedHealthTax.push(e as { damage: number }));

      actor.send({ type: "TICK", deltaMs: 1000 });

      expect(actor.getSnapshot().context.currentHp).toBeLessThan(DEFAULT_HP);
      expect(emittedHealthTax).toHaveLength(1);
      expect(emittedHealthTax[0].damage).toBeGreaterThan(0);
    });

    it("does not trigger the same obstacle twice", () => {
      const obs = healthTax(200);
      const actor = makeActor({ speed: 200, segmentLength: 5000, obstacles: [obs] });
      actor.send({ type: "TICK", deltaMs: 1000 }); // trigger
      const hpAfterFirst = actor.getSnapshot().context.currentHp;
      actor.send({ type: "TICK", deltaMs: 16 }); // still in range but already triggered
      expect(actor.getSnapshot().context.currentHp).toBe(hpAfterFirst);
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
