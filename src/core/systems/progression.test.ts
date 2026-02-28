import { describe, it, expect } from "vitest";
import { deriveHeroStats } from "./progression";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";
import type { UpgradeGrid } from "@core/types/upgrade";

// ── Helper ────────────────────────────────────────────────────────────────────

const hero = BARBARIAN_HERO;

// ── deriveHeroStats ───────────────────────────────────────────────────────────

describe("deriveHeroStats", () => {
  it("returns base stats when no upgrades are purchased (empty grid = all level 1)", () => {
    const stats = deriveHeroStats(hero, {});
    // effectPerLevel index 0 corresponds to level 1 (base).
    expect(stats.maxHp).toBe(100);
    expect(stats.armor).toBe(0);
    expect(stats.runSpeed).toBe(320);
    expect(stats.damageMultiplier).toBe(1);
    expect(stats.attackSpeed).toBe(1);
  });

  it("applies maxHealth upgrade at level 2", () => {
    const upgrades: UpgradeGrid = { maxHealth: 2 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.maxHp).toBe(125);
  });

  it("applies maxHealth upgrade at max level 6", () => {
    const upgrades: UpgradeGrid = { maxHealth: 6 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.maxHp).toBe(275);
  });

  it("applies armor upgrade correctly (level 3 = 0.12)", () => {
    // armor effectPerLevel: [0, 0.06, 0.12, 0.2, 0.3, 0.4] — level 3 = index 2
    const upgrades: UpgradeGrid = { armor: 3 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.armor).toBeCloseTo(0.12);
  });

  it("applies runSpeed upgrade (level 2 = 352 px/s)", () => {
    // runSpeed effectPerLevel: [320, 352, 390, 435, 485, 540]
    const upgrades: UpgradeGrid = { runSpeed: 2 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.runSpeed).toBe(352);
  });

  it("applies damageMultiplier upgrade (level 4 = 1.75)", () => {
    // damageMultiplier effectPerLevel: [1, 1.2, 1.45, 1.75, 2.1, 2.5]
    const upgrades: UpgradeGrid = { damageMultiplier: 4 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.damageMultiplier).toBeCloseTo(1.75);
  });

  it("applies attackSpeed upgrade (level 6 = 0.6)", () => {
    // attackSpeed effectPerLevel: [1, 0.92, 0.84, 0.76, 0.68, 0.6]
    const upgrades: UpgradeGrid = { attackSpeed: 6 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.attackSpeed).toBeCloseTo(0.6);
  });

  it("adds special damage bonus from upgrade to the base special damage (level 2 = +5)", () => {
    // special effectPerLevel: [0, 5, 12, 22, 35, 50] — level 2 bonus = 5
    // leapAttack baseDamage = 30, so result = 35
    const upgrades: UpgradeGrid = { special: 2 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.specialAbility.damage).toBe(35);
  });

  it("includes special cooldown and duration in derived stats", () => {
    const stats = deriveHeroStats(hero, {});
    expect(stats.specialAbility.cooldownMs).toBe(8000);
    expect(stats.specialAbility.durationMs).toBeGreaterThan(0);
  });

  it("correctly combines multiple independent upgrades", () => {
    const upgrades: UpgradeGrid = { maxHealth: 3, armor: 2 };
    const stats = deriveHeroStats(hero, upgrades);
    expect(stats.maxHp).toBe(155);
    expect(stats.armor).toBeCloseTo(0.06);
  });
});
