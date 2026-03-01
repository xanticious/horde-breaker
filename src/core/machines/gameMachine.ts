import { assign, setup } from "xstate";
import type { HeroId } from "@core/types/hero";
import { ChapterId } from "@core/types/chapter";
import type { RunResult } from "@core/types/run";
import type { DerivedHeroStats } from "@core/types/hero";
import type { EnemyEncounter } from "@core/types/enemy";
import type { ObstacleInstance } from "@core/entities/obstacles/obstacleBase";
import type { IEnemyBehavior } from "@core/entities/enemies/enemyBase";
import type { SaveData, HeroSaveData } from "@core/types/save";
import { createDefaultSaveData } from "@core/types/save";
import { runMachine } from "./runMachine";
import type { RunInput } from "./runMachine";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";
import { BARBARIAN_CHAPTERS } from "@data/chapters/barbarian-chapters.data";
import { wolfBehavior } from "@core/entities/enemies/wolf";
import { generateLevel } from "@core/systems/levelGenerator";
import { calculateRunReward } from "@core/systems/economy";
import { Logger } from "@debug/Logger";

// ─── Module Logger ───────────────────────────────────────────────────────────

const log = Logger.create("game");

// ─── Event Types ─────────────────────────────────────────────────────────────

export type GameEvent =
  | { type: "START_GAME" }
  | { type: "SELECT_HERO"; heroId: HeroId }
  /**
   * START_RUN now carries the full run configuration so the GameMachine can
   * pass it as input to the invoked RunMachine.
   */
  | {
      type: "START_RUN";
      chapter: ChapterId;
      heroStats: DerivedHeroStats;
      enemyLayout: EnemyEncounter[];
      obstaclesBySegment: ObstacleInstance[][];
      enemyBehaviorFactory: (enemyId: string) => IEnemyBehavior;
      rngSeed?: number;
    }
  /** Legacy event kept for backward compatibility with existing tests and UI. */
  | { type: "END_RUN"; result: RunResult }
  | { type: "CONTINUE" }
  | { type: "GO_TO_HERO_SELECT" };

// ─── Context ────────────────────────────────────────────────────────────────

export interface GameContext {
  selectedHeroId: HeroId | null;
  lastRunResult: RunResult | null;
  /** Parameters for the next/active run — set on START_RUN, cleared on run end. */
  pendingRunConfig: PendingRunConfig | null;
  /** Persisted player progression — currency, upgrades, chapter progress. */
  saveData: SaveData;
}

export interface PendingRunConfig {
  chapter: ChapterId;
  heroStats: DerivedHeroStats;
  enemyLayout: EnemyEncounter[];
  obstaclesBySegment: ObstacleInstance[][];
  enemyBehaviorFactory: (enemyId: string) => IEnemyBehavior;
  rngSeed?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns a new SaveData with `amount` currency added to the given hero's
 * balance. Creates the hero's save record if it doesn't exist yet.
 */
function addCurrencyToSave(save: SaveData, heroId: HeroId, amount: number): SaveData {
  const existing = save.heroes[heroId];
  const updated: HeroSaveData = existing
    ? { ...existing, currency: existing.currency + amount }
    : {
        heroId,
        currency: amount,
        upgrades: {},
        currentChapter: ChapterId.Chapter1,
        chaptersCompleted: [],
        coinsCollected: [],
        prestigeCount: 0,
      };
  return { ...save, heroes: { ...save.heroes, [heroId]: updated } };
}

// ─── Machine ─────────────────────────────────────────────────────────────────

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
  actors: {
    runMachine,
  },
}).createMachine({
  id: "game",
  initial: "titleScreen",
  context: {
    selectedHeroId: null,
    lastRunResult: null,
    pendingRunConfig: null,
    saveData: createDefaultSaveData(),
  },
  states: {
    titleScreen: {
      entry: () => log.debug("Entered titleScreen"),
      exit: () => log.debug("Exited titleScreen"),
      on: {
        START_GAME: { target: "heroSelect" },
      },
    },
    heroSelect: {
      entry: () => log.debug("Entered heroSelect"),
      exit: () => log.debug("Exited heroSelect"),
      on: {
        SELECT_HERO: {
          target: "upgrade",
          actions: assign({
            selectedHeroId: ({ event }) => event.heroId,
          }),
        },
      },
    },
    run: {
      entry: () => log.debug("Entered run"),
      exit: () => log.debug("Exited run"),
      invoke: {
        id: "runActor",
        src: "runMachine",
        /**
         * RunMachine input comes from the pendingRunConfig stored in context
         * by the START_RUN transition. When no config is present (e.g. in
         * legacy tests that send bare START_RUN) we supply empty-but-valid
         * defaults so the machine doesn't throw.
         */
        input: ({ context }): RunInput => {
          const cfg = context.pendingRunConfig;
          // When tests send bare { type: "START_RUN" } without the full config,
          // the assign produces { chapter: undefined, ... } which is truthy.
          // Check the chapter field explicitly to detect the legacy path.
          if (!cfg?.chapter) {
            // Legacy path — bare START_RUN from older tests / UI. Create a
            // minimal single-encounter run so the machine stays functional.
            return {
              heroId: BARBARIAN_HERO.id,
              chapter: ChapterId.Chapter1,
              heroStats: {
                maxHp: BARBARIAN_HERO.baseStats.maxHp,
                armor: BARBARIAN_HERO.baseStats.armor,
                runSpeed: BARBARIAN_HERO.baseStats.runSpeed,
                damageMultiplier: BARBARIAN_HERO.baseStats.damageMultiplier,
                attackSpeed: BARBARIAN_HERO.baseStats.attackSpeed,
                specialAbility: { damage: 0, cooldownMs: 0, durationMs: 0 },
              },
              enemyLayout: generateLevel(BARBARIAN_CHAPTERS[ChapterId.Chapter1], Date.now()),
              obstaclesBySegment: [],
              enemyBehaviorFactory: () => wolfBehavior,
            };
          }
          return {
            heroId: context.selectedHeroId!,
            chapter: cfg.chapter,
            heroStats: cfg.heroStats,
            enemyLayout: cfg.enemyLayout,
            obstaclesBySegment: cfg.obstaclesBySegment,
            enemyBehaviorFactory: cfg.enemyBehaviorFactory,
            rngSeed: cfg.rngSeed,
          };
        },
        onDone: {
          target: "results",
          actions: assign(({ context, event }) => {
            const rawResult = event.output as RunResult;
            const breakdown = calculateRunReward(rawResult);
            const resultWithReward: RunResult = {
              ...rawResult,
              currencyEarned: breakdown.total,
            };
            return {
              lastRunResult: resultWithReward,
              saveData: addCurrencyToSave(
                context.saveData,
                resultWithReward.heroId,
                breakdown.total,
              ),
            };
          }),
        },
      },
      // Legacy END_RUN event remains for tests that manually drive the machine.
      on: {
        END_RUN: {
          target: "results",
          actions: assign(({ context, event }) => {
            const rawResult = event.result;
            const breakdown = calculateRunReward(rawResult);
            const resultWithReward: RunResult = {
              ...rawResult,
              currencyEarned: breakdown.total,
            };
            return {
              lastRunResult: resultWithReward,
              saveData: addCurrencyToSave(
                context.saveData,
                resultWithReward.heroId,
                breakdown.total,
              ),
            };
          }),
        },
      },
    },
    results: {
      entry: () => log.debug("Entered results"),
      exit: () => log.debug("Exited results"),
      on: {
        CONTINUE: { target: "upgrade" },
      },
    },
    upgrade: {
      entry: () => log.debug("Entered upgrade"),
      exit: () => log.debug("Exited upgrade"),
      on: {
        START_RUN: {
          target: "run",
          actions: assign({
            pendingRunConfig: ({ event }) =>
              event.type === "START_RUN"
                ? {
                    chapter: event.chapter,
                    heroStats: event.heroStats,
                    enemyLayout: event.enemyLayout,
                    obstaclesBySegment: event.obstaclesBySegment,
                    enemyBehaviorFactory: event.enemyBehaviorFactory,
                    rngSeed: event.rngSeed,
                  }
                : null,
          }),
        },
        GO_TO_HERO_SELECT: { target: "heroSelect" },
      },
    },
  },
});
