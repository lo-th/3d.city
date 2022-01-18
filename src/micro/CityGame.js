
import { Micro } from './Micro.js';
import { Tile } from './Tile.js';

import { MessageManager } from './MessageManager.js';
import { Messages } from './Messages.js';
import { TXT } from './Text.js';

import { Simulation } from './Simulation.js';
import { AnimationManager } from './game/AnimationManager.js';

import { GameMap } from './map/GameMap.js';
import { MapGenerator} from './map/MapGenerator.js';

// game TOOL
import { BuildingTool } from './tool/BuildingTool.js';
import { BulldozerTool } from './tool/BulldozerTool.js';
import { ParkTool } from './tool/ParkTool.js';
import { RailTool } from './tool/RailTool.js';
import { RoadTool } from './tool/RoadTool.js';
import { QueryTool } from './tool/QueryTool.js';
import { WireTool } from './tool/WireTool.js';


const postMessage = self.webkitPostMessage || self.postMessage;


var timer;
//var timestep = 1000/30;
var Game;
var pcount = 0;
var power;
var isWorker = true;
var returnMessage

//var ab = new ArrayBuffer( 1 );
//CityGame.post( ab, [ab] );
var trans = false;// ( ab.byteLength === 0 );


self.onmessage = function ( e ) { CityGame.message( e ) }


export class CityGame {

    static message ( e ) {

        var p = e.data.tell;

        if( p == "INIT" ) {

            if( e.data.returnMessage ){

                returnMessage = e.data.returnMessage;
                isWorker = false;

            }

            Game = new MainGame( e.data.timestep )

        }


        if( p == "NEWMAP" ) Game.newMap(); 
        if( p == "PLAYMAP" ) Game.playMap();
        if( p == "TOOL" ) Game.tool(e.data.name);
        if( p == "MAPCLICK" ) Game.mapClick(e.data.x, e.data.y, e.data.single || false);

        //if( p == "DESTROY" ) Game.destroy(e.data.x, e.data.y);

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

    }

    static post ( e, buffer ){

        if( isWorker ) postMessage( e, buffer );
        else returnMessage( { data : e } );

    }



}


var update = function(){

    Game.tick()

}


export class MainGame {

    constructor ( timestep ) {

        this.timestep = timestep;

        this.mapSize = [128,128];
        this.difficulty = 1;
        this.speed = 2;
        this.oldSpeed = 0;
        this.mapGen = new MapGenerator();

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

        this.power = null;

        CityGame.post({ tell:"READY" });

    }

    next ( delay = 0 ) {

        this.timer = setTimeout( update, delay );

    }

    stop (){

        if( this.timer === null ) return;
        clearInterval( this.timer );
        this.timer = null

    }

    tick () {

        //if ( this.isPaused ) return

        let up = this.simulation.simTick();

        if( up ) { 

            this.infos = this.simulation.infos;

            this.processMessages( Game.simulation.messageManager.getMessages() );

            if( Micro.haveMapAnimation ) this.animatedTiles()

            this.simulation.spriteManager.moveObjects();
            this.calculateSprites();

            CityGame.post({ tell:"RUN", infos:this.infos, tilesData:this.map.tilesData, powerData:this.map.powerData, sprites:this.spritesData, layer:this.map.layer });

            this.map.resetLayer();

        }

        this.next()

    }

    newMap () {

        this.map = this.mapGen.construct( this.mapSize[0], this.mapSize[1] );
        CityGame.post({ tell:"NEWMAP", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, trans:trans });

    }

    playMap ( loading ) {

        var messageMgr = new MessageManager();
        var money = 20000;
        if(this.difficulty == 1) money = 10000;
        if(this.difficulty == 2) money = 5000;

        this.gameTools = {
            airport: new BuildingTool(10000, Tile.AIRPORT, this.map, 6, false),
            bulldozer: new BulldozerTool(this.map),
            coal: new BuildingTool(3000, Tile.POWERPLANT, this.map, 4, false),
            commercial: new BuildingTool(100, Tile.COMCLR, this.map, 3, false),
            fire: new BuildingTool(500, Tile.FIRESTATION, this.map, 3, false),
            industrial: new BuildingTool(100, Tile.INDCLR, this.map, 3, false),
            nuclear: new BuildingTool(5000, Tile.NUCLEAR, this.map, 4, true),
            park: new ParkTool(this.map),
            police: new BuildingTool(500, Tile.POLICESTATION, this.map, 3, false),
            port: new BuildingTool(3000, Tile.PORT, this.map, 4, false),
            rail: new RailTool(this.map),
            residential: new BuildingTool(100, Tile.FREEZ, this.map, 3, false),
            road: new RoadTool(this.map),
            query: new QueryTool(this.map),
            stadium: new BuildingTool(5000, Tile.STADIUM, this.map, 4, false),
            wire: new WireTool(this.map),
        };

        if( Micro.haveMapAnimation ) this.animationManager = new AnimationManager( this.map );

        if(loading){
            money = this.savedGame.totalFunds;
            //this.infos[3] = this.savedGame.totalPop;
            this.speed = this.savedGame.speed;
            this.difficulty = this.savedGame.difficulty;
            this.simulation = new Simulation( this.map, this.difficulty, this.speed, true, this.savedGame);
            //this.processMessages(Messages.EVAL_UPDATED);
            messageMgr.sendMessage(Messages.WELCOMEBACK);

        }else{
            this.simulation = new Simulation( this.map, this.difficulty, this.speed, true);
            messageMgr.sendMessage(Messages.WELCOME);

        }

        this.simulation.budget.setFunds(money);
        //messageMgr.sendMessage(Messages.FUNDS_CHANGED, money);
        this.processMessages( messageMgr.getMessages() );

        // update simulation time
        this.isPaused = false
        //if(!trans) 
        //this.timer = setInterval(update, 1000/this.timestep);
        //this.timer = setInterval(update, 0);
        //else update();

        this.tick()

        //this.next()
    }

    

    /*changeTimeStep (n){

        clearInterval(this.timer);
        this.next()
        //this.timestep = n;
        //this.timer = setInterval(update, 1000/this.timestep)
        //this.timer = setInterval(update, 0);

    }*/

    changeSpeed (n){
        // 0:pause  1:slow  2:medium  3:fast
        this.speed = n;
        this.simulation.setSpeed(this.speed);

        if(this.speed === 0) { 
            this.isPaused = true;
            this.stop();
        } else {
            if( this.isPaused ){
                this.isPaused = false;
                this.stop();
                this.tick()
            }

        }

        

        /*if(this.speed === 4){
            
            this.simulation.setSpeed(this.speed-1);
        } else {
            
            this.simulation.setSpeed(this.speed);
        }*/
    }

    changeDifficulty(n){
        // 0: easy  1: medium  2: hard
        this.difficulty = n;
        if(this.simulation) this.simulation.setDifficulty ( this.difficulty );
    }

    animatedTiles () {

        var animTiles = this.animationManager.getTiles(0, 0, this.mapSize[0] + 1, this.mapSize[1] + 1, this.isPaused );
        var i = animTiles.length;
        this.animsData = new Micro.M_ARRAY_TYPE(i); 
        while(i--){
            var tile = animTiles[i];
            this.animsData[i] = [ tile.tileValue, tile.x, tile.y ];
        }
    }

    calculateSprites () {
        this.sprites = this.simulation.spriteManager.getSpritesInView(0, 0, this.mapSize[0] + 1, this.mapSize[1] + 1);
        var i = this.sprites.length;
        //this.spritesData = new M_ARRAY_TYPE(i);
        while(i--){
            var sprite = this.sprites[i];
            this.spritesData[i] = [sprite.type, sprite.frame, sprite.x || 0, sprite.y || 0];
        }
    }

    processMessages ( messages ) {

        var messageOutput = false;

        for (var i = 0, l = messages.length; i < l; i++) {
            var m = messages[i];
            switch (m.message) {
                case Messages.BUDGET_NEEDED: this.simNeededBudget = true; this.handleBudgetRequest(); break;
                case Messages.QUERY_WINDOW_NEEDED: CityGame.post({tell:"QUERY", queryTxt:this.currentTool.getInfo() }); break;
                //case Messages.DATE_UPDATED: this.infos[0] = [TXT.months[ m.data.month ], m.data.year].join(' '); break;
               // case Messages.EVAL_UPDATED: this.infos[1] = TXT.cityClass[m.data.classification]; this.infos[2] = m.data.score; this.infos[3] = m.data.population; break;
                //case Messages.FUNDS_CHANGED: this.infos[4] = m.data; break;
                //case Messages.VALVES_UPDATED: this.infos[5] = m.data.residential; this.infos[6] = m.data.commercial; this.infos[7] = m.data.industrial; break;
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
    }

    tool (name){

        if(this.currentTool!==null) this.currentTool.clear();
        if(name !== "none") this.currentTool = this.gameTools[name];
        else this.currentTool = null;
        
    }

    destroy (x,y){

        console.log('isDestroy')

        //console.log( 'destuct ', x, y )

       //this.mapClick(x,y);
        //this.map.powerData[this.findId(x,y)] = 1;

       // this.simulation.powerManager.setTilePower(x,y);
      //  var messageMgr = new Micro.MessageManager();
       // this.gameTools["bulldozer"].doTool(x, y, messageMgr, this.simulation.blockMaps );
    }

    findId (x, y){
        var id = x+(y*this.mapSize[1]);
        return id;
    }

    mapClick (x,y, single){
        if( this.currentTool !== null ){
            //console.log(this.currentTool[0])
            var budget = this.simulation.budget;
            var evaluation = this.simulation.evaluation;
            var messageMgr = new MessageManager();
            this.currentTool.doTool(x, y, this.simulation.blockMaps, messageMgr );
            this.currentTool.modifyIfEnoughFunding(budget, messageMgr);
            var tell = "";

            switch (this.currentTool.result) {
                case this.currentTool.TOOLRESULT_NEEDS_BULLDOZE: tell = TXT.toolMessages.needsDoze; break;
                case this.currentTool.TOOLRESULT_NO_MONEY: tell = TXT.toolMessages.noMoney; break; 
                default: 
                    tell = '&nbsp;';
                    //if( id >= 11  && id != 15 ) this.needMapUpdate = true;
                    if(!single) CityGame.post({tell:"BUILD", x:x, y:y });  
                break;
            }
            
            this.processMessages(messageMgr.getMessages());
        }
    }

    setDisaster (disaster){
        if (disaster === Micro.DISASTER_NONE) return;
        var m = new MessageManager();
        switch (disaster) {
            case Micro.DISASTER_MONSTER: this.simulation.spriteManager.makeMonster(m); break;
            case Micro.DISASTER_FIRE: this.simulation.disasterManager.makeFire(m); break;
            case Micro.DISASTER_FLOOD: this.simulation.disasterManager.makeFlood(m); break;
            case Micro.DISASTER_CRASH: this.simulation.disasterManager.makeCrash(m); break;
            case Micro.DISASTER_MELTDOWN: this.simulation.disasterManager.makeMeltdown(m); break;
            case Micro.DISASTER_TORNADO: this.simulation.spriteManager.makeTornado(m); break;
        }
        this.processMessages(m.getMessages());
    }

    setBudget (budgetData){
        this.simulation.budget.cityTax = budgetData[0];
        this.simulation.budget.roadPercent = budgetData[1]/100;
        this.simulation.budget.firePercent = budgetData[2]/100;
        this.simulation.budget.policePercent = budgetData[3]/100;
    }

    handleBudgetRequest () {

        this.budgetShowing = true;

        let budgetData = {
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

        CityGame.post({ tell:"BUDGET", budgetData:budgetData});

        if (this.simNeededBudget) {
            this.simulation.budget.doBudgetWindow();
            this.simNeededBudget = false;
        } else {
            this.simulation.budget.updateFundEffects();
        }



        
        //this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
        // Let the input know we handled this request
        //this.inputStatus.budgetHandled();
    }

    getEvaluation (){
        let evaluation = this.simulation.evaluation;
        let problemes = "";
        for (var i = 0; i < 4; i++) {
            let problemNo = evaluation.getProblemNumber(i);
            let text = '';
            if (problemNo !== -1) text =TXT.problems[problemNo];
            problemes += text+"<br>";
        }

        let evalData = [ evaluation.cityYes, problemes];

        CityGame.post({ tell:"EVAL", evalData:evalData});

    }


    //______________________________________ SAVE


    saveGame (cityData){
        //this.oldSpeed = this.speed;
        //this.changeSpeed(0);

        let gameData = {name:"Yoooooo", everClicked: true};
        gameData.speed = this.speed;
        gameData.difficulty = this.difficulty;
        gameData.version = Micro.CURRENT_VERSION;
        gameData.city = cityData;
        this.simulation.save(gameData);

        gameData = JSON.stringify(gameData);
        
        CityGame.post({ tell:"SAVEGAME", gameData:gameData, key:Micro.KEY });

        //this.changeSpeed(this.oldSpeed);
    }
    /*makeSaveGame : function(gameData){
        gameData.version = Micro.CURRENT_VERSION;
        gameData = JSON.stringify(gameData);
    }*/

    //______________________________________ LOAD

    loadGame (atStart){
        var isStart = atStart || false;
        CityGame.post({ tell:"LOADGAME", key:Micro.KEY, isStart:isStart }); 
    }

    makeLoadGame( gameData, atStart ) {



        let isStart = atStart || false;
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
        this.map = new GameMap(Micro.MAP_WIDTH, Micro.MAP_HEIGHT);
        this.map.load(this.savedGame);
        //}
        
        //

        //this.playMap(true);
        //this.simulation.map = this.map;//return
        //
        //this.map = this.simulation.map;

        CityGame.post({ tell:"FULLREBUILD", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, cityData:this.savedGame.city, isStart:isStart });
    }

    transitionOldSave  (savedGame) {
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

}