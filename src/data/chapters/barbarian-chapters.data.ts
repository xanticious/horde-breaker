import { ChapterId, type ChapterDefinition } from "@core/types/chapter";
import { EnemyId } from "@core/types/enemy";

// ── Barbarian chapter definitions ─────────────────────────────────────────────
//
// Chapter multipliers determine how much currency a run through that chapter
// is worth. Higher multipliers reward players for pushing into harder content.

export const BARBARIAN_CHAPTERS = {
  [ChapterId.Chapter1]: {
    id: ChapterId.Chapter1,
    name: "The Highlands",
    setting: "Rolling highland hills — the Barbarian's home territory.",
    enemyRoster: [EnemyId.Wolf, EnemyId.Swordsman, EnemyId.Shieldbearer],
    boss: EnemyId.Swordsman,
    segmentCount: 4,
    // Base multiplier — all rewards at face value
    chapterMultiplier: 1,
  },

  [ChapterId.Chapter2]: {
    id: ChapterId.Chapter2,
    name: "The Fortified Passes",
    setting: "Mountain passes defended by trained highland soldiers.",
    enemyRoster: [EnemyId.Swordsman, EnemyId.HighlandArcher, EnemyId.Pikeman],
    boss: EnemyId.Pikeman,
    segmentCount: 5,
    // 2.5× multiplier for harder chapter
    chapterMultiplier: 2.5,
  },

  [ChapterId.Chapter3]: {
    id: ChapterId.Chapter3,
    name: "The War Keep",
    setting: "The enemy warlord's fortress — the final siege.",
    enemyRoster: [EnemyId.Berserker, EnemyId.WarHoundHandler, EnemyId.Shieldbearer],
    boss: EnemyId.Berserker,
    segmentCount: 6,
    // 5× multiplier for the final chapter
    chapterMultiplier: 5,
  },
} as const satisfies Record<
  ChapterId.Chapter1 | ChapterId.Chapter2 | ChapterId.Chapter3,
  ChapterDefinition
>;
