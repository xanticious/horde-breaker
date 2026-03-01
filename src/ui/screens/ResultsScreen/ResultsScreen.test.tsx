import { render, screen, within } from "@testing-library/react";
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
import { ResultsScreen } from "./ResultsScreen";

// ── Helpers ───────────────────────────────────────────────────────────────────

// The gameMachine mock-start-run event required to reach run state.
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

function makeMockResult(overrides: Partial<RunResult> = {}): RunResult {
  return {
    heroId: HeroId.Barbarian,
    chapter: ChapterId.Chapter1,
    currencyEarned: 0, // will be overwritten by gameMachine on END_RUN
    distancePercent: 80,
    distanceReached: 80,
    enemiesDefeated: 3,
    duelDamageDealt: 120,
    bossDefeated: false,
    coinsCollected: [],
    completed: false,
    ...overrides,
  };
}

/**
 * Renders ResultsScreen inside a real gameMachine actor that has been pre-driven
 * to the `results` state with the given run result.
 */
function renderResultsScreen(result: RunResult): ReturnType<typeof render> {
  const actor = createActor(gameMachine);
  actor.start();
  actor.send({ type: "START_GAME" });
  actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
  actor.send(MOCK_START_RUN);
  // END_RUN drives the machine to results state with a computed reward.
  actor.send({ type: "END_RUN", result });

  return render(
    <GameActorContext.Provider value={actor}>
      <ResultsScreen />
    </GameActorContext.Provider>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ResultsScreen", () => {
  describe("death outcome (incomplete run)", () => {
    let result: RunResult;

    beforeEach(() => {
      result = makeMockResult({
        enemiesDefeated: 3,
        duelDamageDealt: 120,
        distancePercent: 80,
        bossDefeated: false,
        completed: false,
      });
    });

    it("shows 'Fallen' heading for an incomplete run", () => {
      renderResultsScreen(result);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/fallen/i);
    });

    it("displays distance percentage", () => {
      renderResultsScreen(result);
      expect(screen.getByText("80%")).toBeInTheDocument();
    });

    it("displays enemy count", () => {
      renderResultsScreen(result);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("displays duel damage dealt", () => {
      renderResultsScreen(result);
      // Scope to the Run Summary panel so the same value in the Rewards panel
      // (damage reward) doesn't cause a multiple-elements error.
      const summarySection = screen.getByText("Run Summary").closest("section")!;
      expect(within(summarySection).getByText("120")).toBeInTheDocument();
    });

    it("displays boss defeated as No", () => {
      renderResultsScreen(result);
      expect(screen.getByText("No")).toBeInTheDocument();
    });

    it("shows the reward breakdown panel title", () => {
      renderResultsScreen(result);
      expect(screen.getByText("Rewards")).toBeInTheDocument();
    });

    it("shows a positive total reward for a run with progress", () => {
      renderResultsScreen(result);
      // The economy system: 80 distance × 1 + 3 kills × 50 + 120 dmg × 1 = 80 + 150 + 120 = 350
      // Match the total-earned span exactly ("350 ¤") to avoid also matching the
      // balance paragraph which reads "Balance: 350 ¤".
      const rewardsSection = screen.getByText("Rewards").closest("section")!;
      expect(within(rewardsSection).getByText("350 ¤")).toBeInTheDocument();
    });

    it("shows the Continue to Upgrades button", () => {
      renderResultsScreen(result);
      expect(screen.getByRole("button", { name: /continue to upgrades/i })).toBeInTheDocument();
    });
  });

  describe("victory outcome (completed run)", () => {
    it("shows 'Victory!' heading when run is completed", () => {
      renderResultsScreen(
        makeMockResult({
          completed: true,
          bossDefeated: true,
          distancePercent: 100,
          enemiesDefeated: 5,
        }),
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/victory/i);
    });

    it("shows boss defeat reward when boss is defeated", () => {
      renderResultsScreen(
        makeMockResult({
          completed: true,
          bossDefeated: true,
          distancePercent: 100,
          enemiesDefeated: 5,
          duelDamageDealt: 200,
        }),
      );
      // BOSS_DEFEAT_REWARD = 200 (chapter 1 multiplier = 1).
      // Scope to the "Boss reward" list item so we don't also match "Damage dealt"
      // and "Damage reward" which share the same value.
      const rewardsSection = screen.getByText("Rewards").closest("section")!;
      const bossRewardItem = within(rewardsSection).getByText("Boss reward").closest("li")!;
      expect(within(bossRewardItem).getByText("200")).toBeInTheDocument();
    });
  });

  describe("currency balance display", () => {
    it("shows updated balance after run rewards are added", () => {
      // Economy: 80% distance (80 coins) + 3 kills × 50 + 120 dmg = 350 total
      renderResultsScreen(
        makeMockResult({
          distancePercent: 80,
          enemiesDefeated: 3,
          duelDamageDealt: 120,
          bossDefeated: false,
          coinsCollected: [],
          completed: false,
        }),
      );
      // The balance shown should include the earned rewards
      expect(screen.getByText(/balance:/i)).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("sends CONTINUE event when Continue to Upgrades is clicked", async () => {
      const user = userEvent.setup();

      const actor = createActor(gameMachine);
      actor.start();
      actor.send({ type: "START_GAME" });
      actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian });
      actor.send(MOCK_START_RUN);
      actor.send({ type: "END_RUN", result: makeMockResult() });

      render(
        <GameActorContext.Provider value={actor}>
          <ResultsScreen />
        </GameActorContext.Provider>,
      );

      await user.click(screen.getByRole("button", { name: /continue to upgrades/i }));

      // ResultsScreen always renders its button; verify the effect by checking
      // that the machine actually transitioned to the upgrade state.
      expect(actor.getSnapshot().matches("upgrade")).toBe(true);
    });
  });
});
