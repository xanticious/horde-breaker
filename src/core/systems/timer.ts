import { TIMER_WARNING_THRESHOLD_MS, TIMER_CRITICAL_THRESHOLD_MS } from "@data/balance.data";

// ── Timer phase ───────────────────────────────────────────────────────────────

/** Visual urgency phase of the run timer, derived from remaining milliseconds. */
export type TimerPhase = "safe" | "warning" | "critical";

// ── Pure timer functions ──────────────────────────────────────────────────────

/**
 * Return the phase for a given number of remaining milliseconds.
 * Thresholds come from balance data so they are tunable without touching this code.
 */
export function getTimerPhase(remainingMs: number): TimerPhase {
  if (remainingMs > TIMER_WARNING_THRESHOLD_MS) return "safe";
  if (remainingMs > TIMER_CRITICAL_THRESHOLD_MS) return "warning";
  return "critical";
}

/**
 * Decrement the timer by `deltaMs`.
 * Never goes below zero — callers check `isTimerExpired()` to detect end.
 */
export function tickTimer(remainingMs: number, deltaMs: number): number {
  return Math.max(0, remainingMs - deltaMs);
}

/** Returns true when the timer has reached zero. */
export function isTimerExpired(remainingMs: number): boolean {
  return remainingMs <= 0;
}

/** Format remaining milliseconds as `M:SS` for display. */
export function formatTimerMs(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes)}:${String(seconds).padStart(2, "0")}`;
}
