import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { HeroId } from "@core/types/hero";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const actor = useGameActor();
  const selectedHeroId = GameActorContext.useSelector((s) => s.context.selectedHeroId);

  function handleEndRun() {
    actor.send({
      type: "END_RUN",
      result: {
        heroId: selectedHeroId ?? HeroId.Barbarian,
        chapter: 1,
        currencyEarned: 0,
        distanceReached: 0,
        enemiesDefeated: 0,
        completed: false,
      },
    });
  }

  return (
    <div className={styles.screen}>
      <p className={styles.label}>Game Screen — placeholder</p>
      <p className={styles.label}>Hero: {selectedHeroId ?? "none"}</p>
      <button className={styles.button} onClick={handleEndRun}>
        End Run
      </button>
    </div>
  );
}
