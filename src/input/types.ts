// ── Game Actions ─────────────────────────────────────────────────────────────

/**
 * Abstract game actions — independent of physical key bindings.
 * The InputMap connects each action to one or more keyboard keys or mouse buttons.
 */
export enum GameAction {
  MoveLeft = "moveLeft",
  MoveRight = "moveRight",
  Jump = "jump",
  Duck = "duck",
  Sprint = "sprint",
  SlowDown = "slowDown",
  Attack = "attack",
  Defend = "defend",
  Special = "special",
}

// ── Input snapshot ────────────────────────────────────────────────────────────

/** Read-once snapshot of all active game actions for a single frame. */
export interface InputSnapshot {
  /** The set of actions currently held down this frame. */
  actions: ReadonlySet<GameAction>;
  /** Current mouse cursor position in canvas-local coordinates. */
  mousePosition: { x: number; y: number };
}

// ── Input map ─────────────────────────────────────────────────────────────────

/**
 * Maps each GameAction to one or more key identifiers.
 * String values match `KeyboardEvent.key`; numbers match `MouseEvent.button`.
 */
export type InputMap = Readonly<Record<GameAction, ReadonlyArray<string | number>>>;
