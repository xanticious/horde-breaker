import { describe, it, expect } from "vitest";
import { clamp, lerp, randomRange } from "./math";

describe("clamp", () => {
  it("returns value unchanged when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns exactly min when value equals min", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns exactly max when value equals max", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("lerp", () => {
  it("returns a when t = 0", () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it("returns b when t = 1", () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it("returns midpoint when t = 0.5", () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it("extrapolates beyond [a, b] when t > 1", () => {
    expect(lerp(0, 10, 2)).toBe(20);
  });

  it("extrapolates below a when t < 0", () => {
    expect(lerp(10, 20, -1)).toBe(0);
  });
});

describe("randomRange", () => {
  it("returns min when rng returns 0", () => {
    expect(randomRange(() => 0, 5, 15)).toBe(5);
  });

  it("returns max when rng returns 1", () => {
    expect(randomRange(() => 1, 5, 15)).toBe(15);
  });

  it("returns a value within [min, max] for arbitrary rng output", () => {
    const value = randomRange(() => 0.3, 10, 20);
    expect(value).toBeGreaterThanOrEqual(10);
    expect(value).toBeLessThanOrEqual(20);
  });
});
