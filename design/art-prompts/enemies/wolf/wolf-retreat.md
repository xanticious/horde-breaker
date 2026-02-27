# Asset: wolf-retreat

**File target:** `assets/sprites/enemies/barbarian-chapter/wolf/wolf-retreat.png` + `.json` (+ `@2x` variants)
**Frame size:** 240 × 180 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — paws at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body animal sprite for a 2D side-scrolling action game. A large mangy battle-scarred
Scottish Highland wolf backing away cautiously after a failed pounce, still facing right
(toward the enemy) but moving backwards. Its posture shows defensive wariness — not defeated
or cowering completely, but reassessing. Front paws stepping back, body low and wary, head
still up and alert, eyes still fixed on the target to the right, ears pressed slightly back,
tail lower than neutral. The wolf is regrouping, not fleeing. Grey-brown scarred fur,
yellow-amber eyes, lean dangerous build. Photorealistic high-definition digital painting,
God of War 2022 quality, 2D game sprite, 240×180 px landscape frame. Transparent background.
Wolf still faces RIGHT even while retreating. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, cute, completely fleeing, tail between legs, defeated,
facing left, background, text, watermark, multiple wolves, glowing, sci-fi, magic,
lying down, sitting
```

---

## Animation Notes

- **Frame count target:** 8–10 frames
- **Loop:** No — plays to end of the backward movement arc, then transitions to idle
- **Key pose to generate:** Mid-retreat step — one front paw lifted back and planted back, head still facing right, body wary (PRIMARY PROMPT).
- **Motion:** A backward walk cycle — front paws reaching back, rear legs following. The wolf maintains eye contact with the threat the entire time. Not a panicked flight — a tactical withdrawal.
- **Distinction from idle:** The weight is rearward and cautious vs. the forward-leaning aggression of idle.

## Technical Reminders

- Wolf **faces RIGHT** — visual direction does not change during retreat (it backpedals, doesn't turn around)
- **All four paws near the bottom edge**
- Export: `wolf-retreat-00.png` through `wolf-retreat-09.png`
