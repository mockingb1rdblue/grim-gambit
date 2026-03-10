# Grim Gambit — PM Ingestion Document

Project: Grim Gambit (Kill Team × XCOM PWA)
Repo: https://github.com/mockingb1rdblue/grim-gambit
Stack: TypeScript, PixiJS v8, XState v5, Zustand, Dexie.js, Vite PWA, Cloudflare Workers + DO

## EPIC 1: Foundation & Monorepo

### TASK 1.1: Scaffold monorepo
Type: chore | Priority: critical
Deps: none
Description: Initialize pnpm workspaces monorepo with packages: game-engine, renderer, server, pwa. Root tsconfig (strict), eslint (no-any, no-unsafe), prettier, vitest config. Add package.json workspaces array. Set up Vite for apps/web with vite-plugin-pwa (service worker + manifest). Add .github/workflows/ci.yml running tsc + vitest on push.
Files: package.json, pnpm-workspace.yaml, tsconfig.json, eslint.config.mjs, vitest.config.ts, vite.config.ts, .github/workflows/ci.yml

### TASK 1.2: Zod schemas for all game state
Type: feat | Priority: critical
Deps: 1.1
Description: Implement packages/game-engine/src/schema/index.ts exporting Zod schemas and TypeScript types for: OperativeSchema, WeaponSchema, PloySchema, EquipmentSchema, GameStateSchema, TurningPointSchema, VPTrackSchema, OrderSchema, ActionSchema, TerrainTileSchema, KillzoneSchema, CampaignStateSchema, StrongholdSchema, OperativeCampaignDataSchema. All schemas must be strict (no passthrough). Export inferred types from z.infer<>.
Files: packages/game-engine/src/schema/index.ts, packages/game-engine/src/schema/operative.ts, packages/game-engine/src/schema/game-state.ts, packages/game-engine/src/schema/campaign.ts

### TASK 1.3: XState v5 game phase FSM
Type: feat | Priority: critical
Deps: 1.2
Description: Implement packages/game-engine/src/fsm/game-machine.ts using XState v5 createMachine(). States: PREGAME → STRATEGY_PHASE (initiative_roll, ready_operatives, gambit_step) → FIREFIGHT_PHASE (select_operative, select_order, perform_actions, expend_operative, counteract) → TURNING_POINT_END (score_vp, check_end) → [loop x4] → GAME_END. Each state transition must emit typed events. Include guard conditions (e.g. allOperativesExpended, turningPointCount >= 4). Write Vitest tests for all valid and invalid state transitions.
Files: packages/game-engine/src/fsm/game-machine.ts, packages/game-engine/src/fsm/game-machine.test.ts

### TASK 1.4: Implement movement rules engine
Type: feat | Priority: high
Deps: 1.2, 1.3
Description: Implement packages/game-engine/src/rules/movement.ts with pure functions (no side effects): validateReposition(operative, destination, gameState) → ValidationResult, validateDash(operative, destination, gameState) → ValidationResult, validateFallBack(operative, destination, gameState) → ValidationResult, validateCharge(operative, destination, gameState) → ValidationResult, getValidMoveDestinations(operative, action, gameState) → Coordinate[]. Rules: Reposition requires not in enemy control range (unless ally also in control range). Dash: 3" fixed, not in enemy control range. Fall Back: 2 AP, must be in enemy control range. Charge: 1 AP, Engage order, end in enemy control range. All movement is in-inches using tile coordinates (1 tile = 0.5"). Write comprehensive Vitest tests including edge cases.
Files: packages/game-engine/src/rules/movement.ts, packages/game-engine/src/rules/movement.test.ts

### TASK 1.5: Implement LOS + cover + obscured engine
Type: feat | Priority: critical
Deps: 1.2
Description: Implement packages/game-engine/src/rules/los.ts. Core function: calculateLOS(attacker: Operative, target: Operative, killzone: Killzone) → { visible: boolean, obscured: boolean, inCover: boolean }. Algorithm: parametric ray from attacker head position to all points of target base. For each terrain tile intersected by the ray cylinder (1mm diameter): classify as heavy/light/blocking/exposed. Obscured = ray passes through heavy terrain >1" from both operatives. Cover = intervening terrain within 1" of target (when target not within 2" of attacker). Blocked = ray hits blocking terrain. Also implement: getControlRange(a: Operative, b: Operative, killzone: Killzone) → boolean. Write Vitest tests for all cover/obscured/blocked combinations.
Files: packages/game-engine/src/rules/los.ts, packages/game-engine/src/rules/los.test.ts

### TASK 1.6: Implement shooting resolution engine
Type: feat | Priority: critical
Deps: 1.5
Description: Implement packages/game-engine/src/rules/shooting.ts. Main function: resolveShot(attacker, target, weapon, gameState) → ShotResult. Steps: (1) validate shot legality (visible, Engage order, not in control range), (2) roll attacker dice (Atk count, apply modifiers), (3) apply obscured penalty (discard 1 success, downgrade crits to normal), (4) roll defender dice (DF count, apply save target), (5) apply cover save (1 auto-retained normal save if in cover), (6) resolve optimal defence allocation, (7) calculate unblocked damage, (8) return ShotResult with { damage, critDamage, normalDamage, savedDice, woundsDealt, modifiers[] }. Implement all weapon special rules: Accurate X, Lethal X, Piercing X, Ceaseless, Rending, Blast X, Silent, Fusillade, Devastating X, Hot. Write Vitest tests for each weapon special rule.
Files: packages/game-engine/src/rules/shooting.ts, packages/game-engine/src/rules/shooting.test.ts, packages/game-engine/src/rules/weapons.ts

### TASK 1.7: Implement fight (melee) resolution engine
Type: feat | Priority: high
Deps: 1.5
Description: Implement packages/game-engine/src/rules/fighting.ts. Main function: resolveFight(active: Operative, target: Operative, activeWeapon, targetWeapon, gameState) → FightResult. Steps: (1) validate fight legality (in control range), (2) calculate assisting bonus for each side, (3) both operatives roll simultaneously, (4) alternate strike/block resolution starting with active player, (5) for AI-controlled operatives: apply optimal strike/block strategy (greedy: strike if kill available, else block highest threat die), (6) return FightResult with full resolution trace. Also implement: getPossibleFightActions(active, target, activeDice, targetDice) → ('strike' | 'block')[] for UI prompting.
Files: packages/game-engine/src/rules/fighting.ts, packages/game-engine/src/rules/fighting.test.ts

### TASK 1.8: CP + ploy system
Type: feat | Priority: high
Deps: 1.3
Description: Implement packages/game-engine/src/rules/ploys.ts. Functions: getCPGrant(player, turningPoint, hasInitiative) → number (TP1: both get 1; subsequent: initiative=1, non-initiative=2), validatePloyUse(ploy, gameState) → ValidationResult (timing window check, CP check, once-per-check), applyPloy(ploy, gameState) → GameState (apply ploy effects). Ploy timing windows enum: GAMBIT_STEP, FIREFIGHT_ANY, ON_ACTIVATION, ON_SHOOTING, ON_FIGHTING, WHEN_INJURED. Command Re-roll universal ability as baseline. Schema for PloyEffect (stat modifier, action grant, dice re-roll, etc).
Files: packages/game-engine/src/rules/ploys.ts, packages/game-engine/src/rules/ploys.test.ts

### TASK 1.9: VP scoring system
Type: feat | Priority: high
Deps: 1.3
Description: Implement packages/game-engine/src/rules/vp.ts. Functions: scoreKillOps(gameState, turningPoint) → number (1 VP per incapacitated enemy; not TP1), scoreCritOps(mission, gameState, turningPoint) → number (mission-defined; not TP1), scoreTacOps(player, tacOp, gameState, turningPoint) → number (secret secondary; not TP1), revealTacOp(player, tacOp, commitment) → boolean (validate hash commitment). TacOp archetypes: SeekAndDestroy (3 options), Infiltration (3 options), IntelHarvest (3 options), DefendStronghold (3 options) — implement all 12 Tac Ops with scoring conditions. Cryptographic commitment: SHA-256(tacOpId + salt) stored at game start; revealed on first point scored.
Files: packages/game-engine/src/rules/vp.ts, packages/game-engine/src/rules/vp.test.ts, packages/game-engine/src/rules/tac-ops.ts

### TASK 1.10: Injury state tracking
Type: feat | Priority: high
Deps: 1.2
Description: Implement packages/game-engine/src/rules/injuries.ts. Functions: applyDamage(operative, damage, isCritical) → { operative: Operative, stateChange: StateChange | null }, getInjuredModifiers(operative) → { movePenalty: number, hitPenalty: number } (injured = -2" move, +1 to Hit target number), checkIncapacitation(operative) → boolean. State transitions: wounds > half_start → 'healthy', wounds > 0 && ≤ half_start → 'injured', wounds ≤ 0 → 'incapacitated'. On incapacitation: remove from killzone, trigger Kill Op VP check, roll campaign injury table if in campaign mode. Campaign injury table: D6 roll on incapacitation → (1-2) full recovery, (3-4) minor scar, (5) major scar, (6) critical injury.
Files: packages/game-engine/src/rules/injuries.ts, packages/game-engine/src/rules/injuries.test.ts

## EPIC 2: Faction Data

### TASK 2.1: Intercession Squad faction data
Type: feat | Priority: high
Deps: 1.2
Description: Implement packages/game-engine/src/factions/intercession-squad/. All operative templates from official wahapedia datacard: Intercessor Sergeant, Intercessor (various), Assault Intercessor, Reiver, Infiltrator (check wahapedia for exact current roster). Each operative: move, apl, ga, defence, save, wounds, all weapons with full profiles (Atk/Hit/Dmg/specials), all abilities. All ploys (strategic + tactical). All equipment options. Faction rules (Chapter Tactic variants or equivalent). Use Zod schemas from 1.2. Write Vitest test: roster builder produces legal team within constraints.
Files: packages/game-engine/src/factions/intercession-squad/operatives.ts, weapons.ts, ploys.ts, equipment.ts, index.ts

### TASK 2.2: Veteran Guardsmen faction data
Type: feat | Priority: high
Deps: 1.2
Description: Same scope as 2.1 but for Veteran Guardsmen (Astra Militarum). Includes: Guardsman Sergeant, Guardsman (various special weapons), Medic, Demo Expert, Comms Operator, Scout Sniper, Combat Engineer, heavy weapon options. Known for lots of operatives, orders system, fire-team structure. Check wahapedia for exact current roster and all ploys/equipment. Full Zod-validated datafiles.
Files: packages/game-engine/src/factions/veteran-guardsmen/operatives.ts, weapons.ts, ploys.ts, equipment.ts, index.ts

### TASK 2.3: Legionary faction data
Type: feat | Priority: high
Deps: 1.2
Description: Same scope as 2.1 but for Legionary (Chaos Space Marines). Includes: Legionary Aspiring Champion, Legionary (various marks/weapons), Balefire Acolyte, Shrivetalon, Undivided/Khorne/Nurgle/Tzeentch/Slaanesh marks affecting stats. Check wahapedia for exact roster and mark system. Full Zod-validated datafiles.
Files: packages/game-engine/src/factions/legionary/operatives.ts, weapons.ts, ploys.ts, equipment.ts, index.ts

### TASK 2.4: Lore-Codex faction loader
Type: feat | Priority: high
Deps: 2.1, 2.2, 2.3
Description: Implement packages/game-engine/src/factions/lore-codex.ts. FactionRegistry: singleton that loads and caches all faction data files. Methods: getFaction(id: FactionId) → FactionDatafile, listFactions() → FactionSummary[], validateRoster(faction, operatives, equipment) → ValidationResult. Implement RosterBuilder class: addOperative(template, weapons, equipment) → void, validateRoster() → ValidationResult, exportRoster() → Roster. All Zod-validated.
Files: packages/game-engine/src/factions/lore-codex.ts, packages/game-engine/src/factions/index.ts

## EPIC 3: Rendering Layer

### TASK 3.1: PixiJS v8 rendering shell
Type: feat | Priority: high
Deps: 1.1
Description: Implement packages/renderer/src/grim-canvas.ts. Initialize PixiJS Application (WebGPU preferred, WebGL2 fallback). Isometric scene setup: IsoScene class with coordinate transforms (tileToScreen, screenToTile), z-order sorting (tileX + tileY), camera pan/zoom controls. Implement render loop: requestAnimationFrame, delta time, dirty-flag partial updates. Container hierarchy: terrain layer → operative layer → effect layer → UI overlay layer. Implement InputManager: mouse/touch click → tile coordinate resolution, hover detection, drag-pan, pinch-zoom.
Files: packages/renderer/src/grim-canvas.ts, packages/renderer/src/iso-scene.ts, packages/renderer/src/input-manager.ts

### TASK 3.2: Terrain tile renderer
Type: feat | Priority: high
Deps: 3.1
Description: Implement packages/renderer/src/terrain/terrain-renderer.ts. Loads Tiled JSON killzone file. Renders isometric tilemap with multi-layer support (ground, objects, overlay). Implements height-based terrain: stacks tiles vertically with correct z-ordering. Terrain type to sprite mapping via terrain-sprites.ts config file. Click detection on terrain tiles for LOS preview. Highlight tiles for valid movement destinations. Cover/obscured visual indicators (glow effect on terrain providing cover).
Files: packages/renderer/src/terrain/terrain-renderer.ts, packages/renderer/src/terrain/terrain-sprites.ts

### TASK 3.3: Operative sprite system
Type: feat | Priority: high
Deps: 3.1
Description: Implement packages/renderer/src/operatives/operative-sprite.ts. Loads from sprite atlas (PixiJS Spritesheet). Animation states: idle, move (tween), shoot (flash + kickback), fight (clash), injured (slumped), incapacitated (removal tween). Per-faction sprite atlas loader. Status indicators: wound bar, order badge (Engage/Conceal icon), ready/expended indicator. Click/hover events emit to game engine. Smooth movement interpolation (ease-in-out tween on Reposition, snap on Charge).
Files: packages/renderer/src/operatives/operative-sprite.ts, packages/renderer/src/operatives/operative-pool.ts

### TASK 3.4: HUD overlay (React)
Type: feat | Priority: high
Deps: 3.1, 1.3
Description: Implement apps/web/src/ui/hud/. React components (thin HTML overlay on top of PixiJS canvas): OperativePanel (selected operative stats: M/APL/GA/DF/SV/W, wound bar, weapons list, order badge), VPTracker (3 tracks, per-player, per-turning-point), CPDisplay (per-player CP count), TurningPointBanner (TP1-4 + phase indicator), ActionMenu (available actions for selected operative with AP cost), PloyPanel (available ploys with CP cost + timing), ShotPreview (before confirming shot: expected damage range, save odds), FightPreview (before confirming fight: expected outcomes). Connect to Zustand store (mirror of XState game state for UI).
Files: apps/web/src/ui/hud/OperativePanel.tsx, VPTracker.tsx, ActionMenu.tsx, PloyPanel.tsx, ShotPreview.tsx

## EPIC 4: AI System

### TASK 4.1: Warrior AI (threat-based)
Type: feat | Priority: high
Deps: 1.4, 1.5, 1.6, 1.7
Description: Implement packages/game-engine/src/ai/warrior-ai.ts. AIController class with method selectAction(operative, gameState) → Action. Evaluation: for each legal action, compute ActionScore = { threatDelta, positionScore, objectiveScore }. ThreatDelta = (expected damage dealt to highest-threat enemy) - (expected incoming damage from current position). PositionScore = inCover bonus + controlZoneBonus - controlRangeExposurePenalty. ObjectiveScore = proximity to nearest uncontrolled objective. Select action with highest composite score. No ploy usage at Warrior level. Fallback: move toward nearest objective. Write Vitest tests for valid action selection in standard scenarios.
Files: packages/game-engine/src/ai/warrior-ai.ts, packages/game-engine/src/ai/evaluator.ts, packages/game-engine/src/ai/ai.test.ts

## EPIC 5: Campaign System

### TASK 5.1: Stronghold facilities system
Type: feat | Priority: medium
Deps: 1.2
Description: Implement packages/game-engine/src/campaign/stronghold.ts. All 9 facilities with upgrade tiers I–III. Facility interface: { id, name, tier, unlockCost, effects: FacilityEffect[] }. FacilityEffect types: reduce_recovery_time, unlock_equipment, accelerate_xp, reveal_mission_intel, increase_carry_capacity, manufacturing_slot. Apothecarion: tier I = -1 mission recovery, II = -2, III = immediate recovery. Research queue: Scriptorium processes one research per mission. Manufacturing queue: Armoury produces equipment over N missions. Resource tracking: Requisition, Intel, Scrap, Relics.
Files: packages/game-engine/src/campaign/stronghold.ts, packages/game-engine/src/campaign/facilities.ts, packages/game-engine/src/campaign/resources.ts

### TASK 5.2: Operative XP + Battle Honours
Type: feat | Priority: medium
Deps: 1.2, 1.10
Description: Implement packages/game-engine/src/campaign/progression.ts. XP awards per mission: kill=1XP, objective=1XP, mission_success=2XP. Level thresholds: 0/3/6/10/15. On level up: draw 2 Battle Honours from faction pool + 2 from universal pool (player chooses 1). Battle Honours pool: stat improvements (+1 Move, +1 APL (capped at 4), -1 SV, +1 Wounds) + ability unlocks (re-roll one attack die, ignore cover once, +1 Atk on one weapon). Battle Scars on incapacitation: D6 → full recovery (1-2), minor scar (-1 stat, removable) (3-4), major scar (-1 stat, permanent + cosmetic) (5), critical injury (major scar + miss 2 missions) (6). Apothecarion treatment: costs 1 Requisition per scar tier.
Files: packages/game-engine/src/campaign/progression.ts, packages/game-engine/src/campaign/battle-honours.ts, packages/game-engine/src/campaign/battle-scars.ts

### TASK 5.3: Campaign mission structure
Type: feat | Priority: medium
Deps: 5.1, 5.2
Description: Implement packages/game-engine/src/campaign/campaign.ts. CampaignManager: tracks missions_completed, current_act (1-3), region_threat_levels, available_missions. Mission types: Ambush (aggressive, high reward), Recon (low risk, Intel gain), Raid (moderate risk, specific target), Garrison (defensive, resist threat growth), Crisis (story gated, milestone). Act structure: Act1 = 4 missions (any 3 of 5 available), Act2 = 5 missions (any 4 of 7), Act3 = 3 missions (1 final boss). Mission expiry: Recon/Garrison missions expire after 2 turns of inaction → threat level rises. Boss mission: final enemy faction leader, buffed operative stats, unique terrain.
Files: packages/game-engine/src/campaign/campaign.ts, packages/game-engine/src/campaign/missions.ts, packages/game-engine/src/campaign/map.ts

## EPIC 6: Multiplayer Server

### TASK 6.1: Cloudflare DO GameSession
Type: feat | Priority: medium
Deps: 1.1, 1.3
Description: Implement packages/server/src/session-do.ts. Durable Object class GameSession. SQLite tables: game_state (full serialized GameState), action_log (ordered action history), players (playerId, faction, connected). WebSocket handler: on message, validate action against rule engine (import game-engine package), apply to state, broadcast update to all connected clients. Reconnection: on connect, send full current state. Heartbeat: 30s ping. Session expiry: alarm at 48h after last action. TypeScript strict, all messages Zod-validated.
Files: packages/server/src/session-do.ts, packages/server/wrangler.toml, packages/server/src/api.ts

## EPIC 7: Asset Generation

### TASK 7.1: Imagen 3 operative sprite pipeline
Type: feat | Priority: medium
Deps: 1.1
Description: Implement scripts/asset-gen/generate-operatives.ts. Uses Google Imagen 3 API (GEMINI_API_KEY from env). For each operative template in specified faction: construct styled prompt (isometric, 128×128, Kill Team aesthetic, faction colors), call generateImage(), save PNG to scripts/asset-gen/output/operatives/[faction]/[name]/[state].png. Animation states: idle, move, shoot, fight, injured, dead. Post-process: extract sprite, add to sprite atlas using spritesmith or sharp, output {faction}-atlas.png + {faction}-atlas.json (PixiJS Spritesheet format). Implement --faction flag to generate one faction at a time. Add --dry-run flag that logs prompts without calling API.
Files: scripts/asset-gen/generate-operatives.ts, scripts/asset-gen/prompts/operative-style.ts, scripts/asset-gen/pipeline/pack-atlas.ts

### TASK 7.2: Imagen 3 terrain tile pipeline
Type: feat | Priority: medium
Deps: 7.1
Description: Implement scripts/asset-gen/generate-terrain.ts. Generates isometric terrain tiles for standard open killzone: floor tiles (rockcrete, metal grating, dirt), heavy terrain (ruins wall, barricade, crate stack, generator), light terrain (barrels, sandbags, razor wire), vantage point (elevated platform, catwalk). All tiles: 64×64px canvas, isometric 2:1 diamond tile perspective, consistent lighting (top-left source), cell-shaded style. Output terrain-atlas.png + terrain-atlas.json. Also generate: objective marker (40mm base, glowing icon), deployment zone overlay tiles.
Files: scripts/asset-gen/generate-terrain.ts, scripts/asset-gen/prompts/terrain-style.ts

## EPIC 8: PWA + Persistence

### TASK 8.1: PWA service worker + manifest
Type: feat | Priority: high
Deps: 1.1
Description: Configure vite-plugin-pwa in apps/web/vite.config.ts. Web app manifest: name="Grim Gambit", short_name="GG", display="fullscreen", background_color="#0a0a0a", theme_color="#8b0000", icons (192px + 512px maskable). Service worker strategy: CacheFirst for all static assets (game engine JS, sprite atlases, tile data); NetworkFirst with IndexedDB fallback for cloud save sync; BackgroundSync for multiplayer action queue. Register service worker in apps/web/src/main.ts. Implement PWA install prompt: detect beforeinstallprompt, show banner after 2nd session. Test offline mode: full single-player gameplay with no network.
Files: apps/web/vite.config.ts, apps/web/src/pwa.ts, apps/web/public/manifest.json

### TASK 8.2: Dexie.js persistence layer
Type: feat | Priority: high
Deps: 1.2
Description: Implement packages/game-engine/src/persistence/save-manager.ts using Dexie.js. Database schema: campaigns (id, name, faction, createdAt, updatedAt), missions (id, campaignId, state, result), game_states (missionId, state, actionLog, timestamp), rosters (id, faction, operatives, equipment). Methods: saveGameState(missionId, state) → void (debounced 1s), loadGameState(missionId) → GameState | null, saveCampaign(campaign) → void, loadCampaign(id) → CampaignState | null, listCampaigns() → CampaignSummary[], deleteOldSaves(keepLast: number) → void. Auto-save on every state transition.
Files: packages/game-engine/src/persistence/save-manager.ts, packages/game-engine/src/persistence/db-schema.ts

## EPIC 9: Standard Killzone

### TASK 9.1: Standard Open killzone generator
Type: feat | Priority: high
Deps: 1.2
Description: Implement packages/game-engine/src/maps/killzone-generator.ts. Generates valid standard open killzone (22"×30" board = 44×60 tiles at 2 tiles/inch). Parameters: density (light/medium/heavy), symmetry (symmetric/asymmetric), theme (industrial/ruins/wasteland). Terrain placement rules: minimum 3" from each deployment zone for heavy terrain, deployment zone must have light terrain for initial concealment, create fire lanes between terrain clusters, minimum 1 and maximum 3 vantage points. Output: KillzoneData (Tiled-compatible JSON). Include 5 handcrafted preset killzones as named exports.
Files: packages/game-engine/src/maps/killzone-generator.ts, packages/game-engine/src/maps/presets.ts, packages/game-engine/src/maps/terrain-rules.ts
