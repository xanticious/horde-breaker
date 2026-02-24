// ── Upgrade domain types ─────────────────────────────────────────────────────

/**
 * The possible upgrade level values (1 = base, 6 = fully upgraded).
 * Level 1 means "no upgrade purchased" — it is the baseline stat.
 */
export type UpgradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A hero's current upgrade state: maps each upgrade category ID to its
 * current level. Missing keys default to level 1 (base).
 */
export type UpgradeGrid = Record<string, UpgradeLevel>;

/**
 * Static data for a single upgrade category row in the upgrade grid.
 *
 * - `costs` has 5 entries: cost to upgrade level 1→2, 2→3, 3→4, 4→5, 5→6.
 * - `effectPerLevel` has 6 entries: the stat effect at each level (index 0 = level 1 baseline).
 */
export interface UpgradeCategoryData {
  /** Unique string ID used as the key in UpgradeGrid and save data. */
  id: string;
  name: string;
  /** Five upgrade costs, one per step from level 1→2 through 5→6. */
  costs: readonly number[];
  /** Six effect values, one per level. Index 0 = level 1 (base state). */
  effectPerLevel: readonly number[];
}
