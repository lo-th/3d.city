
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

export class WorkerBridge {

    constructor () {

        this._worker        = null;
        this._isWorker      = true;
        this._directMessage = null;
        this._onPlayStart   = null;   // callback: called when FULLREBUILD+isStart fires

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
            this.post( { tell: 'INIT', timestep: timestep } );

        } else {

            this.post( { tell: 'INIT', timestep: timestep, returnMessage: handler } );

        }

    }

    // Send a message to the worker (or invoke directMessage in non-worker mode)
    post ( data, buffer ) {

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
                AppState.view3d.startPlay();
                if ( this._onPlayStart ) this._onPlayStart();
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
        }

        if ( phase === 'BUDGET' )       AppState.hub.openBudget( d.budgetData );
        if ( phase === 'QUERY' )        AppState.hub.openQuery( d.queryTxt );
        if ( phase === 'EVAL' )         AppState.hub.openEval( d.evalData );
        if ( phase === 'ACHIEVEMENTS' ) AppState.hub.openAchievements( d.achData, d.progress );
        if ( phase === 'HISTORY' )      AppState.hub.openHistory( d.historyData );

        if ( phase === 'SAVEGAME' ) this._makeGameSave( d.gameData, d.key, d.silent );
        if ( phase === 'LOADGAME' ) this._makeLoadGame( d.key, d.isStart );

    }

    // ── Save / load helpers ────────────────────────────────────────────────

    _makeGameSave ( gameData, key, silent ) {

        window.localStorage.setItem( key, gameData );

        if ( !silent && !AppState.view3d.isMobile ) {
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
