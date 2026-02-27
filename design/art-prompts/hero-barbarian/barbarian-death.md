# Asset: barbarian-death

**File target:** `assets/sprites/heroes/barbarian/barbarian-death.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large Scottish Highland
barbarian berzerker warrior in the final frame of a death animation — he has collapsed to the
ground, lying on his side or partially on his back, facing right. His body is at rest on the
ground, axe beside him or beneath his hand. His legs are folded as he has fallen. The posture
is one of final exhaustion and defeat — weight and gravity fully settled. His face, if visible,
shows closed or barely-open eyes, the fierce expression extinguished. The image should feel
weighty and final, not grotesque. No excessive blood — a warrior's dignified, heavy fall.
He wears layered dark leather armor, fur shoulders, iron bracers, muted tartan, leather boots.
Dark auburn hair splayed out. Photorealistic high-definition digital painting, God of War 2022
visual quality, 2D game sprite, full body visible in the frame, the fallen body fits within
the 256×384 frame — figure is now horizontal so will occupy the lower portion of the frame.
Transparent background. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, magic, background, text, watermark,
multiple characters, standing, blocking, attacking, oversaturated, neon, excessive gore,
blood pool, skeleton, zombie, partial body
```

---

## Animation Notes

- **Frame count target:** 16–20 frames
- **Loop:** No — plays once and **freezes on the last frame permanently**
- **Key pose to generate:**
  1. **Standing hit** (frames 0–4): Receives the killing blow — similar to the `hit` animation but more severe, losing grip on the axe. Generate the "receiving fatal blow" pose.
  2. **Going down** (frames 5–10): The fall itself — knees buckling, body losing its fight against gravity. Generate the "mid-fall" pose.
  3. **Final rest** (frames 11–20): Settling on the ground — the PRIMARY PROMPT above. **This frame is held permanently.** Generate this carefully.
- **Last frame:** Must be compositionally clean as a still — it will be on screen indefinitely during death/results transitions.

## Additional Prompt — Mid-Fall Key Frame

```
Full body character sprite, Scottish Highland barbarian warrior mid-fall death sequence,
facing right. He is in the process of collapsing — knees have buckled, upper body tilting
sideways, axe slipping from weakening grip. One knee on the ground, one arm reaching out
instinctively, head drooping. Heavy and inevitable gravity. Photorealistic digital painting,
transparent background, God of War 2022 quality.
```

## Technical Reminders

- Character **faces RIGHT**
- The fallen body is **horizontal** — position it in the **lower half** of the 256 × 384 frame
- Leave the upper half of the frame empty (transparent) for the fallen pose frames
- Export: `barbarian-death-00.png` through `barbarian-death-19.png`
