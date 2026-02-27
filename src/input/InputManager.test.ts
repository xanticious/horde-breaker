import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InputManager } from "./InputManager";
import { GameAction } from "./types";
import type { InputMap } from "./types";

// Minimal input map used in tests to keep things focused.
const TEST_MAP: InputMap = {
  [GameAction.MoveLeft]: ["ArrowLeft", "a"],
  [GameAction.MoveRight]: ["ArrowRight", "d"],
  [GameAction.Jump]: ["w", " "],
  [GameAction.Duck]: ["s", "ArrowDown"],
  [GameAction.Sprint]: ["Shift"],
  [GameAction.SlowDown]: ["Control"],
  [GameAction.Attack]: [0], // left mouse button
  [GameAction.Defend]: [2], // right mouse button
  [GameAction.Special]: ["q"],
} as const satisfies InputMap;

/** Fire a synthetic DOM event via dispatchEvent. */
function fire(type: string, init: KeyboardEventInit | MouseEventInit) {
  if (type === "keydown" || type === "keyup") {
    window.dispatchEvent(new KeyboardEvent(type, init as KeyboardEventInit));
  } else {
    window.dispatchEvent(new MouseEvent(type, init as MouseEventInit));
  }
}

describe("InputManager", () => {
  let manager: InputManager;

  beforeEach(() => {
    manager = new InputManager(TEST_MAP);
  });

  afterEach(() => {
    manager.destroy();
  });

  // ── Construction ──────────────────────────────────────────────────────────

  it("starts with no active actions", () => {
    const { actions } = manager.getSnapshot();
    expect(actions.size).toBe(0);
  });

  it("starts with mouse position at origin", () => {
    const { mousePosition } = manager.getSnapshot();
    expect(mousePosition).toEqual({ x: 0, y: 0 });
  });

  // ── Keyboard ──────────────────────────────────────────────────────────────

  it("activates MoveLeft when ArrowLeft is held", () => {
    fire("keydown", { key: "ArrowLeft" });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.MoveLeft)).toBe(true);
  });

  it("activates MoveLeft via alias key (a)", () => {
    fire("keydown", { key: "a" });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.MoveLeft)).toBe(true);
  });

  it("activates Jump via w key", () => {
    fire("keydown", { key: "w" });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Jump)).toBe(true);
  });

  it("activates Jump via Space key", () => {
    fire("keydown", { key: " " });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Jump)).toBe(true);
  });

  it("deactivates action when key is released", () => {
    fire("keydown", { key: "ArrowLeft" });
    fire("keyup", { key: "ArrowLeft" });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.MoveLeft)).toBe(false);
  });

  it("can hold multiple keys simultaneously", () => {
    fire("keydown", { key: "ArrowLeft" });
    fire("keydown", { key: "w" });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.MoveLeft)).toBe(true);
    expect(actions.has(GameAction.Jump)).toBe(true);
  });

  it("does not activate actions for unbound keys", () => {
    fire("keydown", { key: "z" });
    const { actions } = manager.getSnapshot();
    expect(actions.size).toBe(0);
  });

  // ── Mouse buttons ─────────────────────────────────────────────────────────

  it("activates Attack on left mouse button (0)", () => {
    fire("mousedown", { button: 0 });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Attack)).toBe(true);
  });

  it("activates Defend on right mouse button (2)", () => {
    fire("mousedown", { button: 2 });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Defend)).toBe(true);
  });

  it("deactivates mouse button action on mouseup", () => {
    fire("mousedown", { button: 0 });
    fire("mouseup", { button: 0 });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Attack)).toBe(false);
  });

  // ── Mouse position ────────────────────────────────────────────────────────

  it("tracks mouse position from mousemove events", () => {
    fire("mousemove", { clientX: 400, clientY: 300 });
    const { mousePosition } = manager.getSnapshot();
    expect(mousePosition).toEqual({ x: 400, y: 300 });
  });

  it("returns a copy of mouse position (not mutable reference)", () => {
    fire("mousemove", { clientX: 100, clientY: 200 });
    const snap1 = manager.getSnapshot();
    fire("mousemove", { clientX: 999, clientY: 888 });
    // snap1.mousePosition should not have changed
    expect(snap1.mousePosition).toEqual({ x: 100, y: 200 });
  });

  // ── Context menu prevention ───────────────────────────────────────────────

  it("prevents context menu default", () => {
    const event = new MouseEvent("contextmenu", { cancelable: true });
    const preventDefault = vi.spyOn(event, "preventDefault");
    window.dispatchEvent(event);
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  // ── endFrame ──────────────────────────────────────────────────────────────

  it("endFrame does not clear held keys (held-key model)", () => {
    fire("keydown", { key: "w" });
    manager.endFrame();
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Jump)).toBe(true);
  });

  // ── destroy ───────────────────────────────────────────────────────────────

  it("destroy removes keydown listener so keys no longer register", () => {
    manager.destroy();
    fire("keydown", { key: "w" });
    // Construct a fresh manager to confirm the OLD one is deaf.
    // We can verify by re-creating with the same backing instance — after
    // destroy the internal keysDown will not be touched by later events.
    const { actions } = manager.getSnapshot();
    // No keys had been pressed before destroy, and the post-destroy keydown
    // should be ignored, so snapshot is still empty.
    expect(actions.has(GameAction.Jump)).toBe(false);
  });

  it("destroy removes mousedown listener so mouse buttons no longer register", () => {
    manager.destroy();
    fire("mousedown", { button: 0 });
    const { actions } = manager.getSnapshot();
    expect(actions.has(GameAction.Attack)).toBe(false);
  });
});
