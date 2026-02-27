# Asset: barbarian-block

**File target:** `assets/sprites/heroes/barbarian/barbarian-block.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large imposing Scottish
Highland barbarian berzerker warrior in a defensive blocking guard stance, facing right.
He holds his massive two-handed battle axe horizontally in front of him at chest height,
both arms raised and braced, using the axe shaft as a block. His knees are deeply bent,
stance wide and planted, weight low and stable. Shoulders hunched forward, chin tucked,
torso compact — a warrior who knows how to absorb a blow. His eyes are alert and watching
over the top of the axe shaft. The posture communicates immovable defense. He wears layered
dark leather armor with fur at shoulders, iron bracers, muted tartan plaid, rough-spun
trousers, leather boots. Wild dark auburn hair. Photorealistic high-definition digital
painting, God of War 2022 visual quality, 2D game sprite, full body visible from head to toe,
feet at very bottom edge of frame. Pure transparent background. Character faces right.
Muted earthy palette — iron, leather brown, dark green, cold steel grey.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, shield, magic bubble, facing left,
background, text, watermark, multiple characters, attacking, running, oversaturated, neon,
partial body, cropped
```

---

## Animation Notes

- **Frame count target:** 6–8 frames
- **Loop:** No — snaps to guard position and holds the last frame
- **Key pose to generate:** The held guard position (PRIMARY PROMPT above) — this is the held/last frame the code freezes on while blocking.
- **Animation phases:**
  1. **Snap to guard** (frames 0–4): Quick motion from idle stance to the blocking position — a fast raise of the axe. Generate the intermediate "raising" pose.
  2. **Guard hold** (frames 5–7): The final settled guard position. **This frame is held until block ends.**
- **Last frame hold:** The code never loops this animation — it plays to the final frame and freezes. The held guard pose must look intentional as a still.

## Technical Reminders

- Character **faces RIGHT** — the axe shaft acts as a horizontal barrier facing rightward
- **Feet at bottom edge**
- Wide low stance means the character silhouette is shorter and wider than idle
- Export: `barbarian-block-00.png` through `barbarian-block-07.png`
