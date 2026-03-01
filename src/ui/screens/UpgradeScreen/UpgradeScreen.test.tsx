import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { createActor } from "xstate";
import { gameMachine } from "@core/machines/gameMachine";
import { GameActorContext } from "@ui/providers/GameProvider";
import { HeroId } from "@core/types/hero";
import { ChapterId } from "@core/types/chapter";
import { EnemyId } from "@core/types/enemy";
import type { RunResult } from "@core/types/run";
import type { GameEvent } from "@core/machines/gameMachine";
import { UpgradeScreen } from "./UpgradeScreen";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_START_RUN: Extract<GameEvent, { type: "START_RUN" }> = {
  type: "START_RUN",
  chapter: ChapterId.Chapter1,
  heroStats: {
    maxHp: 100,
    armor: 0,
    runSpeed: 200,
    damageMultiplier: 1,
    attackSpeed: 1,
    specialAbility: { damage: 0, cooldownMs: 0, durationMs: 0 },
  },
  enemyLayout: [{ enemyId: EnemyId.Wolf, positionPercent: 50, isBoss: false }],
  obstaclesBySegment: [],
  enemyBehaviorFactory: () => ({
    decideAction: () => ({ type: "wait" }) as const,
    getWindUpDuration: () => 500,
    getRecoveryDuration: () => 300,
  }),
  rngSeed: 1,
};

/**
 * Drives the machine to the upgrade state with no currency (fresh hero select).
 */
function makeActorAtUpgradeNoCurrency() {
  const actor = createActor(gameMachine);
  actor.start();
  actor.send({ type: "START_GAME" });
  actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
  // We are now in the `upgrade` state with 0 currency.
  return actor;
}

/**
 * Drives the machine to the upgrade state after a run that earns currency.
 * Economy: 80% distance (80) + 3 kills × 50 (150) + 120 damage (120) = 350 ¤.
 */
function makeActorAtUpgradeWithCurrency(): ReturnType<typeof createActor<typeof gameMachine>> {
  const result: RunResult = {
    heroId: HeroId.Barbarian,
    chapter: ChapterId.Chapter1,
    currencyEarned: 0,
    distancePercent: 80,
    distanceReached: 80,
    enemiesDefeated: 3,
    duelDamageDealt: 120,
    bossDefeated: false,
    coinsCollected: [],
    completed: false,
  };
  const actor = createActor(gameMachine);
  actor.start();
  actor.send({ type: "START_GAME" });
  actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
  actor.send(MOCK_START_RUN);
  actor.send({ type: "END_RUN", result });
  actor.send({ type: "CONTINUE" });
  // Now in `upgrade` state with 350 ¤ currency.
  return actor;
}

function renderUpgradeScreen(
  actor: ReturnType<typeof createActor<typeof gameMachine>>,
): ReturnType<typeof render> {
  return render(
    <GameActorContext.Provider value={actor}>
      <UpgradeScreen />
    </GameActorContext.Provider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UpgradeScreen", () => {
  describe("layout and headings", () => {
    it("renders the Upgrades heading", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/upgrades/i);
    });

    it("renders the upgrade grid table", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      expect(screen.getByRole("table", { name: /upgrade grid/i })).toBeInTheDocument();
    });

    it("renders all 6 upgrade category rows", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      // Each row has a category name cell — verify at least the known ones exist.
      expect(screen.getByText("Max Health")).toBeInTheDocument();
      expect(screen.getByText("Armour")).toBeInTheDocument();
      expect(screen.getByText("Run Speed")).toBeInTheDocument();
      expect(screen.getByText("Axe Damage")).toBeInTheDocument();
      expect(screen.getByText("Attack Speed")).toBeInTheDocument();
      expect(screen.getByText("Leap Attack")).toBeInTheDocument();
    });

    it("renders the currency balance", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      expect(screen.getByText(/balance:/i)).toBeInTheDocument();
    });
  });

  describe("currency display", () => {
    it("shows 0 ¤ when hero has no currency", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      expect(screen.getByText("0 ¤")).toBeInTheDocument();
    });

    it("shows earned currency after a run", () => {
      renderUpgradeScreen(makeActorAtUpgradeWithCurrency());
      // Economy: 80 distance + 150 kills + 120 damage = 350
      expect(screen.getByText("350 ¤")).toBeInTheDocument();
    });
  });

  describe("purchase buttons — no currency", () => {
    it("disables the first upgrade button for each category when balance is 0", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      // First step costs 18 ¤ — all first-step buttons should be disabled.
      const buttons = screen.getAllByRole("button", { name: /upgrade .* to level 2/i });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });

  describe("purchase buttons — with currency (350 ¤)", () => {
    it("enables level-2 upgrade buttons that cost ≤ 350 ¤", () => {
      renderUpgradeScreen(makeActorAtUpgradeWithCurrency());
      // All first-step costs are 18 ¤, well within 350 ¤.
      const buttons = screen.getAllByRole("button", { name: /upgrade .* to level 2/i });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((btn) => expect(btn).toBeEnabled());
    });
  });

  describe("purchasing an upgrade", () => {
    let actor: ReturnType<typeof createActor<typeof gameMachine>>;

    beforeEach(() => {
      actor = makeActorAtUpgradeWithCurrency();
    });

    it("deducts cost from currency after purchase", async () => {
      const user = userEvent.setup();
      renderUpgradeScreen(actor);

      const maxHealthBtn = screen.getByRole("button", {
        name: /upgrade max health to level 2/i,
      });
      await user.click(maxHealthBtn);

      // Cost for Max Health level 1→2 is 18 ¤; 350 - 18 = 332 ¤.
      expect(screen.getByText("332 ¤")).toBeInTheDocument();
    });

    it("updates saveData upgrades in the machine after purchase", async () => {
      const user = userEvent.setup();
      renderUpgradeScreen(actor);

      await user.click(screen.getByRole("button", { name: /upgrade max health to level 2/i }));

      const snapshot = actor.getSnapshot();
      const heroSave = snapshot.context.saveData.heroes[HeroId.Barbarian];
      expect(heroSave?.upgrades["maxHealth"]).toBe(2);
    });

    it("shows a purchased checkmark after buying a level", async () => {
      const user = userEvent.setup();
      renderUpgradeScreen(actor);

      await user.click(screen.getByRole("button", { name: /upgrade max health to level 2/i }));

      // The purchased cell now shows a checkmark aria-label.
      expect(screen.getByLabelText("Purchased")).toBeInTheDocument();
    });

    it("does not deduct currency when guard rejects (insufficient funds)", () => {
      // Machine-level test: send PURCHASE_UPGRADE with 0 currency.
      const freshActor = makeActorAtUpgradeNoCurrency();
      freshActor.send({ type: "PURCHASE_UPGRADE", categoryId: "maxHealth" });

      const heroSave = freshActor.getSnapshot().context.saveData.heroes[HeroId.Barbarian];
      // No hero save record should be created (or currency remains 0 if it exists).
      expect(heroSave?.currency ?? 0).toBe(0);
      expect(heroSave?.upgrades?.["maxHealth"] ?? 1).toBe(1);
    });
  });

  describe("navigation buttons", () => {
    it("renders the Start Run button", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      expect(screen.getByRole("button", { name: /start run/i })).toBeInTheDocument();
    });

    it("renders the Back to Hero Select button", () => {
      renderUpgradeScreen(makeActorAtUpgradeNoCurrency());
      expect(screen.getByRole("button", { name: /back to hero select/i })).toBeInTheDocument();
    });

    it("sends GO_TO_HERO_SELECT when Back button is clicked", async () => {
      const user = userEvent.setup();
      const actor = makeActorAtUpgradeNoCurrency();
      renderUpgradeScreen(actor);

      await user.click(screen.getByRole("button", { name: /back to hero select/i }));
      expect(actor.getSnapshot().matches("heroSelect")).toBe(true);
    });
  });
});
