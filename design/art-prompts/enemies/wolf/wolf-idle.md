# Asset: wolf-idle

**File target:** `assets/sprites/enemies/barbarian-chapter/wolf/wolf-idle.png` + `.json` (+ `@2x` variants)
**Frame size:** 240 × 180 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — paws at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body animal sprite for a 2D side-scrolling action game. A large mangy, battle-scarred
Scottish Highland wolf in an alert, hostile idle pose, facing right. The wolf is lean and
dangerous-looking — not a pet or friendly animal. Scarred fur, matted gray-brown coat with
darker patches and old wound marks. Standing four-legged, weight slightly forward, head low
and level with the shoulders in a predatory posture. Ears forward and sharp-alert, eyes yellow
and fixated on prey ahead (to the right). Lips slightly curled, showing a hint of teeth.
Tail low or tucked. This is a real predator — not stylized or cute. Frame is wider than tall
(landscape orientation) — wolf occupies the full width. All four paws visible, touching the
bottom edge of the frame. Photorealistic high-definition digital painting, God of War 2022
environmental creature quality, 2D game sprite, 240×180 px landscape frame, transparent
background. Muted palette: grey-brown fur, dirty ochre, black nose, yellow-amber eyes,
cold Scottish moorland creature.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, cute, pet dog, husky, wolf standing upright, sci-fi,
magic, facing left, glowing, background, text, watermark, multiple wolves, partial body,
overly friendly, bright colors, neon, fantasy armor on wolf
```

---

## Animation Notes

- **Frame count target:** 8–12 frames
- **Loop:** Yes — snarling, weight-shifting idle cycle
- **Key pose to generate:** Alert, low-head predatory standing pose (PRIMARY PROMPT) — weight forward, eyes locked on target to the right.
- **Idle variation hints:** Slight head turn, ears flicking, weight shift between left and right paws, brief lip curl. Keep movement subtle — this wolf is conserving energy before the pounce.
- **Frame is landscape (wider than tall):** 240 px wide, 180 px tall. The wolf's body should fill the horizontal space.

## Technical Reminders

- Wolf **faces RIGHT**
- **All four paws at the bottom pixel row** of the 240 × 180 canvas
- The wolf's back should not exceed the top of the frame
- Export: `wolf-idle-00.png` through `wolf-idle-11.png`
