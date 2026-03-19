# OpenPublica — Development Roadmap

> **Vision:** A fully open-source, 3D city builder that runs in any web browser — starting from the solid Micropolis simulation foundation and growing into a game that rivals **Cities: Skylines** and **SimCity**.

All phases are cumulative. Features in earlier phases remain in subsequent ones.

---

## Current State — v0.8.0 ✅

The foundation is working and playable in the browser today:

- [x] Three.js 3D rendering (WebGL, custom GLSL shaders)
- [x] micropolisJS simulation engine running in a Web Worker
- [x] Zoning tools (Residential / Commercial / Industrial)
- [x] Roads & power lines
- [x] Live traffic simulation + helicopter
- [x] RCI demand indicator
- [x] Season / weather / snow toggle
- [x] Speed controls (pause / 1× / 2× / 3×)
- [x] City statistics panel & mini-map
- [x] Save / load city state

---

## Phase 1 — Polish & Stability (near-term)

Goal: make the existing game feel complete and bug-free before adding new systems.

- [ ] Fix all known simulation edge-cases (power grid, traffic jams, budget crashes)
- [x] Improve mobile / touch controls and responsive layout — CSS media queries for small screens; two-finger pan + pinch zoom on touch devices; proportional scroll-zoom sensitivity
- [ ] Expand building model variety (more residential, commercial, and industrial LOD levels)
- [x] Animated building construction sequence — pulsing ring effect (scale + opacity animation) appears on newly placed buildings for ~2 seconds
- [x] Day / night cycle with dynamic lighting — time-of-day wheel changes fog colour, sky gradient, and renderer exposure
- [x] Winter / season visual toggle — snow mode now correctly switches sky and fog colours
- [ ] Improved disaster visuals (fire spread, tornado, flood)
- [x] Smooth camera transitions and orbit controls refinement — proportional zoom sensitivity, vertical-angle clamping prevents camera flip, two-finger midpoint pan on mobile
- [x] Keyboard shortcut reference overlay — press `?` to open; added `O` shortcut for Overlays panel; `N` shortcut for Ordinances
- [x] Persistent city auto-save (localStorage) — silent background save every 2 minutes with on-screen indicator
- [ ] Performance profiling pass — target 60 fps on mid-range hardware

---

## Phase 2 — Deeper Simulation (medium-term)

Goal: expand the Micropolis engine with richer gameplay mechanics.

- [ ] **Utility networks**
  - [x] Water supply & sewage system — water infrastructure budget slider added; funding level (0–100 %) controls water coverage; underfunded water degrades city health; coverage shown in Evaluation panel
  - [ ] Natural gas / district heating
- [ ] **Transportation expansion**
  - [ ] Bus routes with ridership simulation
  - [ ] Subway / metro lines with underground rendering
  - [ ] Bike lanes and pedestrian paths
  - [ ] Airports and seaports (cargo & passenger)
- [ ] **Economic system**
  - [x] Taxes per zone type — residential, commercial, and industrial tax rates are now independently adjustable in the Budget panel; tax yield computed per-zone
  - [x] City bonds and debt — players can issue municipal bonds ($5K / $10K / $20K) from the Budget panel; 7% annual interest is deducted each tax cycle; outstanding debt and interest are displayed; debt cap prevents runaway borrowing; bond events logged to City History
  - [x] Industry specialization — five city economic focuses: Mixed, Tech Hub, Manufacturing, Tourism, Farming/Agriculture; each modifies tax yields, pollution, unemployment, health, education and park bonus; accessible via Economy button (`I`) in top bar; selection persisted in save file
  - [x] City budget breakdown by department — Budget panel now shows per-zone tax rates (Res/Com/Ind) plus service spending sliders for Roads, Fire, Police with live dollar amounts; fixed previously-undefined maintenance budget values
- [ ] **Education & Health**
  - [x] Schools (community centers) — buildable 3×3 school tool; church scanner counts `schoolPop`; boosts education level
  - [x] Hospitals — directly buildable by player; `hospitalPop` drives health and education levels; education budget slider controls funding quality
  - [x] Education funding slider in Budget panel — underfunding reduces `educationEffect` and education level
  - [x] Hospital and school counts shown in Evaluation panel alongside education funding rate
  - [ ] Universities and literacy rating (deeper simulation)
  - [ ] Dedicated health clinic buildings with coverage radius
- [ ] **Safety services**
  - [x] Police stations with coverage radius — police coverage percentage shown in Evaluation panel; colour-coded (green/amber/red); computed from policeStationEffectMap over populated land
  - [x] Fire stations with response time simulation — fire coverage percentage shown in Evaluation panel alongside police coverage; both update live as stations are built or funded
- [x] **Parks & recreation** — park tiles (WOODS2–WOODS5 and Fountain placed by the Park tool) are now counted each simulation cycle; park count shown in Evaluation panel under Coverage & Amenities
- [x] **Hospitals & schools** — player can directly place 3×3 hospitals ($500) and schools/community centers ($500); education budget slider added; hospital/school counts tracked live in Evaluation panel
- [x] **City ordinances / policies** — six toggleable ordinances (Free Clinics, Recycling Program, Education Subsidies, Noise Ordinance, Small Business Incentive, Public Transit Subsidy); each has gameplay effects on health, pollution, education, traffic, and tax yield; annual costs deducted from city budget; accessible via Ordinances button (`N`) in top bar

---

## Phase 3 — Cities: Skylines / SimCity Parity (long-term)

Goal: reach feature depth comparable to modern city builders.

- [ ] **Districts & zoning overhaul**
  - [ ] Custom district drawing with per-district policies
  - [ ] Mixed-use zoning
  - [ ] Historic preservation zones
- [ ] **Terrain & geography**
  - [ ] Procedural terrain generation (hills, rivers, coastline)
  - [ ] Terraforming tools (raise / lower ground, dig canals)
  - [ ] Seasonal flooding and water simulation
- [ ] **Advanced traffic simulation**
  - [ ] Intersection types (roundabouts, traffic lights, stop signs)
  - [ ] Highway on/off ramps and interchanges
  - [ ] Cargo logistics network
  - [ ] Pathfinding visualizer / debug overlay
- [ ] **Realistic population simulation**
  - [ ] Individual citizen (cim/sims) lifecycle
  - [ ] Commute patterns and job matching
  - [ ] Immigration / emigration based on city attractiveness
- [ ] **Environment & sustainability**
  - [ ] Pollution modeling (air, water, noise, land)
  - [ ] Green energy sources (solar farms, wind turbines, hydroelectric)
  - [ ] Carbon footprint tracking
  - [ ] Natural disasters with rebuild mechanics
- [ ] **Advanced visuals**
  - [ ] Procedural building facade generation
  - [ ] Crowd simulation (pedestrians on sidewalks)
  - [ ] Real-time global illumination / reflections
  - [ ] Cinematic camera mode and photo mode
- [ ] **Modding & extensibility**
  - [ ] Asset workshop: import custom glTF building models
  - [ ] Scripting API for custom policies and events
  - [ ] Map editor with heightmap import/export
- [ ] **Multiplayer (stretch goal)**
  - [ ] Shared regional map — each player manages one city tile
  - [ ] Trade and resource exchange between cities

---

## Phase 4 — Platform & Community (long-term)

- [ ] Progressive Web App (PWA) — installable, offline-capable
- [ ] Cloud save with optional sign-in
- [ ] City sharing — publish your city with a shareable URL
- [ ] Leaderboards (population, happiness, sustainability score)
- [ ] Steam / Itch.io release (Electron wrapper)
- [ ] Accessibility improvements (color-blind modes, screen-reader support)

---

## Technical Debt & Infrastructure

These run in parallel across all phases:

- [ ] Migrate to TypeScript
- [ ] Unit tests for simulation logic (Jest / Vitest)
- [ ] CI/CD pipeline (GitHub Actions) with automated build + deploy
- [ ] Documented public API for the simulation worker
- [ ] glTF model pipeline documentation for contributors
- [ ] Code-split bundles — lazy-load heavy assets after initial paint

---

## How to Contribute

Pick any open item above, open an issue to claim it, then submit a pull request. See [README.md](README.md) for setup instructions.
