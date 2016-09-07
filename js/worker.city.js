'use strict';
var transMessage = self.webkitPostMessage || self.postMessage;

var CITY = {};
var timer;
//var timestep = 1000/30;
var Game;
var pcount = 0;
var power;

//var ab = new ArrayBuffer( 1 );
//transMessage( ab, [ab] );
var trans = false;// ( ab.byteLength === 0 );

self.onmessage = function (e) {
	var p = e.data.tell;
	if( p == "INIT" ) Game = new CITY.Game(e.data.url, e.data.timestep);
    if( p == "NEWMAP" ) Game.newMap(); 
    if( p == "PLAYMAP" ) Game.playMap();
    if( p == "TOOL" ) Game.tool(e.data.name);
    if( p == "MAPCLICK" ) Game.mapClick(e.data.x, e.data.y);

    if( p == "DESTROY" ) Game.destroy(e.data.x, e.data.y);

    //if( p == "RUN" && trans) updateTrans(e.data);

    if( p == "DIFFICULTY" ) Game.changeDifficulty(e.data.n);
    if( p == "SPEED" ) Game.changeSpeed(e.data.n);

    if( p == "BUDGET") Game.handleBudgetRequest();
    if( p == "NEWBUDGET") Game.setBudget(e.data.budgetData);

    if( p == "DISASTER") Game.setDisaster(e.data.disaster);

    if( p == "EVAL") Game.getEvaluation();

    if( p == "SAVEGAME") Game.saveGame(e.data.saveCity);
    if( p == "LOADGAME") Game.loadGame(e.data.isStart);
    if( p == "MAKELOADGAME") Game.makeLoadGame(e.data.savegame, e.data.isStart);
};

/*var updateTrans = function(data){
    if (!Game.isPaused){
        Game.simulation.needPower = [];
        Game.simulation.simFrame();
        Game.simulation.updateFrontEnd();

        Game.processMessages(Game.simulation.messageManager.getMessages());
        Game.simulation.spriteManager.moveObjects();
    }
    //Game.getTiles();
    //Game.animatedTiles();
    Game.calculateSprites();
    //sprite = calculateSpritesForPaint();
    //gameCanvas.paint(mouse, sprite, isPaused);
    //transMessage({ tell:"RUN", infos:Game.infos, sprites:Game.map.genFull() });
    //transMessage({ tell:"RUN", infos:Game.infos, tiles:Game.tilesData, anims:Game.animsData, sprites:Game.spritesData});
    var tilesData = data.tilesData;
    var i = tilesData.length;
    while(i--){tilesData[i] = Game.map.tilesData[i];}

    transMessage({ tell:"RUN", infos:Game.infos, tilesData:tilesData, anims:Game.animsData, sprites:Game.spritesData}, [tilesData.buffer]);
};*/

var update = function(){
    power = null;
    if (!Game.isPaused){
        pcount++;
        //Game.simulation.needPower = [];
        Game.simulation.simFrame();
        Game.simulation.updateFrontEnd();

        Game.processMessages(Game.simulation.messageManager.getMessages());
        Game.simulation.spriteManager.moveObjects();
        if(pcount==30){
            pcount = 0;
            power = Game.map.powerData;
            //power = Game.simulation.needPower;
        }
    }
    //Game.getTiles();
    //Game.animatedTiles();
    Game.calculateSprites();
    //sprite = calculateSpritesForPaint();
    //gameCanvas.paint(mouse, sprite, isPaused);
    //transMessage({ tell:"RUN", infos:Game.infos, sprites:Game.map.genFull() });
    //transMessage({ tell:"RUN", infos:Game.infos, tiles:Game.tilesData, anims:Game.animsData, sprites:Game.spritesData});
    //var tilesData = Game.map.tilesData;

    transMessage({ tell:"RUN", infos:Game.infos, tilesData:Game.map.tilesData, powerData:power, sprites:Game.spritesData});
    //transMessage({ tell:"RUN", infos:Game.infos, tilesData:Game.map.data, powerData:power, sprites:Game.spritesData});
};

CITY.Game = function(url, timestep) {
    importScripts(url);
    this.timestep = timestep;

    this.mapSize = [128,128];
    this.difficulty = 0;
    this.speed = 2;
    this.oldSpeed = 0;
    this.mapGen = new Micro.generateMap();

    this.simulation = null;
    this.gameTools = null;
    this.animationManager = null;
    this.map = null;

    this.isPaused = false;
    this.simNeededBudget = false;
    this.currentTool = null;
    this.timer = null;
    this.infos = [];
    this.sprites = [];

    this.spritesData = null;
    this.animsData = null;
    //this.tilesData = null;

    this.spritesData  = [];

    //this.needMapUpdate = false;


    this.newMap();
};

CITY.Game.prototype = {
    constructor: CITY.Game,
    newMap: function () {

        this.map = this.mapGen.construct( this.mapSize[0], this.mapSize[1] );
        transMessage({ tell:"NEWMAP", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, trans:trans });
        //transMessage({ tell:"NEWMAP", tilesData:this.map.data, mapSize:this.mapSize, island:this.map.isIsland, trans:trans });
    },
    playMap: function( loading ){
        var messageMgr = new Micro.MessageManager();
        var money = 20000;
        if(this.difficulty == 1) money = 10000;
        if(this.difficulty == 2) money = 5000;
        this.gameTools = new Micro.GameTools(this.map);
        this.animationManager = new Micro.AnimationManager(this.map);

        if(loading){
            money = this.savedGame.totalFunds;
            //this.infos[3] = this.savedGame.totalPop;
            this.speed = this.savedGame.speed;
            this.difficulty = this.savedGame.difficulty;
            this.simulation = new Micro.Simulation( this.map, this.difficulty, this.speed, true, this.savedGame);
            //this.processMessages(Messages.EVAL_UPDATED);
            messageMgr.sendMessage(Messages.WELCOMEBACK);
        }else{
            this.simulation = new Micro.Simulation( this.map, this.difficulty, this.speed, true);
            messageMgr.sendMessage(Messages.WELCOME);
        }

        this.simulation.budget.setFunds(money);
        messageMgr.sendMessage(Messages.FUNDS_CHANGED, money);
        this.processMessages(messageMgr.getMessages());

        // update simulation time
        this.isPaused = false
        //if(!trans) 
        this.timer = setInterval(update, 1000/this.timestep);
        //else update();
    },
    changeTimeStep :function(n){
        clearInterval(this.timer);
        this.timestep = n;
        this.timer = setInterval(update, 1000/this.timestep);
    },
    changeSpeed :function(n){
        // 0:pause  1:slow  2:medium  3:fast
        this.speed = n;
        if(this.speed === 0) this.isPaused = true;
        else this.isPaused = false;

        if(this.speed === 4){
            this.changeTimeStep(60);
            this.simulation.setSpeed(this.speed-1);
        } else {
            if(this.timestep===60) this.changeTimeStep(30);
            this.simulation.setSpeed(this.speed);
        }
    },
    changeDifficulty:function(n){
        // 0: easy  1: medium  2: hard
        this.difficulty = n;
        if(this.simulation) this.simulation.setDifficulty ( this.difficulty );
    },
    animatedTiles : function() {
        var animTiles = this.animationManager.getTiles(0, 0, this.mapSize[0] + 1, this.mapSize[1] + 1, this.isPaused);
        var i = animTiles.length;
        this.animsData = new M_ARRAY_TYPE(i); 
        while(i--){
            var tile = animTiles[i];
            this.animsData[i] = [tile.tileValue, tile.x, tile.y];
        }
    },
    calculateSprites : function() {
        this.sprites = this.simulation.spriteManager.getSpritesInView(0, 0, this.mapSize[0] + 1, this.mapSize[1] + 1);
        var i = this.sprites.length;
        //this.spritesData = new M_ARRAY_TYPE(i);
        while(i--){
            var sprite = this.sprites[i];
            this.spritesData[i] = [sprite.type, sprite.frame, sprite.x || 0, sprite.y || 0];
        }
    },
    processMessages : function(messages) {
        var messageOutput = false;

        for (var i = 0, l = messages.length; i < l; i++) {
            var m = messages[i];
            switch (m.message) {
                case Messages.BUDGET_NEEDED: this.simNeededBudget = true; this.handleBudgetRequest(); break;
                case Messages.QUERY_WINDOW_NEEDED: transMessage({tell:"QUERY", queryTxt:this.currentTool.getInfo() }); break;
                case Messages.DATE_UPDATED: this.infos[0] = [TXT.months[ m.data.month ], m.data.year].join(' '); break;
                case Messages.EVAL_UPDATED: this.infos[1] = TXT.cityClass[m.data.classification]; this.infos[2] = m.data.score; this.infos[3] = m.data.population; break;
                case Messages.FUNDS_CHANGED: this.infos[4] = m.data; break;
                case Messages.VALVES_UPDATED: this.infos[5] = m.data.residential; this.infos[6] = m.data.commercial; this.infos[7] = m.data.industrial; break;
                default: 
                    if (!messageOutput && TXT.goodMessages[m.message] !== undefined) { 
                        this.infos[8] = TXT.goodMessages[m.message]; 
                        break;
                    }
                    if (!messageOutput && TXT.badMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.infos[8] = TXT.badMessages[m.message];
                        break;
                    }
                    if (!messageOutput && TXT.neutralMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.infos[8] = TXT.neutralMessages[m.message] ;
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
    destroy : function(x,y){
        this.mapClick(x,y);
        this.map.powerData[this.findId(x,y)] = 1;
       // this.simulation.powerManager.setTilePower(x,y);
      //  var messageMgr = new Micro.MessageManager();
       // this.gameTools["bulldozer"].doTool(x, y, messageMgr, this.simulation.blockMaps );
    },
    findId : function(x, y){
        var id = x+(y*this.mapSize[1]);
        return id;
    },
    mapClick : function(x,y){
        if(this.currentTool!==null){
            //console.log(this.currentTool[0])
            var budget = this.simulation.budget;
            var evaluation = this.simulation.evaluation;
            var messageMgr = new Micro.MessageManager();
            this.currentTool.doTool(x, y, messageMgr, this.simulation.blockMaps );
            this.currentTool.modifyIfEnoughFunding(budget, messageMgr);
            var tell = "";

            switch (this.currentTool.result) {
                case this.currentTool.TOOLRESULT_NEEDS_BULLDOZE: tell = TXT.toolMessages.needsDoze; break;
                case this.currentTool.TOOLRESULT_NO_MONEY: tell = TXT.toolMessages.noMoney; break; 
                default: 
                    tell = '&nbsp;';
                    //if( id >= 11  && id != 15 ) this.needMapUpdate = true;
                    transMessage({tell:"BUILD", x:x, y:y });  
                break;
            }
            
            this.processMessages(messageMgr.getMessages());
        }
    },
    setDisaster : function(disaster){
        if (disaster === Micro.DISASTER_NONE) return;
        var m = new Micro.MessageManager();
        switch (disaster) {
            case Micro.DISASTER_MONSTER: this.simulation.spriteManager.makeMonster(m); break;
            case Micro.DISASTER_FIRE: this.simulation.disasterManager.makeFire(m); break;
            case Micro.DISASTER_FLOOD: this.simulation.disasterManager.makeFlood(m); break;
            case Micro.DISASTER_CRASH: this.simulation.disasterManager.makeCrash(m); break;
            case Micro.DISASTER_MELTDOWN: this.simulation.disasterManager.makeMeltdown(m); break;
            case Micro.DISASTER_TORNADO: this.simulation.spriteManager.makeTornado(m); break;
        }
        this.processMessages(m.getMessages());
    },
    setBudget : function(budgetData){
        this.simulation.budget.cityTax = budgetData[0];
        this.simulation.budget.roadPercent = budgetData[1]/100;
        this.simulation.budget.firePercent = budgetData[2]/100;
        this.simulation.budget.policePercent = budgetData[3]/100;
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

        transMessage({ tell:"BUDGET", budgetData:budgetData});

        if (this.simNeededBudget) {
            this.simulation.budget.doBudget(this.simulation.messageManager);
            this.simNeededBudget = false;
        } else {
            this.simulation.budget.updateFundEffects();
        }



        
        //this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
        // Let the input know we handled this request
        //this.inputStatus.budgetHandled();
    },

    getEvaluation : function(){
        var evaluation = this.simulation.evaluation;
        var problemes = "";
        for (var i = 0; i < 4; i++) {
            var problemNo = evaluation.getProblemNumber(i);
            var text = '';
            if (problemNo !== -1) text =TXT.problems[problemNo];
            problemes += text+"<br>";
        }

        var evalData = [ evaluation.cityYes, problemes];

        transMessage({ tell:"EVAL", evalData:evalData});

    },


    //______________________________________ SAVE


    saveGame : function(cityData){
        //this.oldSpeed = this.speed;
        //this.changeSpeed(0);

        var gameData = {name:"Yoooooo", everClicked: true};
        gameData.speed = this.speed;
        gameData.difficulty = this.difficulty;
        gameData.version = Micro.CURRENT_VERSION;
        gameData.city = cityData;
        this.simulation.save(gameData);

        gameData = JSON.stringify(gameData);
        
        transMessage({ tell:"SAVEGAME", gameData:gameData, key:Micro.KEY });

        //this.changeSpeed(this.oldSpeed);
    },
    /*makeSaveGame : function(gameData){
        gameData.version = Micro.CURRENT_VERSION;
        gameData = JSON.stringify(gameData);
    }*/

    //______________________________________ LOAD

    loadGame : function(atStart){
        var isStart = atStart || false;
        transMessage({ tell:"LOADGAME", key:Micro.KEY, isStart:isStart }); 
    }, 
    makeLoadGame: function(gameData, atStart){
        var isStart = atStart || false;
        clearInterval(this.timer);
        this.savedGame = JSON.parse(gameData);

        //this.simulation.load(this.savedGame);
        //this.map = this.simulation.map;
       // this.everClicked = savedGame.everClicked;
        //if (savedGame.version !== Micro.CURRENT_VERSION) this.transitionOldSave(savedGame);
        //savedGame.isSavedGame = true;
        /*if(this.map){
            this.map.load(this.savedGame);
        }else{*/
        this.map = new Micro.GameMap(Micro.MAP_WIDTH, Micro.MAP_HEIGHT); 
        this.map.load(this.savedGame);
        //}
        
        //

        this.playMap(true);
        //this.simulation.map = this.map;

        //
        //this.map = this.simulation.map;

        transMessage({ tell:"FULLREBUILD", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, cityData:this.savedGame.city, isStart:isStart });
    },
    transitionOldSave : function (savedGame) {
        switch (savedGame.version) {
            case 1: savedGame.everClicked = false;
            /* falls through */
            case 2:
                savedGame.pollutionMaxX = Math.floor(savedGame.width / 2);
                savedGame.pollutionMaxY = Math.floor(savedGame.height / 2);
                savedGame.cityCentreX = Math.floor(savedGame.width / 2);
                savedGame.cityCentreY = Math.floor(savedGame.height / 2);
            break;
            //default: throw new Error('Unknown save version!');
        }
    }

};