# Asset: layer-trees

**File target:** `assets/backgrounds/barbarian/layer-trees.png` (+ `layer-trees@2x.png`)
**Dimensions:** 2048 × 1080 px (@1x) — PNG with transparency, must tile seamlessly on the horizontal axis
**Scroll speed:** 0.60× (mid-ground treeline)

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
A seamlessly tileable wide horizontal mid-ground tree line for a 2D side-scrolling video game,
Scottish Highlands setting, early medieval. Dense line of ancient Scottish pine trees,
gnarled and wind-twisted, mixed with bare-branched deciduous trees and low heather scrub.
Trees are dark, silhouette-heavy, with varying heights — some tall pines, some squat spreading
oaks, some dead leafless branches. The upper portion of the trees fades naturally against
the sky behind them. The tree canopy bottom is ragged and organic, not a straight line.
Foreground roots and shrub barely visible. Muted deep forest green, near-black trunk silhouettes,
hints of dark amber and rust for dying foliage. No characters, no text. Transparent sky area
above and between tree tops so the mountain/sky layers show through. Painterly detailed digital
art, naturalistic, cinematic 2D game background, seamless horizontal tile. Inspired by God of
War 2018 forest background art. Atmosphere: dark, foreboding ancient forest edge.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, vector, pixel art, flat design, tropical trees, palm trees, neon, bright colors,
sci-fi, modern elements, characters, animals, text, watermark, tiling seam, symmetrical layout,
perfectly even tree heights, overly bright green
```

---

## Technical Requirements

- **Transparent background** above and between tree tops — this layer sits over the mountains and sky.
- **Must tile seamlessly** horizontally — vary tree heights and species so the repeat isn't obvious.
- Trees should occupy roughly the **bottom 60%** of the canvas, with canopy tops reaching up toward the middle of the image.
- The **bottom edge** of this layer should be transparent or fade out, as the ground layer sits below it.
- Keep tree density varied — dense clusters alternating with small gaps to add rhythm.

## Seamless Tiling Tip

Use SD3 with a Tiling LoRA, or generate wide and manually clone/blend the seam edge. The organic irregular silhouette of trees makes seams less noticeable than geometric patterns — focus more on height variation.

## Colour Reference

- Scottish pine foliage: `#1A3A1A` to `#2D5016`
- Bare branches / dead wood: `#3D2B1F`
- Trunk shadows: `#1A1A0F`
- Dying autumn foliage hints: `#6B4226`, `#8B5E3C`
- Heather scrub at base: `#4A2D5A` (very muted)
