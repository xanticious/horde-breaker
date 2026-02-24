import type { HeroId } from "./hero";
import type { ChapterId } from "./chapter";
import type { UpgradeGrid } from "./upgrade";

export const SAVE_DATA_VERSION = 1;

// ── Per-hero save state ──────────────────────────────────────────────────────────

export interface HeroSaveData {
  heroId: HeroId;
  currency: number;
  /** Current upgrade levels keyed by category ID. Missing = level 1 (base). */
  upgrades: UpgradeGrid;
  currentChapter: ChapterId;
  chaptersCompleted: ChapterId[];
  /** IDs of permanently-collected bonus coins (persisted across runs). */
  coinsCollected: string[];
  prestigeCount: number;
}

// ── Global save state ───────────────────────────────────────────────────────────

export interface SaveData {
  version: number;
  heroes: Partial<Record<HeroId, HeroSaveData>>;
  /** HeroIds the player has unlocked. Barbarian is always unlocked. */
  unlockedHeroes: HeroId[];
  /**
   * selectedHeroId is persisted so the game can restore the last-used hero
   * when the player returns.
   */
  selectedHeroId: HeroId | null;
  globalFlags: {
    tutorialCompleted: Partial<Record<HeroId, boolean>>;
    cinematicWatched: Partial<Record<HeroId, boolean>>;
  };
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  prestige: {
    tokens: number;
    perks: string[];
  };
}

export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_DATA_VERSION,
    heroes: {},
    unlockedHeroes: ["barbarian" as HeroId],
    selectedHeroId: null,
    globalFlags: {
      tutorialCompleted: {},
      cinematicWatched: {},
    },
    settings: {
      masterVolume: 1,
      musicVolume: 0.7,
      sfxVolume: 1,
    },
    prestige: {
      tokens: 0,
      perks: [],
    },
  };
}
