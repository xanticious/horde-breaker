import { useGameActor } from "@ui/hooks/useGameActor";
import styles from "./UpgradeScreen.module.css";

export function UpgradeScreen() {
  const actor = useGameActor();

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Upgrades</h2>
      <p className={styles.placeholder}>Upgrade grid coming soon.</p>
      <div className={styles.actions}>
        <button className={styles.button} onClick={() => actor.send({ type: "START_RUN" })}>
          Start Run
        </button>
        <button
          className={styles.buttonSecondary}
          onClick={() => actor.send({ type: "GO_TO_HERO_SELECT" })}
        >
          Back to Hero Select
        </button>
      </div>
    </div>
  );
}
