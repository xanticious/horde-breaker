import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthBar } from "./HealthBar";

// Mock PixiJS — jsdom has no GPU context.
vi.mock("pixi.js", () => {
  const Graphics = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.clear = vi.fn().mockReturnThis();
    this.rect = vi.fn().mockReturnThis();
    this.fill = vi.fn().mockReturnThis();
  });
  const Container = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.addChild = vi.fn();
    this.destroy = vi.fn();
  });
  return { Graphics, Container };
});

describe("HealthBar", () => {
  let bar: HealthBar;

  beforeEach(() => {
    bar = new HealthBar();
  });

  it("creates a container", () => {
    expect(bar.container).toBeDefined();
  });

  it("update() does not throw at full health", () => {
    expect(() => bar.update(100, 100)).not.toThrow();
  });

  it("update() does not throw at zero health", () => {
    expect(() => bar.update(0, 100)).not.toThrow();
  });

  it("update() does not throw when max is 0 (no division-by-zero)", () => {
    expect(() => bar.update(0, 0)).not.toThrow();
  });

  it("update() clamps current above max to full bar", () => {
    // Should not throw when current > max
    expect(() => bar.update(150, 100)).not.toThrow();
  });

  it("destroy() does not throw", () => {
    expect(() => bar.destroy()).not.toThrow();
  });
});
