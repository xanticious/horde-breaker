# Asset: barbarian-idle

**File target:** `assets/sprites/heroes/barbarian/barbarian-idle.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large, imposing Scottish
Highland barbarian berzerker warrior standing in an alert idle pose, facing right. He is
tall and broad-shouldered, heavily muscular but lean and fast-looking, not cartoonishly huge.
He wears layered dark leather armor with fur at the shoulders, iron bracers on his forearms,
a muted tartan-patterned plaid draped across one shoulder, rough-spun trousers tucked into
leather boots. His long dark auburn hair is wild and windswept. He holds a massive two-handed
battle axe loosely at his side or across his back, iron head heavy and battle-worn. His
expression is one of fierce, exhausted readiness — weight and weariness in his stance,
knees slightly bent, breathing subtly. Photorealistic high-definition digital painting,
God of War 2022 visual quality, 2D game sprite, full body visible from head to toe,
feet touching the very bottom edge of the frame. Pure transparent background.
Character faces right. Muted earthy palette — iron, leather brown, dark green, heather purple
in tartan, cold steel.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, fantasy elf, sci-fi, modern clothing,
gun, oversaturated colors, neon, bright red, facing left, side view only, background details,
text, watermark, floating objects, multiple characters, partial body, cropped head
```

---

## Animation Notes

- **Frame count target:** 12–16 frames
- **Loop:** Yes — seamless breathing/weight-shifting cycle
- **Key pose to generate:** Neutral standing pose, weight balanced, slight forward lean, axe lowered — this is the BASE frame all other idle frames oscillate around.
- **In-between guidance:** Slight chest rise/fall for breathing, very subtle left-right weight shift. Hair and fur trim have small secondary motion.
- **Hold character:** The idle should feel like a coiled spring — tired but dangerous.

## Technical Reminders

- Character **faces RIGHT** — his right shoulder is closest to the left edge of the frame
- **Feet at the absolute bottom pixel row** of the 256 × 384 canvas
- Top of head should leave ~10–20 px of breathing room from the top edge
- Axe tip / weapon extensions may reach frame edges — that is intentional
- Export individual frames as: `barbarian-idle-00.png`, `barbarian-idle-01.png`, etc.
