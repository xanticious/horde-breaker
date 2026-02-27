# Asset: wolf-pounce

**File target:** `assets/sprites/enemies/barbarian-chapter/wolf/wolf-pounce.png` + `.json` (+ `@2x` variants)
**Frame size:** 240 × 180 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — paws at bottom edge (when standing), center-frame when airborne

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body animal sprite for a 2D side-scrolling action game. A large mangy battle-scarred
Scottish Highland wolf at the peak of a ferocious forward pounce and lunge attack, fully
airborne, facing right. The wolf is horizontal in the air — body fully extended in mid-leap,
front paws outstretched forward reaching for prey, hind legs stretched back, body arched
aerodynamically. Mouth wide open showing sharp teeth and fangs, eyes burning with aggression.
This is the kill-strike pose. The body should be parallel to the ground, filling the frame
horizontally. Grey-brown mangy scarred fur, yellow-amber eyes, visible battle scars, lean
dangerous build. Photorealistic high-definition digital painting, God of War 2022 quality,
2D game sprite, 240×180 px landscape frame. Transparent background. Wolf faces right.
Dynamic and terrifying — this is the moment a wolf catches prey.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, cute pet, sitting, idle standing, facing left,
background, text, watermark, glowing, sci-fi, magic, multiple wolves, friendly,
bright colors, wolf on leash
```

---

## Animation Notes

- **Frame count target:** 10–14 frames
- **Loop:** No — plays once then transitions to retreat or idle
- **Animation phases — all gameplay-critical:**
  1. **Wind-up** (frames 0–4): Crouch/coil before the leap — body lowered, haunches bunched, head down then snapping up. **This is the player's read window** — must be clearly telegraphed. Generate: _wolf in deep crouch, haunches raised, front legs low, about to spring._
  2. **Liftoff** (frames 5–6): Leaving the ground, hind legs pushing.
  3. **Peak pounce** (frames 7–10): PRIMARY PROMPT — fully airborne, body horizontal, mouth open, reaching.
  4. **Landing** (frames 11–14): Impact landing back to the ground.
- **Critical:** The crouched wind-up MUST look distinct from idle — it's the player's cue to dodge or block.

## Additional Prompt — Wind-Up Key Frame

```
Full body animal sprite, large Scottish Highland wolf in attack wind-up crouch before a
pounce, facing right. Body low to the ground, haunches raised and muscles bunched, head
tilted up and forward, snarling ferociously — the moment just before the spring. Visible
predatory aggression and coiled power. Photorealistic digital painting, transparent background,
landscape frame 240×180 px.
```

## Technical Reminders

- Wolf **faces RIGHT** — pounce launches toward the RIGHT
- For airborne frames, the wolf body is centered within the 240 × 180 frame
- For grounded frames, paws touch the bottom edge
- Export: `wolf-pounce-00.png` through `wolf-pounce-13.png`
