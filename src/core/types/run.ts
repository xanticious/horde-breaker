import type { HeroId } from "./hero";

export type RunPhase = "traversal" | "duel" | "boss";

export interface RunResult {
  heroId: HeroId;
  chapter: number;
  currencyEarned: number;
  distanceReached: number;
  enemiesDefeated: number;
  completed: boolean;
}
