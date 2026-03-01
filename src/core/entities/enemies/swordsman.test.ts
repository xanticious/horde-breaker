import { describe, it, expect } from "vitest";
import { swordsmanBehavior } from "./swordsman";
import type { DuelState } from "@core/types/combat";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_STATE: DuelState = {
  heroX: 0,
  enemyX: 0,
  heroHp: 100,
  maxHeroHp: 100,
  enemyHp: 60,
  maxEnemyHp: 60,
  phase: "idle",
};

/** rng() > SWORDSMAN_SLASH_CHANCE (0.65) — forced wait when in range. */
const alwaysWait = () => 0.9;
/** rng() < SWORDSMAN_SLASH_CHANCE (0.65) — forced slash when in range. */
const alwaysSlash = () => 0.3;

/** Build a state with hero at `heroX` and swordsman at `enemyX`. */
function stateAt(heroX: number, enemyX: number): DuelState {
  return { ...BASE_STATE, heroX, enemyX };
}

// ── decideAction ──────────────────────────────────────────────────────────────

describe("swordsmanBehavior.decideAction", () => {
  it("waits when hero is outside slash range (> 200 px)", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 300), alwaysSlash);
    expect(action).toEqual({ type: "wait" });
  });

  it("waits when hero is exactly 201 px away", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 201), alwaysSlash);
    expect(action).toEqual({ type: "wait" });
  });

  it("retreats when hero is inside close range (< 70 px)", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 60), alwaysSlash);
    expect(action).toEqual({ type: "retreat" });
  });

  it("retreats when hero is exactly 1 px away", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 1), alwaysSlash);
    expect(action).toEqual({ type: "retreat" });
  });

  it("slashes when hero is in slash range and rng favours slash", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 150), alwaysSlash);
    expect(action).toEqual({ type: "slash" });
  });

  it("waits when hero is in slash range but rng does not favour slash", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 150), alwaysWait);
    expect(action).toEqual({ type: "wait" });
  });

  it("slashes when hero is at exactly 200 px", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 200), alwaysSlash);
    expect(action).toEqual({ type: "slash" });
  });

  it("retreats when hero is at exactly 69 px", () => {
    const action = swordsmanBehavior.decideAction(stateAt(0, 69), alwaysSlash);
    expect(action).toEqual({ type: "retreat" });
  });

  it("works with absolute distance (hero to the right of swordsman)", () => {
    // heroX=500, enemyX=400 → dist=100 ≤ 200 → slash (if rng favours)
    const action = swordsmanBehavior.decideAction(stateAt(500, 400), alwaysSlash);
    expect(action).toEqual({ type: "slash" });
  });

  it("retreats regardless of direction when hero is too close", () => {
    // heroX=500, enemyX=440 → dist=60 < 70 → retreat
    const action = swordsmanBehavior.decideAction(stateAt(500, 440), alwaysSlash);
    expect(action).toEqual({ type: "retreat" });
  });
});

// ── getWindUpDuration ─────────────────────────────────────────────────────────

describe("swordsmanBehavior.getWindUpDuration", () => {
  it("returns 600 ms for slash", () => {
    expect(swordsmanBehavior.getWindUpDuration({ type: "slash" })).toBe(600);
  });

  it("returns 0 ms for wait", () => {
    expect(swordsmanBehavior.getWindUpDuration({ type: "wait" })).toBe(0);
  });

  it("returns 0 ms for retreat", () => {
    expect(swordsmanBehavior.getWindUpDuration({ type: "retreat" })).toBe(0);
  });
});

// ── getRecoveryDuration ───────────────────────────────────────────────────────

describe("swordsmanBehavior.getRecoveryDuration", () => {
  it("returns 700 ms for slash — longer than wind-up to give the player a counter window", () => {
    expect(swordsmanBehavior.getRecoveryDuration({ type: "slash" })).toBe(700);
  });

  it("returns 350 ms for retreat", () => {
    expect(swordsmanBehavior.getRecoveryDuration({ type: "retreat" })).toBe(350);
  });

  it("returns 0 ms for wait", () => {
    expect(swordsmanBehavior.getRecoveryDuration({ type: "wait" })).toBe(0);
  });
});
