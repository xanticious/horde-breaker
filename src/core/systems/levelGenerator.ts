import type { ChapterDefinition } from "@core/types/chapter";
import type { EnemyEncounter } from "@core/types/enemy";
import { createSeededRng, shuffleArray } from "@utils/random";

// ── Layout constants ──────────────────────────────────────────────────────────

/**
 * Minimum gap (in percentage points) between consecutive encounter positions.
 * Guarantees the player always has traversal time between fights.
 */
const MIN_ENCOUNTER_SPACING = 15;

/** Position (percent) of the boss — always placed at the very end of the chapter. */
const BOSS_POSITION_PERCENT = 95;

// ── Level generation ──────────────────────────────────────────────────────────

/**
 * Generates a deterministic list of enemy encounters for a run in the given
 * chapter. Enemy order from the roster is slightly shuffled each run via the
 * seeded PRNG, giving variety without sacrificing reproducibility.
 *
 * The boss is always placed last (at 95% distance). Regular encounters are
 * spaced using MIN_ENCOUNTER_SPACING to ensure the player always has breathing
 * room between fights.
 */
export function generateLevel(chapter: ChapterDefinition, seed: number): EnemyEncounter[] {
  const rng = createSeededRng(seed);

  // Segment count represents the number of non-boss encounters.
  const encounterCount = chapter.segmentCount;

  // Build an evenly-spaced set of encounter positions from ~10% to ~80%, then
  // jitter each one slightly using the PRNG.
  const baseSpacing = (BOSS_POSITION_PERCENT - 10) / (encounterCount + 1);
  const positions: number[] = Array.from({ length: encounterCount }, (_, i) => {
    const base = 10 + baseSpacing * (i + 1);
    // Small random jitter (±5 percentage points) so encounters don't feel grid-like.
    const jitter = (rng() - 0.5) * 10;
    return Math.round(
      Math.max(10, Math.min(BOSS_POSITION_PERCENT - MIN_ENCOUNTER_SPACING, base + jitter)),
    );
  });

  // Enforce minimum spacing between positions in sorted order.
  positions.sort((a, b) => a - b);
  for (let i = 1; i < positions.length; i++) {
    if (positions[i]! - positions[i - 1]! < MIN_ENCOUNTER_SPACING) {
      positions[i] = positions[i - 1]! + MIN_ENCOUNTER_SPACING;
    }
  }

  // Shuffle a copy of the enemy roster (excluding boss) for variety.
  const roster = shuffleArray([...chapter.enemyRoster], rng);

  // Build regular encounters round-robin from the shuffled roster.
  const encounters: EnemyEncounter[] = positions.map((positionPercent, i) => ({
    enemyId: roster[i % roster.length]!,
    positionPercent,
    isBoss: false,
  }));

  // Always append the boss at BOSS_POSITION_PERCENT.
  encounters.push({
    enemyId: chapter.boss,
    positionPercent: BOSS_POSITION_PERCENT,
    isBoss: true,
  });

  return encounters;
}
