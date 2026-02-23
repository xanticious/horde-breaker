/**
 * StateInspector — XState v5 inspector integration via @statelyai/inspect.
 *
 * Call `setupInspector(config)` once at app startup (before any actors are
 * created). When debug mode is enabled it opens the Stately visual inspector
 * at https://stately.ai/inspector in a new browser tab and returns an inspector
 * whose `inspect` option can be passed to `createActor` / `createActorContext`.
 *
 * Returns `null` in production or when debug is disabled so callers can safely
 * spread/conditional-pass the option without branching everywhere.
 */

import { createBrowserInspector } from "@statelyai/inspect";
import type { DebugConfig } from "./DebugConfig";

export type BrowserInspector = ReturnType<typeof createBrowserInspector>;

let _instance: BrowserInspector | null = null;

/**
 * Initialise the Stately browser inspector. Must be called before actors are
 * created so that the `inspect` callback is ready. Safe to call multiple times
 * — subsequent calls are no-ops and return the existing instance.
 */
export function setupInspector(config: DebugConfig): BrowserInspector | null {
  if (!config.enabled || import.meta.env.PROD) return null;
  if (_instance) return _instance;

  _instance = createBrowserInspector();
  return _instance;
}

/** Returns the current inspector instance, or `null` if not initialised. */
export function getInspector(): BrowserInspector | null {
  return _instance;
}
