import type { DuelState } from "@core/types/combat";

// ── Enemy action types ────────────────────────────────────────────────────────

/**
 * The set of actions an enemy AI can decide to take during a duel.
 * Terminal `wait` means "do nothing this tick".
 */
export type EnemyAction = { type: "wait" } | { type: "pounce" } | { type: "retreat" };

// ── Strategy interface ────────────────────────────────────────────────────────

/**
 * Strategy pattern for enemy AI. Each enemy type implements this interface.
 * All methods are pure — state mutations happen in the DuelMachine via assign.
 *
 * Using an interface (prefixed I) because we'll swap implementations per enemy
 * type at runtime — a classic swappable-contract use case.
 */
export interface IEnemyBehavior {
  /**
   * Decide the enemy's next action given the current duel snapshot.
   * Called periodically when the enemy is idle and not stunned.
   */
  decideAction(state: DuelState, rng: () => number): EnemyAction;

  /**
   * How long the wind-up animation lasts before the attack damage resolves.
   * During this window the hero can block to reduce or negate damage.
   */
  getWindUpDuration(action: EnemyAction): number;

  /**
   * How long the enemy is locked into recovery after an action resolves.
   * The hero cannot be interrupted during this window.
   */
  getRecoveryDuration(action: EnemyAction): number;
}
