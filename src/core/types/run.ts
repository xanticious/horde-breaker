import type { HeroId } from "./hero";
import type { ChapterId } from "./chapter";
import type { EnemyId } from "./enemy";

// ── Run phases ───────────────────────────────────────────────────────────────

export type RunPhase = "traversal" | "duel" | "boss";

// ── Run entities ──────────────────────────────────────────────────────────────

/** A live enemy instance tracked during a duel — holds runtime state. */
export interface EnemyInstance {
  id: EnemyId;
  currentHp: number;
  maxHp: number;
  baseDamage: number;
  /** X coordinate in the duel arena at 1920×1080 resolution. */
  x: number;
}

/** A bonus coin available for collection during a traversal segment. */
export interface CoinInstance {
  /** Unique ID for tracking collection state. */
  id: string;
  /** Currency value awarded on collection. */
  value: number;
  /** 0–100: position along the chapter's traversal distance. */
  positionPercent: number;
}

// ── Run result and rewards ────────────────────────────────────────────────────

/** Summary of a completed or abandoned run — stored in the game machine context. */
export interface RunResult {
  heroId: HeroId;
  /** ChapterId is a numeric enum, so numeric literals (e.g. 1) are assignable. */
  chapter: ChapterId;
  currencyEarned: number;
  /** 0–100: how far through the chapter the hero travelled. */
  distancePercent: number;
  /** Kept for backward compatibility with legacy callers — mirrors distancePercent. */
  distanceReached: number;
  enemiesDefeated: number;
  /** Total damage dealt to enemies during duel encounters. */
  duelDamageDealt: number;
  bossDefeated: boolean;
  coinsCollected: CoinInstance[];
  completed: boolean;
}

/** Reward breakdown computed from a RunResult — used on the results screen. */
export interface RewardBreakdown {
  distanceReward: number;
  duelDamageReward: number;
  enemyKillReward: number;
  bossReward: number;
  coinReward: number;
  total: number;
}
