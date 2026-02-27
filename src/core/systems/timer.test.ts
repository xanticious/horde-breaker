import { describe, it, expect } from "vitest";
import { getTimerPhase, tickTimer, isTimerExpired, formatTimerMs } from "./timer";

describe("getTimerPhase", () => {
  it("returns safe when well above warning threshold", () => {
    expect(getTimerPhase(90_000)).toBe("safe");
  });

  it("returns safe just above the warning threshold (30 001 ms)", () => {
    expect(getTimerPhase(30_001)).toBe("safe");
  });

  it("returns warning exactly at the warning threshold (30 000 ms)", () => {
    // Boundary: > 30 000 is safe; <= 30 000 is warning
    expect(getTimerPhase(30_000)).toBe("warning");
  });

  it("returns warning between thresholds (20 000 ms)", () => {
    expect(getTimerPhase(20_000)).toBe("warning");
  });

  it("returns warning just above critical threshold (15 001 ms)", () => {
    expect(getTimerPhase(15_001)).toBe("warning");
  });

  it("returns critical exactly at the critical threshold (15 000 ms)", () => {
    expect(getTimerPhase(15_000)).toBe("critical");
  });

  it("returns critical below the critical threshold", () => {
    expect(getTimerPhase(5_000)).toBe("critical");
  });

  it("returns critical at zero", () => {
    expect(getTimerPhase(0)).toBe("critical");
  });
});

describe("tickTimer", () => {
  it("subtracts deltaMs from the remaining time", () => {
    expect(tickTimer(90_000, 16)).toBe(89_984);
  });

  it("clamps to 0 when deltaMs exceeds remaining time", () => {
    expect(tickTimer(100, 200)).toBe(0);
  });

  it("returns exactly 0 when deltaMs equals remaining time", () => {
    expect(tickTimer(1000, 1000)).toBe(0);
  });

  it("does not return negative values", () => {
    expect(tickTimer(0, 100)).toBe(0);
  });
});

describe("isTimerExpired", () => {
  it("returns false for positive remaining time", () => {
    expect(isTimerExpired(1)).toBe(false);
    expect(isTimerExpired(90_000)).toBe(false);
  });

  it("returns true at exactly 0", () => {
    expect(isTimerExpired(0)).toBe(true);
  });

  it("returns true for negative values (should not normally occur)", () => {
    expect(isTimerExpired(-1)).toBe(true);
  });
});

describe("formatTimerMs", () => {
  it("formats 90 seconds as 1:30", () => {
    expect(formatTimerMs(90_000)).toBe("1:30");
  });

  it("formats 60 seconds as 1:00", () => {
    expect(formatTimerMs(60_000)).toBe("1:00");
  });

  it("formats 9 seconds as 0:09 (zero-padded)", () => {
    expect(formatTimerMs(9_000)).toBe("0:09");
  });

  it("formats 0 ms as 0:00", () => {
    expect(formatTimerMs(0)).toBe("0:00");
  });

  it("rounds up partial seconds (e.g. 1 500 ms → 0:02)", () => {
    expect(formatTimerMs(1_500)).toBe("0:02");
  });
});
