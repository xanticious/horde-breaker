# Asset: barbarian-attack

**File target:** `assets/sprites/heroes/barbarian/barbarian-attack.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large imposing Scottish
Highland barbarian berzerker warrior at the peak moment of a devastating two-handed battle axe
overhead swing, facing right. The axe is caught at the maximum downward strike point — arm
fully extended, axe head at mid-body height having completed its arc, momentum shown in the
lean of the torso. The warrior's entire upper body is rotated into the swing, weight shifted
onto the front foot. His face shows savage battle-fury — teeth possibly bared, eyes burning.
The axe iron head should be in sharp focus — battle-worn, heavy, the edge catching the light.
Motion lines or speed blur on the axe arc is acceptable for impact emphasis. He wears layered
dark leather armor, fur shoulders, iron bracers, muted tartan, leather boots. Long dark auburn
hair wild with the swing momentum. Photorealistic high-definition digital painting, God of War
2018 visual quality, 2D game sprite, full body visible, feet at bottom edge. Transparent
background. Character faces right. Muted palette: iron, leather, dark green, cold steel.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, gun, magic spell, facing left,
background, text, watermark, multiple characters, idle standing, oversaturated, neon,
partial body, cropped head, holding sword, bow
```

---

## Animation Notes

- **Frame count target:** 12–16 frames
- **Loop:** No — plays once then returns to idle
- **Animation phases to generate separately:**
  1. **Wind-up** (frames 0–4): Axe raised high overhead, body weight shifted back, telegraphing the strike. This is the player READ window — must be very distinct from idle. Generate this pose explicitly.
  2. **Strike peak** (frames 5–8): Axe at maximum downward extension (this is the PRIMARY PROMPT above). The "hit" frame.
  3. **Recovery** (frames 9–12): Weight shifting back, axe dragging low after the swing, breathing heavy.
- **Critical:** The wind-up frames are the player's dodge window. The raised-axe silhouette must be unmistakable.

## Additional Prompt — Wind-Up Key Frame

```
Full body character sprite, Scottish Highland barbarian warrior, attack wind-up pose,
facing right. Axe raised high overhead with both hands, body leaning back slightly to load
the swing, weight on back foot, knees bent. Face shows intense fierce focus. This is the
telegraphed preparation moment before the downward strike. Photorealistic digital painting,
transparent background, full body, feet at bottom edge, God of War 2022 quality.
```

## Technical Reminders

- Character **faces RIGHT** — attack arc swings toward the RIGHT side of the frame
- Axe head extends **beyond the right edge** of the 256 px canvas at strike impact — this is correct
- **Feet at bottom edge** throughout all frames
- Export: `barbarian-attack-00.png` through `barbarian-attack-15.png`
