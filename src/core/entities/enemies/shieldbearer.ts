import type { DuelState } from "@core/types/combat";
import type { IEnemyBehavior, EnemyAction } from "./enemyBase";

// ── Shieldbearer behavior constants ──────────────────────────────────────────

/**
 * Range within which the shieldbearer can launch a shield bash.
 * Shorter reach than the swordsman — the player must commit to close distance.
 */
const SHIELDBEARER_BASH_RANGE = 160;

/**
 * Wind-up for the shield bash — medium duration, telegraphed by the shield
 * being raised visibly before impact.
 */
const SHIELDBEARER_BASH_WINDUP_MS = 700;

/**
 * Recovery after the bash — this is the player's opening.
 * The shield is considered DOWN during recovery, so hero attacks deal full
 * damage instead of being reduced by the base armor reduction.
 * Longer than the bash wind-up to make the opening meaningful.
 */
const SHIELDBEARER_BASH_RECOVERY_MS = 900;

/** Recovery after a retreat. */
const SHIELDBEARER_RETREAT_RECOVERY_MS = 450;

/**
 * Probability (0–1) the shieldbearer bashes rather than retreating when
 * in range. A value < 1.0 means the shieldbearer sometimes retreats, which
 * prevents the player from perfectly predicting every bash cycle.
 */
const SHIELDBEARER_BASH_CHANCE = 0.7;

// ── Shieldbearer AI strategy ──────────────────────────────────────────────────

/**
 * Shieldbearer AI: defensive wall that occasionally bashes.
 *
 * The shieldbearer's shield provides passive damage reduction to hero attacks
 * (modelled via `baseArmorReduction` in DuelEnemyState — set to 0.55 for this
 * enemy type). During the recovery phase after a bash, the shield drops and
 * the player can deal full damage.
 *
 * Engagement logic:
 * - Hero inside BASH_RANGE  → bash (BASH_CHANCE) or retreat otherwise
 * - Hero outside BASH_RANGE → wait for hero to close in
 *
 * The `shieldBash` action signals the DuelMachine to temporarily zero the
 * enemy's `currentArmorReduction` during recovery, giving the player a clear
 * punish window after each bash.
 */
export const shieldbearerBehavior: IEnemyBehavior = {
  decideAction(state: DuelState, rng: () => number): EnemyAction {
    const dist = Math.abs(state.heroX - state.enemyX);

    if (dist <= SHIELDBEARER_BASH_RANGE) {
      // In range — bash or briefly retreat to vary rhythm.
      return rng() < SHIELDBEARER_BASH_CHANCE ? { type: "shieldBash" } : { type: "retreat" };
    }

    // Hero too far — stand and wait with shield raised.
    return { type: "wait" };
  },

  getWindUpDuration(action: EnemyAction): number {
    switch (action.type) {
      case "shieldBash":
        return SHIELDBEARER_BASH_WINDUP_MS;
      case "retreat":
      case "wait":
        return 0;
      default:
        return 0;
    }
  },

  getRecoveryDuration(action: EnemyAction): number {
    switch (action.type) {
      case "shieldBash":
        return SHIELDBEARER_BASH_RECOVERY_MS;
      case "retreat":
        return SHIELDBEARER_RETREAT_RECOVERY_MS;
      case "wait":
        return 0;
      default:
        return 0;
    }
  },
};

/**
 * Base armor reduction applied to hero attacks while the shieldbearer's
 * shield is up (i.e. any time except during post-bash recovery).
 * 0.55 = 55% of incoming hero damage is blocked by the shield.
 */
export const SHIELDBEARER_BASE_ARMOR = 0.55;
