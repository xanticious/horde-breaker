# Asset: shieldbearer-bash

**File target:** `assets/sprites/enemies/barbarian-chapter/shieldbearer/shieldbearer-bash.png` + `.json` (+ `@2x` variants)
**Frame size:** 240 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A stocky Scottish Highland
shieldbearer warrior at the peak of a devastating shield bash lunge — using his large targe
shield as the weapon itself, driving it forward with full body weight into the enemy to the
left. At the moment of peak extension: his whole body is lunging forward, shield arm fully
outstretched and driving the iron boss of the shield forward, legs pushing hard behind him,
weight completely committed to the forward thrust. His face: raw aggression, push of maximum
effort. His lower body is trailing behind the lunge like a sprinter in a tackle. The broadsword
is pulled back out of the way or at his side. The iron boss of the shield leads the attack —
this is the strike point. Photorealistic high-definition digital painting, God of War 2022
quality, 2D game sprite, full body, feet extending to right edge, 240×384 px.
Transparent background. Character faces right.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic, sci-fi, facing left, background, text, watermark,
multiple characters, sword swing, idle, retreating, partial body, cropped, two-handed weapon
```

---

## Animation Notes

- **Frame count target:** 10–14 frames
- **Loop:** No — plays once, returns to idle
- **This is a CLEARLY TELEGRAPHED move.** The wind-up is critical for gameplay readability.
- **Animation phases — generate each key pose:**
  1. **Wind-up** (frames 0–4): The shieldbearer leans back, pulls the shield away from guard position, preparing for the lunge. Generate: _body coiling, shield pulled back to load energy, knees bending, intense focused expression._ This is the player's dodge window.
  2. **Lunge** (frames 5–8): Explosive forward drive — PRIMARY PROMPT. Shield fully extended, body airborne or low-lunge.
  3. **Recovery** (frames 9–13): Planting back, returning to guard stance.
- **Gameplay note:** The lunge carries the shieldbearer forward — this is both an attack and a approach. The art should communicate forward momentum and stun potential.

## Additional Prompt — Wind-Up Key Frame

```
Scottish Highland shieldbearer warrior in shield bash wind-up pose, facing right. Body
coiled backward, shield pulled back away from guard position and drawn to the side — loading
for a massive forward lunge. Face shows intense predatory focus. Weight on back foot.
This is the telegraphed preparation frame. Photorealistic digital painting, transparent
background, 240×384 px.
```

## Technical Reminders

- Character **faces RIGHT** — lunge goes toward the LEFT
- The shield boss at full extension will reach the LEFT edge of the 240 px frame
- **Feet at bottom edge** for standing frames; lunge frame may have feet off-ground briefly
- Export: `shieldbearer-bash-00.png` through `shieldbearer-bash-13.png`
