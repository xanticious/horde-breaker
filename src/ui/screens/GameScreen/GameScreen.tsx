import { useEffect, useRef } from "react";
import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { HeroId } from "@core/types/hero";
import { Button } from "@ui/components/Button/Button";
import { GameRenderer } from "@rendering/GameRenderer";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const actor = useGameActor();
  const selectedHeroId = GameActorContext.useSelector((s) => s.context.selectedHeroId);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = canvasRef.current;
    if (!parent) return;

    const renderer = new GameRenderer();

    // PixiJS 8 requires async init — track mounted state to avoid state
    // updates after unmount if the component tears down before init resolves.
    let mounted = true;

    renderer.init(parent).then(() => {
      if (!mounted) {
        renderer.destroy();
        return;
      }
      // Game loop starts after canvas is ready; onUpdate will be expanded in
      // Sprint 11 when RunMachine drives per-frame state.
      renderer.startGameLoop((_deltaMs) => {});
    });

    return () => {
      mounted = false;
      renderer.destroy();
    };
  }, []);

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
      {/* PixiJS renders into this div — fills available space */}
      <div ref={canvasRef} className={styles.canvas} />
      <div className={styles.hud}>
        <Button variant="danger" onClick={handleEndRun}>
          End Run
        </Button>
      </div>
    </div>
  );
}
