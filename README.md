# OpenPublica City Builder

> A **3D, browser-playable** city-building game powered by [micropolisJS](https://github.com/graememcc/micropolisJS) simulation and [Three.js](https://github.com/mrdoob/three.js) rendering — no download, no install, just open a tab and build.

[![Launch Game](https://img.shields.io/badge/Play%20Now-Launch%20Game-4a9edd?style=for-the-badge)](http://lo-th.github.io/3d.city/index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## What is this?

OpenPublica is an open-source, fully 3D city builder that runs entirely in your web browser via WebGL. It combines:

- **[micropolisJS](https://github.com/graememcc/micropolisJS)** (by Graeme McCutcheon) — the gold-standard open-source city simulation engine (itself descended from the original SimCity / Micropolis source). The simulation runs in a dedicated **Web Worker** so the 3D rendering stays smooth.
- **[Three.js](https://github.com/mrdoob/three.js)** — high-performance WebGL rendering of the city in real time, including custom GLSL shaders and 3D models.

The long-term vision is to grow this into a feature-rich city builder that rivals **Cities: Skylines** and **SimCity** — fully open-source and playable in any modern browser.

---

## Screenshots

<a target='_blank' href='http://lo-th.github.io/3d.city/index.html'><img src="http://lo-th.github.io/3d.city/assets/img/preview01.jpg" alt="OpenPublica city view 1"/></a>
<a target='_blank' href='http://lo-th.github.io/3d.city/index.html'><img src="http://lo-th.github.io/3d.city/assets/img/preview02.jpg" alt="OpenPublica city view 2"/></a>
<a target='_blank' href='http://lo-th.github.io/3d.city/index.html'><img src="http://lo-th.github.io/3d.city/assets/img/preview03.jpg" alt="OpenPublica city view 3"/></a>

---

## Current Features (v0.8.0)

- 🏙️ **Full 3D city rendering** in the browser — no plugins required
- 🧠 **Micropolis simulation engine** running in a Web Worker (residential, commercial, industrial zones; power; roads; traffic; disasters; budgets)
- 🌦️ **Season & weather system** — summer / winter / snow modes with visual transitions
- 🚦 **Live traffic simulation** with animated vehicles
- 🚁 **Helicopter** flyover
- 🔨 **Building tools** — zone placement, roads, power lines, parks, demolition
- 📊 **RCI demand indicator** (Residential / Commercial / Industrial)
- 🗺️ **Mini-map** and city statistics panel
- 💾 **Save / load** city state
- ⚡ **Speed controls** (pause / 1× / 2× / 3×)
- 🌐 Runs entirely in the browser — mobile-friendly layout

---

## Technology Stack

| Layer | Technology |
|---|---|
| 3D Rendering | [Three.js](https://github.com/mrdoob/three.js) (WebGL) |
| City Simulation | [micropolisJS](https://github.com/graememcc/micropolisJS) (ES6 port) |
| Simulation Thread | Web Worker |
| Build Tool | [Rollup](https://rollupjs.org/) |
| Language | ES6+ JavaScript |

---

## Getting Started

### Play instantly (no setup)

Open [http://lo-th.github.io/3d.city/index.html](http://lo-th.github.io/3d.city/index.html) in any modern browser.

### Run locally

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run dev
# → opens at http://localhost:8111
```

### Build for production

```bash
npm run build
```

---

## Roadmap

See **[ROADMAP.md](ROADMAP.md)** for the full phased development plan — from current polish work all the way to Cities: Skylines / SimCity-level feature parity.

---

## Contributing

Contributions are very welcome! Please open an issue or pull request. Areas where help is especially appreciated:

- New building models (glTF/Draco)
- Gameplay mechanics (see ROADMAP)
- Performance optimizations
- Mobile / touch controls

---

## Credits

- Original city simulation: [Micropolis](http://www.donhopkins.com/home/micropolis/) by Will Wright / Don Hopkins (GPL)
- JS simulation port: [micropolisJS](https://github.com/graememcc/micropolisJS) by Graeme McCutcheon
- 3D engine base: [lo-th/3d.city](https://github.com/lo-th/3d.city) by lo-th

---

## License

MIT — see [LICENSE](LICENSE)
