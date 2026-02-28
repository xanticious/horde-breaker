import { createActor } from "xstate";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { duelMachine } from "./duelMachine";
import { EnemyId } from "@core/types/enemy";
import { wolfBehavior } from "@core/entities/enemies/wolf";

// ── Constants mirroring duelMachine internals ─────────────────────────────────

/** DEFAULT_ATTACK_DURATION_MS * attackSpeed (1) */
const HERO_WINDUP_MS = 400;
const HERO_RECOVERY_MS = 300;
/** Wolf pounce wind-up / recovery from wolf.ts. */
const WOLF_POUNCE_WINDUP_MS = 800;
const WOLF_POUNCE_RECOVERY_MS = 600;
const WOLF_RETREAT_RECOVERY_MS = 400;
const ENEMY_THINK_MS = 1200;

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_HERO = { maxHp: 100, damage: 10, attackSpeed: 1, armor: 0 };
const WOLF_ENEMY = { id: EnemyId.Wolf, hp: 50, damage: 15, behavior: wolfBehavior };

/** rng() = 0.5 > WOLF_RETREAT_CHANCE (0.2) — wolf always pounces when in range. */
const alwaysPounceRng = () => 0.5;
/** rng() = 0.1 < WOLF_RETREAT_CHANCE (0.2) — wolf retreats when in range. */
const alwaysRetreatRng = () => 0.1;

function createDuel(
  overrides: {
    hero?: Partial<typeof DEFAULT_HERO>;
    enemy?: Partial<typeof WOLF_ENEMY>;
    heroX?: number;
    enemyX?: number;
    rng?: () => number;
  } = {},
) {
  return createActor(duelMachine, {
    input: {
      hero: { ...DEFAULT_HERO, ...overrides.hero },
      enemy: { ...WOLF_ENEMY, ...overrides.enemy },
      heroX: overrides.heroX,
      enemyX: overrides.enemyX,
      rng: overrides.rng ?? alwaysPounceRng,
    },
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("duelMachine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("starts in idle", () => {
      const actor = createDuel();
      actor.start();
      expect(actor.getSnapshot().value).toBe("idle");
    });

    it("initialises hero HP from input", () => {
      const actor = createDuel({ hero: { maxHp: 80 } });
      actor.start();
      expect(actor.getSnapshot().context.heroHp).toBe(80);
    });

    it("initialises enemy HP from input", () => {
      const actor = createDuel({ enemy: { hp: 30 } });
      actor.start();
      expect(actor.getSnapshot().context.enemyHp).toBe(30);
    });
  });

  // ── Hero attack flow ──────────────────────────────────────────────────────

  describe("hero attack flow", () => {
    it("transitions from idle to heroWindingUp on ATTACK", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "ATTACK" });
      expect(actor.getSnapshot().value).toBe("heroWindingUp");
    });

    it("moves to heroRecovery after wind-up completes", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(actor.getSnapshot().value).toBe("heroRecovery");
    });

    it("reduces enemy HP after hero wind-up resolves", () => {
      const actor = createDuel();
      actor.start();
      const enemyHpBefore = actor.getSnapshot().context.enemyHp;
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(actor.getSnapshot().context.enemyHp).toBeLessThan(enemyHpBefore);
    });

    it("returns to idle after recovery timer elapses", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS + HERO_RECOVERY_MS);
      expect(actor.getSnapshot().value).toBe("idle");
    });

    it("ignores ATTACK events while hero is winding up (commitment)", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "ATTACK" });
      actor.send({ type: "ATTACK" }); // second attack must be ignored
      // Still in heroWindingUp, not a second wind-up cycle
      expect(actor.getSnapshot().value).toBe("heroWindingUp");
    });

    it("ignores BLOCK while hero is winding up", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "ATTACK" });
      actor.send({ type: "BLOCK" });
      // Still in heroWindingUp — stance change was silently discarded
      expect(actor.getSnapshot().value).toBe("heroWindingUp");
    });
  });

  // ── Enemy defeated ────────────────────────────────────────────────────────

  describe("enemy defeated path", () => {
    it("transitions to enemyDefeated when hero reduces enemy HP to 0", () => {
      // One-shot kill: enemy has 10 HP, hero does 10 damage
      const actor = createDuel({ enemy: { hp: 10 } });
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(actor.getSnapshot().value).toBe("enemyDefeated");
    });

    it("emits DUEL_WON when enemy is killed", () => {
      const wonEvents: { type: "DUEL_WON"; damageDealt: number }[] = [];
      const actor = createDuel({ enemy: { hp: 10 } });
      actor.on("DUEL_WON", (e) => wonEvents.push(e));
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(wonEvents).toHaveLength(1);
      expect(wonEvents[0]?.damageDealt).toBeGreaterThan(0);
    });

    it("reaches enemyDefeated after multiple attacks", () => {
      // 50 HP enemy, hero does 10 per hit → needs 5 hits
      const actor = createDuel();
      actor.start();

      for (let i = 0; i < 5; i++) {
        actor.send({ type: "ATTACK" });
        vi.advanceTimersByTime(HERO_WINDUP_MS + HERO_RECOVERY_MS);
      }

      expect(actor.getSnapshot().value).toBe("enemyDefeated");
    });
  });

  // ── Block stance ──────────────────────────────────────────────────────────

  describe("block stance", () => {
    it("sets heroStance to blocking on BLOCK in idle", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "BLOCK" });
      expect(actor.getSnapshot().context.heroStance).toBe("blocking");
    });

    it("remains in idle after BLOCK (internal transition)", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "BLOCK" });
      expect(actor.getSnapshot().value).toBe("idle");
    });

    it("clears blocking stance on STAND", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "BLOCK" });
      actor.send({ type: "STAND" });
      expect(actor.getSnapshot().context.heroStance).toBe("neutral");
    });

    it("allows BLOCK during enemy wind-up", () => {
      // Force wolf in range so it pounces after ENEMY_THINK_MS
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS); // enemy decides → enemyWindingUp
      expect(actor.getSnapshot().value).toBe("enemyWindingUp");
      actor.send({ type: "BLOCK" });
      expect(actor.getSnapshot().context.heroStance).toBe("blocking");
    });
  });

  // ── Enemy attack flow ─────────────────────────────────────────────────────

  describe("enemy attack flow (wolf pounce)", () => {
    it("transitions to enemyWindingUp after ENEMY_THINK_MS", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      expect(actor.getSnapshot().value).toBe("enemyWindingUp");
    });

    it("sets currentEnemyAction when entering enemyWindingUp", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      expect(actor.getSnapshot().context.currentEnemyAction).toEqual({ type: "pounce" });
    });

    it("reduces hero HP when pounce resolves without a block", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      const hpBefore = actor.getSnapshot().context.heroHp;
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      expect(actor.getSnapshot().context.heroHp).toBeLessThan(hpBefore);
    });

    it("reduces hero HP less when blocking during wind-up", () => {
      // Unblocked control: record damage
      const noBlock = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      noBlock.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      const hpAfterNoBlock = noBlock.getSnapshot().context.heroHp;

      vi.useRealTimers();
      vi.useFakeTimers();

      // Blocked variant
      const blocked = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      blocked.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      blocked.send({ type: "BLOCK" });
      vi.advanceTimersByTime(WOLF_POUNCE_WINDUP_MS);
      const hpAfterBlock = blocked.getSnapshot().context.heroHp;

      expect(hpAfterBlock).toBeGreaterThan(hpAfterNoBlock);
    });

    it("returns to idle after enemy pounce resolves and recovery elapses", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS + WOLF_POUNCE_RECOVERY_MS);
      expect(actor.getSnapshot().value).toBe("idle");
    });

    it("does not deal hero damage when wolf retreats", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysRetreatRng });
      actor.start();
      const hpBefore = actor.getSnapshot().context.heroHp;
      // Retreat: 0 windup + 400 recovery
      vi.advanceTimersByTime(ENEMY_THINK_MS + 0 + WOLF_RETREAT_RECOVERY_MS);
      expect(actor.getSnapshot().context.heroHp).toBe(hpBefore);
    });

    it("transitions to heroDied when pounce reduces hero HP to 0", () => {
      // Hero has exactly 15 HP, wolf does exactly 15 damage, armor=0
      const actor = createDuel({
        hero: { maxHp: 15, damage: 10, attackSpeed: 1, armor: 0 },
        heroX: 0,
        enemyX: 200,
        rng: alwaysPounceRng,
      });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      expect(actor.getSnapshot().value).toBe("heroDied");
    });

    it("emits DUEL_LOST when hero dies", () => {
      let lost = false;
      const actor = createDuel({
        hero: { maxHp: 15, damage: 10, attackSpeed: 1, armor: 0 },
        heroX: 0,
        enemyX: 200,
        rng: alwaysPounceRng,
      });
      actor.on("DUEL_LOST", () => {
        lost = true;
      });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      expect(lost).toBe(true);
    });
  });

  // ── Wolf waits when hero is out of range ──────────────────────────────────

  describe("wolf wait action (hero out of range)", () => {
    it("enters enemyWindingUp with a wait action when hero is out of pounce range", () => {
      // heroX=0, enemyX=700 → distance=700 > 300 → wolf waits
      const actor = createDuel({ heroX: 0, enemyX: 700 });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      expect(actor.getSnapshot().value).toBe("enemyWindingUp");
      expect(actor.getSnapshot().context.currentEnemyAction).toEqual({ type: "wait" });
    });

    it("does not change hero HP when wolf waits (0 ms windup + 0 ms recovery)", () => {
      const actor = createDuel({ heroX: 0, enemyX: 700 });
      actor.start();
      const hpBefore = actor.getSnapshot().context.heroHp;
      // wait: 0 windup, 0 recovery → transitions through enemyWindingUp → enemyRecovery → idle instantly
      vi.advanceTimersByTime(ENEMY_THINK_MS + 1);
      expect(actor.getSnapshot().context.heroHp).toBe(hpBefore);
    });
  });

  // ── Armour reduces incoming damage ───────────────────────────────────────

  describe("hero armour", () => {
    it("armour reduces pounce damage when hero is not blocking", () => {
      // Unarmoured baseline
      const noArmour = createDuel({
        hero: { maxHp: 100, damage: 10, attackSpeed: 1, armor: 0 },
        heroX: 0,
        enemyX: 200,
        rng: alwaysPounceRng,
      });
      noArmour.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      const hpNoArmour = noArmour.getSnapshot().context.heroHp;

      vi.useRealTimers();
      vi.useFakeTimers();

      // Armoured hero
      const withArmour = createDuel({
        hero: { maxHp: 100, damage: 10, attackSpeed: 1, armor: 0.5 },
        heroX: 0,
        enemyX: 200,
        rng: alwaysPounceRng,
      });
      withArmour.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      const hpWithArmour = withArmour.getSnapshot().context.heroHp;

      expect(hpWithArmour).toBeGreaterThan(hpNoArmour);
    });
  });
});
