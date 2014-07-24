V3D.stats = function(renderer){
	this.glS = new glStats();
    this.tS = new threeStats( renderer );

    this.rS = new rStats( {
        values: {
            frame: { caption: 'Total frame time (ms)', over: 16, average: true, avgMs: 100 },
            fps: { caption: 'Framerate (FPS)', below: 30 },
            calls: { caption: 'Calls (three.js)', over: 3000 },
            raf: { caption: 'Time since last rAF (ms)', average: true, avgMs: 100 },
            rstats: { caption: 'rStats update (ms)', average: true, avgMs: 100 },
            texture: { caption: 'GenTex', average: true, avgMs: 100 }
        },
        groups: [
            { caption: 'Framerate', values: [ 'fps', 'raf' ] },
            { caption: 'Frame Budget', values: [ 'frame', 'texture', 'setup', 'render' ] }
        ],
        fractions: [
            { base: 'frame', steps: [ 'texture', 'setup', 'render' ] }
        ],
        plugins: [
            this.tS,
            this.glS
        ]
    } );
}

V3D.stats.prototype = {
    constructor: V3D.stats,
    start:function() {
    	this.rS( 'frame' ).start();
    	this.glS.start();
    	this.rS( 'rAF' ).tick();
    	this.rS( 'FPS' ).frame();
    	//this.rS( 'setup' ).start();
    	//stats.rS( 'render' ).start();
    },
    end:function() {
    	//this.rS( 'setup' ).end();
    	//this.rS( 'render' ).end();
    	this.rS( 'frame' ).end();

    	this.rS().update();
    }
}