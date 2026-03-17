
// ── WorkerBridge ─────────────────────────────────────────────────────────────
//  Encapsulates all Web Worker communication for the main thread:
//    • Worker creation (or direct-call wiring in non-worker mode)
//    • Outbound post()
//    • Inbound message dispatch
//    • Save / load helpers that were previously inline in Main.js
//
//  Dependencies (window globals used inside dispatch / helpers):
//    hub, view3d, tilesData, powerData, spriteData, layerData,
//    newup, powerup, withHeight — all set on window by Main.js
// ─────────────────────────────────────────────────────────────────────────────

import { saveAs } from './saveAs.js';

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
            hub.generate( false );
            tilesData = d.tilesData;
            view3d.paintMap( d.mapSize, d.island, withHeight );
        }

        if ( phase === 'FULLREBUILD' ) {
            if ( d.isStart ) hub.generate( false );
            view3d.fullRedraw = true;
            tilesData = d.tilesData;
            view3d.paintMap( d.mapSize, d.island, withHeight );
            view3d.loadCityBuild( d.cityData );
            if ( d.isStart ) {
                view3d.startPlay();
                if ( this._onPlayStart ) this._onPlayStart();
            }
        }

        if ( phase === 'BUILD' ) {
            view3d.build( d.x, d.y );
        }

        if ( phase === 'RUN' ) {
            tilesData  = d.tilesData;
            powerData  = d.powerData;
            spriteData = d.sprites;
            layerData  = d.layer;

            hub.updateCITYinfo( d.infos );

            newup   = true;
            powerup = d.infos[ 9 ];

            view3d.updateLayer();
            view3d.moveSprite();
            view3d.showPower();

            if ( window.debugOverlay ) window.debugOverlay.onWorkerTick();
        }

        if ( phase === 'BUDGET' )       hub.openBudget( d.budgetData );
        if ( phase === 'QUERY' )        hub.openQuery( d.queryTxt );
        if ( phase === 'EVAL' )         hub.openEval( d.evalData );
        if ( phase === 'ACHIEVEMENTS' ) hub.openAchievements( d.achData, d.progress );
        if ( phase === 'HISTORY' )      hub.openHistory( d.historyData );

        if ( phase === 'SAVEGAME' ) this._makeGameSave( d.gameData, d.key, d.silent );
        if ( phase === 'LOADGAME' ) this._makeLoadGame( d.key, d.isStart );

    }

    // ── Save / load helpers ────────────────────────────────────────────────

    _makeGameSave ( gameData, key, silent ) {

        window.localStorage.setItem( key, gameData );

        if ( !silent && !view3d.isMobile ) {
            var blob = new Blob( [ gameData ], { type: 'text/plain;charset=utf-8' } );
            saveAs( blob, 'city3d.json' );
        }

        if ( silent && hub ) {
            hub.flashAutoSave();
            if ( window.debugOverlay ) window.debugOverlay.onAutoSave();
        }

    }

    _makeLoadGame ( key, atStart ) {

        var isStart  = atStart || false;
        var savegame;

        if ( view3d.tmpGameData ) {
            savegame = view3d.tmpGameData;
        } else {
            savegame = window.localStorage.getItem( key );
        }

        if ( savegame ) {
            this.post( { tell: 'MAKELOADGAME', savegame: savegame, isStart: isStart } );
            view3d.tmpGameData = null;
        }

    }

}
