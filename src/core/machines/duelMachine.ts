import { assign, emit, setup } from "xstate";
import { Logger } from "@debug/Logger";
import type { DuelState } from "@core/types/combat";
import type { EnemyId } from "@core/types/enemy";
import { calculateDamage, calculateBlockResult } from "@core/systems/combat";
import { applyDamage, isAlive } from "@core/systems/health";
import { DEFAULT_ATTACK_DURATION_MS } from "@utils/constants";
import type { IEnemyBehavior, EnemyAction } from "@core/entities/enemies/enemyBase";

const log = Logger.create("duel");

// ── Constants ─────────────────────────────────────────────────────────────────

/** Default hero X position in the duel arena at design resolution. */
const DEFAULT_HERO_X = 300;

/** Default enemy X position in the duel arena at design resolution. */
const DEFAULT_ENEMY_X = 620;

/** Hero lock-out duration (ms) after an attack resolves. */
const HERO_RECOVERY_MS = 300;

/**
 * How long the enemy waits in the idle state before deciding its next action.
 * Long enough to let the hero act first, short enough to stay threatening.
 */
const ENEMY_THINK_MS = 1200;

/**
 * For Sprint 10 the block timing model is simplified:
 * any block pressed during the enemy's wind-up counts as a "regular" block
 * (not a perfect block). REGULAR_BLOCK_TIMING_MS intentionally exceeds
 * PERFECT_BLOCK_WINDOW_MS so calculateBlockResult returns a normal block.
 */
const PERFECT_BLOCK_WINDOW_MS = 200;
const REGULAR_BLOCK_TIMING_MS = PERFECT_BLOCK_WINDOW_MS + 1;

// ── Input / context types ─────────────────────────────────────────────────────

export interface DuelHeroInput {
  maxHp: number;
  /** Base damage value per attack swing. */
  damage: number;
  /** Animation-speed multiplier; lower values produce shorter wind-up times. */
  attackSpeed: number;
  /** Armour reduction fraction [0–1] applied to incoming enemy damage. */
  armor: number;
}

export interface DuelEnemyInput {
  id: EnemyId;
  hp: number;
  damage: number;
  behavior: IEnemyBehavior;
}

export interface DuelInput {
  hero: DuelHeroInput;
  enemy: DuelEnemyInput;
  /** Override the hero's starting X coordinate (defaults to DEFAULT_HERO_X). */
  heroX?: number;
  /** Override the enemy's starting X coordinate (defaults to DEFAULT_ENEMY_X). */
  enemyX?: number;
  /**
   * Seeded PRNG for deterministic enemy AI decisions.
   * Defaults to Math.random when omitted — pass a seeded RNG for reproducible runs.
   */
  rng?: () => number;
}

/** Duel-specific stance — separate from traversal's HeroStance to avoid name collision. */
export type DuelHeroStance = "neutral" | "blocking";

export interface DuelContext {
  heroHp: number;
  heroMaxHp: number;
  heroDamage: number;
  heroArmor: number;
  heroAttackSpeed: number;
  heroX: number;
  heroStance: DuelHeroStance;
  enemyId: EnemyId;
  enemyHp: number;
  enemyMaxHp: number;
  enemyDamage: number;
  enemyX: number;
  enemyBehavior: IEnemyBehavior;
  currentEnemyAction: EnemyAction;
  rng: () => number;
}

// ── Events ────────────────────────────────────────────────────────────────────

export type DuelEvent =
  | { type: "ATTACK" }
  | { type: "BLOCK" }
  | { type: "JUMP" }
  | { type: "DUCK" }
  | { type: "STAND" }
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" };

// ── Emitted events (for parent actors) ────────────────────────────────────────

export type DuelEmitted =
  /** Fired once when the enemy's HP reaches zero. */
  | { type: "DUEL_WON"; damageDealt: number }
  /** Fired once when the hero's HP reaches zero. */
  | { type: "DUEL_LOST" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDuelSnapshot(context: DuelContext, phase: DuelState["phase"]): DuelState {
  return {
    heroX: context.heroX,
    enemyX: context.enemyX,
    heroHp: context.heroHp,
    maxHeroHp: context.heroMaxHp,
    enemyHp: context.enemyHp,
    maxEnemyHp: context.enemyMaxHp,
    phase,
  };
}

// ── Machine ───────────────────────────────────────────────────────────────────

/**
 * One-vs-one combat encounter between the hero and a single enemy.
 *
 * Combat is commitment-based: once ATTACK is sent the hero is locked into the
 * heroWindingUp state and cannot act again until the attack resolves and the
 * heroRecovery timer expires.
 *
 * The enemy AI is queried via the IEnemyBehavior strategy each ENEMY_THINK_MS
 * interval. Damage resolution, blocking, and HP tracking all use the pure
 * combat/health system functions so they stay independently testable.
 */
export const duelMachine = setup({
  types: {
    context: {} as DuelContext,
    events: {} as DuelEvent,
    emitted: {} as DuelEmitted,
    input: {} as DuelInput,
  },
  delays: {
    /** Hero wind-up: base animation time scaled by attack-speed multiplier. */
    HERO_WINDUP: ({ context }: { context: DuelContext }) =>
      Math.round(DEFAULT_ATTACK_DURATION_MS * context.heroAttackSpeed),
    /** Brief hero lock-out after attack resolves — prevents spam attacks. */
    HERO_RECOVERY: HERO_RECOVERY_MS,
    /** Enemy wind-up duration is determined by the behavior strategy. */
    ENEMY_WINDUP: ({ context }: { context: DuelContext }) =>
      context.enemyBehavior.getWindUpDuration(context.currentEnemyAction),
    /** Enemy recovery duration is determined by the behavior strategy. */
    ENEMY_RECOVERY: ({ context }: { context: DuelContext }) =>
      context.enemyBehavior.getRecoveryDuration(context.currentEnemyAction),
    /** Gap between enemy action decisions when neither side is acting. */
    ENEMY_THINK: ENEMY_THINK_MS,
  },
  actions: {
    enterBlockingStance: assign({ heroStance: "blocking" as DuelHeroStance }),
    exitBlockingStance: assign({ heroStance: "neutral" as DuelHeroStance }),

    decideEnemyAction: assign(({ context }) => ({
      currentEnemyAction: context.enemyBehavior.decideAction(
        makeDuelSnapshot(context, "idle"),
        context.rng,
      ),
    })),

    resolveHeroAttack: assign(({ context }) => {
      const damage = calculateDamage({
        baseDamage: context.heroDamage,
        damageMultiplier: 1,
        stanceMultiplier: 1,
        // Enemy has no armour in the initial roster (Sprint 10–13).
        armorReduction: 0,
        criticalHit: false,
      });
      const newHp = applyDamage(context.enemyHp, damage, context.enemyMaxHp);
      log.debug(`Hero attack resolves: ${damage} dmg → enemy ${context.enemyHp}→${newHp} HP`);
      return { enemyHp: newHp };
    }),

    resolveEnemyAttack: assign(({ context }) => {
      // Non-attacking actions (wait, retreat) deal no damage.
      if (context.currentEnemyAction.type !== "pounce") {
        return {};
      }

      let damage: number;
      if (context.heroStance === "blocking") {
        // Any block pressed during wind-up counts as a regular block for Sprint 10.
        const result = calculateBlockResult(
          context.enemyDamage,
          REGULAR_BLOCK_TIMING_MS,
          PERFECT_BLOCK_WINDOW_MS,
        );
        damage = result.damage;
        log.debug(`Hero blocked pounce: ${context.enemyDamage}→${damage} dmg`);
      } else {
        damage = calculateDamage({
          baseDamage: context.enemyDamage,
          damageMultiplier: 1,
          stanceMultiplier: 1,
          armorReduction: context.heroArmor,
          criticalHit: false,
        });
        log.debug(`Hero takes pounce hit: ${damage} dmg`);
      }

      const newHp = applyDamage(context.heroHp, damage, context.heroMaxHp);
      return { heroHp: newHp };
    }),

    emitDuelWon: emit(({ context }: { context: DuelContext }) => ({
      type: "DUEL_WON" as const,
      // Total damage the hero dealt equals enemy max HP minus remaining HP.
      damageDealt: context.enemyMaxHp - context.enemyHp,
    })),

    emitDuelLost: emit({ type: "DUEL_LOST" as const }),
  },
  guards: {
    enemyDead: ({ context }) => !isAlive(context.enemyHp),
    heroDead: ({ context }) => !isAlive(context.heroHp),
  },
}).createMachine({
  id: "duel",
  initial: "idle",
  context: ({ input }) => ({
    heroHp: input.hero.maxHp,
    heroMaxHp: input.hero.maxHp,
    heroDamage: input.hero.damage,
    heroArmor: input.hero.armor,
    heroAttackSpeed: input.hero.attackSpeed,
    heroX: input.heroX ?? DEFAULT_HERO_X,
    heroStance: "neutral",
    enemyId: input.enemy.id,
    enemyHp: input.enemy.hp,
    enemyMaxHp: input.enemy.hp,
    enemyDamage: input.enemy.damage,
    enemyX: input.enemyX ?? DEFAULT_ENEMY_X,
    enemyBehavior: input.enemy.behavior,
    currentEnemyAction: { type: "wait" },
    rng: input.rng ?? Math.random,
  }),
  states: {
    idle: {
      entry: () => log.debug("idle"),
      on: {
        ATTACK: {
          // Committing to swing — clear any blocking stance beforehand.
          actions: "exitBlockingStance",
          target: "heroWindingUp",
        },
        BLOCK: {
          actions: "enterBlockingStance",
          // No target = internal transition — the ENEMY_THINK timer keeps running.
        },
        STAND: { actions: "exitBlockingStance" },
        JUMP: { actions: "exitBlockingStance" },
        DUCK: { actions: "exitBlockingStance" },
        MOVE_LEFT: {
          actions: assign({ heroX: ({ context }) => Math.max(0, context.heroX - 80) }),
        },
        MOVE_RIGHT: {
          actions: assign({
            heroX: ({ context }) => Math.min(context.enemyX - 100, context.heroX + 80),
          }),
        },
      },
      after: {
        ENEMY_THINK: {
          // Decide what the enemy wants to do, then commit to it.
          actions: "decideEnemyAction",
          target: "enemyWindingUp",
        },
      },
    },

    heroWindingUp: {
      // Hero is locked in — all input events are silently ignored.
      entry: () => log.debug("heroWindingUp"),
      after: {
        HERO_WINDUP: {
          actions: "resolveHeroAttack",
          target: "heroRecovery",
        },
      },
    },

    heroRecovery: {
      entry: () => log.debug("heroRecovery"),
      // Check immediately on entry whether the attack finished the enemy.
      always: [
        {
          guard: "enemyDead",
          actions: "emitDuelWon",
          target: "enemyDefeated",
        },
      ],
      after: {
        HERO_RECOVERY: "idle",
      },
    },

    enemyWindingUp: {
      entry: () => log.debug("enemyWindingUp"),
      on: {
        // Allow blocking during the enemy's wind-up — this is the player's skill window.
        BLOCK: { actions: "enterBlockingStance" },
        STAND: { actions: "exitBlockingStance" },
        JUMP: { actions: "exitBlockingStance" },
        DUCK: { actions: "exitBlockingStance" },
      },
      after: {
        ENEMY_WINDUP: {
          actions: "resolveEnemyAttack",
          target: "enemyRecovery",
        },
      },
    },

    enemyRecovery: {
      entry: () => log.debug("enemyRecovery"),
      // Check immediately on entry whether the attack killed the hero.
      always: [
        {
          guard: "heroDead",
          actions: "emitDuelLost",
          target: "heroDied",
        },
      ],
      after: {
        ENEMY_RECOVERY: "idle",
      },
    },

    enemyDefeated: {
      type: "final",
      entry: () => log.debug("enemyDefeated"),
    },

    heroDied: {
      type: "final",
      entry: () => log.debug("heroDied"),
    },
  },
});
