import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { EnemyId } from "@core/types/enemy";

/** Visual phase of the enemy during a duel — drives placeholder fill colour. */
export type EnemyDuelPhase = "idle" | "windingUp" | "recovery" | "defeated";

// Colour palette per phase makes AI state immediately readable during play-testing.
const PHASE_COLORS: Record<EnemyDuelPhase, number> = {
  idle: 0x8b4513, // warm brown — at rest
  windingUp: 0xff4500, // orange-red — attack incoming (player needs to react)
  recovery: 0x6b8e23, // olive green — briefly vulnerable after attack
  defeated: 0x808080, // gray — dead
};

const ENEMY_WIDTH = 80;
const ENEMY_HEIGHT = 100;

/**
 * Placeholder enemy sprite for Sprint 10 — a coloured rectangle that changes
 * colour based on duel phase. Real sprite animations replace this in a later sprint.
 */
export class EnemyDisplay {
  readonly container: Container;
  private readonly body: Graphics;
  private readonly label: Text;
  private currentPhase: EnemyDuelPhase = "idle";

  constructor(readonly enemyId: EnemyId) {
    this.container = new Container();

    this.body = new Graphics();
    this._redrawBody();
    // Pivot at feet-centre for consistent ground-line positioning.
    this.body.pivot.set(ENEMY_WIDTH / 2, ENEMY_HEIGHT);
    this.container.addChild(this.body);

    // Debug label showing enemy type + current phase — removed once sprites land.
    const style = new TextStyle({ fill: 0xffffff, fontSize: 12 });
    this.label = new Text({ text: `${enemyId}\nidle`, style });
    this.label.anchor.set(0.5, 0);
    this.label.y = 4; // below feet pivot — sits at ground level
    this.container.addChild(this.label);
  }

  /** Update the enemy's visual phase as the DuelMachine transitions states. */
  setPhase(phase: EnemyDuelPhase): void {
    if (phase === this.currentPhase) return;
    this.currentPhase = phase;
    this._redrawBody();
    this.label.text = `${this.enemyId}\n${phase}`;
  }

  /**
   * Position the enemy at a ground-level point in screen space.
   * @param x - Screen X of the enemy's feet (horizontal centre via pivot).
   * @param y - Screen Y of the ground line.
   */
  setPosition(x: number, y: number): void {
    this.container.x = x;
    this.container.y = y;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  private _redrawBody(): void {
    this.body.clear();
    this.body
      .rect(0, 0, ENEMY_WIDTH, ENEMY_HEIGHT)
      .fill({ color: PHASE_COLORS[this.currentPhase] });
  }
}
