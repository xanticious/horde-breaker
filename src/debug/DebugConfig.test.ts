import { describe, it, expect } from "vitest";
import { parseDebugConfig } from "./DebugConfig";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Call parseDebugConfig in test/dev mode (isProd=false). */
function parse(search: string) {
  return parseDebugConfig(search, false);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("parseDebugConfig", () => {
  // ── Production guard ────────────────────────────────────────────────────────

  describe("production guard", () => {
    it("returns disabled config in production regardless of query params", () => {
      const config = parseDebugConfig("?debug=true&logLevel=trace", true);
      expect(config.enabled).toBe(false);
    });

    it("returns disabled config in production with no params", () => {
      const config = parseDebugConfig("", true);
      expect(config.enabled).toBe(false);
    });

    it("production config has safe defaults for all flags", () => {
      const config = parseDebugConfig("?debug=true&invincible=true", true);
      expect(config.invincible).toBe(false);
      expect(config.infiniteTime).toBe(false);
      expect(config.showHitboxes).toBe(false);
      expect(config.showFps).toBe(false);
      expect(config.showStateOverlay).toBe(false);
    });
  });

  // ── Debug disabled (no ?debug=true) ─────────────────────────────────────────

  describe("debug disabled", () => {
    it("returns disabled config when ?debug=true is absent", () => {
      expect(parse("").enabled).toBe(false);
      expect(parse("?something=else").enabled).toBe(false);
      expect(parse("?debug=false").enabled).toBe(false);
      expect(parse("?debug=1").enabled).toBe(false);
    });
  });

  // ── Basic enable ────────────────────────────────────────────────────────────

  describe("?debug=true enables debug mode", () => {
    it("sets enabled to true", () => {
      expect(parse("?debug=true").enabled).toBe(true);
    });

    it("defaults logLevel to debug when not specified", () => {
      expect(parse("?debug=true").logLevel).toBe("debug");
    });

    it("defaults logModules to empty array", () => {
      expect(parse("?debug=true").logModules).toEqual([]);
    });

    it("defaults all boolean flags to false", () => {
      const config = parse("?debug=true");
      expect(config.invincible).toBe(false);
      expect(config.infiniteTime).toBe(false);
      expect(config.showHitboxes).toBe(false);
      expect(config.showFps).toBe(false);
      expect(config.showStateOverlay).toBe(false);
    });

    it("defaults all nullable fields to null", () => {
      const config = parse("?debug=true");
      expect(config.hero).toBeNull();
      expect(config.chapter).toBeNull();
      expect(config.skipTo).toBeNull();
      expect(config.upgrades).toBeNull();
      expect(config.currency).toBeNull();
      expect(config.seed).toBeNull();
    });
  });

  // ── logLevel ────────────────────────────────────────────────────────────────

  describe("logLevel param", () => {
    it.each(["trace", "debug", "info", "warn", "error"] as const)("parses logLevel=%s", (level) => {
      expect(parse(`?debug=true&logLevel=${level}`).logLevel).toBe(level);
    });

    it("falls back to 'debug' for an unrecognised logLevel value", () => {
      expect(parse("?debug=true&logLevel=verbose").logLevel).toBe("debug");
      expect(parse("?debug=true&logLevel=ALL").logLevel).toBe("debug");
    });
  });

  // ── logModules ──────────────────────────────────────────────────────────────

  describe("logModules param", () => {
    it("parses a single module", () => {
      expect(parse("?debug=true&logModules=combat").logModules).toEqual(["combat"]);
    });

    it("parses comma-separated modules", () => {
      expect(parse("?debug=true&logModules=combat,economy").logModules).toEqual([
        "combat",
        "economy",
      ]);
    });

    it("trims whitespace from module names", () => {
      expect(parse("?debug=true&logModules=combat, economy , game").logModules).toEqual([
        "combat",
        "economy",
        "game",
      ]);
    });

    it("filters out empty strings from module list", () => {
      expect(parse("?debug=true&logModules=,combat,").logModules).toEqual(["combat"]);
    });
  });

  // ── hero & chapter ──────────────────────────────────────────────────────────

  describe("hero and chapter params", () => {
    it("parses hero name", () => {
      expect(parse("?debug=true&hero=barbarian").hero).toBe("barbarian");
    });

    it("parses numeric chapter", () => {
      expect(parse("?debug=true&chapter=3").chapter).toBe(3);
    });

    it("returns null for non-numeric chapter", () => {
      expect(parse("?debug=true&chapter=three").chapter).toBeNull();
    });
  });

  // ── skipTo & upgrades ───────────────────────────────────────────────────────

  describe("skipTo and upgrades params", () => {
    it("parses skipTo value", () => {
      expect(parse("?debug=true&skipTo=boss").skipTo).toBe("boss");
    });

    it("parses upgrades=max", () => {
      expect(parse("?debug=true&upgrades=max").upgrades).toBe("max");
    });

    it("parses upgrades=none", () => {
      expect(parse("?debug=true&upgrades=none").upgrades).toBe("none");
    });
  });

  // ── Boolean flags ───────────────────────────────────────────────────────────

  describe("boolean flag params", () => {
    it.each([
      ["invincible", "invincible"],
      ["infiniteTime", "infiniteTime"],
      ["showHitboxes", "showHitboxes"],
      ["showFps", "showFps"],
      ["showStateOverlay", "showStateOverlay"],
    ] as const)("parses %s=true", (param, field) => {
      const config = parse(`?debug=true&${param}=true`);
      expect(config[field]).toBe(true);
    });

    it.each(["invincible", "infiniteTime", "showHitboxes", "showFps", "showStateOverlay"] as const)(
      "defaults %s to false when absent",
      (field) => {
        expect(parse("?debug=true")[field]).toBe(false);
      },
    );
  });

  // ── currency & seed ─────────────────────────────────────────────────────────

  describe("currency and seed params", () => {
    it("parses currency as a number", () => {
      expect(parse("?debug=true&currency=500").currency).toBe(500);
    });

    it("returns null for non-numeric currency", () => {
      expect(parse("?debug=true&currency=lots").currency).toBeNull();
    });

    it("parses seed as a number", () => {
      expect(parse("?debug=true&seed=12345").seed).toBe(12345);
    });

    it("returns null for non-numeric seed", () => {
      expect(parse("?debug=true&seed=abc").seed).toBeNull();
    });
  });

  // ── Full example ─────────────────────────────────────────────────────────────

  describe("full example URL", () => {
    it("parses all params correctly", () => {
      const config = parse(
        "?debug=true&hero=barbarian&chapter=3&skipTo=boss&upgrades=max&invincible=true&showFps=true&seed=12345&logLevel=trace&logModules=combat,economy",
      );
      expect(config).toMatchObject({
        enabled: true,
        logLevel: "trace",
        logModules: ["combat", "economy"],
        hero: "barbarian",
        chapter: 3,
        skipTo: "boss",
        upgrades: "max",
        invincible: true,
        showFps: true,
        seed: 12345,
      });
    });
  });
});
