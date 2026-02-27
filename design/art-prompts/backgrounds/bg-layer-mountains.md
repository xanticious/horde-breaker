# Asset: layer-mountains

**File target:** `assets/backgrounds/barbarian/layer-mountains.png` (+ `layer-mountains@2x.png`)
**Dimensions:** 2048 × 1080 px (@1x) — opaque PNG, must tile seamlessly on the horizontal axis
**Scroll speed:** 0.30× (distant mountain range)

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
A seamlessly tileable wide horizontal panoramic mountain range backdrop for a 2D side-scrolling
video game, Scottish Highlands setting, early medieval. Rugged jagged highland mountain silhouettes
in the mid-distance, fog and low clouds clinging to the upper peaks, deep blue-grey and slate tones
on the rocky faces. Rolling peaks of varied height, some snow-dusted at the very top. Atmospheric
perspective — mountains fade slightly to mist at the edges. The bottom quarter of the image is
transparent or fades to nothing so it composites over a sky layer. Mountains occupy the upper
two-thirds of the image. No characters, no structures, no text. Painterly digital art,
impressionistic detail, cinematic game background art, seamless horizontal tile. Inspired by
God of War 2022 distant mountain environments. Colour palette: cold iron blue-grey mountains,
hints of heather-purple in the lower slopes, white mist at peaks.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, vector art, pixel art, flat design, modern buildings, sci-fi, oversaturated,
neon, text, watermark, signature, characters, castle, volcano, tropical, palm trees,
desert, tiling seam, harsh outlines
```

---

## Technical Requirements

- **Must tile seamlessly** on the left/right edges. Vary the mountain silhouette heights across the image so the repeat pattern is not obvious.
- The **bottom ~300 px** should fade to full transparency (or to the sky haze color) so the layer composites naturally in the parallax stack.
- Mountains should stay in the **upper 70%** of the canvas height.
- Keep some variation in peak heights (3–5 distinct peaks visible within the 2048 px width) to avoid obvious repetition when tiled.

## Seamless Tiling Tip

Generate at 4096 px wide then crop/blend the center 2048 px to capture natural peak variation. Use Photoshop's Offset filter to verify the seam before export.

## Colour Reference

- Mountain rock faces: `#4A5568` to `#6B7280`
- Mist/fog: `#B0BEC5` with low opacity
- Shadow valleys: `#2D3748`
- Hint of heather on lower slopes: `#7B5EA7` at low saturation
