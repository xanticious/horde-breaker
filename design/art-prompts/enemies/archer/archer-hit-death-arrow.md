# Asset: archer-hit + archer-death + arrow

**File targets:**

- `assets/sprites/enemies/barbarian-chapter/archer/archer-hit.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/archer/archer-death.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/archer/arrow.png` (single static frame, no JSON)

All at @1x and @2x variants.

---

## Archer Hit — Primary Prompt

**Frame size:** 220 × 360 px (@1x) — transparent background PNG

```
Full body character sprite for a 2D side-scrolling action game. A lightly built Scottish
Highland archer reacting to taking a melee hit — staggered violently, facing right. His
light armor offers little protection — the blow sends him reeling backward with significant
stagger. Bow arm flung wide, his footing scrambled, head and torso rocking back hard. He
looks much more fragile than the swordsman or shieldbearer when hit — this is a ranged
fighter caught in melee range. Expression: shock and pain, eyes wide. Light wool and leather
clothing. Photorealistic high-definition digital painting, God of War 2022 quality,
2D game sprite, full body, feet at bottom edge, 220×360 px. Transparent background.
Character faces right.
```

**Animation Notes:**

- Frame count: 4–6 frames — short and shaky
- Loop: No
- The archer should stagger more dramatically than melee enemies — he is vulnerable up close

---

## Archer Death — Primary Prompt

**Frame size:** 220 × 360 px (@1x) — transparent background PNG

```
Full body character sprite, Scottish Highland archer in final death collapse, fallen and
at rest on the ground, facing right. His lighter build means he collapses quickly — less
mass than a melee fighter. Bow on the ground beside him, quiver partially emptied, limbs
sprawled loosely. Eyes closed, the archer's alertness and focus extinguished. Body occupies
the lower portion of the frame, now horizontal. Not grotesque — a fallen ranger at rest.
Photorealistic digital painting, God of War 2022 quality, transparent background, 220×360 px.
```

**Animation Notes:**

- Frame count: 12–16 frames — loop: No, hold on last frame
- Lighter/faster fall than melee enemies to reflect his lower mass

---

## Arrow — Static Sprite Prompt

**Frame size:** 64 × 8 px (@1x) — transparent background PNG — **NO JSON needed (single static sprite)**

```
A single realistic hand-crafted medieval arrow for a 2D video game sprite — isolated on
transparent background. The arrow is horizontal, pointing to the LEFT (the direction it
travels in gameplay). Wooden shaft, grey goose-feather fletching at the right end, sharp
iron-tipped broadhead arrowhead on the left end. The shaft shows natural wood grain, slightly
rough. Length to fill the 64×8 px frame horizontally. Photorealistic digital painting detail,
extremely small asset, transparent background. No bow, no hand — just the arrow. Muted
palette: pale wood, grey feather, dark iron tip.
```

**Arrow Technical Notes:**

- Single image, no animation
- Arrow points LEFT (toward the hero — it travels left in game world)
- @1x: 64 × 8 px / @2x: 128 × 16 px
- No JSON needed — just the PNG
- Stored as: `assets/sprites/enemies/barbarian-chapter/archer/arrow.png`

---

## Negative Prompt (all archer assets, Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic, glowing, sci-fi, multiple arrows, quiver included
in arrow sprite, background, text, watermark, bow attached to arrow, feathers in wrong place
```
