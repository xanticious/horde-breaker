# Horde Breaker — Copilot Instructions

## Project Overview

Side-scrolling action game with a prestige/upgrade loop. TypeScript + React 19 + XState v5 + PixiJS 8 + Howler.js. Built with Vite, tested with Vitest + Playwright. No backend — LocalStorage persistence only. MVP scope: Barbarian hero only (3 chapters, 6×6 upgrade grid).

## Architecture (Strict Layered, Unidirectional Data Flow)

State flows downward (XState → rendering). Events flow upward (input → state machines).

- **`src/core/`** — Game logic, zero DOM dependencies. XState machines + pure system functions.
- **`src/data/`** — Static game data (`as const satisfies` objects). Hero stats, enemy rosters, balance tables, lore.
- **`src/rendering/`** — PixiJS 8 rendering. Reads state each frame, never mutates it.
- **`src/audio/`** — Howler.js. `AudioManager` singleton wraps `MusicPlayer` + `SfxPlayer`.
- **`src/input/`** — `InputManager` polls keyboard/mouse into `InputSnapshot`; context-free (machines interpret actions).
- **`src/services/`** — `SaveManager` (LocalStorage), schema migrations, export/import.
- **`src/ui/`** — React components. CSS Modules. XState state machine IS the router (no react-router).
- **`src/debug/`** — Dev-only. URL query param config (`?debug=true&hero=barbarian&chapter=3`).
- **`src/utils/`** — Pure utilities: math, seeded PRNG, timing helpers.

**Dependency rule (no circular imports):** `types` ← `data` ← `core/systems` ← `core/machines` ← `rendering` / `ui`

## XState Actor Hierarchy

```
GameActor (root, app lifetime) → spawns:
  └── RunActor (per 90s run) → spawns:
      ├── TraversalActor (per traversal segment)
      └── DuelActor (per combat encounter)
```

Machines are the single source of truth. React reads via `useSelector` from `@xstate/react`. PixiJS reads snapshots each frame in the ticker loop. Events use `UPPER_SNAKE_CASE` (e.g., `START_RUN`, `ATTACK`, `ENEMY_DEFEATED`).

## Key Conventions

- **`as const satisfies`** for all static data files (`*.data.ts`).
- **Co-located tests** — every `foo.ts` has a sibling `foo.test.ts`. No `__tests__/` directories.
- **Barrel exports** — each `src/*/index.ts` re-exports the public API. Cross-module imports go through barrels only.
- **Path aliases** — `@core/*`, `@data/*`, `@rendering/*`, `@audio/*`, `@input/*`, `@services/*`, `@ui/*`, `@debug/*`, `@utils/*`.

## Naming Conventions

| Artifact          | Convention                                          | Example                                  |
| ----------------- | --------------------------------------------------- | ---------------------------------------- |
| React components  | PascalCase files                                    | `HeroSelect.tsx`                         |
| Modules/utilities | camelCase files                                     | `combat.ts`                              |
| Data files        | kebab-case + `.data.ts`                             | `barbarian-enemies.data.ts`              |
| Tests             | `.test.ts(x)` sibling                               | `combat.test.ts`                         |
| CSS Modules       | `.module.css` sibling                               | `HeroSelect.module.css`                  |
| Types/Interfaces  | PascalCase; `I` prefix only for swappable contracts | `HeroDefinition`, `IAnimationController` |
| Constants         | `UPPER_SNAKE_CASE`                                  | `MAX_RUN_DURATION_MS`                    |
| XState machines   | camelCase + `Machine`                               | `gameMachine`, `duelMachine`             |
| XState events     | `UPPER_SNAKE_CASE`                                  | `START_RUN`                              |

## Commands

```bash
npm run dev          # Vite dev server with HMR
npm run build        # tsc + vite build (production)
npm test             # Vitest watch mode
npm run test:run     # Vitest single run (CI)
npm run test:e2e     # Playwright E2E tests
npm run lint         # ESLint (flat config)
npm run typecheck    # tsc --noEmit
```

## Debugging

Use URL query params — no debug UI needed:

```
?debug=true&hero=barbarian&chapter=3&skipTo=boss&upgrades=max&invincible=true
?debug=true&logLevel=debug&logModules=combat,economy
?debug=true&showHitboxes=true&showFps=true&seed=12345
```

## Adding Content

- **New enemy:** Add data in `src/data/enemies/`, behavior strategy in `src/core/entities/enemies/` implementing `IEnemyBehavior`, animation assets under `assets/sprites/enemies/`.
- **New hero:** Follow `docs/ADDING_A_HERO.md`. Requires: data file, entity behavior, asset bundle, enemy roster, chapter definitions.
- **Tuning balance:** Edit `src/data/balance.data.ts` and per-hero `*.data.ts` files. All costs, multipliers, and stat curves live in data, not code.

## Code Guidelines

- **DRY** — Don't repeat yourself. Extract shared logic into `core/systems/` pure functions or `utils/`. Data duplication belongs in `src/data/` files, not scattered across code.
- **Comments explain _why_, not _what_** — Use comments sparingly. The code should be self-documenting through clear naming. Reserve comments for non-obvious design decisions, workarounds, or "why this approach" rationale.
- **No `any`** — use `unknown` + type narrowing.
- **Composition over inheritance** — Entity behaviors use strategy interfaces (`IEnemyBehavior`, `IAnimationController`), not class hierarchies.
- **Pure functions for game logic** — `core/systems/` functions have no side effects; no `Date.now()`, no randomness (accept PRNG seed as param).

## Testing Priorities

State machines and `core/systems/` are the most critical code — test exhaustively. Use `createActor()` + `.send()` + `.getSnapshot()` pattern for machine tests. React component tests use `@testing-library/react` with a `createTestProvider()` wrapper that injects mock game state. 80% coverage target on `src/core/`, `src/ui/`, `src/services/`.
