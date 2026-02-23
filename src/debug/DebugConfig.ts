// ─── Types ───────────────────────────────────────────────────────────────────

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export interface DebugConfig {
  /** Master switch — all debug features are disabled when false. */
  enabled: boolean;
  /** Minimum log level to emit. Messages below this level are suppressed. */
  logLevel: LogLevel;
  /**
   * Whitelist of module names to log. An empty array means all modules pass.
   * e.g. ["combat", "economy"] — only those module loggers emit.
   */
  logModules: string[];
  /** Override which hero to start with (skips HeroSelect). */
  hero: string | null;
  /** Override which chapter to start in. */
  chapter: number | null;
  /** Skip directly to a named segment within a chapter, e.g. "boss". */
  skipTo: string | null;
  /**
   * Override upgrade state.
   * "max" = all upgrades maxed, "none" = all upgrades reset, or a
   * comma-separated list of "category:level" pairs.
   */
  upgrades: string | null;
  /** Hero cannot take damage. */
  invincible: boolean;
  /** Run timer is frozen at its starting value. */
  infiniteTime: boolean;
  /** Override starting currency amount. */
  currency: number | null;
  /** Seed for the PRNG — forces deterministic run generation. */
  seed: number | null;
  /** Render hitboxes over sprites. */
  showHitboxes: boolean;
  /** Show FPS counter overlay. */
  showFps: boolean;
  /** Show XState state value overlay. */
  showStateOverlay: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

/** The config returned in production or when ?debug=true is absent. */
const DISABLED_CONFIG: Readonly<DebugConfig> = {
  enabled: false,
  logLevel: "error",
  logModules: [],
  hero: null,
  chapter: null,
  skipTo: null,
  upgrades: null,
  invincible: false,
  infiniteTime: false,
  currency: null,
  seed: null,
  showHitboxes: false,
  showFps: false,
  showStateOverlay: false,
} as const;

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Parse URL query parameters into a `DebugConfig`.
 *
 * All debug features are disabled in production (`import.meta.env.PROD`),
 * regardless of query params.
 *
 * @param search - The URL search string, e.g. `window.location.search`.
 *   Defaults to the current page's search string when called in a browser.
 * @param isProd - Whether to treat this as a production build.
 *   Defaults to `import.meta.env.PROD`. Exposed for testing.
 */
export function parseDebugConfig(
  search?: string,
  isProd: boolean = import.meta.env.PROD,
): DebugConfig {
  // Hard-disable in production — query params cannot re-enable debug mode.
  if (isProd) {
    return { ...DISABLED_CONFIG };
  }

  const params = new URLSearchParams(search ?? window.location.search);

  if (params.get("debug") !== "true") {
    return { ...DISABLED_CONFIG };
  }

  const rawLogLevel = params.get("logLevel");
  const validLevels: LogLevel[] = ["trace", "debug", "info", "warn", "error"];
  const logLevel: LogLevel =
    rawLogLevel && (validLevels as string[]).includes(rawLogLevel)
      ? (rawLogLevel as LogLevel)
      : "debug";

  const rawModules = params.get("logModules");
  const logModules: string[] = rawModules
    ? rawModules
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
    : [];

  const rawCurrency = params.get("currency");
  const currency = rawCurrency !== null && !isNaN(Number(rawCurrency)) ? Number(rawCurrency) : null;

  const rawSeed = params.get("seed");
  const seed = rawSeed !== null && !isNaN(Number(rawSeed)) ? Number(rawSeed) : null;

  const rawChapter = params.get("chapter");
  const chapter = rawChapter !== null && !isNaN(Number(rawChapter)) ? Number(rawChapter) : null;

  return {
    enabled: true,
    logLevel,
    logModules,
    hero: params.get("hero"),
    chapter,
    skipTo: params.get("skipTo"),
    upgrades: params.get("upgrades"),
    invincible: params.get("invincible") === "true",
    infiniteTime: params.get("infiniteTime") === "true",
    currency,
    seed,
    showHitboxes: params.get("showHitboxes") === "true",
    showFps: params.get("showFps") === "true",
    showStateOverlay: params.get("showStateOverlay") === "true",
  };
}
