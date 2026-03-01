import type { DuelState } from "@core/types/combat";
import type { IEnemyBehavior, EnemyAction } from "./enemyBase";

// ── Swordsman behavior constants ──────────────────────────────────────────────

/**
 * Preferred engagement distance: hero must be within this range for the
 * swordsman to slash. Longer than the wolf's pounce range — the swordsman
 * punishes players who walk in without a plan.
 */
const SWORDSMAN_SLASH_RANGE = 200;

/**
 * "Too close" threshold: if the hero is inside this distance the swordsman
 * retreats to its preferred range before attacking. This creates a bait-able
 * pattern — walk in to provoke, dodge back, then counter.
 */
const SWORDSMAN_CLOSE_RANGE = 70;

/** Wind-up for the slash — shorter than the wolf pounce so it's harder to react. */
const SWORDSMAN_SLASH_WINDUP_MS = 600;

/** Recovery after a slash — the vulnerability window for the player to counter. */
const SWORDSMAN_SLASH_RECOVERY_MS = 700;

/** Recovery after a controlled retreat. */
const SWORDSMAN_RETREAT_RECOVERY_MS = 350;

/**
 * Probability (0–1) the swordsman slashes rather than waiting on any given
 * idle cycle when the hero is in range. Keeps the encounter from being a pure
 * burst — the swordsman sometimes pauses, making its attacks harder to predict.
 */
const SWORDSMAN_SLASH_CHANCE = 0.65;

// ── Swordsman AI strategy ─────────────────────────────────────────────────────

/**
 * Swordsman AI: long-range timing attacks that punish forward movement.
 *
 * Engagement logic:
 * - Hero inside CLOSE_RANGE   → retreat to buy space
 * - Hero inside SLASH_RANGE   → slash with SLASH_CHANCE probability, otherwise wait
 * - Hero outside SLASH_RANGE  → wait for hero to approach
 *
 * The recovery window after a slash is longer than the wind-up, giving an
 * attentive player a clear counter-attack opportunity. The probabilistic
 * slash decision prevents pure rhythm-based exploitation of the pattern.
 */
export const swordsmanBehavior: IEnemyBehavior = {
  decideAction(state: DuelState, rng: () => number): EnemyAction {
    const dist = Math.abs(state.heroX - state.enemyX);

    if (dist < SWORDSMAN_CLOSE_RANGE) {
      // Hero is too close — retreat to regain sword range.
      return { type: "retreat" };
    }

    if (dist <= SWORDSMAN_SLASH_RANGE) {
      // Hero is in striking range — slash with configured probability.
      return rng() < SWORDSMAN_SLASH_CHANCE ? { type: "slash" } : { type: "wait" };
    }

    // Hero is too far away — wait for them to approach.
    return { type: "wait" };
  },

  getWindUpDuration(action: EnemyAction): number {
    switch (action.type) {
      case "slash":
        return SWORDSMAN_SLASH_WINDUP_MS;
      case "retreat":
      case "wait":
        return 0;
      default:
        return 0;
    }
  },

  getRecoveryDuration(action: EnemyAction): number {
    switch (action.type) {
      case "slash":
        return SWORDSMAN_SLASH_RECOVERY_MS;
      case "retreat":
        return SWORDSMAN_RETREAT_RECOVERY_MS;
      case "wait":
        return 0;
      default:
        return 0;
    }
  },
};
