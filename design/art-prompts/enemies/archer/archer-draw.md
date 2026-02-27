# Asset: archer-draw

**File target:** `assets/sprites/enemies/barbarian-chapter/archer/archer-draw.png` + `.json` (+ `@2x` variants)
**Frame size:** 220 × 360 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A lightly built Scottish
Highland archer drawing his bow in preparation to shoot, facing right. He has nocked an
arrow and is in a full draw stance — bow raised and angled, bow arm extended to the left
(holding the bow), draw arm pulled back to his cheek or jaw with the bowstring fully tensed.
His body is bladed sideways in the classic archer stance — weight distributed, feet planted
wide, torso turned slightly. His eyes are sighted down the arrow toward the target to his
left. The bow is under full tension — the curve of the limbs shows maximum draw stress.
His draw hand's fingers are at anchor point (cheek/jaw). Expression: focused, controlled,
still — the held breath before the shot. Rough wool and leather, leather bracer on bow arm,
quiver on back. Photorealistic high-definition digital painting, God of War 2022 quality,
2D game sprite, full body, feet at bottom edge, 220×360 px. Transparent background.
Character faces right. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic bow, glowing arrow, sci-fi, elf, facing left,
background, text, watermark, multiple characters, relaxed stance, no arrow nocked,
heavy armor, partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 8–12 frames
- **Loop:** No — transitions to `shoot` animation
- **This is the player's WARNING:** Similar to the swordsman's wind-up, the draw is the signal that a shot is coming. It should be visually unmistakable — the raised bow and draw arm are the key silhouette change from idle.
- **Animation phases:**
  1. **Nock** (frames 0–3): Reaching back to quiver, pulling an arrow, nocking it.
  2. **Raise and draw** (frames 4–7): Bow rising, draw arm pulling back.
  3. **Full draw hold** (frames 8–11): PRIMARY PROMPT — held at full draw for 2–3 frames. **This is the aimed moment.**

## Technical Reminders

- Character **faces RIGHT** — the bow extends to the LEFT (toward the hero)
- The bow in full draw extends well beyond the left edge of the 220 px frame at the bow top
- **Feet at bottom edge**
- Export: `archer-draw-00.png` through `archer-draw-11.png`
