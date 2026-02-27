import type { GameAction } from "./types";
import type { InputMap, InputSnapshot } from "./types";
import { DEFAULT_INPUT_MAP } from "./InputMap";

/**
 * Polls raw keyboard and mouse state each frame.
 * The InputManager does NOT send events to XState directly — callers read an
 * `InputSnapshot` at the start of each frame and translate it to machine events.
 *
 * Usage:
 *   const input = new InputManager();
 *   // every frame:
 *   const snapshot = input.getSnapshot();
 *   // send relevant events to active machine...
 *   input.endFrame();
 *   // on cleanup:
 *   input.destroy();
 */
export class InputManager {
  private readonly keysDown: Set<string> = new Set();
  private readonly mouseButtons: Set<number> = new Set();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private readonly onKeyUp: (e: KeyboardEvent) => void;
  private readonly onMouseDown: (e: MouseEvent) => void;
  private readonly onMouseUp: (e: MouseEvent) => void;
  private readonly onMouseMove: (e: MouseEvent) => void;
  private readonly onContextMenu: (e: Event) => void;

  constructor(private readonly inputMap: InputMap = DEFAULT_INPUT_MAP) {
    // Arrow functions capture `this` so they can be added and removed by reference.
    this.onKeyDown = (e) => this.keysDown.add(e.key);
    this.onKeyUp = (e) => this.keysDown.delete(e.key);
    this.onMouseDown = (e) => this.mouseButtons.add(e.button);
    this.onMouseUp = (e) => this.mouseButtons.delete(e.button);
    this.onMouseMove = (e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
    };
    // Prevent the browser context menu from opening on right-click while in game.
    this.onContextMenu = (e) => e.preventDefault();

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("contextmenu", this.onContextMenu);
  }

  /**
   * Build and return a snapshot of all currently-active game actions.
   * Call this once at the START of each frame before processing input.
   */
  getSnapshot(): InputSnapshot {
    const actions = new Set<GameAction>();

    for (const [action, bindings] of Object.entries(this.inputMap) as Array<
      [GameAction, ReadonlyArray<string | number>]
    >) {
      for (const binding of bindings) {
        const active =
          typeof binding === "string" ? this.keysDown.has(binding) : this.mouseButtons.has(binding);
        if (active) {
          actions.add(action);
          break;
        }
      }
    }

    return { actions, mousePosition: { ...this.mousePosition } };
  }

  /**
   * Call once at the END of each frame to clear transient per-frame state.
   * Currently a no-op since we only track held keys (no "just pressed" tracking
   * at this stage), but kept for forwards-compatibility with Sprint 18 polish.
   */
  endFrame(): void {
    // Just-pressed tracking will be added in Sprint 18.
  }

  /** Remove all event listeners. Call on game teardown. */
  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("contextmenu", this.onContextMenu);
  }
}
