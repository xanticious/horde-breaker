# Asset: archer-shoot

**File target:** `assets/sprites/enemies/barbarian-chapter/archer/archer-shoot.png` + `.json` (+ `@2x` variants)
**Frame size:** 220 × 360 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A lightly built Scottish
Highland archer at the exact moment of arrow release — the bowstring has just snapped forward,
the arrow has launched, facing right. His draw arm is snapping back from the release —
the sudden release of the bowstring's tension causes the draw arm/hand to spring back past
his face or shoulder. The bow arm is still extended forward. His eyes track the arrow's
flight to the left. His body is in the follow-through: bow arm still raised but starting
to lower, draw arm recoiled, shoulders slightly rolling from the release motion. Expression:
intense focus on where the arrow is going. The arrow itself is no longer in frame — it has
launched. Rough wool and leather, quiver now one arrow lighter. Photorealistic high-definition
digital painting, God of War 2022 quality, 2D game sprite, full body, feet at bottom edge,
220×360 px. Transparent background. Character faces right. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic, glowing, sci-fi, facing left, background,
text, watermark, multiple characters, arrow still in frame, full draw, idle, heavy armor,
partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 6–8 frames
- **Loop:** No — short snap, then transitions to draw (for multishot) or idle
- **Animation phases:**
  1. **Release snap** (frames 0–2): The instant of release — draw arm snapping back. This is the PRIMARY PROMPT.
  2. **Follow-through** (frames 3–5): Bow arm lowering, body settling.
  3. **Recovery** (frames 6–7): Returning to idle or back to draw if more arrows are queued.
- **Arrow sprite:** The arrow projectile is a SEPARATE asset (`arrow.png`) — it is spawned by code at the moment of release and moves independently. Do not bake the arrow into this animation.

## Technical Reminders

- Character **faces RIGHT**
- **Feet at bottom edge**
- Export: `archer-shoot-00.png` through `archer-shoot-07.png`
