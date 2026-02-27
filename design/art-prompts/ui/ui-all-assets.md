# Assets: UI Art

**File targets:**

- `public/favicon.svg` — Axe/crest icon
- `assets/sprites/ui/portrait-barbarian.png` (+ `@2x`) — Hero select portrait
- `assets/sprites/ui/icon-health.svg` — Upgrade icon
- `assets/sprites/ui/icon-armor.svg` — Upgrade icon
- `assets/sprites/ui/icon-damage.svg` — Upgrade icon
- `assets/sprites/ui/icon-attack-speed.svg` — Upgrade icon
- `assets/sprites/ui/icon-move-speed.svg` — Upgrade icon
- `assets/sprites/ui/icon-special.svg` — Upgrade icon
- `assets/sprites/ui/icon-currency-barbarian.png` (+ `@2x`) — Clan gold coin

---

## Favicon — Prompt

**Format:** SVG, 32 × 32 px (or generate as PNG at 256×256 and convert/trace to SVG)

```
A bold, simple icon of a Viking/Celtic battle axe for a website favicon — 32×32 pixel
icon resolution. The axe is top-down or slightly angled side view, centered in the frame.
Style: strong silhouette-readable at tiny sizes, flat or minimal shading. The axe head
faces right or upward — a two-headed battle axe or a single broad-bladed war axe.
Clean sharp icon design, flat graphic style, dark iron-grey axe on transparent or
dark background. Bold enough to read as a 16×16 favicon. No text, no decorative borders.
Celtic knot work detail on the axe head optional but must not obscure the silhouette.
Color palette: dark iron/charcoal, slight metallic highlight. Scalable vector art style.
```

**Note for SVG:** Generate as a high-res PNG first, then auto-trace using Inkscape (Path → Trace Bitmap) or Adobe Illustrator Live Trace to convert to clean SVG paths.

---

## Barbarian Portrait — Prompt

**Format:** PNG, 256 × 256 px (@1x) — shown on the Hero Select screen
**Texture:** Richly detailed — this is a CHARACTER CARD, not a sprite. More detail than the game sprites.

```
A dramatic close-up portrait of a Scottish Highland barbarian berzerker warrior hero for
a video game hero selection screen. Bust portrait from chest upward, facing slightly
right and looking toward the viewer with fierce, unflinching intensity. Filling the entire
256×256 px square frame. His face: battle-worn, strong jaw, dark auburn hair wild and
windswept, possible stubble or short beard, a fresh scar on his cheek. His eyes: dark,
burning, alive with violence and intelligence — a warrior, not a brute. He wears fur at
his shoulders and layered dark leather. The two-handed battle axe is visible over his
shoulder or partially in frame. Dramatic rim lighting — overcast Scottish sky light from
behind, warm foreground lighting on his face. The portrait should feel HEROIC and DANGEROUS —
a player character someone wants to play as. Photorealistic high-definition digital painting,
God of War 2022 character portrait quality, square frame composition, transparent or very
dark background that blurs into the HeroSelect screen UI.
```

**Composition note:** Center the face/eyes in the upper-center of the 256×256 square. The axe and fur armor frame the edges.

---

## Upgrade Icons — Universal Style

All 6 upgrade icons share the same style:

- **Format:** SVG (preferred) or PNG at 64 × 64 px @1x
- **Style:** Bold, readable icon — flat or semi-flat with subtle metallic depth. Inspired by dark fantasy RPG UI icons. Dark backgrounds with lighter icon on top.
- **Readability:** Must be **immediately readable at 32×32 px** (may be displayed small in the upgrade grid)
- **Color coding suggested:** Use subtle hue differences to differentiate categories while keeping the overall palette dark

---

## icon-health — Prompt

```
A UI icon for a dark fantasy action game upgrade screen — "Health / Vitality" upgrade
category icon. 64×64 px square. A bold stylized heart or shield with a heart motif,
rendered in a dark medieval RPG icon style. Deep crimson red heart or heartbeat symbol,
on a dark iron-grey or near-black background. Simple, bold, immediately readable at small
sizes. Celtic knotwork border optional. No text. Flat/semi-flat icon style with subtle
metallic rim. SVG-quality clean vector shapes.
```

## icon-armor — Prompt

```
A UI icon for a dark fantasy action game — "Armor / Defense" upgrade category icon.
64×64 px square. A bold stylized shield or chainmail icon — could be a heraldic shield
outline or chain link pattern. Dark iron-grey tones, silver metallic highlights.
Dark background. Bold and readable at small sizes. Clean vector shapes. No text.
Medieval dark fantasy RPG icon style.
```

## icon-damage — Prompt

```
A UI icon for a dark fantasy action game — "Damage / Attack Power" upgrade category icon.
64×64 px square. A bold battle axe or crossed swords icon — something that immediately reads
as "weapon damage." Dark iron, warm ember-orange or blood-red accent color suggesting power.
Dark background. Bold silhouette readable at tiny sizes. No text. Medieval dark fantasy
RPG icon style, clean vector shapes.
```

## icon-attack-speed — Prompt

```
A UI icon for a dark fantasy action game — "Attack Speed" upgrade category icon.
64×64 px square. A bold icon suggesting speed and rapid strikes — could be a sword with
motion lines, crossed lightning bolts, or a rapid strike symbol. Cool blue or pale
lightning yellow accent suggesting quickness. Dark background. Immediately readable at
small sizes. No text. Medieval dark fantasy RPG icon style, clean vector shapes.
```

## icon-move-speed — Prompt

```
A UI icon for a dark fantasy action game — "Movement Speed" upgrade category icon.
64×64 px square. A bold boot with motion lines, or swift wind/air symbol suggesting
movement. Could be a foot-soldier boot or quick-step symbol. Pale green or teal accent
on dark background. Bold readable silhouette. No text. Medieval dark fantasy RPG
icon style, clean vector shapes.
```

## icon-special — Prompt

```
A UI icon for a dark fantasy action game — "Special Ability" upgrade category icon
for the barbarian's leap attack ability. 64×64 px square. A bold upward leap or
burst of power symbol — could be a jumping figure silhouette, an explosion of force,
or an axe with a power-burst. Gold or warm amber accent color suggesting a special/ultimate
skill. Dark background. Bold readable silhouette at small sizes. No text.
Medieval dark fantasy RPG icon style, clean vector shapes.
```

---

## Currency Icon — Prompt

**Format:** PNG, 48 × 48 px (@1x)

```
A small icon of a clan gold coin for a dark fantasy Scottish Highland video game UI.
48×48 px circular coin icon. The coin face shows a Celtic knotwork border and a simple
clan symbol — crossed axes, a thistle, or a Highland ruin. Worn, aged gold with dark
patina in the recesses of the knotwork. Photorealistic metallic coin appearance at a
small icon size. Slightly dirty and ancient — not a shiny modern coin. Transparent
background. The full coin fills the 48×48 frame. No text, no numeral.
```

---

## Negative Prompt (all UI assets, Stable Diffusion 3 only)

```
cartoon, overly cute, anime, pixel art (except if tiny icon), glowing neon, modern
materials, sci-fi HUD, blue energy, text overlay, watermark, multiple icons in one image,
complex unreadable detail, pastel colors, MOBA style, League of Legends style
```
