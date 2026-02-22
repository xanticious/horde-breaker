import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger, configureLogger, resetLoggerConfig } from "./Logger";
import type { DebugConfig } from "./DebugConfig";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ENABLED_DEBUG_CONFIG: DebugConfig = {
  enabled: true,
  logLevel: "debug",
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
};

const DISABLED_CONFIG: DebugConfig = {
  ...ENABLED_DEBUG_CONFIG,
  enabled: false,
};

function makeConfig(overrides: Partial<DebugConfig> = {}): DebugConfig {
  return { ...ENABLED_DEBUG_CONFIG, ...overrides };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Logger", () => {
  beforeEach(() => {
    // Spy on all console methods so we can assert calls without polluting output.
    vi.spyOn(console, "trace").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetLoggerConfig();
  });

  // ── Errors always pass through ─────────────────────────────────────────────

  describe("error level", () => {
    it("logs errors even when debug is disabled", () => {
      configureLogger(DISABLED_CONFIG);
      const log = Logger.create("test");
      log.error("Something broke");
      expect(console.error).toHaveBeenCalledWith("[test]", "Something broke");
    });

    it("logs errors in production-like mode (enabled=false)", () => {
      configureLogger(makeConfig({ enabled: false }));
      const log = Logger.create("combat");
      log.error("fatal error", { code: 42 });
      expect(console.error).toHaveBeenCalledWith("[combat]", "fatal error", { code: 42 });
    });

    it("includes module prefix in error messages", () => {
      configureLogger(ENABLED_DEBUG_CONFIG);
      const log = Logger.create("economy");
      log.error("oops");
      expect(console.error).toHaveBeenCalledWith("[economy]", "oops");
    });

    it("passes additional args to console.error", () => {
      configureLogger(ENABLED_DEBUG_CONFIG);
      const log = Logger.create("myModule");
      const obj = { a: 1 };
      log.error("msg", obj, "extra");
      expect(console.error).toHaveBeenCalledWith("[myModule]", "msg", obj, "extra");
    });
  });

  // ── Debug disabled ─────────────────────────────────────────────────────────

  describe("when debug is disabled", () => {
    beforeEach(() => {
      configureLogger(DISABLED_CONFIG);
    });

    it("suppresses trace messages", () => {
      const log = Logger.create("test");
      log.trace("trace msg");
      expect(console.trace).not.toHaveBeenCalled();
    });

    it("suppresses debug messages", () => {
      const log = Logger.create("test");
      log.debug("debug msg");
      expect(console.debug).not.toHaveBeenCalled();
    });

    it("suppresses info messages", () => {
      const log = Logger.create("test");
      log.info("info msg");
      expect(console.info).not.toHaveBeenCalled();
    });

    it("suppresses warn messages", () => {
      const log = Logger.create("test");
      log.warn("warn msg");
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  // ── Log level filtering ────────────────────────────────────────────────────

  describe("level filtering", () => {
    it("suppresses messages below the configured logLevel", () => {
      configureLogger(makeConfig({ logLevel: "warn" }));
      const log = Logger.create("test");
      log.trace("t");
      log.debug("d");
      log.info("i");
      expect(console.trace).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
    });

    it("emits messages at or above the configured logLevel", () => {
      configureLogger(makeConfig({ logLevel: "warn" }));
      const log = Logger.create("test");
      log.warn("warning!");
      expect(console.warn).toHaveBeenCalledWith("[test]", "warning!");
    });

    it("logLevel=trace emits all non-error levels", () => {
      configureLogger(makeConfig({ logLevel: "trace" }));
      const log = Logger.create("test");
      log.trace("t");
      log.debug("d");
      log.info("i");
      log.warn("w");
      expect(console.trace).toHaveBeenCalledOnce();
      expect(console.debug).toHaveBeenCalledOnce();
      expect(console.info).toHaveBeenCalledOnce();
      expect(console.warn).toHaveBeenCalledOnce();
    });

    it("logLevel=info suppresses trace and debug", () => {
      configureLogger(makeConfig({ logLevel: "info" }));
      const log = Logger.create("test");
      log.trace("t");
      log.debug("d");
      log.info("i");
      expect(console.trace).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledOnce();
    });

    it("logLevel=error suppresses trace, debug, info, warn", () => {
      configureLogger(makeConfig({ logLevel: "error" }));
      const log = Logger.create("test");
      log.trace("t");
      log.debug("d");
      log.info("i");
      log.warn("w");
      expect(console.trace).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  // ── Module filtering ───────────────────────────────────────────────────────

  describe("module filtering", () => {
    it("passes all modules when logModules is empty", () => {
      configureLogger(makeConfig({ logModules: [] }));
      const log = Logger.create("anything");
      log.debug("hello");
      expect(console.debug).toHaveBeenCalledWith("[anything]", "hello");
    });

    it("allows a whitelisted module", () => {
      configureLogger(makeConfig({ logModules: ["combat"] }));
      const log = Logger.create("combat");
      log.debug("hit");
      expect(console.debug).toHaveBeenCalledWith("[combat]", "hit");
    });

    it("suppresses a non-whitelisted module", () => {
      configureLogger(makeConfig({ logModules: ["combat"] }));
      const log = Logger.create("economy");
      log.debug("currency earned");
      expect(console.debug).not.toHaveBeenCalled();
    });

    it("allows multiple whitelisted modules independently", () => {
      configureLogger(makeConfig({ logModules: ["combat", "economy"] }));
      const combatLog = Logger.create("combat");
      const economyLog = Logger.create("economy");
      const renderLog = Logger.create("rendering");
      combatLog.debug("a");
      economyLog.debug("b");
      renderLog.debug("c");
      expect(console.debug).toHaveBeenCalledTimes(2);
    });

    it("module filter does not block errors", () => {
      configureLogger(makeConfig({ logModules: ["combat"] }));
      const log = Logger.create("rendering");
      log.error("crash");
      expect(console.error).toHaveBeenCalledWith("[rendering]", "crash");
    });
  });

  // ── Module prefix ──────────────────────────────────────────────────────────

  describe("module prefix", () => {
    it("uses the correct module name in square brackets", () => {
      configureLogger(ENABLED_DEBUG_CONFIG);
      const log = Logger.create("mySystem");
      log.info("hello");
      expect(console.info).toHaveBeenCalledWith("[mySystem]", "hello");
    });

    it("different loggers use their own module names", () => {
      configureLogger(ENABLED_DEBUG_CONFIG);
      const a = Logger.create("alpha");
      const b = Logger.create("beta");
      a.info("msg-a");
      b.warn("msg-b");
      expect(console.info).toHaveBeenCalledWith("[alpha]", "msg-a");
      expect(console.warn).toHaveBeenCalledWith("[beta]", "msg-b");
    });
  });

  // ── Config reconfiguration ─────────────────────────────────────────────────

  describe("configureLogger / resetLoggerConfig", () => {
    it("reconfiguring changes behavior immediately for existing loggers", () => {
      // Start with debug disabled.
      configureLogger(DISABLED_CONFIG);
      const log = Logger.create("test");
      log.debug("should be silent");
      expect(console.debug).not.toHaveBeenCalled();

      // Re-enable debug.
      configureLogger(ENABLED_DEBUG_CONFIG);
      log.debug("should appear now");
      expect(console.debug).toHaveBeenCalledOnce();
    });

    it("resetLoggerConfig does not throw", () => {
      expect(() => resetLoggerConfig()).not.toThrow();
    });
  });
});
