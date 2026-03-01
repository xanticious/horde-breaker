import { Container, Graphics } from "pixi.js";

/** Width of the health bar in pixels at full health. Exported for scene positioning. */
export const HEALTH_BAR_WIDTH = 120;

/** Height of the health bar in pixels. */
const HEALTH_BAR_HEIGHT = 12;

const BG_COLOR = 0x222222;

/**
 * A horizontal HP bar rendered with PixiJS Graphics.
 *
 * The container's (x, y) is the top-left corner of the bar; callers position it
 * externally each frame (e.g. above an enemy's head in DuelScene).
 *
 * Call `update(current, max)` each frame to redraw the fill portion.
 */
export class HealthBar {
  readonly container: Container;
  private readonly bg: Graphics;
  private readonly fill: Graphics;

  constructor() {
    this.container = new Container();

    this.bg = new Graphics();
    this.bg.rect(0, 0, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT).fill({ color: BG_COLOR });
    this.container.addChild(this.bg);

    this.fill = new Graphics();
    this.container.addChild(this.fill);
  }

  /**
   * Redraws the fill bar to the correct fraction and colour.
   * Green above 50 %, yellow 25–50 %, red below 25 %.
   */
  update(current: number, max: number): void {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const fillWidth = Math.round(HEALTH_BAR_WIDTH * ratio);
    const color = ratio > 0.5 ? 0x50fa7b : ratio > 0.25 ? 0xf1fa8c : 0xff5555;

    this.fill.clear();
    if (fillWidth > 0) {
      this.fill.rect(0, 0, fillWidth, HEALTH_BAR_HEIGHT).fill({ color });
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
