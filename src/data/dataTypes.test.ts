import { describe, it, expect } from "vitest";
import { BARBARIAN_HERO } from "./heroes/barbarian.data";
import { BARBARIAN_ENEMIES } from "./enemies/barbarian-enemies.data";
import { BARBARIAN_CHAPTERS } from "./chapters/barbarian-chapters.data";
import {
  CHAPTER_MULTIPLIERS,
  MAX_RUN_DURATION_MS,
  DISTANCE_REWARD_PER_PERCENT,
  ENEMY_KILL_REWARD,
  BOSS_DEFEAT_REWARD,
  POST_DUEL_HEAL_PERCENT,
} from "./balance.data";
import { DEATH_MESSAGES, VICTORY_LINES, BOSS_DIALOGUE } from "./lore.data";
import { EnemyId } from "@core/types/enemy";
import { ChapterId } from "@core/types/chapter";

// ── Type-level smoke tests ────────────────────────────────────────────────────
//
// These tests verify that all data files satisfy their declared types at
// compile time. If these tests compile, the data shapes are correct.

describe("barbarian.data", () => {
  it("satisfies HeroDefinition type", () => {
    // The `as const satisfies HeroDefinition` at the call site verifies this at
    // compile time. This runtime assertion confirms the data object is defined.
    expect(BARBARIAN_HERO).toBeDefined();
    expect(BARBARIAN_HERO.id).toBe("barbarian");
  });

  it("has 6 upgrade categories", () => {
    expect(BARBARIAN_HERO.upgradeCategories).toHaveLength(6);
  });

  it("each upgrade category has 5 costs and 6 effect levels", () => {
    for (const category of BARBARIAN_HERO.upgradeCategories) {
      expect(category.costs).toHaveLength(5);
      expect(category.effectPerLevel).toHaveLength(6);
    }
  });

  it("has all three abilities defined", () => {
    expect(BARBARIAN_HERO.abilities.primary).toBeDefined();
    expect(BARBARIAN_HERO.abilities.defensive).toBeDefined();
    expect(BARBARIAN_HERO.abilities.special).toBeDefined();
  });
});

describe("barbarian-enemies.data", () => {
  it("satisfies Record<EnemyId, EnemyDefinition> type", () => {
    // `as const satisfies` enforces this at compile time; confirm data is defined.
    expect(BARBARIAN_ENEMIES).toBeDefined();
  });

  it("has all 7 enemy types defined", () => {
    const ids = Object.values(EnemyId);
    for (const id of ids) {
      expect(BARBARIAN_ENEMIES[id]).toBeDefined();
    }
  });

  it("each enemy has positive baseHp and baseDamage", () => {
    for (const enemy of Object.values(BARBARIAN_ENEMIES)) {
      expect(enemy.baseHp).toBeGreaterThan(0);
      expect(enemy.baseDamage).toBeGreaterThan(0);
    }
  });
});

describe("barbarian-chapters.data", () => {
  it("satisfies ChapterDefinition shape", () => {
    // `as const satisfies` enforces this at compile time; confirm data is defined.
    expect(BARBARIAN_CHAPTERS).toBeDefined();
  });

  it("has the three playable chapters", () => {
    expect(BARBARIAN_CHAPTERS[ChapterId.Chapter1]).toBeDefined();
    expect(BARBARIAN_CHAPTERS[ChapterId.Chapter2]).toBeDefined();
    expect(BARBARIAN_CHAPTERS[ChapterId.Chapter3]).toBeDefined();
  });

  it("chapter multipliers increase per chapter", () => {
    expect(BARBARIAN_CHAPTERS[ChapterId.Chapter1].chapterMultiplier).toBeLessThan(
      BARBARIAN_CHAPTERS[ChapterId.Chapter2].chapterMultiplier,
    );
    expect(BARBARIAN_CHAPTERS[ChapterId.Chapter2].chapterMultiplier).toBeLessThan(
      BARBARIAN_CHAPTERS[ChapterId.Chapter3].chapterMultiplier,
    );
  });
});

describe("balance.data", () => {
  it("MAX_RUN_DURATION_MS is 90 seconds", () => {
    expect(MAX_RUN_DURATION_MS).toBe(90_000);
  });

  it("CHAPTER_MULTIPLIERS has entries for all ChapterIds", () => {
    const ids = Object.values(ChapterId).filter((v) => typeof v === "number") as ChapterId[];
    for (const id of ids) {
      expect(CHAPTER_MULTIPLIERS[id]).toBeDefined();
    }
  });

  it("DISTANCE_REWARD_PER_PERCENT is a positive number", () => {
    expect(DISTANCE_REWARD_PER_PERCENT).toBeGreaterThan(0);
  });

  it("ENEMY_KILL_REWARD is a positive number", () => {
    expect(ENEMY_KILL_REWARD).toBeGreaterThan(0);
  });

  it("BOSS_DEFEAT_REWARD is greater than ENEMY_KILL_REWARD", () => {
    expect(BOSS_DEFEAT_REWARD).toBeGreaterThan(ENEMY_KILL_REWARD);
  });

  it("POST_DUEL_HEAL_PERCENT is between 0 and 1", () => {
    expect(POST_DUEL_HEAL_PERCENT).toBeGreaterThanOrEqual(0);
    expect(POST_DUEL_HEAL_PERCENT).toBeLessThanOrEqual(1);
  });
});

describe("lore.data", () => {
  it("has death messages for all 7 enemy types", () => {
    for (const id of Object.values(EnemyId)) {
      expect(DEATH_MESSAGES[id]).toBeDefined();
      expect(DEATH_MESSAGES[id].length).toBeGreaterThan(0);
    }
  });

  it("has at least one victory line", () => {
    expect(VICTORY_LINES.length).toBeGreaterThan(0);
  });

  it("has boss dialogue for all enemy types", () => {
    for (const id of Object.values(EnemyId)) {
      expect(BOSS_DIALOGUE[id]).toBeDefined();
      expect(typeof BOSS_DIALOGUE[id]).toBe("string");
    }
  });
});
