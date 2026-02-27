# Asset: layer-ground

**File target:** `assets/backgrounds/barbarian/layer-ground.png` (+ `layer-ground@2x.png`)
**Dimensions:** 2048 × 1080 px (@1x) — opaque PNG, must tile seamlessly on the horizontal axis
**Scroll speed:** 1.00× (full speed — immediate foreground)

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
A seamlessly tileable wide horizontal foreground ground strip for a 2D side-scrolling video
game, Scottish Highlands setting, early medieval. Rocky moorland ground viewed from a slightly
elevated side perspective. The upper portion of the image shows a clear flat ground plane —
this is the combat/walking surface. Ground texture: dark earth, rocky soil, patches of coarse
tufted grass, clumps of heather, scattered flat stones and pebbles. The ground line (horizon
of the ground plane) sits at approximately Y=950 from the top of the 1080px canvas — leaving a
strip of walkable ground that fills the bottom 130px of the image. Occasional protruding rocks
and heather mounds break the ground silhouette. Muted earthy palette: dark peat brown,
iron-grey rocks, muted olive-green moss, dusty heather purple-grey. The top portion of the
image above the ground line should be transparent so the tree/mountain/sky layers show through.
No characters, no text, seamless horizontal tile, painterly realistic digital art, cinematic
2D game background, naturalistic detail.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, vector art, pixel art, bright green manicured lawn, cobblestones, city street,
mud puddles, tropical, sand, desert, modern elements, characters, text, watermark, tiling seam,
perfectly flat featureless ground
```

---

## Technical Requirements

- **The ground line must be consistent** across the entire 2048 px width at approximately **Y=950** from the top of the canvas. Characters are placed relative to this line.
- **Transparent above the ground line** — only the ground strip itself is opaque.
- **Must tile seamlessly** on the left/right edges. Vary rock and heather clump positions so the repeat isn't obvious.
- The ground plane should read clearly as a solid surface — no floating rocks, no abrupt cuts.
- This is the closest layer to the viewer; add the most detail and texture here.

## Ground Line Convention

The **Y=950 line** in the 1080 px canvas is where character feet will be placed by the engine. Ensure the visible ground surface (dirt/rock) begins clearly at this line. The layer below it (150 px) is ground fill/footer.

## Seamless Tiling Tip

Generate with extra width (4096 px) and center-crop. The organic nature of rocks and heather makes seams less jarring than geometric surfaces. Use the Offset filter to verify and patch.

## Colour Reference

- Peat soil: `#3D2B1F`, `#4A3728`
- Rock: `#5A5A5A`, `#6B6B6B`
- Moss: `#3D4A1A`, `#4A5A22`
- Heather: `#5A3D6B` (muted, not saturated)
- Dry grass: `#7A6B3D`, `#8B7A4A`
