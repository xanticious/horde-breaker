# Asset: pikeman — All Animations

**File targets:**

- `assets/sprites/enemies/barbarian-chapter/pikeman/pikeman-idle.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/pikeman/pikeman-thrust.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/pikeman/pikeman-hit.png` + `.json`
- `assets/sprites/enemies/barbarian-chapter/pikeman/pikeman-death.png` + `.json`

All at @1x and @2x variants.

**Frame size:** 320 × 400 px (@1x) — transparent background PNG — _wider frame than other enemies to accommodate pike reach_
**Anchor:** Bottom-center (0.5, 1.0) — feet at bottom edge

---

## Pikeman Design Reference

The pikeman is Chapter 2's long-range threat. His defining feature is his long pike — a 2.5–3 metre spear with an iron point. He is sturdier than the archer but quicker than the shieldbearer. Mid-weight infantry. Wears a metal skullcap helm, padded gambeson (thick quilted coat) over leather, leather gloves, sturdy boots.

**Frame is wider (320 px)** than standard enemies to accommodate the pike's horizontal reach.

---

## Idle — Primary Prompt

```
Full body character sprite for a 2D side-scrolling action game. A Scottish Highland
pikeman soldier in an alert idle stance, facing right. He carries a long pike — a spear
approximately 2.5 metres long — held diagonally across his body or pointed forward at
an angle. The pike's shaft rests at his hip, point angled upward and forward toward
the target to the right. His stance is mid-weight — not as light as the archer, not as
heavy as the shieldbearer. He wears a simple iron skullcap, padded gambeson (thick quilted
jacket), leather belt, sturdy boots. Build: stocky, reliable, infantry soldier. Expression:
watchful, professional. The pike extends significantly beyond the right edge of the frame —
this is expected, the frame is 320 px wide. Photorealistic high-definition digital painting,
God of War 2022 quality, 2D game sprite, full body, feet at bottom edge, 320×400 px frame.
Transparent background. Character faces right. Muted earthy palette: iron, padded grey,
wood pike shaft, dark leather.
```

**Animation Notes:** 10–14 frames, loop yes, alert with pike at guard

---

## Thrust — Primary Prompt

```
Full body character sprite for a 2D side-scrolling action game. A Scottish Highland pikeman
at the peak moment of a devastating forward pike thrust, facing right. Both hands on the
pike shaft, arms fully extended forward in a powerful lunge-thrust — the pike point driving
directly to the LEFT toward the hero at lethal speed. His body is in a full forward lunge:
front foot planted far forward, rear leg pushing, torso driving the thrust. The pike tip
is at maximum extension — the long reach of the pike means the point reaches far to the
left of the frame, possibly extending beyond. His face: intense combat focus, committed to
the thrust. This is a devastating long-range poke — the hero must step back or be impaled.
Iron skullcap, padded gambeson. Photorealistic digital painting, God of War 2022 quality,
2D game sprite, feet at bottom edge, 320×400 px. Transparent background. Character faces right.
```

**Animation Notes:**

- Frame count: 10–14 frames, loop no
- **Wind-up is critical** — generate: _pikeman pulling pike back into a coiled position before the thrust, pike point drawn back past his hip, weight loaded on rear foot._ This is the player's dodge window.
- The thrust reach advantage is the core gameplay threat — the pike tip extends further left than any other enemy attack.

---

## Additional Wind-Up Prompt (Pikeman Thrust)

```
Scottish Highland pikeman in pike thrust wind-up pose, facing right. He has pulled the
long pike shaft back — the butt end forward, point drawn back to his right side, weight
coiled on rear foot, preparing for the explosive forward thrust. Body twisted back, loading
the lunge. Iron skullcap, gambeson. Photorealistic digital painting, transparent background,
320×400 px.
```

---

## Hit Reaction — Primary Prompt

```
Full body character sprite, Scottish Highland pikeman staggered by a melee hit, facing right.
Body rocked backward, pike shaft swinging off-line, expression of pain and surprise.
The long pike makes him awkward up close — hit him there and his weapon becomes unwieldy.
Photorealistic digital painting, God of War quality, transparent background, 320×400 px,
4–6 frames, no loop.
```

---

## Death — Primary Prompt

```
Full body character sprite, Scottish Highland pikeman in final collapse, fallen at rest,
facing right. His long pike lies on the ground beside him, extending beyond the frame.
Heavy fall. Padded gambeson and iron helm resting. Horizontal body in lower portion of
frame. Final frame held. Photorealistic digital painting, transparent background, 320×400 px,
12–16 frames, no loop, hold on last.
```

---

## Negative Prompt (all pikeman assets, Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, magic, glowing, sci-fi, no weapon, holding sword,
holding bow, facing left, background, text, watermark, multiple characters, heavy plate
full armor, partial body, cropped, oversaturated
```
