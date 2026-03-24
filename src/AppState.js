export const AppState = {

    // ── Simulation data buffers (populated from worker each tick) ──────────
    tilesData:     null,    // Uint16Array – flat 128×128 array of tile values
    spriteData:    null,    // Array of [type, frame, x, y] for active sprites
    powerData:     null,    // Array of power-grid state per tile
    layerData:     [],      // Diff of changed tile layers this tick

    // ── Dirty flags (set true each RUN tick; consumed by View) ────────────
    newup:         false,   // tile data has been updated
    powerup:       false,   // power grid changed this tick

    // ── Map size selection (set before posting NEWMAP) ────────────────────
    selectedMapSize: [128, 128],  // [width, height] chosen by the player

    // ── Device / mode flags ────────────────────────────────────────────────
    isMobile:      false,   // true when running on a mobile device
    isWorker:      true,    // true → use Web Worker; false → directMessage mode
    withHeight:    false,   // current map was generated with a height map

    // ── Worker mode: direct-call callback (non-worker mode only) ──────────
    directMessage: null,    // Function used when simulation runs on main thread

    // ── Core component references (set during Main.init) ──────────────────
    main:          null,    // main instance – DOM UI manager
    hub:           null,    // Hub instance – DOM UI manager
    view3d:        null,    // View instance – Three.js renderer
    workerBridge:  null,    // WorkerBridge instance
    debugOverlay:  null,    // DebugOverlay instance

    // ── traffic component references (set during intro ) ──────────────────
    traffic:          null,

};