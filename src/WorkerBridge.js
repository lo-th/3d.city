
// ── WorkerBridge ─────────────────────────────────────────────────────────────
//  Encapsulates all Web Worker communication for the main thread:
//    • Worker creation (or direct-call wiring in non-worker mode)
//    • Outbound post()
//    • Inbound message dispatch
//    • Save / load helpers that were previously inline in Main.js
//
//  Application state (hub, view3d, tilesData, powerData, spriteData, layerData,
//  newup, powerup, withHeight) is accessed via the shared AppState module.
// ─────────────────────────────────────────────────────────────────────────────

import { saveAs } from './saveAs.js';
import { AppState } from './AppState.js';

// Milliseconds of RUN-tick silence (while game is active) before the stall
// watchdog fires.  At speed 2–3 the worker posts ≈ 30 RUN messages per second;
// 10 s of silence is an unambiguous hang.
const STALL_THRESHOLD_MS = 10000;
// How often the watchdog polls (ms)
const WATCHDOG_INTERVAL_MS = 3000;

export class WorkerBridge {

    constructor () {

        this._worker        = null;
        this._isWorker      = true;
        this._directMessage = null;
        this._onPlayStart   = null;   // callback: called when FULLREBUILD+isStart fires

        // Stall watchdog state
        this._lastRunTime       = 0;     // timestamp of most recent RUN message
        this._gameActive        = false; // true once a game is running (PLAYMAP received)
        this._gamePaused        = false; // true while speed === 0
        this._watchdogInterval  = null;

    }

    // Boot the worker (or wire up direct-call mode).
    // onPlayStart: optional callback invoked when a saved game finishes loading
    //              so Main can start the autosave timer.
    boot ( isWorkerMode, directMessage, timestep, onPlayStart ) {

        this._isWorker      = isWorkerMode;
        this._directMessage = directMessage;
        this._onPlayStart   = onPlayStart || null;

        var _this   = this;
        var handler = function ( e ) { _this.dispatch( e ); };

        if ( isWorkerMode ) {

            this._worker = new Worker( './build/citygame.min.js' );
            this._worker.postMessage = this._worker.webkitPostMessage || this._worker.postMessage;
            this._worker.onmessage   = handler;
            this._worker.onerror     = function ( e ) { _this._onWorkerError( e ); };
            this.post( { tell: 'INIT', timestep: timestep } );

        } else {

            this.post( { tell: 'INIT', timestep: timestep, returnMessage: handler } );

        }

    }

    // Called by Main.setSpeed() so the watchdog knows whether silence is expected
    setGamePaused ( paused ) {
        this._gamePaused = paused;
        if ( !paused ) this._lastRunTime = Date.now(); // reset timer on unpause
    }

    // ── Stall watchdog ─────────────────────────────────────────────────────

    _startWatchdog () {
        if ( this._watchdogInterval ) return;
        var _this = this;
        this._lastRunTime      = Date.now();
        this._watchdogInterval = setInterval( function () { _this._checkStall(); }, WATCHDOG_INTERVAL_MS );
    }

    _stopWatchdog () {
        if ( this._watchdogInterval ) {
            clearInterval( this._watchdogInterval );
            this._watchdogInterval = null;
        }
    }

    _checkStall () {
        if ( !this._gameActive || this._gamePaused ) return;
        var elapsed = Date.now() - this._lastRunTime;
        if ( elapsed > STALL_THRESHOLD_MS ) {
            this._stopWatchdog();
            var msg = 'The simulation has stopped responding (' + Math.round( elapsed / 1000 ) + ' s since last tick).  Try reloading the page.';
            console.error( 'OpenPublica stall watchdog:', msg );
            if ( AppState.hub ) AppState.hub.showError( msg );
        }
    }

    // ── Worker crash handler ────────────────────────────────────────────────

    _onWorkerError ( e ) {
        this._stopWatchdog();
        var msg = 'Simulation worker crashed';
        if ( e && e.message ) msg += ': ' + e.message;
        console.error( 'OpenPublica worker error:', e );
        if ( AppState.hub ) AppState.hub.showError( msg );
    }

    // Send a message to the worker (or invoke directMessage in non-worker mode).
    // Intercepts PLAYMAP to arm the stall watchdog for new-game starts.
    post ( data, buffer ) {

        if ( data && data.tell === 'PLAYMAP' ) {
            this._gameActive = true;
            this._gamePaused = false;
            this._startWatchdog();
        }

        if ( this._isWorker ) {
            this._worker.postMessage( data, buffer );
        } else {
            this._directMessage( { data: data } );
        }

    }

    // Dispatch an inbound worker message to the appropriate handler
    dispatch ( e ) {

        var d     = e.data;
        var phase = d.tell;

        if ( phase === 'READY' ) {
            // worker is initialised — nothing needed on the main thread
        }

        if ( phase === 'NEWMAP' ) {
            AppState.hub.generate( false );
            AppState.tilesData = d.tilesData;
            AppState.view3d.paintMap( d.mapSize, d.island, AppState.withHeight );
        }

        if ( phase === 'FULLREBUILD' ) {
            if ( d.isStart ) AppState.hub.generate( false );
            AppState.view3d.fullRedraw = true;
            AppState.tilesData = d.tilesData;
            AppState.view3d.paintMap( d.mapSize, d.island, AppState.withHeight );
            AppState.view3d.loadCityBuild( d.cityData );
            if ( d.isStart ) {
                AppState.main.playMap()
                //AppState.view3d.startPlay();
                /*if ( this._onPlayStart ) this._onPlayStart();
                // Arm the stall watchdog now that the simulation is running
                this._gameActive = true;
                this._gamePaused = false;
                this._startWatchdog();*/
            }
        }

        if ( phase === 'BUILD' ) {
            AppState.view3d.build( d.x, d.y );
        }

        if ( phase === 'RUN' ) {
            AppState.tilesData  = d.tilesData;
            AppState.powerData  = d.powerData;
            AppState.spriteData = d.sprites;
            AppState.layerData  = d.layer;

            AppState.hub.updateCITYinfo( d.infos );

            AppState.newup   = true;
            AppState.powerup = d.infos[ 9 ];

            AppState.view3d.updateLayer();
            AppState.view3d.moveSprite();
            AppState.view3d.showPower();

            if ( AppState.debugOverlay ) AppState.debugOverlay.onWorkerTick();

            // Feed the stall watchdog
            this._lastRunTime = Date.now();
        }

        if ( phase === 'BUDGET' )       AppState.hub.openBudget( d.budgetData );
        if ( phase === 'QUERY' )        AppState.hub.openQuery( d.queryTxt );
        if ( phase === 'EVAL' )         AppState.hub.openEval( d.evalData );
        if ( phase === 'ACHIEVEMENTS' ) AppState.hub.openAchievements( d.achData, d.progress );
        if ( phase === 'HISTORY' )      AppState.hub.openHistory( d.historyData );
        if ( phase === 'ORDINANCES' )   AppState.hub.openOrdinances( d.ordinances, d.annualCost );
        if ( phase === 'INDUSTRYSPEC' ) AppState.hub.openIndustrySpec( d.list, d.current );

        if ( phase === 'SAVEGAME' ) this._makeGameSave( d.gameData, d.key, d.silent );
        if ( phase === 'LOADGAME' ) this._makeLoadGame( d.key, d.isStart );

        if ( phase === 'LOADERROR' ) {
            var loadMsg = d.message || 'Failed to load saved game.';
            console.error( 'OpenPublica load error:', loadMsg );
            if ( AppState.hub ) {
                AppState.hub.generate( false );
                AppState.hub.showError( loadMsg );
            }
        }

        if ( phase === 'TICKERROR' ) {
            this._stopWatchdog();
            var tickMsg = 'Simulation error: ' + ( d.message || 'unknown error' );
            console.error( 'OpenPublica tick error:', d.message, d.stack || '' );
            if ( AppState.hub ) AppState.hub.showError( tickMsg );
        }

    }

    // ── Save / load helpers ────────────────────────────────────────────────

    _makeGameSave ( gameData, key, silent ) {

        window.localStorage.setItem( key, gameData );

        if ( !silent && !AppState.isMobile ) {
            var blob = new Blob( [ gameData ], { type: 'text/plain;charset=utf-8' } );
            saveAs( blob, 'city3d.json' );
        }

        if ( silent && AppState.hub ) {
            AppState.hub.flashAutoSave();
            if ( AppState.debugOverlay ) AppState.debugOverlay.onAutoSave();
        }

    }

    _makeLoadGame ( key, atStart ) {

        var isStart  = atStart || false;
        var savegame;

        if ( AppState.view3d.tmpGameData ) {
            savegame = AppState.view3d.tmpGameData;
        } else {
            savegame = window.localStorage.getItem( key );
        }

        if ( savegame ) {
            this.post( { tell: 'MAKELOADGAME', savegame: savegame, isStart: isStart } );
            AppState.view3d.tmpGameData = null;
        }

    }

}
