import { EnemyId } from "@core/types/enemy";

// ── Lore data ─────────────────────────────────────────────────────────────────
//
// All player-facing flavour text lives here so writers can update it without
// touching game code. The run machine and results screen read from this data.

/** Death messages shown on the results screen when the hero is killed. */
export const DEATH_MESSAGES = {
  [EnemyId.Wolf]: [
    "The wolf pack claimed another wanderer.",
    "You underestimated the highland wolves.",
    "Swift and merciless. The pack left nothing behind.",
  ],
  [EnemyId.Swordsman]: [
    "A blade in the dark. Honour to the fallen warrior.",
    "Steel and skill. The swordsman was better today.",
    "The highland soldier's discipline proved superior.",
  ],
  [EnemyId.Shieldbearer]: [
    "No opening found. The shield wall held.",
    "Every strike absorbed. The shieldbearer stood firm.",
    "Patience is a weapon. You had none.",
  ],
  [EnemyId.HighlandArcher]: [
    "An arrow from the ridge. You never saw it coming.",
    "The archer's eye was true. Yours was not.",
    "Distance is armour. The archer wore plenty.",
  ],
  [EnemyId.Pikeman]: [
    "The pike's reach proved longer than your axe.",
    "Keep your distance — or don't. Either way, the pike wins.",
    "A disciplined thrust. The pikeman held the pass.",
  ],
  [EnemyId.Berserker]: [
    "Match a berserker's fury or be consumed by it.",
    "Raw rage overcame raw strength.",
    "The berserker fights without fear. Should you have tried?",
  ],
  [EnemyId.WarHoundHandler]: [
    "Hounds and blade together. Too many fronts to cover.",
    "The handler's pack overwhelmed you.",
    "War hounds are trained to kill. Today they succeeded.",
  ],
} as const satisfies Record<EnemyId, readonly string[]>;

/** Victory lines shown when the hero completes a chapter. */
export const VICTORY_LINES = [
  "The path forward is yours.",
  "Blood and glory. Press on, warrior.",
  "They will remember your name.",
  "The highlands bend to your will.",
  "A worthy battle. More await.",
] as const;

/** Boss battle opening lines — displayed when the boss encounter begins. */
export const BOSS_DIALOGUE = {
  [EnemyId.Wolf]: "The alpha wolf steps forward. This one is different.",
  [EnemyId.Swordsman]: "A veteran swordsman blocks your path. His eyes show no fear.",
  [EnemyId.Shieldbearer]: "The champion shieldbearer raises his wall of steel. Let none pass.",
  [EnemyId.HighlandArcher]: "The master archer nocks a black-feathered arrow. Aim carefully.",
  [EnemyId.Pikeman]: "The pike-captain steps out. Every soldier stands aside.",
  [EnemyId.Berserker]: "The warlord's berserker. War paint. Empty eyes. No mercy.",
  [EnemyId.WarHoundHandler]: "The Handler commands a full war pack. Steel meets fang.",
} as const satisfies Record<EnemyId, string>;

/** Generic death messages used when no enemy-specific message is available. */
export const GENERIC_DEATH_MESSAGES = [
  "Fallen, but not forgotten.",
  "The road is hard. Train. Return.",
  "Death is a teacher. Learn from it.",
] as const;
