import { describe, it, expect } from "vitest";
import { calculateDamage, calculateBlockResult, isInRange, calculateKnockback } from "./combat";
import type { DamageModifiers } from "@core/types/combat";

// ── calculateDamage ───────────────────────────────────────────────────────────

describe("calculateDamage", () => {
  const base: DamageModifiers = {
    baseDamage: 10,
    damageMultiplier: 1,
    armorReduction: 0,
    stanceMultiplier: 1,
    criticalHit: false,
  };

  it("returns baseDamage when all multipliers are 1 and no armor", () => {
    expect(calculateDamage(base)).toBe(10);
  });

  it("applies damageMultiplier correctly", () => {
    expect(calculateDamage({ ...base, damageMultiplier: 2.5 })).toBe(25);
  });

  it("applies armorReduction to reduce damage", () => {
    expect(calculateDamage({ ...base, armorReduction: 0.5 })).toBe(5);
  });

  it("applies stanceMultiplier (jump attack bonus)", () => {
    expect(calculateDamage({ ...base, stanceMultiplier: 1.5 })).toBe(15);
  });

  it("doubles damage on critical hit", () => {
    expect(calculateDamage({ ...base, criticalHit: true })).toBe(20);
  });

  it("rounds the result to the nearest integer", () => {
    expect(calculateDamage({ ...base, baseDamage: 10, damageMultiplier: 1.5 })).toBe(15);
    // 10 * 1.3 = 13 (rounds to 13)
    expect(calculateDamage({ ...base, baseDamage: 10, damageMultiplier: 1.3 })).toBe(13);
  });

  it("returns 0 when armor fully negates damage (reduction = 1.0)", () => {
    expect(calculateDamage({ ...base, armorReduction: 1.0 })).toBe(0);
  });

  it("is clamped to 0 — never returns negative values", () => {
    expect(calculateDamage({ ...base, baseDamage: 0, armorReduction: 0.9 })).toBe(0);
  });

  it("combines all modifiers correctly", () => {
    // 10 * 2 * 1.5 * (1 - 0.2) = 10 * 2 * 1.5 * 0.8 = 24
    expect(
      calculateDamage({
        baseDamage: 10,
        damageMultiplier: 2,
        stanceMultiplier: 1.5,
        armorReduction: 0.2,
        criticalHit: false,
      }),
    ).toBe(24);
  });
});

// ── calculateBlockResult ──────────────────────────────────────────────────────

describe("calculateBlockResult", () => {
  it("perfect block returns 0 damage when timing is within window", () => {
    const result = calculateBlockResult(50, 100, 200);
    expect(result.damage).toBe(0);
    expect(result.perfectBlock).toBe(true);
    expect(result.blocked).toBe(true);
    expect(result.stunDuration).toBeGreaterThan(0);
    expect(result.knockback).toBeGreaterThan(0);
  });

  it("perfect block at exact boundary of the timing window", () => {
    const result = calculateBlockResult(50, 200, 200);
    expect(result.perfectBlock).toBe(true);
  });

  it("regular block at one ms beyond the window", () => {
    const result = calculateBlockResult(50, 201, 200);
    expect(result.perfectBlock).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
    expect(result.damage).toBeLessThan(50);
    expect(result.stunDuration).toBe(0);
    expect(result.knockback).toBe(0);
  });

  it("regular block reduces but does not negate damage", () => {
    const result = calculateBlockResult(100, 500, 200);
    expect(result.damage).toBe(20); // 100 * 0.2
    expect(result.perfectBlock).toBe(false);
  });
});

// ── isInRange ─────────────────────────────────────────────────────────────────

describe("isInRange", () => {
  it("returns true when target is exactly at range", () => {
    expect(isInRange(0, 100, 100)).toBe(true);
  });

  it("returns true when target is within range", () => {
    expect(isInRange(0, 50, 100)).toBe(true);
  });

  it("returns false when target is beyond range", () => {
    expect(isInRange(0, 101, 100)).toBe(false);
  });

  it("handles negative positions (attacker to the right)", () => {
    expect(isInRange(100, 0, 100)).toBe(true);
    expect(isInRange(100, 0, 99)).toBe(false);
  });
});

// ── calculateKnockback ────────────────────────────────────────────────────────

describe("calculateKnockback", () => {
  it("returns the base knockback for a normal hit", () => {
    const kb = calculateKnockback("axeSwing", false);
    expect(kb).toBe(30);
  });

  it("returns 1.5× knockback for a critical hit", () => {
    const kb = calculateKnockback("axeSwing", true);
    expect(kb).toBe(45); // 30 * 1.5
  });

  it("leap attack has higher base knockback than axe swing", () => {
    const leap = calculateKnockback("leapAttack", false);
    const axe = calculateKnockback("axeSwing", false);
    expect(leap).toBeGreaterThan(axe);
  });

  it("returns integer values", () => {
    const kb = calculateKnockback("pounce", true);
    expect(Number.isInteger(kb)).toBe(true);
  });
});
