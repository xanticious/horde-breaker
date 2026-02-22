import { assign, setup } from "xstate";
import type { HeroId } from "@core/types/hero";
import type { RunResult } from "@core/types/run";
import { Logger } from "@debug/Logger";

// ─── Module Logger ───────────────────────────────────────────────────────────

const log = Logger.create("game");

// ─── Event Types ─────────────────────────────────────────────────────────────

export type GameEvent =
  | { type: "START_GAME" }
  | { type: "SELECT_HERO"; heroId: HeroId }
  | { type: "START_RUN" }
  | { type: "END_RUN"; result: RunResult }
  | { type: "CONTINUE" }
  | { type: "GO_TO_HERO_SELECT" };

// ─── Context ────────────────────────────────────────────────────────────────

export interface GameContext {
  selectedHeroId: HeroId | null;
  lastRunResult: RunResult | null;
}

// ─── Machine ─────────────────────────────────────────────────────────────────

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
  },
}).createMachine({
  id: "game",
  initial: "titleScreen",
  context: {
    selectedHeroId: null,
    lastRunResult: null,
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
      on: {
        END_RUN: {
          target: "results",
          actions: assign({
            lastRunResult: ({ event }) => event.result,
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
        START_RUN: { target: "run" },
        GO_TO_HERO_SELECT: { target: "heroSelect" },
      },
    },
  },
});
