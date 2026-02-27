# Horde Breaker — AI Art Generation Prompts

Prompts for generating all MVP art assets using **DALL-E 3** or **Stable Diffusion 3**.

## Directory Structure

```
art-prompts/
  backgrounds/          — Parallax background layer prompts
  hero-barbarian/       — Barbarian hero animation prompts
  enemies/
    wolf/               — Wolf enemy animation prompts
    swordsman/          — Swordsman enemy animation prompts
    shieldbearer/       — Shieldbearer enemy animation prompts
    archer/             — Highland Archer + arrow prompts
    pikeman/            — Pikeman enemy animation prompts
    berserker/          — Berserker enemy animation prompts
    handler/            — War Hound Handler animation prompts
  obstacles/            — Traversal obstacle prop prompts
  ui/                   — UI icons, portrait, favicon prompts
```

## How to Use These Prompts

### DALL-E 3 (via ChatGPT or API)

1. Copy the **Primary Prompt** from any `.md` file.
2. Paste it into the DALL-E 3 interface.
3. Set image size to match the **Dimensions** listed in the file header.
4. If the first result doesn't have a transparent background, add: `"on a pure white background"` and remove it in post using a tool like Photoshop or `remove.bg`.
5. DALL-E 3 does not support negative prompts — use the positive prompt only.

### Stable Diffusion 3 (ComfyUI / Automatic1111 / Fooocus)

1. Copy the **Primary Prompt** into the positive prompt field.
2. Copy the **Negative Prompt** into the negative prompt field.
3. Use the recommended sampler: **DPM++ 2M Karras**, steps 25–35, CFG 7.0.
4. Set **width × height** to match the frame dimensions in the file header.
5. For transparent backgrounds: use the `Remove Background` node in ComfyUI, or run `rembg` post-processing.
6. Upscale @1x output to @2x using **Real-ESRGAN x2** for the `@2x` variants.

## Workflow After Generation

```
AI-generated PNG frames (individual key poses)
  → Edit/clean up in Photoshop / Krita
  → Export source frames numbered: entity-anim-00.png, entity-anim-01.png, ...
  → Pack into spritesheet using free-tex-packer (see ART_DESIGN.md §3.2)
  → Drop .png + .json into correct assets/ subdirectory
```

## Universal Style Foundation

All character sprites share these style anchors. They are included in every character prompt but listed here for reference:

- **Art style:** High-definition photorealistic digital painting, 2D side-scrolling game character sprite
- **Reference quality:** God of War (2018) character detail level, adapted for 2D perspective
- **Setting:** Scottish Highlands, early medieval period (9th–11th century)
- **Palette:** Muted earthy tones — heather purple, slate gray, iron, brown leather, deep green
- **Lighting:** Overcast dramatic sky, occasional shafts of golden light
- **Character facing:** Always **facing RIGHT** (hero moves left to right)
- **Framing:** Full body, **feet at the very bottom edge** of the canvas
- **Background:** Transparent / isolated on white for post-processing removal
- **DO NOT generate:** Flat vector art, cartoon style, anime proportions, pixel art, sci-fi elements

## Animation Frame Strategy

AI image generators produce **single images**, not spritesheets. The strategy is:

1. Generate the **key pose** for each animation phase (wind-up, strike, recovery).
2. Use that as the reference/base frame and manually draw or interpolate in-betweens.
3. Alternatively, render multiple generations with slight pose variation and use them as consecutive frames.

Each prompt file includes **Animation Notes** describing the key pose to focus on for
the most important frame in that animation cycle.

## Priority Order

See `design/ART_DESIGN.md` §5 for sprint-aligned priority order. Short version:

1. Background layers (all 4) — needed first
2. Barbarian `idle` + `run`
3. Barbarian combat animations + Wolf full set
4. Swordsman + Shieldbearer
5. Chapter 2 & 3 enemies
6. UI assets (icons, portrait)
7. Obstacles
