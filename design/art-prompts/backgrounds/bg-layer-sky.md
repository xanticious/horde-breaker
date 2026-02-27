# Asset: layer-sky

**File target:** `assets/backgrounds/barbarian/layer-sky.png` (+ `layer-sky@2x.png`)
**Dimensions:** 2048 × 1080 px (@1x) — opaque PNG, must tile seamlessly on the horizontal axis
**Scroll speed:** 0.10× (slowest layer — distant sky)

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
A seamlessly tileable wide horizontal panoramic sky backdrop for a 2D side-scrolling video game,
Scottish Highlands setting, early medieval atmosphere. Dramatic overcast sky with heavy rolling
grey-blue clouds parting to reveal shafts of warm golden afternoon sunlight. Distant soft haze
on the horizon. Faint suggestion of misty far-off hills at the very bottom edge blending into
sky. Deep slate blue and grey cloud mass in upper two-thirds, warm amber and ochre light breaking
through in lower third. Subtle volumetric god-rays. No characters, no foreground elements,
no text. Painterly atmospheric digital art, high detail, cinematic game background, wide
aspect ratio 16:9, seamless horizontal repeat. Inspired by God of War 2022 background art.
Muted earthy heroic fantasy palette — heather purple hints in cloud undersides, cold steel blue,
warm amber highlights.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, vector art, pixel art, flat design, modern city, sci-fi, fantasy castles,
dragons, oversaturated colors, neon, text, watermark, signature, characters, buildings,
roads, trees in foreground, tiling artifacts, visible seam
```

---

## Technical Requirements

- **Must tile seamlessly** on the left/right edges — ensure the leftmost and rightmost pixel columns match in brightness and hue.
- No hard horizon line — the sky should grade softly toward the lower edge where the next layer (mountains) will overlap.
- Pure opaque PNG (no transparency needed for sky layer).
- Keep the bottom ~200 px of the image as lighter haze/mist so the mountains layer composites cleanly on top.

## Seamless Tiling Tip

After generation, use **Photoshop Offset filter** (Filter → Other → Offset, wrap around) to check and fix the seam. In SD3, use the **Tiling** model option if available, or use **SeamlessTexture** LoRA.

## Mood Reference

The sky should feel like standing on a Scottish moor before a storm breaks — heavy, moody, yet with moments of dramatic golden beauty. Think _Kingdom of Heaven_ (2005) battle landscape skies, or _Braveheart_ establishing shots.
