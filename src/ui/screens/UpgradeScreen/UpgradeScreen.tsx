import { useGameActor } from "@ui/hooks/useGameActor";
import { Button } from "@ui/components/Button/Button";
import styles from "./UpgradeScreen.module.css";

export function UpgradeScreen() {
  const actor = useGameActor();

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Upgrades</h2>
      <p className={styles.placeholder}>Upgrade grid coming soon.</p>
      <div className={styles.actions}>
        <Button onClick={() => actor.send({ type: "START_RUN" })}>Start Run</Button>
        <Button variant="secondary" onClick={() => actor.send({ type: "GO_TO_HERO_SELECT" })}>
          Back to Hero Select
        </Button>
      </div>
    </div>
  );
}
