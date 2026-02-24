import type { HeroId } from "./hero";
import type { EnemyId } from "./enemy";

// ── Attack types ──────────────────────────────────────────────────────────────

export type AttackType =
  | "axeSwing"
  | "leapAttack"
  | "pounce"
  | "slash"
  | "shield"
  | "arrow"
  | "thrust"
  | "berserkSlash"
  | "houndCall";

// ── Damage calculation ────────────────────────────────────────────────────────

export interface DamageModifiers {
  baseDamage: number;
  /** Multiplier from upgrades or abilities (1 = no modifier). */
  damageMultiplier: number;
  /** Target's armour as the fraction of damage it negates (0–1). */
  armorReduction: number;
  /** Positional/stance multiplier — e.g. 1.5× for a jumping attack. */
  stanceMultiplier: number;
  criticalHit: boolean;
}

export interface AttackResult {
  damage: number;
  blocked: boolean;
  /** True when the player blocked within the perfect-timing window. */
  perfectBlock: boolean;
  /** Pixels to push the target back (0 = no knockback). */
  knockback: number;
  /** Duration in ms the target is stunned after this hit. */
  stunDuration: number;
}

// ── Duel state snapshot ───────────────────────────────────────────────────────

/**
 * Minimal state snapshot passed to enemy AI `decideAction()`.
 * Contains only what the AI needs — avoids leaking machine internals.
 */
export interface DuelState {
  heroX: number;
  enemyX: number;
  heroHp: number;
  maxHeroHp: number;
  enemyHp: number;
  maxEnemyHp: number;
  phase: "idle" | "heroActing" | "enemyActing" | "recovery";
}

// ── Damage event record ───────────────────────────────────────────────────────

/** Emitted by the duel machine after each resolved attack. */
export interface DamageEvent {
  attackerId: HeroId | EnemyId;
  targetId: HeroId | EnemyId;
  result: AttackResult;
  /** Milliseconds elapsed into the current run when this event occurred. */
  timestamp: number;
}
