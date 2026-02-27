# Asset: swordsman-attack

**File target:** `assets/sprites/enemies/barbarian-chapter/swordsman/swordsman-attack.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A lightly armored Scottish
Highland raider swordsman at the peak moment of a powerful two-handed claymore horizontal
swing, facing right. The sword is at the forward sweep position — both arms extended,
claymore sweeping from right to left across the front of the body in a wide powerful arc.
Torso rotated into the swing, weight shifted onto front foot, knees bent for stability.
The sword blade is at chest height, parallel to the ground or slightly angled — a horizontal
slashing strike. His face: savage and committed to the blow. Worn wool and leather, iron
skullcap or bare-headed. Photorealistic high-definition digital painting, God of War 2022
quality, 2D game sprite, full body, feet at bottom edge, 256×384 px. Transparent background.
Character faces right. The sword extends toward the LEFT of the frame (toward the hero).
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, plate armor, magic, sci-fi, facing left, background,
text, watermark, multiple characters, idle, blocking, partial body, cropped head, downward stab
```

---

## Animation Notes

- **Frame count target:** 8–10 frames
- **Loop:** No — plays once, returns to idle
- **Animation phases:**
  1. Follows directly from the `windup` animation's last frame.
  2. **Strike sweep** (frames 0–4): The swing itself — the PRIMARY PROMPT captures the midpoint of the sweep.
  3. **Follow-through** (frames 5–8): The sword continuing past center, body decelerating, weight settling.
  4. **End pose** (frame 9): Brief recovery stance before returning to idle.
- **Hitbox timing note for dev:** The active hitbox frame (when the attack actually damages the player) should be frames where the blade is at mid-swing — closest to the left edge of the frame.

## Technical Reminders

- Character **faces RIGHT** — swing travels from behind his right shoulder toward the LEFT (hero's side)
- The sword tip at full extension may exit the left edge of the 256 px frame — this is correct
- **Feet at bottom edge**
- Export: `swordsman-attack-00.png` through `swordsman-attack-09.png`
