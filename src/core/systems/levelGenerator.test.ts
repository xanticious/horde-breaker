import { describe, it, expect } from "vitest";
import { generateLevel } from "./levelGenerator";
import { BARBARIAN_CHAPTERS } from "@data/chapters/barbarian-chapters.data";
import { ChapterId } from "@core/types/chapter";
import type { EnemyId } from "@core/types/enemy";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const chapter1 = BARBARIAN_CHAPTERS[ChapterId.Chapter1];

// ── generateLevel ─────────────────────────────────────────────────────────────

describe("generateLevel", () => {
  it("returns an array of EnemyEncounter", () => {
    const encounters = generateLevel(chapter1, 1);
    expect(Array.isArray(encounters)).toBe(true);
    expect(encounters.length).toBeGreaterThan(0);
  });

  it("total encounter count = segmentCount + 1 boss", () => {
    const encounters = generateLevel(chapter1, 1);
    // chapter1.segmentCount = 4
    expect(encounters).toHaveLength(chapter1.segmentCount + 1);
  });

  it("last encounter is always the boss", () => {
    const encounters = generateLevel(chapter1, 1);
    const last = encounters[encounters.length - 1]!;
    expect(last.isBoss).toBe(true);
  });

  it("boss is placed at exactly 95% position", () => {
    const encounters = generateLevel(chapter1, 1);
    const boss = encounters[encounters.length - 1]!;
    expect(boss.positionPercent).toBe(95);
  });

  it("boss enemy ID matches chapter.boss", () => {
    const encounters = generateLevel(chapter1, 1);
    const boss = encounters[encounters.length - 1]!;
    expect(boss.enemyId).toBe(chapter1.boss);
  });

  it("all non-boss encounters have isBoss=false", () => {
    const encounters = generateLevel(chapter1, 1);
    const nonBoss = encounters.slice(0, -1);
    expect(nonBoss.every((e) => !e.isBoss)).toBe(true);
  });

  it("all encounter positions are within [10, 95]", () => {
    const encounters = generateLevel(chapter1, 1);
    for (const enc of encounters) {
      expect(enc.positionPercent).toBeGreaterThanOrEqual(10);
      expect(enc.positionPercent).toBeLessThanOrEqual(95);
    }
  });

  it("enforces minimum 15% spacing between consecutive encounters", () => {
    const encounters = generateLevel(chapter1, 1);
    const sorted = [...encounters].sort((a, b) => a.positionPercent - b.positionPercent);
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i]!.positionPercent - sorted[i - 1]!.positionPercent;
      expect(gap).toBeGreaterThanOrEqual(15);
    }
  });

  it("is deterministic — same seed produces identical output", () => {
    const seed = 42;
    const a = generateLevel(chapter1, seed);
    const b = generateLevel(chapter1, seed);
    expect(a).toEqual(b);
  });

  it("different seeds produce different layouts", () => {
    const a = generateLevel(chapter1, 1);
    const b = generateLevel(chapter1, 9999);
    // Check positions differ (non-boss encounters may vary)
    const posA = a.slice(0, -1).map((e) => e.positionPercent);
    const posB = b.slice(0, -1).map((e) => e.positionPercent);
    expect(posA).not.toEqual(posB);
  });

  it("all enemy IDs come from the chapter roster or the boss", () => {
    const encounters = generateLevel(chapter1, 1);
    const validIds = new Set<EnemyId>([...chapter1.enemyRoster, chapter1.boss]);
    for (const enc of encounters) {
      expect(validIds.has(enc.enemyId)).toBe(true);
    }
  });
});
