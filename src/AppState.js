
// ── AppState ──────────────────────────────────────────────────────────────────
//  Shared main-thread state module.  Replaces the window.* globals that were
//  previously declared at the top of Main.js and accessed as bare identifiers
//  throughout Main.js, WorkerBridge.js, View.js, and Hub.js.
//
//  Import this object in any main-thread module that needs to read or write
//  application state.  Because ES modules are singletons within a bundle, all
//  importers share the exact same object reference.
//
//  Globals that were NOT migrated (they are browser-native APIs, not custom
//  app state):
//    window.localStorage, window.open, window.devicePixelRatio,
//    window.innerWidth, window.innerHeight, window.addEventListener
//
//  Legacy window properties that were removed (they were never used):
//    window.trans      – legacy ArrayBuffer transfer flag, always false
//    window.gameData   – placeholder declared but never populated
// ─────────────────────────────────────────────────────────────────────────────

export const AppState = {

    // ── Simulation data buffers (populated from worker each tick) ──────────
    tilesData:     null,    // Uint16Array – flat 128×128 array of tile values
    spriteData:    null,    // Array of [type, frame, x, y] for active sprites
    powerData:     null,    // Array of power-grid state per tile
    layerData:     [],      // Diff of changed tile layers this tick

    // ── Dirty flags (set true each RUN tick; consumed by View) ────────────
    newup:         false,   // tile data has been updated
    powerup:       false,   // power grid changed this tick

    // ── Device / mode flags ────────────────────────────────────────────────
    isMobile:      false,   // true when running on a mobile device
    isWorker:      true,    // true → use Web Worker; false → directMessage mode
    withHeight:    false,   // current map was generated with a height map

    // ── Worker mode: direct-call callback (non-worker mode only) ──────────
    directMessage: null,    // Function used when simulation runs on main thread

    // ── Core component references (set during Main.init) ──────────────────
    hub:           null,    // Hub instance – DOM UI manager
    view3d:        null,    // View instance – Three.js renderer
    workerBridge:  null,    // WorkerBridge instance
    debugOverlay:  null,    // DebugOverlay instance

};
