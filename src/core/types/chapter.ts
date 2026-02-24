import type { EnemyId } from "./enemy";

// ── Chapter domain types ──────────────────────────────────────────────────────

export enum ChapterId {
  /** Tutorial — Chapter 0 (post-MVP, not yet implemented). */
  Tutorial = 0,
  Chapter1 = 1,
  Chapter2 = 2,
  Chapter3 = 3,
}

/** Static definition of a chapter — lives in data files, never mutated. */
export interface ChapterDefinition {
  id: ChapterId;
  name: string;
  /** Flavour setting description shown on the chapter select screen. */
  setting: string;
  /** Pool of enemy IDs that can appear in non-boss encounters. */
  enemyRoster: EnemyId[];
  /** The enemy that appears as the final boss of this chapter. */
  boss: EnemyId;
  /** Number of traversal segments between the chapter start and the boss. */
  segmentCount: number;
  /** Multiplier applied to all currency rewards earned in this chapter. */
  chapterMultiplier: number;
}
