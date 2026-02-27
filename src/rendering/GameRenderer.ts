import { Application, Graphics, Container } from "pixi.js";

export type UpdateCallback = (deltaMs: number) => void;

/**
 * Wraps PixiJS Application lifecycle.
 * GameScreen owns one instance per mount; destroyed on unmount to prevent leaks.
 */
export class GameRenderer {
  private app: Application | null = null;
  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;
  // Tracks whether destroy() was called before init() resolved, so the async
  // init path can detect the stale state and clean up the Application itself.
  private _destroyed = false;

  /**
   * Async init required by PixiJS 8 — Application.init() must be awaited.
   * Appends the canvas to the provided parent element after init completes.
   */
  async init(canvasParent: HTMLElement): Promise<void> {
    // Hold in a local variable until init() fully resolves. If destroy() is
    // called while we're awaiting (e.g. React StrictMode double-mount or fast
    // unmount), this.app stays null so destroy()'s early-return guard fires
    // correctly. Assigning this.app before await would let destroy() receive a
    // partially-initialised Application that lacks _cancelResize, crashing.
    const app = new Application();

    await app.init({
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      resizeTo: canvasParent,
    });

    // If the component unmounted while we were awaiting, clean up immediately
    // and bail — the GameScreen cleanup callback already set this.app to null.
    if (this._destroyed) {
      app.destroy(true, { children: true });
      return;
    }

    this.app = app;
    canvasParent.appendChild(this.app.canvas);

    // Add the proof-of-life bouncing rectangle scene until real game content lands
    this._createPlaceholderScene();
  }

  /**
   * Registers an update callback that fires every frame via the PixiJS ticker.
   * Must be called after init() resolves.
   */
  startGameLoop(onUpdate: UpdateCallback): void {
    if (!this.app) return;

    this.tickerCallback = (ticker) => {
      onUpdate(ticker.deltaMS);
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

    // true = remove canvas from DOM; true = destroy children, textures, context
    this.app.destroy(true, true);
    this.app = null;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * A simple animated rectangle that proves the ticker loop is alive.
   * Replaced in Sprint 7 when TraversalScene ships real content.
   */
  private _createPlaceholderScene(): void {
    if (!this.app) return;

    const container = new Container();
    this.app.stage.addChild(container);

    // Accent-coloured rectangle
    const rect = new Graphics();
    rect.rect(0, 0, 80, 80).fill({ color: 0xe94560 });
    rect.pivot.set(40, 40);
    container.addChild(rect);

    // Label via another small rectangle strip
    const label = new Graphics();
    label.rect(0, 0, 200, 4).fill({ color: 0x0f3460 });
    label.pivot.set(100, 2);
    label.y = 60;
    container.addChild(label);

    let elapsed = 0;

    this.app.ticker.add((ticker) => {
      if (!this.app) return;

      elapsed += ticker.deltaMS;

      const w = this.app.screen.width;
      const h = this.app.screen.height;

      // Bounce rect across the screen
      const t = elapsed / 1000;
      rect.x = (Math.cos(t * 1.2) * 0.4 + 0.5) * w;
      rect.y = (Math.sin(t * 0.8) * 0.4 + 0.5) * h;
      rect.rotation = t;

      label.x = (Math.cos(t * 0.5 + 1) * 0.35 + 0.5) * w;
      label.y = (Math.sin(t * 0.7 + 2) * 0.35 + 0.5) * h;
    });
  }
}
