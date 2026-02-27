// ── Obstacle types ────────────────────────────────────────────────────────────

/**
 * Discriminated union for the two obstacle variants.
 *
 * - **TimeTax**: Hero automatically climbs (slowing traversal) unless they jump.
 * - **HealthTax**: Hero takes HP damage unless they jump or duck.
 */
export type ObstacleType = "timeTax" | "healthTax";

/**
 * An obstacle instance placed in a traversal segment at a specific position.
 * The `position` is in the same coordinate space as `TraversalContext.heroPosition`.
 */
export interface ObstacleInstance {
  /** Unique identifier for tracking collision and display state. */
  id: string;
  type: ObstacleType;
  /** Position along the segment where the obstacle sits (same units as heroPosition). */
  position: number;
  /** Whether the hero has already triggered this obstacle this segment. */
  triggered: boolean;
}

/** Width of the collision zone around each obstacle's position (in segment units). */
export const OBSTACLE_COLLISION_RADIUS = 60;
