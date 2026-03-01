import { createActor } from "xstate";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { duelMachine } from "./duelMachine";
import { EnemyId } from "@core/types/enemy";
import { wolfBehavior } from "@core/entities/enemies/wolf";
import { swordsmanBehavior } from "@core/entities/enemies/swordsman";
import { shieldbearerBehavior, SHIELDBEARER_BASE_ARMOR } from "@core/entities/enemies/shieldbearer";

// ── Constants mirroring duelMachine internals ─────────────────────────────────

/** DEFAULT_ATTACK_DURATION_MS * attackSpeed (1) */
const HERO_WINDUP_MS = 400;
const HERO_RECOVERY_MS = 300;
/** Wolf pounce wind-up / recovery from wolf.ts. */
const WOLF_POUNCE_WINDUP_MS = 800;
const WOLF_POUNCE_RECOVERY_MS = 600;
const WOLF_RETREAT_RECOVERY_MS = 400;
/** Swordsman slash timing. */
const SWORDSMAN_SLASH_WINDUP_MS = 600;
const SWORDSMAN_SLASH_RECOVERY_MS = 700;
const ENEMY_THINK_MS = 1200;

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_HERO = { maxHp: 100, damage: 10, attackSpeed: 1, armor: 0 };
const WOLF_ENEMY_INPUT = { id: EnemyId.Wolf, hp: 50, damage: 15, behavior: wolfBehavior };
const SWORDSMAN_ENEMY_INPUT = {
  id: EnemyId.Swordsman,
  hp: 60,
  damage: 12,
  behavior: swordsmanBehavior,
};
const SHIELDBEARER_ENEMY_INPUT = {
  id: EnemyId.Shieldbearer,
  hp: 80,
  damage: 10,
  behavior: shieldbearerBehavior,
  baseArmorReduction: SHIELDBEARER_BASE_ARMOR,
};

/** rng() = 0.5 > WOLF_RETREAT_CHANCE (0.2) — wolf always pounces when in range. */
const alwaysPounceRng = () => 0.5;
/** rng() = 0.1 < WOLF_RETREAT_CHANCE (0.2) — wolf retreats when in range. */
const alwaysRetreatRng = () => 0.1;
/** rng() = 0.3 < SWORDSMAN_SLASH_CHANCE (0.65) — swordsman always slashes when in range. */
const alwaysSlashRng = () => 0.3;

function createDuel(
  overrides: {
    hero?: Partial<typeof DEFAULT_HERO>;
    /** Single enemy input — wrapped in array for the new multi-enemy API. */
    enemy?: {
      id?: EnemyId;
      hp?: number;
      damage?: number;
      behavior?: typeof wolfBehavior;
      baseArmorReduction?: number;
    };
    enemies?: (typeof WOLF_ENEMY_INPUT)[];
    heroX?: number;
    enemyX?: number;
    rng?: () => number;
  } = {},
) {
  const enemies = overrides.enemies ?? [
    {
      ...WOLF_ENEMY_INPUT,
      ...(overrides.enemy ?? {}),
      ...(overrides.enemyX !== undefined ? { x: overrides.enemyX } : {}),
    },
  ];
  return createActor(duelMachine, {
    input: {
      hero: { ...DEFAULT_HERO, ...overrides.hero },
      enemies,
      heroX: overrides.heroX,
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
      expect(actor.getSnapshot().context.enemies[0]?.hp).toBe(30);
    });

    it("starts with activeEnemyIndex = 0", () => {
      const actor = createDuel();
      actor.start();
      expect(actor.getSnapshot().context.activeEnemyIndex).toBe(0);
    });

    it("starts with totalDamageDealt = 0", () => {
      const actor = createDuel();
      actor.start();
      expect(actor.getSnapshot().context.totalDamageDealt).toBe(0);
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
      const enemyHpBefore = actor.getSnapshot().context.enemies[0]?.hp ?? 0;
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(actor.getSnapshot().context.enemies[0]?.hp).toBeLessThan(enemyHpBefore);
    });

    it("accumulates totalDamageDealt after each attack", () => {
      const actor = createDuel();
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS + HERO_RECOVERY_MS);
      expect(actor.getSnapshot().context.totalDamageDealt).toBeGreaterThan(0);
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

    it("DUEL_WON damageDealt equals totalDamageDealt in context", () => {
      const wonEvents: { type: "DUEL_WON"; damageDealt: number }[] = [];
      const actor = createDuel({ enemy: { hp: 10 } });
      actor.on("DUEL_WON", (e) => wonEvents.push(e));
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(wonEvents[0]?.damageDealt).toBe(actor.getSnapshot().context.totalDamageDealt);
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

  // ── Enemy attack flow — wolf pounce ───────────────────────────────────────

  describe("enemy attack flow (wolf pounce)", () => {
    it("transitions to enemyWindingUp after ENEMY_THINK_MS", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      expect(actor.getSnapshot().value).toBe("enemyWindingUp");
    });

    it("sets currentAction when entering enemyWindingUp", () => {
      const actor = createDuel({ heroX: 0, enemyX: 200, rng: alwaysPounceRng });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      expect(actor.getSnapshot().context.enemies[0]?.currentAction).toEqual({ type: "pounce" });
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
      expect(actor.getSnapshot().context.enemies[0]?.currentAction).toEqual({ type: "wait" });
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

  // ── Swordsman slash ───────────────────────────────────────────────────────

  describe("swordsman slash action", () => {
    it("triggers slash when hero is in swordsman range", () => {
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          // heroX=0, swordsman at 150 → dist=150 ≤ 200 → slash
          enemies: [{ ...SWORDSMAN_ENEMY_INPUT, x: 150 }],
          heroX: 0,
          rng: alwaysSlashRng,
        },
      });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS);
      expect(actor.getSnapshot().context.enemies[0]?.currentAction).toEqual({ type: "slash" });
    });

    it("deals damage to the hero when slash resolves unblocked", () => {
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [{ ...SWORDSMAN_ENEMY_INPUT, x: 150 }],
          heroX: 0,
          rng: alwaysSlashRng,
        },
      });
      actor.start();
      const hpBefore = actor.getSnapshot().context.heroHp;
      vi.advanceTimersByTime(ENEMY_THINK_MS + SWORDSMAN_SLASH_WINDUP_MS);
      expect(actor.getSnapshot().context.heroHp).toBeLessThan(hpBefore);
    });

    it("returns to idle after slash recovery elapses", () => {
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [{ ...SWORDSMAN_ENEMY_INPUT, x: 150 }],
          heroX: 0,
          rng: alwaysSlashRng,
        },
      });
      actor.start();
      vi.advanceTimersByTime(
        ENEMY_THINK_MS + SWORDSMAN_SLASH_WINDUP_MS + SWORDSMAN_SLASH_RECOVERY_MS,
      );
      expect(actor.getSnapshot().value).toBe("idle");
    });
  });

  // ── Shieldbearer armor ─────────────────────────────────────────────────────

  describe("shieldbearer shield armor", () => {
    it("hero deals less damage to a shielded shieldbearer than to an unprotected enemy", () => {
      // Normal wolf enemy baseline
      const wolfActor = createDuel({ enemy: { hp: 100, damage: 5 } });
      wolfActor.start();
      wolfActor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      const wolfHpAfter = wolfActor.getSnapshot().context.enemies[0]?.hp ?? 0;
      const damageToWolf = 100 - wolfHpAfter;

      vi.useRealTimers();
      vi.useFakeTimers();

      // Shieldbearer with armor
      const shieldActor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [{ ...SHIELDBEARER_ENEMY_INPUT, hp: 100 }],
          heroX: 0,
          rng: alwaysPounceRng,
        },
      });
      shieldActor.start();
      shieldActor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      const shieldHpAfter = shieldActor.getSnapshot().context.enemies[0]?.hp ?? 0;
      const damageToShield = 100 - shieldHpAfter;

      expect(damageToShield).toBeLessThan(damageToWolf);
    });

    it("shieldbearer armor is restored to base value on return to idle", () => {
      // The shieldbearer bashes → recovery drops armor to 0 → idle restores it.
      // Verify by checking currentArmorReduction after the recovery phase.
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          // Place shieldbearer in range so it bashes; rng always bashes
          enemies: [{ ...SHIELDBEARER_ENEMY_INPUT, x: 100 }],
          heroX: 0,
          rng: () => 0.3, // < SHIELDBEARER_BASH_CHANCE (0.7) → shieldBash
        },
      });
      actor.start();

      // After full bash cycle (think + windup + recovery) → back to idle, armor restored.
      const BASH_WINDUP = 700;
      const BASH_RECOVERY = 900;
      vi.advanceTimersByTime(ENEMY_THINK_MS + BASH_WINDUP + BASH_RECOVERY);

      expect(actor.getSnapshot().value).toBe("idle");
      expect(actor.getSnapshot().context.enemies[0]?.currentArmorReduction).toBe(
        SHIELDBEARER_BASE_ARMOR,
      );
    });

    it("shieldbearer armor is 0 during post-bash recovery (vulnerability window)", () => {
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [{ ...SHIELDBEARER_ENEMY_INPUT, x: 100 }],
          heroX: 0,
          rng: () => 0.3,
        },
      });
      actor.start();

      const BASH_WINDUP = 700;
      // Advance to just inside recovery — armor should be 0.
      vi.advanceTimersByTime(ENEMY_THINK_MS + BASH_WINDUP + 1);

      expect(actor.getSnapshot().value).toBe("enemyRecovery");
      expect(actor.getSnapshot().context.enemies[0]?.currentArmorReduction).toBe(0);
    });
  });

  // ── Multi-enemy encounters ────────────────────────────────────────────────

  describe("multi-enemy encounters (14.3 / 14.6)", () => {
    it("starts with activeEnemyIndex=0 when there are two enemies", () => {
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [
            { ...WOLF_ENEMY_INPUT, x: 620 },
            { ...SWORDSMAN_ENEMY_INPUT, x: 820 },
          ],
          rng: alwaysPounceRng,
        },
      });
      actor.start();
      expect(actor.getSnapshot().context.activeEnemyIndex).toBe(0);
    });

    it("advances to the second enemy after the first is defeated", () => {
      // Kills wolf in one shot, then activeEnemyIndex should advance to 1.
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [
            { ...WOLF_ENEMY_INPUT, hp: 10, x: 620 },
            { ...SWORDSMAN_ENEMY_INPUT, hp: 60, x: 820 },
          ],
          rng: alwaysPounceRng,
        },
      });
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      // Wolf (10 HP) should be dead from 10-damage hit → index advances to 1.
      expect(actor.getSnapshot().context.activeEnemyIndex).toBe(1);
    });

    it("remains in combat (heroRecovery → idle) when first enemy is defeated but second remains", () => {
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [
            { ...WOLF_ENEMY_INPUT, hp: 10, x: 620 },
            { ...SWORDSMAN_ENEMY_INPUT, hp: 60, x: 820 },
          ],
          rng: alwaysPounceRng,
        },
      });
      actor.start();
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS + HERO_RECOVERY_MS);
      // Should be back in idle fighting the swordsman — not in enemyDefeated.
      expect(actor.getSnapshot().value).toBe("idle");
    });

    it("transitions to enemyDefeated only when all enemies are defeated", () => {
      // Two fragile enemies — one hero attack kills each.
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [
            { ...WOLF_ENEMY_INPUT, hp: 10, x: 620 },
            { ...SWORDSMAN_ENEMY_INPUT, hp: 10, x: 820 },
          ],
          rng: alwaysPounceRng,
        },
      });
      actor.start();

      // Kill enemy 0
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS + HERO_RECOVERY_MS);
      expect(actor.getSnapshot().value).toBe("idle");
      expect(actor.getSnapshot().context.activeEnemyIndex).toBe(1);

      // Kill enemy 1
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);
      expect(actor.getSnapshot().value).toBe("enemyDefeated");
    });

    it("emits DUEL_WON with cumulative damage across all enemies", () => {
      const wonEvents: { type: "DUEL_WON"; damageDealt: number }[] = [];
      const actor = createActor(duelMachine, {
        input: {
          hero: DEFAULT_HERO,
          enemies: [
            { ...WOLF_ENEMY_INPUT, hp: 10, x: 620 },
            { ...SWORDSMAN_ENEMY_INPUT, hp: 10, x: 820 },
          ],
          rng: alwaysPounceRng,
        },
      });
      actor.on("DUEL_WON", (e) => wonEvents.push(e));
      actor.start();

      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS + HERO_RECOVERY_MS);
      actor.send({ type: "ATTACK" });
      vi.advanceTimersByTime(HERO_WINDUP_MS);

      expect(wonEvents).toHaveLength(1);
      // Should reflect damage to both enemies (at least 20 total for 10-hp each).
      expect(wonEvents[0]?.damageDealt).toBeGreaterThanOrEqual(20);
    });

    it("hero dying during a two-enemy encounter still emits DUEL_LOST", () => {
      let lost = false;
      const actor = createActor(duelMachine, {
        input: {
          // Very low HP hero, wolf is in pounce range
          hero: { maxHp: 15, damage: 5, attackSpeed: 1, armor: 0 },
          enemies: [
            { ...WOLF_ENEMY_INPUT, hp: 200, damage: 15, x: 200 },
            { ...SWORDSMAN_ENEMY_INPUT, hp: 200, x: 620 },
          ],
          heroX: 0,
          rng: alwaysPounceRng,
        },
      });
      actor.on("DUEL_LOST", () => {
        lost = true;
      });
      actor.start();
      vi.advanceTimersByTime(ENEMY_THINK_MS + WOLF_POUNCE_WINDUP_MS);
      expect(lost).toBe(true);
    });
  });
});
