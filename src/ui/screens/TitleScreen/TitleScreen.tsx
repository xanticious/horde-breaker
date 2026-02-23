import { useGameActor } from "@ui/hooks/useGameActor";
import { Button } from "@ui/components/Button/Button";
import styles from "./TitleScreen.module.css";

export function TitleScreen() {
  const actor = useGameActor();

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>Horde Breaker</h1>
      <p className={styles.subtitle}>Failure Makes You Stronger</p>
      <div className={styles.cta}>
        <Button size="lg" onClick={() => actor.send({ type: "START_GAME" })}>
          Play
        </Button>
      </div>
    </div>
  );
}
