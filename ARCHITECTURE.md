# OpenPublica – Architecture

> **Status:** documentation of reality as of v0.9.0.  No code has been changed.

---

## Table of Contents
1. [Startup flow – page load to playable city](#1-startup-flow--page-load-to-playable-city)
2. [Role of Main.js, Hub.js, View.js, and the worker](#2-role-of-mainjs-hubjs-viewjs-and-the-worker)
3. [Window globals](#3-window-globals)
4. [Save / load / autosave flow](#4-save--load--autosave-flow)
5. [Top 10 architectural risks](#5-top-10-architectural-risks)

---

## 1. Startup flow – page load to playable city

```
Browser loads index.html
  └─ <script type="module"> imports build/MainGame.module.js
       └─ calls Main.init()
            ├─ testMobile()            → sets window.isMobile
            ├─ Main.initWorker()
            │    └─ new Worker('build/citygame.min.js')     [worker thread]
            │         └─ self.onmessage = CityGame.message
            │    └─ post({ tell:"INIT", timestep:30 })
            │         └─ worker: new MainGame(30) → posts READY back (ignored)
            ├─ window.hub = new Hub()
            │    └─ builds loading overlay DOM (#hub-loading), GitHub / donate buttons
            └─ window.view3d = new View(isMobile)
                 └─ new Pool(done_cb, ...)   ← loads world.glb + all textures
                      └─ when fully loaded: Pool calls View.done()
                           ├─ View.init()
                           │    ├─ THREE.Scene, PerspectiveCamera, WebGLRenderer
                           │    ├─ fog, lights (if enabled), resize/mouse/touch listeners
                           │    ├─ new BuildTool()  (ghost cursor)
                           │    └─ View.loop(0)     ← requestAnimationFrame loop starts
                           ├─ View.createMaterial() → builds Three.js materials,
                           │    then calls View.preIntro()
                           │         ├─ renders a 19×19 mini-city with animated traffic
                           │         └─ overlays NEW / LOAD 3D canvas buttons (UIL.Gui)
                           └─ Main.start() → hub.start() → fades loading screen out

--- User sees intro scene ---

User clicks NEW
  └─ View.openMap('NEW') → Main.newMap('NEW')
       ├─ hub.generate(true)          show "Generating map…" overlay
       ├─ view3d.inMapGenation = true   (note: property name is a typo in source)
       └─ setTimeout → post({ tell:"NEWMAP" })
            └─ worker: mapGen.construct(128,128)
                 └─ posts NEWMAP back { tilesData, mapSize, island }

Main thread receives NEWMAP
  ├─ hub.generate(false)             hide overlay
  ├─ window.tilesData = e.data.tilesData
  └─ view3d.paintMap(mapSize, island, withHeight)
       ├─ initTerrain()   64 PlaneGeometry tiles (8×8 grid of 16×16)
       └─ updateTerrainTexture() for each tile

--- User selects difficulty, clicks PLAY THIS MAP ---

  └─ View.startPlay() → Main.playMap()
       ├─ hub.initGameHub()          build top bar, tool panel, status bar
       ├─ view3d.startZoom()         camera eases in
       └─ post({ tell:"PLAYMAP" })
            └─ worker: MainGame.playMap()
                 ├─ instantiates all game tools (RoadTool, BuildingTool, …)
                 ├─ new Simulation(map, difficulty, speed, is3D)
                 │    creates: Evaluation, Valves, Budget, Census, PowerManager,
                 │             SpriteManager, MapScanner, RepairManager, Traffic,
                 │             DisasterManager, Achievements, CityHistory, SeasonManager
                 └─ starts tick loop via MainGame.tick()

--- Per-simulation tick (≈ 30 fps) ---

worker tick()
  ├─ simulation.simTick()
  ├─ processMessages()
  ├─ animatedTiles() + calculateSprites()
  └─ posts RUN { tilesData, powerData, sprites, layer, infos }

Main thread receives RUN
  ├─ window.tilesData  = e.data.tilesData
  ├─ window.powerData  = e.data.powerData
  ├─ window.spriteData = e.data.sprites
  ├─ window.layerData  = e.data.layer
  ├─ window.newup  = true
  ├─ window.powerup = e.data.infos[9]
  ├─ hub.updateCITYinfo(infos)       date, pop, funds, score, season, happiness
  ├─ view3d.updateLayer()
  ├─ view3d.moveSprite()
  └─ view3d.showPower()

--- City is playable ---
Main.startAutoSave() started (2-minute interval)
```

---

## 2. Role of Main.js, Hub.js, View.js, and the worker

### `src/Main.js` – orchestrator / message bus

`Main` is a static-method class that owns the boundary between the UI thread and the worker.
Everything that crosses that boundary goes through `post()` (main → worker) or `message()` (worker → main).

| Responsibility | Detail |
|---|---|
| Initialisation | Creates `hub`, `view3d`, spawns the worker and sends `INIT` |
| Worker facade | Every user action (tool, click, budget, speed, disaster…) is a `Main.xxx()` call that posts a command to the worker |
| Message dispatcher | `message(e)` receives every worker response and routes it to `hub` or `view3d` |
| Save / load entry points | `saveGame()`, `autoSave()`, `loadGame()`, `startAutoSave()` |
| Mode switch | `isWorker=false` / `directMessage` lets the simulation run on the main thread (e.g. for debugging) |
| Window globals | Declares all `window.*` globals at the top of the file |

`Main` intentionally has no state of its own; it is a thin coordination layer.

---

### `src/city3d/Hub.js` – DOM UI layer (~1,400 lines)

`Hub` builds and manages the entire HTML/CSS interface imperatively via `document.createElement`.  
It never touches Three.js and knows nothing about the simulation internals.

| Responsibility | Detail |
|---|---|
| Loading / generation overlay | Shows / hides `#hub-loading` (spinner + status text) |
| Intro links | GitHub and donate buttons shown before game starts |
| Top menu bar | Budget, Eval, Disaster, Save/Load, About, Awards, History buttons |
| Tool panel | 18 SVG-button tool ring (right side); highlights selected tool |
| Bottom status bar | Date, Population, Funds, Score, City class, Season, Happiness, RCI |
| Time wheel | 4-quadrant dawn/day/night/dusk colour picker |
| Modal windows | Budget (sliders), Evaluation, Disaster, Save/Load, About, Overlays, Query, Achievements, History |
| Keyboard shortcuts | `B`udget, `E`val, `D`isaster, `S`ave/Load, `A`wards, `H`istory, `O`verlays, `?` About, `Esc` Close |
| Auto-save indicator | Transient "✔ Auto-saved" toast via `flashAutoSave()` |

---

### `src/city3d/View.js` – 3D rendering engine (~2,578 lines)

`View` wraps Three.js and is the largest file in the project.  It combines several sub-concerns
that have not yet been split into separate classes.

| Responsibility | Detail |
|---|---|
| Scene bootstrap | `THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer` (ACES tonemapping, sRGB) |
| Asset pool | Delegates to `Pool` (GLTF/DRACO models + textures); waits for completion before proceeding |
| Terrain | 64 `PlaneGeometry` tiles (8×8 grid covering 128×128 sim tiles); supports optional Perlin height map |
| Tile painting | Reads `window.tilesData` / `window.layerData` to update per-tile canvas textures |
| Building system | `townLists`, `houseLists`, `buildingLists` per layer; merges individual geometries into one `BufferGeometry` per layer per type on every change |
| Tree system | Same layer-based merge as buildings; skipped on mobile / low-quality |
| Sprite system | Trains, helicopters, planes, boats, monsters, tornadoes, sparks — moved each tick |
| Power overlay | Sprite-based lightning-bolt markers on unpowered tiles |
| Camera | Custom orbit: horizontal/vertical/distance; mouse drag, wheel zoom, keyboard pan (WASD/arrows) |
| Input | `handleEvent` dispatcher for mouse, touch, wheel |
| Intro sequence | Mini 3D city + animated traffic + UIL canvas buttons; morphing border easing transition |
| Build tool | `BuildTool` ghost/cursor mesh for tile placement |
| Seasonal / time visuals | `winterSwitch()`, `setTimeColors()` (fog, renderer exposure, sky gradient) |
| Save 3D state | `saveCityBuild()` serialises townLists/houseLists/buildingLists into a flat array |
| Restore 3D state | `loadCityBuild()` restores lists and rebuilds all mesh layers |
| File load | Creates a hidden `<input type=file>` and stores JSON content in `this.tmpGameData` |

---

### Worker – `build/citygame.min.js` (source: `src/micro/CityGame.js`)

The worker runs the **entire city simulation** off the main thread so the Three.js render loop
never blocks.

| Component | Responsibility |
|---|---|
| `CityGame` (static) | `self.onmessage` entry point; routes commands to `MainGame`; wraps `postMessage` |
| `MainGame` | Owns all simulation state; drives the tick loop via `setTimeout` recursion |
| `MapGenerator` | Procedural terrain generation (rivers, lakes, trees, optional island) |
| `GameMap` | 128×128 flat typed array of tile values + power grid + layer diff |
| `Simulation` | Master simulation controller; creates and steps all sub-systems |
| Sub-systems | `Evaluation`, `Valves`, `Budget`, `Census`, `PowerManager`, `MapScanner`, `RepairManager`, `Traffic`, `DisasterManager`, `SpriteManager`, `Achievements`, `CityHistory`, `SeasonManager` |
| Game tools | `BuildingTool`, `BulldozerTool`, `ParkTool`, `RailTool`, `RoadTool`, `WireTool`, `QueryTool` |

The worker can also run on the main thread in "direct" mode: when `Main.init(DirectMessage)` is
called with a callback, `isWorker` is set to `false` and messages are passed via function call
rather than `postMessage`.

---

## 3. Window globals

All of the following are declared at the top of `src/Main.js` and are accessed without
qualification throughout `Main.js`, `Hub.js`, and `View.js`.

| Global | Type | Set by | Purpose |
|---|---|---|---|
| `window.tilesData` | `Uint16Array` / null | worker `RUN` / `NEWMAP` | Flat 128×128 array of tile values; read by View each tick |
| `window.spriteData` | `Array` / null | worker `RUN` | Array of `[type, frame, x, y]` for each active sprite |
| `window.gameData` | null | (never written) | Declared but never populated; appears to be a leftover placeholder — a candidate for removal |
| `window.powerData` | `Array` / null | worker `RUN` | List of tile coords that lack power |
| `window.layerData` | `Array` | worker `RUN` | Diff of tiles changed this tick; used by `updateLayer()` |
| `window.isMobile` | `Boolean` | `testMobile()` in `Main.init` | Disables trees, env map, normal maps, reduces resolution |
| `window.trans` | `Boolean` | hardcoded `false` | Legacy ArrayBuffer transfer flag; no longer used |
| `window.newup` | `Boolean` | worker `RUN` | Dirty flag: tile data has been updated (set true each tick) |
| `window.powerup` | `Boolean` | worker `RUN` | Dirty flag: power grid changed this tick |
| `window.directMessage` | `Function` / null | `Main.init(DirectMessage)` | Callback used when simulation runs on main thread instead of worker |
| `window.isWorker` | `Boolean` | `Main.init` | `true` → use Web Worker; `false` → use `directMessage` |
| `window.withHeight` | `Boolean` | `Main.newMap()` | Whether the current map was generated with a height map |
| `window.hub` | `Hub` | `Main.init` | The live Hub instance; accessed directly by View and Hub event handlers |
| `window.view3d` | `View` | `Main.init` | The live View/renderer instance |
| `window.cityWorker` | `Worker` | `Main.initWorker` | The Web Worker instance |

---

## 4. Save / load / autosave flow

### Manual save

```
User clicks SAVE (Hub.openExit → bg3 click)
  └─ Main.saveGame()
       ├─ view3d.saveCityBuild(saveCity)
       │    └─ iterates 64 layers → saveCity[l] = [townLists[l], houseLists[l], buildingLists[l]]
       ├─ saveCity = JSON.stringify(saveCity)   (3D building state only)
       └─ post({ tell:"SAVEGAME", saveCity })
            └─ worker: MainGame.saveGame(cityData, silent=false)
                 ├─ builds gameData = { name, speed, difficulty, version:3, city:cityData }
                 ├─ simulation.save(gameData)
                 │    └─ writes map tiles, census arrays, budget fields into gameData
                 ├─ gameData = JSON.stringify(gameData)
                 └─ posts SAVEGAME back { gameData, key:"micropolisJSGame", silent:false }

Main thread receives SAVEGAME
  └─ makeGameSave(gameData, key, silent=false)
       ├─ window.localStorage.setItem("micropolisJSGame", gameData)
       └─ if not mobile: saveAs(blob, "city3d.json")   ← file download
```

### Autosave (silent)

```
Main.startAutoSave(120000)   ← called once on FULLREBUILD with isStart:true
  └─ setInterval every 2 min → Main.autoSave()
       └─ same as saveGame() but post({ tell:"SAVEGAME", saveCity, silent:true })
            └─ worker posts SAVEGAME back with silent:true

Main thread makeGameSave(gameData, key, silent=true)
  ├─ localStorage.setItem(...)      ← writes to storage
  └─ hub.flashAutoSave()            ← shows "✔ Auto-saved" toast, no file download
```

### Load from localStorage

```
User clicks LOAD (Hub.openExit → bg4 click)
  └─ Main.loadGame(isStart=false)
       └─ post({ tell:"LOADGAME", key:"micropolisJSGame", isStart })
            └─ worker: MainGame.loadGame()
                 └─ posts LOADGAME back { key, isStart }

Main thread receives LOADGAME
  └─ makeLoadGame(key, isStart)
       ├─ savegame = view3d.tmpGameData || localStorage.getItem(key)
       └─ post({ tell:"MAKELOADGAME", savegame, isStart })
            └─ worker: MainGame.makeLoadGame(gameData, isStart)
                 ├─ JSON.parse(gameData)
                 ├─ new GameMap(128,128) → map.load(savedGame)
                 └─ posts FULLREBUILD { tilesData, mapSize, island, cityData, isStart }

Main thread receives FULLREBUILD
  ├─ hub.generate(false)           hide overlay
  ├─ view3d.fullRedraw = true
  ├─ view3d.paintMap(...)          rebuild terrain
  ├─ view3d.loadCityBuild(cityData)
  │    └─ JSON.parse(cityData) → restores townLists/houseLists/buildingLists, rebuilds meshes
  └─ if isStart: view3d.startPlay() + Main.startAutoSave()
```

### Load from JSON file

```
User clicks LOAD (intro scene) on non-mobile
  └─ View.openMap('LOAD')
       └─ creates hidden <input type="file">
            └─ user selects .json file → View.fileSelect(e)
                 ├─ FileReader.readAsText(file)
                 └─ onload: this.tmpGameData = result
                             this.openMap('LOADDONE')

View.openMap('LOADDONE') / View.endOpen()
  └─ Main.loadGame(true)   ← isStart = true, same flow as above
       (view3d.tmpGameData is used instead of localStorage)
```

---

## 5. Top 10 architectural risks

### 1  Global state proliferation
Fifteen variables live on `window` (`tilesData`, `spriteData`, `powerData`, `layerData`,
`hub`, `view3d`, `cityWorker`, `newup`, `powerup`, `withHeight`, `isMobile`, `isWorker`,
`trans`, `directMessage`, `gameData`).  Any module can accidentally overwrite them.
As more features are added, tracing data flow or testing in isolation becomes increasingly hard.

### 2  Untyped, unversioned worker message protocol
All messages are plain JS objects identified by a `tell` string with no schema, no runtime
validation, and no versioning.  Adding, removing, or renaming a field in any
`post({ tell:"X", ... })` call silently changes the contract; the receiving side has no way to
detect the mismatch.  This will cause subtle bugs as the protocol grows.

### 3  View.js is a God Object (~2,578 lines)
The `View` class is responsible for: scene setup, terrain rendering, building merging, tree
management, sprite animation, tile painting, power overlays, camera control, mouse/touch/keyboard
input, intro animation, height maps, seasonal/time-of-day effects, 3D save/load, and more.  
No concern can be tested or extended without touching the entire class.

### 4  3D save state is raw array structure
`saveCityBuild()` serialises `townLists / houseLists / buildingLists` as nested JavaScript arrays
with positional semantics (`ar[0]`=x, `ar[1]`=y, …, `ar[5]`=house flag).  Any refactoring that
changes the order or count of these fields silently corrupts existing saves.  Version migration
(`transitionOldSave`) only covers the simulation part of the save; the 3D side has none.

### 5  Tick loop has no error recovery or frame-budget enforcement
`MainGame.tick()` schedules itself via `setTimeout` recursion.  If an uncaught exception occurs
mid-tick the loop silently stops.  There is no watchdog, no try/catch around the tick, no
max-time guard, and no way for the UI to detect that the simulation has stalled.  At high speeds
the simulation could also outrun the renderer, queueing unbounded messages.

### 6  Entire tile array is serialised every tick
`window.tilesData` (128×128 = 16,384 tile values) plus `powerData`, `spriteData`, and
`layerData` are structured-cloned from the worker on every simulation tick.  At the current
128×128 map size the cost is acceptable, but even a 256×256 map quadruples the overhead.
`layerData` exists as a diff but is not yet used to avoid full repaints.

### 7  No event bus / dependency injection
All inter-component calls use either `Main.xxx()` static methods or bare `window.hub` /
`window.view3d` references.  Adding any new cross-component interaction requires either adding
another static method to `Main` or reaching through `window`.  There is no observable / pub-sub
pattern, no service locator, and no DI container.  

### 8  Hub builds UI with raw `createElement` and no data binding
Every panel is constructed once imperatively and toggled with `style.display`.  Updating data
requires direct DOM writes spread across many methods.  There are no reusable UI components, no
template system, and no declarative binding — adding a new stat or panel means writing 30–50 more
lines of boilerplate in `Hub.js`.

### 9  Layer count and map size are hardcoded constants
`this.nlayers = 64` (8×8 terrain chunks), `mapSize = [128,128]`, and the layer arithmetic in
`View.findLayer()` / `initTerrain()` are tightly coupled.  Supporting variable or larger map sizes
(a standard expectation in modern city builders) requires coordinated changes across View.js,
CityGame.js, Micro.js (`MAP_WIDTH`, `MAP_HEIGHT`), and GameMap.  There is no single source of
truth for map dimensions.

### 10  Two separate build bundles with no shared module graph
The main-thread bundle (`build/MainGame.module.js` ← `src/Main.js`) and the worker bundle
(`build/citygame.min.js` ← `src/micro/CityGame.js`) are independent Rollup outputs.  They share
no code at build time.  Constants such as `Micro.KEY = 'micropolisJSGame'` and
`Micro.CURRENT_VERSION = 3` exist only in the worker bundle; the main thread hard-codes
equivalent values (e.g. `makeGameSave` uses the key returned by the worker).  Any future shared
utility (logging, analytics, feature flags) would need to be duplicated in both bundles or a
third shared entry point introduced.
