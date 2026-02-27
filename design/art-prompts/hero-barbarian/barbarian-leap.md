# Asset: barbarian-leap

**File target:** `assets/sprites/heroes/barbarian/barbarian-leap.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame (when landed)

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large Scottish Highland
barbarian berzerker warrior at the peak of a devastating leaping axe-strike special attack
— he is airborne, at maximum height, axe raised overhead with both hands ready to come
crashing down. His body is fully extended in the leap — legs tucked or trailing behind,
torso arched, face turned downward with predatory intensity toward the target below him.
The massive battle axe is raised above his head, glinting in the light, momentum and mass
about to be unleashed. This is a heroic, violent, focused moment. Hair and fur shoulder
trim stream upward/backward with the upward momentum. He wears layered dark leather armor,
iron bracers, muted tartan, leather boots. Photorealistic high-definition digital painting,
God of War 2022 visual quality, 2D game sprite, full body visible within frame, feet NOT
at bottom edge in this pose (airborne). Transparent background. Character faces right.
Dynamic composition — use the full 256×384 frame height for the vertical leap arc.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, magic wings, flight, background,
text, watermark, standing still, crouching, facing left, oversaturated, neon, partial body,
multiple characters, sword, bow
```

---

## Animation Notes

- **Frame count target:** 12–16 frames
- **Loop:** No — plays once, ends with landing impact
- **Animation phases — generate each key pose:**
  1. **Crouch/launch** (frames 0–3): Deep crouch loading the jump, axe pulled back/down. Generate this: _body compressed, knees bent deep, axe low and back, preparing to spring._
  2. **Liftoff** (frames 4–6): Just left the ground — body uncoiling upward, axe starting to rise.
  3. **Peak airborne** (frames 7–10): PRIMARY PROMPT — maximum height, axe overhead, body arched. This is the "charged" moment.
  4. **Descent + strike** (frames 11–14): Axe coming down with full force, body descending. Generate: _axe on the downswing, body plummeting, strike impact pose._
  5. **Landing** (frames 14–16): Heavy landing impact — knees absorb the crash, a shockwave dust kick.
- **Scale:** This is the hero's biggest, most cinematic move. Give it full drama.

## Technical Reminders

- Character **faces RIGHT** throughout
- For airborne frames, the character floats within the frame — bottom of feet will not be at the canvas bottom
- The **landing frame** should have feet back at the bottom edge
- Export: `barbarian-leap-00.png` through `barbarian-leap-15.png`
