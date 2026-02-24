import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { HeroId } from "@core/types/hero";
import { Button } from "@ui/components/Button/Button";
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
        distancePercent: 0,
        distanceReached: 0,
        enemiesDefeated: 0,
        duelDamageDealt: 0,
        bossDefeated: false,
        coinsCollected: [],
        completed: false,
      },
    });
  }

  return (
    <div className={styles.screen}>
      <p className={styles.label}>Game Screen — placeholder</p>
      <p className={styles.label}>Hero: {selectedHeroId ?? "none"}</p>
      <div className={styles.actions}>
        <Button variant="danger" onClick={handleEndRun}>
          End Run
        </Button>
      </div>
    </div>
  );
}
