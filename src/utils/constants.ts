// ── Game constants and magic numbers ─────────────────────────────────────────
//
// Physics constants, design-resolution values, and other game-wide magic
// numbers that don't belong in data files but need to be accessible across
// the codebase without hard-coding at call sites.

/** Design resolution width in pixels. All sprite and position data is authored at this width. */
export const DESIGN_WIDTH = 1920;

/** Design resolution height in pixels. */
export const DESIGN_HEIGHT = 1080;

/**
 * Default special-ability animation duration in milliseconds.
 * Used until the animation system provides per-hero durations (Sprint 10+).
 */
export const DEFAULT_SPECIAL_DURATION_MS = 600;

/**
 * Default primary-attack animation duration in milliseconds.
 * The hero is committed to this animation and cannot block or re-attack.
 * Replaced by per-animation data once the animation controller is wired.
 */
export const DEFAULT_ATTACK_DURATION_MS = 400;

/**
 * Normal block damage reduction factor (0–1).
 * A normal block retains this fraction of incoming damage.
 * A perfect block negates all damage (factor = 0).
 */
export const BLOCK_DAMAGE_REDUCTION = 0.2;

/**
 * Stun duration in milliseconds imposed on the attacker after a perfect block.
 * The enemy cannot act while stunned.
 */
export const PERFECT_BLOCK_STUN_MS = 500;

/**
 * Knockback distance in pixels at design resolution pushed onto the attacker
 * when the hero lands a perfect block.
 */
export const PERFECT_BLOCK_KNOCKBACK_PX = 30;

/** Target frame rate used for fixed-timestep calculations. */
export const TARGET_FPS = 60;
