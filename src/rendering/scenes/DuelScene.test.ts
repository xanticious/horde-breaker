import { describe, it, expect, vi, beforeEach } from "vitest";
import { DuelScene } from "./DuelScene";
import { EnemyId } from "@core/types/enemy";
import type { DuelContext } from "@core/machines/duelMachine";
import type { Application } from "pixi.js";

// Mock PixiJS — jsdom has no GPU context.
vi.mock("pixi.js", () => {
  const Graphics = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.clear = vi.fn().mockReturnThis();
    this.rect = vi.fn().mockReturnThis();
    this.fill = vi.fn().mockReturnThis();
  });
  const Container = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.addChild = vi.fn();
    this.destroy = vi.fn();
  });
  return { Graphics, Container };
});

// Mock the sub-display objects so this test focuses on DuelScene's own logic.
vi.mock("../display/HeroDisplay", () => ({
  HeroDisplay: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.container = { destroy: vi.fn(), x: 0, y: 0 };
    this.setStance = vi.fn();
    this.setPosition = vi.fn();
    this.destroy = vi.fn();
  }),
}));

vi.mock("../display/EnemyDisplay", () => ({
  EnemyDisplay: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.container = { destroy: vi.fn() };
    this.setPhase = vi.fn();
    this.setPosition = vi.fn();
    this.destroy = vi.fn();
  }),
  // Exporting a dummy value so the named import resolves.
  EnemyDuelPhase: undefined,
}));

vi.mock("../display/HealthBar", () => ({
  HealthBar: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.container = { destroy: vi.fn(), x: 0, y: 0 };
    this.update = vi.fn();
    this.destroy = vi.fn();
  }),
  HEALTH_BAR_WIDTH: 120,
}));

function makeContext(overrides: Partial<DuelContext> = {}): DuelContext {
  return {
    heroHp: 100,
    heroMaxHp: 100,
    heroDamage: 15,
    heroArmor: 0,
    heroAttackSpeed: 1,
    heroX: 300,
    heroStance: "neutral",
    enemyId: EnemyId.Wolf,
    enemyHp: 40,
    enemyMaxHp: 40,
    enemyDamage: 8,
    enemyX: 620,
    enemyBehavior: {
      decideAction: vi.fn(),
      getWindUpDuration: vi.fn(),
      getRecoveryDuration: vi.fn(),
    },
    currentEnemyAction: { type: "wait" },
    rng: Math.random,
    ...overrides,
  };
}

describe("DuelScene", () => {
  const mockApp = {} as Application;
  let scene: DuelScene;

  beforeEach(() => {
    scene = new DuelScene(mockApp, makeContext());
  });

  it("constructs without throwing", () => {
    expect(scene.container).toBeDefined();
  });

  it("update() does not throw in idle state", () => {
    expect(() => scene.update(makeContext(), "idle", 1920, 1080)).not.toThrow();
  });

  it("update() does not throw in enemyWindingUp state", () => {
    expect(() => scene.update(makeContext(), "enemyWindingUp", 1920, 1080)).not.toThrow();
  });

  it("update() does not throw in heroWindingUp state", () => {
    expect(() => scene.update(makeContext(), "heroWindingUp", 1920, 1080)).not.toThrow();
  });

  it("update() does not throw in enemyDefeated state", () => {
    expect(() =>
      scene.update(makeContext({ enemyHp: 0 }), "enemyDefeated", 1920, 1080),
    ).not.toThrow();
  });

  it("update() handles blocking hero stance", () => {
    const ctx = makeContext({ heroStance: "blocking" });
    expect(() => scene.update(ctx, "enemyWindingUp", 1920, 1080)).not.toThrow();
  });

  it("destroy() does not throw", () => {
    expect(() => scene.destroy()).not.toThrow();
  });
});
