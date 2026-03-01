import type { UpgradeCategoryData, UpgradeGrid, UpgradeLevel } from "@core/types/upgrade";
import { canAffordUpgrade } from "@core/systems/economy";
import styles from "./UpgradeGrid.module.css";

interface UpgradeGridProps {
  upgradeCategories: readonly UpgradeCategoryData[];
  currentUpgrades: UpgradeGrid;
  currency: number;
  onPurchase: (categoryId: string) => void;
}

/**
 * Renders the 6-row × 5-column upgrade grid. Each row is an upgrade category;
 * each column represents one purchasable step (level 1→2 through 5→6).
 *
 * Only the very next unpurchased level is clickable. Earlier columns show a
 * purchased checkmark, later columns show the cost dimmed to convey the
 * sequential dependency to the player.
 */
export function UpgradeGrid({
  upgradeCategories,
  currentUpgrades,
  currency,
  onPurchase,
}: UpgradeGridProps) {
  return (
    <table className={styles.grid} aria-label="Upgrade grid">
      <thead>
        <tr>
          <th className={styles.categoryHeader}>Category</th>
          {[2, 3, 4, 5, 6].map((level) => (
            <th key={level} className={styles.levelHeader}>
              Lv {level}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {upgradeCategories.map((category) => {
          const currentLevel = (currentUpgrades[category.id] ?? 1) as UpgradeLevel;
          return (
            <tr key={category.id}>
              <td className={styles.categoryName}>{category.name}</td>
              {[0, 1, 2, 3, 4].map((colIdx) => {
                // colIdx 0–4 maps to upgrade steps 1→2 through 5→6.
                const targetLevel = colIdx + 2;
                const cost = category.costs[colIdx] ?? Infinity;
                const isPurchased = currentLevel >= targetLevel;
                // Only the immediately next step is purchasable.
                const isNext = currentLevel === colIdx + 1;
                const affordable = isNext && canAffordUpgrade(currency, cost);

                if (isPurchased) {
                  return (
                    <td key={colIdx} className={`${styles.cell} ${styles.purchased}`}>
                      <span aria-label="Purchased">✓</span>
                    </td>
                  );
                }

                if (isNext) {
                  return (
                    <td
                      key={colIdx}
                      className={`${styles.cell} ${affordable ? styles.affordable : styles.unaffordable}`}
                    >
                      <button
                        className={styles.purchaseButton}
                        onClick={() => onPurchase(category.id)}
                        disabled={!affordable}
                        aria-label={`Upgrade ${category.name} to level ${targetLevel} for ${cost} currency`}
                      >
                        {cost} ¤
                      </button>
                    </td>
                  );
                }

                // Locked — future step, must buy earlier levels first.
                return (
                  <td key={colIdx} className={`${styles.cell} ${styles.locked}`}>
                    <span className={styles.cost}>{cost} ¤</span>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
