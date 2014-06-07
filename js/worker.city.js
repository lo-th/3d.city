'use strict';

var simulation, gameTools;
var timer;
var infos = [];
var mapGen;
var mapSize = [128,128];
var map;
var difficulty = 2;
var speed = 3;
var isPaused = false;
var simNeededBudget = false;
var currentTool = null;


//var tool = [];

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
    if( p == "TOOL" ){
    	tool(e.data.name);
    }
    if( p == "MAPCLICK" ){
    	mapClick(e.data.x, e.data.y);
    }
    if( p == "PLAYMAP" ){
    	playMap();
    }

}
var tool = function(name){
	if(currentTool!==null) currentTool.clear();
    if(name !== "none") currentTool = gameTools[name];
    else currentTool = null;
}

var mapClick = function(x,y){
	if(currentTool!==null){
        var budget = simulation.budget;
        var evaluation = simulation.evaluation;
        var messageMgr = new Micro.MessageManager();
        currentTool.doTool(x, y, messageMgr, simulation.blockMaps );
        currentTool.modifyIfEnoughFunding(budget, messageMgr);
        var tell = "";
        switch (currentTool.result) {
            case currentTool.TOOLRESULT_NEEDS_BULLDOZE: tell = TXT.toolMessages.needsDoze; break;
            case currentTool.TOOLRESULT_NO_MONEY: tell = TXT.toolMessages.noMoney; break; 
            default: tell = '&nbsp;';
        }
        processMessages(messageMgr.getMessages());
	}
}

var newMap = function(){
	map = mapGen.construct(mapSize[0], mapSize[1]);
	gameTools = new Micro.GameTools(map);
    var val = map.genFull();
	self.postMessage({ tell:"NEWMAP", map:val, mapSize:mapSize, island:map.isIsland });
}

var playMap = function(){
    var money = 20000 / difficulty; 

	simulation = new Micro.Simulation( map, difficulty, speed);

    // intro message
    var messageMgr = new Micro.MessageManager();
    messageMgr.sendMessage(Messages.WELCOME);
    simulation.budget.setFunds(money);
    messageMgr.sendMessage(Messages.FUNDS_CHANGED, money);
    processMessages(messageMgr.getMessages());

    // update simulation time
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
    var messageOutput = false;

    for (var i = 0, l = messages.length; i < l; i++) {
        var m = messages[i];
        switch (m.message) {
            case Messages.BUDGET_NEEDED: simNeededBudget = true; handleBudgetRequest(); break;
           // case Messages.QUERY_WINDOW_NEEDED: this.queryWindow.open(this.handleQueryClosed.bind(this)); break;
            case Messages.DATE_UPDATED: infos[0] = [TXT.months[ m.data.month ], m.data.year].join(' '); break;
            case Messages.EVAL_UPDATED: infos[1] = '| ' + TXT.cityClass[m.data.classification]; infos[2] = ' | ' + m.data.score; infos[3] = ' | ' + m.data.population; break;
            case Messages.FUNDS_CHANGED: infos[4] = '| $'+m.data; break;
            case Messages.VALVES_UPDATED: infos[5] = '<br>' + m.data.residential; infos[6] = ' | ' + m.data.commercial; infos[7] = ' | ' + m.data.industrial; break;
            default: 
                if (!messageOutput && TXT.goodMessages[m.message] !== undefined) { 
                    infos[8] = '<br>' + TXT.goodMessages[m.message]; 
                    break;
                }
                if (!messageOutput && TXT.badMessages[m.message] !== undefined) {
                    messageOutput = true;
                    infos[8] = '<br>' + TXT.badMessages[m.message];
                    break;
                }
                if (!messageOutput && TXT.neutralMessages[m.message] !== undefined) {
                    messageOutput = true;
                    infos[8] = '<br>' + TXT.neutralMessages[m.message] ;
                    break;
                }
        }
    }
}
var handleBudgetRequest = function() {
    //this.budgetShowing = true;

    /*var budgetData = {
        roadFund: simulation.budget.roadFund,
        roadRate: Math.floor(simulation.budget.roadPercent * 100),
        fireFund: simulation.budget.fireFund,
        fireRate: Math.floor(simulation.budget.firePercent * 100),
        policeFund: simulation.budget.policeFund,
        policeRate: Math.floor(simulation.budget.policePercent * 100),
        taxRate: simulation.budget.cityTax,
        totalFunds: simulation.budget.totalFunds,
        taxesCollected: simulation.budget.taxFund
    };*/
   // simulation.budget.spend(2000,simulation.messageManager)

   /* if (simNeededBudget) {
        //simulation.budget.doBudget(new Micro.MessageManager());
        simulation.budget.doBudget(simulation.messageManager);
        simNeededBudget = false;
    } else {
        simulation.budget.updateFundEffects();
    }*/

    
    //this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
    // Let the input know we handled this request
    //this.inputStatus.budgetHandled();
}