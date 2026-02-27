import styles from "./HUD.module.css";

interface HealthBarProps {
  current: number;
  max: number;
}

/** Returns the CSS class for the fill colour based on HP fraction. */
function getFillClass(fraction: number): string {
  if (fraction > 0.5) return styles.healthBarFillHigh;
  if (fraction > 0.25) return styles.healthBarFillMed;
  return styles.healthBarFillLow;
}

/** HP bar displayed in the top-left corner of the HUD. */
export function HealthBar({ current, max }: HealthBarProps) {
  const fraction = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const widthPct = `${(fraction * 100).toFixed(1)}%`;

  return (
    <div className={styles.healthBarWrapper}>
      <span className={styles.healthBarLabel}>HP</span>
      <div
        className={styles.healthBarTrack}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`${styles.healthBarFill} ${getFillClass(fraction)}`}
          style={{ width: widthPct }}
        />
      </div>
    </div>
  );
}
