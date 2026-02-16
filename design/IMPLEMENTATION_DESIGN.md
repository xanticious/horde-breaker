# Horde Breaker — Implementation Design

> **Document version:** 1.0  
> **Last updated:** 2026-02-15  
> **Status:** Draft — awaiting review  
> **Audience:** Developers, QA, Stakeholders  
> **Companion:** see `DESIGN_NOTES.md` for gameplay and creative direction

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack — Final Selections](#2-tech-stack--final-selections)
3. [Project Structure](#3-project-structure)
4. [Coding Standards & Conventions](#4-coding-standards--conventions)
5. [State Architecture (XState v5)](#5-state-architecture-xstate-v5)
6. [Game Systems](#6-game-systems)
7. [Rendering Pipeline (PixiJS 8)](#7-rendering-pipeline-pixijs-8)
8. [Animation System (Pluggable)](#8-animation-system-pluggable)
9. [Audio System (Howler.js)](#9-audio-system-howlerjs)
10. [Input System](#10-input-system)
11. [UI Layer (React 19 + CSS Modules)](#11-ui-layer-react-19--css-modules)
12. [Data & Persistence](#12-data--persistence)
13. [Asset Pipeline](#13-asset-pipeline)
14. [Debug & Developer Tooling](#14-debug--developer-tooling)
15. [Testing Strategy](#15-testing-strategy)
16. [Performance Budgets](#16-performance-budgets)
17. [Milestone Plan & MVP Scope](#17-milestone-plan--mvp-scope)
18. [Architectural Concerns & Risk Register](#18-architectural-concerns--risk-register)

---

## 1. Architecture Overview

### 1.1 Guiding Principles

| Principle                        | What it means in practice                                                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Separation of Concerns**       | Game logic (state machines) knows nothing about rendering. Rendering reads state, never mutates it. UI is a projection of state.                   |
| **Data-Driven Design**           | Hero stats, enemy rosters, upgrade costs, and level layouts live in static data files (TypeScript `as const` objects), not scattered in code.      |
| **Testability First**            | Every system is unit-testable in isolation. State machines can be tested without a browser. Rendering can be swapped for a null renderer in tests. |
| **DRY / Single Source of Truth** | One canonical type definition per concept (Hero, Enemy, Upgrade). Shared via barrel exports.                                                       |
| **Pluggable Subsystems**         | Animation, audio, and persistence are behind interfaces so implementations can be swapped (e.g., spritesheet → Spine).                             |
| **Deterministic Game State**     | All game state lives in XState machines. Given the same sequence of events, you get the same state. This enables replay, testing, and debugging.   |

### 1.2 High-Level Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer (React 19)               │
│   Menus · HUD · Upgrade Screen · Results Screen      │
│   CSS Modules · @xstate/react hooks                  │
├─────────────────────────────────────────────────────┤
│                 Bridge / Glue Layer                   │
│   React ↔ PixiJS lifecycle · Event bus               │
│   useSelector() for derived state                    │
├─────────────────────────────────────────────────────┤
│               Rendering Layer (PixiJS 8)             │
│   Canvas · Parallax · Sprite rendering               │
│   Screen shake · Damage numbers · Particles          │
├─────────────────────────────────────────────────────┤
│              Game Logic Layer (XState v5)             │
│   State machines · Actor system · Pure functions     │
│   Zero DOM / rendering dependencies                  │
├─────────────────────────────────────────────────────┤
│                 Data & Services Layer                 │
│   Hero data · Enemy data · Balance tables            │
│   SaveManager · AudioManager · InputManager          │
└─────────────────────────────────────────────────────┘
```

**Data flows downward** (state → rendering). **Events flow upward** (input → state machines). This is a strict unidirectional data flow.

### 1.3 Runtime Flow

```
Browser loads → Vite serves index.html
  → React mounts <App />
  → App creates the root XState actor (GameMachine)
  → GameMachine starts in "titleScreen" state
  → React renders TitleScreen component
  → User clicks "Play" → event sent to GameMachine
  → GameMachine transitions to "heroSelect"
  → React renders HeroSelect component
  → User selects hero + chapter → event sent
  → GameMachine spawns a RunMachine (child actor)
  → PixiJS Application initializes in the canvas ref
  → RunMachine drives the game loop (traversal ↔ duel)
  → PixiJS reads RunMachine state each frame to render
  → Run ends (death/victory/timeout)
  → RunMachine sends result to GameMachine
  → GameMachine transitions to "results" then "upgrade"
  → React renders ResultsScreen, UpgradeScreen
  → Cycle repeats
```

---

## 2. Tech Stack — Final Selections

| Category                   | Technology                                      | Version (target)                 | Rationale                                                                                                                   |
| -------------------------- | ----------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Language**               | TypeScript                                      | 5.4+                             | Strict mode. Full type safety across state machines, game data, React components.                                           |
| **UI Framework**           | React                                           | 19.x                             | Component-based UI for menus/HUD. `useSyncExternalStore` and `@xstate/react` for state binding.                             |
| **State Management**       | XState                                          | 5.x (`xstate` + `@xstate/react`) | Actor-based state machines. Game state is the machine's context + state value. Deterministic, serializable, inspectable.    |
| **2D Rendering**           | PixiJS                                          | 8.x                              | WebGL2/WebGPU renderer. Ticker-driven game loop. Containers, Sprites, AnimatedSprite, ParticleContainer.                    |
| **Animation**              | Pluggable (spritesheet default, Spine optional) | —                                | Interface-based; MVP ships with spritesheet `AnimatedSprite`. Spine (`@esotericsoftware/spine-pixi-v8`) can be added later. |
| **Audio**                  | Howler.js                                       | 2.x                              | Web Audio API with HTML5 fallback. Audio sprites for SFX. Separate `Howl` instances per music track.                        |
| **Styling**                | CSS Modules                                     | —                                | `.module.css` files co-located with components. Zero runtime cost. Scoped class names.                                      |
| **Bundler**                | Vite                                            | 6.x                              | Near-instant HMR, native ESM, built-in TypeScript, optimized production builds.                                             |
| **Unit/Integration Tests** | Vitest                                          | 3.x                              | Vite-native, Jest-compatible API, shares `vite.config.ts`, fast watch mode.                                                 |
| **Component Tests**        | Vitest + React Testing Library                  | —                                | `@testing-library/react` for React component assertions.                                                                    |
| **E2E Tests**              | Playwright                                      | latest                           | Cross-browser, auto-waiting, screenshot comparison for visual regression.                                                   |
| **Linting**                | ESLint (flat config) + Prettier                 | —                                | `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-import`.                                                  |
| **Package Manager**        | npm                                             | 10.x                             | Lockfile-based, CI-friendly.                                                                                                |

### 2.1 Key npm Dependencies

```jsonc
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "xstate": "^5.20.0",
    "@xstate/react": "^5.0.0",
    "pixi.js": "^8.6.0",
    "howler": "^2.2.4",
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^6.1.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.50.0",
    "@playwright/test": "^1.50.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "prettier": "^3.0.0",
    "jsdom": "^25.0.0",
  },
}
```

> **Optional Spine dependency** (requires license):  
> `"@esotericsoftware/spine-pixi-v8": "^4.2.0"`

---

## 3. Project Structure

```
horde-breaker/
├── design/                             # ── DESIGN & PLANNING DOCS ──
│   ├── DESIGN_NOTES.md                # Game design document
│   ├── IMPLEMENTATION_DESIGN.md       # Technical architecture (this file)
│   └── IMPLEMENTATION_PLAN.md         # Sprint-based implementation plan
├── index.html                          # Vite entry (mounts #root)
├── vite.config.ts                      # Vite + React plugin config
├── vitest.config.ts                    # Vitest config (extends vite)
├── tsconfig.json                       # Strict TS config
├── tsconfig.node.json                  # Node-side TS (configs, scripts)
├── eslint.config.js                    # Flat ESLint config
├── .prettierrc                         # Prettier rules
├── playwright.config.ts               # Playwright E2E config
├── package.json
│
├── public/                             # Static assets (served as-is)
│   ├── favicon.ico
│   └── fonts/
│
├── src/
│   ├── main.tsx                        # React entry point
│   ├── App.tsx                         # Root component — mounts GameProvider
│   ├── App.module.css
│   ├── vite-env.d.ts                   # Vite client types
│   │
│   ├── core/                           # ── GAME LOGIC (zero DOM deps) ──
│   │   ├── index.ts                    # Barrel export
│   │   │
│   │   ├── machines/                   # XState state machines
│   │   │   ├── gameMachine.ts          # Root: title→heroSelect→run→results→upgrade
│   │   │   ├── gameMachine.test.ts
│   │   │   ├── runMachine.ts           # Single run: traversal↔duel, timer, health
│   │   │   ├── runMachine.test.ts
│   │   │   ├── duelMachine.ts          # Mini-duel: hero vs enemy(s) combat
│   │   │   ├── duelMachine.test.ts
│   │   │   ├── traversalMachine.ts     # Traversal segment: obstacles, coins, movement
│   │   │   ├── traversalMachine.test.ts
│   │   │   ├── tutorialMachine.ts      # Chapter 0 guided tutorial flow
│   │   │   ├── tutorialMachine.test.ts
│   │   │   └── types.ts               # Shared machine event/context types
│   │   │
│   │   ├── systems/                    # Pure game logic functions
│   │   │   ├── combat.ts              # Damage calc, block logic, knockback
│   │   │   ├── combat.test.ts
│   │   │   ├── economy.ts             # Reward calc, cost scaling, currency
│   │   │   ├── economy.test.ts
│   │   │   ├── progression.ts         # Upgrade application, stat derivation
│   │   │   ├── progression.test.ts
│   │   │   ├── health.ts              # HP pool, damage, optional regen
│   │   │   ├── health.test.ts
│   │   │   ├── timer.ts               # Run timer logic (90s countdown)
│   │   │   ├── timer.test.ts
│   │   │   ├── levelGenerator.ts      # Procedural enemy placement per chapter
│   │   │   ├── levelGenerator.test.ts
│   │   │   └── prestige.ts            # Prestige reset & token logic
│   │   │
│   │   ├── entities/                   # Entity behavior definitions
│   │   │   ├── heroes/
│   │   │   │   ├── heroBase.ts        # Shared hero interface & base behavior
│   │   │   │   ├── barbarian.ts       # Barbarian-specific combat behavior
│   │   │   │   ├── barbarian.test.ts
│   │   │   │   ├── archer.ts
│   │   │   │   └── wizard.ts
│   │   │   ├── enemies/
│   │   │   │   ├── enemyBase.ts       # Shared enemy interface & base AI
│   │   │   │   ├── wolf.ts            # Wolf behavior (pounce → retreat)
│   │   │   │   ├── wolf.test.ts
│   │   │   │   ├── swordsman.ts
│   │   │   │   ├── shieldbearer.ts
│   │   │   │   ├── highlandArcher.ts
│   │   │   │   ├── pikeman.ts
│   │   │   │   ├── berserker.ts
│   │   │   │   └── warHoundHandler.ts
│   │   │   └── obstacles/
│   │   │       ├── obstacleBase.ts     # TimeTax vs HealthTax obstacle types
│   │   │       └── obstacleSets.ts    # Per-hero themed obstacle configs
│   │   │
│   │   └── types/                      # Shared domain types
│   │       ├── hero.ts                # HeroId, HeroDefinition, HeroStats
│   │       ├── enemy.ts               # EnemyId, EnemyDefinition, EnemyBehavior
│   │       ├── upgrade.ts             # UpgradeCategory, UpgradeLevel, UpgradeGrid
│   │       ├── chapter.ts             # ChapterId, ChapterDefinition
│   │       ├── combat.ts              # DuelState, AttackResult, DamageEvent
│   │       ├── run.ts                 # RunResult, RunPhase, RewardBreakdown
│   │       └── save.ts               # SaveData schema, version
│   │
│   ├── data/                           # ── STATIC GAME DATA (as const) ──
│   │   ├── index.ts
│   │   ├── heroes/
│   │   │   ├── barbarian.data.ts      # Stats, upgrade grid, costs, ability params
│   │   │   ├── archer.data.ts
│   │   │   └── wizard.data.ts
│   │   ├── enemies/
│   │   │   ├── barbarian-enemies.data.ts  # Enemy roster per hero
│   │   │   └── ...
│   │   ├── chapters/
│   │   │   ├── barbarian-chapters.data.ts # Chapter layouts, boss config
│   │   │   └── ...
│   │   ├── balance.data.ts            # Global balance constants (chapter multipliers, etc.)
│   │   └── lore.data.ts              # Death messages, victory lines, boss dialogue
│   │
│   ├── rendering/                      # ── PIXIJS RENDERING LAYER ──
│   │   ├── index.ts
│   │   ├── GameRenderer.ts           # Orchestrates PixiJS App lifecycle
│   │   ├── GameRenderer.test.ts
│   │   │
│   │   ├── scenes/                    # Scene-level display containers
│   │   │   ├── TraversalScene.ts      # Parallax background + hero + obstacles
│   │   │   ├── DuelScene.ts           # Arena: hero vs enemies, health bars
│   │   │   └── BossScene.ts           # Boss fight (extended duel with phases)
│   │   │
│   │   ├── display/                   # Reusable display objects
│   │   │   ├── HeroDisplay.ts        # Hero sprite/animation container
│   │   │   ├── EnemyDisplay.ts       # Enemy sprite/animation container
│   │   │   ├── ParallaxBackground.ts # Multi-layer scrolling background
│   │   │   ├── HealthBar.ts          # PixiJS health bar (above enemies)
│   │   │   ├── DamageNumber.ts       # Floating damage text
│   │   │   ├── ObstacleDisplay.ts    # Traversal obstacle sprites
│   │   │   └── CoinDisplay.ts        # Floating bonus coin sprite
│   │   │
│   │   ├── effects/                   # Visual juice / feedback
│   │   │   ├── ScreenShake.ts        # Camera shake effect
│   │   │   ├── HitFlash.ts           # Color flash on hit
│   │   │   ├── SlowMotion.ts         # Boss kill slow-mo
│   │   │   ├── PerfectBlock.ts       # "PERFECT" text flash
│   │   │   └── ParticleEffects.ts    # Impact particles, coin sparkles
│   │   │
│   │   └── animation/                 # Pluggable animation system
│   │       ├── IAnimationController.ts    # Interface: play, stop, setAnimation, onComplete
│   │       ├── SpritesheetAnimator.ts     # Default: PixiJS AnimatedSprite implementation
│   │       ├── SpineAnimator.ts           # Optional: Spine runtime implementation
│   │       └── AnimationRegistry.ts       # Maps entity IDs to animation assets
│   │
│   ├── audio/                          # ── AUDIO LAYER ──
│   │   ├── index.ts
│   │   ├── AudioManager.ts           # Singleton: manages all Howl instances
│   │   ├── AudioManager.test.ts
│   │   ├── MusicPlayer.ts            # Background music: crossfade, per-hero tracks
│   │   ├── SfxPlayer.ts              # Sound effects: pooled Howl sprites
│   │   └── audioManifest.ts          # Asset paths & sprite definitions
│   │
│   ├── input/                          # ── INPUT HANDLING ──
│   │   ├── index.ts
│   │   ├── InputManager.ts           # Keyboard + mouse state polling
│   │   ├── InputManager.test.ts
│   │   ├── InputMap.ts               # Action → key binding map (remappable)
│   │   └── types.ts                  # GameAction enum, InputState
│   │
│   ├── services/                       # ── PERSISTENCE & SERVICES ──
│   │   ├── index.ts
│   │   ├── SaveManager.ts            # LocalStorage read/write, versioned schema
│   │   ├── SaveManager.test.ts
│   │   ├── SaveMigrator.ts           # Schema version migration logic
│   │   ├── ExportImport.ts           # JSON export/import to file
│   │   └── ExportImport.test.ts
│   │
│   ├── ui/                             # ── REACT COMPONENTS ──
│   │   ├── index.ts
│   │   ├── providers/
│   │   │   └── GameProvider.tsx       # React context: exposes game actor to tree
│   │   │
│   │   ├── hooks/
│   │   │   ├── useGameActor.ts       # Access root GameMachine actor
│   │   │   ├── useGameState.ts       # useSelector wrapper for common selectors
│   │   │   ├── useRunState.ts        # useSelector for active run state
│   │   │   └── useHeroData.ts        # Derived hero stats with upgrades applied
│   │   │
│   │   ├── screens/
│   │   │   ├── TitleScreen/
│   │   │   │   ├── TitleScreen.tsx
│   │   │   │   ├── TitleScreen.module.css
│   │   │   │   └── TitleScreen.test.tsx
│   │   │   ├── HeroSelect/
│   │   │   │   ├── HeroSelect.tsx
│   │   │   │   ├── HeroSelect.module.css
│   │   │   │   ├── HeroCard.tsx
│   │   │   │   └── HeroSelect.test.tsx
│   │   │   ├── GameScreen/
│   │   │   │   ├── GameScreen.tsx     # Hosts PixiJS canvas + HUD overlay
│   │   │   │   ├── GameScreen.module.css
│   │   │   │   └── GameScreen.test.tsx
│   │   │   ├── ResultsScreen/
│   │   │   │   ├── ResultsScreen.tsx
│   │   │   │   ├── ResultsScreen.module.css
│   │   │   │   └── ResultsScreen.test.tsx
│   │   │   ├── UpgradeScreen/
│   │   │   │   ├── UpgradeScreen.tsx
│   │   │   │   ├── UpgradeScreen.module.css
│   │   │   │   ├── UpgradeGrid.tsx
│   │   │   │   └── UpgradeScreen.test.tsx
│   │   │   └── PrestigeScreen/
│   │   │       ├── PrestigeScreen.tsx
│   │   │       └── PrestigeScreen.module.css
│   │   │
│   │   └── components/                # Shared UI components
│   │       ├── HUD/
│   │       │   ├── HUD.tsx            # Timer + health bar + cooldown overlay
│   │       │   ├── HUD.module.css
│   │       │   ├── Timer.tsx
│   │       │   ├── HealthBar.tsx      # React health bar (HUD version)
│   │       │   └── CooldownIndicator.tsx
│   │       ├── Button/
│   │       │   ├── Button.tsx
│   │       │   └── Button.module.css
│   │       ├── Modal/
│   │       │   ├── Modal.tsx
│   │       │   └── Modal.module.css
│   │       └── Transition/
│   │           └── ScreenTransition.tsx
│   │
│   ├── debug/                          # ── DEV-ONLY DEBUG TOOLS ──
│   │   ├── index.ts
│   │   ├── DebugConfig.ts            # Parse ?debug= query params
│   │   ├── DebugOverlay.tsx           # Optional on-screen debug panel
│   │   ├── Logger.ts                 # Structured logger with levels & modules
│   │   ├── Logger.test.ts
│   │   ├── StateInspector.ts         # XState inspector integration
│   │   └── Cheats.ts                 # Dev-only cheat commands (skip to chapter, etc.)
│   │
│   └── utils/                          # ── SHARED UTILITIES ──
│       ├── index.ts
│       ├── math.ts                    # Clamp, lerp, random range
│       ├── math.test.ts
│       ├── timing.ts                  # Frame-rate-independent delta helpers
│       ├── random.ts                  # Seeded PRNG for deterministic runs
│       ├── random.test.ts
│       ├── typeGuards.ts             # Runtime type checking helpers
│       └── constants.ts              # Magic numbers, physics constants
│
├── assets/                             # ── SOURCE ASSETS (processed by Vite) ──
│   ├── sprites/
│   │   ├── heroes/
│   │   │   └── barbarian/
│   │   │       ├── idle.png           # Spritesheet
│   │   │       ├── idle.json          # Spritesheet metadata
│   │   │       ├── attack.png
│   │   │       ├── attack.json
│   │   │       └── ...
│   │   ├── enemies/
│   │   │   └── barbarian-chapter/
│   │   │       ├── wolf/
│   │   │       ├── swordsman/
│   │   │       └── ...
│   │   ├── obstacles/
│   │   ├── effects/
│   │   └── ui/
│   ├── backgrounds/
│   │   └── barbarian/
│   │       ├── layer-sky.png          # Parallax layer (furthest)
│   │       ├── layer-mountains.png
│   │       ├── layer-trees.png
│   │       └── layer-ground.png       # Parallax layer (nearest)
│   ├── audio/
│   │   ├── music/
│   │   │   └── barbarian-theme.mp3
│   │   └── sfx/
│   │       ├── hit.webm
│   │       ├── block.webm
│   │       ├── perfect-block.webm
│   │       ├── coin-collect.webm
│   │       ├── death.webm
│   │       └── ui-click.webm
│   └── spine/                          # Optional: Spine export files
│       └── barbarian/
│           ├── barbarian.skel
│           ├── barbarian.atlas
│           └── barbarian.png
│
├── e2e/                                # ── PLAYWRIGHT E2E TESTS ──
│   ├── title-screen.spec.ts
│   ├── hero-select.spec.ts
│   ├── run-loop.spec.ts
│   ├── upgrade-flow.spec.ts
│   └── fixtures/
│       └── test-save.json             # Fixture save states for E2E
│
└── docs/                               # ── DOCUMENTATION ──
    ├── ARCHITECTURE.md                 # Architecture summary
    ├── DATA_SCHEMA.md                  # Hero/enemy data format docs
    └── ADDING_A_HERO.md               # Step-by-step guide for content authors
```

---

## 4. Coding Standards & Conventions

### 4.1 TypeScript Configuration

```jsonc
// tsconfig.json (key settings)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "paths": {
      "@core/*": ["./src/core/*"],
      "@data/*": ["./src/data/*"],
      "@rendering/*": ["./src/rendering/*"],
      "@audio/*": ["./src/audio/*"],
      "@input/*": ["./src/input/*"],
      "@services/*": ["./src/services/*"],
      "@ui/*": ["./src/ui/*"],
      "@debug/*": ["./src/debug/*"],
      "@utils/*": ["./src/utils/*"],
    },
  },
  "include": ["src"],
}
```

### 4.2 Naming Conventions

| Artifact                    | Convention                                | Example                                  |
| --------------------------- | ----------------------------------------- | ---------------------------------------- |
| Files — React components    | PascalCase                                | `HeroSelect.tsx`                         |
| Files — modules / utilities | camelCase                                 | `combat.ts`, `economy.ts`                |
| Files — data                | kebab-case + `.data.ts`                   | `barbarian-enemies.data.ts`              |
| Files — tests               | same name + `.test.ts(x)`                 | `combat.test.ts`                         |
| Files — CSS Modules         | same name + `.module.css`                 | `HeroSelect.module.css`                  |
| Types / Interfaces          | PascalCase, `I` prefix only for contracts | `HeroDefinition`, `IAnimationController` |
| Enums                       | PascalCase members                        | `HeroId.Barbarian`                       |
| Constants                   | UPPER_SNAKE_CASE                          | `MAX_RUN_DURATION_MS`                    |
| XState machines             | camelCase + `Machine` suffix              | `gameMachine`, `duelMachine`             |
| XState events               | UPPER_SNAKE_CASE                          | `START_RUN`, `ATTACK`, `ENEMY_DEFEATED`  |
| React hooks                 | `use` prefix                              | `useGameState`                           |
| CSS class names             | camelCase (via CSS Modules)               | `.healthBar`, `.timerCritical`           |

### 4.3 Code Organization Rules

1. **No circular imports.** Enforce via ESLint `import/no-cycle`. The dependency graph is strictly layered:  
   `types` ← `data` ← `core/systems` ← `core/machines` ← `rendering` / `ui`

2. **Co-locate tests.** Every `.ts` file has a sibling `.test.ts`. No separate `__tests__/` directories.

3. **Barrel exports per module boundary.** Each top-level directory under `src/` has an `index.ts` that re-exports the public API. Internal files are not imported directly by other modules.

4. **Pure functions for game logic.** Functions in `core/systems/` are pure: no side effects, no `Date.now()`, no randomness (accept a PRNG seed or random value as parameter).

5. **`as const` for static data.** All data files use `as const satisfies` for type-safe literal types:

   ```typescript
   export const BARBARIAN_UPGRADES = {
     maxHealth: { name: 'Max Health', costs: [18, 40, 100, 220, 450] },
     // ...
   } as const satisfies Record<string, UpgradeCategoryData>;
   ```

6. **No `any`.** Use `unknown` + type narrowing instead. ESLint rule: `@typescript-eslint/no-explicit-any: error`.

7. **Prefer composition over inheritance.** Entity behaviors are composed from interfaces and strategy objects, not class hierarchies.

### 4.4 Git Conventions

- **Branch naming:** `feature/<ticket>-short-description`, `fix/<ticket>-short-description`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`)
- **PR requirements:** All tests pass, no lint errors, at least one approval

---

## 5. State Architecture (XState v5)

### 5.1 Actor Hierarchy

XState v5 uses an **actor model** where machines can spawn child actors. The game uses a hierarchical actor system:

```
GameActor (root)                        ← Lives for app lifetime
├── context: { save, currentHero, ... }
│
├─ state: "titleScreen"
├─ state: "heroSelect"
├─ state: "cinematic"
├─ state: "run"
│   └── RunActor (spawned child)        ← Lives for one 90s run
│       ├── context: { hero, chapter, hp, timer, enemies[], position, ... }
│       │
│       ├─ state: "traversal"
│       │   └── TraversalActor (spawned child)
│       ├─ state: "duel"
│       │   └── DuelActor (spawned child)
│       ├─ state: "bossFight"
│       │   └── DuelActor (spawned child, boss variant)
│       ├─ state: "death"
│       └─ state: "victory"
│
├─ state: "results"
├─ state: "upgrade"
└─ state: "prestige"
```

### 5.2 GameMachine (Root)

```typescript
// Simplified type signature — full implementation in gameMachine.ts
import { createMachine, assign } from 'xstate';

type GameContext = {
  saveData: SaveData;
  selectedHeroId: HeroId | null;
  selectedChapter: ChapterId | null;
  lastRunResult: RunResult | null;
};

type GameEvent =
  | { type: 'START_GAME' }
  | { type: 'SELECT_HERO'; heroId: HeroId; chapter: ChapterId }
  | { type: 'START_RUN' }
  | { type: 'RUN_COMPLETE'; result: RunResult }
  | {
      type: 'PURCHASE_UPGRADE';
      heroId: HeroId;
      category: string;
      level: number;
    }
  | { type: 'CONTINUE_TO_UPGRADE' }
  | { type: 'RETURN_TO_HERO_SELECT' }
  | { type: 'PRESTIGE'; heroId: HeroId }
  | { type: 'RESET_ALL' }
  | { type: 'IMPORT_SAVE'; data: SaveData };

export const gameMachine = createMachine({
  id: 'game',
  initial: 'titleScreen',
  context: {
    /* ... */
  },
  states: {
    titleScreen: {
      on: { START_GAME: 'heroSelect' },
    },
    heroSelect: {
      on: { SELECT_HERO: { target: 'run', actions: 'assignSelectedHero' } },
    },
    cinematic: {
      // Auto-transitions to 'run' after cinematic completes
      after: { CINEMATIC_DURATION: 'run' },
    },
    run: {
      // Spawns a RunActor as a child
      invoke: {
        id: 'runActor',
        src: 'runMachine',
        input: ({ context }) => ({
          heroId: context.selectedHeroId,
          chapter: context.selectedChapter,
          upgrades: context.saveData.heroes[context.selectedHeroId].upgrades,
        }),
        onDone: { target: 'results', actions: 'assignRunResult' },
      },
    },
    results: {
      on: { CONTINUE_TO_UPGRADE: 'upgrade' },
    },
    upgrade: {
      on: {
        PURCHASE_UPGRADE: { actions: 'applyUpgrade' },
        START_RUN: 'run',
        RETURN_TO_HERO_SELECT: 'heroSelect',
      },
    },
    prestige: {
      /* ... */
    },
  },
});
```

### 5.3 RunMachine (Per-Run)

Manages a single 90-second run. Drives the alternation between traversal segments and duels.

```
RunMachine States:
┌─────────────────────────────────────────────┐
│  initializing → traversal ↔ duel → victory  │
│                    ↓           ↓             │
│                  death       death           │
│                    ↓           ↓             │
│                  complete   complete         │
└─────────────────────────────────────────────┘
```

**Key context:**

```typescript
type RunContext = {
  heroId: HeroId;
  chapter: ChapterId;
  heroStats: DerivedHeroStats; // Stats with upgrades applied
  currentHp: number;
  maxHp: number;
  timer: number; // Remaining ms
  distanceTravelled: number; // 0–100% of chapter
  enemyLayout: EnemyEncounter[]; // Generated sequence
  currentEncounterIndex: number;
  coinsCollected: CoinId[];
  enemiesDefeated: number;
  duelDamageDealt: number;
  phase: 'traversal' | 'duel';
  rngSeed: number; // For deterministic replay
};
```

### 5.4 DuelMachine (Per-Encounter)

Manages a single combat encounter (1–3 enemies). Handles attack/defend cycles, enemy AI turns, hit detection, knockback, and death conditions.

```
DuelMachine States:
┌───────────────────────────────────────────────────────────┐
│  idle ↔ heroActing ↔ enemyActing → enemyDefeated/heroDied │
│   ↑         ↓            ↓                                │
│   └── recovery ←─────────┘                                │
│                                                           │
│  Parallel region: allEnemies (tracks each enemy's state)  │
└───────────────────────────────────────────────────────────┘
```

**Key design:** The duel machine tracks hero and enemy states in parallel. Each enemy has its own sub-state (idle, winding-up, attacking, recovering, defeated). The hero has states (idle, attacking, blocking, stunned, recovering). Input events (`ATTACK`, `BLOCK`, `JUMP`, `DUCK`, `MOVE_LEFT`, `MOVE_RIGHT`, `SPECIAL`) are processed based on the hero's current state — if the hero is mid-attack-animation, inputs are queued or rejected (commitment-based combat).

### 5.5 TraversalMachine (Per-Segment)

Manages a single traversal segment between duels. Handles auto-run, obstacle detection, coin collection, and hero input for jumping/ducking/sprinting.

```typescript
type TraversalContext = {
  speed: number; // Current run speed (affected by upgrades + sprint)
  obstacles: ObstacleInstance[]; // Upcoming obstacles with positions
  coins: CoinInstance[]; // Upcoming coins with positions
  heroPosition: number; // X position in segment
  segmentLength: number; // Total segment distance
  heroStance: 'running' | 'jumping' | 'ducking' | 'sprinting' | 'climbing';
};
```

### 5.6 State Machine Testing Strategy

State machines are **the most critical code** in the project. Every machine is tested exhaustively:

```typescript
// Example: duelMachine.test.ts
import { createActor } from 'xstate';
import { duelMachine } from './duelMachine';

describe('DuelMachine', () => {
  it('should transition from idle to heroActing on ATTACK', () => {
    const actor = createActor(duelMachine, {
      input: { hero: mockBarbarianStats, enemies: [mockWolf] },
    });
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
    actor.send({ type: 'ATTACK' });
    expect(actor.getSnapshot().value).toBe('heroActing');
  });

  it('should deal damage based on hero stats', () => {
    const actor = createActor(duelMachine, {
      input: {
        hero: { ...mockBarbarianStats, damage: 25 },
        enemies: [mockWolf],
      },
    });
    actor.start();
    actor.send({ type: 'ATTACK' });
    // After attack animation completes...
    expect(actor.getSnapshot().context.enemies[0].currentHp).toBe(75);
  });

  it('should reject ATTACK input while hero is already attacking', () => {
    // Tests commitment-based combat
  });

  it('should end duel when all enemies are defeated', () => {
    // ...
  });
});
```

### 5.7 React Integration

XState v5 integrates with React via `@xstate/react`:

```tsx
// GameProvider.tsx — creates and provides the root actor
import { createActor } from 'xstate';
import { gameMachine } from '@core/machines/gameMachine';
import { createContext, useContext } from 'react';
import { useSelector } from '@xstate/react';

const gameActor = createActor(gameMachine);
gameActor.start();

const GameActorContext = createContext(gameActor);

export function GameProvider({ children }: { children: React.ReactNode }) {
  return (
    <GameActorContext.Provider value={gameActor}>
      {children}
    </GameActorContext.Provider>
  );
}

export function useGameActor() {
  return useContext(GameActorContext);
}

// In components:
function Timer() {
  const gameActor = useGameActor();
  const timer = useSelector(gameActor, (state) => {
    const run = state.children.runActor;
    return run?.getSnapshot()?.context.timer ?? 0;
  });

  return <div className={styles.timer}>{formatTime(timer)}</div>;
}
```

---

## 6. Game Systems

### 6.1 Combat System (`core/systems/combat.ts`)

Pure functions for all combat calculations. **No state mutation** — functions return new values that the DuelMachine applies via `assign`.

```typescript
// ── Types ──
export type AttackResult = {
  damage: number;
  blocked: boolean;
  perfectBlock: boolean;
  knockback: number; // Pixels to push back (0 if no knockback)
  stunDuration: number; // Ms hero/enemy is stunned
};

export type DamageModifiers = {
  baseDamage: number;
  damageMultiplier: number; // From upgrades
  armorReduction: number; // Target's armor (percentage-based)
  stanceMultiplier: number; // Jumping attack, crouching, etc.
  criticalHit: boolean;
};

// ── Pure Functions ──
export function calculateDamage(modifiers: DamageModifiers): number {
  /* ... */
}

export function calculateBlockResult(
  incomingDamage: number,
  blockTiming: number, // 0–1: how close to perfect timing
  heroArmor: number,
): AttackResult {
  /* ... */
}

export function isInRange(
  attackerX: number,
  defenderX: number,
  attackRange: number,
): boolean {
  /* ... */
}

export function calculateKnockback(
  damage: number,
  attackType: AttackType,
): number {
  /* ... */
}
```

### 6.2 Economy System (`core/systems/economy.ts`)

```typescript
// ── Reward Calculation ──
export function calculateRunReward(
  result: RunResult,
  chapter: ChapterId,
): RewardBreakdown {
  const multiplier = CHAPTER_MULTIPLIERS[chapter]; // 1, 2.5, 5

  return {
    distanceReward: Math.floor(result.distancePercent) * 1 * multiplier,
    duelDamageReward: result.duelDamageDealt * 1 * multiplier,
    enemyKillReward: result.enemiesDefeated * 50 * multiplier,
    bossReward: result.bossDefeated ? 200 * multiplier : 0,
    coinReward:
      result.coinsCollected.reduce((sum, c) => sum + c.value, 0) * multiplier,
    total: 0, // Computed
  };
}

// ── Upgrade Costs ──
export function getUpgradeCost(
  heroId: HeroId,
  category: UpgradeCategory,
  currentLevel: number,
): number {
  /* Reads from hero data */
}

export function canAffordUpgrade(currency: number, cost: number): boolean {
  return currency >= cost;
}

export function applyUpgradePurchase(
  save: SaveData,
  heroId: HeroId,
  category: UpgradeCategory,
): SaveData {
  /* Returns new save with upgraded level and deducted currency */
}
```

### 6.3 Progression System (`core/systems/progression.ts`)

Derives final hero stats by applying all upgrade levels to base stats.

```typescript
export type DerivedHeroStats = {
  maxHp: number;
  armor: number; // Percentage damage reduction (0–1)
  runSpeed: number;
  damageMultiplier: number;
  attackSpeed: number; // Animation duration multiplier (lower = faster)
  specialAbility: SpecialAbilityStats;
};

export function deriveHeroStats(
  baseStats: HeroBaseStats,
  upgrades: UpgradeGrid,
): DerivedHeroStats {
  // Pure function: base + sum of upgrade deltas
}
```

### 6.4 Level Generator (`core/systems/levelGenerator.ts`)

Generates the enemy encounter sequence for a run. Uses **seeded PRNG** for reproducibility in tests and debug.

```typescript
export function generateLevel(
  chapter: ChapterDefinition,
  seed: number,
): EnemyEncounter[] {
  const rng = createSeededRng(seed);
  // Place enemies along the chapter path
  // Ensure minimum spacing between encounters
  // Randomize enemy order slightly (per design: "slightly randomized each run")
  // Place bonus coins in traversal segments
  // Returns ordered array of encounters
}
```

### 6.5 Health System (`core/systems/health.ts`)

```typescript
export function applyDamage(currentHp: number, damage: number): number {
  return Math.max(0, currentHp - damage);
}

export function isAlive(currentHp: number): boolean {
  return currentHp > 0;
}

// Optional post-duel heal (design doc says TBD, make it configurable)
export function applyPostDuelHeal(
  currentHp: number,
  maxHp: number,
  healPercent: number, // 0 to disable, 0.25 for 25%
): number {
  return Math.min(maxHp, currentHp + Math.floor(maxHp * healPercent));
}
```

### 6.6 Timer System (`core/systems/timer.ts`)

```typescript
export const MAX_RUN_DURATION_MS = 90_000;

export type TimerPhase = 'safe' | 'warning' | 'critical';

export function getTimerPhase(remainingMs: number): TimerPhase {
  if (remainingMs > 30_000) return 'safe';
  if (remainingMs > 15_000) return 'warning';
  return 'critical';
}

export function tickTimer(remainingMs: number, deltaMs: number): number {
  return Math.max(0, remainingMs - deltaMs);
}

export function isTimerExpired(remainingMs: number): boolean {
  return remainingMs <= 0;
}
```

### 6.7 Entity System Design

Heroes and enemies follow a **composition pattern**, not inheritance. Each entity is defined by a data object (stats, assets) and a behavior strategy (AI, ability implementation).

```typescript
// ── Hero Interface ──
export interface HeroDefinition {
  id: HeroId;
  name: string;
  setting: string;
  baseStats: HeroBaseStats;
  upgradeCategories: UpgradeCategoryData[];
  abilities: {
    primary: AbilityDefinition; // LMB
    defensive: AbilityDefinition; // RMB
    special: AbilityDefinition; // Spacebar
  };
  assets: HeroAssetManifest;
}

// ── Enemy Interface ──
export interface EnemyDefinition {
  id: EnemyId;
  name: string;
  baseHp: number;
  baseDamage: number;
  range: number;
  behavior: EnemyBehaviorType; // Strategy pattern: 'wolf', 'swordsman', etc.
  animations: EnemyAnimationSet;
  lootValue: number;
}

// ── Enemy AI (Strategy Pattern) ──
export interface IEnemyBehavior {
  /** Decide the enemy's next action based on duel state */
  decideAction(state: DuelSnapshot, rng: SeededRng): EnemyAction;
  /** Get wind-up duration for current action */
  getWindUpDuration(action: EnemyAction): number;
  /** Get recovery duration after action */
  getRecoveryDuration(action: EnemyAction): number;
}

// Example: Wolf behavior
export const wolfBehavior: IEnemyBehavior = {
  decideAction(state, rng) {
    const distToHero = state.heroX - state.enemyX;
    if (distToHero > WOLF_POUNCE_RANGE) return { type: 'wait' };
    if (distToHero <= WOLF_POUNCE_RANGE) return { type: 'pounce' };
    return { type: 'retreat' };
  },
  getWindUpDuration(action) {
    return action.type === 'pounce' ? 400 : 200;
  },
  getRecoveryDuration(action) {
    return action.type === 'pounce' ? 600 : 300;
  },
};
```

---

## 7. Rendering Pipeline (PixiJS 8)

### 7.1 Canvas Setup

PixiJS 8 uses an async `Application.init()` API. The canvas is created by PixiJS and mounted into a React ref.

```typescript
// GameRenderer.ts
import { Application, Container } from 'pixi.js';

export class GameRenderer {
  private app: Application;
  private sceneContainer: Container;

  async init(canvasParent: HTMLElement): Promise<void> {
    this.app = new Application();
    await this.app.init({
      width: 1920,
      height: 1080,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      resizeTo: canvasParent, // Auto-resize to container
    });
    canvasParent.appendChild(this.app.canvas);

    this.sceneContainer = new Container();
    this.app.stage.addChild(this.sceneContainer);
  }

  /** Called every frame by the PixiJS ticker */
  startGameLoop(onUpdate: (deltaMs: number) => void): void {
    this.app.ticker.add((ticker) => {
      onUpdate(ticker.deltaMS);
    });
  }

  destroy(): void {
    this.app.destroy(true, { children: true, texture: true });
  }
}
```

### 7.2 React ↔ PixiJS Bridge

The `GameScreen` component manages the PixiJS lifecycle within React's rules:

```tsx
// GameScreen.tsx
function GameScreen() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const gameActor = useGameActor();

  useEffect(() => {
    const renderer = new GameRenderer();
    rendererRef.current = renderer;

    renderer.init(canvasRef.current!).then(() => {
      renderer.startGameLoop((deltaMs) => {
        // 1. Read current state from XState
        const snapshot = gameActor.getSnapshot();
        const runSnapshot = snapshot.children.runActor?.getSnapshot();
        if (!runSnapshot) return;

        // 2. Send TICK event to RunMachine (advances timer, physics)
        gameActor.send({ type: 'TICK', deltaMs });

        // 3. Renderer reads updated state and draws
        renderer.render(runSnapshot.context);
      });
    });

    return () => {
      renderer.destroy();
    };
  }, []);

  return (
    <div className={styles.gameScreen}>
      <div ref={canvasRef} className={styles.canvas} />
      <HUD /> {/* React overlay on top of canvas */}
    </div>
  );
}
```

### 7.3 Scene Management

Each gameplay phase has a dedicated scene class that manages its own PixiJS display tree:

```typescript
// scenes/TraversalScene.ts
export class TraversalScene {
  readonly container: Container;

  private parallax: ParallaxBackground;
  private heroDisplay: HeroDisplay;
  private obstacleDisplays: ObstacleDisplay[] = [];
  private coinDisplays: CoinDisplay[] = [];

  constructor(private heroId: HeroId) {
    this.container = new Container();
    this.parallax = new ParallaxBackground(heroId);
    this.heroDisplay = new HeroDisplay(heroId);
    this.container.addChild(
      this.parallax.container,
      this.heroDisplay.container,
    );
  }

  update(state: TraversalContext, deltaMs: number): void {
    this.parallax.scroll(state.speed * deltaMs);
    this.heroDisplay.setStance(state.heroStance);
    this.heroDisplay.setPosition(state.heroPosition);
    // Update obstacles, coins, etc.
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
```

### 7.4 Parallax Background System

Multi-layer scrolling creates depth. Each hero has 3–5 layers moving at different speeds.

```typescript
// display/ParallaxBackground.ts
export class ParallaxBackground {
  readonly container: Container;
  private layers: { sprite: TilingSprite; speed: number }[] = [];

  constructor(heroId: HeroId) {
    this.container = new Container();
    // Load layers from asset manifest
    // speed values: sky=0.1, mountains=0.3, trees=0.6, ground=1.0
  }

  scroll(distance: number): void {
    for (const layer of this.layers) {
      layer.sprite.tilePosition.x -= distance * layer.speed;
    }
  }
}
```

### 7.5 Resolution & Scaling Strategy

| Property              | Value                                                   |
| --------------------- | ------------------------------------------------------- |
| **Design resolution** | 1920 × 1080                                             |
| **Scaling mode**      | Letterbox (maintain aspect ratio, black bars if needed) |
| **Asset resolution**  | @1x and @2x variants for HiDPI                          |
| **Canvas CSS**        | `width: 100%; height: 100%; object-fit: contain;`       |

PixiJS `resizeTo` + `autoDensity` handles DPI automatically. The game world always renders at 1920×1080 logical pixels. `resolution` is set to `devicePixelRatio` for crisp rendering on Retina/HiDPI displays.

---

## 8. Animation System (Pluggable)

### 8.1 Animation Controller Interface

All entity animations go through this interface, allowing the rendering layer to be agnostic about whether the underlying implementation uses spritesheets or Spine.

```typescript
// animation/IAnimationController.ts
export interface IAnimationController {
  /** Play a named animation (e.g., 'idle', 'attack', 'block', 'death') */
  play(animationName: string, options?: AnimationOptions): void;

  /** Stop the current animation */
  stop(): void;

  /** Set animation speed multiplier (for attack speed upgrades) */
  setSpeed(multiplier: number): void;

  /** Get the PixiJS Container for this animation (to add to stage) */
  getDisplayObject(): Container;

  /** Register a callback for animation completion */
  onComplete(callback: (animationName: string) => void): void;

  /** Clean up resources */
  destroy(): void;
}

export interface AnimationOptions {
  loop?: boolean;
  speed?: number;
  onComplete?: () => void;
}
```

### 8.2 Spritesheet Implementation (Default / MVP)

```typescript
// animation/SpritesheetAnimator.ts
import { AnimatedSprite, Container, Spritesheet } from 'pixi.js';

export class SpritesheetAnimator implements IAnimationController {
  private container: Container;
  private sprites: Map<string, AnimatedSprite> = new Map();
  private currentAnimation: string | null = null;
  private completionCallbacks: ((name: string) => void)[] = [];

  constructor(spritesheet: Spritesheet) {
    this.container = new Container();
    // Pre-create AnimatedSprite for each animation in the spritesheet
    for (const [name, frames] of Object.entries(spritesheet.animations)) {
      const sprite = new AnimatedSprite(frames);
      sprite.visible = false;
      sprite.anchor.set(0.5, 1); // Bottom-center anchor
      this.sprites.set(name, sprite);
      this.container.addChild(sprite);
    }
  }

  play(animationName: string, options?: AnimationOptions): void {
    // Hide current, show new, configure loop/speed
  }

  // ... implements full interface
}
```

### 8.3 Spine Implementation (Future)

```typescript
// animation/SpineAnimator.ts — Optional, requires Spine license
import { Spine } from '@esotericsoftware/spine-pixi-v8';

export class SpineAnimator implements IAnimationController {
  private spine: Spine;

  constructor(skeletonPath: string, atlasPath: string) {
    // Load via PixiJS Assets + Spine loader
  }

  play(animationName: string, options?: AnimationOptions): void {
    this.spine.state.setAnimation(0, animationName, options?.loop ?? false);
  }

  setSpeed(multiplier: number): void {
    this.spine.state.timeScale = multiplier;
  }

  // ... implements full interface
}
```

### 8.4 Animation Registry

Maps entity IDs to their animation assets and controller factory:

```typescript
// animation/AnimationRegistry.ts
export type AnimationFactory = () => Promise<IAnimationController>;

const registry: Map<string, AnimationFactory> = new Map();

export function registerAnimation(
  entityId: string,
  factory: AnimationFactory,
): void {
  registry.set(entityId, factory);
}

export function createAnimationController(
  entityId: string,
): Promise<IAnimationController> {
  const factory = registry.get(entityId);
  if (!factory)
    throw new Error(`No animation registered for entity: ${entityId}`);
  return factory();
}
```

---

## 9. Audio System (Howler.js)

### 9.1 Architecture

Two distinct audio concerns:

1. **Music** — long-playing, one track at a time, crossfade between hero themes
2. **SFX** — short clips, many can play simultaneously, use audio sprites for efficiency

```typescript
// AudioManager.ts
export class AudioManager {
  private music: MusicPlayer;
  private sfx: SfxPlayer;
  private masterVolume = 1;
  private musicVolume = 0.7;
  private sfxVolume = 1;

  constructor() {
    this.music = new MusicPlayer();
    this.sfx = new SfxPlayer();
  }

  setMasterVolume(v: number): void {
    this.masterVolume = v;
    Howler.volume(v);
  }

  setMusicVolume(v: number): void {
    this.musicVolume = v;
    this.music.setVolume(v * this.masterVolume);
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = v;
    this.sfx.setVolume(v * this.masterVolume);
  }

  playMusic(trackId: string): void {
    this.music.play(trackId);
  }
  playSfx(sfxId: string): void {
    this.sfx.play(sfxId);
  }
  stopAll(): void {
    this.music.stop();
    this.sfx.stopAll();
  }
}
```

### 9.2 Music Player

```typescript
// MusicPlayer.ts
export class MusicPlayer {
  private tracks: Map<string, Howl> = new Map();
  private currentTrack: string | null = null;

  play(trackId: string): void {
    if (this.currentTrack === trackId) return;

    // Crossfade: fade out current, fade in new
    if (this.currentTrack) {
      const current = this.tracks.get(this.currentTrack)!;
      current.fade(current.volume(), 0, 1000);
      current.once('fade', () => current.stop());
    }

    const next = this.getOrLoadTrack(trackId);
    next.volume(0);
    next.play();
    next.fade(0, this.volume, 1000);
    this.currentTrack = trackId;
  }

  private getOrLoadTrack(trackId: string): Howl {
    if (!this.tracks.has(trackId)) {
      const manifest = AUDIO_MANIFEST.music[trackId];
      this.tracks.set(
        trackId,
        new Howl({
          src: manifest.src,
          loop: true,
          volume: 0,
          preload: true,
        }),
      );
    }
    return this.tracks.get(trackId)!;
  }
}
```

### 9.3 SFX Player (Audio Sprites)

```typescript
// SfxPlayer.ts
export class SfxPlayer {
  private spriteBank: Howl;

  constructor() {
    // All SFX packed into one audio sprite file
    this.spriteBank = new Howl({
      src: ['sfx-sprite.webm', 'sfx-sprite.mp3'],
      sprite: AUDIO_MANIFEST.sfxSprites,
      // e.g., { hit: [0, 300], block: [400, 250], perfectBlock: [700, 400], ... }
    });
  }

  play(sfxId: string): void {
    this.spriteBank.play(sfxId);
  }

  setVolume(v: number): void {
    this.spriteBank.volume(v);
  }

  stopAll(): void {
    this.spriteBank.stop();
  }
}
```

### 9.4 Audio Manifest

```typescript
// audioManifest.ts
export const AUDIO_MANIFEST = {
  music: {
    'barbarian-theme': { src: ['/audio/music/barbarian-theme.mp3'] },
    'archer-theme': { src: ['/audio/music/archer-theme.mp3'] },
    // ...
  },
  sfxSprites: {
    hit: [0, 300],
    block: [400, 250],
    perfectBlock: [700, 400],
    coinCollect: [1200, 200],
    death: [1500, 800],
    uiClick: [2400, 150],
    uiHover: [2600, 100],
    // ...
  },
} as const;
```

---

## 10. Input System

### 10.1 InputManager

Polls raw keyboard and mouse state. Translates physical keys to game actions via a configurable input map. The InputManager does **not** send events to XState directly — it provides an `InputSnapshot` that the game loop reads each frame.

```typescript
// InputManager.ts
export class InputManager {
  private keysDown: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(private inputMap: InputMap) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    // Prevent context menu on right-click in game area
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Call once per frame at the START of the update loop */
  getSnapshot(): InputSnapshot {
    const snapshot: InputSnapshot = {
      actions: new Set<GameAction>(),
      mousePosition: { ...this.mousePosition },
    };

    for (const [action, keys] of Object.entries(this.inputMap)) {
      if (keys.some((k) => this.keysDown.has(k) || this.mouseButtons.has(k))) {
        snapshot.actions.add(action as GameAction);
      }
    }

    return snapshot;
  }

  /** Call once per frame at the END of the update loop */
  endFrame(): void {
    this.keysJustPressed.clear();
  }

  destroy(): void {
    // Remove all listeners
  }
}
```

### 10.2 Game Actions & Input Map

```typescript
// types.ts
export enum GameAction {
  MoveLeft = 'moveLeft',
  MoveRight = 'moveRight',
  Jump = 'jump',
  Duck = 'duck',
  Sprint = 'sprint',
  SlowDown = 'slowDown',
  Attack = 'attack',
  Defend = 'defend',
  Special = 'special',
}

// InputMap.ts
export type InputMap = Record<GameAction, (string | number)[]>;

export const DEFAULT_INPUT_MAP: InputMap = {
  [GameAction.MoveLeft]: ['a', 'ArrowLeft'],
  [GameAction.MoveRight]: ['d', 'ArrowRight'],
  [GameAction.Jump]: ['w', 'ArrowUp', ' '], // W, Up, Space
  [GameAction.Duck]: ['s', 'ArrowDown'],
  [GameAction.Sprint]: ['d'], // D during traversal
  [GameAction.SlowDown]: ['a'], // A during traversal
  [GameAction.Attack]: [0], // LMB (mouse button 0)
  [GameAction.Defend]: [2], // RMB (mouse button 2)
  [GameAction.Special]: [' '], // Spacebar
};
```

> **Design note:** The design doc overloads W/A/S/D and Spacebar with different meanings in traversal vs. duel mode. The `RunMachine` / `DuelMachine` resolves which `GameAction`s are valid for the current phase and ignores or remaps accordingly. The InputManager stays context-free.

### 10.3 Input → State Machine Flow

```
Every frame:
  1. InputManager.getSnapshot()  → InputSnapshot
  2. Game loop translates InputSnapshot to XState events based on current phase:
     - Traversal: Jump/Duck/Sprint/SlowDown → JUMP, DUCK, SPRINT, SLOW
     - Duel: Attack/Defend/Special/Jump/Duck/Move → ATTACK, BLOCK, SPECIAL, JUMP, DUCK, MOVE_LEFT, MOVE_RIGHT
  3. Events sent to the active child machine (TraversalMachine or DuelMachine)
  4. Machine processes event (may reject if hero is mid-animation)
  5. Machine context updated with new state
  6. Renderer reads updated context and draws the frame
  7. InputManager.endFrame()
```

---

## 11. UI Layer (React 19 + CSS Modules)

### 11.1 Screen Router

React components are mounted/unmounted based on the `GameMachine`'s current state. No `react-router` needed — the state machine **is** the router.

```tsx
// App.tsx
function App() {
  const gameActor = useGameActor();
  const screen = useSelector(gameActor, (state) => {
    if (state.matches('titleScreen')) return 'title';
    if (state.matches('heroSelect')) return 'heroSelect';
    if (state.matches('cinematic')) return 'cinematic';
    if (state.matches('run')) return 'game';
    if (state.matches('results')) return 'results';
    if (state.matches('upgrade')) return 'upgrade';
    if (state.matches('prestige')) return 'prestige';
    return 'title';
  });

  return (
    <GameProvider>
      <div className={styles.app}>
        {screen === 'title' && <TitleScreen />}
        {screen === 'heroSelect' && <HeroSelect />}
        {screen === 'cinematic' && <CinematicPlayer />}
        {screen === 'game' && <GameScreen />}
        {screen === 'results' && <ResultsScreen />}
        {screen === 'upgrade' && <UpgradeScreen />}
        {screen === 'prestige' && <PrestigeScreen />}
      </div>
    </GameProvider>
  );
}
```

### 11.2 CSS Module Pattern

```css
/* HUD.module.css */
.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none; /* Don't block canvas input */
  z-index: 10;
}

.timer {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  color: var(--timer-color);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
}

.timerSafe {
  --timer-color: #4caf50;
}
.timerWarning {
  --timer-color: #ff9800;
}
.timerCritical {
  --timer-color: #f44336;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

.healthBar {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 240px;
  height: 24px;
}
```

### 11.3 HUD Overlay Architecture

The HUD is a **React component** positioned `absolute` over the PixiJS canvas. It reads state from XState via `useSelector` and re-renders only when the relevant slice of state changes.

```tsx
// HUD.tsx
function HUD() {
  const gameActor = useGameActor();

  const timer = useSelector(gameActor, selectRunTimer);
  const hp = useSelector(gameActor, selectRunHp);
  const maxHp = useSelector(gameActor, selectRunMaxHp);
  const cooldown = useSelector(gameActor, selectSpecialCooldown);
  const isTutorial = useSelector(gameActor, selectIsTutorial);

  const timerPhase = getTimerPhase(timer);

  return (
    <div className={styles.hud}>
      {!isTutorial && <Timer value={timer} phase={timerPhase} />}
      <HealthBar current={hp} max={maxHp} />
      <CooldownIndicator remaining={cooldown} />
    </div>
  );
}
```

### 11.4 Upgrade Screen

The 6×6 grid is rendered as a React component. Each cell shows the upgrade name, current level, cost, and a buy button.

```tsx
// UpgradeGrid.tsx
function UpgradeGrid({ heroId }: { heroId: HeroId }) {
  const gameActor = useGameActor();
  const upgrades = useSelector(gameActor, (s) => selectHeroUpgrades(s, heroId));
  const currency = useSelector(gameActor, (s) => selectHeroCurrency(s, heroId));

  const heroData = getHeroData(heroId);

  return (
    <div className={styles.grid}>
      {heroData.upgradeCategories.map((category) => (
        <div key={category.id} className={styles.row}>
          <span className={styles.categoryName}>{category.name}</span>
          {Array.from({ length: 5 }, (_, i) => {
            const level = i + 1; // Upgrade from level i+1 to i+2
            const currentLevel = upgrades[category.id] ?? 1;
            const cost = category.costs[i];
            const purchased = currentLevel > level;
            const canBuy = currentLevel === level && currency >= cost;

            return (
              <button
                key={level}
                className={clsx(styles.cell, {
                  [styles.purchased]: purchased,
                  [styles.affordable]: canBuy,
                  [styles.locked]: !purchased && !canBuy,
                })}
                disabled={!canBuy}
                onClick={() =>
                  gameActor.send({
                    type: 'PURCHASE_UPGRADE',
                    heroId,
                    category: category.id,
                    level: level + 1,
                  })
                }
              >
                <span className={styles.cost}>{cost}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

---

## 12. Data & Persistence

### 12.1 Save Data Schema

```typescript
// types/save.ts
export interface SaveData {
  version: number; // Schema version for migrations
  heroes: Record<HeroId, HeroSaveData>;
  unlockedHeroes: HeroId[];
  globalFlags: {
    tutorialCompleted: Record<HeroId, boolean>;
    cinematicWatched: Record<HeroId, boolean>;
  };
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  prestige: {
    tokens: number;
    perks: PrestigePerkId[];
  };
}

export interface HeroSaveData {
  currency: number;
  upgrades: Record<string, number>; // category → level (1–6)
  currentChapter: ChapterId;
  chaptersCompleted: ChapterId[];
  coinsCollected: CoinId[]; // Permanently collected bonus coins
  prestigeCount: number;
}

export const SAVE_DATA_VERSION = 1;

export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_DATA_VERSION,
    heroes: {
      /* all heroes at default */
    },
    unlockedHeroes: [HeroId.Barbarian],
    // ...
  };
}
```

### 12.2 SaveManager

```typescript
// SaveManager.ts
const STORAGE_KEY = 'horde-breaker-save';

export class SaveManager {
  load(): SaveData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSaveData();

    const parsed = JSON.parse(raw);
    return migrateSaveData(parsed); // Handles schema upgrades
  }

  save(data: SaveData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  exportToFile(data: SaveData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horde-breaker-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importFromFile(file: File): Promise<SaveData> {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const migrated = migrateSaveData(parsed);
    this.save(migrated);
    return migrated;
  }
}
```

### 12.3 Schema Migration

```typescript
// SaveMigrator.ts
type Migration = (data: unknown) => unknown;

const MIGRATIONS: Record<number, Migration> = {
  // Version 1 → 2 (example future migration)
  // 2: (data) => { ... add new fields, transform old ones ... }
};

export function migrateSaveData(data: { version?: number }): SaveData {
  let current = data;
  let version = data.version ?? 0;

  while (version < SAVE_DATA_VERSION) {
    version++;
    const migration = MIGRATIONS[version];
    if (migration) current = migration(current);
    (current as { version: number }).version = version;
  }

  return current as SaveData;
}
```

### 12.4 Auto-Save Strategy

The `GameMachine` persists save data at these moments:

- After every upgrade purchase
- After a run completes (results screen)
- After prestige
- On browser `beforeunload` event

Persistence is **not** called every frame. It's triggered by XState actions:

```typescript
// In gameMachine.ts
{
  actions: {
    persistSave: ({ context }) => {
      saveManager.save(context.saveData);
    };
  }
}
```

---

## 13. Asset Pipeline

### 13.1 Asset Organization

| Asset Type   | Format                              | Location              | Loading                |
| ------------ | ----------------------------------- | --------------------- | ---------------------- |
| Spritesheets | PNG + JSON (TexturePacker format)   | `assets/sprites/`     | PixiJS `Assets.load()` |
| Backgrounds  | PNG (tiling-ready)                  | `assets/backgrounds/` | PixiJS `Assets.load()` |
| Music        | MP3 (128–192 kbps)                  | `assets/audio/music/` | Howler.js `Howl`       |
| SFX          | WebM + MP3 fallback (audio sprites) | `assets/audio/sfx/`   | Howler.js `Howl`       |
| Spine data   | `.skel` + `.atlas` + `.png`         | `assets/spine/`       | spine-pixi-v8 loader   |
| Fonts        | WOFF2                               | `public/fonts/`       | CSS `@font-face`       |
| UI images    | SVG for icons, PNG for artwork      | `assets/sprites/ui/`  | Vite import            |

### 13.2 Asset Loading Strategy

Assets are loaded **per hero** to avoid loading all 12 heroes worth of art at startup.

```typescript
// Asset bundles by hero
const assetBundles: Record<HeroId, AssetBundle> = {
  [HeroId.Barbarian]: {
    spritesheets: [
      'sprites/heroes/barbarian/idle.json',
      'sprites/heroes/barbarian/attack.json',
      'sprites/enemies/barbarian-chapter/wolf.json',
      // ...
    ],
    backgrounds: [
      'backgrounds/barbarian/layer-sky.png',
      'backgrounds/barbarian/layer-mountains.png',
      'backgrounds/barbarian/layer-trees.png',
      'backgrounds/barbarian/layer-ground.png',
    ],
    music: 'barbarian-theme',
  },
};

// Loading screen shows while hero assets load
async function loadHeroAssets(heroId: HeroId): Promise<void> {
  const bundle = assetBundles[heroId];

  // PixiJS 8 Assets API supports bundle loading
  Assets.addBundle(heroId, bundle.spritesheets.concat(bundle.backgrounds));
  await Assets.loadBundle(heroId, (progress) => {
    // Update loading bar
  });
}
```

### 13.3 Spritesheet Format

Using **TexturePacker** (or free alternative like **ShoeBox** / **free-tex-packer**) to produce spritesheet JSON + PNG pairs in PixiJS-compatible format:

```jsonc
// Example: barbarian-idle.json
{
  "frames": {
    "idle-0": { "frame": { "x": 0, "y": 0, "w": 128, "h": 192 } },
    "idle-1": { "frame": { "x": 128, "y": 0, "w": 128, "h": 192 } },
    "idle-2": { "frame": { "x": 256, "y": 0, "w": 128, "h": 192 } },
  },
  "animations": {
    "idle": ["idle-0", "idle-1", "idle-2"],
  },
  "meta": {
    "image": "barbarian-idle.png",
    "size": { "w": 512, "h": 256 },
  },
}
```

---

## 14. Debug & Developer Tooling

### 14.1 Debug Configuration System

Debug options are configured via **URL query parameters** parsed at startup. No UI needed in production.

```
http://localhost:5173/?debug=true&logLevel=debug&logModules=combat,economy&hero=barbarian&chapter=3&skipTo=boss&upgrades=max&invincible=true
```

```typescript
// debug/DebugConfig.ts
export interface DebugConfig {
  enabled: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  logModules: string[]; // Empty = all modules; ['combat'] = only combat logs

  // ── Quick Start ──
  hero: HeroId | null; // Skip to specific hero
  chapter: ChapterId | null; // Skip to specific chapter
  skipTo: 'traversal' | 'duel' | 'boss' | null; // Skip directly to phase

  // ── Cheats ──
  upgrades: 'none' | 'half' | 'max' | null; // Pre-set upgrade levels
  invincible: boolean; // Hero can't die
  infiniteTime: boolean; // Timer doesn't count down
  currency: number | null; // Override starting currency
  seed: number | null; // Force PRNG seed

  // ── Rendering ──
  showHitboxes: boolean; // Render collision boxes
  showFps: boolean; // FPS counter
  showStateOverlay: boolean; // XState current state on screen
}

export function parseDebugConfig(): DebugConfig {
  if (import.meta.env.PROD) {
    return DEFAULT_PROD_CONFIG; // All disabled in production
  }

  const params = new URLSearchParams(window.location.search);

  return {
    enabled: params.get('debug') === 'true',
    logLevel: (params.get('logLevel') as DebugConfig['logLevel']) ?? 'info',
    logModules: params.get('logModules')?.split(',') ?? [],
    hero: (params.get('hero') as HeroId) ?? null,
    chapter: params.has('chapter')
      ? (Number(params.get('chapter')) as ChapterId)
      : null,
    skipTo: (params.get('skipTo') as DebugConfig['skipTo']) ?? null,
    upgrades: (params.get('upgrades') as DebugConfig['upgrades']) ?? null,
    invincible: params.get('invincible') === 'true',
    infiniteTime: params.get('infiniteTime') === 'true',
    currency: params.has('currency') ? Number(params.get('currency')) : null,
    seed: params.has('seed') ? Number(params.get('seed')) : null,
    showHitboxes: params.get('showHitboxes') === 'true',
    showFps: params.get('showFps') === 'true',
    showStateOverlay: params.get('showStateOverlay') === 'true',
  };
}
```

### 14.2 Structured Logger

```typescript
// debug/Logger.ts
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  none: 5,
};

export class Logger {
  private static config: DebugConfig = parseDebugConfig();

  static create(module: string): ModuleLogger {
    return new ModuleLogger(module, Logger.config);
  }
}

export class ModuleLogger {
  constructor(
    private module: string,
    private config: DebugConfig,
  ) {}

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return level === 'error'; // Always log errors
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.logLevel])
      return false;
    if (
      this.config.logModules.length > 0 &&
      !this.config.logModules.includes(this.module)
    )
      return false;
    return true;
  }

  trace(msg: string, ...args: unknown[]): void {
    if (this.shouldLog('trace'))
      console.debug(`[${this.module}]`, msg, ...args);
  }
  debug(msg: string, ...args: unknown[]): void {
    if (this.shouldLog('debug'))
      console.debug(`[${this.module}]`, msg, ...args);
  }
  info(msg: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) console.info(`[${this.module}]`, msg, ...args);
  }
  warn(msg: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) console.warn(`[${this.module}]`, msg, ...args);
  }
  error(msg: string, ...args: unknown[]): void {
    if (this.shouldLog('error'))
      console.error(`[${this.module}]`, msg, ...args);
  }
}

// Usage:
// const log = Logger.create('combat');
// log.debug('Damage calculated', { base: 10, multiplier: 1.5, final: 15 });
```

### 14.3 XState Inspector Integration

XState v5 supports a built-in inspector for visualizing state machines in real time:

```typescript
// debug/StateInspector.ts
import { createBrowserInspector } from '@statelyai/inspect';

export function setupInspector(config: DebugConfig): void {
  if (!config.enabled || import.meta.env.PROD) return;

  const inspector = createBrowserInspector();
  // Actors created with inspect option will be visible in the Stately inspector
  // The inspector opens in a separate browser tab
}
```

When debug mode is enabled, the game actor is created with the inspector:

```typescript
const gameActor = createActor(gameMachine, {
  inspect: config.enabled ? inspector.inspect : undefined,
});
```

### 14.4 Dev Cheat Commands

```typescript
// debug/Cheats.ts
export function applyDebugOverrides(
  config: DebugConfig,
  gameActor: ActorRefFrom<typeof gameMachine>,
): void {
  if (!config.enabled) return;

  // Auto-select hero and chapter
  if (config.hero) {
    gameActor.send({ type: 'START_GAME' });
    gameActor.send({
      type: 'SELECT_HERO',
      heroId: config.hero,
      chapter: config.chapter ?? 1,
    });
  }

  // Override upgrades
  if (config.upgrades === 'max') {
    gameActor.send({ type: 'DEBUG_SET_UPGRADES', level: 6 });
  } else if (config.upgrades === 'half') {
    gameActor.send({ type: 'DEBUG_SET_UPGRADES', level: 3 });
  }

  // Override currency
  if (config.currency !== null) {
    gameActor.send({ type: 'DEBUG_SET_CURRENCY', amount: config.currency });
  }
}
```

### 14.5 Example Debug Scenarios

| Scenario                               | URL                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------- |
| Test Ch. 3 boss duel with max upgrades | `?debug=true&hero=barbarian&chapter=3&skipTo=boss&upgrades=max`         |
| Test economy with zero upgrades        | `?debug=true&hero=barbarian&chapter=1&upgrades=none&logModules=economy` |
| Test combat logging only               | `?debug=true&logLevel=debug&logModules=combat`                          |
| Test with fixed random seed            | `?debug=true&seed=12345`                                                |
| Visual debug (hitboxes + FPS)          | `?debug=true&showHitboxes=true&showFps=true`                            |
| Invincible mode for art review         | `?debug=true&invincible=true&infiniteTime=true`                         |
| Test first-run experience              | `?debug=true` (fresh state, no overrides)                               |

---

## 15. Testing Strategy

### 15.1 Testing Pyramid

```
          ╱╲
         ╱  ╲          E2E (Playwright)
        ╱ 5% ╲         - Full screen flows
       ╱──────╲        - Visual regression
      ╱  15%   ╲       Integration (Vitest + RTL)
     ╱──────────╲      - React components + XState
    ╱    80%     ╲     Unit (Vitest)
   ╱──────────────╲    - Pure functions, state machines, systems
  ╱────────────────╲
```

### 15.2 Unit Tests (Vitest)

**What to test:**

- All `core/systems/` pure functions (combat, economy, progression, health, timer, levelGenerator)
- All XState machines (state transitions, guard conditions, context updates)
- Enemy behavior strategies
- Utility functions (math, random, timing)
- SaveManager (with mocked localStorage)
- Logger filtering logic

**Example: Economy system test**

```typescript
// core/systems/economy.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRunReward } from './economy';

describe('calculateRunReward', () => {
  it('awards $1 per percent distance in chapter 1', () => {
    const result = calculateRunReward(
      {
        distancePercent: 50,
        duelDamageDealt: 0,
        enemiesDefeated: 0,
        bossDefeated: false,
        coinsCollected: [],
      },
      ChapterId.Chapter1,
    );

    expect(result.distanceReward).toBe(50);
  });

  it('applies chapter 2 multiplier (2.5x)', () => {
    const result = calculateRunReward(
      {
        distancePercent: 50,
        duelDamageDealt: 0,
        enemiesDefeated: 0,
        bossDefeated: false,
        coinsCollected: [],
      },
      ChapterId.Chapter2,
    );

    expect(result.distanceReward).toBe(125);
  });

  it('awards $50 per enemy killed', () => {
    const result = calculateRunReward(
      {
        distancePercent: 0,
        duelDamageDealt: 0,
        enemiesDefeated: 3,
        bossDefeated: false,
        coinsCollected: [],
      },
      ChapterId.Chapter1,
    );

    expect(result.enemyKillReward).toBe(150);
  });
});
```

**Example: State machine test**

```typescript
// core/machines/duelMachine.test.ts
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { duelMachine } from './duelMachine';

describe('DuelMachine', () => {
  const createDuel = (overrides = {}) =>
    createActor(duelMachine, {
      input: {
        hero: { maxHp: 100, damage: 10, attackSpeed: 1, armor: 0 },
        enemies: [{ id: 'wolf', hp: 50, damage: 15, behavior: 'wolf' }],
        ...overrides,
      },
    });

  it('transitions to heroActing on ATTACK when idle', () => {
    const actor = createDuel();
    actor.start();
    actor.send({ type: 'ATTACK' });
    expect(actor.getSnapshot().matches('heroActing')).toBe(true);
  });

  it('ignores ATTACK when already attacking (commitment)', () => {
    const actor = createDuel();
    actor.start();
    actor.send({ type: 'ATTACK' });
    actor.send({ type: 'ATTACK' }); // Should be ignored
    // Hero should still be in the first attack, not queued
    expect(actor.getSnapshot().context.attackCount).toBe(1);
  });

  it('reduces enemy HP when attack connects', () => {
    const actor = createDuel();
    actor.start();
    actor.send({ type: 'ATTACK' });
    // Simulate animation completion
    actor.send({ type: 'ANIMATION_COMPLETE' });
    expect(actor.getSnapshot().context.enemies[0].currentHp).toBe(40);
  });
});
```

### 15.3 Integration Tests (Vitest + React Testing Library)

**What to test:**

- React components rendering correctly based on XState state
- User interactions triggering correct state transitions
- Upgrade screen purchase flow
- HUD displaying correct values

```typescript
// ui/screens/UpgradeScreen/UpgradeScreen.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UpgradeScreen } from './UpgradeScreen';

describe('UpgradeScreen', () => {
  it('disables upgrade buttons when player cannot afford', () => {
    // Render with a mock game actor that has 0 currency
    render(<UpgradeScreen />, { wrapper: createTestProvider({ currency: 0 }) });

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('enables affordable upgrades', () => {
    render(<UpgradeScreen />, { wrapper: createTestProvider({ currency: 100 }) });

    const affordableButton = screen.getByText('18'); // Cost of first upgrade
    expect(affordableButton).toBeEnabled();
  });
});
```

### 15.4 E2E Tests (Playwright)

**What to test:**

- Full screen flow: Title → Hero Select → Run → Results → Upgrade → Run again
- Save/load persistence across browser refresh
- Export/import save data
- Visual regression on key screens (screenshot comparison)

```typescript
// e2e/run-loop.spec.ts
import { test, expect } from '@playwright/test';

test('complete first run and purchase upgrade', async ({ page }) => {
  await page.goto('/');

  // Title screen
  await expect(page.getByText('Horde Breaker')).toBeVisible();
  await page.getByRole('button', { name: 'Play' }).click();

  // Hero select — only Barbarian available
  await expect(page.getByText('Barbarian')).toBeVisible();
  await page.getByText('Barbarian').click();

  // Game screen — wait for run to end (or use debug params)
  // ... (use debug URL to fast-forward)

  // Results screen
  await expect(page.getByText('Defeat')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Upgrade screen
  await expect(page.getByText('Max Health')).toBeVisible();
});
```

### 15.5 Test Utilities & Fixtures

```typescript
// test-utils/createTestProvider.tsx
export function createTestProvider(overrides: Partial<SaveData> = {}) {
  return function TestProvider({ children }: { children: React.ReactNode }) {
    const testActor = createActor(gameMachine, {
      input: { saveData: { ...createDefaultSaveData(), ...overrides } },
    });
    testActor.start();
    return <GameActorContext.Provider value={testActor}>{children}</GameActorContext.Provider>;
  };
}

// test-utils/mockFactories.ts
export function mockHeroStats(overrides: Partial<DerivedHeroStats> = {}): DerivedHeroStats {
  return {
    maxHp: 100,
    armor: 0,
    runSpeed: 5,
    damageMultiplier: 1,
    attackSpeed: 1,
    specialAbility: { /* defaults */ },
    ...overrides,
  };
}

export function mockEnemyInstance(overrides = {}): EnemyInstance {
  return { id: 'wolf', currentHp: 50, maxHp: 50, damage: 15, x: 400, ...overrides };
}
```

### 15.6 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/core/**', 'src/ui/**', 'src/services/**'],
      exclude: ['src/**/*.test.*', 'src/**/index.ts'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@core': '/src/core',
      '@data': '/src/data',
      '@rendering': '/src/rendering',
      '@audio': '/src/audio',
      '@input': '/src/input',
      '@services': '/src/services',
      '@ui': '/src/ui',
      '@debug': '/src/debug',
      '@utils': '/src/utils',
    },
  },
});
```

---

## 16. Performance Budgets

### 16.1 Targets

| Metric                  | Budget              | Measurement                                   |
| ----------------------- | ------------------- | --------------------------------------------- |
| **Frame rate**          | Steady 60 FPS       | PixiJS ticker, `requestAnimationFrame`        |
| **Frame budget**        | < 16.6 ms per frame | Don't exceed; drop to 30 FPS gracefully       |
| **Initial load**        | < 3s on broadband   | Vite code-split + hero-specific asset bundles |
| **Hero asset bundle**   | < 5 MB per hero     | Spritesheets + backgrounds + music            |
| **JS bundle (initial)** | < 200 KB gzipped    | Core framework + first screen                 |
| **Memory (runtime)**    | < 300 MB            | PixiJS texture cache + audio buffers          |
| **Input latency**       | < 1 frame (16.6 ms) | Input polled at start of frame                |

### 16.2 Performance Strategies

1. **Object pooling** — Reuse `DamageNumber`, `ParticleEffect`, and `CoinDisplay` instances instead of creating/destroying each frame.

2. **Texture atlases** — Pack spritesheets to minimize draw calls. PixiJS 8 batches sprites sharing the same texture.

3. **Lazy asset loading** — Only load the selected hero's assets. Unload previous hero's assets when switching.

4. **Ticker-driven updates** — Use PixiJS `Ticker` (ties into `requestAnimationFrame`). No `setInterval`.

5. **Selective React rendering** — `useSelector` with fine-grained selectors prevents unnecessary React re-renders during gameplay. Only HUD components update; the full app does not re-render each frame.

6. **Web Workers** (future, if needed) — Enemy AI decision-making could be offloaded to a worker if the main thread becomes bottlenecked. Design the AI strategy interface to be serializable.

---

## 17. Milestone Plan & MVP Scope

### 17.1 MVP (Milestone 1): Barbarian Berzerker

**Goal:** Validate the core fun loop — run → duel → die → upgrade → retry.

| Feature         | Scope                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| **Screens**     | Title, Hero Select (1 hero), Game, Results, Upgrade                                   |
| **Hero**        | Barbarian only — axe swing (LMB), block (RMB), leap attack (Space)                    |
| **Chapters**    | 3 chapters with enemy rosters as designed                                             |
| **Combat**      | DuelMachine with full commitment-based input                                          |
| **Traversal**   | Auto-run, jump, duck, obstacles (time-tax + health-tax)                               |
| **Upgrades**    | 6×6 grid, full economy loop                                                           |
| **Enemies**     | Wolf, Swordsman, Shieldbearer, Highland Archer, Pikeman, Berserker, War Hound Handler |
| **Bosses**      | Ch.1 Henchman, Ch.2 Henchman, Ch.3 Final Boss (2 phases)                              |
| **Audio**       | 1 music track, core SFX                                                               |
| **Persistence** | LocalStorage save/load, export/import                                                 |
| **Debug**       | Full debug config system, logger, XState inspector                                    |
| **Tests**       | Unit tests for all systems + machines, component tests for screens                    |
| **Visual**      | Placeholder/prototype art with parallax backgrounds                                   |

**NOT included in MVP:**

- Other heroes
- Prestige system (placeholder only)
- Cinematics
- Spine animations (spritesheet only)
- Tutorial (Chapter 0)
- Multi-enemy duels with special mechanics (destructible terrain, invulnerability)

### 17.2 Implementation Order (MVP)

```
Phase 1: Foundation (Week 1–2)
  ├── Project scaffolding (Vite, TS, ESLint, Vitest, Playwright)
  ├── Core types & data structures
  ├── Debug config & Logger
  ├── SaveManager + schema
  ├── Math/random/timing utilities + tests
  └── GameMachine (screen flow only, no gameplay)

Phase 2: Combat Core (Week 3–4)
  ├── Combat system (pure functions) + tests
  ├── DuelMachine + tests
  ├── Enemy behaviors (Wolf first, then others) + tests
  ├── Health system + tests
  └── InputManager (keyboard + mouse)

Phase 3: Run Loop (Week 5–6)
  ├── RunMachine (orchestrates traversal ↔ duel) + tests
  ├── TraversalMachine + tests
  ├── Timer system + tests
  ├── Level generator + tests
  └── Economy system (reward calculation) + tests

Phase 4: Rendering (Week 7–8)
  ├── PixiJS Application setup + React bridge
  ├── Parallax background system
  ├── HeroDisplay + SpritesheetAnimator
  ├── EnemyDisplay
  ├── DuelScene + TraversalScene
  ├── Screen shake, hit flash, damage numbers
  └── ObstacleDisplay + CoinDisplay

Phase 5: UI & Polish (Week 9–10)
  ├── TitleScreen, HeroSelect components
  ├── HUD overlay (timer, health, cooldown)
  ├── ResultsScreen + economy display
  ├── UpgradeScreen + UpgradeGrid
  ├── AudioManager + music + SFX
  ├── Boss slow-mo, death animations, transitions
  └── Export/import save

Phase 6: Testing & Tuning (Week 11–12)
  ├── Integration tests for all screens
  ├── E2E tests (Playwright)
  ├── Balance/pacing playtesting
  ├── Performance profiling
  └── Bug fixes, polish
```

### 17.3 Future Milestones (Post-MVP)

| Milestone | Scope                                                      |
| --------- | ---------------------------------------------------------- |
| **M2**    | Amazonian Archer (validates ranged hero + second setting)  |
| **M3**    | Tutorial system (Chapter 0), cinematics                    |
| **M4**    | Prestige system + skill board                              |
| **M5**    | Wizard hero (validates spell-based hero)                   |
| **M6**    | Multi-enemy special mechanics (destructible terrain, etc.) |
| **M7+**   | Remaining heroes in batches of 2–3                         |

---

## 18. Architectural Concerns & Risk Register

### 18.1 Active Concerns

| #   | Concern                                                                                                                                                               | Severity     | Mitigation                                                                                                                                                                                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **XState v5 game loop performance** — Sending an event every frame (TICK) to XState may have overhead. XState is designed for discrete events, not 60 FPS game loops. | Medium       | The `TICK` event should be lightweight. Heavy per-frame logic (physics, collision) should run as pure functions _outside_ the state machine, writing results back via a single `assign`. Profile early. If needed, keep fast-path logic outside XState and only send events for discrete game moments (enemy reached, attack started). |
| 2   | **State machine complexity** — The DuelMachine with parallel enemy states + hero states + multi-enemy logic could become very large.                                  | Medium       | Decompose into child actors: each enemy gets its own small actor. The DuelMachine orchestrates. Use XState's `invoke` and `spawn` to keep individual machines small and testable.                                                                                                                                                      |
| 3   | **React re-rendering during gameplay** — If selectors are too broad, React will re-render the HUD every frame (60 FPS).                                               | Low          | Use `useSelector` with narrow selectors returning primitives (number, string). Avoid returning objects/arrays. React only re-renders when the selector's return value changes (by reference equality). The HUD typically only needs: timer (changes every second), HP (changes on hit), cooldown (changes on use).                     |
| 4   | **Asset size for 12 heroes** — 12 heroes × ~5 MB each = ~60 MB of assets total.                                                                                       | Low          | Lazy-load per hero. Player only downloads assets for heroes they play. Browser cache handles repeat loads. Consider progressive loading (low-res first, swap to high-res).                                                                                                                                                             |
| 5   | **Commitment-based combat feel** — The "locked into animation" mechanic is hard to get right. Too long = frustrating. Too short = no commitment.                      | Medium       | Make animation durations data-driven and easy to tune. Use the debug system to test with different `attackSpeed` values. The `Attack Speed` upgrade directly shortens these durations, so the worst case is the un-upgraded state.                                                                                                     |
| 6   | **Post-duel HP regen (TBD in design doc)** — Whether to restore ~25% HP after a duel.                                                                                 | N/A (design) | Architecture supports it: `applyPostDuelHeal()` is a pure function with configurable heal percent. Default to 0 (no heal), togglable via data.                                                                                                                                                                                         |
| 7   | **Spacebar overload** — Spacebar is both Jump (traversal, duel) and Special (duel).                                                                                   | Low          | Context-sensitive: in traversal, Space = special ability. In duel, Space = special attack. W = jump in both modes. The InputManager maps Space to `GameAction.Special`; the active machine decides how to handle it. Make this clear in the tutorial.                                                                                  |

### 18.2 Design Decisions Log

| Decision                                              | Rationale                                                             | Date       |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ---------- |
| Vite + Vitest over CRA + Jest                         | Faster DX, native ESM, shared config, no ejection needed              | 2026-02-15 |
| Pluggable animation (spritesheet default)             | Avoids Spine license dependency for MVP; clean interface boundary     | 2026-02-15 |
| CSS Modules over CSS-in-JS                            | Minimal runtime cost; most visual rendering is PixiJS, not DOM        | 2026-02-15 |
| 1920×1080 design resolution                           | Industry standard for HD side-scrollers; auto-scales with `resizeTo`  | 2026-02-15 |
| XState actor hierarchy (game → run → duel)            | Matches natural lifecycle; child actors are created/destroyed per run | 2026-02-15 |
| Seeded PRNG for level generation                      | Enables deterministic replay, test fixtures, debug seeds              | 2026-02-15 |
| URL query params for debug config                     | Zero UI overhead; works in any environment; easily shareable          | 2026-02-15 |
| No react-router — state machine IS the router         | Fewer dependencies; screen state is already modeled in GameMachine    | 2026-02-15 |
| Pure functions for all game math                      | Maximum testability; no mocking needed                                | 2026-02-15 |
| Object pooling for frequently created display objects | Prevents GC spikes in the game loop                                   | 2026-02-15 |

---

## Appendix A: Key Type Definitions Quick Reference

```typescript
// ── Enums ──
enum HeroId { Barbarian = 'barbarian', Archer = 'archer', Wizard = 'wizard', /* ... */ }
enum ChapterId { Tutorial = 0, Chapter1 = 1, Chapter2 = 2, Chapter3 = 3 }
enum GameAction { MoveLeft, MoveRight, Jump, Duck, Sprint, SlowDown, Attack, Defend, Special }
enum TimerPhase { Safe = 'safe', Warning = 'warning', Critical = 'critical' }

// ── Core Interfaces ──
interface HeroDefinition { id, name, setting, baseStats, upgradeCategories, abilities, assets }
interface EnemyDefinition { id, name, baseHp, baseDamage, range, behavior, animations }
interface UpgradeCategoryData { id, name, costs: number[], effectPerLevel: number[] }
interface SaveData { version, heroes, unlockedHeroes, globalFlags, settings, prestige }
interface RunResult { distancePercent, duelDamageDealt, enemiesDefeated, bossDefeated, coinsCollected }
interface RewardBreakdown { distanceReward, duelDamageReward, enemyKillReward, bossReward, coinReward, total }
interface DerivedHeroStats { maxHp, armor, runSpeed, damageMultiplier, attackSpeed, specialAbility }
interface IAnimationController { play, stop, setSpeed, getDisplayObject, onComplete, destroy }
interface IEnemyBehavior { decideAction, getWindUpDuration, getRecoveryDuration }
interface DebugConfig { enabled, logLevel, logModules, hero, chapter, skipTo, upgrades, invincible, ... }
```

## Appendix B: Recommended VS Code Extensions

- **XState** — `statelyai.stately-vscode` — Visual state machine editor & inspector
- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`
- **CSS Modules** — `clinyong.vscode-css-modules`
- **Vitest** — `vitest.explorer` — Test runner integration

## Appendix C: npm Scripts Reference

```jsonc
{
  "scripts": {
    "dev": "vite", // Start dev server (HMR)
    "build": "tsc && vite build", // Type-check + production build
    "preview": "vite preview", // Preview production build
    "test": "vitest", // Run tests in watch mode
    "test:run": "vitest run", // Run tests once (CI)
    "test:coverage": "vitest run --coverage", // Tests with coverage report
    "test:e2e": "playwright test", // Run Playwright E2E tests
    "lint": "eslint src/", // Lint all source files
    "lint:fix": "eslint src/ --fix", // Auto-fix lint issues
    "format": "prettier --write src/", // Format all source files
    "typecheck": "tsc --noEmit", // Type-check without emitting
  },
}
```
