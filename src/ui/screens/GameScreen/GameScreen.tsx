import { useEffect, useRef, useState } from "react";
import { createActor } from "xstate";
import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { HeroId } from "@core/types/hero";
import { Button } from "@ui/components/Button/Button";
import { HUD } from "@ui/components/HUD/HUD";
import { traversalMachine } from "@core/machines/traversalMachine";
import { GameRenderer } from "@rendering/GameRenderer";
import { InputManager } from "@input/InputManager";
import { GameAction } from "@input/types";
import { MAX_RUN_DURATION_MS } from "@data/balance.data";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";
import { tickTimer } from "@core/systems/timer";
import type { ObstacleInstance } from "@core/entities/obstacles/obstacleBase";
import styles from "./GameScreen.module.css";

const STANDALONE_TRAVERSAL_OBSTACLES: ObstacleInstance[] = [
  { id: "tt-1", type: "timeTax", position: 1_100, triggered: false },
  { id: "ht-1", type: "healthTax", position: 1_850, triggered: false },
  { id: "ht-2", type: "healthTax", position: 2_650, triggered: false },
  { id: "tt-2", type: "timeTax", position: 3_450, triggered: false },
  { id: "ht-3", type: "healthTax", position: 4_250, triggered: false },
];

export function GameScreen() {
  const actor = useGameActor();
  const selectedHeroId = GameActorContext.useSelector((s) => s.context.selectedHeroId);

  // Local HUD state — will be owned by RunMachine in Sprint 11.
  // For now this screen drives a standalone traversal actor.
  const [remainingMs, setRemainingMs] = useState(MAX_RUN_DURATION_MS);
  const [currentHp, setCurrentHp] = useState<number>(BARBARIAN_HERO.baseStats.maxHp);
  const maxHp = BARBARIAN_HERO.baseStats.maxHp;

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = canvasRef.current;
    if (!parent) return;

    const renderer = new GameRenderer();
    const input = new InputManager();
    const traversalActor = createActor(traversalMachine, {
      input: {
        speed: BARBARIAN_HERO.baseStats.runSpeed,
        segmentLength: 100_000,
        obstacles: STANDALONE_TRAVERSAL_OBSTACLES.map((obstacle) => ({ ...obstacle })),
        currentHp: BARBARIAN_HERO.baseStats.maxHp,
        maxHp: BARBARIAN_HERO.baseStats.maxHp,
      },
    });

    traversalActor.start();
    renderer.setTraversalContext(traversalActor.getSnapshot().context);

    let localRemainingMs = MAX_RUN_DURATION_MS;
    let mounted = true;

    renderer.init(parent).then(() => {
      if (!mounted) {
        renderer.destroy();
        return;
      }

      renderer.startGameLoop((deltaMs) => {
        // Translate input snapshot to traversal machine events.
        const snapshot = input.getSnapshot();
        if (snapshot.actions.has(GameAction.Jump)) {
          traversalActor.send({ type: "JUMP" });
        } else if (snapshot.actions.has(GameAction.Duck)) {
          traversalActor.send({ type: "DUCK" });
        } else {
          traversalActor.send({ type: "STAND" });
        }
        if (snapshot.actions.has(GameAction.Sprint)) {
          traversalActor.send({ type: "SPRINT" });
        }
        if (snapshot.actions.has(GameAction.SlowDown)) {
          traversalActor.send({ type: "SLOW" });
        }
        traversalActor.send({ type: "TICK", deltaMs });
        const traversalContext = traversalActor.getSnapshot().context;
        renderer.setTraversalContext(traversalContext);

        setCurrentHp(traversalContext.currentHp);
        localRemainingMs = tickTimer(localRemainingMs, deltaMs);
        setRemainingMs(localRemainingMs);

        input.endFrame();
      });
    });

    return () => {
      mounted = false;
      renderer.destroy();
      input.destroy();
      traversalActor.stop();
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

      {/* React HUD overlay — pointer-events: none so input reaches the canvas */}
      <div className={styles.hud}>
        <HUD remainingMs={remainingMs} currentHp={currentHp} maxHp={maxHp} />
      </div>

      <div className={styles.actions}>
        <Button variant="danger" onClick={handleEndRun}>
          End Run
        </Button>
      </div>
    </div>
  );
}
