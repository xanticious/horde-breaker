import { useGameActor } from "@ui/hooks/useGameActor";
import { HeroId } from "@core/types/hero";
import styles from "./HeroSelect.module.css";

export function HeroSelect() {
  const actor = useGameActor();

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Select Your Hero</h2>
      <div className={styles.heroList}>
        <button
          className={styles.heroCard}
          onClick={() => actor.send({ type: "SELECT_HERO", heroId: HeroId.Barbarian })}
        >
          <span className={styles.heroName}>Barbarian Berzerker</span>
          <span className={styles.heroDescription}>
            Melee axe swings. Block enemy attacks. Leap to strike.
          </span>
        </button>
      </div>
    </div>
  );
}
