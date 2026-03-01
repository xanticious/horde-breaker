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

/** Default X position for the first (front) enemy in the duel arena. */
const DEFAULT_ENEMY_X = 620;

/**
 * Pixel spacing between consecutive enemies when multiple are present.
 * Enemies line up left-to-right — front enemy is closest to the hero.
 */
const ENEMY_SPACING = 200;

/** Hero lock-out duration (ms) after an attack resolves. */
const HERO_RECOVERY_MS = 300;

/**
 * How long the enemy waits in the idle state before deciding its next action.
 * Long enough to let the hero act first, short enough to stay threatening.
 */
const ENEMY_THINK_MS = 1200;

/**
 * Block timing model: any block pressed during the enemy's wind-up counts as
 * a "regular" block (not a perfect block). REGULAR_BLOCK_TIMING_MS exceeds
 * PERFECT_BLOCK_WINDOW_MS so calculateBlockResult returns a normal block.
 */
const PERFECT_BLOCK_WINDOW_MS = 200;
const REGULAR_BLOCK_TIMING_MS = PERFECT_BLOCK_WINDOW_MS + 1;

/**
 * Action types that deal damage to the hero when they resolve.
 * Non-damaging actions (wait, retreat) skip damage calculation.
 */
const DAMAGING_ACTIONS = new Set<string>(["pounce", "slash", "shieldBash"]);

// ── Per-enemy runtime state ───────────────────────────────────────────────────

/**
 * Runtime state for a single enemy in a multi-enemy encounter.
 * Each enemy tracks its own HP, position, behavior, and shield state.
 */
export interface DuelEnemyState {
  id: EnemyId;
  hp: number;
  maxHp: number;
  damage: number;
  /** X position in design-space pixels (1920-wide reference frame). */
  x: number;
  behavior: IEnemyBehavior;
  /** Action the enemy is currently committed to (set on each AI decision). */
  currentAction: EnemyAction;
  /**
   * Current armor reduction applied to hero attacks landing on this enemy.
   * Normally equals `baseArmorReduction`; zeroed during recovery (shield down).
   */
  currentArmorReduction: number;
  /**
   * Baseline armor restored when this enemy returns to idle.
   * Shielded enemies like the Shieldbearer pass > 0 here.
   */
  baseArmorReduction: number;
}

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
  /** Optional X position override. Defaults to DEFAULT_ENEMY_X + index * ENEMY_SPACING. */
  x?: number;
  /**
   * Passive armor reduction while the enemy's shield is up (0–1).
   * Only relevant for shielded enemies such as the Shieldbearer. Defaults to 0.
   */
  baseArmorReduction?: number;
}

export interface DuelInput {
  hero: DuelHeroInput;
  /**
   * Ordered list of enemies in this encounter (front-to-back).
   * The hero always targets enemies[activeEnemyIndex].
   * The front enemy (index 0) must be defeated before index 1 becomes active.
   */
  enemies: DuelEnemyInput[];
  /** Override the hero's starting X coordinate (defaults to DEFAULT_HERO_X). */
  heroX?: number;
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
  /** All enemies in this encounter, ordered front-to-back. */
  enemies: DuelEnemyState[];
  /** Index of the enemy currently being fought. Advances when an enemy is defeated. */
  activeEnemyIndex: number;
  /** Cumulative damage dealt by the hero across all defeated enemies. */
  totalDamageDealt: number;
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
  /** Fired once when all enemies' HP reaches zero. */
  | { type: "DUEL_WON"; damageDealt: number }
  /** Fired once when the hero's HP reaches zero. */
  | { type: "DUEL_LOST" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shorthand accessor for the currently active enemy in the context. */
function activeEnemy(context: DuelContext): DuelEnemyState {
  // activeEnemyIndex is always valid when used during active combat states.
  return context.enemies[context.activeEnemyIndex]!;
}

function makeDuelSnapshot(context: DuelContext, phase: DuelState["phase"]): DuelState {
  const enemy = activeEnemy(context);
  return {
    heroX: context.heroX,
    enemyX: enemy.x,
    heroHp: context.heroHp,
    maxHeroHp: context.heroMaxHp,
    enemyHp: enemy.hp,
    maxEnemyHp: enemy.maxHp,
    phase,
  };
}

/** Produce an updated `enemies` array with one element replaced. */
function replaceEnemy(
  enemies: DuelEnemyState[],
  index: number,
  next: DuelEnemyState,
): DuelEnemyState[] {
  const arr = [...enemies];
  arr[index] = next;
  return arr;
}

// ── Machine ───────────────────────────────────────────────────────────────────

/**
 * Combat encounter between the hero and one or more enemies (front-to-back).
 *
 * Multi-enemy flow:
 *   - Hero always targets `enemies[activeEnemyIndex]`.
 *   - When that enemy's HP reaches 0, `activeEnemyIndex` advances.
 *   - When all enemies are defeated (index ≥ enemies.length) → `enemyDefeated`.
 *
 * Shield mechanic:
 *   - Enemies with `baseArmorReduction > 0` (e.g. Shieldbearer) resist hero
 *     attacks while their `currentArmorReduction` is positive.
 *   - `currentArmorReduction` is zeroed on entering `enemyRecovery` (shield
 *     drops after any attack) and restored to `baseArmorReduction` on re-entry
 *     to `idle` — giving the player a clear punish window after each enemy attack.
 *
 * Combat is commitment-based: input is ignored while hero or enemy is mid-action.
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
    ENEMY_WINDUP: ({ context }: { context: DuelContext }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      return enemy ? enemy.behavior.getWindUpDuration(enemy.currentAction) : 0;
    },
    /** Enemy recovery duration is determined by the behavior strategy. */
    ENEMY_RECOVERY: ({ context }: { context: DuelContext }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      return enemy ? enemy.behavior.getRecoveryDuration(enemy.currentAction) : 0;
    },
    /** Gap between enemy action decisions when neither side is acting. */
    ENEMY_THINK: ENEMY_THINK_MS,
  },
  actions: {
    enterBlockingStance: assign({ heroStance: "blocking" as DuelHeroStance }),
    exitBlockingStance: assign({ heroStance: "neutral" as DuelHeroStance }),

    decideEnemyAction: assign(({ context }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      if (!enemy) return {};
      const action = enemy.behavior.decideAction(makeDuelSnapshot(context, "idle"), context.rng);
      return {
        enemies: replaceEnemy(context.enemies, context.activeEnemyIndex, {
          ...enemy,
          currentAction: action,
        }),
      };
    }),

    resolveHeroAttack: assign(({ context }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      if (!enemy) return {};

      const damage = calculateDamage({
        baseDamage: context.heroDamage,
        damageMultiplier: 1,
        stanceMultiplier: 1,
        // Use the active enemy's current armor (0 when shield is down).
        armorReduction: enemy.currentArmorReduction,
        criticalHit: false,
      });
      const newHp = applyDamage(enemy.hp, damage, enemy.maxHp);
      log.debug(
        `Hero attack → enemy[${context.activeEnemyIndex}] ${enemy.hp}→${newHp} HP (${damage} dmg)`,
      );

      const updatedEnemies = replaceEnemy(context.enemies, context.activeEnemyIndex, {
        ...enemy,
        hp: newHp,
      });

      // Advance to the next enemy immediately if this one was just killed, so
      // the allEnemiesDefeated guard checks the correct state in heroRecovery.
      let newIndex = context.activeEnemyIndex;
      if (!isAlive(newHp) && context.activeEnemyIndex + 1 < context.enemies.length) {
        newIndex = context.activeEnemyIndex + 1;
        log.debug(`Enemy[${context.activeEnemyIndex}] defeated — advancing to enemy[${newIndex}]`);
      }

      return {
        enemies: updatedEnemies,
        activeEnemyIndex: newIndex,
        totalDamageDealt: context.totalDamageDealt + damage,
      };
    }),

    resolveEnemyAttack: assign(({ context }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      if (!enemy) return {};

      // Non-damaging actions skip damage resolution entirely.
      if (!DAMAGING_ACTIONS.has(enemy.currentAction.type)) {
        return {};
      }

      let damage: number;
      if (context.heroStance === "blocking") {
        // Any block pressed during wind-up counts as a regular block.
        const result = calculateBlockResult(
          enemy.damage,
          REGULAR_BLOCK_TIMING_MS,
          PERFECT_BLOCK_WINDOW_MS,
        );
        damage = result.damage;
        log.debug(`Hero blocked ${enemy.currentAction.type}: ${enemy.damage}→${damage} dmg`);
      } else {
        damage = calculateDamage({
          baseDamage: enemy.damage,
          damageMultiplier: 1,
          stanceMultiplier: 1,
          armorReduction: context.heroArmor,
          criticalHit: false,
        });
        log.debug(`Hero takes ${enemy.currentAction.type} hit: ${damage} dmg`);
      }

      const newHp = applyDamage(context.heroHp, damage, context.heroMaxHp);
      return { heroHp: newHp };
    }),

    /**
     * Zero the active enemy's armor on entering recovery — the shield is down
     * during the post-attack vulnerable window.
     */
    setEnemyVulnerable: assign(({ context }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      if (!enemy || enemy.baseArmorReduction === 0) return {};
      return {
        enemies: replaceEnemy(context.enemies, context.activeEnemyIndex, {
          ...enemy,
          currentArmorReduction: 0,
        }),
      };
    }),

    /**
     * Restore the active enemy's armor on returning to idle — shield goes back up.
     */
    restoreEnemyArmor: assign(({ context }) => {
      const enemy = context.enemies[context.activeEnemyIndex];
      if (!enemy || enemy.currentArmorReduction === enemy.baseArmorReduction) return {};
      return {
        enemies: replaceEnemy(context.enemies, context.activeEnemyIndex, {
          ...enemy,
          currentArmorReduction: enemy.baseArmorReduction,
        }),
      };
    }),

    emitDuelWon: emit(({ context }: { context: DuelContext }) => ({
      type: "DUEL_WON" as const,
      damageDealt: context.totalDamageDealt,
    })),

    emitDuelLost: emit({ type: "DUEL_LOST" as const }),
  },
  guards: {
    /** True when all enemies in the encounter have been defeated. */
    allEnemiesDefeated: ({ context }) => context.enemies.every((e) => !isAlive(e.hp)),
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
    enemies: input.enemies.map((e, i) => ({
      id: e.id,
      hp: e.hp,
      maxHp: e.hp,
      damage: e.damage,
      x: e.x ?? DEFAULT_ENEMY_X + i * ENEMY_SPACING,
      behavior: e.behavior,
      currentAction: { type: "wait" } as EnemyAction,
      currentArmorReduction: e.baseArmorReduction ?? 0,
      baseArmorReduction: e.baseArmorReduction ?? 0,
    })),
    activeEnemyIndex: 0,
    totalDamageDealt: 0,
    rng: input.rng ?? Math.random,
  }),
  states: {
    idle: {
      entry: ["restoreEnemyArmor", () => log.debug("idle")],
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
          actions: assign(({ context }) => {
            const enemy = context.enemies[context.activeEnemyIndex];
            const cap = enemy ? enemy.x - 100 : context.heroX;
            return { heroX: Math.min(cap, context.heroX + 80) };
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
      // Check on entry whether all enemies are now defeated.
      always: [
        {
          guard: "allEnemiesDefeated",
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
      // Shield drops on entering recovery — zero armor until enemy returns to idle.
      entry: ["setEnemyVulnerable", () => log.debug("enemyRecovery")],
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
