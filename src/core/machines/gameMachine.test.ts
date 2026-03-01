import { createActor } from "xstate";
import { describe, it, expect, beforeEach } from "vitest";
import { gameMachine } from "./gameMachine";
import type { GameEvent } from "./gameMachine";
import { HeroId } from "@core/types/hero";
import { ChapterId } from "@core/types/chapter";
import { EnemyId } from "@core/types/enemy";
import type { RunResult } from "@core/types/run";

const MOCK_START_RUN: Extract<GameEvent, { type: "START_RUN" }> = {
  type: "START_RUN",
  chapter: ChapterId.Chapter1,
  heroStats: {
    maxHp: 100,
    armor: 0,
    runSpeed: 200,
    damageMultiplier: 1,
    attackSpeed: 1,
    specialAbility: { damage: 0, cooldownMs: 0, durationMs: 0 },
  },
  // One encounter at 50% so the run doesn't resolve immediately in tests.
  enemyLayout: [{ enemyId: EnemyId.Wolf, positionPercent: 50, isBoss: false }],
  obstaclesBySegment: [],
  enemyBehaviorFactory: () => ({
    decideAction: () => ({ type: "wait" }) as const,
    getWindUpDuration: () => 500,
    getRecoveryDuration: () => 300,
  }),
  rngSeed: 1,
};

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
      actor.send(MOCK_START_RUN);
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
      actor.send(MOCK_START_RUN);
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
      actor.send(MOCK_START_RUN);
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
      actor.send(MOCK_START_RUN);
    });

    it("transitions to results on END_RUN and stores result", () => {
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });

      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe("results");
      // currencyEarned is overwritten by calculateRunReward — the stored result
      // matches on all fields except the computed currency amount.
      const stored = snapshot.context.lastRunResult;
      expect(stored).not.toBeNull();
      expect(stored?.heroId).toBe(MOCK_RUN_RESULT.heroId);
      expect(stored?.distancePercent).toBe(MOCK_RUN_RESULT.distancePercent);
      expect(stored?.enemiesDefeated).toBe(MOCK_RUN_RESULT.enemiesDefeated);
      expect(stored?.duelDamageDealt).toBe(MOCK_RUN_RESULT.duelDamageDealt);
      // The economy system computes the actual earned amount (350 for this mock).
      expect(stored?.currencyEarned).toBeGreaterThan(0);
    });

    it("ignores irrelevant events in run", () => {
      actor.send({ type: "START_GAME" });
      expect(actor.getSnapshot().value).toBe("run");
    });

    it("adds earned currency to saveData on END_RUN", () => {
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });

      const snapshot = actor.getSnapshot();
      const heroSave = snapshot.context.saveData.heroes[HeroId.Barbarian];
      expect(heroSave).toBeDefined();
      // Economy: 80% dist (80) + 3 kills × 50 (150) + 120 dmg (120) = 350
      expect(heroSave?.currency).toBe(350);
    });
  });

  describe("results → upgrade", () => {
    let actor: ReturnType<typeof createActor<typeof gameMachine>>;

    beforeEach(() => {
      actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      actor.send(MOCK_START_RUN);
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
      actor.send(MOCK_START_RUN);
      expect(actor.getSnapshot().value).toBe("run");
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });
      expect(actor.getSnapshot().value).toBe("results");
      actor.send({ type: "CONTINUE" });
      expect(actor.getSnapshot().value).toBe("upgrade");

      // Second run
      actor.send(MOCK_START_RUN);
      expect(actor.getSnapshot().value).toBe("run");
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });
      expect(actor.getSnapshot().value).toBe("results");
      actor.send({ type: "CONTINUE" });
      expect(actor.getSnapshot().value).toBe("upgrade");
    });
  });

  describe("upgrade — PURCHASE_UPGRADE", () => {
    let actor: ReturnType<typeof createActor<typeof gameMachine>>;

    // Nagivate to upgrade state with 350 ¤ earned (80dist + 3kills×50 + 120dmg).
    beforeEach(() => {
      actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      actor.send(MOCK_START_RUN);
      actor.send({ type: "END_RUN", result: MOCK_RUN_RESULT });
      actor.send({ type: "CONTINUE" });
    });

    it("deducts cost and increments upgrade level when guard passes", () => {
      // Max Health step 1→2 costs 18 ¤.
      actor.send({ type: "PURCHASE_UPGRADE", categoryId: "maxHealth" });

      const heroSave = actor.getSnapshot().context.saveData.heroes[HeroId.Barbarian];
      expect(heroSave?.currency).toBe(332); // 350 - 18
      expect(heroSave?.upgrades["maxHealth"]).toBe(2);
    });

    it("ignores PURCHASE_UPGRADE when currency is insufficient", () => {
      // Attempt to purchase when hero has no currency (fresh actor).
      const freshActor = createActor(gameMachine);
      freshActor.start();
      freshActor.send({ type: "START_GAME" });
      freshActor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      freshActor.send({ type: "PURCHASE_UPGRADE", categoryId: "maxHealth" });

      const heroSave = freshActor.getSnapshot().context.saveData.heroes[HeroId.Barbarian];
      expect(heroSave?.currency ?? 0).toBe(0);
      expect(heroSave?.upgrades?.["maxHealth"] ?? 1).toBe(1);
    });

    it("stays in upgrade state after a purchase", () => {
      actor.send({ type: "PURCHASE_UPGRADE", categoryId: "armor" });
      expect(actor.getSnapshot().value).toBe("upgrade");
    });

    it("can purchase multiple categories independently", () => {
      actor.send({ type: "PURCHASE_UPGRADE", categoryId: "maxHealth" }); // costs 18
      actor.send({ type: "PURCHASE_UPGRADE", categoryId: "armor" }); // costs 18

      const heroSave = actor.getSnapshot().context.saveData.heroes[HeroId.Barbarian];
      expect(heroSave?.currency).toBe(314); // 350 - 18 - 18
      expect(heroSave?.upgrades["maxHealth"]).toBe(2);
      expect(heroSave?.upgrades["armor"]).toBe(2);
    });
  });
});
