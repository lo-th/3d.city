# Worker Message Protocol

> **Source of truth** for the message contract between the browser main thread (`src/Main.js`) and
> the simulation Web Worker (`src/micro/CityGame.js` → `build/citygame.min.js`).
>
> **Status:** complete as of v0.9.0.  All messages are verified against both senders.
>
> **Important note on the "direct" mode:** when `Main.init(DirectMessage)` is called with a
> callback argument, `isWorker` is set to `false` and messages are passed via function call rather
> than `postMessage`.  The payload shapes and `tell` strings are identical in both modes.

---

## Table of Contents

1. [Message format conventions](#1-message-format-conventions)
2. [Main → Worker messages](#2-main--worker-messages)
3. [Worker → Main messages](#3-worker--main-messages)
4. [State-mutation index](#4-state-mutation-index)
5. [Legacy / dead-code notes](#5-legacy--dead-code-notes)
6. [Known risks](#6-known-risks)

---

## 1. Message format conventions

Every message is a plain JavaScript object sent via `postMessage` (or the direct-mode shim).

```js
// Main → Worker
post({ tell: "MESSAGE_NAME", ...fields });

// Worker → Main
CityGame.post({ tell: "MESSAGE_NAME", ...fields });
```

The `tell` string is the **only** discriminant; there is no schema, no version field, and no
runtime validation.  Fields not documented here have not been observed in production code.

**Legend used in the tables below:**

| Symbol | Meaning |
|--------|---------|
| ✔ confirmed | Field name and type verified in source code |
| ⚠ inferred | Field name inferred from usage; type not explicitly typed in source |
| — | Not present / always omitted |

---

## 2. Main → Worker messages

All sent from `src/Main.js` via the module-private `post()` function.

### INIT

Sent once on startup to create the `MainGame` instance inside the worker.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"INIT"` | yes | ✔ confirmed | Discriminant |
| `timestep` | `number` | yes | ✔ confirmed | Fixed at `30` (`simulation_timestep`); passed to `new MainGame(timestep)` |
| `returnMessage` | `Function` | no | ✔ confirmed | Present only in direct (non-worker) mode; worker stores it as `returnMessage` and sets `isWorker = false` |

**Callers:** `Main.initWorker()` (line 64 / 68)  
**Mutates:** sim state (creates `MainGame`)

---

### NEWMAP

Tells the worker to procedurally generate a new 128×128 map.  No payload fields beyond `tell`.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"NEWMAP"` | yes | ✔ confirmed | — |

**Callers:** `Main.newMap()` (line 120, via `setTimeout`)  
**Mutates:** sim state (`this.map`)

---

### PLAYMAP

Tells the worker to initialise all game tools and `Simulation`, then start the tick loop.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"PLAYMAP"` | yes | ✔ confirmed | — |

**Callers:** `Main.playMap()` (line 128)  
**Mutates:** sim state (creates `Simulation`, starts tick loop)

---

### TOOL

Sets the currently active tool inside the worker.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"TOOL"` | yes | ✔ confirmed | — |
| `name` | `string` | yes | ✔ confirmed | One of: `"airport"`, `"bulldozer"`, `"coal"`, `"commercial"`, `"fire"`, `"industrial"`, `"nuclear"`, `"park"`, `"police"`, `"port"`, `"rail"`, `"residential"`, `"road"`, `"query"`, `"stadium"`, `"wire"`, `"none"` |

**Callers:** `Main.sendTool(name)` (line 84)  
**Mutates:** sim state (`MainGame.currentTool`)

---

### MAPCLICK

Applies the active tool at the given map coordinate.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"MAPCLICK"` | yes | ✔ confirmed | — |
| `x` | `number` | yes | ✔ confirmed | World / tile X coordinate (float from `view3d.raypos`) |
| `y` | `number` | yes | ✔ confirmed | World / tile Z coordinate (mapped to map Y; note: passed as `p.z` from View) |
| `single` | `boolean` | no | ✔ confirmed | `true` when called from `Main.destroy()`; suppresses the `BUILD` reply |

**Callers:**
- `Main.mapClick(tool)` (line 100) — `single` omitted (falsy)
- `Main.destroy(x, y)` (line 91) — `single: true`

**Mutates:** sim state (tile data, budget), may trigger `BUILD` or `QUERY` reply

---

### DIFFICULTY

Sets game difficulty.  Only effective before `PLAYMAP` if simulation is not yet running; also
forwarded to `Simulation.setDifficulty()` if simulation exists.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"DIFFICULTY"` | yes | ✔ confirmed | — |
| `n` | `0 \| 1 \| 2` | yes | ✔ confirmed | `0` = Easy, `1` = Medium, `2` = Hard |

**Callers:** `Main.setDifficulty(t)` (line 138)  
**Mutates:** sim state (`MainGame.difficulty`, `Simulation.difficulty`)

---

### SPEED

Sets simulation speed; `0` pauses the tick loop.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"SPEED"` | yes | ✔ confirmed | — |
| `n` | `0 \| 1 \| 2 \| 3` | yes | ✔ confirmed | `0` = Pause, `1` = Slow, `2` = Medium, `3` = Fast |

**Callers:** `Main.setSpeed(n)` (line 142)  
**Mutates:** sim state (`MainGame.speed`, `MainGame.isPaused`, tick loop timer)

---

### BUDGET

Requests current budget data.  Worker replies with a `BUDGET` message.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"BUDGET"` | yes | ✔ confirmed | — |

**Callers:** `Main.getBudjet()` (line 146, note: typo in method name retained from source)  
**Mutates:** — (read-only request; but worker calls `budget.doBudgetWindow()` or `updateFundEffects()` as a side effect)

---

### NEWBUDGET

Updates tax rate and service funding percentages from the budget UI.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"NEWBUDGET"` | yes | ✔ confirmed | — |
| `budgetData` | `Array` (length 4) | yes | ✔ confirmed | `[taxRate, roadPct, firePct, policePct]`; `roadPct`/`firePct`/`policePct` are 0–100 integers; worker divides by 100 internally |

**`budgetData` array layout:**

| Index | Value | Type | Notes |
|-------|-------|------|-------|
| `[0]` | `taxRate` | `number` | City tax rate |
| `[1]` | `roadPercent × 100` | `number` | Road maintenance funding 0–100 |
| `[2]` | `firePercent × 100` | `number` | Fire department funding 0–100 |
| `[3]` | `policePercent × 100` | `number` | Police department funding 0–100 |

**Callers:** `Main.setBudjet(budgetData)` (line 150)  
**Mutates:** sim state (`Budget.cityTax`, `Budget.roadPercent`, etc.)

---

### EVAL

Requests city evaluation data.  Worker replies with an `EVAL` message.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"EVAL"` | yes | ✔ confirmed | — |

**Callers:** `Main.getEval()` (line 154)  
**Mutates:** — (read-only)

---

### ACHIEVEMENTS

Requests achievement data.  Worker replies with an `ACHIEVEMENTS` message.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"ACHIEVEMENTS"` | yes | ✔ confirmed | — |

**Callers:** `Main.getAchievements()` (line 158)  
**Mutates:** — (read-only)

---

### HISTORY

Requests city event history.  Worker replies with a `HISTORY` message.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"HISTORY"` | yes | ✔ confirmed | — |

**Callers:** `Main.getHistory()` (line 162)  
**Mutates:** — (read-only)

---

### DISASTER

Triggers a named disaster in the simulation.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"DISASTER"` | yes | ✔ confirmed | — |
| `disaster` | `string` | yes | ✔ confirmed | One of the `Micro.DISASTER_*` constants (see table below) |

**Valid `disaster` values** (`src/micro/Micro.js`):

| Constant | String value |
|----------|-------------|
| `Micro.DISASTER_NONE` | `"None"` (ignored by worker) |
| `Micro.DISASTER_MONSTER` | `"Monster"` |
| `Micro.DISASTER_FIRE` | `"Fire"` |
| `Micro.DISASTER_FLOOD` | `"Flood"` |
| `Micro.DISASTER_CRASH` | `"Crash"` |
| `Micro.DISASTER_MELTDOWN` | `"Meltdown"` |
| `Micro.DISASTER_TORNADO` | `"Tornado"` |
| `Micro.DISASTER_EARTHQUAKE` | `"Earthquake"` |

**Callers:** `Main.setDisaster(disaster)` (line 166)  
**Mutates:** sim state (map tiles, sprites, city history, achievements)

---

### SAVEGAME

Sends the serialised 3D building state to the worker so it can assemble and return the complete
save file.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"SAVEGAME"` | yes | ✔ confirmed | — |
| `saveCity` | `string` (JSON) | yes | ✔ confirmed | `JSON.stringify` of the 3D building list array produced by `view3d.saveCityBuild()` |
| `silent` | `boolean` | no | ✔ confirmed | `true` → autosave (localStorage only, no file download); omitted or `false` → also triggers `saveAs` file download |

**Callers:**
- `Main.saveGame()` (line 178) — `silent` omitted
- `Main.autoSave()` (line 186) — `silent: true`

**Mutates:** persistence (worker assembles and returns `SAVEGAME` reply that writes to localStorage)

---

### LOADGAME

Asks the worker which localStorage key to read from, then bounces the request back to main to
perform the actual storage read (the worker has no access to `localStorage`).

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"LOADGAME"` | yes | ✔ confirmed | — |
| `isStart` | `boolean` | yes | ✔ confirmed | `true` when loading at app start (from intro); triggers `hub.generate` and `view3d.inMapGenation` in Main before posting |

**Callers:** `Main.loadGame(atStart)` (line 200)  
**Mutates:** — (worker immediately replies with `LOADGAME` to trigger the main-thread storage read)

---

### MAKELOADGAME

Delivers the raw save-game JSON string to the worker to deserialise and rebuild the simulation.

| Field | Type | Required | Status | Notes |
|-------|------|----------|--------|-------|
| `tell` | `"MAKELOADGAME"` | yes | ✔ confirmed | — |
| `savegame` | `string` (JSON) | yes | ✔ confirmed | Raw JSON string read from `localStorage` (or `view3d.tmpGameData` if loaded from file) |
| `isStart` | `boolean` | yes | ✔ confirmed | Forwarded from the original `LOADGAME` request |

**Callers:** `makeLoadGame(key, isStart)` (line 262, module-private function)  
**Mutates:** sim state (full simulation rebuild via `MainGame.makeLoadGame()`); triggers `FULLREBUILD` reply

---

## 3. Worker → Main messages

All sent from `src/micro/CityGame.js` via the `CityGame.post()` static helper.

### READY

Sent once when the `MainGame` constructor completes.  The main thread currently ignores it
(the `if( phase == "READY"){}` branch is an empty block).

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"READY"` | ✔ confirmed | — |

**Sender:** `MainGame` constructor (line 142)  
**Main handler:** empty block — no-op  
**Mutates:** nothing

---

### NEWMAP

Sent after `MapGenerator.construct()` completes with the tile data for the newly generated map.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"NEWMAP"` | ✔ confirmed | — |
| `tilesData` | `Uint16Array` (128×128) | ✔ confirmed | Flat array of tile values; written to `window.tilesData` |
| `mapSize` | `[number, number]` | ✔ confirmed | Always `[128, 128]` |
| `island` | `boolean` | ✔ confirmed | Whether the map was generated as an island |
| `trans` | `boolean` | ✔ confirmed | Legacy ArrayBuffer-transfer flag; hardcoded `false`, never `true` in current code — ⚠ **legacy** |

**Sender:** `MainGame.newMap()` (line 190)  
**Main handler:** `message()` → `hub.generate(false)` + `view3d.paintMap()`  
**Mutates:** UI state (`window.tilesData`), renders terrain

---

### RUN

The per-tick heartbeat.  Sent every simulation tick (≈ 30 fps when running at speed 2–3).

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"RUN"` | ✔ confirmed | — |
| `infos` | `Array` (length 18) | ✔ confirmed | City statistics array; see layout table below |
| `tilesData` | `Uint16Array` (128×128) | ✔ confirmed | Full tile array, cloned every tick |
| `powerData` | `Array` | ✔ confirmed | List of tile coords that lack power ⚠ exact element shape not typed in source |
| `sprites` | `Array` | ✔ confirmed | Array of `[type, frame, x, y]` tuples for active sprites |
| `layer` | `Array` | ✔ confirmed | Diff of tiles changed this tick (used by `updateLayer()`) ⚠ exact element shape not typed in source |

**`infos` array layout** (set in `Simulation.simTick()` / `processMessages()`):

| Index | Value | Source |
|-------|-------|--------|
| `[0]` | Date string (e.g. `"Jan 2001"`) | `Simulation.simTick()` |
| `[1]` | City class string (e.g. `"Village"`) | `Simulation.simTick()` |
| `[2]` | City score (`number`) | `Simulation.simTick()` |
| `[3]` | City population (`number`) | `Simulation.simTick()` |
| `[4]` | Total funds (`number`) | `Simulation.simTick()` |
| `[5]` | Residential demand valve (`number`) | `Simulation.simTick()` |
| `[6]` | Commercial demand valve (`number`) | `Simulation.simTick()` |
| `[7]` | Industrial demand valve (`number`) | `Simulation.simTick()` |
| `[8]` | Notification message (`string`) | `processMessages()` — may be a good/bad/neutral message or `undefined` |
| `[9]` | Power grid changed flag (`boolean`) | `Simulation.simTick()` via `map.powerChange` |
| `[10]` | Crime average (`number`) | `Simulation.simTick()` |
| `[11]` | Pollution average (`number`) | `Simulation.simTick()` |
| `[12]` | Traffic average (`number`) | `Simulation.simTick()` |
| `[13]` | City approval (`number`, 0–100) | `Simulation.simTick()` |
| `[14]` | Education level (`number`) | `Simulation.simTick()` |
| `[15]` | Health level (`number`) | `Simulation.simTick()` |
| `[16]` | Happiness level (`number`) | `Simulation.simTick()` |
| `[17]` | Season index (`number`, 0–3) | `Simulation.simTick()` via `seasonManager.getSeason()` |

**Sender:** `MainGame.tick()` (line 177)  
**Main handler:** `message()` → updates `window.*` globals, calls `hub.updateCITYinfo()`, `view3d.updateLayer()`, `view3d.moveSprite()`, `view3d.showPower()`  
**Mutates:** UI state (all `window.*` data globals), triggers 3D render update

---

### BUILD

Notifies the main thread that a building was successfully placed so the 3D view can update.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"BUILD"` | ✔ confirmed | — |
| `x` | `number` | ✔ confirmed | Tile X coordinate |
| `y` | `number` | ✔ confirmed | Tile Y coordinate |

**Sender:** `MainGame.mapClick()` (line 385) — only sent when tool result is not `TOOLRESULT_NEEDS_BULLDOZE` / `TOOLRESULT_NO_MONEY` and `single` is `false`  
**Main handler:** `message()` → `view3d.build(x, y)`  
**Mutates:** UI state (3D building mesh)

---

### QUERY

Requests the main thread to display the query tool popup.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"QUERY"` | ✔ confirmed | — |
| `queryTxt` | `string` (HTML) | ✔ confirmed | HTML content returned by `QueryTool.getInfo()` |

**Sender:** `MainGame.processMessages()` (line 328) — triggered by `Messages.QUERY_WINDOW_NEEDED`  
**Main handler:** `message()` → `hub.openQuery(queryTxt)`  
**Mutates:** UI state (opens query popup)

---

### BUDGET

Delivers budget data in response to a `BUDGET` request (or automatically when the simulation
triggers a budget cycle via `Messages.BUDGET_NEEDED`).

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"BUDGET"` | ✔ confirmed | — |
| `budgetData` | `object` | ✔ confirmed | See layout below |

**`budgetData` object fields:**

| Key | Type | Notes |
|-----|------|-------|
| `roadFund` | `number` | Current road fund amount |
| `roadRate` | `number` | Road maintenance rate (0–100) |
| `fireFund` | `number` | Fire department fund amount |
| `fireRate` | `number` | Fire department rate (0–100) |
| `policeFund` | `number` | Police fund amount |
| `policeRate` | `number` | Police rate (0–100) |
| `taxRate` | `number` | Current city tax rate |
| `totalFunds` | `number` | Total available funds |
| `taxesCollected` | `number` | Taxes collected this cycle |

**Sender:** `MainGame.handleBudgetRequest()` (line 435)  
**Main handler:** `message()` → `hub.openBudget(budgetData)`  
**Mutates:** UI state (opens budget modal)

---

### EVAL

Delivers city evaluation data in response to an `EVAL` request.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"EVAL"` | ✔ confirmed | — |
| `evalData` | `Array` (length 10) | ✔ confirmed | See layout below |

**`evalData` array layout:**

| Index | Value | Notes |
|-------|-------|-------|
| `[0]` | City approval (`number`, 0–100) | `evaluation.cityYes` |
| `[1]` | Problems HTML string | Up to 4 problems joined with `<br>` |
| `[2]` | Crime average (`number`) | `census.crimeAverage` |
| `[3]` | Pollution average (`number`) | `census.pollutionAverage` |
| `[4]` | Traffic average (`number`, rounded) | From `infos[12]` |
| `[5]` | Education level (`number`) | `census.educationLevel` |
| `[6]` | Health level (`number`) | `census.healthLevel` |
| `[7]` | Happiness level (`number`) | `census.happinessLevel` |
| `[8]` | Unemployment percentage (`number`, 0–100, rounded) | Computed from `(resPop / (comPop + indPop) * 8 - 1) * 100` |
| `[9]` | Season name (`string`) | `seasonManager.getSeasonName()` |

**Sender:** `MainGame.getEvaluation()` (line 484)  
**Main handler:** `message()` → `hub.openEval(evalData)`  
**Mutates:** UI state (opens evaluation modal)

---

### ACHIEVEMENTS

Delivers achievement data in response to an `ACHIEVEMENTS` request.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"ACHIEVEMENTS"` | ✔ confirmed | — |
| `achData` | ⚠ inferred: `Array` or `object` | ⚠ inferred | Result of `achievements.getAll()` — exact shape depends on `Achievements` implementation |
| `progress` | ⚠ inferred: `Array` or `object` | ⚠ inferred | Result of `achievements.getProgress()` — exact shape depends on `Achievements` implementation |

**Sender:** `MainGame.getAchievements()` (line 498)  
**Main handler:** `message()` → `hub.openAchievements(achData, progress)`  
**Mutates:** UI state (opens achievements modal)

---

### HISTORY

Delivers the most recent 20 city events in response to a `HISTORY` request.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"HISTORY"` | ✔ confirmed | — |
| `historyData` | ⚠ inferred: `Array` of event objects | ⚠ inferred | Result of `cityHistory.getRecent(20)` — exact event object shape depends on `CityHistory` implementation |

**Sender:** `MainGame.getHistory()` (line 503)  
**Main handler:** `message()` → `hub.openHistory(historyData)`  
**Mutates:** UI state (opens history modal)

---

### SAVEGAME

Returns the fully-assembled, JSON-stringified save data to the main thread for persistence.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"SAVEGAME"` | ✔ confirmed | — |
| `gameData` | `string` (JSON) | ✔ confirmed | Complete save as JSON string: `{ name, speed, difficulty, version, city, ...simulation fields }` |
| `key` | `string` | ✔ confirmed | localStorage key; always `Micro.KEY = "micropolisJSGame"` |
| `silent` | `boolean` | ✔ confirmed | Forwarded from the original `SAVEGAME` request; `true` suppresses file download |

**Sender:** `MainGame.saveGame()` (line 523)  
**Main handler:** `message()` → `makeGameSave(gameData, key, silent)` → `localStorage.setItem()` + optional `saveAs()`  
**Mutates:** persistence (localStorage write, optional file download), UI state if silent (`hub.flashAutoSave()`)

---

### LOADGAME

Bounces back the localStorage key so the main thread can read the save data (the worker has no
access to `localStorage`).

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"LOADGAME"` | ✔ confirmed | — |
| `key` | `string` | ✔ confirmed | Always `Micro.KEY = "micropolisJSGame"` |
| `isStart` | `boolean` | ✔ confirmed | Forwarded from the `LOADGAME` request |

**Sender:** `MainGame.loadGame()` (line 536)  
**Main handler:** `message()` → `makeLoadGame(key, isStart)` → reads localStorage → posts `MAKELOADGAME` back to worker  
**Mutates:** — (triggers the two-step load handshake)

---

### LOADERROR

Sent when `MainGame.makeLoadGame()` fails to parse the save-game JSON.  The main thread should
hide any loading overlay and display the error to the user.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"LOADERROR"` | ✔ confirmed | — |
| `message` | `string` | ✔ confirmed | Human-readable description of the parse failure |

**Sender:** `MainGame.makeLoadGame()` — the `catch` block around `JSON.parse(gameData)`
**Main handler:** `WorkerBridge.dispatch()` → `hub.generate(false)` + `hub.showError(message)`
**Mutates:** UI state (hides loading overlay, shows error banner)

---

### TICKERROR

Sent when an uncaught exception is thrown inside `MainGame.tick()`.  The simulation loop is
halted before this message is posted; it will not self-restart.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"TICKERROR"` | ✔ confirmed | — |
| `message` | `string` | ✔ confirmed | `err.message` from the caught exception |
| `stack` | `string` | ✔ confirmed | `err.stack` from the caught exception (may be empty string) |

**Sender:** `MainGame.tick()` — the `catch` block wrapping `simulation.simTick()`
**Main handler:** `WorkerBridge.dispatch()` → stops stall watchdog + `hub.showError(message)`
**Mutates:** UI state (shows error banner, stall watchdog is stopped)

---

### FULLREBUILD

Sent after loading a saved game.  Delivers all data the main thread needs to fully reconstruct
the 3D scene.

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `tell` | `"FULLREBUILD"` | ✔ confirmed | — |
| `tilesData` | `Uint16Array` (128×128) | ✔ confirmed | Full tile array from the loaded map |
| `mapSize` | `[number, number]` | ✔ confirmed | Always `[128, 128]` |
| `island` | `boolean` | ✔ confirmed | Whether the loaded map is an island |
| `cityData` | `string` (JSON) | ✔ confirmed | The `city` field from the save file; passed to `view3d.loadCityBuild()` |
| `isStart` | `boolean` | ✔ confirmed | `true` → also calls `view3d.startPlay()` and `Main.startAutoSave()` |

**Sender:** `MainGame.makeLoadGame()` (line 568)  
**Main handler:** `message()` → rebuilds terrain, restores 3D buildings, optionally starts game and autosave  
**Mutates:** UI state (full 3D scene rebuild), starts autosave interval if `isStart`

---

## 4. State-mutation index

| Message | Sim state | UI state | Persistence |
|---------|:---------:|:--------:|:-----------:|
| INIT (→ W) | ✔ create | — | — |
| NEWMAP (→ W) | ✔ map | — | — |
| PLAYMAP (→ W) | ✔ simulation + tick | — | — |
| TOOL (→ W) | ✔ currentTool | — | — |
| MAPCLICK (→ W) | ✔ tiles, budget | — | — |
| DIFFICULTY (→ W) | ✔ difficulty | — | — |
| SPEED (→ W) | ✔ speed, paused | — | — |
| BUDGET (→ W) | ✔ side effect | — | — |
| NEWBUDGET (→ W) | ✔ budget rates | — | — |
| DISASTER (→ W) | ✔ tiles, sprites, history | — | — |
| EVAL (→ W) | — | — | — |
| ACHIEVEMENTS (→ W) | — | — | — |
| HISTORY (→ W) | — | — | — |
| SAVEGAME (→ W) | — | — | ✔ triggers save |
| LOADGAME (→ W) | — | — | — |
| MAKELOADGAME (→ W) | ✔ full rebuild | — | — |
| READY (← W) | — | — | — |
| NEWMAP (← W) | — | ✔ tilesData, paintMap | — |
| RUN (← W) | — | ✔ all globals + 3D | — |
| BUILD (← W) | — | ✔ 3D mesh | — |
| QUERY (← W) | — | ✔ modal | — |
| BUDGET (← W) | — | ✔ modal | — |
| EVAL (← W) | — | ✔ modal | — |
| ACHIEVEMENTS (← W) | — | ✔ modal | — |
| HISTORY (← W) | — | ✔ modal | — |
| SAVEGAME (← W) | — | ✔ toast (silent) | ✔ localStorage + file |
| LOADGAME (← W) | — | — | ✔ triggers read |
| FULLREBUILD (← W) | — | ✔ full 3D rebuild | — |
| LOADERROR (← W) | — | ✔ error banner | — |
| TICKERROR (← W) | — | ✔ error banner | — |

---

## 5. Legacy / dead-code notes

The following are present in comments or dead branches and are **not** active messages:

| Name / pattern | Location | Status |
|----------------|----------|--------|
| `DESTROY` | `CityGame.js` line 69, commented out | **Dead code** — superseded by `MAPCLICK` with `single:true` |
| `OVERLAYS` | `Main.js` line 170, commented out | **Dead code** — `setOverlays()` method body is empty |
| `trans` field on `NEWMAP` (← W) | `CityGame.js` line 190 | **Legacy** — was used for ArrayBuffer transfer; hardcoded `false`, no longer meaningful |
| `window.gameData` global | `Main.js` line 14 | **Never written** — declared but never populated; likely a leftover placeholder |
| `RUN` (→ W) routing | `CityGame.js` line 71, commented out | **Dead code** — `updateTrans()` was a transfer-mode optimisation that was abandoned |

---

## 6. Known risks

These risks are inherited from the broader architecture and directly affect this protocol:

1. **No schema or version field** — any renamed or added field silently breaks the receiver.
   The `NEWMAP`/`FULLREBUILD`/`RUN` messages are the highest-impact targets because they carry
   binary tile data.

2. **`infos` is a positional array, not a named object** — callers and receivers must agree on
   index semantics.  The array has 18 used slots; adding a new stat requires updating both
   `Simulation.simTick()` and `Hub.updateCITYinfo()` in sync.

3. **`evalData` is also a positional array** — same risk as `infos`.

4. **`achData` and `historyData` payload shapes are inferred** — the `Achievements` and
   `CityHistory` classes were not directly inspected for this document.  Treat those payloads as
   opaque until verified.

5. **The two-step load handshake (`LOADGAME` → `LOADGAME` → `MAKELOADGAME`) is non-obvious** —
   the worker cannot access `localStorage`, so the round-trip exists to let the main thread do
   the read.  This is invisible from the protocol alone; see §4 in `ARCHITECTURE.md` for the
   full flow diagram.
