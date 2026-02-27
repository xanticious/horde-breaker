# Asset: barbarian-block-hit

**File target:** `assets/sprites/heroes/barbarian/barbarian-block-hit.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large Scottish Highland
barbarian berzerker warrior in a block-hit flinch reaction — he is mid-block with his axe
raised as a barrier but has just absorbed a heavy blow to his guard and is staggering slightly
backward. His body is rocking back from the impact — weight shifted to the rear foot, upper
body pushed back, axe guard still raised but arms jolted by the force. His face shows a
grimace of pain and effort, teeth clenched. The axe shaft might show the vibration/flex of
impact. His stance is still defensive but visibly stressed by the hit. Photorealistic
high-definition digital painting, God of War 2022 visual quality, 2D game sprite, full body
visible from head to toe, feet at bottom edge. Pure transparent background. Character faces
right. Muted earthy palette — iron, leather, dark green, cold steel. He wears layered dark
leather armor, fur shoulders, iron bracers, muted tartan plaid.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, magic, facing left, background,
text, watermark, multiple characters, attacking, running, flying, oversaturated, neon,
partial body, cropped, dead, falling
```

---

## Animation Notes

- **Frame count target:** 4–6 frames
- **Loop:** No — plays once then returns to block/guard hold
- **Key pose to generate:** The peak moment of impact recoil — maximum backward rock, arms absorbed the blow (PRIMARY PROMPT above).
- **Animation phases:**
  1. **Impact frame** (frame 0): Immediate hit reaction — the sudden backward jolt. High on contrast with the held guard pose.
  2. **Recovery** (frames 1–4): Recovering balance back to the guard stance.
- **Readability:** This animation must visually distinguish a BLOCKED hit from a regular hit — the guard stays up, but the warrior clearly absorbed something painful.

## Technical Reminders

- Character **faces RIGHT**
- **Feet at bottom edge** — the backward rock may cause feet to slide slightly but should not lift
- Export: `barbarian-block-hit-00.png` through `barbarian-block-hit-05.png`
