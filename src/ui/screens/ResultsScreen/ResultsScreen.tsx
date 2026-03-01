import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { Button } from "@ui/components/Button/Button";
import { calculateRunReward } from "@core/systems/economy";
import { DEATH_MESSAGES, VICTORY_LINES, GENERIC_DEATH_MESSAGES } from "@data/lore.data";
import type { EnemyId } from "@core/types/enemy";
import styles from "./ResultsScreen.module.css";

/** Map for enemy-specific messages when the hero is killed. */
function getDeathMessage(enemyId: EnemyId | null, seed: number): string {
  if (enemyId !== null) {
    const messages = DEATH_MESSAGES[enemyId];
    if (messages && messages.length > 0) {
      return messages[seed % messages.length] ?? GENERIC_DEATH_MESSAGES[0];
    }
  }
  return GENERIC_DEATH_MESSAGES[seed % GENERIC_DEATH_MESSAGES.length] ?? GENERIC_DEATH_MESSAGES[0];
}

function getVictoryLine(seed: number): string {
  return VICTORY_LINES[seed % VICTORY_LINES.length] ?? VICTORY_LINES[0];
}

export function ResultsScreen() {
  const actor = useGameActor();
  const result = GameActorContext.useSelector((s) => s.context.lastRunResult);
  const saveData = GameActorContext.useSelector((s) => s.context.saveData);

  const breakdown = result ? calculateRunReward(result) : null;

  // Use enemy count as a cheap seed for deterministic but varied lore messages.
  const loreSeed = result ? result.enemiesDefeated : 0;

  // Determine run outcome header and lore message.
  let outcomeLabel: string;
  let outcomeClass: string;
  let loreMessage: string;

  if (!result) {
    outcomeLabel = "Run Results";
    outcomeClass = styles.headingNeutral;
    loreMessage = "";
  } else if (result.completed) {
    outcomeLabel = "Victory!";
    outcomeClass = styles.headingVictory;
    loreMessage = getVictoryLine(loreSeed);
  } else if (result.enemiesDefeated === 0 && result.distancePercent < 1) {
    // Timer ran out before any progress — treated as timeout
    outcomeLabel = "Time's Up";
    outcomeClass = styles.headingDeath;
    loreMessage = getDeathMessage(null, loreSeed);
  } else {
    // Died in a duel — use the last enemy encountered as the source
    // (enemyId not directly available from result, so fall back to generic)
    outcomeLabel = "Fallen";
    outcomeClass = styles.headingDeath;
    loreMessage = getDeathMessage(null, loreSeed);
  }

  const heroId = result?.heroId ?? null;
  const heroSave = heroId ? saveData.heroes[heroId] : null;
  const totalCurrency = heroSave?.currency ?? 0;

  return (
    <div className={styles.screen}>
      <h2 className={`${styles.heading} ${outcomeClass}`}>{outcomeLabel}</h2>

      {loreMessage && <p className={styles.loreMessage}>{loreMessage}</p>}

      {result && (
        <div className={styles.panels}>
          {/* Run stats panel */}
          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>Run Summary</h3>
            <ul className={styles.statList}>
              <li>
                <span>Distance</span>
                <span className={styles.statValue}>{Math.round(result.distancePercent)}%</span>
              </li>
              <li>
                <span>Enemies defeated</span>
                <span className={styles.statValue}>{result.enemiesDefeated}</span>
              </li>
              <li>
                <span>Damage dealt</span>
                <span className={styles.statValue}>{result.duelDamageDealt}</span>
              </li>
              <li>
                <span>Boss defeated</span>
                <span className={styles.statValue}>{result.bossDefeated ? "Yes" : "No"}</span>
              </li>
              <li>
                <span>Coins collected</span>
                <span className={styles.statValue}>{result.coinsCollected.length}</span>
              </li>
            </ul>
          </section>

          {/* Reward breakdown panel */}
          {breakdown && (
            <section className={styles.panel}>
              <h3 className={styles.panelTitle}>Rewards</h3>
              <ul className={styles.statList}>
                <li>
                  <span>Distance reward</span>
                  <span className={styles.statValue}>{breakdown.distanceReward}</span>
                </li>
                <li>
                  <span>Kill reward</span>
                  <span className={styles.statValue}>{breakdown.enemyKillReward}</span>
                </li>
                <li>
                  <span>Damage reward</span>
                  <span className={styles.statValue}>{breakdown.duelDamageReward}</span>
                </li>
                <li>
                  <span>Boss reward</span>
                  <span className={styles.statValue}>{breakdown.bossReward}</span>
                </li>
                <li>
                  <span>Coin reward</span>
                  <span className={styles.statValue}>{breakdown.coinReward}</span>
                </li>
                <li className={styles.totalRow}>
                  <span>Total earned</span>
                  <span className={styles.statValue}>{breakdown.total} ¤</span>
                </li>
              </ul>
              <p className={styles.currencyBalance}>Balance: {totalCurrency} ¤</p>
            </section>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button onClick={() => actor.send({ type: "CONTINUE" })}>Continue to Upgrades</Button>
      </div>
    </div>
  );
}
