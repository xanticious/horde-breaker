import { HeroId, type HeroDefinition } from "@core/types/hero";

// ── Barbarian hero data ───────────────────────────────────────────────────────
//
// All balance values live here — tweak this file to adjust the Barbarian's feel
// without touching game-logic code.

export const BARBARIAN_HERO = {
  id: HeroId.Barbarian,
  name: "Barbarian Berzerker",
  description: "Melee axe swings. Block enemy attacks. Leap to strike.",
  setting: "Highland Barbarian",

  baseStats: {
    maxHp: 100,
    armor: 0,
    runSpeed: 320,
    damageMultiplier: 1,
    attackSpeed: 1,
  },

  upgradeCategories: [
    {
      id: "maxHealth",
      name: "Max Health",
      costs: [18, 40, 100, 220, 450],
      effectPerLevel: [100, 125, 155, 190, 230, 275],
    },
    {
      id: "armor",
      name: "Armour",
      costs: [18, 40, 100, 220, 450],
      // Fraction of incoming damage negated (0–0.4 over 6 levels)
      effectPerLevel: [0, 0.06, 0.12, 0.2, 0.3, 0.4],
    },
    {
      id: "runSpeed",
      name: "Run Speed",
      costs: [18, 40, 100, 220, 450],
      effectPerLevel: [320, 352, 390, 435, 485, 540],
    },
    {
      id: "damageMultiplier",
      name: "Axe Damage",
      costs: [18, 40, 100, 220, 450],
      effectPerLevel: [1, 1.2, 1.45, 1.75, 2.1, 2.5],
    },
    {
      id: "attackSpeed",
      name: "Attack Speed",
      costs: [18, 40, 100, 220, 450],
      // Lower = faster animation (1 = base speed, 0.6 = 40% faster at max)
      effectPerLevel: [1, 0.92, 0.84, 0.76, 0.68, 0.6],
    },
    {
      id: "special",
      name: "Leap Attack",
      costs: [18, 40, 100, 220, 450],
      // Extra damage added to the leap attack hit
      effectPerLevel: [0, 5, 12, 22, 35, 50],
    },
  ],

  abilities: {
    primary: {
      id: "axeSwing",
      name: "Axe Swing",
      description: "A powerful horizontal axe strike.",
      animationKey: "attack",
      baseDamage: 15,
      cooldownMs: 0,
    },
    defensive: {
      id: "block",
      name: "Block",
      description: "Raise your axe to deflect incoming attacks.",
      animationKey: "block",
      baseDamage: 0,
      cooldownMs: 0,
    },
    special: {
      id: "leapAttack",
      name: "Leap Attack",
      description: "Leap forward and bring down your axe with full force.",
      animationKey: "leap",
      baseDamage: 30,
      cooldownMs: 8_000,
    },
  },

  assets: {
    musicTrackId: "barbarian-theme",
    spritesheets: [
      "sprites/heroes/barbarian/idle.json",
      "sprites/heroes/barbarian/attack.json",
      "sprites/heroes/barbarian/block.json",
      "sprites/heroes/barbarian/leap.json",
      "sprites/heroes/barbarian/hurt.json",
      "sprites/heroes/barbarian/death.json",
      "sprites/heroes/barbarian/run.json",
    ],
    backgrounds: [
      "backgrounds/barbarian/layer-sky.png",
      "backgrounds/barbarian/layer-mountains.png",
      "backgrounds/barbarian/layer-trees.png",
      "backgrounds/barbarian/layer-ground.png",
    ],
  },
} as const satisfies HeroDefinition;
