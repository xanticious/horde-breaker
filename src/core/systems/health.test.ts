import { describe, it, expect } from "vitest";
import { applyDamage, isAlive, applyPostDuelHeal } from "./health";

// ── applyDamage ───────────────────────────────────────────────────────────────

describe("applyDamage", () => {
  it("reduces HP by the damage amount", () => {
    expect(applyDamage(100, 20, 100)).toBe(80);
  });

  it("clamps to 0 when damage exceeds current HP", () => {
    expect(applyDamage(10, 50, 100)).toBe(0);
  });

  it("returns 0 when current HP is already 0", () => {
    expect(applyDamage(0, 20, 100)).toBe(0);
  });

  it("ignores negative damage values (no accidental healing)", () => {
    expect(applyDamage(50, -10, 100)).toBe(50);
  });

  it("returns exact 0 when damage equals HP", () => {
    expect(applyDamage(30, 30, 100)).toBe(0);
  });

  it("never returns a value above maxHp", () => {
    expect(applyDamage(90, 0, 100)).toBe(90);
  });

  it("treats 0 damage as a no-op", () => {
    expect(applyDamage(75, 0, 100)).toBe(75);
  });
});

// ── isAlive ───────────────────────────────────────────────────────────────────

describe("isAlive", () => {
  it("returns true when HP is above 0", () => {
    expect(isAlive(1)).toBe(true);
  });

  it("returns true for full HP", () => {
    expect(isAlive(100)).toBe(true);
  });

  it("returns false when HP is exactly 0", () => {
    expect(isAlive(0)).toBe(false);
  });

  it("returns false when HP is negative (edge case)", () => {
    // HP should never be negative in practice; guard for safety.
    expect(isAlive(-1)).toBe(false);
  });
});

// ── applyPostDuelHeal ─────────────────────────────────────────────────────────

describe("applyPostDuelHeal", () => {
  it("restores the correct fraction of maxHp", () => {
    expect(applyPostDuelHeal(60, 100, 0.2)).toBe(80);
  });

  it("does not heal when percent is 0 (current POD_HEAL_PERCENT)", () => {
    expect(applyPostDuelHeal(40, 100, 0)).toBe(40);
  });

  it("clamps restored HP to maxHp", () => {
    expect(applyPostDuelHeal(90, 100, 0.5)).toBe(100);
  });

  it("returns maxHp when healPercent is 1.0", () => {
    expect(applyPostDuelHeal(0, 100, 1.0)).toBe(100);
  });

  it("rounds the healed amount", () => {
    // 10 + round(100 * 0.15) = 10 + 15 = 25
    expect(applyPostDuelHeal(10, 100, 0.15)).toBe(25);
  });
});
