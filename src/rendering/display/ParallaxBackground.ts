import { Container, Graphics, TilingSprite, RenderTexture } from "pixi.js";
import type { Application, Texture } from "pixi.js";

// Scroll-speed multipliers per layer (back → front), matching the art design spec:
// sky=0.10, mountains=0.30, trees=0.60, ground=1.00
const LAYER_SPEEDS = [0.1, 0.3, 0.6, 1.0] as const;

// Each layer descriptor drives both texture generation and vertical placement.
// yStart / yEnd are fractions of screen height (0 = top, 1 = bottom).
// The sky fills the full screen; each successive layer occupies a progressively
// smaller bottom band so they visually stack like a real horizon.
const LAYER_DEFS = [
  {
    name: "sky",
    yFraction: 0, // fills from top
    heightFraction: 1.0, // full screen height
    bgColor: 0x0d1b3e, // deep midnight blue
    // Alternating lighter-blue columns to make horizontal scrolling visible
    stripes: [
      { x: 0, w: 160, color: 0x162550 },
      { x: 400, w: 80, color: 0x1a2d60 },
      { x: 680, w: 200, color: 0x112040 },
      // A couple of "star cluster" blobs
      { x: 200, w: 20, color: 0xffffff, y: 80, h: 8 },
      { x: 520, w: 12, color: 0xffffff, y: 140, h: 6 },
      { x: 760, w: 16, color: 0xffffff, y: 50, h: 8 },
    ],
  },
  {
    name: "mountains",
    yFraction: 0.35, // starts 35% down
    heightFraction: 0.65,
    bgColor: 0x2a3a5c, // muted slate blue
    // Jagged mountain silhouette shapes via tall thin rectangles of varying heights
    stripes: [
      { x: 0, w: 80, color: 0x1e2e48, h: 340 },
      { x: 100, w: 60, color: 0x223252, h: 280 },
      { x: 180, w: 100, color: 0x1a2844, h: 380 },
      { x: 300, w: 70, color: 0x243660, h: 260 },
      { x: 390, w: 90, color: 0x1e2e48, h: 310 },
      { x: 500, w: 120, color: 0x1a2844, h: 360 },
      { x: 640, w: 60, color: 0x243660, h: 240 },
      { x: 720, w: 80, color: 0x1e2e48, h: 290 },
    ],
  },
  {
    name: "trees",
    yFraction: 0.55, // starts 55% down
    heightFraction: 0.45,
    bgColor: 0x1a3820, // dark forest green
    // Irregular tree-top silhouettes
    stripes: [
      { x: 0, w: 40, color: 0x0f2614, h: 200 },
      { x: 60, w: 30, color: 0x163020, h: 160 },
      { x: 110, w: 50, color: 0x0f2614, h: 220 },
      { x: 180, w: 25, color: 0x1a3820, h: 140 },
      { x: 220, w: 45, color: 0x0d2010, h: 240 },
      { x: 290, w: 35, color: 0x163020, h: 180 },
      { x: 350, w: 55, color: 0x0f2614, h: 210 },
      { x: 430, w: 30, color: 0x1a3820, h: 150 },
      { x: 480, w: 50, color: 0x0d2010, h: 230 },
      { x: 550, w: 40, color: 0x163020, h: 170 },
    ],
  },
  {
    name: "ground",
    yFraction: 0.78, // starts 78% down
    heightFraction: 0.22,
    bgColor: 0x3d2e1a, // warm earthy brown
    // Stone path segments to make ground movement obvious
    stripes: [
      { x: 0, w: 120, color: 0x4a3822, h: 30 },
      { x: 150, w: 90, color: 0x382a14, h: 25 },
      { x: 280, w: 140, color: 0x4a3822, h: 30 },
      { x: 460, w: 100, color: 0x382a14, h: 28 },
      { x: 600, w: 130, color: 0x4a3822, h: 30 },
      { x: 760, w: 80, color: 0x382a14, h: 24 },
    ],
  },
] as const;

// Tile width must be a power of 2 for GPU efficiency. 1024 px gives enough
// visual variety before the pattern repeats, while staying under 2048.
const TILE_WIDTH = 1024;

/** A single parallax layer backed by a TilingSprite. */
interface Layer {
  sprite: TilingSprite;
  speedMultiplier: number;
}

/**
 * Renders 4 horizontally-scrollable background layers at different speeds,
 * matching the design spec (sky 0.10×, mountains 0.30×, trees 0.60×, ground 1.00×).
 *
 * Each tile is drawn with distinct geometric patterns (bands, silhouettes, path
 * segments) so scrolling motion is immediately visible without real art assets.
 * Swap `_makeTileTexture` for asset loading once real backgrounds are available.
 */
export class ParallaxBackground {
  readonly container: Container;
  private readonly layers: Layer[];

  constructor(app: Application) {
    this.container = new Container();
    this.layers = [];

    const screenH = app.screen.height;

    LAYER_DEFS.forEach((def, i) => {
      const tileTexture = this._makeTileTexture(app, def, screenH);
      const layerH = screenH * def.heightFraction;

      const sprite = new TilingSprite({
        texture: tileTexture,
        width: app.screen.width,
        height: layerH,
      });

      // Position each layer so its bottom edge meets the screen bottom.
      // This ensures sky fills everything, mountains sit above trees, etc.
      sprite.y = screenH - layerH;

      this.container.addChild(sprite);
      this.layers.push({ sprite, speedMultiplier: LAYER_SPEEDS[i] });
    });
  }

  /**
   * Scroll all layers by `distancePixels` this frame.
   * Called by TraversalScene with `speed * deltaMs / 1000`.
   */
  scroll(distancePixels: number): void {
    for (const layer of this.layers) {
      layer.sprite.tilePosition.x -= distancePixels * layer.speedMultiplier;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  // ---------------------------------------------------------------------------

  /**
   * Generates a `TILE_WIDTH × tileHeight` RenderTexture with a background fill
   * and per-layer decorative stripes/silhouettes so motion is visually obvious.
   *
   * All shapes are bottom-anchored so the silhouettes rise from the ground line
   * of each tile, matching how the layer sits on screen.
   */
  private _makeTileTexture(
    app: Application,
    def: (typeof LAYER_DEFS)[number],
    screenH: number,
  ): Texture {
    const tileH = Math.ceil(screenH * def.heightFraction);
    const rt = RenderTexture.create({ width: TILE_WIDTH, height: tileH });

    const g = new Graphics();

    // Background fill
    g.rect(0, 0, TILE_WIDTH, tileH).fill({ color: def.bgColor });

    // Decorative stripes / silhouette shapes, bottom-anchored
    for (const stripe of def.stripes) {
      const x = "x" in stripe ? stripe.x : 0;
      const w = "w" in stripe ? stripe.w : 32;
      // Height defaults to full layer height; star/light blobs use an explicit h
      const h = "h" in stripe ? stripe.h : tileH;
      const y = "y" in stripe ? stripe.y : tileH - h;
      g.rect(x, y, w, h).fill({ color: stripe.color });
    }

    app.renderer.render({ container: g, target: rt });
    g.destroy();
    return rt;
  }
}
