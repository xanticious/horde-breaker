# Asset: shieldbearer-attack

**File target:** `assets/sprites/enemies/barbarian-chapter/shieldbearer/shieldbearer-attack.png` + `.json` (+ `@2x` variants)
**Frame size:** 240 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A stocky Scottish Highland
shieldbearer warrior at the peak of a one-handed broadsword swing, facing right. He keeps
his targe shield in his left arm raised defensively while simultaneously swinging his
broadsword in his right arm — a slash that sweeps from right to left across the target.
At the moment of peak swing: right arm fully extended with the broadsword at mid-arc,
shield still up on the left arm as the other half of his combat stance. Weight on front
foot, torso rotating into the swing but limited by the shield arm. The combined visual of
shield-and-sword making a simultaneous offensive-defensive pose. Face: controlled aggression.
Chainmail/scale armor, iron helm or bare-headed, broadsword, targe. Photorealistic
high-definition digital painting, God of War 2022 quality, 2D game sprite, full body,
feet at bottom edge, 240×384 px. Transparent background. Character faces right.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic, sci-fi, facing left, background, text, watermark,
multiple characters, shield bash, two-handed weapon, no shield, partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 10–14 frames
- **Loop:** No — plays once, returns to idle
- **Animation phases:**
  1. **Wind-up** (frames 0–4): Sword arm pulled back while shield stays forward — a tight compact windup.
  2. **Strike swing** (frames 5–9): PRIMARY PROMPT — sword at mid-arc, shield still raised.
  3. **Follow-through/recovery** (frames 10–13): Sword arm retracting, returning to guard.
- **Key visual:** The shield never drops during this attack — the shieldbearer is offensive AND defensive simultaneously. This is his defining characteristic.

## Technical Reminders

- Character **faces RIGHT** — sword swings toward the LEFT (hero's direction)
- Shield remains in the left arm, facing LEFT throughout
- **Feet at bottom edge**
- Export: `shieldbearer-attack-00.png` through `shieldbearer-attack-13.png`
