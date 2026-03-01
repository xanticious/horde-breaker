import { Container, Graphics } from "pixi.js";
import type { Application } from "pixi.js";
import { HeroDisplay } from "../display/HeroDisplay";
import { EnemyDisplay, type EnemyDuelPhase } from "../display/EnemyDisplay";
import { HealthBar, HEALTH_BAR_WIDTH } from "../display/HealthBar";
import type { DuelContext } from "@core/machines/duelMachine";

/** Vertical distance (px) from the enemy's feet to the top of the health bar. */
const HEALTH_BAR_ABOVE_FEET_PX = 115;

/**
 * Composes the visual elements of a one-vs-one duel encounter:
 * an arena background, the hero placeholder (left), the enemy placeholder
 * (right), and the enemy's PixiJS health bar above its head.
 *
 * `update()` is called once per frame from the game loop.
 * DuelScene reads state; it never mutates it.
 */
export class DuelScene {
  readonly container: Container;
  private readonly bg: Graphics;
  private readonly heroDisplay: HeroDisplay;
  private readonly enemyDisplay: EnemyDisplay;
  private readonly healthBar: HealthBar;

  // Track last dimensions so the background rect only redraws on resize.
  private lastScreenWidth = 0;
  private lastScreenHeight = 0;

  constructor(
    // _app is reserved for future use (e.g. adding RenderTextures, post-processing).
    _app: Application,
    context: DuelContext,
  ) {
    this.container = new Container();

    // Dark-red arena backdrop — drawn behind everything else.
    this.bg = new Graphics();
    this.container.addChild(this.bg);

    this.heroDisplay = new HeroDisplay();
    this.container.addChild(this.heroDisplay.container);

    this.enemyDisplay = new EnemyDisplay(context.enemyId);
    this.container.addChild(this.enemyDisplay.container);

    this.healthBar = new HealthBar();
    this.container.addChild(this.healthBar.container);
  }

  /**
   * Advance the scene by one frame.
   * @param context - Latest DuelContext snapshot (read-only).
   * @param stateName - Current XState machine state value (e.g. "idle", "enemyWindingUp").
   * @param screenWidth - Canvas width in pixels.
   * @param screenHeight - Canvas height in pixels.
   */
  update(context: DuelContext, stateName: string, screenWidth: number, screenHeight: number): void {
    // Only redraw the background when the canvas dimensions actually change.
    if (screenWidth !== this.lastScreenWidth || screenHeight !== this.lastScreenHeight) {
      this.bg.clear();
      this.bg.rect(0, 0, screenWidth, screenHeight).fill({ color: 0x2d1b0e });
      this.lastScreenWidth = screenWidth;
      this.lastScreenHeight = screenHeight;
    }

    const groundY = screenHeight * 0.8;

    // Normalise the logical enemy X (design-space ~0–1920) to actual screen X.
    const scaleX = screenWidth / 1920;
    const enemyScreenX = context.enemyX * scaleX;

    // Hero: pinned 25 % from the left, on the ground line.
    this.heroDisplay.container.x = screenWidth * 0.25;
    this.heroDisplay.container.y = groundY;
    // Map DuelHeroStance to the HeroDisplay placeholder states.
    this.heroDisplay.setStance(context.heroStance === "blocking" ? "ducking" : "running");

    // Enemy: X from duel context (scales to screen); Y at ground line.
    this.enemyDisplay.setPosition(enemyScreenX, groundY);
    this.enemyDisplay.setPhase(stateToEnemyPhase(stateName));

    // Health bar: centred above the enemy's head.
    this.healthBar.container.x = enemyScreenX - HEALTH_BAR_WIDTH / 2;
    this.healthBar.container.y = groundY - HEALTH_BAR_ABOVE_FEET_PX;
    this.healthBar.update(context.enemyHp, context.enemyMaxHp);
  }

  destroy(): void {
    this.heroDisplay.destroy();
    this.enemyDisplay.destroy();
    this.healthBar.destroy();
    this.container.destroy({ children: true });
  }
}

/**
 * Maps a DuelMachine state name to the enemy's visual phase.
 * All non-enemy-acting states default to `"idle"` (calm, waiting colour).
 */
function stateToEnemyPhase(stateName: string): EnemyDuelPhase {
  switch (stateName) {
    case "enemyWindingUp":
      return "windingUp";
    case "enemyRecovery":
      return "recovery";
    case "enemyDefeated":
      return "defeated";
    default:
      return "idle";
  }
}
