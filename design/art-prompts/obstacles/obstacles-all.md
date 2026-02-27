# Assets: Traversal Obstacles

**File targets:**

- `assets/sprites/obstacles/obstacle-boulder.png` + `.json`
- `assets/sprites/obstacles/obstacle-log.png` + `.json`
- `assets/sprites/obstacles/obstacle-ditch.png` + `.json`

All at @1x and @2x variants. These are traversal-phase props the hero jumps over or avoids.

**Note:** These can be **single static frames** (no animation required). JSON is only needed if the obstacle has any simple idle animation (e.g., a flickering fire on the log). Static single-PNG is acceptable.

---

## Universal Obstacle Style

All obstacles share these characteristics:

- **Setting:** Scottish Highland moorland, early medieval
- **Viewed from:** Slight elevation side-scroll perspective — the obstacle sits ON the ground line
- **Scale reference:** The hero is ~384 px tall at @1x. Obstacles should be roughly 100–200 px tall — significant but clearable.
- **Transparent background** — these are isolated props placed on the ground layer
- **Palette:** Muted earthy tones — stone grey, dark wood, brown earth — to read against the ground background without clashing

---

## obstacle-boulder — Primary Prompt

**Frame size:** Approximately 180 × 140 px (@1x) — transparent background PNG

```
A large rugged Scottish Highland boulder / rock for a 2D side-scrolling video game obstacle
prop. A single massive granite boulder, rough-hewn, mossy on its north face, lichen patches
of grey-green and orange, sitting solidly on dark moorland earth. Slightly irregular, not
perfectly round — natural in shape. The boulder should read clearly as an immovable obstacle
from a side-view perspective. It sits on an invisible ground plane — the flat bottom edge of
the sprite aligns with the ground line. Possibly one or two smaller rocks beside or beneath
it. Photorealistic high-definition digital painting, 2D game environment prop.
Transparent background. Muted palette: granite grey, iron-tinged rock faces, dark green-grey
lichen, earthy shadow beneath. No characters, no background.
```

**Animation Notes:** Static single frame — no animation needed. Export as single PNG.

---

## obstacle-log — Primary Prompt

**Frame size:** Approximately 240 × 120 px (@1x) — transparent background PNG

```
A large fallen tree log / trunk obstacle for a 2D side-scrolling video game prop. A thick
ancient Scottish Caledonian pine trunk that has fallen and lies across the path — the
player must jump over it. Viewed from the side. The log is textured with rough bark,
darker patches of rot and moss on the north side, perhaps a broken stub of a branch.
The cut ends (if visible) show the growth rings and age of the tree. It sits solidly on
the moorland ground. Photorealistic high-definition digital painting, 2D game environment
prop. Transparent background. Natural wood palette: dark red-brown pine bark, lighter
exposed wood on any broken surfaces, green moss patches.
```

**Animation Notes:** Static single frame. Optional: a subtle simple swaying grass/moss animation (2–4 frames loop). Static is fine.

---

## obstacle-ditch — Primary Prompt

**Frame size:** Approximately 200 × 100 px (@1x) — transparent background PNG

```
A muddy narrow ditch / trench cut into the moorland ground, viewed from the side, for a
2D side-scrolling video game obstacle prop. The ditch is approximately 1.5–2 metres wide
and about a metre deep with steep sides. Dark muddy water or just dark peat mud at the
bottom. The edges of the ditch are irregular earth and rock, with some scraggly grass
on the lips. The hero must jump across it. The asset should show the ditch as a gap in
the ground — the sprite is the visual of the hole rather than something sitting on top
of the ground (the ground layer behind it provides context). Viewed side-on.
Photorealistic digital painting, 2D game environment prop. Transparent background.
Dark peat brown, wet clay, dark murky water, earthy grass edges.
```

**Animation Notes:** Static single frame. Optional: very subtle water ripple at the bottom (2–4 frames loop).

---

## Negative Prompt (all obstacles, Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, sci-fi, fantasy glowing rocks, magical aura,
background environment, characters, animals, oversaturated, neon, perfectly symmetric,
clean manicured appearance, modern materials, text, watermark
```
