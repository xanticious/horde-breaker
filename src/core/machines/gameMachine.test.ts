import { createActor } from "xstate";
import { describe, it, expect, beforeEach } from "vitest";
import { gameMachine } from "./gameMachine";
import { HeroId } from "@core/types/hero";
import type { RunResult } from "@core/types/run";

const MOCK_RUN_RESULT: RunResult = {
  heroId: HeroId.Barbarian,
  chapter: 1,
  currencyEarned: 75,
  distancePercent: 80,
  distanceReached: 80,
  enemiesDefeated: 3,
  duelDamageDealt: 120,
  bossDefeated: false,
  coinsCollected: [],
  completed: false,
};

describe("gameMachine", () => {
  describe("initial state", () => {
    it("starts in titleScreen", () => {
      const actor = createActor(gameMachine);
      actor.start();
      expect(actor.getSnapshot().value).toBe("titleScreen");
    });

    it("has null selectedHeroId in context", () => {
      const actor = createActor(gameMachine);
      actor.start();
      expect(actor.getSnapshot().context.selectedHeroId).toBeNull();
    });

    it("has null lastRunResult in context", () => {
      const actor = createActor(gameMachine);
      actor.start();
      expect(actor.getSnapshot().context.lastRunResult).toBeNull();
    });
  });

  describe("titleScreen → heroSelect", () => {
    it("transitions to heroSelect on START_GAME", () => {
      const actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      expect(actor.getSnapshot().value).toBe("heroSelect");
    });

    it("ignores irrelevant events in titleScreen", () => {
      const actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_RUN" });
      expect(actor.getSnapshot().value).toBe("titleScreen");
    });
  });

  describe("heroSelect → upgrade", () => {
    it("transitions to upgrade on SELECT_HERO and stores heroId", () => {
      const actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe("upgrade");
      expect(snapshot.context.selectedHeroId).toBe(HeroId.Barbarian);
    });

    it("ignores irrelevant events in heroSelect", () => {
      const actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "START_RUN" });
      expect(actor.getSnapshot().value).toBe("heroSelect");
    });
  });

  describe("upgrade → run", () => {
    let actor: ReturnType<typeof createActor<typeof gameMachine>>;

    beforeEach(() => {
      actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
    });

    it("transitions to run on START_RUN", () => {
      actor.send({ type: "START_RUN" });
      expect(actor.getSnapshot().value).toBe("run");
    });

    it("transitions back to heroSelect on GO_TO_HERO_SELECT", () => {
      actor.send({ type: "GO_TO_HERO_SELECT" });
      expect(actor.getSnapshot().value).toBe("heroSelect");
    });

    it("ignores irrelevant events in upgrade", () => {
      actor.send({ type: "CONTINUE" });
      expect(actor.getSnapshot().value).toBe("upgrade");
    });
  });

  describe("run → results", () => {
    let actor: ReturnType<typeof createActor<typeof gameMachine>>;

    beforeEach(() => {
      actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      actor.send({ type: "START_RUN" });
    });

    it("transitions to results on END_RUN and stores result", () => {
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe("results");
      expect(snapshot.context.lastRunResult).toEqual(MOCK_RUN_RESULT);
    });

    it("ignores irrelevant events in run", () => {
      actor.send({ type: "START_GAME" });
      expect(actor.getSnapshot().value).toBe("run");
    });
  });

  describe("results → upgrade", () => {
    let actor: ReturnType<typeof createActor<typeof gameMachine>>;

    beforeEach(() => {
      actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      actor.send({ type: "START_RUN" });
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });
    });

    it("transitions to upgrade on CONTINUE", () => {
      actor.send({ type: "CONTINUE" });
      expect(actor.getSnapshot().value).toBe("upgrade");
    });

    it("ignores irrelevant events in results", () => {
      actor.send({ type: "START_GAME" });
      expect(actor.getSnapshot().value).toBe("results");
    });
  });

  describe("full loop: upgrade → run → results → upgrade → run", () => {
    it("completes two full run cycles without error", () => {
      const actor = createActor(gameMachine);
      actor.start();

      // Navigate to upgrade
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      expect(actor.getSnapshot().value).toBe("upgrade");

      // First run
      actor.send({ type: "START_RUN" });
      expect(actor.getSnapshot().value).toBe("run");
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });
      expect(actor.getSnapshot().value).toBe("results");
      actor.send({ type: "CONTINUE" });
      expect(actor.getSnapshot().value).toBe("upgrade");

      // Second run
      actor.send({ type: "START_RUN" });
      expect(actor.getSnapshot().value).toBe("run");
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });
      expect(actor.getSnapshot().value).toBe("results");
      actor.send({ type: "CONTINUE" });
      expect(actor.getSnapshot().value).toBe("upgrade");
    });
  });
});
