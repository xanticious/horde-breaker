# Horde Breaker — Art Design Guide

> **Document version:** 1.0
> **Last updated:** 2026-02-22
> **Audience:** Artists, Developers
> **Companion docs:** `DESIGN_NOTES.md`, `IMPLEMENTATION_DESIGN.md`, `IMPLEMENTATION_PLAN.md`

---

## Table of Contents

1. [Can We Start Now?](#1-can-we-start-now)
2. [Technical Specifications](#2-technical-specifications)
3. [Tooling Workflow](#3-tooling-workflow)
4. [Asset Inventory](#4-asset-inventory)
5. [Priority Order & Sprint Alignment](#5-priority-order--sprint-alignment)
6. [Naming Conventions](#6-naming-conventions)
7. [Art Direction — Barbarian (MVP)](#7-art-direction--barbarian-mvp)
8. [Placeholder Strategy](#8-placeholder-strategy)

---

## 1. Can We Start Now?

**Yes — start immediately.** Art production is completely independent of the coding pipeline. The renderer uses colored rectangle placeholders until real assets arrive (see [Section 8](#8-placeholder-strategy)). Dropping in finished assets at any point replaces those placeholders with no code changes needed.

**Why start now:**
- Background parallax layers are the highest-impact, lowest-complexity asset. Even rough/WIP art will make the game feel real.
- The hero animation set takes the longest — starting early gives time to iterate.
- Sprint 7 (the next coding sprint) introduces the parallax system. Having *any* real background art ready by then would be ideal.

**No coding milestone blocks art production.** The asset loading system (Sprint 6–7) and spritesheet animator (Sprint 7–10) are designed to accept real assets as drop-in replacements for placeholders.

---

## 2. Technical Specifications

### 2.1 Canvas & World Resolution

| Property             | Value                                       |
| -------------------- | ------------------------------------------- |
| **Design resolution** | 1920 × 1080 px (16:9)                      |
| **Scaling mode**     | Letterbox (black bars on non-16:9 displays) |
| **HiDPI variants**   | `@1x` (1920×1080 world) and `@2x` (doubled) |

All sprite sizes below are given at **@1x**. Double every dimension for the `@2x` variant.

---

### 2.2 Sprite Frames

Characters face **right** by default (hero moves left-to-right). Enemies that need to face left are flipped in code — do **not** draw mirrored versions.

| Entity Type      | Frame Size (@1x) | Anchor Point            | Notes                                    |
| ---------------- | ---------------- | ----------------------- | ---------------------------------------- |
| Hero (Barbarian) | 256 × 384 px     | Bottom-center (0.5, 1)  | Tall enough for axe swing reach          |
| Wolf             | 240 × 180 px     | Bottom-center (0.5, 1)  | Wider than tall (pouncing beast)         |
| Swordsman        | 256 × 384 px     | Bottom-center (0.5, 1)  | Same footprint as hero                   |
| Shieldbearer     | 240 × 384 px     | Bottom-center (0.5, 1)  | Slightly narrower due to compact stance  |
| Highland Archer  | 220 × 360 px     | Bottom-center (0.5, 1)  | Lighter build                            |
| Pikeman          | 320 × 400 px     | Bottom-center (0.5, 1)  | Wider to accommodate pike reach          |
| Berserker        | 280 × 400 px     | Bottom-center (0.5, 1)  | Bulkier than base enemies                |
| War Hound Handler | 256 × 384 px    | Bottom-center (0.5, 1)  | Shares swordsman frame size              |

> **Why bottom-center anchor?** All characters stand on a ground line. Anchoring at the bottom center means `position.y` always equals the ground Y coordinate, regardless of the sprite's height. This is set in code — artists just need to ensure the character's feet are at the bottom edge of the frame.

**Leave transparent padding** within the frame as needed — the frame dimensions above are the *canvas* size, not the inked area. Weapons and limbs may extend to the edges during attack frames.

---

### 2.3 Spritesheet Packing Rules

Each animation is packed into its own PNG + JSON pair using **free-tex-packer** with PixiJS-compatible output:

- **Format:** PNG + JSON (PixiJS / TexturePacker format)
- **Max sheet size:** 4096 × 4096 px (@1x); 4096 × 4096 px (@2x — same limit, larger frames)
- **Padding between frames:** 2 px (prevents texture bleeding)
- **Allow rotation:** No (breaks PixiJS `AnimatedSprite` pivot logic)
- **Trim whitespace:** Yes (smaller sheets; code reads the source size for positioning)
- **Power-of-2 dimensions:** Preferred but not required (PixiJS 8 / WebGL2 handles NPOT textures)

Split animations by logical group, not by entity:

```
✅  barbarian-idle.png / barbarian-idle.json
✅  barbarian-attack.png / barbarian-attack.json
❌  barbarian-all.png   (single giant sheet gets unwieldy to edit and re-export)
```

---

### 2.4 Animation Specifications

**Target frame rate:** 24 fps

| Entity       | Animation    | Est. Frame Count | Loop? | Notes                                      |
| ------------ | ------------ | :-----------: | :---: | ------------------------------------------ |
| **Barbarian** | `idle`      | 12–16         | Yes   | Breathing + weight-shifting cycle          |
|              | `run`        | 10–14         | Yes   | Used during traversal movement             |
|              | `attack`     | 12–16         | No    | Full axe swing; communicates melee timing  |
|              | `block`      | 6–8           | No    | Snap to guard position; hold last frame    |
|              | `block-hit`  | 4–6           | No    | Flinch while blocking                      |
|              | `hit`        | 4–6           | No    | Knockback/stagger                          |
|              | `death`      | 16–20         | No    | Full fall; end on last frame               |
|              | `leap`       | 12–16         | No    | Leap attack — jump arc + landing strike    |
|              | `victory`    | 12–16         | Yes   | Celebration on chapter clear               |
| **Wolf**     | `idle`       | 8–12          | Yes   | Snarling, weight shifting                  |
|              | `pounce`     | 10–14         | No    | Wind-up + launch; key timing read for player |
|              | `retreat`    | 8–10          | No    | Backing away after pounce                  |
|              | `hit`        | 4–6           | No    | Stagger                                    |
|              | `death`      | 12–16         | No    | Collapse                                   |
| **Swordsman** | `idle`      | 10–14         | Yes   | On guard, sword at the ready               |
|              | `wind-up`    | 8–10          | No    | Telegraphed swing preparation              |
|              | `attack`     | 8–10          | No    | Two-handed sword swing                     |
|              | `push`       | 6–8           | No    | Kicks/shoves hero back to reset spacing    |
|              | `hit`        | 4–6           | No    | Stagger                                    |
|              | `death`      | 12–16         | No    |                                            |
| **Shieldbearer** | `idle`   | 10–14         | Yes   | Shield up, on guard                        |
|              | `bash`       | 10–14         | No    | Shield bash wind-up → lunge; clearly telegraphed |
|              | `attack`     | 10–14         | No    | Broadsword swing                           |
|              | `hit`        | 4–6           | No    |                                            |
|              | `death`      | 12–16         | No    |                                            |

> Additional enemies (Archer, Pikeman, Berserker, War Hound Handler) follow the same idle/attack/hit/death pattern. Document them in a follow-up once core roster is locked.

---

### 2.5 Background Layers (Parallax)

Each hero has **4 background layers** that scroll at different speeds. Layers must **tile seamlessly horizontally** so they can repeat infinitely as the hero runs.

| Layer         | Dimensions (@1x)  | Scroll Speed | Notes                                       |
| ------------- | ----------------- | :----------: | ------------------------------------------- |
| `sky`         | 2048 × 1080 px    | 0.10×        | Gradient sky + distant clouds/sun           |
| `mountains`   | 2048 × 1080 px    | 0.30×        | Far background mountain range               |
| `trees`       | 2048 × 1080 px    | 0.60×        | Mid-ground tree line                        |
| `ground`      | 2048 × 1080 px    | 1.00×        | Foreground ground/grass strip               |

- Width of 2048 px (power-of-2) is preferred for `TilingSprite` GPU efficiency.
- Height must be 1080 px to fill the full canvas vertically.
- The ground layer must define a **consistent ground line Y position** — characters are placed relative to this. Recommend the ground line sits at Y=950 in world space (leaving a 130 px footer strip).

---

### 2.6 UI Art

| Asset             | Format | Dimensions (@1x) | Notes                                     |
| ----------------- | ------ | :--------------: | ----------------------------------------- |
| Favicon           | SVG    | 32 × 32          | Axe icon or game logo                     |
| Hero portrait     | PNG    | 256 × 256        | Shown on HeroSelect screen                |
| Upgrade icons     | SVG/PNG | 64 × 64         | One per upgrade category (6 for Barbarian)|
| Currency icon     | PNG    | 48 × 48          | Barbarian clan gold coin                  |
| Health bar fill   | PNG    | 256 × 32         | Tileable fill texture (optional — CSS fallback exists) |

---

### 2.7 File Format Summary

| Asset Type        | Format         | Transparency | Location                                           |
| ----------------- | -------------- | :----------: | -------------------------------------------------- |
| Character sprites | PNG + JSON     | ✅ Required  | `assets/sprites/heroes/barbarian/`                 |
| Enemy sprites     | PNG + JSON     | ✅ Required  | `assets/sprites/enemies/barbarian-chapter/`        |
| Parallax BGs      | PNG            | ✅ sky layer; ❌ others | `assets/backgrounds/barbarian/`       |
| Obstacles         | PNG + JSON     | ✅ Required  | `assets/sprites/obstacles/`                        |
| UI icons/art      | SVG (icons), PNG (art) | ✅ Required | `assets/sprites/ui/`                   |
| Fonts             | WOFF2          | —            | `public/fonts/`                                    |
| Music             | MP3 (128–192 kbps) | —        | `assets/audio/music/`                              |
| SFX               | WebM + MP3 fallback | —       | `assets/audio/sfx/`                                |

> **Why PNG and not WebP for sprites?** PixiJS's `Assets.load()` spritesheet loader expects PNG textures referenced from the JSON. WebP can be used for backgrounds (static images loaded directly) but avoid it for spritesheets until confirmed compatible with the pack tool output.

---

## 3. Tooling Workflow

### 3.1 Recommended Pipeline

```
Source art (PSD / Aseprite / Procreate)
  → Export individual frames as numbered PNGs
  → free-tex-packer (pack into spritesheet PNG + JSON)
  → Drop into assets/ directory
  → Vite serves assets statically; PixiJS loads them at runtime
```

### 3.2 free-tex-packer Settings

Download: https://free-tex-packer.com/

Recommended project settings per character:

```
Texture format:   PNG
Packer:           MaxRects (best packing efficiency)
Exporter:         PixiJS
Allow rotation:   OFF
Trim mode:        Trim (enabled)
Padding:          2
Max atlas width:  4096
Max atlas height: 4096
Scale:            1x (repeat at 2x for @2x exports)
```

Save the `.ftpp` project file alongside your source art so settings are reproducible.

### 3.3 @1x / @2x Variants

Export each animation **twice** from the same project:

- **@1x** — export as `barbarian-idle.png` / `barbarian-idle.json`
- **@2x** — double the canvas size in your art tool, re-export as `barbarian-idle@2x.png` / `barbarian-idle@2x.json`

PixiJS's `Assets` API will automatically select the correct resolution based on `devicePixelRatio` when asset bundles are configured with resolution suffixes. (This wiring will be done during Sprint 6–7.)

---

## 4. Asset Inventory

Complete checklist for the Barbarian MVP. Organized by subsystem.

### 4.1 Backgrounds

- [ ] `layer-sky.png` + `layer-sky@2x.png` — Scottish sky, distant hills
- [ ] `layer-mountains.png` + `layer-mountains@2x.png` — Highland mountain range
- [ ] `layer-trees.png` + `layer-trees@2x.png` — Pine/heather tree line
- [ ] `layer-ground.png` + `layer-ground@2x.png` — Foreground turf/rocky ground

### 4.2 Barbarian Hero Sprites

- [ ] `barbarian-idle.png` / `.json` + `@2x` variants
- [ ] `barbarian-run.png` / `.json` + `@2x` variants
- [ ] `barbarian-attack.png` / `.json` + `@2x` variants
- [ ] `barbarian-block.png` / `.json` + `@2x` variants
- [ ] `barbarian-block-hit.png` / `.json` + `@2x` variants
- [ ] `barbarian-hit.png` / `.json` + `@2x` variants
- [ ] `barbarian-death.png` / `.json` + `@2x` variants
- [ ] `barbarian-leap.png` / `.json` + `@2x` variants
- [ ] `barbarian-victory.png` / `.json` + `@2x` variants

### 4.3 Wolf Enemy Sprites

- [ ] `wolf-idle.png` / `.json` + `@2x` variants
- [ ] `wolf-pounce.png` / `.json` + `@2x` variants
- [ ] `wolf-retreat.png` / `.json` + `@2x` variants
- [ ] `wolf-hit.png` / `.json` + `@2x` variants
- [ ] `wolf-death.png` / `.json` + `@2x` variants

### 4.4 Swordsman Enemy Sprites

- [ ] `swordsman-idle.png` / `.json` + `@2x` variants
- [ ] `swordsman-windup.png` / `.json` + `@2x` variants
- [ ] `swordsman-attack.png` / `.json` + `@2x` variants
- [ ] `swordsman-push.png` / `.json` + `@2x` variants
- [ ] `swordsman-hit.png` / `.json` + `@2x` variants
- [ ] `swordsman-death.png` / `.json` + `@2x` variants

### 4.5 Shieldbearer Enemy Sprites

- [ ] `shieldbearer-idle.png` / `.json` + `@2x` variants
- [ ] `shieldbearer-bash.png` / `.json` + `@2x` variants
- [ ] `shieldbearer-attack.png` / `.json` + `@2x` variants
- [ ] `shieldbearer-hit.png` / `.json` + `@2x` variants
- [ ] `shieldbearer-death.png` / `.json` + `@2x` variants

### 4.6 Chapter 2 Enemy Sprites

- [ ] `archer-idle.png` / `.json` + `@2x` variants
- [ ] `archer-draw.png` / `.json` + `@2x` variants
- [ ] `archer-shoot.png` / `.json` + `@2x` variants
- [ ] `archer-hit.png` / `.json` + `@2x` variants
- [ ] `archer-death.png` / `.json` + `@2x` variants
- [ ] `arrow.png` + `@2x` variant (single frame, no JSON needed — just a static sprite)
- [ ] `pikeman-idle.png` / `.json` + `@2x` variants
- [ ] `pikeman-thrust.png` / `.json` + `@2x` variants
- [ ] `pikeman-hit.png` / `.json` + `@2x` variants
- [ ] `pikeman-death.png` / `.json` + `@2x` variants

### 4.7 Chapter 3 Enemy Sprites

- [ ] `berserker-idle.png` / `.json` + `@2x` variants
- [ ] `berserker-attack.png` / `.json` + `@2x` variants
- [ ] `berserker-hit.png` / `.json` + `@2x` variants
- [ ] `berserker-death.png` / `.json` + `@2x` variants
- [ ] `handler-idle.png` / `.json` + `@2x` variants _(War Hound Handler; shares wolf sprites for hound)_
- [ ] `handler-attack.png` / `.json` + `@2x` variants
- [ ] `handler-hit.png` / `.json` + `@2x` variants
- [ ] `handler-death.png` / `.json` + `@2x` variants

### 4.8 Obstacles

These are traversal-phase props (e.g., boulder, fallen log, fence, ditch).

- [ ] `obstacle-boulder.png` / `.json` + `@2x` variants _(can be a single static frame — no animation required)_
- [ ] `obstacle-log.png` / `.json` + `@2x` variants
- [ ] `obstacle-ditch.png` / `.json` + `@2x` variants

_(Exact obstacle types to be confirmed in Sprint 8.)_

### 4.9 UI Art

- [ ] `favicon.svg` — axe/crest icon
- [ ] `portrait-barbarian.png` + `@2x` — hero select screen portrait (256×256 @1x)
- [ ] Upgrade category icons × 6 (64×64 @1x, SVG preferred):
  - `icon-health.svg`
  - `icon-armor.svg`
  - `icon-damage.svg`
  - `icon-attack-speed.svg`
  - `icon-move-speed.svg`
  - `icon-special.svg`
- [ ] `icon-currency-barbarian.png` + `@2x` — clan gold coin

---

## 5. Priority Order & Sprint Alignment

Work assets in this order. Each tier unblocks the next coding sprint.

### Tier 1 — Start Immediately (Needed by Sprint 7)

The traversal system boots up in Sprint 7. Having real art here makes the game feel alive immediately.

1. **Barbarian parallax backgrounds** (all 4 layers)  
   _Lowest frame count, highest visual impact. Sets the tone for the whole game._

2. **Barbarian `idle` animation**  
   _The hero needs to stand there while traversal runs. Just 12–16 frames._

3. **Barbarian `run` animation**  
   _Hero movement during traversal._

4. **Favicon** (`favicon.svg`)  
   _Trivial effort, needed for Sprint 4._

### Tier 2 — Before Sprint 10 (First Duel)

The Wolf duel lands in Sprint 10. The hero's combat animations and the wolf must be ready.

5. **Barbarian `attack`, `block`, `block-hit`, `hit`, `death`** animations
6. **Wolf** — full animation set (idle, pounce, retreat, hit, death)

### Tier 3 — Before Sprint 14 (Ch.1 Full Roster)

7. **Swordsman** — full animation set
8. **Shieldbearer** — full animation set

### Tier 4 — Before Sprint 15 (Ch.2/3 Enemies)

9. **Highland Archer** + `arrow` sprite
10. **Pikeman**
11. **Berserker**
12. **War Hound Handler**

### Tier 5 — Before Sprint 13 (Upgrade Screen)

13. **Hero portrait** (HeroSelect screen)
14. **Upgrade category icons** × 6
15. **Currency icon**

### Tier 6 — Before Sprint 8 (Obstacles)

16. **Obstacle props** (boulder, log, ditch)  
    _(Can stay placeholder until Sprint 20 polish pass if time-constrained)_

---

## 6. Naming Conventions

### 6.1 File Names

All lowercase, hyphen-separated. Animation type at the end.

```
{entity}-{animation}.png
{entity}-{animation}.json
{entity}-{animation}@2x.png
{entity}-{animation}@2x.json
```

Examples:
```
barbarian-idle.png
barbarian-idle.json
barbarian-idle@2x.png
wolf-pounce.json
swordsman-windup.png
layer-mountains.png
layer-mountains@2x.png
```

### 6.2 Frame Names Inside JSON

free-tex-packer will auto-generate frame names from the file names of the input images. Name your source frame files:

```
barbarian-idle-00.png
barbarian-idle-01.png
barbarian-idle-02.png
...
```

This produces JSON entries like:
```json
"frames": {
  "barbarian-idle-00": { ... },
  "barbarian-idle-01": { ... }
},
"animations": {
  "idle": ["barbarian-idle-00", "barbarian-idle-01", ...]
}
```

The animation name key (`"idle"`) is what the code calls via `animationController.play("idle")`. Keep these **lowercase and consistent** across all entities.

### 6.3 Canonical Animation Name Keys

These are the names the code will reference. Use them exactly.

| Key           | Description                              |
| ------------- | ---------------------------------------- |
| `idle`        | Default standing/on-guard state          |
| `run`         | Movement during traversal                |
| `attack`      | Primary weapon attack                    |
| `wind-up`     | Telegraphed attack preparation (enemies) |
| `block`       | Defensive guard stance                   |
| `block-hit`   | Flinch while blocking                    |
| `hit`         | Taking damage / stagger                  |
| `death`       | Defeat sequence                          |
| `leap`        | Barbarian leap attack ability            |
| `victory`     | End-of-chapter celebration               |
| `pounce`      | Wolf pounce                              |
| `retreat`     | Wolf backing off                         |
| `bash`        | Shieldbearer shield bash                 |
| `push`        | Swordsman spacing reset                  |
| `draw`        | Archer drawing arrow                     |
| `shoot`       | Archer releasing arrow                   |
| `thrust`      | Pikeman pike thrust                      |

---

## 7. Art Direction — Barbarian (MVP)

### 7.1 Style

**Photorealistic** — high-definition digital painting with detailed textures. Reference: _God of War_ (2018) character art quality goals, adapted for a 2D side-scrolling perspective.

Avoid:
- Flat vector or cartoon aesthetics
- Pixel art
- Anime proportions

### 7.2 Setting — Scottish Highlands

- **Time period:** Early medieval (roughly 9th–11th century)
- **Palette:** Muted, earthy — heather purples, slate grays, deep greens, brown leathers, iron
- **Lighting:** Overcast/dramatic sky with shafts of light breaking through clouds. Late afternoon golden hour is acceptable for warmth.
- **Ground:** Rocky moorland with patches of heather and coarse grass. No clean manicured grass.
- **Background mountains:** Rugged, fog-capped Scottish Highlands silhouette

### 7.3 Hero — Barbarian Berzerker

- **Build:** Large, imposing. Broad shoulders, muscular but not cartoonishly exaggerated.
- **Weapon:** Two-handed battle axe — heavy, worn iron head, wrapped leather grip
- **Armor:** Light — layered leather, fur at the shoulders, iron bracers. He is not a knight; he moves fast.
- **Clothing:** Tartan-patterned plaid (muted tones), rough-spun trousers
- **Hair:** Long, wild, dark or auburn — windswept
- **Expression:** Fierce focus during combat; weight and exhaustion readable in idle

### 7.4 Enemies — Visual Hierarchy

Enemies should read as **visually subordinate** to the hero at a glance but individually distinct:

- **Wolf:** Mangy Highland wolf, scarred, lean. Gray-brown fur. Should feel like a real predator.
- **Swordsman:** Lightly-armored highland raider. Claymore matches the hero's weapon scale. Worn wool/leather gear, no helmet or simple iron one.
- **Shieldbearer:** Stockier build, targe shield has clan markings. Iron boss on shield face. Broadsword one-handed.

### 7.5 Color Contrast for Gameplay Readability

- **Hero** must be immediately readable against the background at a glance — use a **warmer silhouette** (leather tones) against the cool grey/green background.
- **Enemies** should contrast with each other — wolf (gray), swordsman (mid-tone), shieldbearer (with shield as distinct visual element).
- **Wind-up / telegraph frames** should have a visible **anticipation pose** — players need to react, so the first frames of an attack must look distinct from idle. Consider a brief light flash or color shift on the weapon as a gameplay aid (coded effect, not baked into art).

### 7.6 Animation Feel

- **Weight:** Characters should feel heavy. No floaty motion — axes have mass, footsteps have impact.
- **Anticipation:** All attacks need at least 3–4 frames of wind-up before the strike lands. This is the player's read window — these frames are gameplay-critical.
- **Ease-in/ease-out:** Squash and stretch principles apply even on photorealistic characters — slight exaggeration on impacts, recovery arcs.
- **Hold frames:** `block` and `idle` should have a natural-feeling loopable hold. The last frame of `death` should hold indefinitely (the code never auto-loops it).

---

## 8. Placeholder Strategy

The renderer uses solid-color rectangles as placeholders until real assets are ready. No code changes are required when swapping in real assets — the asset loading system handles it transparently.

**Placeholder assignments (for reference):**

| Placeholder              | Color       | Size            |
| ------------------------ | ----------- | --------------- |
| Barbarian hero sprite    | `#4A90D9`   | 256 × 384 px    |
| Wolf                     | `#7B6B52`   | 240 × 180 px    |
| Swordsman                | `#8B7355`   | 256 × 384 px    |
| Shieldbearer             | `#6B7280`   | 240 × 384 px    |
| BG sky layer             | `#87CEEB`   | 2048 × 1080 px  |
| BG mountains layer       | `#6B8CAE`   | 2048 × 1080 px  |
| BG trees layer           | `#2D5016`   | 2048 × 1080 px  |
| BG ground layer          | `#4A3728`   | 2048 × 1080 px  |

**To ship a real asset:** save the correctly-named PNG + JSON files into the correct `assets/` subdirectory. The asset loading code references paths from the `HeroAssetManifest` data object (defined in `src/data/heroes/barbarian.data.ts` in Sprint 5). Update those paths to point to the new files when dropping in real art.

---

## Appendix: Useful Tools

| Tool | Purpose | Link |
| ---- | ------- | ---- |
| free-tex-packer | Pack frames into PixiJS spritesheets | https://free-tex-packer.com/ |
| Aseprite | Pixel/frame animation tool (optional) | https://www.aseprite.org/ |
| TexturePacker | Commercial alternative to free-tex-packer | https://www.codeandweb.com/texturepacker |
| Photoshop / Procreate / Krita | Source art creation | — |
| TinyPNG | PNG compression before shipping | https://tinypng.com/ |
| Squoosh | WebP/PNG conversion & compression | https://squoosh.app/ |
