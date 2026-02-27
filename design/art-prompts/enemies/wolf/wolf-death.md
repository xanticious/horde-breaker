# Asset: wolf-death

**File target:** `assets/sprites/enemies/barbarian-chapter/wolf/wolf-death.png` + `.json` (+ `@2x` variants)
**Frame size:** 240 × 180 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — body at bottom of frame when fallen

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body animal sprite for a 2D side-scrolling action game. A large mangy battle-scarred
Scottish Highland wolf in its final death collapse — lying on its side on the ground, facing
right. The wolf has collapsed fully: body sprawled sideways, legs extended or slightly curled,
head down, eyes closed or glazed. The body fills the lower portion of the 240×180 px
landscape frame horizontally. The death should feel natural and weighty — a real predator
fallen. Not grotesque or gory — a dignified creature's end. The distinctive scarred grey-brown
fur and lean dangerous build are still recognizable in death. Photorealistic high-definition
digital painting, God of War 2022 quality, 2D game sprite, 240×180 px landscape frame.
Transparent background. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, cute, sitting, standing, running, background, text,
watermark, multiple wolves, glowing, sci-fi, magic, excessive blood pool, gore, skeleton
```

---

## Animation Notes

- **Frame count target:** 12–16 frames
- **Loop:** No — plays once, **freezes on the final frame**
- **Animation phases:**
  1. **Fatal blow reaction** (frames 0–4): Severe hit reaction — worse than the `hit` animation. Body crumpling.
  2. **Collapse** (frames 5–10): The wolf losing its footing, falling to the side.
  3. **Final rest** (frames 11–15): PRIMARY PROMPT — settled on the ground, still. **This frame is held.**
- **Last frame:** Must look clean as a static image — it remains on screen until the enemy despawns.

## Technical Reminders

- Wolf **faces RIGHT** throughout — even when fallen, the head points to the right
- Fallen body is **horizontal** — occupies the lower portion of the 240 × 180 frame
- Upper portion of the frame is empty/transparent for the fallen frames
- Export: `wolf-death-00.png` through `wolf-death-15.png`
