import { describe, it, expect } from "vitest";
import {
  calculateRunReward,
  getUpgradeCost,
  canAffordUpgrade,
  applyUpgradePurchase,
} from "./economy";
import { ChapterId } from "@core/types/chapter";
import { HeroId } from "@core/types/hero";
import type { RunResult } from "@core/types/run";
import type { UpgradeCategoryData } from "@core/types/upgrade";

// ── Test fixtures ─────────────────────────────────────────────────────────────

const baseResult: RunResult = {
  heroId: HeroId.Barbarian,
  chapter: ChapterId.Chapter1,
  currencyEarned: 0,
  distancePercent: 50,
  distanceReached: 50,
  enemiesDefeated: 2,
  duelDamageDealt: 30,
  bossDefeated: false,
  coinsCollected: [],
  completed: false,
};

const sampleCategories: UpgradeCategoryData[] = [
  {
    id: "maxHealth",
    name: "Max Health",
    costs: [18, 40, 100, 220, 450],
    effectPerLevel: [100, 125, 155, 190, 230, 275],
  },
  {
    id: "armor",
    name: "Armour",
    costs: [18, 40, 100, 220, 450],
    effectPerLevel: [0, 0.06, 0.12, 0.2, 0.3, 0.4],
  },
];

// ── calculateRunReward ────────────────────────────────────────────────────────

describe("calculateRunReward", () => {
  it("calculates all components for a Chapter 1 run with multiplier 1", () => {
    const reward = calculateRunReward({
      ...baseResult,
      distancePercent: 50,
      enemiesDefeated: 2,
      duelDamageDealt: 30,
      bossDefeated: false,
      coinsCollected: [],
    });
    expect(reward.distanceReward).toBe(50); // 50 * 1 * 1
    expect(reward.duelDamageReward).toBe(30); // 30 * 1 * 1
    expect(reward.enemyKillReward).toBe(100); // 2 * 50 * 1
    expect(reward.bossReward).toBe(0);
    expect(reward.coinReward).toBe(0);
    expect(reward.total).toBe(180);
  });

  it("scales all rewards by the Chapter 2 multiplier (2.5)", () => {
    const reward = calculateRunReward({
      ...baseResult,
      chapter: ChapterId.Chapter2,
      distancePercent: 40,
      enemiesDefeated: 1,
      duelDamageDealt: 0,
      bossDefeated: false,
      coinsCollected: [],
    });
    expect(reward.distanceReward).toBe(100); // 40 * 1 * 2.5
    expect(reward.enemyKillReward).toBe(125); // 1 * 50 * 2.5
    expect(reward.total).toBe(225);
  });

  it("adds a boss reward when boss is defeated", () => {
    const reward = calculateRunReward({
      ...baseResult,
      bossDefeated: true,
      distancePercent: 0,
      enemiesDefeated: 0,
      duelDamageDealt: 0,
      coinsCollected: [],
    });
    expect(reward.bossReward).toBe(200); // 200 * 1
  });

  it("sums coin values and applies the multiplier", () => {
    const reward = calculateRunReward({
      ...baseResult,
      distancePercent: 0,
      enemiesDefeated: 0,
      duelDamageDealt: 0,
      bossDefeated: false,
      coinsCollected: [
        { id: "c1", value: 10, positionPercent: 20 },
        { id: "c2", value: 15, positionPercent: 40 },
      ],
    });
    expect(reward.coinReward).toBe(25); // (10 + 15) * 1
  });

  it("total is the sum of all component rewards", () => {
    const reward = calculateRunReward(baseResult);
    const sum =
      reward.distanceReward +
      reward.duelDamageReward +
      reward.enemyKillReward +
      reward.bossReward +
      reward.coinReward;
    expect(reward.total).toBe(sum);
  });

  it("returns all zeros for a zero-distance run with no kills or coins", () => {
    const reward = calculateRunReward({
      ...baseResult,
      distancePercent: 0,
      enemiesDefeated: 0,
      duelDamageDealt: 0,
      bossDefeated: false,
      coinsCollected: [],
    });
    expect(reward.total).toBe(0);
  });
});

// ── getUpgradeCost ────────────────────────────────────────────────────────────

describe("getUpgradeCost", () => {
  it("returns cost[0] when upgrading from level 1 to 2", () => {
    expect(getUpgradeCost("maxHealth", 1, sampleCategories)).toBe(18);
  });

  it("returns cost[4] when upgrading from level 5 to 6", () => {
    expect(getUpgradeCost("maxHealth", 5, sampleCategories)).toBe(450);
  });

  it("returns Infinity when already at max level 6", () => {
    expect(getUpgradeCost("maxHealth", 6, sampleCategories)).toBe(Infinity);
  });

  it("returns Infinity for an unknown category ID", () => {
    expect(getUpgradeCost("unknown", 1, sampleCategories)).toBe(Infinity);
  });
});

// ── canAffordUpgrade ──────────────────────────────────────────────────────────

describe("canAffordUpgrade", () => {
  it("returns true when currency equals cost", () => {
    expect(canAffordUpgrade(18, 18)).toBe(true);
  });

  it("returns true when currency exceeds cost", () => {
    expect(canAffordUpgrade(100, 18)).toBe(true);
  });

  it("returns false when currency is less than cost", () => {
    expect(canAffordUpgrade(17, 18)).toBe(false);
  });

  it("returns false for any finite cost when currency is 0", () => {
    expect(canAffordUpgrade(0, 1)).toBe(false);
  });
});

// ── applyUpgradePurchase ──────────────────────────────────────────────────────

describe("applyUpgradePurchase", () => {
  it("increments the upgrade level and deducts the cost", () => {
    const { upgrades, currency } = applyUpgradePurchase({}, "maxHealth", 100, sampleCategories);
    expect(upgrades["maxHealth"]).toBe(2);
    expect(currency).toBe(82); // 100 - 18
  });

  it("leaves state unchanged when insufficient currency", () => {
    const { upgrades, currency } = applyUpgradePurchase({}, "maxHealth", 10, sampleCategories);
    expect(upgrades["maxHealth"]).toBeUndefined();
    expect(currency).toBe(10);
  });

  it("leaves state unchanged when already at max level", () => {
    const grid = { maxHealth: 6 as const };
    const { upgrades, currency } = applyUpgradePurchase(grid, "maxHealth", 9999, sampleCategories);
    expect(upgrades["maxHealth"]).toBe(6);
    expect(currency).toBe(9999);
  });

  it("upgrades from level 2 to 3 using the correct cost", () => {
    const grid = { armor: 2 as const };
    const { upgrades, currency } = applyUpgradePurchase(grid, "armor", 200, sampleCategories);
    expect(upgrades["armor"]).toBe(3);
    expect(currency).toBe(160); // 200 - 40
  });
});
