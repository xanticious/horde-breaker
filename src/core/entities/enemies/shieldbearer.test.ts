import { describe, it, expect } from "vitest";
import { shieldbearerBehavior, SHIELDBEARER_BASE_ARMOR } from "./shieldbearer";
import type { DuelState } from "@core/types/combat";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_STATE: DuelState = {
  heroX: 0,
  enemyX: 0,
  heroHp: 100,
  maxHeroHp: 100,
  enemyHp: 80,
  maxEnemyHp: 80,
  phase: "idle",
};

/** rng() < SHIELDBEARER_BASH_CHANCE (0.7) — forced bash when in range. */
const alwaysBash = () => 0.3;
/** rng() > SHIELDBEARER_BASH_CHANCE (0.7) — forced retreat when in range. */
const alwaysRetreat = () => 0.9;

function stateAt(heroX: number, enemyX: number): DuelState {
  return { ...BASE_STATE, heroX, enemyX };
}

// ── decideAction ──────────────────────────────────────────────────────────────

describe("shieldbearerBehavior.decideAction", () => {
  it("waits when hero is outside bash range (> 160 px)", () => {
    const action = shieldbearerBehavior.decideAction(stateAt(0, 200), alwaysBash);
    expect(action).toEqual({ type: "wait" });
  });

  it("waits when hero is exactly 161 px away", () => {
    const action = shieldbearerBehavior.decideAction(stateAt(0, 161), alwaysBash);
    expect(action).toEqual({ type: "wait" });
  });

  it("shields-bashes when hero is in bash range and rng favours bash", () => {
    const action = shieldbearerBehavior.decideAction(stateAt(0, 100), alwaysBash);
    expect(action).toEqual({ type: "shieldBash" });
  });

  it("retreats when hero is in bash range but rng does not favour bash", () => {
    const action = shieldbearerBehavior.decideAction(stateAt(0, 100), alwaysRetreat);
    expect(action).toEqual({ type: "retreat" });
  });

  it("bashes when hero is at exactly 160 px", () => {
    const action = shieldbearerBehavior.decideAction(stateAt(0, 160), alwaysBash);
    expect(action).toEqual({ type: "shieldBash" });
  });

  it("uses absolute distance so direction does not matter", () => {
    // heroX=400, enemyX=300 → dist=100 ≤ 160 → bash
    const action = shieldbearerBehavior.decideAction(stateAt(400, 300), alwaysBash);
    expect(action).toEqual({ type: "shieldBash" });
  });
});

// ── getWindUpDuration ─────────────────────────────────────────────────────────

describe("shieldbearerBehavior.getWindUpDuration", () => {
  it("returns 700 ms for shieldBash", () => {
    expect(shieldbearerBehavior.getWindUpDuration({ type: "shieldBash" })).toBe(700);
  });

  it("returns 0 ms for wait", () => {
    expect(shieldbearerBehavior.getWindUpDuration({ type: "wait" })).toBe(0);
  });

  it("returns 0 ms for retreat", () => {
    expect(shieldbearerBehavior.getWindUpDuration({ type: "retreat" })).toBe(0);
  });
});

// ── getRecoveryDuration ───────────────────────────────────────────────────────

describe("shieldbearerBehavior.getRecoveryDuration", () => {
  it("returns 900 ms for shieldBash — longer than wind-up for a punish window", () => {
    expect(shieldbearerBehavior.getRecoveryDuration({ type: "shieldBash" })).toBe(900);
  });

  it("returns 450 ms for retreat", () => {
    expect(shieldbearerBehavior.getRecoveryDuration({ type: "retreat" })).toBe(450);
  });

  it("returns 0 ms for wait", () => {
    expect(shieldbearerBehavior.getRecoveryDuration({ type: "wait" })).toBe(0);
  });
});

// ── SHIELDBEARER_BASE_ARMOR ───────────────────────────────────────────────────

describe("SHIELDBEARER_BASE_ARMOR", () => {
  it("is a positive fraction less than 1", () => {
    expect(SHIELDBEARER_BASE_ARMOR).toBeGreaterThan(0);
    expect(SHIELDBEARER_BASE_ARMOR).toBeLessThan(1);
  });
});
