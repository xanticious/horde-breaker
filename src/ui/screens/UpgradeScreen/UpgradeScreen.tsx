import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { Button } from "@ui/components/Button/Button";
import { ChapterId } from "@core/types/chapter";
import { HeroId } from "@core/types/hero";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";
import { BARBARIAN_CHAPTERS } from "@data/chapters/barbarian-chapters.data";
import { EnemyId } from "@core/types/enemy";
import { wolfBehavior } from "@core/entities/enemies/wolf";
import { swordsmanBehavior } from "@core/entities/enemies/swordsman";
import { shieldbearerBehavior } from "@core/entities/enemies/shieldbearer";
import { generateLevel } from "@core/systems/levelGenerator";
import { deriveHeroStats } from "@core/systems/progression";
import { UpgradeGrid } from "./UpgradeGrid";
import styles from "./UpgradeScreen.module.css";

export function UpgradeScreen() {
  const actor = useGameActor();
  const selectedHeroId = GameActorContext.useSelector((s) => s.context.selectedHeroId);
  const heroSave = GameActorContext.useSelector(
    (s) => s.context.saveData.heroes[s.context.selectedHeroId ?? HeroId.Barbarian],
  );

  const currency = heroSave?.currency ?? 0;
  const currentUpgrades = heroSave?.upgrades ?? {};

  function handleStartRun() {
    const chapter = ChapterId.Chapter1;
    const chapterDef = BARBARIAN_CHAPTERS[chapter];

    // Derive stats using the hero's current purchased upgrades so run
    // performance reflects spending done on this screen.
    const heroStats = deriveHeroStats(BARBARIAN_HERO, currentUpgrades);

    actor.send({
      type: "START_RUN",
      chapter,
      heroStats,
      enemyLayout: generateLevel(chapterDef, Date.now()),
      obstaclesBySegment: [],
      enemyBehaviorFactory: (enemyId: string) => {
        switch (enemyId) {
          case EnemyId.Swordsman:
            return swordsmanBehavior;
          case EnemyId.Shieldbearer:
            return shieldbearerBehavior;
          default:
            return wolfBehavior;
        }
      },
      rngSeed: Date.now(),
    });
  }

  function handlePurchaseUpgrade(categoryId: string) {
    actor.send({ type: "PURCHASE_UPGRADE", categoryId });
  }

  const heroLabel = selectedHeroId === HeroId.Barbarian ? "Barbarian Berzerker" : selectedHeroId;

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>Upgrades</h2>
      {heroLabel && <p className={styles.heroLabel}>{heroLabel}</p>}
      <p className={styles.balance}>
        Balance: <span className={styles.currencyValue}>{currency} ¤</span>
      </p>
      <UpgradeGrid
        upgradeCategories={BARBARIAN_HERO.upgradeCategories}
        currentUpgrades={currentUpgrades}
        currency={currency}
        onPurchase={handlePurchaseUpgrade}
      />
      <div className={styles.actions}>
        <Button onClick={handleStartRun}>Start Run</Button>
        <Button variant="secondary" onClick={() => actor.send({ type: "GO_TO_HERO_SELECT" })}>
          Back to Hero Select
        </Button>
      </div>
    </div>
  );
}
