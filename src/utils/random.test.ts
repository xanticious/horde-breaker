import { describe, it, expect } from "vitest";
import { createSeededRng, shuffleArray } from "./random";

describe("createSeededRng", () => {
  it("returns values in [0, 1)", () => {
    const rng = createSeededRng(42);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("produces the same sequence for the same seed", () => {
    const rng1 = createSeededRng(12345);
    const rng2 = createSeededRng(12345);
    const seq1 = Array.from({ length: 20 }, () => rng1());
    const seq2 = Array.from({ length: 20 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it("produces different sequences for different seeds", () => {
    const rng1 = createSeededRng(1);
    const rng2 = createSeededRng(2);
    const val1 = rng1();
    const val2 = rng2();
    // The first values should differ (this is enforced by the mulberry32 constants).
    expect(val1).not.toBe(val2);
  });

  it("advances state each call — sequential values differ", () => {
    const rng = createSeededRng(99);
    const a = rng();
    const b = rng();
    expect(a).not.toBe(b);
  });
});

describe("shuffleArray", () => {
  it("returns the same array reference", () => {
    const arr = [1, 2, 3];
    const result = shuffleArray(arr, createSeededRng(1));
    expect(result).toBe(arr);
  });

  it("preserves all original elements", () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(copy, createSeededRng(42));
    expect(copy.sort()).toEqual(original.sort());
  });

  it("produces a deterministic shuffle for the same seed", () => {
    const arr1 = [1, 2, 3, 4, 5];
    const arr2 = [1, 2, 3, 4, 5];
    shuffleArray(arr1, createSeededRng(7));
    shuffleArray(arr2, createSeededRng(7));
    expect(arr1).toEqual(arr2);
  });

  it("handles a single-element array without error", () => {
    const arr = [42];
    expect(() => shuffleArray(arr, createSeededRng(1))).not.toThrow();
    expect(arr).toEqual([42]);
  });

  it("handles an empty array without error", () => {
    const arr: number[] = [];
    expect(() => shuffleArray(arr, createSeededRng(1))).not.toThrow();
  });
});
