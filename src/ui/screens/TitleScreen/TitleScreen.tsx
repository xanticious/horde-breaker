import { useGameActor } from "@ui/hooks/useGameActor";
import styles from "./TitleScreen.module.css";

export function TitleScreen() {
  const actor = useGameActor();

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Horde Breaker</h1>
      <p className={styles.subtitle}>Failure Makes You Stronger</p>
      <button className={styles.playButton} onClick={() => actor.send({ type: "START_GAME" })}>
        Play
      </button>
    </div>
  );
}
