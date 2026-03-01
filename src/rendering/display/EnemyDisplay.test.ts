import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnemyDisplay } from "./EnemyDisplay";
import { EnemyId } from "@core/types/enemy";

// Mock PixiJS — jsdom has no GPU context.
vi.mock("pixi.js", () => {
  const Graphics = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.clear = vi.fn().mockReturnThis();
    this.rect = vi.fn().mockReturnThis();
    this.fill = vi.fn().mockReturnThis();
    this.pivot = { set: vi.fn() };
  });
  const Text = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.anchor = { set: vi.fn() };
    this.text = "";
    this.y = 0;
  });
  const TextStyle = vi.fn();
  const Container = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.addChild = vi.fn();
    this.destroy = vi.fn();
    this.x = 0;
    this.y = 0;
  });
  return { Graphics, Text, TextStyle, Container };
});

describe("EnemyDisplay", () => {
  let display: EnemyDisplay;

  beforeEach(() => {
    display = new EnemyDisplay(EnemyId.Wolf);
  });

  it("constructs without throwing", () => {
    expect(display.container).toBeDefined();
  });

  it("exposes the enemy id", () => {
    expect(display.enemyId).toBe(EnemyId.Wolf);
  });

  it("setPhase() does not throw for all phases", () => {
    expect(() => display.setPhase("windingUp")).not.toThrow();
    expect(() => display.setPhase("recovery")).not.toThrow();
    expect(() => display.setPhase("defeated")).not.toThrow();
    expect(() => display.setPhase("idle")).not.toThrow();
  });

  it("setPhase() is a no-op when called with the current phase", () => {
    // Should not throw and should skip the redraw path.
    expect(() => display.setPhase("idle")).not.toThrow();
  });

  it("setPosition() updates container coordinates", () => {
    display.setPosition(400, 600);
    expect(display.container.x).toBe(400);
    expect(display.container.y).toBe(600);
  });

  it("destroy() does not throw", () => {
    expect(() => display.destroy()).not.toThrow();
  });
});
