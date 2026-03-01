import { Application } from "pixi.js";
import { TraversalScene } from "./scenes/TraversalScene";
import { DuelScene } from "./scenes/DuelScene";
import type { TraversalContext, TraversalEvent } from "@core/machines/traversalMachine";
import type { DuelContext } from "@core/machines/duelMachine";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";

export type UpdateCallback = (deltaMs: number) => void;

/** Which scene is currently active in the renderer. */
export type RendererMode = "traversal" | "duel";

/**
 * Wraps PixiJS Application lifecycle.
 * GameScreen owns one instance per mount; destroyed on unmount to prevent leaks.
 */
export class GameRenderer {
  private app: Application | null = null;
  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;
  private traversalScene: TraversalScene | null = null;
  private duelScene: DuelScene | null = null;
  private _mode: RendererMode = "traversal";
  // Latest duel snapshot — updated each frame by callers when in duel mode.
  private _duelContext: DuelContext | null = null;
  private _duelStateName: string = "idle";
  // Tracks whether destroy() was called before init() resolved, so the async
  // init path can detect the stale state and clean up the Application itself.
  private _destroyed = false;

  // Resolves once this instance is fully destroyed (GPU resources freed).
  // Used by GameScreen to serialise React StrictMode double-mount: the second
  // init waits on this promise so the two Application.init() calls never
  // overlap and compete for GPU memory.
  private _resolveDestroyed!: () => void;
  readonly whenDestroyed: Promise<void> = new Promise<void>(
    (res) => (this._resolveDestroyed = res),
  );

  // Standalone traversal context used until RunMachine (Sprint 11) takes over.
  // Drives the parallax scroll and hero placeholder animation.
  private _traversalContext: TraversalContext = {
    speed: BARBARIAN_HERO.baseStats.runSpeed,
    baseSpeed: BARBARIAN_HERO.baseStats.runSpeed,
    heroPosition: 0,
    segmentLength: 100_000, // Effectively infinite for standalone demo
    heroStance: "running",
    obstacles: [],
    currentHp: BARBARIAN_HERO.baseStats.maxHp,
    maxHp: BARBARIAN_HERO.baseStats.maxHp,
    climbRemainingMs: 0,
  };

  /**
   * Replace the renderer's traversal snapshot with the latest machine context.
   * This keeps rendering strictly read-only relative to XState state.
   */
  setTraversalContext(context: TraversalContext): void {
    this._traversalContext = context;
  }

  /**
   * Replace the renderer's duel snapshot with the latest DuelMachine context.
   * Also records the current XState state name for enemy-phase colour mapping.
   */
  setDuelContext(context: DuelContext, stateName: string): void {
    this._duelContext = context;
    this._duelStateName = stateName;
  }

  /**
   * Switch the active scene between traversal and duel.
   *
   * On first switch to "duel" the DuelScene is created using the provided
   * initial context. Switching back to "traversal" hides the duel scene but
   * keeps it alive so it can be reused if another duel starts in the same run.
   * The existing DuelScene is replaced when a new context is supplied so that
   * each new enemy encounter starts fresh.
   */
  setMode(mode: RendererMode, duelContext?: DuelContext): void {
    if (!this.app) {
      // Store the requested mode so init() can honour it if it resolves later.
      this._mode = mode;
      if (duelContext) this._duelContext = duelContext;
      return;
    }

    if (mode === "duel" && duelContext) {
      // Tear down any previous duel scene so enemy HP etc. resets for each encounter.
      if (this.duelScene) {
        this.app.stage.removeChild(this.duelScene.container);
        this.duelScene.destroy();
        this.duelScene = null;
      }
      this._duelContext = duelContext;
      this.duelScene = new DuelScene(this.app, duelContext);
      this.app.stage.addChild(this.duelScene.container);
    }

    // Toggle container visibility — cheaper than addChild/removeChild every frame.
    if (this.traversalScene) {
      this.traversalScene.container.visible = mode === "traversal";
    }
    if (this.duelScene) {
      this.duelScene.container.visible = mode === "duel";
    }

    this._mode = mode;
  }

  /**
   * Async init required by PixiJS 8 — Application.init() must be awaited.
   * Appends the canvas to the provided parent element after init completes.
   *
   * Attempts WebGL first; falls back to canvas renderer if the WebGL context
   * is unavailable or lost (e.g. GPU OOM during React StrictMode double-mount).
   */
  async init(canvasParent: HTMLElement): Promise<void> {
    // Hold in a local variable until init() fully resolves. If destroy() is
    // called while we're awaiting (e.g. React StrictMode double-mount or fast
    // unmount), this.app stays null so destroy()'s early-return guard fires
    // correctly. Assigning this.app before await would let destroy() receive a
    // partially-initialised Application that lacks _cancelResize, crashing.
    const app = new Application();

    const baseOptions = {
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      resizeTo: canvasParent,
    };

    try {
      await app.init({ ...baseOptions, preferWebGLVersion: 2 });
    } catch {
      // WebGL context unavailable or lost (e.g. GPU OOM from concurrent init
      // during React StrictMode double-mount). Fall back to canvas renderer so
      // the game remains functional in degraded mode.
      console.warn("[GameRenderer] WebGL init failed — falling back to canvas renderer.");
      try {
        await app.init({ ...baseOptions, preference: "webgpu" });
      } catch {
        await app.init({ ...baseOptions, preference: "canvas" });
      }
    }

    // If the component unmounted while we were awaiting, clean up immediately
    // and bail — the GameScreen cleanup callback already set this.app to null.
    if (this._destroyed) {
      app.destroy(true, { children: true });
      this._resolveDestroyed();
      return;
    }

    this.app = app;

    // Recover gracefully if the GPU context is lost after init (e.g. device
    // reset, driver crash). Log the event; the game loop will stall harmlessly
    // until the user refreshes.
    this.app.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      console.warn("[GameRenderer] WebGL context lost — rendering paused.");
    });

    canvasParent.appendChild(this.app.canvas);

    // Sprint 7: TraversalScene replaces the Sprint 6 proof-of-life placeholder.
    this.traversalScene = new TraversalScene(app);
    this.app.stage.addChild(this.traversalScene.container);
  }

  /**
   * Accept input-derived traversal events from GameScreen so the standalone
   * traversal context (used before RunMachine in Sprint 11) reflects player input.
   */
  sendTraversalEvent(event: TraversalEvent): void {
    const ctx = this._traversalContext;
    switch (event.type) {
      case "JUMP":
        this._traversalContext = { ...ctx, heroStance: "jumping" };
        break;
      case "DUCK":
        this._traversalContext = { ...ctx, heroStance: "ducking" };
        break;
      case "STAND":
        // Only reset if not locked into climbing
        if (ctx.heroStance !== "climbing") {
          this._traversalContext = { ...ctx, heroStance: "running" };
        }
        break;
      case "SPRINT":
        this._traversalContext = {
          ...ctx,
          heroStance: "sprinting",
          speed: ctx.baseSpeed * 1.5,
        };
        break;
      case "SLOW":
        this._traversalContext = {
          ...ctx,
          heroStance: "running",
          speed: ctx.baseSpeed * 0.6,
        };
        break;
      case "TICK":
        // TICK is driven by the game loop internally — callers shouldn't send it.
        break;
    }
  }

  /**
   * Registers an update callback that fires every frame via the PixiJS ticker.
   * The callback receives deltaMs and the renderer drives the TraversalScene
   * from its own internal state until RunMachine (Sprint 11) takes over.
   * Must be called after init() resolves.
   */
  startGameLoop(onUpdate: UpdateCallback): void {
    if (!this.app) return;

    this.tickerCallback = (ticker) => {
      const deltaMs = ticker.deltaMS;

      if (this._mode === "traversal") {
        // Render from the latest traversal snapshot. The machine remains the
        // source of truth; rendering never mutates traversal state directly.
        if (this.traversalScene && this.app) {
          this.traversalScene.update(
            this._traversalContext,
            deltaMs,
            this.app.screen.width,
            this.app.screen.height,
          );
        }
      } else if (this._mode === "duel") {
        if (this.duelScene && this._duelContext && this.app) {
          this.duelScene.update(
            this._duelContext,
            this._duelStateName,
            this.app.screen.width,
            this.app.screen.height,
          );
        }
      }

      onUpdate(deltaMs);
    };

    this.app.ticker.add(this.tickerCallback);
  }

  /**
   * Destroys the PixiJS application and frees all GPU resources.
   * Safe to call even if init() never completed (e.g. fast unmount).
   */
  destroy(): void {
    this._destroyed = true;

    if (!this.app) return;

    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }

    this.traversalScene?.destroy();
    this.traversalScene = null;

    this.duelScene?.destroy();
    this.duelScene = null;

    // true = remove canvas from DOM; true = destroy children, textures, context
    this.app.destroy(true, true);
    this.app = null;

    this._resolveDestroyed();
  }
}
