# Asset: barbarian-victory

**File target:** `assets/sprites/heroes/barbarian/barbarian-victory.png` + `.json` (+ `@2x` variants)
**Frame size:** 256 × 384 px (@1x) — transparent background PNG
**Anchor:** Bottom-center (0.5, 1.0) — character feet at bottom edge of frame

---

## Primary Prompt (DALL-E 3 / Stable Diffusion 3)

```
Full body character sprite for a 2D side-scrolling action game. A large Scottish Highland
barbarian berzerker warrior in a triumphant victory celebration pose, facing right. He has
just won a brutal fight and is reveling in it — one arm thrust skyward holding his battle axe
aloft, chest out, head thrown back in a roaring battle cry of triumph. His expression is one
of savage exultation — mouth open in a roar, eyes burning with fierce joy. His posture is
expansive and dominant — the opposite of his compact combat stances. Battle-weary but
victorious: his armor may show fresh scuff marks, his hair is utterly wild. The raised axe
glints triumphantly. He wears layered dark leather armor, fur at shoulders, iron bracers,
muted tartan plaid. Photorealistic high-definition digital painting, God of War 2022 visual
quality, 2D game sprite, full body visible from head to toe, feet at very bottom edge of frame.
Transparent background. Character faces right. Muted earthy palette.
```

---

## Negative Prompt (Stable Diffusion 3 only)

```
cartoon, anime, pixel art, vector, flat design, sci-fi, kneeling, sad, defeated, dying,
background, text, watermark, multiple characters, facing left, oversaturated, neon,
partial body, cropped head, magic, modern clothing
```

---

## Animation Notes

- **Frame count target:** 12–16 frames
- **Loop:** Yes — this loops on the chapter-clear/victory screen
- **Key pose to generate:** The peak victory roar — axe raised, head back, full exultation (PRIMARY PROMPT). This is the held/center frame of the loop.
- **Animation cycle suggestion:**
  1. **Transition-in** (frames 0–3): Comes from a rest/exhaustion pose (slightly hunched, catching breath post-battle).
  2. **Rise to triumph** (frames 4–7): Straightening up, raising the axe.
  3. **Roar** (frames 8–11): PRIMARY PROMPT — full victory pose, axe high.
  4. **Settle** (frames 12–15): Lowering slightly from the peak, breathing heavy, a grim satisfied smile. Loops back to frame 4.
- **Tone:** Not light-hearted. This is a warrior's victory — earned through blood and pain. The celebration should feel earned and slightly terrifying.

## Technical Reminders

- Character **faces RIGHT**
- Raised axe will likely extend above the top of the 384 px frame — that is acceptable and correct
- **Feet at bottom edge** throughout all frames
- Export: `barbarian-victory-00.png` through `barbarian-victory-15.png`
