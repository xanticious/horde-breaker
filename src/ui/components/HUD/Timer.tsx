import type { TimerPhase } from "@core/systems/timer";
import { formatTimerMs } from "@core/systems/timer";
import styles from "./HUD.module.css";

interface TimerProps {
  /** Remaining time in milliseconds. */
  remainingMs: number;
  phase: TimerPhase;
}

const PHASE_CLASS: Record<TimerPhase, string> = {
  safe: styles.timerSafe,
  warning: styles.timerWarning,
  critical: styles.timerCritical,
};

/** Countdown timer display. Changes colour based on urgency phase. */
export function Timer({ remainingMs, phase }: TimerProps) {
  return (
    <div className={`${styles.timer} ${PHASE_CLASS[phase]}`}>{formatTimerMs(remainingMs)}</div>
  );
}
