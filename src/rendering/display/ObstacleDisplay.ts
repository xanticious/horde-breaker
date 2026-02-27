import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { ObstacleInstance } from "@core/entities/obstacles/obstacleBase";

// Design resolution constant — must match HeroDisplay.ts
const DESIGN_WIDTH = 1920;

// Obstacle colours by type
const TIME_TAX_COLOR = 0xf5a623; // amber — represents a wall to climb
const HEALTH_TAX_COLOR = 0xff4444; // red — represents a hazard

const OBSTACLE_WIDTH = 50;
const OBSTACLE_HEIGHT = 100;

/**
 * Renders placeholder rectangles for traversal obstacles.
 * One Graphics object per obstacle; re-used across frames by toggling visibility.
 * The scene owns a single ObstacleDisplay instance and calls `update()` each frame.
 */
export class ObstacleDisplay {
  readonly container: Container;
  private readonly pool: Map<string, { gfx: Graphics; label: Text }> = new Map();

  constructor() {
    this.container = new Container();
  }

  /**
   * Sync the display with the current obstacle list.
   * Obstacles that have scrolled off-screen to the left are hidden;
   * new ones are added to the pool on demand.
   *
   * @param obstacles Current obstacles for this segment.
   * @param heroPosition Current hero position along the segment (same units as obstacle.position).
   * @param screenWidth Current canvas width.
   * @param screenHeight Current canvas height.
   */
  update(
    obstacles: ObstacleInstance[],
    heroPosition: number,
    screenWidth: number,
    screenHeight: number,
  ): void {
    // Hide all first, then reveal the visible ones.
    for (const entry of this.pool.values()) {
      entry.gfx.visible = false;
      entry.label.visible = false;
    }

    for (const obstacle of obstacles) {
      if (!this.pool.has(obstacle.id)) {
        this._createEntry(obstacle);
      }

      const entry = this.pool.get(obstacle.id)!;

      // Compute screen X: obstacles are ahead of the hero at (heroPosition fixed at 15% screen).
      // Offset = (obstacle.position - heroPosition) scaled to screen resolution.
      const heroScreenX = screenWidth * 0.15;
      const pxPerUnit = screenWidth / DESIGN_WIDTH;
      const obstacleScreenX = heroScreenX + (obstacle.position - heroPosition) * pxPerUnit;
      const groundY = screenHeight * 0.8;

      // Only render if reasonably on-screen (–200 to screenWidth + 200 buffer).
      if (obstacleScreenX < -200 || obstacleScreenX > screenWidth + 200) continue;

      entry.gfx.x = obstacleScreenX;
      entry.gfx.y = groundY;
      entry.label.x = obstacleScreenX;
      entry.label.y = groundY - OBSTACLE_HEIGHT - 16;

      entry.gfx.visible = true;
      entry.label.visible = true;
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
    this.pool.clear();
  }

  // ---------------------------------------------------------------------------

  private _createEntry(obstacle: ObstacleInstance): void {
    const color = obstacle.type === "timeTax" ? TIME_TAX_COLOR : HEALTH_TAX_COLOR;

    const gfx = new Graphics();
    gfx.rect(-OBSTACLE_WIDTH / 2, -OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT).fill({
      color,
    });
    gfx.alpha = 0.85;

    const style = new TextStyle({ fill: 0xffffff, fontSize: 10, fontFamily: "sans-serif" });
    const label = new Text({ text: obstacle.type === "timeTax" ? "WALL" : "HAZARD", style });
    label.anchor.set(0.5, 1);

    this.container.addChild(gfx);
    this.container.addChild(label);
    this.pool.set(obstacle.id, { gfx, label });
  }
}

// Re-export so callers don't need to import from the design types separately.
export type { ObstacleInstance };
