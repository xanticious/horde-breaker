import { EnemyId, type EnemyDefinition } from "@core/types/enemy";

// ── Barbarian enemy roster ────────────────────────────────────────────────────
//
// Seven enemies for the Barbarian's three chapters. Each enemy has base stats
// and a reference to its AI behavior strategy.

export const BARBARIAN_ENEMIES = {
  [EnemyId.Wolf]: {
    id: EnemyId.Wolf,
    name: "Highland Wolf",
    baseHp: 40,
    baseDamage: 8,
    range: 120,
    behavior: "wolf",
    animations: {
      idle: "wolf-idle",
      walk: "wolf-walk",
      attack: "wolf-pounce",
      hurt: "wolf-hurt",
      death: "wolf-death",
    },
    lootValue: 25,
  },

  [EnemyId.Swordsman]: {
    id: EnemyId.Swordsman,
    name: "Highland Swordsman",
    baseHp: 60,
    baseDamage: 12,
    range: 140,
    behavior: "swordsman",
    animations: {
      idle: "swordsman-idle",
      walk: "swordsman-walk",
      attack: "swordsman-slash",
      hurt: "swordsman-hurt",
      death: "swordsman-death",
    },
    lootValue: 35,
  },

  [EnemyId.Shieldbearer]: {
    id: EnemyId.Shieldbearer,
    name: "Shieldbearer",
    baseHp: 80,
    baseDamage: 10,
    range: 130,
    behavior: "shieldbearer",
    animations: {
      idle: "shieldbearer-idle",
      walk: "shieldbearer-walk",
      attack: "shieldbearer-bash",
      hurt: "shieldbearer-hurt",
      death: "shieldbearer-death",
      block: "shieldbearer-block",
    },
    lootValue: 40,
  },

  [EnemyId.HighlandArcher]: {
    id: EnemyId.HighlandArcher,
    name: "Highland Archer",
    baseHp: 55,
    baseDamage: 14,
    // Ranged: attacks from long distance
    range: 600,
    behavior: "highlandArcher",
    animations: {
      idle: "archer-idle",
      walk: "archer-walk",
      attack: "archer-shoot",
      hurt: "archer-hurt",
      death: "archer-death",
    },
    lootValue: 45,
  },

  [EnemyId.Pikeman]: {
    id: EnemyId.Pikeman,
    name: "Pikeman",
    baseHp: 70,
    baseDamage: 16,
    range: 220,
    behavior: "pikeman",
    animations: {
      idle: "pikeman-idle",
      walk: "pikeman-walk",
      attack: "pikeman-thrust",
      hurt: "pikeman-hurt",
      death: "pikeman-death",
    },
    lootValue: 50,
  },

  [EnemyId.Berserker]: {
    id: EnemyId.Berserker,
    name: "Berserker",
    baseHp: 90,
    baseDamage: 22,
    range: 150,
    behavior: "berserker",
    animations: {
      idle: "berserker-idle",
      walk: "berserker-walk",
      attack: "berserker-slash",
      hurt: "berserker-hurt",
      death: "berserker-death",
    },
    lootValue: 60,
  },

  [EnemyId.WarHoundHandler]: {
    id: EnemyId.WarHoundHandler,
    name: "War Hound Handler",
    baseHp: 75,
    baseDamage: 18,
    range: 160,
    behavior: "warHoundHandler",
    animations: {
      idle: "handler-idle",
      walk: "handler-walk",
      attack: "handler-command",
      hurt: "handler-hurt",
      death: "handler-death",
    },
    lootValue: 55,
  },
} as const satisfies Record<EnemyId, EnemyDefinition>;
