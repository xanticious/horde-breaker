import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { Button } from "@ui/components/Button/Button";
import { ChapterId } from "@core/types/chapter";
import { HeroId } from "@core/types/hero";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";
import { BARBARIAN_CHAPTERS } from "@data/chapters/barbarian-chapters.data";
import { wolfBehavior } from "@core/entities/enemies/wolf";
import { generateLevel } from "@core/systems/levelGenerator";
import { deriveHeroStats } from "@core/systems/progression";
import styles from "./UpgradeScreen.module.css";

export function UpgradeScreen() {
  const actor = useGameActor();
  const selectedHeroId = GameActorContext.useSelector((s) => s.context.selectedHeroId);

  function handleStartRun() {
    // For Sprint 11, chapter selection is fixed to Chapter 1.
    // Sprint 12+ will read from hero save data.
    const chapter = ChapterId.Chapter1;
    const chapterDef = BARBARIAN_CHAPTERS[chapter];

    // Derive stats with no upgrades until the upgrade grid is wired (Sprint 13).
    const heroStats = deriveHeroStats(BARBARIAN_HERO, {});

    actor.send({
      type: "START_RUN",
      chapter,
      heroStats,
      enemyLayout: generateLevel(chapterDef, Date.now()),
      obstaclesBySegment: [],
      enemyBehaviorFactory: () => wolfBehavior,
      rngSeed: Date.now(),
    });
  }

  // Debug display for selected hero (to be replaced by upgrade grid in Sprint 13).
  const heroLabel = selectedHeroId === HeroId.Barbarian ? "Barbarian Berzerker" : selectedHeroId;

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Upgrades</h2>
      {heroLabel && <p className={styles.placeholder}>Hero: {heroLabel}</p>}
      <p className={styles.placeholder}>Upgrade grid coming soon.</p>
      <div className={styles.actions}>
        <Button onClick={handleStartRun}>Start Run</Button>
        <Button variant="secondary" onClick={() => actor.send({ type: "GO_TO_HERO_SELECT" })}>
          Back to Hero Select
        </Button>
      </div>
    </div>
  );
}
