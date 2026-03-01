import { useEffect, useRef, useState } from "react";
import { useGameActor } from "@ui/hooks/useGameActor";
import { GameActorContext } from "@ui/providers/GameProvider";
import { HeroId } from "@core/types/hero";
import { ChapterId } from "@core/types/chapter";
import { EnemyId } from "@core/types/enemy";
import { Button } from "@ui/components/Button/Button";
import { HUD } from "@ui/components/HUD/HUD";
import { wolfBehavior } from "@core/entities/enemies/wolf";
import { GameRenderer } from "@rendering/GameRenderer";
import { InputManager } from "@input/InputManager";
import { GameAction } from "@input/types";
import { MAX_RUN_DURATION_MS } from "@data/balance.data";
import { BARBARIAN_HERO } from "@data/heroes/barbarian.data";
import { BARBARIAN_CHAPTERS } from "@data/chapters/barbarian-chapters.data";
import { BARBARIAN_ENEMIES } from "@data/enemies/barbarian-enemies.data";
import { generateLevel } from "@core/systems/levelGenerator";
import { deriveHeroStats } from "@core/systems/progression";
import type { RunEvent } from "@core/machines/runMachine";
import type { AnyActorRef } from "xstate";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const actor = useGameActor();
  const selectedHeroId = GameActorContext.useSelector((s) => s.context.selectedHeroId);

  // HUD state driven from the RunMachine child actor each frame.
  const [remainingMs, setRemainingMs] = useState(MAX_RUN_DURATION_MS);
  const [currentHp, setCurrentHp] = useState<number>(BARBARIAN_HERO.baseStats.maxHp);
  const maxHp = BARBARIAN_HERO.baseStats.maxHp;

  const canvasRef = useRef<HTMLDivElement>(null);
  // Tracks the previous renderer's destruction promise so each new mount
  // waits for the old GPU context to be fully freed before allocating a new
  // one. This prevents React StrictMode double-mount from racing two
  // Application.init() calls and exhausting GPU memory (D3D11 OOM).
  const prevDestroyedRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const parent = canvasRef.current;
    if (!parent) return;

    const renderer = new GameRenderer();
    const input = new InputManager();
    let mounted = true;
    let lastRunState = "traversal";

    // Capture and replace the chain before any awaits so that if this effect's
    // cleanup fires before prevDestroyed resolves the next mount still chains
    // correctly onto this renderer's whenDestroyed.
    const prevDestroyed = prevDestroyedRef.current;
    prevDestroyedRef.current = renderer.whenDestroyed;

    /**
     * Send an event to the RunMachine child actor (invoked as "runActor" by
     * GameMachine). Falls back gracefully when the actor is not yet running.
     */
    function sendToRunActor(event: RunEvent): void {
      const runActor = actor.getSnapshot().children["runActor"] as AnyActorRef | undefined;
      if (runActor) {
        runActor.send(event);
      }
    }

    // Wait for the previous renderer to finish tearing down its GPU context
    // before we request a new WebGL context. This prevents the React StrictMode
    // double-mount from running two Application.init() calls concurrently.
    prevDestroyed
      .then(() => renderer.init(parent))
      .then(() => {
        if (!mounted) {
          renderer.destroy();
          return;
        }

        renderer.startGameLoop((deltaMs) => {
          const inputSnapshot = input.getSnapshot();
          const gameSnapshot = actor.getSnapshot();
          const runActor = gameSnapshot.children["runActor"] as AnyActorRef | undefined;

          if (runActor) {
            // oxlint-disable-next-line typescript/no-explicit-any -- XState actor snapshot is dynamically typed at the child boundary
            const runSnapshot = runActor.getSnapshot() as any;
            const runState: string =
              typeof runSnapshot.value === "string" ? runSnapshot.value : "traversal";

            if (runState !== lastRunState) {
              lastRunState = runState;
              // Sync renderer mode on state change.
              if (runState === "duel") {
                const duelActor = runSnapshot.children?.["duelActor"] as AnyActorRef | undefined;
                if (duelActor) {
                  // oxlint-disable-next-line typescript/no-explicit-any -- dynamic child snapshot
                  const dSnap = duelActor.getSnapshot() as any;
                  renderer.setMode("duel", dSnap.context);
                }
              } else {
                renderer.setMode("traversal");
              }
            }

            if (runState === "traversal") {
              // Forward traversal input to the run actor.
              if (inputSnapshot.actions.has(GameAction.Jump)) {
                sendToRunActor({ type: "JUMP" });
              } else if (inputSnapshot.actions.has(GameAction.Duck)) {
                sendToRunActor({ type: "DUCK" });
              } else {
                sendToRunActor({ type: "STAND" });
              }
              if (inputSnapshot.actions.has(GameAction.Sprint)) {
                sendToRunActor({ type: "SPRINT" });
              } else if (inputSnapshot.actions.has(GameAction.SlowDown)) {
                sendToRunActor({ type: "SLOW" });
              }

              sendToRunActor({ type: "TICK", deltaMs });

              // Pull the traversal child snapshot for rendering.
              const traversalActor = runSnapshot.children?.["traversalActor"] as
                | AnyActorRef
                | undefined;
              if (traversalActor) {
                // oxlint-disable-next-line typescript/no-explicit-any -- dynamic child snapshot
                const tSnap = traversalActor.getSnapshot() as any;
                renderer.setTraversalContext(tSnap.context);
              }
            } else if (runState === "duel") {
              // Forward duel input to the run actor (which relays to duelActor).
              if (inputSnapshot.actions.has(GameAction.Attack)) {
                sendToRunActor({ type: "ATTACK" });
              }
              if (inputSnapshot.actions.has(GameAction.Defend)) {
                sendToRunActor({ type: "BLOCK" });
              }
              if (inputSnapshot.actions.has(GameAction.MoveLeft)) {
                sendToRunActor({ type: "MOVE_LEFT" });
              }
              if (inputSnapshot.actions.has(GameAction.MoveRight)) {
                sendToRunActor({ type: "MOVE_RIGHT" });
              }
              sendToRunActor({ type: "TICK", deltaMs });

              const duelActor = runSnapshot.children?.["duelActor"] as AnyActorRef | undefined;
              if (duelActor) {
                // oxlint-disable-next-line typescript/no-explicit-any -- dynamic child snapshot
                const dSnap = duelActor.getSnapshot() as any;
                const duelStateName = typeof dSnap.value === "string" ? dSnap.value : "idle";
                renderer.setDuelContext(dSnap.context, duelStateName);
              }
            }

            if (mounted) {
              setRemainingMs(runSnapshot.context.timer ?? MAX_RUN_DURATION_MS);
              setCurrentHp(runSnapshot.context.currentHp ?? BARBARIAN_HERO.baseStats.maxHp);
            }
          }

          input.endFrame();
        });
      });

    return () => {
      mounted = false;
      renderer.destroy();
      input.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- actor ref is stable for the component lifetime
  }, []);

  function handleEndRun() {
    actor.send({
      type: "END_RUN",
      result: {
        heroId: selectedHeroId ?? HeroId.Barbarian,
        chapter: ChapterId.Chapter1,
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

// Keep BARBARIAN_ENEMIES and EnemyId in scope for potential future use (wolf data for run config).
// These are currently used by the UpgradeScreen/GameScreen to initialize run context.
void BARBARIAN_ENEMIES;
void EnemyId;
void wolfBehavior;
void generateLevel;
void deriveHeroStats;
void BARBARIAN_CHAPTERS;
