import type { DuelState } from "@core/types/combat";
import type { IEnemyBehavior, EnemyAction } from "./enemyBase";

// ── Wolf behavior constants ────────────────────────────────────────────────────────

/** Maximum distance (px) at which the wolf decides to pounce. */
const WOLF_POUNCE_RANGE = 300;

/**
 * Wind-up duration for a pounce (ms).
 * This is the reaction window for the player to block.
 */
const WOLF_POUNCE_WINDUP_MS = 800;

/** Recovery after a pounce — wolf is locked out of acting again. */
const WOLF_POUNCE_RECOVERY_MS = 600;

/** Recovery after a retreat — shorter since it is non-aggressive. */
const WOLF_RETREAT_RECOVERY_MS = 400;

/**
 * Chance (0–1) the wolf retreats instead of pouncing when in range.
 * Retreat mixes up the predictable pounce–wait pattern.
 */
const WOLF_RETREAT_CHANCE = 0.2;

// ── Wolf AI strategy ──────────────────────────────────────────────────────────

/**
 * Wolf AI: waits until the hero is in pounce range, then lunges.
 * Occasionally retreats to vary the rhythm and prevent pure rote blocking.
 */
export const wolfBehavior: IEnemyBehavior = {
  decideAction(state: DuelState, rng: () => number): EnemyAction {
    const dist = Math.abs(state.heroX - state.enemyX);

    if (dist <= WOLF_POUNCE_RANGE) {
      // Small chance to retreat instead of pouncing — keeps the player guessing.
      if (rng() < WOLF_RETREAT_CHANCE) {
        return { type: "retreat" };
      }
      return { type: "pounce" };
    }

    // Hero is too far away — wait and re-evaluate next decision cycle.
    return { type: "wait" };
  },

  getWindUpDuration(action: EnemyAction): number {
    switch (action.type) {
      case "pounce":
        return WOLF_POUNCE_WINDUP_MS;
      case "retreat":
        return 0;
      case "wait":
        return 0;
    }
  },

  getRecoveryDuration(action: EnemyAction): number {
    switch (action.type) {
      case "pounce":
        return WOLF_POUNCE_RECOVERY_MS;
      case "retreat":
        return WOLF_RETREAT_RECOVERY_MS;
      case "wait":
        return 0;
    }
  },
};
