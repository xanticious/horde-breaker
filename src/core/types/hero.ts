import type { UpgradeCategoryData } from "./upgrade";

// ── Hero identity ──────────────────────────────────────────────────────────────

export enum HeroId {
  Barbarian = "barbarian",
}

// ── Hero stats ───────────────────────────────────────────────────────────────

/** Unmodified stats baked into the hero data file. */
export interface HeroBaseStats {
  maxHp: number;
  /** Fraction of incoming damage negated by armour (0–1). */
  armor: number;
  /** Pixels per second at design resolution. */
  runSpeed: number;
  /** Base damage multiplier (1 = no bonus). */
  damageMultiplier: number;
  /** Animation duration multiplier (lower = faster swings). */
  attackSpeed: number;
}

/** Stats after upgrade bonuses are applied — computed at run start. */
export interface DerivedHeroStats {
  maxHp: number;
  armor: number;
  runSpeed: number;
  damageMultiplier: number;
  attackSpeed: number;
  specialAbility: SpecialAbilityStats;
}

export interface SpecialAbilityStats {
  /** Damage carried by the special ability hit. */
  damage: number;
  /** Cooldown in milliseconds before the ability can be used again. */
  cooldownMs: number;
  /** Duration of the ability animation in milliseconds. */
  durationMs: number;
}

// ── Ability definitions ───────────────────────────────────────────────────────

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  /** Animation key to play on use. */
  animationKey: string;
  /** Base damage dealt by this ability (0 = none). */
  baseDamage: number;
  /** Cooldown in milliseconds (0 = no cooldown). */
  cooldownMs: number;
}

// ── Asset references ────────────────────────────────────────────────────────────

/** Paths to the hero's spritesheet JSON manifests (relative to assets/). */
export interface HeroAssetManifest {
  /** Music track ID used for this hero's runs. */
  musicTrackId: string;
  /** Paths to all spritesheet JSON files that must be loaded. */
  spritesheets: readonly string[];
  /** Paths to parallax background layer images (sky → ground). */
  backgrounds: readonly string[];
}

// ── Hero definition ─────────────────────────────────────────────────────────────

/** Complete static definition of a hero — lives in data files, never mutated. */
export interface HeroDefinition {
  id: HeroId;
  name: string;
  /** Short flavour description shown on the hero-select screen. */
  description: string;
  /** Thematic world/setting name (e.g. “Highland Barbarian”). */
  setting: string;
  baseStats: HeroBaseStats;
  /** Ordered list of upgrade rows displayed in the upgrade grid. */
  upgradeCategories: UpgradeCategoryData[];
  abilities: {
    /** Primary attack — Left Mouse Button. */
    primary: AbilityDefinition;
    /** Defensive ability — Right Mouse Button. */
    defensive: AbilityDefinition;
    /** Special ability — Spacebar. */
    special: AbilityDefinition;
  };
  assets: HeroAssetManifest;
}
