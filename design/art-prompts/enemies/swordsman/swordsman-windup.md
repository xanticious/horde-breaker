# Asset: swordsman-windup

**File target:** `assets/sprites/enemies/barbarian-chapter/swordsman/swordsman-windup.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A lightly armored Scottish
Highland raider swordsman in an exaggerated attack wind-up pose — telegraphing an incoming
sword strike, facing right. He has drawn his claymore back to maximum wind-up position:
sword pulled behind his right shoulder, both hands on the grip, body rotated back and away
from the target, weight on his rear foot. His face shows focused aggression, the preparation
for a devastating swing. This pose is the player's WARNING that an attack is incoming — it
must be visually unmistakable and distinct from idle. The exaggerated pulled-back sword
position is the key visual signal. Worn wool and leather clothing, simple iron skullcap or
bare-headed. Photorealistic high-definition digital painting, God of War 2022 quality,
2D game sprite, full body, feet at bottom edge, 256×384 px. Transparent background.
Character faces right.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, plate armor, magic, sci-fi, facing left, background,
text, watermark, multiple characters, idle standing, defending, partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 8–10 frames
- **Loop:** No — transitions immediately to the `attack` animation
- **This animation IS the telegraph:** The entire purpose is to give the player time to dodge or block. The frames should hold on the maximum pull-back pose for 3–4 frames.
- **Key pose to generate:** PRIMARY PROMPT — sword at maximum pull-back, body twisted away, loading the swing.
- **Another pose needed:** The initial "coiling" transition from idle to the full wind-up — the first 2–3 frames of the coil before reaching peak wind-up.

## Technical Reminders

- Character **faces RIGHT** — sword is pulled back to the LEFT side of the frame
- The pulled-back sword may extend beyond the left edge of the frame — acceptable
- **Feet at bottom edge**
- Export: `swordsman-windup-00.png` through `swordsman-windup-09.png`
