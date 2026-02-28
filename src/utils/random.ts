// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────
//
// mulberry32 is a fast, high-quality 32-bit PRNG. Using a seeded PRNG ensures
// deterministic run generation — the same seed always produces the same level
// layout, making debug and tests reproducible.

/**
 * Creates a seeded pseudo-random number generator using the mulberry32 algorithm.
 * Returns a function that produces uniformly-distributed floats in [0, 1).
 */
export function createSeededRng(seed: number): () => number {
  // Force unsigned 32-bit integer to avoid sign issues with bitwise ops.
  let s = seed >>> 0;
  return function (): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles an array in-place using Fisher-Yates with a given PRNG.
 * Mutates the array and also returns it for convenience.
 */
export function shuffleArray<T>(array: T[], rng: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    // oxlint-disable-next-line typescript/no-non-null-assertion -- bounds guaranteed by loop
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}
