'use strict';

var world;
var timer;
var infos = [];
var mapGen;
var mapSize = [128,128];
var map;

self.onmessage = function (e) {
	var p = e.data.tell;

	if( p == "INIT" ){
		importScripts(e.data.url);
		mapGen  = new Micro.generateMap();
		newMap();
    }
    if( p == "NEWMAP" ){
    	newMap();
    }
		// Init world
        /*OIMO.WORLD_SCALE = 1;
        OIMO.INV_SCALE = 1;
        world = new OIMO.World(1/60, 2, 8);
        world.gravity.init(0,-10,0);
        timer = setInterval(update, 1000/60); */
	
}

var newMap = function(){
	map = mapGen.construct(mapSize[0], mapSize[1]);
    var val = map.genFull();
	self.postMessage({ tell:"NEWMAP", map:val, mapSize:mapSize, island:map.isIsland });
}

var update = function(){
	/*world.step();
	infos[0] = world.performance.fpsint;
	self.postMessage({tell:"RUN", infos:infos});*/
}