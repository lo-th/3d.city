export const AppState = {

    version:      '0.9.5',

    inspector:      false,


    envmap:'envmap',
    envmap2:'envmap2',

    exposure: 0.6,
    backgroundBlurriness: 0.0,
    backgroundIntensity:  1.8,
    environmentIntensity: 2.0,
    direct: 6,
    directColor: 0xbcae9a,

    activeLUT:      true,
    activeFOG:      true,

    forceWebGL:      false,

    debugTime:       false,

    
    tileSize:          32,
    isWithNormal:    true, 
    isWithRoughness: false,
    isBestMaterial:  true,    // use Standard or Basic material

    isPixelStyle:   false,
    withShadow:     false,
    isWithLight:     true,
    isWithTree:      true,

    // fog
    /*fog_Density: 0.04,
    fog_Height: 2,
    fog_Alpha : 0.5,*/

    delta:          0,      // view delta time

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
    isWebGPU:      false,   // true if three renderer is webgpu
    isMobile:      false,   // true when running on a mobile device
    isWorker:      true,    // true → use Web Worker; false → directMessage mode
    withHeight:    true,   // current map was generated with a height map

    // ── Worker mode: direct-call callback (non-worker mode only) ──────────
    directMessage: null,    // Function used when simulation runs on main thread

    // ── Core component references (set during Main.init) ──────────────────
    main:          null,    // main instance – DOM UI manager
    hub:           null,    // Hub instance – DOM UI manager
    view3d:        null,    // View instance – Three.js renderer
    workerBridge:  null,    // WorkerBridge instance
    debugOverlay:  null,    // DebugOverlay instance

    // ── traffic component references (set during intro ) ──────────────────
    traffic:       null,

    color:{
        ground:'#9c856a',//c68564',
        normal:'#8080ff',
        snow:'#e6f0ff',
        white:'#ffffff',
        lightGrey:'#CCCCCC',
        metal:'#808080',
        sky:'#8397ac',
        border:'#505050',
        fog:'#7d7470',//'#667791',
    },

};