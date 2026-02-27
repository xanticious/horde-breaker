# Asset: handler (War Hound Handler) — All Animations

**File targets:**

- `assets/sprites/enemies/barbarian-chapter/handler/handler-idle.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/handler/handler-attack.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/handler/handler-hit.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/handler/handler-death.png` + `.json`

All at @1x and @2x variants.

**Note:** The handler fights alongside a war hound (wolf). The hound itself reuses the Wolf sprite set (`wolf-*.png`). Only the handler character needs new sprites.

**Frame size:** 256 × 384 px (@1x) — transparent background PNG (same as swordsman footprint)
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge

---

## Handler Design Reference

The War Hound Handler is a Chapter 3 enemy. He is a rough Highland warrior who fights with a combination of close-range weapons (short sword, hand axe, or whip) while commanding a war hound (wolf) as his primary threat. His gameplay role: the hound is the main threat, the handler follows up and punishes players focused on the hound. He should look different from the swordsman — more wild, rougher, wolf-handler attire. Wears rough furs and leather, carries tools of his trade (a leash or chain visible, short weapon). May have wolf scratches/bite scars on his arms from handling the animals.

---

## Idle — Primary Prompt

```
Full body character sprite for a 2D side-scrolling action game. A rough Scottish Highland
war hound handler in an alert idle stance, facing right. He is a warrior but his role is
handler-fighter hybrid — rough furs and heavy leather clothing suited for someone who works
with war animals. He carries a short one-handed sword or hand axe in one hand. A heavy
leather leash, chain, or rope dangles from his other hand or belt — the tool of his trade.
His arms show bite scars and scratch marks from handling wolves. Build: lean and tough,
weathered. Expression: watchful and cruel. He looks like someone who genuinely enjoys
letting the wolf go. He wears thick fur trim on his shoulders, rough leather vest, heavy
leather gauntlet on his handling hand. Dark wild hair. Photorealistic high-definition
digital painting, God of War 2022 quality, 2D game sprite, full body, feet at bottom
edge, 256×384 px. Transparent background. Character faces right. Dark earthy palette:
wolf-grey fur trim, dark leather, iron weapon.
```

**Animation Notes:** 10–14 frames, loop yes

---

## Attack — Primary Prompt

```
Full body character sprite for a 2D side-scrolling action game. A rough Scottish Highland
war hound handler at the peak of a close-quarters assault, facing right. His war hound is
not present in this animation — this captures HIS personal attack. He lunges forward with
his short sword or hand axe in a fast brutal slash — quick and dirty, not elegant.
Alternatively he swings his heavy chain/leash as a weapon in a whipping arc. The attack
feels opportunistic — he is not a pure fighter, he's taking advantage while the player
is distracted by the hound. Weapon extended or at peak of swing toward the left.
Rough furs, leather, leash dangling from belt. Photorealistic digital painting,
God of War quality, transparent background, 256×384 px. Character faces right.
```

**Animation Notes:**

- Frame count: 8–12 frames, loop no
- Wind-up needed — generate: _handler in coiled prep before the opportunistic lunge/slash, drawing back the weapon._
- His attack should look less polished than the swordsman — faster and rougher.

---

## Hit Reaction — Primary Prompt

```
Full body character sprite, Scottish Highland war hound handler staggered by a hit,
facing right. More reactive than a pure-melee fighter — his handler role means he is
not as combat-hardened in straight melee. He staggers backward with visible pain and
surprise, grip loosened on his weapon and leash. Rough furs and leather.
Photorealistic digital painting, God of War quality, transparent background, 256×384 px.
4–6 frames, no loop.
```

---

## Death — Primary Prompt

```
Full body character sprite, Scottish Highland war hound handler in final death collapse,
fallen and at rest on the ground, facing right. His weapon and chain/leash lie beside him.
Without their handler, the hounds are freed — his death has a story quality to it.
Fallen body in lower portion of frame, horizontal. Rough furs, leather. Photorealistic
digital painting, God of War quality, transparent background, 256×384 px.
12–16 frames, no loop, hold on last frame.
```

---

## Negative Prompt (all handler assets, Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic, glowing, sci-fi, wolf in the sprite,
pet collar, modern dog leash, fantasy elf, full plate armor, facing left, background,
text, watermark, multiple characters, oversaturated, neon, holding bow, no weapon
```
