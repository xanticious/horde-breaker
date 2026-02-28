// ── Health system ─────────────────────────────────────────────────────────────
//
// Pure functions for HP pool management. All callers are responsible for
// providing current HP; this module never stores state.

/**
 * Applies damage to an entity, returning the new HP clamped to [0, maxHp].
 * Negative damage is treated as zero (no accidental healing via this path).
 */
export function applyDamage(currentHp: number, damage: number, maxHp: number): number {
  return Math.min(maxHp, Math.max(0, currentHp - Math.max(0, damage)));
}

/**
 * Returns true when the entity has HP remaining.
 */
export function isAlive(currentHp: number): boolean {
  return currentHp > 0;
}

/**
 * Restores a fraction of max HP after a duel encounter ends.
 * healPercent is expected in [0, 1]. Returns new HP clamped to maxHp.
 */
export function applyPostDuelHeal(currentHp: number, maxHp: number, healPercent: number): number {
  const healed = currentHp + Math.round(maxHp * healPercent);
  return Math.min(maxHp, healed);
}
