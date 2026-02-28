import { ChapterId } from "@core/types/chapter";

// ── Global balance constants ───────────────────────────────────────────────────
//
// All numeric balance levers live here. Tuning the game's economy should be
// done by editing this file — never scatter magic numbers in system code.

/** Maximum run duration in milliseconds (90 seconds). */
export const MAX_RUN_DURATION_MS = 90_000;

/**
 * Currency multipliers applied to all rewards earned in each chapter.
 * Higher chapters pay out proportionally more to reward progression risk.
 */
export const CHAPTER_MULTIPLIERS = {
  [ChapterId.Tutorial]: 0,
  [ChapterId.Chapter1]: 1,
  [ChapterId.Chapter2]: 2.5,
  [ChapterId.Chapter3]: 5,
} as const satisfies Record<ChapterId, number>;

// ── Reward rates ─────────────────────────────────────────────────────────────

/** Currency awarded per percentage point of traversal distance covered. */
export const DISTANCE_REWARD_PER_PERCENT = 1;

/** Currency awarded per point of damage dealt to enemies during duel encounters. */
export const DUEL_DAMAGE_REWARD_PER_POINT = 1;

/** Currency awarded per enemy defeated in a duel. */
export const ENEMY_KILL_REWARD = 50;

/** Currency awarded for defeating the chapter boss. */
export const BOSS_DEFEAT_REWARD = 200;

// ── Combat constants ─────────────────────────────────────────────────────────

/**
 * Fraction of max HP restored after each duel encounter.
 * Set to 0 to disable post-duel healing (current balance decision).
 * The health system accepts this as a parameter — change here to experiment.
 */
export const POST_DUEL_HEAL_PERCENT = 0;

/** Timing window in milliseconds that counts as a "perfect block". */
export const PERFECT_BLOCK_WINDOW_MS = 200;

// ── Timer phases ─────────────────────────────────────────────────────────────

/** Remaining milliseconds at which the timer transitions to "warning" phase. */
export const TIMER_WARNING_THRESHOLD_MS = 30_000;

/** Remaining milliseconds at which the timer transitions to "critical" phase. */
export const TIMER_CRITICAL_THRESHOLD_MS = 15_000;

// ── Obstacles ────────────────────────────────────────────────────────────────

/**
 * How long the hero is locked in a "climbing" animation after hitting a
 * time-tax obstacle without jumping. Hero position does not advance during this window.
 */
export const TIME_TAX_CLIMB_DURATION_MS = 2_000;

/** HP damage dealt when the hero runs into a health-tax obstacle without jumping or ducking. */
export const HEALTH_TAX_DAMAGE = 20;
