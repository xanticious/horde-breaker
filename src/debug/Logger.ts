import { type DebugConfig, parseDebugConfig } from "./DebugConfig";
import type { LogLevel } from "./DebugConfig";

// ─── Level Ordering ───────────────────────────────────────────────────────────

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

// ─── Module Logger Interface ──────────────────────────────────────────────────

export interface ModuleLogger {
  trace(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  /** Errors always log regardless of debug config or mode. */
  error(message: string, ...args: unknown[]): void;
}

// ─── Config Provider ─────────────────────────────────────────────────────────

/**
 * The active config provider. Defaults to lazily reading `window.location.search`.
 * Override via `configureLogger()` for tests or runtime reconfiguration.
 */
let _configProvider: () => DebugConfig = () =>
  parseDebugConfig(typeof window !== "undefined" ? window.location.search : "");

/**
 * Replace the config provider used by all `Logger` instances.
 * Call with a fixed config to freeze debug settings (useful in tests and SSR).
 *
 * @example
 * // In a test:
 * configureLogger({ enabled: true, logLevel: 'debug', logModules: [], ... });
 */
export function configureLogger(config: DebugConfig): void {
  _configProvider = () => config;
}

/**
 * Reset the config provider back to the default (reads `window.location.search`).
 * Call this in `afterEach` when you've overridden the config in a test.
 */
export function resetLoggerConfig(): void {
  _configProvider = () =>
    parseDebugConfig(typeof window !== "undefined" ? window.location.search : "");
}

// ─── Logger ───────────────────────────────────────────────────────────────────

/**
 * Factory for creating module-scoped loggers.
 *
 * @example
 * const log = Logger.create('combat');
 * log.debug('Hit resolved', { damage: 12 });
 * log.error('Unexpected null HP');
 */
export class Logger {
  /**
   * Create a logger for a named module.
   * The returned `ModuleLogger` prefixes every message with `[moduleName]`.
   */
  static create(moduleName: string): ModuleLogger {
    return {
      trace: (msg, ...args) => Logger._emit("trace", moduleName, msg, args),
      debug: (msg, ...args) => Logger._emit("debug", moduleName, msg, args),
      info: (msg, ...args) => Logger._emit("info", moduleName, msg, args),
      warn: (msg, ...args) => Logger._emit("warn", moduleName, msg, args),
      error: (msg, ...args) => Logger._emit("error", moduleName, msg, args),
    };
  }

  private static _emit(
    level: LogLevel,
    moduleName: string,
    message: string,
    args: unknown[],
  ): void {
    const prefix = `[${moduleName}]`;

    // Errors always log — debug disabled in production should not swallow errors.
    if (level === "error") {
      console.error(prefix, message, ...args);
      return;
    }

    const config = _configProvider();

    // All non-error levels are gated behind debug being enabled.
    if (!config.enabled) return;

    // Module whitelist — skip if this module is not in the list (empty = all pass).
    if (config.logModules.length > 0 && !config.logModules.includes(moduleName)) {
      return;
    }

    // Level threshold — skip messages below the configured minimum level.
    if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[config.logLevel]) return;

    switch (level) {
      case "trace":
        // oxlint-disable-next-line no-console
        console.trace(prefix, message, ...args);
        break;
      case "debug":
        // oxlint-disable-next-line no-console
        console.debug(prefix, message, ...args);
        break;
      case "info":
        // oxlint-disable-next-line no-console
        console.info(prefix, message, ...args);
        break;
      case "warn":
        // oxlint-disable-next-line no-console
        console.warn(prefix, message, ...args);
        break;
    }
  }
}
