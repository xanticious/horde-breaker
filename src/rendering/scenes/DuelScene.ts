import { Container, Graphics } from "pixi.js";
import type { Application } from "pixi.js";
import { HeroDisplay } from "../display/HeroDisplay";
import { EnemyDisplay, type EnemyDuelPhase } from "../display/EnemyDisplay";
import { HealthBar, HEALTH_BAR_WIDTH } from "../display/HealthBar";
import type { DuelContext } from "@core/machines/duelMachine";

/** Vertical distance (px) from the enemy's feet to the top of the health bar. */
const HEALTH_BAR_ABOVE_FEET_PX = 115;

/**
 * Per-enemy rendering bundle — one per enemy in the encounter.
 */
interface EnemyBundle {
  display: EnemyDisplay;
  healthBar: HealthBar;
}

/**
 * Composes the visual elements of a multi-enemy duel encounter:
 * an arena background, the hero placeholder (left), and one display+health-bar
 * pair for each enemy (right side, spaced apart).
 *
 * The active enemy (currently being fought) is rendered at full brightness;
 * waiting enemies behind it are dimmed to signal they are not yet targetable.
 *
 * `update()` is called once per frame from the game loop.
 * DuelScene reads state; it never mutates it.
 */
export class DuelScene {
  readonly container: Container;
  private readonly bg: Graphics;
  private readonly heroDisplay: HeroDisplay;
  private readonly enemyBundles: EnemyBundle[];

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

    // Create one display + health-bar bundle per enemy in the encounter.
    this.enemyBundles = context.enemies.map((enemy) => {
      const display = new EnemyDisplay(enemy.id);
      const healthBar = new HealthBar();
      this.container.addChild(display.container);
      this.container.addChild(healthBar.container);
      return { display, healthBar };
    });
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

    const scaleX = screenWidth / 1920;

    // Hero: pinned 25 % from the left, on the ground line.
    this.heroDisplay.container.x = screenWidth * 0.25;
    this.heroDisplay.container.y = groundY;
    // Map DuelHeroStance to the HeroDisplay placeholder states.
    this.heroDisplay.setStance(context.heroStance === "blocking" ? "ducking" : "running");

    // Each enemy: position from context, dim if not active or already defeated.
    context.enemies.forEach((enemy, i) => {
      const bundle = this.enemyBundles[i];
      if (!bundle) return;
      const isActive = i === context.activeEnemyIndex;
      const enemyScreenX = enemy.x * scaleX;
      bundle.display.setPosition(enemyScreenX, groundY);
      bundle.display.setPhase(isActive ? stateToEnemyPhase(stateName) : "idle");
      const isDefeated = enemy.hp <= 0;
      bundle.display.container.alpha = isDefeated ? 0.3 : isActive ? 1 : 0.5;
      bundle.healthBar.container.x = enemyScreenX - HEALTH_BAR_WIDTH / 2;
      bundle.healthBar.container.y = groundY - HEALTH_BAR_ABOVE_FEET_PX;
      bundle.healthBar.update(enemy.hp, enemy.maxHp);
      bundle.healthBar.container.visible = !isDefeated;
    });
  }

  destroy(): void {
    this.heroDisplay.destroy();
    this.enemyBundles.forEach(({ display, healthBar }) => {
      display.destroy();
      healthBar.destroy();
    });
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
