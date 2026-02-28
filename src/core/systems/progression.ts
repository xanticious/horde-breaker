import type { DerivedHeroStats, HeroDefinition } from "@core/types/hero";
import type { UpgradeGrid, UpgradeLevel } from "@core/types/upgrade";
import { DEFAULT_SPECIAL_DURATION_MS } from "@utils/constants";

/**
 * Derives the effective hero stats for a run by applying all purchased upgrades
 * to the hero's base stats. Pure function — call at run start, then use the
 * result throughout the entire run.
 *
 * Upgrade categories map to stats by ID:
 * - "maxHealth"       → maxHp  (absolute value at upgrade level)
 * - "armor"           → armor  (absolute fraction of damage negated, e.g. 0.12)
 * - "runSpeed"        → runSpeed (absolute px/s at upgrade level)
 * - "damageMultiplier"→ damageMultiplier (absolute multiplier at upgrade level)
 * - "attackSpeed"     → attackSpeed (absolute multiplier; lower = faster)
 * - "special"         → specialAbility.damage bonus (additive on top of baseDamage)
 */
export function deriveHeroStats(
  heroDefinition: HeroDefinition,
  upgrades: UpgradeGrid,
): DerivedHeroStats {
  const cats = heroDefinition.upgradeCategories;
  const base = heroDefinition.baseStats;

  /**
   * Looks up the effectPerLevel value for a category at the current upgrade level.
   * Falls back to `fallback` when the category is not found (allows heroes with
   * fewer than 6 categories without breaking the system).
   */
  const getEffect = (categoryId: string, fallback: number): number => {
    const cat = cats.find((c) => c.id === categoryId);
    if (!cat) return fallback;
    const level = (upgrades[categoryId] ?? 1) as UpgradeLevel;
    // effectPerLevel is 0-indexed; level 1 → index 0.
    return cat.effectPerLevel[level - 1] ?? fallback;
  };

  const specialAbility = heroDefinition.abilities.special;
  const specialBonus = getEffect("special", 0);

  return {
    maxHp: getEffect("maxHealth", base.maxHp),
    armor: getEffect("armor", base.armor),
    runSpeed: getEffect("runSpeed", base.runSpeed),
    damageMultiplier: getEffect("damageMultiplier", base.damageMultiplier),
    attackSpeed: getEffect("attackSpeed", base.attackSpeed),
    specialAbility: {
      damage: specialAbility.baseDamage + specialBonus,
      cooldownMs: specialAbility.cooldownMs,
      // Sprint 10 will wire per-hero animation durations. This default satisfies
      // the type constraint in the meantime.
      durationMs: DEFAULT_SPECIAL_DURATION_MS,
    },
  };
}
