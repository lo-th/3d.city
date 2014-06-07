Micro.SplashScreen = function(tileSet, spriteSheet){
    this.debug = document.getElementById("debug");
    
    this.tileSet = tileSet;
    this.spriteSheet = spriteSheet;
    this.mapGen  = new Micro.generateMap();
    this.map = this.mapGen.construct();//Micro.MapGenerator();

    document.getElementById('splashGenerate').addEventListener( 'click', this.regenerateMap.bind(this), false );
    document.getElementById('splashPlay').addEventListener( 'click', this.playMap.bind(this), false );

    var g = document.getElementsByClassName('awaitGeneration');
    for(var i=0; i<g.length; i++){
        g[i].style.display = 'block';
    }

    this.splashCanvas = new Micro.SplashCanvas();
    this.splashCanvas.init(this.map, tileSet);
    
    //this.view3d.updateTerrain(this.splashCanvas.canvas, Micro.MAP_WIDTH, this.map.isIsland);
    //this.debug.innerHTML = this.map.data;
    //this.map.isIsland;
    //console.log(this.map.data)
}

Micro.SplashScreen.prototype = {
    constructor: Micro.SplashScreen,

    regenerateMap : function() {
        this.splashCanvas.clearMap();
        this.map = this.mapGen.construct();//Micro.generateMap();//Micro.MapGenerator();
        this.splashCanvas.paint(this.map);
        //this.view3d.updateTerrain(this.splashCanvas.canvas, Micro.MAP_WIDTH, this.map.isIsland );
        //this.debug.innerHTML = this.map.isIsland;
    },
    playMap : function() {
        var difficulty = 0;
        var d = document.getElementsByName('difficulty');
        for(var i= 0; i< d.length; i++){
            if (d[i].type === 'radio' && d[i].checked) difficulty=parseInt(d[i].value);
        }
        document.getElementById('splashGenerate').removeEventListener( 'click', this.regenerateMap.bind(this), false );
        document.getElementById('splashPlay').removeEventListener( 'click', this.playMap.bind(this), false );
        document.getElementById('splashContainer').innerHTML = "";

        

        // Actually launch the game
        var g = new Micro.Game(this.map, this.tileSet, this.spriteSheet, difficulty);
    }
}  
