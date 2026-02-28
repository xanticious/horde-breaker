import type { AttackResult, DamageModifiers, AttackType } from "@core/types/combat";
import {
  BLOCK_DAMAGE_REDUCTION,
  PERFECT_BLOCK_STUN_MS,
  PERFECT_BLOCK_KNOCKBACK_PX,
} from "@utils/constants";

// ── Constants ─────────────────────────────────────────────────────────────────

const CRITICAL_HIT_MULTIPLIER = 2;

/** Knockback distances in pixels at design resolution, keyed by attack type. */
const KNOCKBACK_BY_TYPE: Record<AttackType, number> = {
  axeSwing: 30,
  leapAttack: 80,
  pounce: 40,
  slash: 30,
  shield: 50,
  arrow: 10,
  thrust: 60,
  berserkSlash: 20,
  houndCall: 15,
};

// ── Pure combat functions ─────────────────────────────────────────────────────

/**
 * Calculates the net damage dealt by an attack after applying all modifiers.
 * Result is rounded to the nearest integer and clamped to a minimum of 0.
 */
export function calculateDamage(modifiers: DamageModifiers): number {
  const raw =
    modifiers.baseDamage *
    modifiers.damageMultiplier *
    modifiers.stanceMultiplier *
    (1 - modifiers.armorReduction);
  const withCrit = modifiers.criticalHit ? raw * CRITICAL_HIT_MULTIPLIER : raw;
  return Math.max(0, Math.round(withCrit));
}

/**
 * Resolves the result of an incoming attack meeting a block.
 * A perfect block (player reacted within the timing window) stuns the attacker
 * and negates all damage. A regular block reduces damage by BLOCK_DAMAGE_REDUCTION.
 *
 * @param incomingDamage  - Raw damage value before block reduction.
 * @param blockTimingMs   - How many ms elapsed between when the attack became
 *                          "blockable" and when the hero pressed block.
 * @param perfectBlockWindowMs - The reaction window for a perfect block.
 */
export function calculateBlockResult(
  incomingDamage: number,
  blockTimingMs: number,
  perfectBlockWindowMs: number,
): AttackResult {
  const isPerfect = blockTimingMs <= perfectBlockWindowMs;
  return {
    damage: isPerfect ? 0 : Math.round(incomingDamage * BLOCK_DAMAGE_REDUCTION),
    blocked: true,
    perfectBlock: isPerfect,
    knockback: isPerfect ? PERFECT_BLOCK_KNOCKBACK_PX : 0,
    stunDuration: isPerfect ? PERFECT_BLOCK_STUN_MS : 0,
  };
}

/**
 * Returns true when the attacker is within striking distance of the target.
 */
export function isInRange(attackerX: number, targetX: number, range: number): boolean {
  return Math.abs(targetX - attackerX) <= range;
}

/**
 * Returns the knockback distance in pixels for an attack.
 * Critical hits push the target 50% farther.
 */
export function calculateKnockback(attackType: AttackType, isCritical: boolean): number {
  const base = KNOCKBACK_BY_TYPE[attackType];
  return isCritical ? Math.round(base * 1.5) : base;
}
