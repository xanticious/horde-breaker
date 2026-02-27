// Core game logic — barrel export
export * from "./types/hero";
export * from "./types/run";
export * from "./types/save";
export * from "./types/chapter";
export * from "./types/enemy";
export * from "./types/upgrade";
export * from "./types/combat";
export * from "./machines/gameMachine";
export * from "./machines/traversalMachine";
export * from "./systems/timer";
export type { ObstacleType, ObstacleInstance } from "./entities/obstacles/obstacleBase";
export { OBSTACLE_COLLISION_RADIUS } from "./entities/obstacles/obstacleBase";
