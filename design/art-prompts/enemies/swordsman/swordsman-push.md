# Asset: swordsman-push

**File target:** `assets/sprites/enemies/barbarian-chapter/swordsman/swordsman-push.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A lightly armored Scottish
Highland raider swordsman performing a powerful forward shield-shove or front kick push to
reset spacing — facing right. He has his sword in one hand raised high or back out of the
way, and uses his free hand or a forward body push/kick to shove the hero back. The key
pose: one leg raised in a front stomp/kick, or both arms thrusting forward in a shove,
weight driving aggressively forward toward the LEFT (where the hero stands). His expression:
forceful, tactical, pushing back against close-quarters pressure. He leans into it with his
whole body weight. Worn wool and leather, iron skullcap or bare-headed. Photorealistic
high-definition digital painting, God of War 2022 quality, 2D game sprite, full body,
feet at bottom edge (stance foot), 256×384 px. Transparent background. Character faces right.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, plate armor, magic, sci-fi, facing left, background,
text, watermark, multiple characters, sword swing, retreating, partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 6–8 frames
- **Loop:** No — plays once, returns to idle
- **Purpose:** This attack resets the spacing — it pushes the hero back to create distance for normal attacks. It's a gameplay mechanic "spacing reset."
- **Key pose:** The forward push at maximum extension — foot planted or front kick at peak reach (PRIMARY PROMPT).
- **Animation phases:**
  1. **Setup** (frames 0–2): Drawing arm/leg back.
  2. **Push peak** (frames 3–5): Maximum forward thrust — PRIMARY PROMPT.
  3. **Recovery** (frames 6–8): Planting back down, returning to guard.

## Technical Reminders

- Character **faces RIGHT** — the push goes toward the LEFT (toward the hero)
- **Stance foot at bottom edge** — the raised kick foot will be off the ground
- Export: `swordsman-push-00.png` through `swordsman-push-07.png`
