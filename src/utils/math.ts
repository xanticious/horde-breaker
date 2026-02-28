/** Clamps a value between a minimum and maximum. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Linearly interpolates between `a` and `b` by factor `t` (0 = a, 1 = b). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Returns a random number in [min, max) using the supplied PRNG function.
 * Accepts a PRNG parameter rather than using Math.random so callers can use a
 * seeded generator and remain deterministic.
 */
export function randomRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}
