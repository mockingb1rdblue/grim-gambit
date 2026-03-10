# Grim Gambit — Game Design Document

**Project**: Grim Gambit (GG)
**Type**: Progressive Web App (PWA) — isometric/top-down tactical game
**Genre**: Kill Team × XCOM hybrid — automated rules, turn-based tactical combat, persistent campaign
**Status**: Design v1.0 — 2026-03-10
**Repository**: https://github.com/mockingb1rdblue/grim-gambit

---

## 1. Concept & Vision

Grim Gambit is a browser-based PWA that combines the skirmish combat of **Warhammer 40,000: Kill Team** (3rd Edition) with the **strategic base-building and campaign progression of XCOM**. All dice rolling, rule lookups, and legal move validation are fully automated — players only activate operatives, choose orders, select actions, and issue orders. The system handles the rest.

### Design Pillars

1. **Automation First** — No player should need to know a rule. The engine enforces everything, calculates everything, and explains every decision.
2. **Faction Fidelity** — Every official Kill Team faction, operative, weapon, ploy, and equipment is modeled exactly as written in official rules (wahapedia.ru sourced).
3. **Campaign Depth** — Between missions, the XCOM meta-layer provides base building, research, manufacturing, operative recovery, and strategic decisions.
4. **Mode Plurality** — Single player vs AI, PvP (1v1), PvE co-op (2+ players vs AI), PvPvE (multiple factions vs AI + each other), full campaign, and quick skirmish.
5. **Offline Capable** — Full gameplay with no network requirement. Multiplayer requires connection; single-player and campaign work fully offline.

---

## 2. Game Modes

| Mode | Players | Description |
|------|---------|-------------|
| **Campaign** | 1 | Full XCOM-style meta-layer + sequential Kill Team missions. Persistent operatives, injuries, XP, base building. |
| **Skirmish** | 1 | Single mission vs AI. No campaign persistence. Quick practice. |
| **PvP** | 2 | Head-to-head local or online. Both players human-controlled. |
| **Co-op** | 2–4 | Human players control allied operatives against AI-controlled enemy kill team. |
| **PvE** | 1–4 | Human vs AI. Optional co-op where multiple humans share a kill team (each controlling a subset of operatives). |
| **PvPvE** | 2–4 | Multi-faction: 2 human teams with an additional AI-controlled third faction. |
| **Solo Campaign** | 1 | Campaign mode with AI-only opponents. |
| **Multiplayer Campaign** | 2 | Shared campaign where two players take opposing factions through a linked narrative arc. |

---

## 3. Kill Team Rules Engine

### 3.1 Operative Data Model

```typescript
interface Operative {
  id: string;
  name: string;
  faction: FactionId;
  killTeam: KillTeamId;
  datacard: {
    move: number;           // inches
    apl: number;            // Action Point Limit
    ga: number;             // Group Activation count
    defence: number;        // Defence dice count (typically 3)
    save: number;           // Save target (lower = better; 5 = 5+)
    wounds: number;         // Starting wounds
  };
  currentWounds: number;
  status: 'healthy' | 'wounded' | 'injured' | 'incapacitated';
  order: 'engage' | 'conceal' | null;
  ready: boolean;
  weapons: Weapon[];
  abilities: Ability[];
  equipment: Equipment[];
  position: { x: number; y: number; z: number };  // tile coordinates
  campaignData?: {
    xp: number;
    battleHonours: BattleHonour[];
    battleScars: BattleScar[];
    injuries: Injury[];
  };
}
```

### 3.2 Game Phase State Machine (XState v5)

```
PREGAME
  → faction_select → kill_team_build → equipment_select → killzone_select → READY

GAME (4 Turning Points)
  → STRATEGY_PHASE
      → initiative_roll
      → ready_operatives (grant CP)
      → gambit_step (alternate strategic ploys)
  → FIREFIGHT_PHASE
      → [loop while ready operatives exist]
          → select_operative
          → select_order (engage | conceal)
          → perform_actions (up to APL, no repeats)
              → move | dash | fall_back | charge | shoot | fight | pick_up | place
          → expend_operative
      → [counteract: opponent may activate expended with 1 AP]
  → TURNING_POINT_END
      → score_vp (crit ops + kill ops + tac ops)
      → check_game_end
  → [repeat x4] → GAME_END → result
```

### 3.3 Core Mechanic Automation

#### Line of Sight
- **Algorithm**: Parametric ray from attacker head position (center-top of base) to target body (any point)
- **Terrain classification**: Each tile has `terrainType: 'heavy' | 'light' | 'blocking' | 'exposed' | 'accessible' | 'vantage'`
- **Resolution**:
  - Ray hits `blocking` → target not visible
  - Ray hits `heavy` terrain >1" from both operatives → target obscured
  - Any intervening terrain within 1" of target → cover (unless target within 2" of attacker)
- **Result**: `{ visible: boolean, obscured: boolean, inCover: boolean }`

#### Control Range
- Any operative within 1" AND visible to another operative is in control range
- Mutual — both operatives simultaneously in each other's control range
- Engine checks automatically before displaying valid action targets

#### Shooting Resolution (fully automated)
1. Select valid weapon + target (validated against rules)
2. Roll `weapon.attacks` attack dice (simulated)
3. Apply obscured modifier if applicable (downgrade criticals, discard one success)
4. Defender rolls `operative.defence` dice
5. Apply cover save if applicable (one auto-retained normal save)
6. Resolver allocates optimal defence saves (defender-optimal by default; configurable for competitive)
7. Calculate unblocked damage → apply wound reduction → check state transition
8. Emit action log entry with full resolution detail

#### Fight (Melee) Resolution
1. Both operatives select melee weapons
2. Both roll simultaneously
3. Assisting bonus calculated automatically
4. **AI-controlled operatives**: Automatic optimal strike/block selection
5. **Human-controlled operatives**: Interactive strike/block UI (drag die to attack or defend)
6. Alternate resolution from active player

#### Injury States (automated tracking)
```
wounds > half_starting         → 'healthy'
wounds > 0 && ≤ half_starting → 'injured' (-2" move, -1 Hit all weapons)
wounds ≤ 0                    → 'incapacitated' (removed from killzone)
```

### 3.4 Command Points & Ploys

- CP tracked per player, updated automatically at each Turning Point start
- Ploy usage UI: available ploys shown with CP cost, greyed out if insufficient CP or wrong timing window
- Timing windows enforced by game phase FSM (tactical ploys only available during Firefight Phase)
- Faction-specific ploys loaded from faction data files

### 3.5 Victory Points

Three tracks auto-scored at end of each Turning Point (not TP1):
- **Crit Ops**: Mission-defined primary objectives (hold marker, control zone, etc.)
- **Kill Ops**: 1 VP per incapacitated enemy operative
- **Tac Ops**: Secret secondary objectives (1 of 4 archetypes, 3 choices each)
  - Tac Op selections hidden from opponent until first point scored

---

## 4. Faction System

### 4.1 Supported Factions (All Official Kill Teams)

**Imperium**
- Intercession Squad (Space Marines)
- Phobos Strike Team (Primaris Infiltrators)
- Veteran Guardsmen (Astra Militarum)
- Kasrkin (Astra Militarum Elite)
- Novitiates (Adepta Sororitas)
- Legionary (Chaos Space Marines)
- Traitor Guard (Lost and the Damned)
- Plague Marines (Death Guard)
- Blades of Khorne (Chaos Daemons)
- Gellerpox Infected (Rogue Trader)
- Aquila (Space Marine Devastators/Reivers)
- Hearthkyn Salvagers (Leagues of Votann)
- Hunter Clade (Adeptus Mechanicus)
- Wyrmblade (Genestealer Cults)
- Mandrakes (Drukhari)
- Harlequin Troupe (Aeldari)
- Kommandos (Orks)
- Greenskin Krew (Orks variant)
- Void-Dancer Troupe (Aeldari)
- Elucidian Starstriders (Rogue Trader)
- Nemesis Claw (Word Bearers)
- Hierotek Circle (Necrons)
- Hand of the Archon (Drukhari)
- Corsair Voidscarred (Aeldari)
- Farstalker Kinband (Kroot)
- T'au Pathfinder Team (T'au Empire)
- Tau'nar (Greater Good)
- Tyranid Warriors (Tyranids)
- Brood Brothers (Genestealer Cults)
- Death Guard Plague Marines (Death Guard)
- Chaos Cult (Chaos Undivided)

*All teams to be implemented progressively. Initial release: 10 core teams.*

### 4.2 Faction Data Schema

```typescript
interface FactionDatafile {
  factionId: string;
  name: string;
  killTeamName: string;
  operatives: OperativeTemplate[];
  ploys: { strategic: Ploy[]; tactical: Ploy[]; };
  equipment: Equipment[];
  rosterRules: {
    minOperatives: number;
    maxOperatives: number;
    leaderSlots: number;
    specialistSlots: Record<string, number>;
    pointsLimit: number;  // Kill Team uses roster size, not points; 250pts for custom
  };
}
```

### 4.3 Roster Builder

- Full drag-and-drop roster building per Kill Team rules
- Equipment selection per operative (points/slot budget enforced)
- Ploy selection (faction provides full ploy list; strategic and tactical)
- Save/load multiple rosters per faction
- Export roster as JSON or printable reference card

---

## 5. Killzone (Map) System

### 5.1 Map Representation

- **Format**: Tiled-compatible JSON tilemap
- **Tile size**: 64×64px (screen) mapped to 1" = 2 tiles game scale
- **Isometric rendering**: Diamond-grid isometric view via PixiJS v8
- **Board size**: 22"×30" standard (44×60 tiles)
- **Layers**:
  1. Ground (floor tiles)
  2. Terrain objects (with height data)
  3. Objective markers
  4. Drop zones (deployment areas)
  5. Overlay (UI elements)

### 5.2 Official Killzones

Each killzone has unique terrain rules and visual theme:
- **Into the Dark** (Gallowdark): Wall terrain, corridor-heavy, close-quarters
- **Volkus**: Large ruins, Barred terrain trait
- **Bheta-Decima**: Industrial, multi-level platforms
- **Nostromo Rift**: Space ship corridors
- **Standard Open** (Matched Play): Varied symmetric terrain

### 5.3 Procedural Map Generation

For campaign variety, procedural killzone generator:
- Terrain density parameter (sparse ↔ dense)
- Terrain type bias (open ↔ enclosed)
- Symmetry option (mirrored / asymmetric)
- Outputs valid Tiled JSON consumable by game engine

---

## 6. XCOM Meta-Layer (Campaign)

### 6.1 Overview

Between missions, players manage their **Kill Team's Stronghold** — a persistent base that unlocks new capabilities, upgrades operatives, researches projects, and prepares for the next deployment.

### 6.2 Stronghold Facilities

| Facility | Function | Unlock Cost |
|----------|----------|-------------|
| **Apothecarion** | Recover injured operatives; reduce recovery time | Starting |
| **Armoury** | Manufacture equipment and weapons | Starting |
| **Scriptorium** | Research new ploys, equipment schematics, upgrades | Starting |
| **Training Cage** | Accelerate XP gain; unlock early Battle Honours | Intel 15 |
| **Trophy Hall** | Track kills and honours; passive stat bonuses | Req. 5 battles |
| **Comms Station** | Reveal mission intel before deployment; unlock optional objectives | Intel 20 |
| **Sanctum** | Faction-specific facility (unique per faction archetype) | Intel 30 |
| **Vault** | Increase equipment carry capacity; store rare finds | Intel 10 |
| **Forge (Chaos/Mechanicus)** | Upgrade weapons beyond standard profiles | Intel 25 |

Each facility has upgrade tiers (I–III) that enhance its output.

### 6.3 Resources

| Resource | Source | Use |
|----------|--------|-----|
| **Requisition** | Mission rewards, selling items | Buy equipment, build facilities |
| **Intel** | Mission secondary objectives, recon | Research, unlock facilities |
| **Scrap** | Salvage from defeated operatives | Manufacture equipment |
| **Relics** | Boss kills, campaign milestones | Unique gear, Sanctum upgrades |

### 6.4 Operative Progression

**Experience Points (XP)**
- Earned per mission: for kills, objectives completed, mission success
- Level thresholds: 0 / 3 / 6 / 10 / 15 XP

**Battle Honours** (gained on level up — choose 1 of 2 random options)
- Stat improvements (+1 Move, +1 APL, -1 to SV, etc.)
- Special abilities (unique attack modifiers, ploy access, etc.)
- Proficiencies (additional weapon or equipment types)

**Battle Scars** (chance when incapacitated in battle)
- Roll on scar table: stat penalties (-1 Move, -1 APL, etc.)
- Scars can be treated in Apothecarion (costs Requisition + time)
- Permanent scars possible after multiple injuries to same operative

**Injury / Recovery**
- Operatives incapacitated in battle are injured and miss the next N missions (N = wound deficit / severity)
- Apothecarion reduces recovery time
- Critical injuries (0 wounds from a single hit of Critical damage threshold) can be permanent

### 6.5 Strategic Map (Globe/Region)

- **Region view**: World/sector map showing active mission zones
- **Mission types**:
  - **Ambush** (offensive): Attack enemy position; high risk, high reward
  - **Recon** (intel): Low-risk info gathering; moderate rewards
  - **Raid** (raid): Capture or destroy specific target; moderate risk
  - **Garrison** (defensive): Defend held position against attack
  - **Crisis** (story): Campaign milestone missions; always available
- **Timer pressure**: Some missions expire after N in-game days (turns between missions)
- **Faction presence**: Enemy faction "threat level" rises if missions ignored; triggers defensive crises
- **Alliances**: Unlock cooperation with allied factions (recruit operatives from other kill teams)

### 6.6 Campaign Narrative

- **12-mission story arc** per campaign playthrough
- Three acts:
  - Act 1 (missions 1–4): Establish foothold, discover enemy faction
  - Act 2 (missions 5–9): Escalation, betrayal, major loss event
  - Act 3 (missions 10–12): Final push, boss mission
- Branching mission selection (not all missions completable per run)
- **Permadeath option** (veteran mode): Incapacitated operatives with 3+ scars die permanently
- **Multiple endings** based on VP total, mission choices, and faction alignment

---

## 7. AI System

### 7.1 AI Difficulty Levels

| Level | Description |
|-------|-------------|
| **Recruit** | Random-ish decisions; no threat assessment; good for learning |
| **Warrior** | Basic threat priority (focus fire, use cover); no ploys |
| **Champion** | Tactical threat modelling, optimal positioning, ploy usage |
| **Legendary** | Full look-ahead (2-turn), optimal action ordering, ploy sequencing, Tac Op optimization |

### 7.2 AI Decision Engine

**Evaluation Function** for action selection:
- **Threat Score**: Expected damage dealt / expected damage taken per action
- **Position Score**: Cover availability, control zone presence, distance to objective
- **Objective Score**: Progress toward Crit Ops and Tac Ops
- **Ploy Value**: CP-weighted expected value of available ploys

**Action Selection Loop** (per AI activation):
1. Generate all legal actions for current operative
2. Score each with evaluation function
3. Apply difficulty modifier (Recruit: add noise; Legendary: add 2-turn lookahead)
4. Execute highest-scoring action
5. Repeat until APL exhausted

### 7.3 Bot Faction Behaviors

Each faction has a **behavior archetype** that biases AI decisions:
- **Aggressive** (Orks, Chaos): Prioritize charge, close distance, fight over shoot
- **Guerrilla** (Harlequins, Mandrakes): Prioritize concealment, flanking, hit-and-run
- **Gunline** (Guardsmen, T'au): Prioritize cover, ranged, objective camping
- **Resilient** (Plague Marines): Accept hits, slow advance, attrition
- **Swarm** (Genestealers, Tyranids): High APL mobility, encirclement

---

## 8. Multiplayer Architecture

### 8.1 Real-Time Relay via Cloudflare Durable Objects

**Turn-based game state**: Server-authoritative, state-machine driven

```
Client A ──→ Cloudflare Worker ──→ GameSession DO
Client B ──→ Cloudflare Worker ──→ GameSession DO
                                         │
                                  SQLite game log
                                  WebSocket broadcast
```

**GameSession Durable Object**:
- Maintains authoritative `GameState` in SQLite
- Receives player actions as messages; validates against rules engine
- Broadcasts state updates to all connected clients
- Handles reconnection (clients can rejoin a session mid-game)
- Session persists for 48h after last action (handles async play)

### 8.2 Async Multiplayer

For **async PvP** (players don't need to be online simultaneously):
- Each player's turn is submitted as an action batch
- Push notification (browser native notification API) on opponent's turn
- Full state reconstruction on reconnect from action log

### 8.3 Lobby System

- Create private lobby with code share
- Public matchmaking queue (faction-filtered)
- Campaign co-op: host shares campaign save; players join for individual missions

### 8.4 Hidden Information Handling

**Tac Ops secrecy**: Cryptographic commitment scheme
1. Each player commits to selected Tac Op via SHA-256 hash at game start
2. Hash sent to server; actual selection retained client-side
3. On first point scored from Tac Op: reveal selection + pre-image to server
4. Server verifies hash — prevents retcon cheating

---

## 9. Technical Architecture

### 9.1 Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Renderer** | PixiJS v8 | WebGPU-ready, 1000+ sprites at 60fps |
| **Game Logic FSM** | XState v5 | Kill Team phases map to statecharts naturally |
| **UI State** | Zustand + Immer | Lightweight reactive state for selection/HUD |
| **Persistence** | IndexedDB via Dexie.js | Async, transactional, works offline |
| **Build** | Vite + TypeScript strict | Modern bundler, PWA plugin |
| **PWA** | vite-plugin-pwa | Service worker + manifest |
| **Map Format** | Tiled JSON | Isometric tilemap, exportable |
| **Multiplayer** | Cloudflare Workers + DO | Edge-native, WebSocket, serverless |
| **Type Safety** | Zod schemas on all game state | Validated rule data |
| **Backend** | Cloudflare Workers (stateless) + DO (stateful) | Same infra as bifrost |
| **LOS Engine** | Custom parametric ray + MRPAS | Accurate Kill Team 1mm cylinder |
| **Testing** | Vitest + Miniflare | Unit tests for all rule logic |

### 9.2 Repository Structure

```
grim-gambit/
├── packages/
│   ├── game-engine/           # Pure rule logic (no rendering) — XState FSM
│   │   ├── src/
│   │   │   ├── rules/         # Core rules (shooting, fighting, movement)
│   │   │   ├── factions/      # All faction data files
│   │   │   ├── campaign/      # XCOM meta-layer logic
│   │   │   ├── ai/            # AI decision engine
│   │   │   └── schema/        # Zod schemas for all game state
│   │   └── tests/
│   ├── renderer/              # PixiJS v8 rendering layer
│   │   ├── src/
│   │   │   ├── scenes/        # Killzone, HQ, Globe scenes
│   │   │   ├── sprites/       # Operative, terrain, marker sprites
│   │   │   ├── ui/            # React/HTML overlay (HUD, menus)
│   │   │   └── effects/       # Visual FX (muzzle flash, explosion)
│   │   └── assets/            # Sprite atlases, tilesets, UI SVGs
│   ├── pwa/                   # Vite PWA shell, service worker config
│   └── server/                # Cloudflare Workers edge API
│       ├── src/
│       │   ├── session-do.ts  # GameSession Durable Object
│       │   ├── lobby.ts       # Matchmaking + lobby
│       │   └── api.ts         # REST API (save sync, leaderboard)
│       └── wrangler.toml
├── apps/
│   └── web/                   # Main web app (Vite + React)
├── docs/
│   ├── design/                # GDD (this file)
│   ├── rules/                 # Kill Team rules reference
│   └── api/                   # API documentation
├── scripts/
│   ├── asset-gen/             # Imagen 3 → sprite pipeline
│   └── data-gen/              # Faction data generator
└── tools/
    └── killzone-editor/       # In-browser map editor (Tiled wrapper)
```

### 9.3 Faction Data Format

Faction data stored as structured TypeScript/JSON files, one per kill team:
```
packages/game-engine/src/factions/
├── intercession-squad/
│   ├── index.ts               # Re-export
│   ├── operatives.ts          # All operative templates
│   ├── weapons.ts             # All weapon profiles
│   ├── ploys.ts               # Strategic + tactical ploys
│   └── equipment.ts           # Equipment options
├── veteran-guardsmen/
...
```

### 9.4 Asset Generation Pipeline

```
scripts/asset-gen/
├── generate.ts                # Main Imagen 3 API caller
├── prompts/
│   ├── operatives/            # Per-faction operative prompts
│   ├── terrain/               # Terrain tile prompts
│   └── ui/                    # UI element prompts
├── pipeline/
│   ├── postprocess.ts         # PNG cleanup, color quantization
│   ├── pack.ts                # TexturePacker sprite atlas generation
│   └── vectorize.ts           # Potrace SVG conversion for icons
└── output/                    # Generated atlases → packages/renderer/assets/
```

**Style guide for all generated assets**:
- Operative sprites: `"isometric top-down 2D game sprite, 128x128px canvas, Warhammer 40K [FACTION] aesthetic, cell-shaded flat colors, black outline 2px, white background, facing south-east, idle pose"`
- Terrain: `"isometric game tile 64x64px, sci-fi industrial/Gothic cathedral [THEME], cell-shaded, top-down 45 degree angle, [TERRAIN_TYPE], white background"`
- Icons: `"flat vector icon, 64x64px, minimalist, [ELEMENT] symbol, white background, 2-color palette"`

---

## 10. Development Phases

### Phase 0 — Foundation (Sprints 1–2)
- Monorepo scaffold (pnpm workspaces)
- PixiJS v8 rendering shell with isometric test scene
- XState FSM: complete game phase state machine (no faction data)
- Zod schemas for all game state types
- Vitest unit test suite for core rules (shooting, fighting, movement, LOS)
- PWA manifest + service worker (offline shell)

### Phase 1 — Core Rules Engine (Sprints 3–5)
- Complete rule automation: movement, shooting, fighting, LOS, cover, control range
- 3 founding factions: Intercession Squad, Veteran Guardsmen, Legionary
- Full game loop: 4 Turning Points, VP scoring, game end
- Standard Matched Play killzone (procedural terrain)
- Single-player vs Warrior AI

### Phase 2 — Faction Expansion + AI (Sprints 6–9)
- 7 additional factions (total 10)
- All 4 difficulty levels
- Champion + Legendary AI (evaluation function + lookahead)
- Faction-specific behavior archetypes
- 5 official killzones with terrain rules

### Phase 3 — Campaign Mode (Sprints 10–14)
- Stronghold facilities (all 9)
- Operative XP, Battle Honours, Battle Scars
- 12-mission campaign narrative
- Strategic region map
- Full resource system (Requisition, Intel, Scrap, Relics)
- Save system (IndexedDB, cloud sync optional)

### Phase 4 — Multiplayer (Sprints 15–18)
- Cloudflare DO GameSession
- PvP online lobby
- Co-op (shared kill team)
- PvPvE (multi-faction with AI)
- Async play with push notifications
- Spectator mode

### Phase 5 — Asset Full Render + Polish (Sprints 19–22)
- Full Imagen 3 asset generation (all factions, all terrain types)
- Animated sprites (idle, move, shoot, fight, incapacitate)
- Sound design (dice rolls, weapon fire, ambient)
- VFX (muzzle flash, explosion, dust, blood)
- Tutorial mode (full rules walkthrough with tooltips)
- Killzone editor (in-browser)

### Phase 6 — Remaining Factions + Launch (Sprints 23–26)
- All remaining official Kill Team factions
- Leaderboards + stats
- Campaign seasons / meta events
- Mobile PWA optimization
- App store submission (Capacitor wrapper if needed)

---

## 11. Swarm Task Architecture

### 11.1 Task Decomposition Strategy

Each development phase decomposes into parallel swarm tasks:
- **Independent leaf tasks**: Individual faction data files, individual rule implementations, individual UI components
- **Blocking tasks**: Game engine must pass tests before renderer wires up; server DO before multiplayer
- **Critical path**: Game engine → Core rules → AI → Campaign → Multiplayer

### 11.2 Coding Standards for Swarm Tasks

All swarm tasks must:
1. Use strict TypeScript with Zod validation on all external data
2. Write Vitest tests for all rule logic (min 80% coverage per file)
3. Follow naming: `kebab-case` files, `PascalCase` classes, `camelCase` functions
4. Validate against the game-engine schema before exporting
5. PR title format: `feat(grim-gambit): [component] — [description]`
6. Self-review checklist in PR body

### 11.3 Initial Task Batch (Ingest into PM)

```
EPIC: Foundation
  TASK: Scaffold monorepo (pnpm + Vite + TypeScript strict)
  TASK: Implement XState v5 game phase FSM (Strategy + Firefight phases)
  TASK: Implement Zod schemas for all game state types
  TASK: Implement core movement rules (Reposition, Dash, Fall Back, Charge)
  TASK: Implement LOS + cover + obscured engine (parametric ray)
  TASK: Implement shooting resolution engine (full automated sequence)
  TASK: Implement fight (melee) resolution engine (strike/block alternation)
  TASK: Implement CP + ploy system
  TASK: Implement VP scoring system (Crit Ops + Kill Ops + Tac Ops)
  TASK: Implement injury state tracking (healthy/wounded/injured/incapacitated)
  TASK: Implement PixiJS v8 rendering shell (isometric scene + camera)
  TASK: Implement operative sprite system (load atlas, animate, position)
  TASK: Implement terrain tile renderer (isometric multi-layer)
  TASK: Implement HUD overlay (React: operative stats, CP, VP tracks)
  TASK: Implement roster builder UI (operative selection + equipment)
  TASK: Implement Intercession Squad faction data (operatives + weapons + ploys)
  TASK: Implement Veteran Guardsmen faction data (operatives + weapons + ploys)
  TASK: Implement Legionary faction data (operatives + weapons + ploys)
  TASK: Implement Warrior AI (threat-based action selection)
  TASK: Implement Dexie.js persistence (save/load game state)
  TASK: Implement PWA service worker + manifest
  TASK: Imagen 3 asset generation script (operative sprites pipeline)
  TASK: Imagen 3 terrain tile generation (standard open killzone)
  TASK: Set up Cloudflare Worker API skeleton (wrangler + DO scaffold)
  TASK: Implement standard open killzone (procedural terrain generator)
```

---

## 12. Naming Conventions

Following bifrost project conventions adapted for Grim Gambit:

| Component | Name | Role |
|-----------|------|------|
| Game Engine core | `Wyrd-Engine` | XState FSM, rule resolution |
| Renderer | `Grim-Canvas` | PixiJS rendering layer |
| Faction data | `Lore-Codex` | Faction data files and loader |
| AI system | `Doom-Brain` | AI decision engine |
| Campaign system | `Crypt-Command` | XCOM meta-layer |
| Multiplayer server | `Shade-Session` | Cloudflare DO game session |
| Asset pipeline | `Rune-Render` | Imagen → sprite atlas pipeline |
| LOS engine | `Sight-Shade` | Line of sight + cover calculator |

---

## 13. Monetization (Future)

- **Free**: Core rules, 3 founding factions, 1 killzone, standard AI, PvP
- **Campaign Pack**: Full 12-mission campaign, all AI levels, procedural maps
- **Faction Packs**: Additional factions (individual or bundle)
- **Cosmetic**: Alternate operative skins, killzone visual themes
- **No pay-to-win**: All mechanical content either free or earned via campaign progression

---

*Document maintained by Grim Gambit development team. Last updated: 2026-03-10.*
