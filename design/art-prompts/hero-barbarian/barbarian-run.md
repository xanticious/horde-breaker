# Asset: barbarian-run

**File target:** `assets/sprites/heroes/barbarian/barbarian-run.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large imposing Scottish
Highland barbarian berzerker warrior in a powerful mid-run stride, facing right. Full sprint
pose — one leg forward planted, one leg pushing back, torso leaning aggressively forward,
arms pumping. He carries his massive two-handed battle axe in one hand or across his back
while running. His long dark auburn hair and fur shoulder trim stream back behind him with
the motion. Expression: fierce focus, jaw set, eyes forward. He wears layered dark leather
armor, fur at shoulders, iron bracers, muted tartan plaid, rough-spun trousers, leather boots
with heavy footfall. Photorealistic high-definition digital painting, God of War 2022 visual
quality, 2D game sprite, full body visible from head to toe, feet at very bottom edge of frame.
Pure transparent background. Character faces right. Dynamic motion blur on extremities optional.
Muted earthy palette — iron, leather brown, dark green, cold steel.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, modern clothing, gun, facing left,
background details, text, watermark, multiple characters, static pose, standing still,
oversaturated, neon, floating, partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 10–14 frames
- **Loop:** Yes — seamless running cycle
- **Key pose to generate:** Peak stride moment — one foot planted forward, opposite arm swung forward, maximum extension of the gait cycle. This is the "contact" or "down" pose.
- **Secondary poses needed:**
  - "Passing" pose (both feet near center, body upright)
  - "Float/Airborne" pose (brief moment both feet off ground)
- **Feel:** Heavy, powerful run — not a light jog. Footsteps should have weight. Chain/leather armor elements bounce with each stride.

## Technical Reminders

- Character **faces RIGHT**
- **Feet at the absolute bottom pixel row** throughout all frames — the ground contact foot should touch the bottom edge
- Keep the character's center of mass roughly aligned horizontally across all frames
- Export individual frames as: `barbarian-run-00.png`, `barbarian-run-01.png`, etc.
