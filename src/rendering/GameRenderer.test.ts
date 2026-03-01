import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameRenderer } from "./GameRenderer";

// TraversalScene uses PixiJS GPU APIs that jsdom cannot provide; mock the whole
// module so GameRenderer tests remain focused on lifecycle behaviour.
vi.mock("./scenes/TraversalScene", () => {
  const TraversalScene = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.container = { destroy: vi.fn(), visible: true };
    this.update = vi.fn();
    this.destroy = vi.fn();
  });
  return { TraversalScene };
});

// DuelScene similarly requires GPU APIs.
vi.mock("./scenes/DuelScene", () => {
  const DuelScene = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.container = { destroy: vi.fn(), visible: true };
    this.update = vi.fn();
    this.destroy = vi.fn();
  });
  return { DuelScene };
});

// Also mock the data import that GameRenderer pulls in so tests need no real
// hero data; the default runSpeed of 320 is fine but the mock avoids module
// resolution issues in the test environment.
vi.mock("@data/heroes/barbarian.data", () => ({
  BARBARIAN_HERO: { baseStats: { runSpeed: 320 } },
}));

// PixiJS requires a real GPU/canvas context which jsdom cannot provide.
// Mock the entire module so lifecycle tests run in the Vitest environment.
// Using regular function constructors (not arrow functions) so `new Application()` works.
vi.mock("pixi.js", () => {
  const Application = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.ticker = { add: vi.fn(), remove: vi.fn() };
    this.stage = { addChild: vi.fn(), removeChild: vi.fn() };
    this.screen = { width: 800, height: 600 };
    this.canvas = document.createElement("canvas");
    this.init = vi.fn().mockResolvedValue(undefined);
    this.destroy = vi.fn();
  });

  const Graphics = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.rect = vi.fn().mockReturnThis();
    this.fill = vi.fn().mockReturnThis();
    this.pivot = { set: vi.fn() };
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
  });

  const Container = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.addChild = vi.fn();
  });

  return { Application, Graphics, Container };
});

// Helper: create a minimal HTMLElement acting as the canvas parent
function createParent(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

describe("GameRenderer", () => {
  let renderer: GameRenderer;

  beforeEach(() => {
    renderer = new GameRenderer();
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // init()
  // ---------------------------------------------------------------------------

  it("init() resolves without throwing", async () => {
    const parent = createParent();
    await expect(renderer.init(parent)).resolves.toBeUndefined();
  });

  it("init() appends a canvas element to the parent", async () => {
    const parent = createParent();
    await renderer.init(parent);
    // PixiJS appends app.canvas to the parent during init
    expect(parent.contains(parent.querySelector("canvas"))).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // startGameLoop()
  // ---------------------------------------------------------------------------

  it("startGameLoop() is a no-op before init() completes", () => {
    // Should not throw even though app is null
    expect(() => renderer.startGameLoop(vi.fn())).not.toThrow();
  });

  it("startGameLoop() forwards deltaMS to the onUpdate callback", async () => {
    const { Application } = await import("pixi.js");
    const parent = createParent();
    await renderer.init(parent);

    const onUpdate = vi.fn();
    renderer.startGameLoop(onUpdate);

    // Retrieve the ticker from the Application instance that GameRenderer created
    const appInstance = vi.mocked(Application).mock.instances[0] as unknown as {
      ticker: { add: ReturnType<typeof vi.fn> };
    };
    const tickerAddCalls = appInstance.ticker.add.mock.calls;
    // The last ticker.add call is the game-loop callback registered by startGameLoop
    const loopCb = tickerAddCalls[tickerAddCalls.length - 1][0] as (t: { deltaMS: number }) => void;
    loopCb({ deltaMS: 16.67 });

    expect(onUpdate).toHaveBeenCalledWith(16.67);
  });

  // ---------------------------------------------------------------------------
  // destroy()
  // ---------------------------------------------------------------------------

  it("destroy() does not throw after a successful init", async () => {
    const parent = createParent();
    await renderer.init(parent);
    expect(() => renderer.destroy()).not.toThrow();
  });

  it("destroy() is safe to call before init() resolves (fast unmount)", () => {
    // Renderer was never init'd — destroy() should short-circuit cleanly
    expect(() => renderer.destroy()).not.toThrow();
  });

  it("destroy() called concurrently with init() does not crash (race condition)", async () => {
    // Simulates React StrictMode or a very fast unmount where the cleanup
    // effect fires before the async PixiJS Application.init() promise resolves.
    // Previously this caused "this._cancelResize is not a function" because
    // this.app was assigned immediately (before await) and destroy() received
    // a partially-initialised Application.
    const parent = createParent();
    const initPromise = renderer.init(parent);
    // Call destroy() immediately — init() is still awaiting app.init()
    renderer.destroy();
    // Await init to let any async cleanup inside the init path run
    await expect(initPromise).resolves.toBeUndefined();
    // A second destroy() must still be safe (idempotent)
    expect(() => renderer.destroy()).not.toThrow();
  });

  it("destroy() removes the ticker callback after startGameLoop", async () => {
    const { Application } = await import("pixi.js");
    const parent = createParent();
    await renderer.init(parent);
    renderer.startGameLoop(vi.fn());

    const appInstance = vi.mocked(Application).mock.instances[0] as unknown as {
      ticker: { remove: ReturnType<typeof vi.fn> };
    };

    renderer.destroy();
    expect(appInstance.ticker.remove).toHaveBeenCalled();
  });

  it("destroy() calls app.destroy() to free GPU resources", async () => {
    const { Application } = await import("pixi.js");
    const parent = createParent();
    await renderer.init(parent);

    const appInstance = vi.mocked(Application).mock.instances[0] as unknown as {
      destroy: ReturnType<typeof vi.fn>;
    };

    renderer.destroy();
    expect(appInstance.destroy).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // setMode() / setDuelContext()
  // ---------------------------------------------------------------------------

  it("setMode('traversal') does not throw before init", () => {
    expect(() => renderer.setMode("traversal")).not.toThrow();
  });

  it("setMode('duel') with context does not throw before init", () => {
    const mockCtx = { enemyId: "wolf", enemyHp: 40, enemyMaxHp: 40 };
    expect(() =>
      renderer.setMode("duel", mockCtx as Parameters<typeof renderer.setMode>[1]),
    ).not.toThrow();
  });

  it("setDuelContext() does not throw", () => {
    const mockCtx = { enemyId: "wolf", enemyHp: 40, enemyMaxHp: 40 };
    expect(() =>
      renderer.setDuelContext(mockCtx as Parameters<typeof renderer.setDuelContext>[0], "idle"),
    ).not.toThrow();
  });
});
