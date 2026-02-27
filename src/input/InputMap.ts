import { GameAction } from "./types";
import type { InputMap } from "./types";

/**
 * Default key bindings. Sprint (D) and SlowDown (A) share keys with MoveRight/MoveLeft;
 * the game loop decides which semantic applies based on the active phase (traversal vs duel).
 */
export const DEFAULT_INPUT_MAP: InputMap = {
  [GameAction.MoveLeft]: ["a", "ArrowLeft"],
  [GameAction.MoveRight]: ["d", "ArrowRight"],
  [GameAction.Jump]: ["w", "ArrowUp", " "],
  [GameAction.Duck]: ["s", "ArrowDown"],
  [GameAction.Sprint]: ["d"],
  [GameAction.SlowDown]: ["a"],
  [GameAction.Attack]: [0], // Left mouse button
  [GameAction.Defend]: [2], // Right mouse button
  [GameAction.Special]: [" "],
} as const satisfies InputMap;
