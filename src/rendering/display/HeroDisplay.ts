import { Container, Graphics, Text, TextStyle } from "pixi.js";

/** The stances the hero can be in during traversal. */
export type HeroStance = "running" | "jumping" | "ducking" | "sprinting" | "climbing";

// Palette for the placeholder hero rectangle per stance.
const STANCE_COLORS: Record<HeroStance, number> = {
  running: 0xe94560,
  jumping: 0xf5a623,
  ducking: 0x50fa7b,
  sprinting: 0xff79c6,
  climbing: 0xbd93f9,
};

/**
 * Placeholder hero sprite for Sprint 7 — a coloured rectangle that changes
 * colour based on stance. Real spritesheet animations replace this in Sprint 7+.
 */
export class HeroDisplay {
  readonly container: Container;
  private readonly body: Graphics;
  private readonly label: Text;
  private currentStance: HeroStance = "running";

  constructor() {
    this.container = new Container();

    // Body rectangle — 60 wide × 100 tall (approximate hero silhouette at 1920 design width)
    this.body = new Graphics();
    this._redrawBody();
    this.body.pivot.set(30, 100); // Pivot at feet-centre
    this.container.addChild(this.body);

    // Stance label for easier debugging during development
    const style = new TextStyle({ fill: 0xffffff, fontSize: 12 });
    this.label = new Text({ text: "running", style });
    this.label.anchor.set(0.5, 0);
    this.label.y = 4;
    this.container.addChild(this.label);
  }

  /**
   * Update the visual stance of the hero.
   * Triggers a colour change on the placeholder rectangle.
   */
  setStance(stance: HeroStance): void {
    if (stance === this.currentStance) return;
    this.currentStance = stance;
    this._redrawBody();
    this.label.text = stance;
  }

  /**
   * Position the hero in screen space.
   * `heroPosition` is in the traversal segment's local coordinate system (0 = start).
   * For Sprint 7 the hero is fixed horizontally at 15% of screen width;
   * vertical position is set to 80% of screen height (the ground line).
   */
  setPosition(screenWidth: number, screenHeight: number): void {
    // Hero stays fixed at the left-ish area of the screen;
    // background scrolls to simulate forward movement.
    this.container.x = screenWidth * 0.15;
    this.container.y = screenHeight * 0.8;
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  // ---------------------------------------------------------------------------

  private _redrawBody(): void {
    this.body.clear();
    const color = STANCE_COLORS[this.currentStance];

    if (this.currentStance === "ducking") {
      // Shorter, wider rectangle while ducking
      this.body.rect(0, 0, 80, 60).fill({ color });
      this.body.pivot.set(40, 60);
    } else if (this.currentStance === "jumping") {
      // Slightly narrower and tallest in jump
      this.body.rect(0, 0, 50, 110).fill({ color });
      this.body.pivot.set(25, 110);
    } else {
      this.body.rect(0, 0, 60, 100).fill({ color });
      this.body.pivot.set(30, 100);
    }
  }
}
