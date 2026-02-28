import type { RunResult, RewardBreakdown } from "@core/types/run";
import type { UpgradeGrid, UpgradeLevel, UpgradeCategoryData } from "@core/types/upgrade";
import {
  CHAPTER_MULTIPLIERS,
  DISTANCE_REWARD_PER_PERCENT,
  DUEL_DAMAGE_REWARD_PER_POINT,
  ENEMY_KILL_REWARD,
  BOSS_DEFEAT_REWARD,
} from "@data/balance.data";

// ── Reward calculation ────────────────────────────────────────────────────────

/**
 * Computes the full currency reward breakdown for a completed run.
 * All sub-rewards are scaled by the chapter multiplier before summing.
 */
export function calculateRunReward(result: RunResult): RewardBreakdown {
  const multiplier = CHAPTER_MULTIPLIERS[result.chapter];

  const distanceReward = Math.floor(
    Math.floor(result.distancePercent) * DISTANCE_REWARD_PER_PERCENT * multiplier,
  );
  const duelDamageReward = Math.floor(
    result.duelDamageDealt * DUEL_DAMAGE_REWARD_PER_POINT * multiplier,
  );
  const enemyKillReward = Math.floor(result.enemiesDefeated * ENEMY_KILL_REWARD * multiplier);
  const bossReward = result.bossDefeated ? Math.floor(BOSS_DEFEAT_REWARD * multiplier) : 0;
  const coinReward = Math.floor(
    result.coinsCollected.reduce((sum, c) => sum + c.value, 0) * multiplier,
  );
  const total = distanceReward + duelDamageReward + enemyKillReward + bossReward + coinReward;

  return { distanceReward, duelDamageReward, enemyKillReward, bossReward, coinReward, total };
}

// ── Upgrade cost queries ──────────────────────────────────────────────────────

/**
 * Returns the currency cost to upgrade `categoryId` from `currentLevel` to
 * `currentLevel + 1`. Returns `Infinity` if already at the maximum level (6)
 * or the category is not found.
 */
export function getUpgradeCost(
  categoryId: string,
  currentLevel: UpgradeLevel,
  upgradeCategories: UpgradeCategoryData[],
): number {
  if (currentLevel >= 6) return Infinity;

  const category = upgradeCategories.find((c) => c.id === categoryId);
  if (!category) return Infinity;

  // Level 1→2 uses costs[0], 2→3 uses costs[1], ..., 5→6 uses costs[4].
  return category.costs[currentLevel - 1] ?? Infinity;
}

/**
 * Returns true when the player has enough currency to cover the given cost.
 */
export function canAffordUpgrade(currency: number, cost: number): boolean {
  return currency >= cost;
}

/**
 * Applies an upgrade purchase, returning the updated upgrade grid and remaining
 * currency. If the purchase is not valid (insufficient funds or already maxed),
 * the inputs are returned unchanged.
 */
export function applyUpgradePurchase(
  upgrades: UpgradeGrid,
  categoryId: string,
  currency: number,
  upgradeCategories: UpgradeCategoryData[],
): { upgrades: UpgradeGrid; currency: number } {
  const currentLevel = (upgrades[categoryId] ?? 1) as UpgradeLevel;
  const cost = getUpgradeCost(categoryId, currentLevel, upgradeCategories);

  if (!canAffordUpgrade(currency, cost) || currentLevel >= 6) {
    return { upgrades, currency };
  }

  const newLevel = (currentLevel + 1) as UpgradeLevel;
  return {
    upgrades: { ...upgrades, [categoryId]: newLevel },
    currency: currency - cost,
  };
}
