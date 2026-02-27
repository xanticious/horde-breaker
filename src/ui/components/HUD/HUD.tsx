import { Timer } from "./Timer";
import { HealthBar } from "./HealthBar";
import { getTimerPhase } from "@core/systems/timer";
import { MAX_RUN_DURATION_MS } from "@data/balance.data";
import styles from "./HUD.module.css";

interface HUDProps {
  /** Remaining run time in milliseconds. Defaults to MAX_RUN_DURATION_MS until RunMachine wires this. */
  remainingMs?: number;
  currentHp: number;
  maxHp: number;
}

/**
 * React overlay rendered on top of the PixiJS canvas during a run.
 * Uses `pointer-events: none` so all mouse/keyboard events pass through to the game.
 */
export function HUD({ remainingMs = MAX_RUN_DURATION_MS, currentHp, maxHp }: HUDProps) {
  const phase = getTimerPhase(remainingMs);
  return (
    <div className={styles.hud}>
      <Timer remainingMs={remainingMs} phase={phase} />
      <HealthBar current={currentHp} max={maxHp} />
    </div>
  );
}
