# Horde Breaker: Failure Makes You Stronger

## Game Design Document

---

## 1. Overview

**Title:** Horde Breaker: Failure Makes You Stronger

**Blurb:** Fight the Endless Horde as 12 Heroes in this high-definition side-scrolling parallax animation action game. Your hero is weak, but each time you face the horde, you collect bonuses that make you stronger. Eventually, you might just break the horde and unlock a new hero, with different weapons and abilities. Play today, master all of the weapons, and unlock all of the heroes.

**Genre:** Side-scrolling action / Prestige (incremental progression)

**Inspirations:** Earn to Die franchise (prestige/upgrade loop), Dauntless (combat feel)

**Tech Stack:**

- **Runtime:** TypeScript, React, CSS Modules
- **State Management:** XState (full game state stored in XState state machines)
- **Rendering:** PixiJS + spritesheet animations (Spine skeletal animation may be added later via pluggable animation layer)
- **Audio:** Howler.js
- **Persistence:** LocalStorage (no backend)
- **Testing:** Vitest (unit tests), React Testing Library (component tests), Playwright (automated UI/E2E tests)
- **Build/Package:** Vite + npm

---

## 2. Core Vision

- Side-scrolling, left-to-right. Hero always on the left, advancing right.
- Left-click = Attack, Right-click = Defend/Special defensive action. Spacebar = Hero-specific movement/ability.
- Timing-based combat: correct timing → travel farther → earn more currency.
- Die or run out of time → spend currency on upgrades → try again.
- Each hero has **3 chapters** (up to 90 sec each); ~1/3 upgrades needed per chapter. Many players need full upgrades to clear chapter 3.
- Clearing chapter 3 unlocks the next hero.
- 12 heroes total, each with unique weapon/ability feel and skill expression.
- Player controls forward movement (not auto-run).

---

## 3. Hero Concepts (Initial Ideas)

| #     | Hero                     | Primary (LMB)                       | Defensive (RMB) | Skill Expression                                              |
| ----- | ------------------------ | ----------------------------------- | --------------- | ------------------------------------------------------------- |
| 1     | Barbarian Berzerker (M)  | Melee axe swing                     | Block           | Block enemy attacks, attack when they aren't blocking         |
| 2     | Amazonian Archer (F)     | Aim & shoot arrows (mouse position) | Jump backward   | Precision aim; can't retreat far — screen doesn't scroll back |
| 3     | Wizard (M)               | Massive magic attack                | Aimed stun      | Stun-then-burst combo; timing the stun is key                 |
| 4     | Sorceress (F)            | TBD                                 | TBD             | TBD                                                           |
| 5     | Whaler / Sailor (M)      | Harpoon attacks                     | TBD             | Water-themed; pirates & sea creatures                         |
| 6     | Gloomy Horror Hero       | TBD                                 | TBD             | TBD                                                           |
| 7     | Cyberpunk Cyborg         | TBD                                 | TBD             | TBD                                                           |
| 8     | Greek Lightning Hero (M) | Lightning bolt attacks              | TBD             | Wields Zeus's Lightning Bolt                                  |
| 9     | Dark Ages Minstrel       | TBD                                 | TBD             | TBD                                                           |
| 10–12 | TBD                      | —                                   | —               | —                                                             |

### 3.2 Hero Settings, Art Styles & Music

Each hero has a **unique setting, art style, and music** — they should feel like distinct worlds.

| #     | Hero                 | Setting                          | Art Style                                                       | Music / Vibe                             |
| ----- | -------------------- | -------------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| 1     | Barbarian Berzerker  | Scottish Highlands               | Photorealistic                                                  | Epic orchestral (Lord of the Rings feel) |
| 2     | Amazonian Archer     | Amazon Jungle                    | 19th-century naturalist illustration / Romantic-era exploration | Panpipe, world music                     |
| 3     | Wizard               | TBD                              | TBD                                                             | TBD                                      |
| 4     | Sorceress            | TBD                              | TBD                                                             | TBD                                      |
| 5     | Whaler / Sailor      | Ocean / Coastal                  | TBD                                                             | Sea shanty / nautical                    |
| 6     | Gloomy Horror Hero   | Cemetery                         | Gothic Horror Silhouette Art                                    | Gloomy horror, dark ambient              |
| 7     | Cyberpunk Cyborg     | Futuristic Cityscape             | Neon Cyberpunk Digital Illustration                             | Synthwave / Retrowave / EDM              |
| 8     | Greek Lightning Hero | Ancient Greece (arches, temples) | High Renaissance-style Academic Painting                        | Classical / epic / Mediterranean         |
| 9     | Dark Ages Minstrel   | Medieval (D&D-inspired)          | Modern digital anime-influenced fantasy / Western cartoon-comic | Minstrel music, church modes, lyre       |
| 10–12 | TBD                  | TBD                              | TBD                                                             | TBD                                      |

**Note:** Wizard and Sorceress need distinct settings and gameplay to differentiate them. Whaler/Sailor is a new addition — water-themed levels with pirates, sea creatures.

---

## 4. Progression / Economy

### 4.1 Currency & Rewards

- **Hero-specific currency** — each hero earns a different thematic currency (e.g., Barbarian earns "Clan Gold", Sorcerer earns "Arcane Shards", etc.). This makes it visually obvious why currency doesn't transfer between heroes.
- **No visible money counter during the run.** Currency earned is revealed on the Results Screen.
- Currency is spent on the **Upgrade Screen** between runs. No mid-run purchases.

**Reward Sources:**

| Source            | Payout                                           | Notes                                                                                                                                              |
| ----------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Distance          | $1 per 1% of chapter distance covered (max $100) | Even walking to the first enemy earns a little                                                                                                     |
| Duel damage dealt | $1 per damage point (capped at enemy max HP)     | Rewards combat skill even if you don't win                                                                                                         |
| Enemy defeated    | $50 per enemy killed                             | Flat bonus per kill                                                                                                                                |
| Boss defeated     | $200                                             | Big payoff for clearing the chapter                                                                                                                |
| Bonus Coins       | Face value (e.g., $5, $10, $25)                  | Floating coins in traversal sections; touch to collect. **Permanently gone** once collected. Possible bonus for collecting all coins in a chapter. |

**Chapter Multiplier:**

- Chapter 1: ×1
- Chapter 2: ×2.5
- Chapter 3: ×5

**Progression Vision (Average Player, Chapter 1):**

- **Run 1:** Completes first traversal, dies during first duel. Earns ~$30–40 (distance + partial duel damage).
- **Run 2:** Beats first duel, dies partway through second traversal.
- **Run 3:** Reaches 3rd duel.
- **Run 4:** Passes 4th duel.
- _...continues progressing..._
- **Runs 10–15:** Beats the chapter boss.

**Design goal:** An average player familiar with the controls should earn enough on their **very first run** to buy at least one upgrade.

### 4.2 Upgrade System

- **6 categories × 6 levels = 30 upgrades** per hero (start at Lv.1, upgrade to Lv.6).
- Barbarian example categories:
  1. **Max Health** (Lv.1 → Lv.6) — increases max HP. _(Applies to: both)_
  2. **Armor** (Lv.1 → Lv.6) — reduces incoming damage by a **percentage**. _(Applies to: both — duel hits & traversal hazards)_
  3. **Running Speed** (Lv.1 → Lv.6) — faster auto-run during traversal. _(Applies to: traversal only)_
  4. **Damage Multiplier** (Lv.1 → Lv.6) — increases attack damage. _(Applies to: duels only)_
  5. **Attack Speed** (Lv.1 → Lv.6) — **shortens the attack animation** (less commitment time). _(Applies to: duels only)_
  6. **Special Ability** (Lv.1 → Lv.6) — hero-specific (e.g., Barbarian's Leap Attack: distance & damage). _(Applies to: both — depending on hero)_
- Each hero will have its own 6 categories tailored to their playstyle.
- **Design principle:** Some upgrades help with traversal, some with duels, some with both — so players must choose where to invest first based on their weaknesses.

### 4.3 Upgrade Cost Scaling

- Costs **increase** per level. Upgrades cost different amounts across categories — creates interesting choices (buy a cheap fallback now, or save up for the expensive one you really want?).
- **Example costs (Max Health, Barbarian):**
  - Lv.1 → Lv.2: $18
  - Lv.2 → Lv.3: $40
  - Lv.3 → Lv.4: $100
  - Lv.4 → Lv.5: $220
  - Lv.5 → Lv.6: $450
  - _(Total to max: ~$871)_
- Other categories will have different price curves (some cheap early, some expensive early).
- Because the player earns more as they get stronger (and Chapter 2/3 have multipliers), the **effective time per upgrade only increases ~10% per level**, not proportional to raw cost.
- **Target pacing:** ~10–15 runs per chapter, ~30–45 runs to fully max a hero (~30–60 min of gameplay).
- Average player affords **1 upgrade per run**; skilled player may afford 2 or save toward a bigger purchase.
- _(All numbers are initial estimates — will need playtesting and tuning.)_

### 4.4 Prestige Loop

- After completing all 3 chapters: player can **Prestige** the hero.
- Prestige **resets** all 30 temporary (cash-bought) upgrades.
- Player earns **Prestige Tokens** → spent on **permanent** hero upgrades.
- May unlock harder difficulties.
- Prestige loop: upgrade → run → clear chapters → prestige → repeat at higher difficulty.

---

## 5. Run Structure & Combat Flow

### 5.1 Enemy Layout & Run Timing

Enemies are spaced out along the path. The only way past an enemy is to slay it. Example layout:

```
H___e___e___ee___E___eee___B

H = Hero    e = easy enemy    E = mini-boss    B = chapter boss
```

- **~6 duels per run** (at average upgrade level):
  - 3 solo easy enemies × ~5 sec each = ~15 sec
  - 1 cluster of 2–3 enemies = ~10 sec
  - 1 chapter boss = ~20 sec
  - **Total duel time: ~45–50 sec**
- **Traversal time: ~40–45 sec** (platformer obstacles between duels).
- **Ratio: ~50/50 to 60/40 fighting vs. traversal.**
- Enemy order is **slightly randomized** each run — not identical every time.
- Enemy **actions and timings are randomized** slightly too — each battle feels a little different.
- Enemy variety within a chapter: wolves, swordsmen, shieldbearers, etc.

### 5.2 Barbarian Enemy Roster (Chapter 1)

**Wolf**

- Waits just out of range, then **pounces** toward the hero.
- **Optimal play:** Attack the wolf mid-pounce for damage — it then retreats out of range.
- **Alternatives:** Block the pounce (reduced damage, but still hurts). Move back to dodge the pounce, then attack before it retreats. Leap Attack it while it retreats.
- **Feel:** Reactive, punishes passive play.

**Swordsman (Claymore)**

- Two-handed sword, **longer range than the hero** but weaker at close range.
- Tries to **time swings to punish the hero moving forward** (punishes overcommitment).
- **Optimal play:** Move toward them but stay out of range to **bait a swing**, then close in and attack before they can wind up again.
- **Alternatives:** Move in close and block (tank reduced damage), then attack from close range.
- Getting hit by the sword **without blocking** deals heavy damage and **knocks you back**.
- After several close-range attacks, the swordsman **pushes/kicks you back** (no damage) to reset spacing.
- **Feel:** Methodical, rewards patience and baiting.

**Shieldbearer (Targe + Broadsword)**

- One-handed broadsword + targe shield. **Takes reduced damage** while shield is up.
- Tries to **shield bash** to stun the hero, then attacks while the hero is unable to respond.
- May also wind up a sword attack directly.
- **Optimal play:** Block the shield bash, then counter-attack during their recovery. Or wait for them to overcommit on an attack and counter.
- **Feel:** Defensive puzzle, requires reading the enemy's intent (bash vs. slash).

### 5.3 Barbarian Enemy Roster (Chapter 2 — New Additions)

Chapter 2 includes all Chapter 1 enemies **plus:**

**Highland Archer**

- Ranged enemy; fires arrows while the hero must **close the distance**.
- Arrows can be ducked or blocked. Getting hit without blocking deals moderate damage.
- Once in melee range, the archer is weak and goes down fast.
- **Optimal play:** Duck/block arrows while advancing, then burst them down at close range. Leap Attack is very effective for closing the gap.
- **Feel:** Pressure to advance; traversal hazard becomes a duel element.

**Pikeman**

- Extremely long reach with a pike. Outranges even the Swordsman.
- Thrusts forward — must **duck under the pike** to get inside range.
- Once inside, the pikeman is slow to recover and vulnerable.
- **Optimal play:** Time a duck through their thrust, then attack from close range.
- **Feel:** Spatial puzzle — getting inside is the challenge.

### 5.4 Barbarian Enemy Roster (Chapter 3 — New Additions)

Chapter 3 includes all Chapter 1 & 2 enemies **plus:**

**Highland Berserker**

- Fast, aggressive enemy that **mirrors the hero**. Swings a two-handed axe with quick combos.
- Relentless attacker — doesn't give much breathing room.
- **Optimal play:** Block or dodge the first swing, then counter-attack in the brief gap between combos. Trying to out-trade them is risky without good Armor/Health.
- **Feel:** Aggressive mirror match — tests everything the player has learned.

**War Hound Handler**

- Fights alongside a **war hound** (behaves like a Wolf). Two enemies at once.
- The handler stays at range and commands the hound to attack, then moves in when the hero is distracted.
- **Optimal play:** Eliminate the hound first (familiar Wolf patterns), then deal with the handler. Or use Leap Attack to bypass the hound and strike the handler.
- **Feel:** Multi-target threat management.

### 5.5 Combat System — Mini-Duel

When the hero reaches an enemy (or group), scrolling **pauses** and a **mini-duel** begins (inspired by Bowser fights in Super Mario Bros).

- **Readable wind-ups:** Enemies have visible wind-up animations so players can learn to read attacks.
- **Unpredictable enough:** Getting hit occasionally is _normal_ and expected — not a sign of failure.
- **Escalation:** Enemies get faster / more reckless as the duel continues, punishing pure-dodge strategies. Tanking a little damage to land a powerful hit is often the better play.
- **Early balance (Barbarian, un-upgraded):**
  - Hero kills an easy enemy in ~3 good hits.
  - Enemy kills the hero in ~4 good hits.
  - A player who never blocks can still defeat the first enemy and earn currency → guarantees forward progress even for beginners.

**Multi-Enemy Duels (Simultaneous):**

When encountering a group (e.g., `eee`), all enemies are **on screen at once** but at **different positions/ranges** so they don't visually overlap. Enemies are taken down **sequentially** while all remain active threats.

- Example: **Shieldbearer in front + Archer behind.** Must fight the Shieldbearer first while dodging incoming arrows from the Archer.
- **Elevation differences** are possible: a ranged enemy on a tree, tower, or elevated platform fires down while a melee enemy engages at ground level. Relevant for heroes with aiming mechanics (Archer, Sorcerer, Laser Blaster).
- Enemies don't stack on each other — clear spatial separation for readability.
- Defeating the front enemy lets the hero engage the next one (they may advance forward or the hero moves to them).

**Multi-Enemy Duel Mechanics:**

Beyond simple "fight the front enemy while dodging the back one," multi-enemy duels can include **special mechanics** that add puzzle elements:

- **Destructible terrain:** A Swordsman at ground level + a Wizard on a tower. The Barbarian must defeat the Swordsman, then **swing the axe at the tower to break it down**, then dispatch the fallen Wizard. Creates a multi-step sequence.
- **Protected/Invulnerable enemies:** An Amazonian warrior at melee range is **invulnerable** due to an Amazonian Priest's ritual. The Archer must dodge melee attacks while **shooting down the Priest first** to remove the protection, then finish the warrior.
- These mechanics can be hero-specific — the way you solve a multi-enemy puzzle depends on your hero's kit.

### 5.6 Player Movement & Controls

**Between duels (traversal):**

- Hero **auto-runs** forward. Screen scrolls right; does **not** scroll back.
- **Platformer obstacles** during traversal — two types:
  - **Time-tax obstacles** (terrain): Hills, ridges, shallow ditches, stone fences. If you don't jump at the right time, the hero **stops and slowly climbs over**, costing precious seconds.
  - **Health-tax obstacles** (hazards): Blow-darts, swooping bats, projectiles. Getting hit **damages the hero's HP pool** (same HP used in duels).
- **Traversal difficulty scales per chapter** — later chapters have more obstacles, tighter timing, and more hazards. Investing in Running Speed becomes increasingly necessary.
- **Bonus Coins** are placed in traversal sections — some easy to grab, some require skillful jumps/ducks. Permanently consumed once collected.
- Obstacles are thematically tied to the setting (e.g., Barbarian: Highland ridges & ditches; Archer: jungle blow-darts & vines; Cyberpunk: laser grids & hovering drones; Horror: gravestones & swooping bats).
- **Traversal controls:**
  - **W** — Jump (dodge ground obstacles, grab high coins)
  - **S** — Duck (dodge high obstacles)
  - **D** — Sprint (go faster, but less reaction time)
  - **A** — Slow down (more reaction time for obstacles)
  - **Spacebar** — Special ability (hero-specific, if applicable during traversal)
- Hitbox during traversal matches duel stances: standing = normal, jumping = airborne (dodges ground hazards), ducking = low (dodges high hazards).

**During duels (fighting-game style):**

Side-view 2D arena. Hero on left, enemy on right. Choosing an action **locks the hero into the animation** for its duration (commitment-based combat, like a fighting game).

| Input                 | Action            | Notes                                                                                   |
| --------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| **W**                 | Jump              | Dodges low attacks. Not locked — can cancel.                                            |
| **S**                 | Duck              | Dodges high attacks. Not locked — can cancel.                                           |
| **A / D**             | Move left / right | Small positioning adjustments. Not locked — can cancel.                                 |
| **Left-click (LMB)**  | Offensive attack  | Locks into attack animation. May vary by stance (jumping, standing, ducking) in future. |
| **Right-click (RMB)** | Defensive action  | Hero-specific (block, dodge-back, stun, etc.). Locks into animation.                    |
| **Spacebar**          | Special attack    | Hero-specific (e.g., Leap Attack). Has cooldown. Locks into animation.                  |
| **Mouse position**    | Aiming            | Relevant for ranged heroes (Archer, Sorcerer, Laser Blaster).                           |

**Future consideration:** LMB attack could produce different moves depending on stance (jumping attack, standing attack, crouching attack).

### 5.7 Health System

- Hero starts each run at **100% health**.
- Health is a **single persistent pool** across the entire run — damage from traversal hazards and duel hits all reduce the same HP.
- Health does **not** regenerate between duels (no free heals).
- **Open question:** Possibly restore ~25% HP after a successful duel — TBD, needs playtesting.
- This creates a **resource-management layer**: play safe to save HP for the boss, or play aggressively to save time?

### 5.8 Failure & Death

- **Death:** Brief death animation + a **lore message** from the enemy that killed them (contextual, based on how far into the chapter they got). Then → Results Screen showing currency earned.
- **Lore message tone matches the hero's setting:**
  - Barbarian: _"These are our lands now."_ / _"Leave now while you can."_
  - Horror: _"You will join us in death."_ / _"You can’t kill us, we are already dead."_
  - Minstrel: _"La di di da, the brave do vanquish."_ / _"Maybe you should take up a musical instrument instead of fighting."_
  - Cyberpunk: _"AXEL Corp is expecting you."_
- **Timer expiry (90 sec):** Same result as death — not a softer failure. Same reward calculation.
- No difference in reward between dying and timing out.

### 5.9 Enemies

- Enemies are **thematically tied to the hero's setting**.
  - Barbarian: Highland warriors, clansmen, shieldbearers.
  - Archer: Jungle beasts, tribal warriors.
  - Horror: Skeletons, bats, ghouls.
  - Cyberpunk: Robots, drones, cyborg soldiers.
  - Greek: Hoplites, minotaurs, harpies.
  - Minstrel: D&D-inspired — goblins, orcs, dark knights.
- Each chapter introduces 1–2 new enemy types on top of the previous chapter's roster.

### 5.10 Chapter Structure (per Hero)

Each hero has a **Tutorial (Chapter 0)** + **3 chapters**, each up to **90 seconds** long.

**Tutorial (Chapter 0):**

- Brief, guided introduction to the hero's controls, attacks, and special ability.
- On-screen prompts walk the player through: move, jump, duck, attack, block/defend, special attack.
- Not timed. Low-stakes enemies that can't kill the player (or very forgiving).
- Played once per hero (on first selection). Can be replayed from chapter select.
- **Goal:** Ensure the player understands the hero's unique mechanics before the real runs begin.

**Chapters 1–3:**

- **Setting is consistent** across all 3 chapters for a given hero (e.g., Barbarian → Scottish Highlands).
- **Intro cinematic:** Brief dialogue between the Final Boss and two henchmen before chapter 1.
- **Ch. 1:** Outer defenses of the horde → culminates in battle with **Henchman 1**.
- **Ch. 2:** Same setting, different terrain (hills, valleys). Same enemy types as Ch. 1 **plus 1–2 new enemy types**. Ends with battle against **Henchman 2**.
- **Ch. 3:** Further terrain variation. More new enemies. Ends with the **Final Boss**.
- **Checkpoint system:** Clearing a chapter is a permanent checkpoint. Failing during Ch. 2 restarts at Ch. 2, not Ch. 1.
- Clearing Ch. 3 → unlocks the next hero.

### 5.11 Boss Fights

**Chapter 1 & 2 Bosses (Henchmen):**

- Larger, tougher version of a regular enemy type with increased stats + **one special move**.
- Fight duration: ~20 seconds. Roughly **10 attacks landed + 10 dodges/blocks** of enemy attacks.
- Beatable at ~1/3 upgrades (Ch.1) or ~2/3 upgrades (Ch.2).

**Chapter 3 Boss (Final Boss):**

- **Unique encounter** — unique enemy model, distinct from any regular enemy.
- **Two phases/lives:**
  1. Phase 1: Fight the boss down to low health.
  2. **Transition:** Boss says a line of dialogue, becomes visibly more dangerous (new visual effects, stance change).
  3. Phase 2: Faster, more aggressive, possibly gains a new attack.
- Beatable at full or near-full upgrades. Skilled players may clear with fewer upgrades.

---

## 6. Screen Flow & UI

### 6.1 Screen Sequence

```
Title Screen → Hero Select → [Chapter Intro Cinematic*] → Run (90s) → Death/Victory
  → Results Screen → Upgrade Screen → Run again (or → Hero Select)
```

\* Cinematic plays the first time a hero is started.

### 6.2 Hero Select Screen

- **First visit:** Only the Barbarian is available. All other 11 heroes are locked.
- **After completing Barbarian's 3 chapters:** All 11 remaining heroes unlock simultaneously.
- Displays per hero:
  - Hero portrait / art
  - Progress indicator (which chapter they're on)
  - Upgrade indicator (how many of 30 upgrades purchased)
  - If **all heroes are fully upgraded**: message — _"Prestige to earn permanent rewards and start the entire game from the beginning."_
- Player can select a specific **chapter** within a hero (e.g., replay Ch. 1 with a strong hero for achievements or different difficulty).

### 6.3 Upgrade Screen

- Shown between runs.
- Displays: currency earned this run, total currency, and the 6×6 upgrade grid.
- Player chooses which upgrades to buy. Cannot buy mid-run.

### 6.4 Results Screen (Defeat / Victory)

Consistent UI layout, but **different presentation** based on outcome:

**Defeat — Death:**

- Header: **"Defeat — You died bravely in battle."**
- Art: Enemy shown standing over the hero on the ground.
- Enemy speech bubble: setting-specific taunt (e.g., _"You were weak!"_)

**Defeat — Time Out:**

- Header: **"Defeat — You ran out of time."**
- Art: Enemy shown standing over the hero on the ground.
- Enemy speech bubble: _"You have been overrun."_

**Victory (Chapter 1 or 2 cleared):**

- Header: **"Victory"**
- Art: Hero shown standing over the defeated boss/henchman.
- Hero speech bubble: hero-specific triumphant line. Examples:
  - Barbarian: _"Freedom is won with courage."_ / _"Remember what I did today — Angus the Red will be remembered."_
  - Minstrel: _"People will sing songs of this day."_

**Victory (Chapter 3 — Final Boss):**

- Same victory screen as above, **plus:**
- **Outro cinematic / group picture:** All newly unlocked heroes shown together as a celebratory group image.
- Transition to Hero Select with the new heroes available.

- All screens show: distance travelled, enemies killed, currency earned, total currency.
- Quick transition to Upgrade Screen (or Hero Select after Ch.3 victory).

### 6.5 Prestige Skill Board

- Unlocked after all heroes are fully upgraded (or after completing all heroes — TBD).
- Spend **Prestige Tokens** on **game-altering tradeoff perks**. Examples:
  - _"5 pts — Money Grubber: Earn more money from kills, but have less time per run."_
  - _"5 pts — Glass Cannon: Deal more damage, but take more damage."_
- Points can be **freely reassigned** at any time — encourages experimentation.
- Combinations of perks create distinct playstyles.

### 6.6 HUD (During Run)

- **Timer:** Top-center countdown.
  - **Green** — > 30 seconds remaining.
  - **Orange** — 15–30 seconds remaining.
  - **Red + pulsing** — < 15 seconds remaining.
  - **Not shown** during Tutorial (Chapter 0).
- **Health bar:** Always visible (top-left or similar).
- **Special attack cooldown indicator.**
- No currency counter during the run.

---

## 7. Audio & Music

- **Music:** Full unique soundtrack per hero/setting (e.g., Celtic for Barbarian, mystical for Sorcerer).
- **SFX:** Shared sound effect library — hits, blocks, kills, deaths, UI interactions.
- **Voice acting:** None. Lore messages are **text-only**.

---

## 8. Visual Feedback / Juice

**When an enemy hits the hero:**

- **Screen shake** (intensity scales with damage).
- Hero **color flashes** (brief invulnerability/stun flash).
- Hero is **briefly stunned** (locked out of actions for a moment).
- **Health bar in the HUD** visibly decreases.

**When the hero hits an enemy:**

- **Damage numbers** float up from the enemy.
- **Enemy health bar** (above their head) decreases.

**Well-timed blocks:**

- **"PERFECT"** text flash on screen.
- Distinct sound effect.

**Boss killing blow:**

- **Slow-motion** on the final hit.
- Leads into the outro lore / victory dialogue.

---

## 9. Save Data & Persistence

- All data persisted in **LocalStorage** (no backend).
- **Reset All Progress** button (with confirmation dialog) — wipes all heroes, upgrades, currency, prestige.
- **Export / Import** — player can export save data as a file (JSON) and import it on another browser/device. Prevents data loss from clearing browser storage.

---

## 10. MVP / Milestones

### MVP (Milestone 1): Barbarian Berzerker

- **Scope:** Barbarian only — 3 chapters, full upgrade loop (6×6 grid), results screen, upgrade screen, hero select (1 hero available).
- **Goal:** Validate the core fun loop — run → duel → die → upgrade → retry.
- **Includes:** Platformer traversal with obstacles, mini-duel combat, Scottish Highlands setting, placeholder prestige.
- **Does NOT include:** Other heroes, prestige skill board, cinematics (can be placeholder).

### Future Milestones (TBD)

- Milestone 2: Second hero (e.g., Amazonian Archer) — validates ranged combat & second setting.
- Milestone 3: Prestige system, skill board, harder difficulties.
- Milestone 4+: Remaining heroes rolled out in batches.

---

## 11. Fun Pillars

1. **Skill Expression** — "Every run is a chance to prove how good I am." Skilled players eke out more currency per run, progress faster, face harder battles.
2. **Power Fantasy** — "I'm so much more powerful now." Novice players can still beat the game by accumulating upgrades until they feel godlike.
3. **Visual Appeal** — Clean, crisp HD graphics. Cool artwork. Fun vibe.
4. **Mastery / Prestige Loop** — After completing all 3 chapters of a hero, players can Prestige: lose all temporary (cash-bought) upgrades, earn **Prestige Tokens** for **permanent** hero upgrades. May unlock harder difficulties. Incentivizes replaying and deeper mastery.

## 12. Anti-Patterns / Things to Avoid

- **No social features** — No guilds, leaderboards, chat, or anything that distracts from the core loop.
- **No ads, no pay-to-win** — Zero monetization pressure. No store.
- **No slow grinds** — Average player should afford an upgrade after _every_ 90-second run. Skilled/lucky players might earn enough for two upgrades (or bank toward two next run). If a run doesn't feel rewarding, pacing is broken.

---

## 13. Target Player & Session Design

- **Run length:** 90 seconds max.
- **Casual player:** ~5 minutes/day → can eventually beat the game (all 3 chapters of all heroes).
- **Dedicated player:** Beats the game faster (higher skill = more currency/run), then continues into Prestige and harder difficulties.
- **Both audiences served** by the same loop — short runs, meaningful upgrades, optional depth.
