import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import styles from "./ResultsScreen.module.css";

export function ResultsScreen() {
  const actor = useGameActor();
  const result = GameActorContext.useSelector((s) => s.context.lastRunResult);

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Run Results</h2>
      {result && (
        <ul className={styles.statList}>
          <li>Currency earned: {result.currencyEarned}</li>
          <li>Distance reached: {result.distanceReached}%</li>
          <li>Enemies defeated: {result.enemiesDefeated}</li>
        </ul>
      )}
      <div className={styles.actions}>
        <button className={styles.button} onClick={() => actor.send({ type: "CONTINUE" })}>
          Continue to Upgrades
        </button>
      </div>
    </div>
  );
}
