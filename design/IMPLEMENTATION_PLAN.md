# Horde Breaker — Implementation Plan

> **Last updated:** 2026-02-19
> **Methodology:** Agile — incremental delivery, always-shippable trunk
> **Scope:** MVP (Milestone 1) — Barbarian Berzerker only
> **Companion docs:** `DESIGN_NOTES.md`, `IMPLEMENTATION_DESIGN.md`

---

## Principles

1. **Always shippable.** After every sprint the app builds, runs, and passes all tests with zero warnings.
2. **Skeleton first.** Start with a Hello World React app, then layer in structure, then behavior, then polish.
3. **Create files when needed.** Folder hierarchy is established early, but source files are only created when first used.
4. **Test as you go.** Every new module gets a co-located `.test.ts` file in the same sprint it's created.
5. **Data-driven.** Balance constants live in `src/data/` from the start — never hard-coded in logic.

---

## Sprint Overview

| Sprint | Theme                              | Deliverable                                                          |
| ------ | ---------------------------------- | -------------------------------------------------------------------- |
| 0      | Bootstrapping                      | Vite + React + TS app builds & deploys; CI-ready test/lint scripts   |
| 1      | Folder Skeleton                    | Full directory hierarchy; barrel `index.ts` stubs; path aliases      |
| 2      | Stub Screens & Navigation          | All MVP screens render; XState GameMachine drives screen routing     |
| 3      | Logging & Debug Mode               | Structured Logger; `?debug=` URL param config; dev overlay           |
| 4      | Visual Foundations                 | Favicon, title, fonts, CSS reset, global tokens, Style Guide doc     |
| 5      | Core Types & Data Layer            | Domain types, Barbarian hero data, balance data, enemy data          |
| 6      | Game Loop & PixiJS Bootstrap       | PixiJS canvas inside GameScreen; ticker running; React↔PixiJS bridge |
| 7      | Traversal — Movement & Parallax    | Hero auto-runs; parallax background scrolls; basic placeholder art   |
| 8      | Traversal — Obstacles & HUD        | Time-tax/health-tax obstacles; HUD overlay (timer, HP bar)           |
| 9      | Combat Core — Pure Systems         | `combat.ts`, `health.ts`, `economy.ts`, `progression.ts` + tests     |
| 10     | First Duel — Wolf                  | DuelMachine; Wolf behavior; hero attacks & blocks; duel ends         |
| 11     | Run Loop — Traversal ↔ Duel        | RunMachine orchestrates segments; enemies placed via levelGenerator  |
| 12     | Results & Economy                  | ResultsScreen shows rewards; currency persisted; reward formulas     |
| 13     | Upgrade Screen                     | 6×6 UpgradeGrid; purchase flow; derived stats applied to hero        |
| 14     | More Enemies (Ch.1 roster)         | Swordsman + Shieldbearer behaviors; multi-enemy encounter display    |
| 15     | Chapters 2 & 3 Enemies             | Highland Archer, Pikeman, Berserker, War Hound Handler behaviors     |
| 16     | Boss Fights                        | Henchman bosses (Ch.1, Ch.2); Final Boss 2-phase (Ch.3)              |
| 17     | Audio                              | AudioManager, MusicPlayer, SfxPlayer; Barbarian theme + core SFX     |
| 18     | Input System Polish                | Full InputManager; traversal vs duel context; remappable keys        |
| 19     | Persistence & Save System          | SaveManager; schema migrations; export/import; auto-save triggers    |
| 20     | Visual Juice & Effects             | Screen shake, hit flash, damage numbers, perfect block, slow-mo      |
| 21     | Balance, Playtesting & Performance | Tuning pass; perf profiling; coverage check; remaining tests         |
| 22     | E2E Tests & Final Polish           | Playwright flows; visual regression; bug fixes; MVP release          |

---

## Sprint 0 — Bootstrapping

**Goal:** A minimal React + TypeScript app that builds, serves in dev, produces a production bundle, and has working lint/test/typecheck scripts — all with zero errors or warnings.

### Tasks

- [x] **0.1** — Initialize npm project (`npm init`), install core dependencies:
  - `react`, `react-dom`, `xstate`, `@xstate/react`, `pixi.js`, `howler`
- [x] **0.2** — Install dev dependencies:
  - `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`,
    `@testing-library/react`, `@testing-library/jest-dom`,
    `oxlint`, `oxlint-tsgolint`, `oxfmt`, `babel-plugin-react-compiler`,
    `@playwright/test`
- [x] **0.3** — Create config files:
  - `tsconfig.json` (strict mode, path aliases, `jsx: "react-jsx"`)
  - `tsconfig.node.json`
  - `vite.config.ts` (React plugin, path alias resolution, `babel-plugin-react-compiler`)
  - `vitest.config.ts` (jsdom environment, path aliases, coverage thresholds)
  - `.oxlintrc.json` (oxlint config: TypeScript + React Hooks rules, `no-explicit-any: error`)
  - `playwright.config.ts`
- [x] **0.4** — Create minimal app shell:
  - `index.html` (mounts `#root`, sets `<title>Horde Breaker</title>`)
  - `src/main.tsx` (renders `<App />`)
  - `src/App.tsx` (returns `<h1>Horde Breaker</h1>`)
  - `src/vite-env.d.ts`
- [x] **0.5** — Add npm scripts to `package.json`:
  - `dev`, `build`, `preview`, `test`, `test:run`, `test:coverage`, `lint`, `lint:fix`, `format`, `typecheck`, `test:e2e`
- [x] **0.6** — Write a single smoke test:
  - `src/App.test.tsx` — renders App, asserts "Horde Breaker" text is present.
- [x] **0.7** — Verify all scripts pass:
  - `npm run build` → success, no warnings
  - `npm run typecheck` → 0 errors
  - `npm run lint` → 0 errors
  - `npm run test:run` → 1 test passes
- [x] **0.8** — Add `.gitignore` (node_modules, dist, coverage, playwright-report).
- [x] **0.9** — Initial git commit.

### Acceptance Criteria

- `npm run dev` serves the app at localhost; page shows "Horde Breaker".
- `npm run build` produces `dist/` with zero warnings.
- `npm run test:run` passes.
- `npm run lint` and `npm run typecheck` report zero issues.

---

## Sprint 1 — Folder Skeleton

**Goal:** The full directory hierarchy from the Implementation Design exists. Barrel `index.ts` stubs are in place. Path aliases resolve correctly.

### Tasks

- [x] **1.1** — Create the source directory structure (empty folders, no source files yet):

  ```
  src/core/machines/
  src/core/systems/
  src/core/entities/heroes/
  src/core/entities/enemies/
  src/core/entities/obstacles/
  src/core/types/
  src/data/heroes/
  src/data/enemies/
  src/data/chapters/
  src/rendering/scenes/
  src/rendering/display/
  src/rendering/effects/
  src/rendering/animation/
  src/audio/
  src/input/
  src/services/
  src/ui/providers/
  src/ui/hooks/
  src/ui/screens/TitleScreen/
  src/ui/screens/HeroSelect/
  src/ui/screens/GameScreen/
  src/ui/screens/ResultsScreen/
  src/ui/screens/UpgradeScreen/
  src/ui/screens/PrestigeScreen/
  src/ui/components/HUD/
  src/ui/components/Button/
  src/ui/components/Modal/
  src/ui/components/Transition/
  src/debug/
  src/utils/
  ```

- [x] **1.2** — Create barrel `index.ts` files for each top-level module:
  - `src/core/index.ts`, `src/data/index.ts`, `src/rendering/index.ts`, `src/audio/index.ts`, `src/input/index.ts`, `src/services/index.ts`, `src/ui/index.ts`, `src/debug/index.ts`, `src/utils/index.ts`
  - Each starts as an empty file (or a `// barrel export` comment). Exports are added as files are created.
- [x] **1.3** — Create asset directory structure:

  ```
  assets/sprites/heroes/barbarian/
  assets/sprites/enemies/
  assets/sprites/obstacles/
  assets/sprites/effects/
  assets/sprites/ui/
  assets/backgrounds/barbarian/
  assets/audio/music/
  assets/audio/sfx/
  public/fonts/
  ```

- [x] **1.4** — Create `e2e/` and `docs/` directories.
- [x] **1.5** — Verify path aliases resolve: add a trivial util function to `src/utils/math.ts`, import it via `@utils/math` in `App.tsx`, confirm build succeeds. Then remove the usage from App (keep the file for Sprint 9).
- [x] **1.6** — `npm run build` and `npm run typecheck` still pass.

### Acceptance Criteria

- All directories exist (verified by `find` / `tree` command).
- Path aliases (`@core/*`, `@utils/*`, etc.) resolve without TS or Vite errors.
- Build passes.

---

## Sprint 2 — Stub Screens & Navigation

**Goal:** All MVP screens exist as stub React components. GameMachine drives navigation between them. Clicking buttons transitions between screens.

### Tasks

- [ ] **2.1** — Create core domain type stubs used by the GameMachine:
  - `src/core/types/hero.ts` — `HeroId` enum (just `Barbarian` for now), `HeroDefinition` interface stub.
  - `src/core/types/chapter.ts` — `ChapterId` enum.
  - `src/core/types/run.ts` — `RunResult` interface stub.
  - `src/core/types/save.ts` — `SaveData` interface stub, `createDefaultSaveData()`.
- [ ] **2.2** — Create `GameMachine` (`src/core/machines/gameMachine.ts`):
  - States: `titleScreen`, `heroSelect`, `run`, `results`, `upgrade`.
  - Events: `START_GAME`, `SELECT_HERO`, `RUN_COMPLETE`, `CONTINUE_TO_UPGRADE`, `START_RUN`, `RETURN_TO_HERO_SELECT`.
  - No real gameplay logic — `run` state auto-transitions to `results` after a short delay or button press (placeholder).
- [ ] **2.3** — Create `gameMachine.test.ts`:
  - Test every state transition (title → heroSelect → run → results → upgrade → run).
  - Test that invalid events are ignored.
- [ ] **2.4** — Create `GameProvider` (`src/ui/providers/GameProvider.tsx`):
  - Creates the root game actor, provides it via React context.
- [ ] **2.5** — Create hook `useGameActor.ts` (`src/ui/hooks/useGameActor.ts`).
- [ ] **2.6** — Create stub screen components (each renders its name + a navigation button):
  - `TitleScreen.tsx` — "Horde Breaker" title + "Play" button → sends `START_GAME`.
  - `HeroSelect.tsx` — "Select Your Hero" + "Barbarian" button → sends `SELECT_HERO`.
  - `GameScreen.tsx` — "Game Running…" + "End Run" button → sends `RUN_COMPLETE`.
  - `ResultsScreen.tsx` — "Run Results" + "Continue" button → sends `CONTINUE_TO_UPGRADE`.
  - `UpgradeScreen.tsx` — "Upgrades" + "Start Run" / "Back to Hero Select" buttons.
- [ ] **2.7** — Update `App.tsx` to use `GameProvider` and render the active screen based on GameMachine state (state-machine-as-router pattern from the Implementation Design).
- [ ] **2.8** — Write `App.test.tsx` — verify that clicking through the full screen loop works:
  - Title → Play → HeroSelect → Select Barbarian → Game → End Run → Results → Continue → Upgrade → Start Run → Game.
- [ ] **2.9** — All scripts pass.

### Acceptance Criteria

- User can click through every screen in the loop.
- GameMachine tests pass.
- No `react-router` dependency — state machine is the router.

---

## Sprint 3 — Logging & Debug Mode

**Goal:** Structured logger outputs categorized, leveled log messages. `?debug=true` URL params control verbosity and enable dev features. Foundation for all future debug tooling.

### Tasks

- [ ] **3.1** — Create `DebugConfig` (`src/debug/DebugConfig.ts`):
  - `DebugConfig` interface with: `enabled`, `logLevel`, `logModules`, `hero`, `chapter`, `skipTo`, `upgrades`, `invincible`, `infiniteTime`, `currency`, `seed`, `showHitboxes`, `showFps`, `showStateOverlay`.
  - `parseDebugConfig()` — reads `URLSearchParams`, returns `DebugConfig`.
  - In production builds (`import.meta.env.PROD`), all debug features disabled.
- [ ] **3.2** — Create `Logger` (`src/debug/Logger.ts`):
  - `Logger.create(module)` returns a `ModuleLogger` with `trace`, `debug`, `info`, `warn`, `error` methods.
  - Respects `logLevel` and `logModules` filters from `DebugConfig`.
  - Errors always log regardless of config.
- [ ] **3.3** — Write `Logger.test.ts`:
  - Test level filtering (debug messages hidden when logLevel=warn).
  - Test module filtering (only specified modules log).
  - Test that errors always pass through.
- [ ] **3.4** — Create `DebugConfig.test.ts`:
  - Test URL param parsing for various scenarios.
- [ ] **3.5** — Add debug logging to `GameMachine` transitions (log state entry/exit at `debug` level).
- [ ] **3.6** — Create placeholder `Cheats.ts` and `StateInspector.ts` (empty exports, to be filled in later sprints).
- [ ] **3.7** — Update barrel exports in `src/debug/index.ts`.
- [ ] **3.8** — All scripts pass.

### Acceptance Criteria

- Visiting `?debug=true&logLevel=debug&logModules=game` shows `[game]` prefixed logs in the console.
- Visiting without `?debug=true` shows no debug logs (only errors).
- Logger tests pass.

---

## Sprint 4 — Visual Foundations

**Goal:** The app looks intentional, not broken. Favicon, page title, global CSS reset, typography, color tokens, and a Style Guide document are in place.

### Tasks

- [ ] **4.1** — Add a placeholder favicon (`public/favicon.ico` or `.svg`).
- [ ] **4.2** — Set `<title>Horde Breaker</title>` (already in Sprint 0, verify).
- [ ] **4.3** — Choose and add a display font (WOFF2) for headings and a body font. Place in `public/fonts/`. Add `@font-face` declarations.
- [ ] **4.4** — Create `src/styles/` directory with:
  - `reset.css` — minimal CSS reset (box-sizing, margin/padding reset, font smoothing).
  - `tokens.css` — CSS custom properties for the design system:
    - Color palette: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-danger`, `--color-warning`, `--color-success`, etc.
    - Typography: `--font-display`, `--font-body`, `--font-mono`, `--font-size-*`.
    - Spacing: `--space-xs` through `--space-2xl`.
    - Border radius, shadows, transitions.
  - `global.css` — applies reset + tokens to `body/#root`, sets default font.
- [ ] **4.5** — Import `global.css` in `main.tsx`.
- [ ] **4.6** — Create `App.module.css` — full-viewport layout (dark background, centered content).
- [ ] **4.7** — Style all stub screens minimally — centered text, readable font, dark theme, accent-colored buttons. Each screen gets a `.module.css` file.
- [ ] **4.8** — Create `src/ui/components/Button/Button.tsx` + `Button.module.css`:
  - Reusable button component with variants (`primary`, `secondary`, `danger`).
  - Replace ad-hoc `<button>` elements across stub screens with `<Button>`.
- [ ] **4.9** — Create `docs/STYLE_GUIDE.md`:
  - Document the color palette, typography scale, spacing scale.
  - Document component naming conventions (CSS Modules, camelCase classes).
  - Document dark-theme-first approach.
  - Include screenshots or descriptions of each screen's intended layout.
- [ ] **4.10** — All scripts pass. App looks clean and intentional (dark theme, proper fonts, no ugly defaults).

### Acceptance Criteria

- App has a custom favicon displayed in the browser tab.
- Dark theme with legible text on all screens.
- Button component is reused across all screens.
- `docs/STYLE_GUIDE.md` exists and documents the design system.

---

## Sprint 5 — Core Types & Data Layer

**Goal:** All domain types needed for MVP are defined. Barbarian hero data, enemy data, chapter layouts, and balance constants are authored as `as const satisfies` data files.

### Tasks

- [ ] **5.1** — Flesh out core type definitions (`src/core/types/`):
  - `hero.ts` — `HeroId`, `HeroDefinition`, `HeroBaseStats`, `DerivedHeroStats`, `AbilityDefinition`, `HeroAssetManifest`.
  - `enemy.ts` — `EnemyId`, `EnemyDefinition`, `EnemyBehaviorType`, `EnemyAnimationSet`, `EnemyEncounter`.
  - `upgrade.ts` — `UpgradeCategory`, `UpgradeLevel`, `UpgradeGrid`, `UpgradeCategoryData`.
  - `chapter.ts` — `ChapterId`, `ChapterDefinition`.
  - `combat.ts` — `AttackResult`, `DamageModifiers`, `AttackType`, `DuelState`, `DamageEvent`.
  - `run.ts` — `RunResult`, `RunPhase`, `RewardBreakdown`, `EnemyInstance`, `CoinInstance`.
  - `save.ts` — `SaveData`, `HeroSaveData`, full interfaces, `SAVE_DATA_VERSION`, `createDefaultSaveData()`.
- [ ] **5.2** — Create Barbarian hero data (`src/data/heroes/barbarian.data.ts`):
  - Base stats, 6 upgrade categories with costs and effect-per-level tables.
  - Ability definitions (axe swing, block, leap attack).
- [ ] **5.3** — Create Barbarian enemy data (`src/data/enemies/barbarian-enemies.data.ts`):
  - Wolf, Swordsman, Shieldbearer (Chapter 1).
  - Highland Archer, Pikeman (Chapter 2).
  - Berserker, War Hound Handler (Chapter 3).
  - Stats: HP, damage, range, behavior type, loot value.
- [ ] **5.4** — Create chapter definitions (`src/data/chapters/barbarian-chapters.data.ts`):
  - Chapter 1, 2, 3: enemy rosters, boss config, segment layouts.
- [ ] **5.5** — Create balance constants (`src/data/balance.data.ts`):
  - `CHAPTER_MULTIPLIERS`, `MAX_RUN_DURATION_MS`, reward rates, post-duel heal percent.
- [ ] **5.6** — Create lore data (`src/data/lore.data.ts`):
  - Death messages per enemy type, victory lines, boss dialogue.
- [ ] **5.7** — Update barrel exports: `src/core/types/` via `src/core/index.ts`, `src/data/index.ts`.
- [ ] **5.8** — Write type-level smoke tests (import and assert data satisfies types).
- [ ] **5.9** — All scripts pass.

### Acceptance Criteria

- All MVP types compile.
- Barbarian data files exist and are imported without error.
- `as const satisfies` is used for all data files.

---

## Sprint 6 — Game Loop & PixiJS Bootstrap

**Goal:** A PixiJS 8 `Application` renders inside the GameScreen. The ticker runs. A colored rectangle moves — proving the game loop is alive. React and PixiJS coexist without conflicts.

### Tasks

- [ ] **6.1** — Create `GameRenderer` (`src/rendering/GameRenderer.ts`):
  - Async `init(canvasParent)` — creates PixiJS `Application`, appends canvas.
  - `startGameLoop(onUpdate)` — adds ticker callback.
  - `destroy()` — cleans up PixiJS resources.
- [ ] **6.2** — Update `GameScreen.tsx`:
  - Create a `canvasRef` div.
  - `useEffect` initializes `GameRenderer`, starts the game loop, cleans up on unmount.
  - Renders a simple animated rectangle or bouncing sprite as proof of life.
- [ ] **6.3** — Create `GameScreen.module.css`:
  - Canvas fills the screen area. Aspect ratio 16:9 letterbox.
- [ ] **6.4** — Write `GameRenderer.test.ts`:
  - Test that init/destroy lifecycle doesn't throw (mocked canvas).
- [ ] **6.5** — Verify: navigate to Game screen, see animated content, navigate away and back without errors or memory leaks.
- [ ] **6.6** — All scripts pass.

### Acceptance Criteria

- GameScreen shows a PixiJS canvas with animated content.
- Navigating away and back doesn't leak PixiJS resources.
- No console errors.

---

## Sprint 7 — Traversal: Movement & Parallax

**Goal:** The hero auto-runs rightward across a scrolling parallax background. Placeholder art (colored layers) conveys depth. Hero sprite placeholder moves on screen.

### Tasks

- [ ] **7.1** — Create `ParallaxBackground` (`src/rendering/display/ParallaxBackground.ts`):
  - 3–4 `TilingSprite` layers scrolling at different speeds.
  - Placeholder textures (solid or gradient colored rectangles) until real art is ready.
- [ ] **7.2** — Create `HeroDisplay` (`src/rendering/display/HeroDisplay.ts`):
  - A placeholder sprite (colored rectangle or simple shape) positioned on the left side.
  - Methods: `setStance(stance)`, `setPosition(x, y)`.
- [ ] **7.3** — Create `TraversalScene` (`src/rendering/scenes/TraversalScene.ts`):
  - Composes `ParallaxBackground` + `HeroDisplay`.
  - `update(state, deltaMs)` scrolls the background based on hero speed.
- [ ] **7.4** — Create `TraversalMachine` (`src/core/machines/traversalMachine.ts`):
  - Context: `speed`, `heroPosition`, `segmentLength`, `heroStance`.
  - Handles `TICK` events to advance position.
  - Emits `SEGMENT_COMPLETE` when end of segment reached.
- [ ] **7.5** — Write `traversalMachine.test.ts`:
  - Test that position advances on TICK.
  - Test segment completion.
- [ ] **7.6** — Wire `TraversalScene` into `GameScreen` + `GameRenderer`.
- [ ] **7.7** — Verify: entering the Game screen shows a scrolling world with a hero placeholder.
- [ ] **7.8** — All scripts pass.

### Acceptance Criteria

- Parallax background scrolls smoothly with depth illusion.
- Hero placeholder is visible on screen.
- TraversalMachine tests pass.

---

## Sprint 8 — Traversal: Obstacles & HUD

**Goal:** Obstacles appear during traversal. The hero can jump (W) and duck (S). The HUD displays a countdown timer and health bar as React overlays.

### Tasks

- [ ] **8.1** — Create `InputManager` (`src/input/InputManager.ts`):
  - Polls keyboard state. Returns `InputSnapshot` with active `GameAction`s.
  - Basic implementation — no remapping yet.
- [ ] **8.2** — Create input types (`src/input/types.ts`): `GameAction` enum, `InputSnapshot`, `InputMap`.
- [ ] **8.3** — Create `InputMap.ts` with `DEFAULT_INPUT_MAP`.
- [ ] **8.4** — Extend `TraversalMachine` to handle obstacles:
  - Time-tax obstacles: hero stops and climbs if not jumped.
  - Health-tax obstacles: hero takes damage if not jumped/ducked.
  - Accept `JUMP`, `DUCK` events from input.
- [ ] **8.5** — Create `ObstacleDisplay` (`src/rendering/display/ObstacleDisplay.ts`) — placeholder rectangles.
- [ ] **8.6** — Create obstacle types (`src/core/entities/obstacles/obstacleBase.ts`): `TimeTax` vs `HealthTax`.
- [ ] **8.7** — Create HUD components (`src/ui/components/HUD/`):
  - `HUD.tsx` — overlay container with `pointer-events: none`.
  - `Timer.tsx` — countdown display with green/orange/red color phases.
  - `HealthBar.tsx` — HP bar.
- [ ] **8.8** — Create `timer.ts` (`src/core/systems/timer.ts`) + `timer.test.ts`:
  - `tickTimer()`, `getTimerPhase()`, `isTimerExpired()`.
- [ ] **8.9** — Wire HUD into `GameScreen` (React overlay on top of PixiJS canvas).
- [ ] **8.10** — Write `InputManager.test.ts`.
- [ ] **8.11** — All scripts pass.

### Acceptance Criteria

- Obstacles appear in the traversal path.
- Pressing W (jump) or S (duck) affects the hero's stance.
- Not dodging an obstacle causes the correct penalty (time loss or HP loss).
- Timer counts down from 90 and changes color at 30s and 15s.
- Health bar reflects current HP.

---

## Sprint 9 — Combat Core: Pure Systems

**Goal:** All pure-function game systems are implemented and exhaustively tested, independent of any UI or rendering.

### Tasks

- [ ] **9.1** — Create `combat.ts` (`src/core/systems/combat.ts`) + `combat.test.ts`:
  - `calculateDamage()`, `calculateBlockResult()`, `isInRange()`, `calculateKnockback()`.
- [ ] **9.2** — Create `health.ts` (`src/core/systems/health.ts`) + `health.test.ts`:
  - `applyDamage()`, `isAlive()`, `applyPostDuelHeal()`.
- [ ] **9.3** — Create `economy.ts` (`src/core/systems/economy.ts`) + `economy.test.ts`:
  - `calculateRunReward()`, `getUpgradeCost()`, `canAffordUpgrade()`, `applyUpgradePurchase()`.
- [ ] **9.4** — Create `progression.ts` (`src/core/systems/progression.ts`) + `progression.test.ts`:
  - `deriveHeroStats()` — applies all upgrade levels to base stats.
- [ ] **9.5** — Create `levelGenerator.ts` (`src/core/systems/levelGenerator.ts`) + `levelGenerator.test.ts`:
  - `generateLevel()` — procedural enemy placement using seeded PRNG.
- [ ] **9.6** — Create utility modules:
  - `src/utils/math.ts` + `math.test.ts` — `clamp()`, `lerp()`, `randomRange()`.
  - `src/utils/random.ts` + `random.test.ts` — seeded PRNG implementation.
  - `src/utils/timing.ts` — frame-rate-independent delta helpers.
  - `src/utils/constants.ts` — physics constants, magic numbers.
- [ ] **9.7** — Update barrel exports.
- [ ] **9.8** — All scripts pass, coverage on `src/core/systems/` ≥ 80%.

### Acceptance Criteria

- Every system function has ≥ 80% branch coverage.
- All functions are pure — no side effects, no randomness without seed parameter.
- Systems use types from Sprint 5 and data from data layer.

---

## Sprint 10 — First Duel: Wolf

**Goal:** The hero can fight a Wolf enemy in a mini-duel. Attack (LMB) swings, Block (RMB) defends. Wolf pounces. One of them dies. The duel ends.

### Tasks

- [ ] **10.1** — Create enemy behavior interface (`src/core/entities/enemies/enemyBase.ts`):
  - `IEnemyBehavior` — `decideAction()`, `getWindUpDuration()`, `getRecoveryDuration()`.
- [ ] **10.2** — Create Wolf behavior (`src/core/entities/enemies/wolf.ts`) + `wolf.test.ts`:
  - Waits → pounces → retreats cycle.
- [ ] **10.3** — Create `DuelMachine` (`src/core/machines/duelMachine.ts`):
  - States: `idle`, `heroActing`, `enemyActing`, `recovery`, `enemyDefeated`, `heroDied`.
  - Handles: `ATTACK`, `BLOCK`, `JUMP`, `DUCK`, `MOVE_LEFT`, `MOVE_RIGHT`.
  - Commitment-based combat: input rejected while hero is mid-animation.
- [ ] **10.4** — Write `duelMachine.test.ts`:
  - Hero attacks → damage dealt.
  - Hero blocks → reduced damage.
  - Input rejected during animation (commitment).
  - Duel ends when enemy HP reaches 0.
  - Duel ends when hero HP reaches 0.
- [ ] **10.5** — Create `DuelScene` (`src/rendering/scenes/DuelScene.ts`):
  - Hero on left, enemy on right. Placeholder sprites.
  - Enemy health bar above enemy.
- [ ] **10.6** — Create `EnemyDisplay` (`src/rendering/display/EnemyDisplay.ts`):
  - Placeholder sprite with position + stance rendering.
- [ ] **10.7** — Create `HealthBar` display object (`src/rendering/display/HealthBar.ts`):
  - PixiJS bar rendered above enemy.
- [ ] **10.8** — Wire DuelScene into GameScreen — when GameMachine is in `run` state and a duel starts, switch from TraversalScene to DuelScene.
- [ ] **10.9** — All scripts pass.

### Acceptance Criteria

- Clicking LMB during a duel swings the hero's attack.
- Clicking RMB blocks.
- Wolf pounces at the hero, dealing damage if not blocked.
- Duel ends when the Wolf's HP reaches 0 (hero wins) or hero's HP reaches 0 (hero dies).
- DuelMachine tests cover all critical paths.

---

## Sprint 11 — Run Loop: Traversal ↔ Duel

**Goal:** A complete run plays out: hero traverses → encounters an enemy → fights a duel → resumes traversal → encounters next enemy → etc. Run ends on death, victory, or timer expiry.

### Tasks

- [ ] **11.1** — Create `RunMachine` (`src/core/machines/runMachine.ts`):
  - States: `initializing`, `traversal`, `duel`, `death`, `victory`, `complete`.
  - Spawns `TraversalMachine` and `DuelMachine` as child actors.
  - Context: `heroId`, `chapter`, `currentHp`, `timer`, `distanceTravelled`, `enemyLayout`, `currentEncounterIndex`, `enemiesDefeated`, `duelDamageDealt`.
  - Handles `TICK` events for timer countdown.
  - Transitions traversal → duel when enemy position is reached.
  - Transitions duel → traversal when duel is won.
  - Transitions to `death` when HP ≤ 0 or timer expires.
  - Transitions to `victory` when all encounters defeated (chapter cleared).
- [ ] **11.2** — Write `runMachine.test.ts`:
  - Full run lifecycle: init → traversal → duel → traversal → death.
  - Timer expiry triggers death.
  - All encounters cleared triggers victory.
- [ ] **11.3** — Update `GameMachine` to spawn `RunMachine` via `invoke` and receive `RUN_COMPLETE` on done.
- [ ] **11.4** — Update `GameRenderer` to switch between `TraversalScene` and `DuelScene` based on run phase.
- [ ] **11.5** — Verify: a complete run plays from start to finish, alternating traversal and duel, ending in death or victory.
- [ ] **11.6** — All scripts pass.

### Acceptance Criteria

- A complete run with multiple traversal/duel segments works end to end.
- Timer ticking causes run to end when it reaches 0.
- Dying in a duel ends the run.
- Defeating all enemies ends the run in victory.

---

## Sprint 12 — Results & Economy

**Goal:** After a run, the Results screen shows what happened and how much currency was earned. Currency is stored and persists.

### Tasks

- [ ] **12.1** — Update `ResultsScreen.tsx`:
  - Display: distance %, enemies defeated, duel damage, boss defeated, coins collected.
  - Display: reward breakdown (distance reward, kill reward, damage reward, boss reward, coin reward, total).
  - Different headers for death / timeout / victory.
  - Lore message from the enemy (reads from lore data).
- [ ] **12.2** — Create `ResultsScreen.module.css` — styled layout.
- [ ] **12.3** — Wire economy system: `GameMachine` calls `calculateRunReward()` when run completes, stores result in context.
- [ ] **12.4** — Update `SaveData` context in `GameMachine`: add earned currency to `heroes[heroId].currency`.
- [ ] **12.5** — Write `ResultsScreen.test.tsx`:
  - Renders correct values for a mock run result.
  - Shows death vs victory header correctly.
- [ ] **12.6** — All scripts pass.

### Acceptance Criteria

- Results screen shows accurate reward breakdown after a run.
- Currency is added to hero's balance.
- Different presentation for death vs victory.

---

## Sprint 13 — Upgrade Screen

**Goal:** The player can spend earned currency on a 6×6 upgrade grid. Purchasing an upgrade improves the hero's stats for the next run.

### Tasks

- [ ] **13.1** — Create `UpgradeGrid.tsx` (`src/ui/screens/UpgradeScreen/UpgradeGrid.tsx`):
  - 6 rows × 5 upgradeable levels.
  - Each cell shows: cost, purchased indicator, affordable highlight.
  - Click a cell → sends `PURCHASE_UPGRADE` to GameMachine.
- [ ] **13.2** — Create `UpgradeScreen.module.css` and `UpgradeGrid` styles.
- [ ] **13.3** — Update `GameMachine`:
  - `PURCHASE_UPGRADE` action: deducts cost, increments upgrade level in SaveData.
  - Guard: `canAffordUpgrade()`.
- [ ] **13.4** — Verify `deriveHeroStats()` is called with updated upgrades when starting a new run.
- [ ] **13.5** — Display current currency balance on the upgrade screen.
- [ ] **13.6** — Write `UpgradeScreen.test.tsx`:
  - Buttons disabled when currency is insufficient.
  - Purchasing an upgrade deducts currency and updates the grid.
  - Already-purchased levels are visually distinct.
- [ ] **13.7** — Add "Start Run" and "Back to Hero Select" buttons to the upgrade screen.
- [ ] **13.8** — All scripts pass.

### Acceptance Criteria

- Player can buy upgrades when they have enough currency.
- Upgraded stats are visibly applied in the next run (more HP, more damage, etc.).
- Grid clearly indicates purchased, affordable, and locked cells.
- The full game loop (run → results → upgrade → run) works with persistent progression.

---

## Sprint 14 — More Enemies (Chapter 1 Roster)

**Goal:** Swordsman and Shieldbearer enemies are implemented with distinct behaviors. Multi-enemy encounters (2–3 enemies) function correctly.

### Tasks

- [ ] **14.1** — Create Swordsman behavior (`src/core/entities/enemies/swordsman.ts`) + test:
  - Long range, punishes forward movement, knockback on hit.
  - Baitable: swings when hero approaches, recoverable window after.
- [ ] **14.2** — Create Shieldbearer behavior (`src/core/entities/enemies/shieldbearer.ts`) + test:
  - Reduced damage while shield is up.
  - Shield bash → stun → attack pattern.
- [ ] **14.3** — Update `DuelMachine` to support multiple simultaneous enemies:
  - Each enemy tracked independently.
  - Front enemy is the primary target; back enemies can still act (ranged attacks, etc.).
  - Defeating front enemy makes the next enemy the primary target.
- [ ] **14.4** — Update `DuelScene` for multi-enemy rendering:
  - Enemies at different X positions, clear spatial separation.
- [ ] **14.5** — Update `levelGenerator` to place Swordsman and Shieldbearer encounters in Chapter 1.
- [ ] **14.6** — Write integration tests for multi-enemy duels.
- [ ] **14.7** — All scripts pass.

### Acceptance Criteria

- Swordsman fights with long-range timing-based attacks.
- Shieldbearer uses shield bash + sword combos.
- Multi-enemy encounters render and function correctly.
- Chapter 1 has a varied enemy roster.

---

## Sprint 15 — Chapters 2 & 3 Enemies

**Goal:** All remaining Barbarian enemy types are implemented. Chapters 2 and 3 have their full rosters.

### Tasks

- [ ] **15.1** — Create Highland Archer behavior + test:
  - Ranged arrows. Weak at melee range.
- [ ] **15.2** — Create Pikeman behavior + test:
  - Extreme range. Must duck to get inside.
- [ ] **15.3** — Create Berserker behavior + test:
  - Fast, aggressive, relentless combos.
- [ ] **15.4** — Create War Hound Handler behavior + test:
  - Handler + hound as a dual-enemy unit.
- [ ] **15.5** — Update `levelGenerator` for Chapter 2 and 3 enemy rosters + verify variety.
- [ ] **15.6** — Create placeholder display objects for each enemy type (distinct colored rectangles with labels).
- [ ] **15.7** — Playtest Chapter 1, 2, and 3 runs end-to-end.
- [ ] **15.8** — All scripts pass.

### Acceptance Criteria

- All 7 Barbarian enemy types have unique behaviors.
- Chapter 2 includes Ch.1 enemies + Archer + Pikeman.
- Chapter 3 includes all + Berserker + War Hound Handler.

---

## Sprint 16 — Boss Fights

**Goal:** Each chapter ends with a boss fight. Ch.3 boss has two phases. Victory dialogue plays on boss defeat.

### Tasks

- [ ] **16.1** — Create hero base behavior (`src/core/entities/heroes/heroBase.ts`):
  - Shared hero interface and base behavior patterns.
- [ ] **16.2** — Create Barbarian hero behavior (`src/core/entities/heroes/barbarian.ts`) + test:
  - Attack, block, leap attack specifics.
- [ ] **16.3** — Extend `DuelMachine` for boss fights:
  - Boss has more HP, special move.
  - Ch.3 boss: 2 phases (health threshold triggers phase transition, dialogue, stat change).
- [ ] **16.4** — Create `BossScene` or extend `DuelScene` for boss-specific visuals:
  - Larger enemy display. Phase transition visual cue.
- [ ] **16.5** — Wire boss encounter into `levelGenerator` as the final encounter of each chapter.
- [ ] **16.6** — Add victory dialogue display (text overlay on victory).
- [ ] **16.7** — Update `GameMachine`: clearing Chapter 3 sets `chaptersCompleted`.
- [ ] **16.8** — Write boss-specific DuelMachine tests (phase transition, special moves).
- [ ] **16.9** — All scripts pass.

### Acceptance Criteria

- Each chapter ends with a boss fight.
- Ch.3 boss has two phases with a dialogue break in between.
- Defeating a boss shows a victory message.
- Chapter completion is tracked in save data.

---

## Sprint 17 — Audio

**Goal:** Background music plays during runs. Sound effects fire on attacks, blocks, hits, deaths, and UI interactions.

### Tasks

- [ ] **17.1** — Create `AudioManager` (`src/audio/AudioManager.ts`):
  - Singleton wrapping `MusicPlayer` + `SfxPlayer`.
  - Volume controls (master, music, SFX).
- [ ] **17.2** — Create `MusicPlayer` (`src/audio/MusicPlayer.ts`):
  - Play/stop/crossfade. Looping.
- [ ] **17.3** — Create `SfxPlayer` (`src/audio/SfxPlayer.ts`):
  - Audio sprite bank for all SFX.
- [ ] **17.4** — Create `audioManifest.ts` with music and SFX sprite definitions.
- [ ] **17.5** — Add placeholder audio files:
  - 1 music track (Barbarian theme — can be royalty-free placeholder).
  - Core SFX: hit, block, perfect block, coin collect, death, UI click.
- [ ] **17.6** — Wire audio events:
  - Music starts on run begin, stops on run end.
  - SFX trigger on combat events (attack hit, block, death) and UI interactions.
- [ ] **17.7** — Write `AudioManager.test.ts` (mocked Howl).
- [ ] **17.8** — All scripts pass.

### Acceptance Criteria

- Music plays during a run and stops on the results screen.
- Hit/block/kill SFX play during combat.
- UI button clicks have a click sound.

---

## Sprint 18 — Input System Polish

**Goal:** Full `InputManager` with keyboard + mouse polling, context-sensitive action mapping (traversal vs duel), and clean event flow.

### Tasks

- [ ] **18.1** — Polish `InputManager`:
  - `endFrame()` clears just-pressed flags.
  - Prevent context menu on right-click.
  - Mouse position tracking.
- [ ] **18.2** — Implement context-sensitive input translation in the game loop:
  - During traversal: W=Jump, S=Duck, D=Sprint, A=Slow.
  - During duel: LMB=Attack, RMB=Block, Space=Special, WASD=movement.
- [ ] **18.3** — Write `InputManager.test.ts` — comprehensive.
- [ ] **18.4** — All scripts pass.

### Acceptance Criteria

- Controls feel responsive and match the design doc.
- No input lag (input polled at start of frame).
- Context-sensitive mapping documented in code.

---

## Sprint 19 — Persistence & Save System

**Goal:** Full save/load with LocalStorage. Schema versioning with migration support. Export/import to JSON file.

### Tasks

- [ ] **19.1** — Create `SaveManager` (`src/services/SaveManager.ts`):
  - `load()`, `save()`, `reset()`, `exportToFile()`, `importFromFile()`.
- [ ] **19.2** — Create `SaveMigrator` (`src/services/SaveMigrator.ts`):
  - Version-based migration chain.
- [ ] **19.3** — Wire auto-save triggers in `GameMachine`:
  - After upgrade purchase.
  - After run completes.
  - On `beforeunload`.
- [ ] **19.4** — Create `ExportImport.ts` + `ExportImport.test.ts`.
- [ ] **19.5** — Add "Reset All Progress" button on Title Screen (with confirmation modal).
- [ ] **19.6** — Add "Export Save" / "Import Save" buttons (settings or title screen).
- [ ] **19.7** — Write `SaveManager.test.ts` (mocked localStorage).
- [ ] **19.8** — All scripts pass.

### Acceptance Criteria

- Closing and reopening the browser preserves all progress.
- Exporting produces a downloadable JSON file.
- Importing a JSON file restores progress.
- "Reset All Progress" wipes everything (after confirmation).

---

## Sprint 20 — Visual Juice & Effects

**Goal:** The game feels satisfying to play. Screen shake on hits, damage numbers float up, perfect blocks flash "PERFECT", boss kills trigger slow-motion.

### Tasks

- [ ] **20.1** — Create `ScreenShake` (`src/rendering/effects/ScreenShake.ts`):
  - Camera offset shakes. Intensity scales with damage.
- [ ] **20.2** — Create `HitFlash` (`src/rendering/effects/HitFlash.ts`):
  - Brief color tint on hit entity.
- [ ] **20.3** — Create `DamageNumber` (`src/rendering/display/DamageNumber.ts`):
  - Floating text that rises and fades. Object-pooled.
- [ ] **20.4** — Create `PerfectBlock` (`src/rendering/effects/PerfectBlock.ts`):
  - "PERFECT" text flash + distinct SFX.
- [ ] **20.5** — Create `SlowMotion` (`src/rendering/effects/SlowMotion.ts`):
  - Ticker time scale reduction on boss killing blow.
- [ ] **20.6** — Create `CoinDisplay` (`src/rendering/display/CoinDisplay.ts`):
  - Floating coin sprite in traversal. Sparkle on collect.
- [ ] **20.7** — Wire all effects into DuelScene and TraversalScene.
- [ ] **20.8** — All scripts pass.

### Acceptance Criteria

- Getting hit shakes the screen.
- Damage numbers float up from enemies.
- Perfect blocks feel rewarding (visual + audio feedback).
- Boss kill slow-mo moment feels impactful.

---

## Sprint 21 — Balance, Playtesting & Performance

**Goal:** The game feels fair and fun. Performance is within budget. Test coverage meets thresholds.

### Tasks

- [ ] **21.1** — Playtest Chapter 1 from scratch (0 upgrades → clear boss):
  - Tune enemy HP, damage, timing windows.
  - Tune reward rates (player affords ≥ 1 upgrade per run).
  - Target: ~10–15 runs to clear Chapter 1.
- [ ] **21.2** — Playtest Chapters 2 and 3:
  - Verify chapter multipliers make later chapters feel rewarding.
  - Verify difficulty curve is fair.
- [ ] **21.3** — Profile performance:
  - 60 FPS during traversal and duel (check with `?debug=true&showFps=true`).
  - No GC pauses > 5ms.
  - Initial load < 3s.
  - JS bundle < 200 KB gzipped.
- [ ] **21.4** — Check test coverage:
  - `src/core/` ≥ 80%.
  - `src/ui/` ≥ 80%.
  - `src/services/` ≥ 80%.
  - Fill gaps as needed.
- [ ] **21.5** — Fix all remaining console warnings.
- [ ] **21.6** — Update `balance.data.ts` and hero/enemy data files based on playtesting.
- [ ] **21.7** — All scripts pass.

### Acceptance Criteria

- A new player can beat Chapter 1 in 10–15 runs.
- Steady 60 FPS throughout.
- ≥ 80% test coverage on critical modules.
- Zero console warnings in production build.

---

## Sprint 22 — E2E Tests & Final Polish

**Goal:** Playwright E2E tests cover the full game loop. Final bugs fixed. MVP is release-ready.

### Tasks

- [ ] **22.1** — Write E2E tests (`e2e/`):
  - `title-screen.spec.ts` — app loads, title visible, Play button works.
  - `hero-select.spec.ts` — Barbarian selectable, others locked.
  - `run-loop.spec.ts` — start run, fight, die, see results (use `?debug=` params for speed).
  - `upgrade-flow.spec.ts` — purchase an upgrade, verify it persists after page reload.
  - `save-persistence.spec.ts` — progress survives browser refresh.
- [ ] **22.2** — Create test fixtures (`e2e/fixtures/test-save.json`):
  - Pre-built save states for testing specific scenarios.
- [ ] **22.3** — Visual regression screenshots on key screens (Playwright `toHaveScreenshot`).
- [ ] **22.4** — Fix all bugs found during E2E test creation.
- [ ] **22.5** — Final review of all `TODO` / `FIXME` comments in codebase.
- [ ] **22.6** — Update `README.md` with setup instructions, architecture overview, and how to play.
- [ ] **22.7** — Final `npm run build` — zero warnings, bundle size within budget.
- [ ] **22.8** — Tag release `v0.1.0-mvp`.

### Acceptance Criteria

- All E2E tests pass in CI.
- No `TODO` / `FIXME` items remain that block release.
- `README.md` is complete.
- Production build is clean.
- **MVP is complete: Barbarian hero, 3 chapters, full upgrade loop, save/load, audio, visual feedback.**

---

## Backlog (Post-MVP)

These items are tracked but not scheduled. They become sprints in Milestone 2+.

| ID   | Item                                                         | Notes                                        |
| ---- | ------------------------------------------------------------ | -------------------------------------------- |
| B-1  | Tutorial (Chapter 0)                                         | Guided intro to controls; no timer           |
| B-2  | Chapter intro cinematic                                      | Boss + henchmen dialogue before Chapter 1    |
| B-3  | Prestige system                                              | Token rewards, perk board, reset loop        |
| B-4  | Amazonian Archer hero                                        | Ranged combat; jungle setting                |
| B-5  | Wizard hero                                                  | Spell-based; stun-then-burst                 |
| B-6  | Multi-enemy special mechanics                                | Destructible terrain, invulnerable enemies   |
| B-7  | Spine animation integration                                  | Replace spritesheets with skeletal animation |
| B-8  | Key remapping UI                                             | Settings screen for custom controls          |
| B-9  | Achievements / stats                                         | Track player accomplishments                 |
| B-10 | Progressive asset loading                                    | Low-res → high-res swap                      |
| B-11 | Remaining heroes (Sorceress through #12)                     | Each hero is a self-contained content drop   |
| B-12 | Accessibility (reduced motion, high contrast, screen reader) | WCAG compliance pass                         |

---

## Appendix: Sprint Dependency Graph

```
Sprint 0 (bootstrap)
  └─► Sprint 1 (folders)
       └─► Sprint 2 (screens + nav)
            ├─► Sprint 3 (logging/debug)
            └─► Sprint 4 (visual foundations)
                 └─► Sprint 5 (types + data)
                      ├─► Sprint 6 (PixiJS bootstrap)
                      │    └─► Sprint 7 (traversal movement)
                      │         └─► Sprint 8 (obstacles + HUD)
                      │              └─► Sprint 11 (run loop) ◄─┐
                      └─► Sprint 9 (combat systems)              │
                           └─► Sprint 10 (first duel) ──────────┘
                                                                 │
Sprint 11 (run loop) ──────────────────────────────────────────┘
  ├─► Sprint 12 (results + economy)
  │    └─► Sprint 13 (upgrade screen)
  │         └─► Sprint 14 (Ch.1 enemies)
  │              └─► Sprint 15 (Ch.2 + Ch.3 enemies)
  │                   └─► Sprint 16 (bosses)
  ├─► Sprint 17 (audio) ─────────────────────────────►┐
  ├─► Sprint 18 (input polish) ──────────────────────►│
  └─► Sprint 19 (save system) ──────────────────────►│
                                                       ▼
                                              Sprint 20 (visual juice)
                                                       │
                                              Sprint 21 (balance + perf)
                                                       │
                                              Sprint 22 (E2E + release)
```

> Sprints 17, 18, and 19 can be worked in parallel after Sprint 11 if desired.
