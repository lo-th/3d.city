'use strict';

var simulation;
var timer;
var infos = [];
var mapGen;
var mapSize = [128,128];
var map;
var difficulty = 2;
var speed = 3;
var isPaused = false;


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
    if( p == "PLAYMAP" ){
    	playMap();
    }

}

var newMap = function(){
	map = mapGen.construct(mapSize[0], mapSize[1]);
    var val = map.genFull();
	self.postMessage({ tell:"NEWMAP", map:val, mapSize:mapSize, island:map.isIsland });
}

var playMap = function(){
	simulation = new Micro.Simulation( map, difficulty, speed);
	timer = setInterval(update, 1000/60);
}

var update = function(){
	//handleInput();
    //mouse = U.calculateMouseForPaint();

    if (!isPaused){
        simulation.simFrame();
        simulation.updateFrontEnd();
        processMessages(simulation.messageManager.getMessages());
        simulation.spriteManager.moveObjects();
    }
    //sprite = calculateSpritesForPaint();
    //gameCanvas.paint(mouse, sprite, isPaused);
    self.postMessage({ tell:"RUN", infos:infos });
}

var processMessages = function(messages) {
        // Don't want to output more than one user message
        var messageOutput = false;

        for (var i = 0, l = messages.length; i < l; i++) {
            var m = messages[i];
            switch (m.message) {
                //case Messages.BUDGET_NEEDED: this.simNeededBudget = true; this.handleBudgetRequest(); break;
               // case Messages.QUERY_WINDOW_NEEDED: this.queryWindow.open(this.handleQueryClosed.bind(this)); break;
                case Messages.DATE_UPDATED: infos[0] = m.data.month; infos[1] = m.data.year; break;
                case Messages.EVAL_UPDATED: infos[2] = TXT.cityClass[m.data.classification]; infos[3] = m.data.score; infos[4] = m.data.population; break;
                case Messages.FUNDS_CHANGED: infos[5] = m.data; break;
                //case Messages.VALVES_UPDATED: this.rci.update(m.data.residential, m.data.commercial, m.data.industrial); break;
                default: 
                    if (!messageOutput && TXT.goodMessages[m.message] !== undefined) { 
                        infos[6] = TXT.goodMessages[m.message]; 
                        break;
                    }
                    if (!messageOutput && TXT.badMessages[m.message] !== undefined) {
                        messageOutput = true;
                        infos[6] = TXT.badMessages[m.message];
                        break;
                    }
                    if (!messageOutput && TXT.neutralMessages[m.message] !== undefined) {
                        messageOutput = true;
                        infos[6] = TXT.neutralMessages[m.message] ;
                        break;
                    }
            }
        }
    }