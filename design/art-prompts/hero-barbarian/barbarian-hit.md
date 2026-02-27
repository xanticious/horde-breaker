# Asset: barbarian-hit

**File target:** `assets/sprites/heroes/barbarian/barbarian-hit.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large Scottish Highland
barbarian berzerker warrior reacting to taking a direct hit and being knocked back or staggered
— an unblocked damage impact. His body is rocking violently backward from the blow, weight
thrown rearward, one arm flung back, face twisted in pain and shock. He is NOT blocking —
guard is down. His chest or side has received the strike. He is staggered but not falling —
this is a momentary knockback/stagger, not a death. The warrior's expression: pain, fury,
shock. He may have a fresh wound visible. His grip on the axe is loose or the axe is swung
back by the impact. He wears layered dark leather armor, fur shoulders, iron bracers, muted
tartan, leather boots. Wild dark auburn hair. Photorealistic high-definition digital painting,
God of War 2022 visual quality, 2D game sprite, full body visible, feet at bottom edge.
Transparent background. Character faces right. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, magic, facing left, background,
text, watermark, multiple characters, blocking, attacking, running, oversaturated, neon,
dead body, lying down, partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 4–6 frames
- **Loop:** No — plays once, returns to idle
- **Key pose to generate:** Peak knockback moment — maximum backward stagger from unblocked hit (PRIMARY PROMPT). This is the most expressive frame.
- **Animation phases:**
  1. **Flash impact** (frame 0): Snap recoil — the instant the blow lands. Body compressed by force.
  2. **Knockback peak** (frames 1–2): Maximum rearward lean, arms flung back.
  3. **Recovery** (frames 3–5): Regaining footing, returning to idle stance.
- **Contrast with block-hit:** This animation must look more severe than the blocked hit — no guard, full force impact, more pain visible.

## Technical Reminders

- Character **faces RIGHT** — the hit knocks him toward the LEFT (backward)
- **Feet at bottom edge** — character should not leave the ground
- Export: `barbarian-hit-00.png` through `barbarian-hit-05.png`
