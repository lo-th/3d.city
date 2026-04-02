
// ── DebugOverlay ──────────────────────────────────────────────────────────────
//  Lightweight developer HUD: FPS, map size, simulation speed, worker tick
//  rate, and last autosave timestamp.
//  Toggle with the ` (backtick) key while the game is running.
// ─────────────────────────────────────────────────────────────────────────────

export class DebugOverlay {

    constructor () {

        this._el   = null;
        this._visible = false;

        // FPS tracking
        this._frameCount  = 0;
        this._lastFpsTime = 0;
        this._fps         = 0;

        // Worker tick-rate tracking
        this._workerTickCount = 0;
        this._lastWorkerTime  = 0;
        this._workerRate      = 0;

        // Other display data
        this._autoSaveTime = null;
        this._speed        = 0;
        this._speedLabel   = [ 'Pause', 'Slow', 'Normal', 'Fast', 'Turbo' ];
        this._mapW         = 0;
        this._mapH         = 0;

    }

    // Attach the overlay element to the hub container (called once after hub is ready)
    mount ( hubEl ) {

        this._el = document.createElement( 'div' );
        this._el.id = 'debug-overlay';
        this._el.style.cssText = 'position:absolute; top:44px; left:10px;'
            + ' background:rgba(10,16,28,0.90);'
            + ' border:1px solid rgba(74,158,221,0.40);'
            + ' border-radius:8px;'
            + ' padding:8px 14px;'
            + ' font:11px/1.9 monospace;'
            + ' color:rgba(140,200,255,0.92);'
            + ' pointer-events:none;'
            + ' display:none;'
            + ' z-index:20;'
            + ' min-width:170px;'
            + ' white-space:pre;';

        hubEl.appendChild( this._el );

    }

    // Show / hide the overlay
    toggle () {

        this._visible = !this._visible;
        if ( this._el ) this._el.style.display = this._visible ? 'block' : 'none';

    }

    // Called every render frame from View.loop(); `time` is the DOMHighResTimeStamp
    onFrame ( time ) {

        this._frameCount++;

        if ( this._lastFpsTime === 0 ) {
            this._lastFpsTime = time;
            return;
        }

        var elapsed = time - this._lastFpsTime;
        if ( elapsed >= 1000 ) {
            this._fps        = Math.round( this._frameCount * 1000 / elapsed );
            this._frameCount = 0;
            this._lastFpsTime = time;
            if ( this._visible ) this._refresh();
        }

    }

    // Called each time a RUN message arrives from the worker
    onWorkerTick () {

        var now = performance.now();
        this._workerTickCount++;

        if ( this._lastWorkerTime === 0 ) {
            this._lastWorkerTime = now;
            return;
        }

        var elapsed = now - this._lastWorkerTime;
        if ( elapsed >= 1000 ) {
            this._workerRate      = Math.round( this._workerTickCount * 1000 / elapsed );
            this._workerTickCount = 0;
            this._lastWorkerTime  = now;
        }

    }

    // Called whenever a silent autosave completes
    onAutoSave () {

        this._autoSaveTime = new Date().toLocaleTimeString();
        if ( this._visible ) this._refresh();

    }

    // Keep current speed index in sync (0-4)
    setSpeed ( n ) {

        this._speed = n;

    }

    // Keep map dimensions in sync; called from View.paintMap()
    setMapSize ( w, h ) {

        this._mapW = w;
        this._mapH = h;

    }

    // Re-render the overlay text
    _refresh () {

        if ( !this._el ) return;

        var mapStr    = ( this._mapW && this._mapH ) ? this._mapW + '\xd7' + this._mapH : '\u2014';
        var speedStr  = ( this._speedLabel[ this._speed ] !== undefined )
                        ? this._speedLabel[ this._speed ]
                        : String( this._speed );
        var autoStr   = this._autoSaveTime || '\u2014';
        var workerStr = this._lastWorkerTime > 0 ? this._workerRate + '/s' : '\u2014';

        this._el.innerHTML =
            '<b style="color:#74bfff;letter-spacing:0.1em;">\u25a0 DEBUG HUD</b>\n'
            + 'FPS    : ' + this._fps      + '\n'
            + 'Map    : ' + mapStr         + '\n'
            + 'Speed  : ' + speedStr       + '\n'
            + 'Worker : ' + workerStr      + '\n'
            + 'Saved  : ' + autoStr;

    }

}
