// ── Frame-rate-independent timing helpers ────────────────────────────────────

/** Converts milliseconds to seconds. */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/** Converts seconds to milliseconds. */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Calculates how many pixels an object should move this frame, given its speed
 * in pixels per second and the elapsed frame time in milliseconds.
 */
export function pixelsThisFrame(pixelsPerSecond: number, deltaMs: number): number {
  return (pixelsPerSecond * deltaMs) / 1000;
}
