import type { HeroId } from "./hero";

export const SAVE_DATA_VERSION = 1;

export interface HeroSaveData {
  heroId: HeroId;
  currency: number;
  upgradeLevels: Record<string, number>;
  prestigeTokens: number;
}

export interface SaveData {
  version: number;
  selectedHeroId: HeroId | null;
  heroes: Partial<Record<HeroId, HeroSaveData>>;
}

export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_DATA_VERSION,
    selectedHeroId: null,
    heroes: {},
  };
}
