'use strict';
var transMessage = self.webkitPostMessage || self.postMessage;

var CITY = {};
var timer;
/*var ab = new ArrayBuffer( 1 );
transferableMessage( ab, [ab] );
var SUPPORT_TRANSFERABLE = ( ab.byteLength === 0 );*/

/*var simulation, gameTools;

var infos = [];
var mapGen;
var mapSize = [128,128];
var map;
var difficulty = 2;
var speed = 3;
var isPaused = false;
var simNeededBudget = false;
var currentTool = null;*/
var Game;

self.onmessage = function (e) {
	var p = e.data.tell;
	if( p == "INIT" ) Game = new CITY.Game(e.data.url);//init(e.data.url);   
    if( p == "NEWMAP" ) Game.newMap(); 
    if( p == "PLAYMAP" ) Game.playMap();
    if( p == "TOOL" ) Game.tool(e.data.name);
    if( p == "MAPCLICK" ) Game.mapClick(e.data.x, e.data.y, e.data.id);
}

CITY.Game = function(url) {
    importScripts(url);

    this.mapSize = [128,128];
    this.difficulty = 2;
    this.speed = 3;
    this.mapGen = new Micro.generateMap();

    this.simulation = null;
    this.gameTools = null;
    this.map = null;

    this.isPaused = false;
    this.simNeededBudget = false;
    this.currentTool = null;
    this.timer = null;
    this.infos = [];

    this.newMap();
}

var update = function(){
    if (!Game.isPaused){
        Game.simulation.simFrame();
        Game.simulation.updateFrontEnd();

        Game.processMessages(Game.simulation.messageManager.getMessages());
        Game.simulation.spriteManager.moveObjects();
    }
    //sprite = calculateSpritesForPaint();
    //gameCanvas.paint(mouse, sprite, isPaused);
    transMessage({ tell:"RUN", infos:Game.infos });;
}

CITY.Game.prototype = {
    constructor: CITY.Game,
    newMap : function(){
        this.map = this.mapGen.construct(this.mapSize[0], this.mapSize[1]);
        transMessage({ tell:"NEWMAP", map:this.map.genFull(), mapSize:this.mapSize, island:this.map.isIsland });
    },
    playMap : function(){
        var money = 20000 / this.difficulty; 
        this.gameTools = new Micro.GameTools(this.map);
        this.simulation = new Micro.Simulation( this.map, this.difficulty, this.speed);

        // intro message
        var messageMgr = new Micro.MessageManager();
        messageMgr.sendMessage(Messages.WELCOME);
        this.simulation.budget.setFunds(money);
        messageMgr.sendMessage(Messages.FUNDS_CHANGED, money);
        this.processMessages(messageMgr.getMessages());

        // update simulation time
        timer = setInterval(update, 1000/60);
    },
    calculateSprites : function() {
        /*var origin = this.gameCanvas.getTileOrigin();
        var end = this.gameCanvas.getMaxTile();
        var spriteList = simulation.spriteManager.getSpritesInView(origin.x, origin.y, end.x + 1, end.y + 1);

        if (spriteList.length === 0) return null;
        return spriteList;*/
    },
    processMessages : function(messages) {
        var messageOutput = false;

        for (var i = 0, l = messages.length; i < l; i++) {
            var m = messages[i];
            switch (m.message) {
                case Messages.BUDGET_NEEDED: this.simNeededBudget = true; this.handleBudgetRequest(); break;
               // case Messages.QUERY_WINDOW_NEEDED: this.queryWindow.open(this.handleQueryClosed.bind(this)); break;
                case Messages.DATE_UPDATED: this.infos[0] = [TXT.months[ m.data.month ], m.data.year].join(' '); break;
                case Messages.EVAL_UPDATED: this.infos[1] = '| ' + TXT.cityClass[m.data.classification]; this.infos[2] = ' | ' + m.data.score; this.infos[3] = ' | ' + m.data.population; break;
                case Messages.FUNDS_CHANGED: this.infos[4] = '| $'+m.data; break;
                case Messages.VALVES_UPDATED: this.infos[5] = '<br>' + m.data.residential; this.infos[6] = ' | ' + m.data.commercial; this.infos[7] = ' | ' + m.data.industrial; break;
                default: 
                    if (!messageOutput && TXT.goodMessages[m.message] !== undefined) { 
                        this.infos[8] = '<br>' + TXT.goodMessages[m.message]; 
                        break;
                    }
                    if (!messageOutput && TXT.badMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.infos[8] = '<br>' + TXT.badMessages[m.message];
                        break;
                    }
                    if (!messageOutput && TXT.neutralMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.infos[8] = '<br>' + TXT.neutralMessages[m.message] ;
                        break;
                    }
            }
        }
    },
    tool : function(name){
        if(this.currentTool!==null) this.currentTool.clear();
        if(name !== "none") this.currentTool = this.gameTools[name];
        else this.currentTool = null;
    },
    mapClick : function(x,y,id){
        if(this.currentTool!==null){
            var budget = this.simulation.budget;
            var evaluation = this.simulation.evaluation;
            var messageMgr = new Micro.MessageManager();
            this.currentTool.doTool(x, y, messageMgr, this.simulation.blockMaps );
            this.currentTool.modifyIfEnoughFunding(budget, messageMgr);
            var tell = "";   
            switch (this.currentTool.result) {
                case this.currentTool.TOOLRESULT_NEEDS_BULLDOZE: tell = TXT.toolMessages.needsDoze; break;
                case this.currentTool.TOOLRESULT_NO_MONEY: tell = TXT.toolMessages.noMoney; break; 
                default: tell = '&nbsp;'; transMessage({tell:"BUILD", x:x, y:y, id:id });  break;
            }
            this.processMessages(messageMgr.getMessages());
        }
    },
    handleBudgetRequest : function() {
        this.budgetShowing = true;

        var budgetData = {
            roadFund: this.simulation.budget.roadFund,
            roadRate: Math.floor(this.simulation.budget.roadPercent * 100),
            fireFund: this.simulation.budget.fireFund,
            fireRate: Math.floor(this.simulation.budget.firePercent * 100),
            policeFund: this.simulation.budget.policeFund,
            policeRate: Math.floor(this.simulation.budget.policePercent * 100),
            taxRate: this.simulation.budget.cityTax,
            totalFunds: this.simulation.budget.totalFunds,
            taxesCollected: this.simulation.budget.taxFund
        };

        if (this.simNeededBudget) {
            this.simulation.budget.doBudget(this.simulation.messageManager);
            this.simNeededBudget = false;
        } else {
            this.simulation.budget.updateFundEffects();
        }

        
        //this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
        // Let the input know we handled this request
        //this.inputStatus.budgetHandled();
    }

}


/*


var init = function(url){
    importScripts(url);
    mapGen = new Micro.generateMap();
    newMap();
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

var calculateSprites = function() {
    var origin = this.gameCanvas.getTileOrigin();
    var end = this.gameCanvas.getMaxTile();
    var spriteList = simulation.spriteManager.getSpritesInView(origin.x, origin.y, end.x + 1, end.y + 1);

    if (spriteList.length === 0) return null;
    return spriteList;
}

var tool = function(name){
	if(currentTool!==null) currentTool.clear();
    if(name !== "none") currentTool = gameTools[name];
    else currentTool = null;
}

var mapClick = function(x,y,id){
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
            default: tell = '&nbsp;'; self.postMessage({tell:"BUILD", x:x, y:y, id:id });  break;
        }
        processMessages(messageMgr.getMessages());
	}
}

var update = function(){
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

    var budgetData = {
        roadFund: simulation.budget.roadFund,
        roadRate: Math.floor(simulation.budget.roadPercent * 100),
        fireFund: simulation.budget.fireFund,
        fireRate: Math.floor(simulation.budget.firePercent * 100),
        policeFund: simulation.budget.policeFund,
        policeRate: Math.floor(simulation.budget.policePercent * 100),
        taxRate: simulation.budget.cityTax,
        totalFunds: simulation.budget.totalFunds,
        taxesCollected: simulation.budget.taxFund
    };
   // simulation.budget.spend(2000,simulation.messageManager)

    if (simNeededBudget) {
        //simulation.budget.doBudget(new Micro.MessageManager());
        simulation.budget.doBudget(simulation.messageManager);
        simNeededBudget = false;
    } else {
        simulation.budget.updateFundEffects();
    }

    
    //this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
    // Let the input know we handled this request
    //this.inputStatus.budgetHandled();
}*/