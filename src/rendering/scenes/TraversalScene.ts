import { Container } from "pixi.js";
import type { Application } from "pixi.js";
import { ParallaxBackground } from "../display/ParallaxBackground";
import { HeroDisplay } from "../display/HeroDisplay";
import { ObstacleDisplay } from "../display/ObstacleDisplay";
import type { HeroStance } from "../display/HeroDisplay";
import type { TraversalContext } from "@core/machines/traversalMachine";

/**
 * Composes all visual elements for the traversal phase:
 * scrolling parallax background, hero placeholder, and obstacle placeholders.
 *
 * `update()` is called once per frame from the game loop with the latest
 * TraversalMachine context. The TraversalScene reads state; it never mutates it.
 */
export class TraversalScene {
  readonly container: Container;
  private readonly parallax: ParallaxBackground;
  private readonly heroDisplay: HeroDisplay;
  private readonly obstacleDisplay: ObstacleDisplay;

  constructor(app: Application) {
    this.container = new Container();
    this.parallax = new ParallaxBackground(app);
    this.heroDisplay = new HeroDisplay();
    this.obstacleDisplay = new ObstacleDisplay();

    // Layer order: background → obstacles → hero on top
    this.container.addChild(this.parallax.container);
    this.container.addChild(this.obstacleDisplay.container);
    this.container.addChild(this.heroDisplay.container);

    // Initial position — keeps the hero at a fixed screen position while
    // the parallax background scrolls to simulate forward movement.
    const { width, height } = app.screen;
    this.heroDisplay.setPosition(width, height);
  }

  /**
   * Advance the scene by one frame.
   * @param state - Latest snapshot from TraversalMachine context.
   * @param deltaMs - Elapsed milliseconds since the last frame.
   * @param screenWidth - Current canvas width (may change on resize).
   * @param screenHeight - Current canvas height (may change on resize).
   */
  update(
    state: TraversalContext,
    deltaMs: number,
    screenWidth: number,
    screenHeight: number,
  ): void {
    // Scroll distance in pixels: speed (px/s) × deltaMs (ms) / 1000
    const scrollPx = state.speed * (deltaMs / 1000);
    this.parallax.scroll(scrollPx);

    this.heroDisplay.setStance(state.heroStance as HeroStance);
    this.heroDisplay.setPosition(screenWidth, screenHeight);

    this.obstacleDisplay.update(state.obstacles, state.heroPosition, screenWidth, screenHeight);
  }

  destroy(): void {
    this.parallax.destroy();
    this.heroDisplay.destroy();
    this.obstacleDisplay.destroy();
    this.container.destroy({ children: true });
  }
}
