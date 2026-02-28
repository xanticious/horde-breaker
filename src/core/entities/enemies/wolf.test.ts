import { describe, it, expect } from "vitest";
import { wolfBehavior } from "./wolf";
import type { DuelState } from "@core/types/combat";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE_STATE: DuelState = {
  heroX: 0,
  enemyX: 0,
  heroHp: 100,
  maxHeroHp: 100,
  enemyHp: 50,
  maxEnemyHp: 50,
  phase: "idle",
};

/** Always > WOLF_RETREAT_CHANCE (0.2) — forces pounce decision. */
const alwaysPounce = () => 0.5;
/** Always < WOLF_RETREAT_CHANCE (0.2) — forces retreat decision. */
const alwaysRetreat = () => 0.1;

function stateAtDistance(dist: number): DuelState {
  // hero at 0, enemy at dist
  return { ...BASE_STATE, heroX: 0, enemyX: dist };
}

// ── decideAction ──────────────────────────────────────────────────────────────

describe("wolfBehavior.decideAction", () => {
  it("returns wait when hero is out of pounce range (> 300 px)", () => {
    const action = wolfBehavior.decideAction(stateAtDistance(500), alwaysPounce);
    expect(action).toEqual({ type: "wait" });
  });

  it("returns wait when hero is exactly 301 px away", () => {
    const action = wolfBehavior.decideAction(stateAtDistance(301), alwaysPounce);
    expect(action).toEqual({ type: "wait" });
  });

  it("pounces when hero is exactly 300 px away and rng favours pounce", () => {
    const action = wolfBehavior.decideAction(stateAtDistance(300), alwaysPounce);
    expect(action).toEqual({ type: "pounce" });
  });

  it("pounces when hero is within range and rng is above retreat threshold", () => {
    const action = wolfBehavior.decideAction(stateAtDistance(200), alwaysPounce);
    expect(action).toEqual({ type: "pounce" });
  });

  it("retreats when hero is in range and rng is below retreat threshold", () => {
    const action = wolfBehavior.decideAction(stateAtDistance(150), alwaysRetreat);
    expect(action).toEqual({ type: "retreat" });
  });

  it("works when hero is to the right of the enemy (negative diff)", () => {
    // heroX=600, enemyX=0 → dist = 600 > 300 → wait
    const state: DuelState = { ...BASE_STATE, heroX: 600, enemyX: 0 };
    expect(wolfBehavior.decideAction(state, alwaysPounce)).toEqual({ type: "wait" });
  });

  it("uses absolute distance so both directions work for pounce", () => {
    // heroX=600, enemyX=400 → dist=200 ≤ 300 → pounce
    const state: DuelState = { ...BASE_STATE, heroX: 600, enemyX: 400 };
    expect(wolfBehavior.decideAction(state, alwaysPounce)).toEqual({ type: "pounce" });
  });
});

// ── getWindUpDuration ─────────────────────────────────────────────────────────

describe("wolfBehavior.getWindUpDuration", () => {
  it("returns 800 ms for pounce", () => {
    expect(wolfBehavior.getWindUpDuration({ type: "pounce" })).toBe(800);
  });

  it("returns 0 ms for wait", () => {
    expect(wolfBehavior.getWindUpDuration({ type: "wait" })).toBe(0);
  });

  it("returns 0 ms for retreat", () => {
    expect(wolfBehavior.getWindUpDuration({ type: "retreat" })).toBe(0);
  });
});

// ── getRecoveryDuration ───────────────────────────────────────────────────────

describe("wolfBehavior.getRecoveryDuration", () => {
  it("returns 600 ms for pounce", () => {
    expect(wolfBehavior.getRecoveryDuration({ type: "pounce" })).toBe(600);
  });

  it("returns 400 ms for retreat", () => {
    expect(wolfBehavior.getRecoveryDuration({ type: "retreat" })).toBe(400);
  });

  it("returns 0 ms for wait", () => {
    expect(wolfBehavior.getRecoveryDuration({ type: "wait" })).toBe(0);
  });
});
