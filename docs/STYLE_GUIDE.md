# Horde Breaker — Style Guide

> **Last updated:** 2026-02-23
> **Scope:** Visual design system for the MVP (Barbarian hero only)

---

## Design Principles

- **Dark-theme-first** — All screens assume a dark background. No light-mode variants in MVP.
- **Fire-and-iron** — The palette centres on deep blacks, dark navy, and a fire-orange accent pulled from the favicon sword icon. Secondary emotional cues use red (danger/death) and amber (timer/warning).
- **Legible under pressure** — UI must be readable at a glance during fast-paced gameplay. High contrast text, no tiny fonts on the HUD.
- **No visual noise** — Sparse use of borders and shadows. Surface elevation is communicated through subtle background-color shifts, not heavy drop shadows.

---

## Color Palette

All colors are defined as CSS custom properties in `src/styles/tokens.css` and referenced from CSS Modules via `var(--token-name)`. **Never use hex values directly in component CSS.**

### Backgrounds

| Token                   | Value     | Usage                            |
| ----------------------- | --------- | -------------------------------- |
| `--color-bg`            | `#0d1117` | Page background, deepest layer   |
| `--color-surface`       | `#161b22` | Cards, panels, modals            |
| `--color-surface-alt`   | `#21262d` | Hover state surfaces, table rows |
| `--color-border`        | `#30363d` | Dividers, card outlines          |
| `--color-border-subtle` | `#21262d` | Very faint separators            |

### Text

| Token                 | Value     | Usage                                    |
| --------------------- | --------- | ---------------------------------------- |
| `--color-text`        | `#e6edf3` | Primary body text, headings              |
| `--color-text-muted`  | `#7d8590` | Secondary labels, captions, placeholders |
| `--color-text-subtle` | `#484f58` | Disabled text, decorative separators     |

### Accent (Fire Orange)

| Token                   | Value     | Usage                                 |
| ----------------------- | --------- | ------------------------------------- |
| `--color-accent`        | `#e85d04` | Primary buttons, active states, icons |
| `--color-accent-hover`  | `#f48c06` | Button hover glow                     |
| `--color-accent-active` | `#dc5502` | Button press                          |
| `--color-accent-subtle` | `#2d1200` | Tinted background for accent sections |
| `--color-accent-text`   | `#ffffff` | Text on accent-colored backgrounds    |

### Semantic Colors

| Token                  | Value     | Usage                                       |
| ---------------------- | --------- | ------------------------------------------- |
| `--color-danger`       | `#da3633` | Death, critical damage, destructive actions |
| `--color-danger-hover` | `#f85149` | Danger button hover                         |
| `--color-warning`      | `#e3b341` | Timer warning (≤30s), resource low          |
| `--color-success`      | `#3fb950` | Victory, full health, positive buffs        |

---

## Typography

### Fonts

| Role                             | Family         | Package                      |
| -------------------------------- | -------------- | ---------------------------- |
| **Display** (headings, title)    | Cinzel         | `@fontsource/cinzel`         |
| **Body** (text, buttons, labels) | Inter Variable | `@fontsource-variable/inter` |

Both fonts are self-hosted via Fontsource — no CDN dependency. Imported in `src/styles/global.css`.

```css
/* Reference in CSS via tokens: */
font-family: var(--font-display); /* Cinzel */
font-family: var(--font-body); /* Inter Variable */
```

### Scale

| Token              | rem      | px   | Usage                         |
| ------------------ | -------- | ---- | ----------------------------- |
| `--font-size-xs`   | 0.75rem  | 12px | Fine print, tooltips          |
| `--font-size-sm`   | 0.875rem | 14px | Small buttons, captions       |
| `--font-size-base` | 1rem     | 16px | Body text, standard buttons   |
| `--font-size-md`   | 1.125rem | 18px | Sub-headings, stats           |
| `--font-size-lg`   | 1.25rem  | 20px | Large buttons, section labels |
| `--font-size-xl`   | 1.5rem   | 24px | `<h3>` level                  |
| `--font-size-2xl`  | 1.875rem | 30px | `<h2>` level                  |
| `--font-size-3xl`  | 2.25rem  | 36px | Screen headings               |
| `--font-size-4xl`  | 3rem     | 48px | Large screen subtitles        |
| `--font-size-5xl`  | 4rem     | 64px | Game title "Horde Breaker"    |

### Rules

- Screen `<h2>` headings use `font-family: var(--font-display)` (Cinzel).
- Button text uses `font-family: var(--font-body)` (Inter), `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.04em`.
- Body prose uses `font-family: var(--font-body)`, `font-weight: 400`, `line-height: 1.5`.

---

## Spacing Scale

Spacing tokens are numeric — the number represents `n × 4px`.

| Token        | Value | Typical usage                          |
| ------------ | ----- | -------------------------------------- |
| `--space-1`  | 4px   | Icon gap, tiny nudges                  |
| `--space-2`  | 8px   | Button padding (vertical), small gaps  |
| `--space-3`  | 12px  | List item gap                          |
| `--space-4`  | 16px  | Component gap, default padding         |
| `--space-5`  | 20px  | —                                      |
| `--space-6`  | 24px  | Section gap, card padding              |
| `--space-8`  | 32px  | Screen padding, large gaps             |
| `--space-10` | 40px  | Card horizontal padding                |
| `--space-12` | 48px  | Large section padding                  |
| `--space-16` | 64px  | Vertical rhythm between major sections |

---

## Border Radius

| Token           | Value  | Usage                       |
| --------------- | ------ | --------------------------- |
| `--radius-sm`   | 2px    | Very subtle (tags, badges)  |
| `--radius-md`   | 4px    | Buttons, inputs             |
| `--radius-lg`   | 8px    | Cards, modals, panels       |
| `--radius-xl`   | 12px   | Large floating surfaces     |
| `--radius-full` | 9999px | Pill shapes, circular icons |

---

## Shadows

| Token             | Usage                                     |
| ----------------- | ----------------------------------------- |
| `--shadow-sm`     | Subtle lift (dropdowns)                   |
| `--shadow-md`     | Card elevation                            |
| `--shadow-lg`     | Modal pop-up                              |
| `--shadow-accent` | Glow on hover for accent-colored elements |

---

## Component Conventions

### CSS Modules

- Every component has a co-located `.module.css` — e.g., `Button.tsx` → `Button.module.css`.
- CSS class names inside modules use **camelCase**: `.heroCard`, `.primaryButton`, `.statList`.
- **Never** use global class selectors inside modules (except `:root` / `body` in `global.css`).
- Reference tokens with `var()` — no hardcoded hex values.

### Naming pattern

```css
/* ✅ correct */
.heroCard { background-color: var(--color-surface); }

/* ❌ wrong — hardcoded value */
.heroCard { background-color: #161b22; }

/* ❌ wrong — kebab-case in modules */
.hero-card { ... }
```

---

## Button Component

`src/ui/components/Button/Button.tsx` — three variants, three sizes.

### Variants

| Variant               | Appearance            | Use for                                         |
| --------------------- | --------------------- | ----------------------------------------------- |
| `primary` _(default)_ | Solid fire-orange     | Main CTAs: Play, Start Run, Continue            |
| `secondary`           | Transparent, bordered | Non-destructive secondary actions: Back, Cancel |
| `danger`              | Solid red             | Destructive or loss-framing actions: End Run    |

### Sizes

| Size             | Height | Font | Use for                        |
| ---------------- | ------ | ---- | ------------------------------ |
| `sm`             | 2rem   | 14px | Inline actions, compact UI     |
| `md` _(default)_ | 2.5rem | 16px | Standard screen buttons        |
| `lg`             | 3rem   | 20px | Hero CTAs (TitleScreen "Play") |

### Usage

```tsx
import { Button } from "@ui/components/Button/Button";

<Button onClick={handlePlay} size="lg">Play</Button>
<Button variant="secondary" onClick={handleBack}>Back to Hero Select</Button>
<Button variant="danger" onClick={handleEndRun}>End Run</Button>
<Button disabled>Locked</Button>
```

---

## Screen Layouts

All stub screens share the same structural pattern:

```
┌──────────────────────────────────────┐
│  (full viewport, dark bg)            │
│                                      │
│          [Screen Heading]            │  ← Cinzel, --font-size-3xl
│                                      │
│          [Content area]              │
│                                      │
│          [Action buttons]            │
│                                      │
└──────────────────────────────────────┘
```

### TitleScreen

```
┌──────────────────────────────────────┐
│                                      │
│        HORDE BREAKER                 │  ← Cinzel, --font-size-5xl, --color-accent
│     Failure Makes You Stronger       │  ← Body, muted, uppercase
│                                      │
│           [ Play ]                   │  ← Button primary, size lg
│                                      │
└──────────────────────────────────────┘
```

### HeroSelect

```
┌──────────────────────────────────────┐
│                                      │
│        Select Your Hero              │  ← Cinzel, --font-size-3xl
│                                      │
│  ┌─────────────────────────────┐     │
│  │  BARBARIAN BERZERKER        │     │  ← Interactive hero card
│  │  Melee axe swings. Block... │     │  ← Body sm, muted
│  └─────────────────────────────┘     │
│                                      │
└──────────────────────────────────────┘
```

### GameScreen _(after Sprint 6: will show PixiJS canvas)_

```
┌──────────────────────────────────────┐
│  Game Screen — placeholder           │
│  Hero: barbarian                     │
│                                      │
│           [ End Run ]                │  ← Button danger
└──────────────────────────────────────┘
```

### ResultsScreen

```
┌──────────────────────────────────────┐
│          Run Results                 │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Currency earned:  0          │    │  ← Surface card
│  │ Distance reached: 0%         │    │
│  │ Enemies defeated: 0          │    │
│  └──────────────────────────────┘    │
│                                      │
│     [ Continue to Upgrades ]         │  ← Button primary
└──────────────────────────────────────┘
```

### UpgradeScreen _(after Sprint 13: will show 6×6 upgrade grid)_

```
┌──────────────────────────────────────┐
│           Upgrades                   │
│                                      │
│     Upgrade grid coming soon.        │
│                                      │
│  [ Start Run ]  [ Back to Hero Select] │  ← primary + secondary
└──────────────────────────────────────┘
```

---

## Z-Index Scale

| Token         | Value | Layer                         |
| ------------- | ----- | ----------------------------- |
| `--z-base`    | 0     | Normal document flow          |
| `--z-overlay` | 10    | Parallax layers, game effects |
| `--z-hud`     | 20    | HUD overlay on game canvas    |
| `--z-modal`   | 30    | Modal dialogs                 |
| `--z-tooltip` | 40    | Tooltips, context menus       |
