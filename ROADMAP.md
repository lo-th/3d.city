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
- [ ] Animated building construction sequence (scaffold → finished)
- [x] Day / night cycle with dynamic lighting — time-of-day wheel changes fog colour, sky gradient, and renderer exposure
- [x] Winter / season visual toggle — snow mode now correctly switches sky and fog colours
- [ ] Improved disaster visuals (fire spread, tornado, flood)
- [x] Smooth camera transitions and orbit controls refinement — proportional zoom sensitivity, vertical-angle clamping prevents camera flip, two-finger midpoint pan on mobile
- [x] Keyboard shortcut reference overlay — press `?` to open; added `O` shortcut for Overlays panel
- [x] Persistent city auto-save (localStorage) — silent background save every 2 minutes with on-screen indicator
- [ ] Performance profiling pass — target 60 fps on mid-range hardware

---

## Phase 2 — Deeper Simulation (medium-term)

Goal: expand the Micropolis engine with richer gameplay mechanics.

- [ ] **Utility networks**
  - [ ] Water supply & sewage system
  - [ ] Natural gas / district heating
- [ ] **Transportation expansion**
  - [ ] Bus routes with ridership simulation
  - [ ] Subway / metro lines with underground rendering
  - [ ] Bike lanes and pedestrian paths
  - [ ] Airports and seaports (cargo & passenger)
- [ ] **Economic system**
  - [ ] Taxes per zone type (adjustable tax rate panel)
  - [ ] City bonds and debt
  - [ ] Industry specialization (tech, manufacturing, tourism, farming)
  - [ ] City budget breakdown by department
- [ ] **Education & Health**
  - [ ] Schools, universities, and literacy rating
  - [ ] Hospitals, clinics, and city health rating
- [ ] **Safety services**
  - [ ] Police stations with coverage radius
  - [ ] Fire stations with response time simulation
- [ ] **Parks & recreation** — variety of park and landmark tiles
- [ ] **City ordinances / policies** — tax incentives, noise ordinances, recycling programs

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
