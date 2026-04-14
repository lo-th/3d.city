
import { Micro } from './Micro.js';
import { Tile } from './Tile.js';

import { MessageManager } from './MessageManager.js';
import { Messages } from './Messages.js';
import { TXT } from './Text.js';

import { Simulation } from './Simulation.js';
import { AnimationManager } from './game/AnimationManager.js';

import { GameMap } from './map/GameMap.js';
import { MapGenerator} from './map/MapGenerator.js';
import { Storage } from './Storage.js';

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

let messageCount = 0;

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


        if( p == "NEWMAP" ) Game.newMap( e.data.mapSize );
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
        if( p == "ACHIEVEMENTS") Game.getAchievements();
        if( p == "HISTORY") Game.getHistory();

        if( p == "GETORDINANCES") Game.getOrdinances();
        if( p == "SETORDINANCE")  Game.setOrdinance(e.data.id);

        if( p == "ISSUEBOND")     Game.issueBond(e.data.amount);

        if( p == "GETINDUSTRYSPEC") Game.getIndustrySpec();
        if( p == "SETINDUSTRYSPEC") Game.setIndustrySpec(e.data.id);

        if( p == "GETOVERLAY") Game.getOverlayMap(e.data.type);

        if( p == "SAVEGAME") Game.saveGame(e.data.saveCity, e.data.silent);
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

        this.lastSeason  = '';

        this.spritesData  = [];

        this.power = null;

        CityGame.post({ tell:"READY" });

    }

    next ( delay = 0 ) {

        this.timer = setTimeout( update, delay );

    }

    stop (){

        if( this.timer === null ) return;
        clearTimeout( this.timer );
        this.timer = null;

    }

    tick () {

        //if ( this.isPaused ) return

        try {

            let up = this.simulation.simTick();

            if( up ) {

                this.infos = this.simulation.infos;

                this.processMessages( Game.simulation.messageManager.getMessages() );

                if( Micro.haveMapAnimation ) this.animatedTiles()

                this.simulation.spriteManager.moveObjects();
                this.calculateSprites();

                CityGame.post({ tell:"RUN", infos:this.infos, tilesData:this.map.tilesData, powerData:this.map.powerData, sprites:this.spritesData, layer:this.map.layer });

                // update all info on each season
                // TODO if too heavy get only info for open pannel !!!
                if( this.infos[17] !== this.lastSeason ){
                    this.lastSeason = this.infos[17];
                    CityGame.post({ tell:"UPDATE_INFO", budgetData:this.getData('budget'), evalData:this.getData('eval') });
                }

                this.map.resetLayer();

            }

            this.next();

        } catch ( err ) {

            // Halt the loop so the broken state does not persist.
            // Report the failure to the main thread so the UI can inform the user.
            var msg = ( err && err.message ) ? err.message : String( err );
            var stack = ( err && err.stack )  ? err.stack  : '';
            console.error( '3d city simulation tick error:', err );
            CityGame.post({ tell: 'TICKERROR', message: msg, stack: stack });
            // Do NOT call this.next() — loop is intentionally stopped.

        }

    }

    newMap ( mapSize ) {

        if( mapSize ) this.mapSize = mapSize;
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
            hospital: new BuildingTool(500, Tile.HOSPITAL, this.map, 3, false),
            industrial: new BuildingTool(100, Tile.INDCLR, this.map, 3, false),
            nuclear: new BuildingTool(5000, Tile.NUCLEAR, this.map, 4, true),
            park: new ParkTool(this.map),
            police: new BuildingTool(500, Tile.POLICESTATION, this.map, 3, false),
            port: new BuildingTool(3000, Tile.PORT, this.map, 4, false),
            rail: new RailTool(this.map),
            residential: new BuildingTool(100, Tile.FREEZ, this.map, 3, false),
            road: new RoadTool(this.map),
            query: new QueryTool(this.map),
            school: new BuildingTool(500, Tile.CHURCH, this.map, 3, false),
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



        // Clear any message left over from the previous tick so the HUD doesn't
        // display stale text when no new message arrives this tick.

        if(messageCount>0) messageCount--
        else {
            messageCount = 0;
            this.infos[8] = '';
        }
        

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

        if(this.infos[8]) messageCount = 30
    }

    tool (name){

        if(this.currentTool!==null) this.currentTool.clear();
        if(name !== "none") this.currentTool = this.gameTools[name];
        else this.currentTool = null;
        
    }

    destroy (x,y){

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
            case Micro.DISASTER_EARTHQUAKE: this.simulation.disasterManager.makeEarthquake(); break;
        }
        // Log disaster to city history
        this.simulation.cityHistory.addEvent('disaster', disaster + ' struck the city!', this.simulation.cityTime, this.simulation.startingYear);
        // Trigger "survive disaster" achievement after a delay (checked next cycle)
        this.simulation.achievements.trigger('survive_disaster');
        this.processMessages(m.getMessages());
    }

    setBudget (budgetData){
        // Format: [resTax, comTax, indTax, roadRate, fireRate, policeRate, waterRate]
        // Legacy: [resTax, comTax, indTax, roadRate, fireRate, policeRate]
        // Old:    [taxRate, roadRate, fireRate, policeRate]
        if (Array.isArray(budgetData) && budgetData.length >= 6) {
            this.simulation.budget.setZoneTax(budgetData[0], budgetData[1], budgetData[2]);
            this.simulation.budget.roadPercent   = budgetData[3] / 100;
            this.simulation.budget.firePercent   = budgetData[4] / 100;
            this.simulation.budget.policePercent = budgetData[5] / 100;
            if (budgetData.length >= 7) {
                this.simulation.budget.waterPercent = budgetData[6] / 100;
            }
            if (budgetData.length >= 8) {
                this.simulation.budget.educationPercent = budgetData[7] / 100;
            }
        } else {
            this.simulation.budget.setTax(budgetData[0]);
            this.simulation.budget.roadPercent   = budgetData[1] / 100;
            this.simulation.budget.firePercent   = budgetData[2] / 100;
            this.simulation.budget.policePercent = budgetData[3] / 100;
        }
    }

    getData( name ){

        let data = {}
        let b

        switch ( name ){

            case 'budget':
                b = this.simulation.budget;
                data = {
                    roadFund:       b.roadFund,
                    roadRate:       Math.floor(b.roadPercent * 100),
                    fireFund:       b.fireFund,
                    fireRate:       Math.floor(b.firePercent * 100),
                    policeFund:     b.policeFund,
                    policeRate:     Math.floor(b.policePercent * 100),
                    resTaxRate:     b.resTaxRate,
                    comTaxRate:     b.comTaxRate,
                    indTaxRate:     b.indTaxRate,
                    totalFunds:     b.totalFunds,
                    taxesCollected: b.taxFund,
                    bondDebt:            b.bondDebt,
                    bondAnnualPayment:   b.getBondAnnualPayment(),
                    bondMaxDebt:         b.MAX_BOND_DEBT,
                    waterFund:      b.waterFund,
                    waterRate:      Math.floor(b.waterPercent * 100),
                    educationFund:  b.educationFund,
                    educationRate:  Math.floor(b.educationPercent * 100)
                };
            break;

            case 'eval':

                let evaluation = this.simulation.evaluation;
                let problemes = "";
                for (var i = 0; i < 4; i++) {
                    let problemNo = evaluation.getProblemNumber(i);
                    let text = '';
                    if (problemNo !== -1) text = TXT.problems[problemNo];
                    problemes += text+"<br>";
                }

                let census = this.simulation.census;
                let crimeAvg = census.crimeAverage;
                let pollutionAvg = census.pollutionAverage;
                let trafficAvg = this.infos[12] || 0;

                // Enhanced eval data with education, health, happiness, unemployment, season, coverage
                let unemployment = Math.round(this._getUnemploymentPct());
                let season = this.simulation.seasonManager.getSeasonName();
                let coverage = this.simulation._computeCoverage();

                b = this.simulation.budget;
                let waterCoverage = b.waterMaintenanceBudget > 0
                    ? Math.round((b.waterEffect / Micro.MAX_WATER_EFFECT) * 100)
                    : 100;
                let educationCoverage = b.educationMaintenanceBudget > 0
                    ? Math.round((b.educationEffect / Micro.MAX_EDUCATION_EFFECT) * 100)
                    : 100;

                let indDef = this.simulation.industrySpec.getCurrentDef();

                data = [
                    evaluation.cityYes,   // 0
                    problemes,            // 1
                    crimeAvg,             // 2
                    pollutionAvg,         // 3
                    Math.round(trafficAvg), // 4
                    census.educationLevel,  // 5
                    census.healthLevel,     // 6
                    census.happinessLevel,  // 7
                    unemployment,           // 8
                    season,                 // 9
                    coverage.police,        // 10
                    coverage.fire,          // 11
                    census.parkCount,       // 12
                    waterCoverage,          // 13
                    indDef,                 // 14
                    census.hospitalPop,     // 15
                    census.churchPop,       // 16
                    educationCoverage       // 17
                ];

            break;

        }

        return data

    }

    handleBudgetRequest () {

        this.budgetShowing = true;

        //let b = this.simulation.budget;
        let budgetData = this.getData('budget')
        /*{
            roadFund:       b.roadFund,
            roadRate:       Math.floor(b.roadPercent * 100),
            fireFund:       b.fireFund,
            fireRate:       Math.floor(b.firePercent * 100),
            policeFund:     b.policeFund,
            policeRate:     Math.floor(b.policePercent * 100),
            resTaxRate:     b.resTaxRate,
            comTaxRate:     b.comTaxRate,
            indTaxRate:     b.indTaxRate,
            totalFunds:     b.totalFunds,
            taxesCollected: b.taxFund,
            bondDebt:            b.bondDebt,
            bondAnnualPayment:   b.getBondAnnualPayment(),
            bondMaxDebt:         b.MAX_BOND_DEBT,
            waterFund:      b.waterFund,
            waterRate:      Math.floor(b.waterPercent * 100),
            educationFund:  b.educationFund,
            educationRate:  Math.floor(b.educationPercent * 100)
        };*/

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
        /*let evaluation = this.simulation.evaluation;
        let problemes = "";
        for (var i = 0; i < 4; i++) {
            let problemNo = evaluation.getProblemNumber(i);
            let text = '';
            if (problemNo !== -1) text =TXT.problems[problemNo];
            problemes += text+"<br>";
        }

        let census = this.simulation.census;
        let crimeAvg = census.crimeAverage;
        let pollutionAvg = census.pollutionAverage;
        let trafficAvg = this.infos[12] || 0;

        // Enhanced eval data with education, health, happiness, unemployment, season, coverage
        let unemployment = Math.round(this._getUnemploymentPct());
        let season = this.simulation.seasonManager.getSeasonName();
        let coverage = this.simulation._computeCoverage();

        let b = this.simulation.budget;
        let waterCoverage = b.waterMaintenanceBudget > 0
            ? Math.round((b.waterEffect / Micro.MAX_WATER_EFFECT) * 100)
            : 100;
        let educationCoverage = b.educationMaintenanceBudget > 0
            ? Math.round((b.educationEffect / Micro.MAX_EDUCATION_EFFECT) * 100)
            : 100;

        let indDef = this.simulation.industrySpec.getCurrentDef();

        let evalData = [
            evaluation.cityYes,   // 0
            problemes,            // 1
            crimeAvg,             // 2
            pollutionAvg,         // 3
            Math.round(trafficAvg), // 4
            census.educationLevel,  // 5
            census.healthLevel,     // 6
            census.happinessLevel,  // 7
            unemployment,           // 8
            season,                 // 9
            coverage.police,        // 10
            coverage.fire,          // 11
            census.parkCount,       // 12
            waterCoverage,          // 13
            indDef,                 // 14
            census.hospitalPop,     // 15
            census.churchPop,       // 16
            educationCoverage       // 17
        ];*/

        let evalData = this.getData('eval')

        CityGame.post({ tell:"EVAL", evalData:evalData});
    }

    _getUnemploymentPct () {
        let census = this.simulation.census;
        let jobs = (census.comPop + census.indPop) * 8;
        if (jobs === 0) return 0;
        let ratio = census.resPop / jobs;
        return Math.min(Math.max((ratio - 1) * 100, 0), 100);
    }

    getAchievements () {
        let data = this.simulation.achievements.getAll();
        let progress = this.simulation.achievements.getProgress();
        CityGame.post({ tell:"ACHIEVEMENTS", achData: data, progress: progress });
    }

    getHistory () {
        let events = this.simulation.cityHistory.getRecent(20);
        CityGame.post({ tell:"HISTORY", historyData: events });
    }

    getOrdinances () {
        let list = this.simulation.ordinances.getList();
        let annualCost = this.simulation.ordinances.getAnnualCost();
        CityGame.post({ tell:"ORDINANCES", ordinances: list, annualCost: annualCost });
    }

    setOrdinance (id) {
        let active = this.simulation.ordinances.toggle(id);
        // Re-send the full updated list so the UI stays in sync
        this.getOrdinances();
    }

    issueBond (amount) {
        let issued = this.simulation.budget.issueBond(amount);
        if (issued) {
            this.simulation.messageManager.sendMessage(Messages.BOND_ISSUED);
            this.simulation.cityHistory.addEvent(
                'economic',
                'Issued municipal bond of $' + amount + ' (total debt: $' + this.simulation.budget.bondDebt + ')',
                this.simulation.cityTime,
                this.simulation.startingYear
            );
        }
        // Refresh budget panel so the UI shows updated debt
        this.handleBudgetRequest();
    }

    getIndustrySpec () {
        let list = this.simulation.industrySpec.getList();
        let current = this.simulation.industrySpec.getCurrentDef();
        CityGame.post({ tell:"INDUSTRYSPEC", list: list, current: current });
    }

    setIndustrySpec (id) {
        let changed = this.simulation.industrySpec.setSpecialization(id);
        if (changed) {
            this.simulation.cityHistory.addEvent(
                'economic',
                'City industry focus changed to ' + this.simulation.industrySpec.getCurrentDef().name,
                this.simulation.cityTime,
                this.simulation.startingYear
            );
        }
        // Re-send updated list
        this.getIndustrySpec();
    }


    //______________________________________ SAVE


    saveGame (cityData, silent){
        //this.oldSpeed = this.speed;
        //this.changeSpeed(0);

        let gameData = {name:"Yoooooo", everClicked: true};
        gameData.speed = this.speed;
        gameData.difficulty = this.difficulty;
        gameData.version = Micro.CURRENT_VERSION;
        gameData.saveVersion = Micro.SAVE_VERSION;
        gameData.width = Micro.MAP_WIDTH;
        gameData.height = Micro.MAP_HEIGHT;
        gameData.city = cityData;
        this.simulation.save(gameData);

        gameData = JSON.stringify(gameData);

        CityGame.post({ tell:"SAVEGAME", gameData:gameData, key:Micro.KEY, silent:silent||false });

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
        clearTimeout(this.timer);

        try {
            this.savedGame = JSON.parse(gameData);
        } catch (e) {
            console.error('3d.city: failed to parse save data — cannot load game.', e);
            CityGame.post({ tell:"LOADERROR", message:"Save data is corrupt or unreadable." });
            return;
        }

        Storage.migrate(this.savedGame);

        if( this.savedGame.width !== undefined ) Micro.MAP_WIDTH = this.savedGame.width;
        if( this.savedGame.height !== undefined ) Micro.MAP_HEIGHT = this.savedGame.height;

        //const savedW = this.savedGame.width  || Micro.MAP_WIDTH;
        //const savedH = this.savedGame.height || Micro.MAP_HEIGHT;
        this.mapSize = [ Micro.MAP_WIDTH, Micro.MAP_HEIGHT ];
        this.map = new GameMap(  Micro.MAP_WIDTH, Micro.MAP_HEIGHT );
        this.map.load(this.savedGame);

        CityGame.post({ tell:"FULLREBUILD", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, cityData:this.savedGame.city, isStart:isStart });

        // Re-create the simulation from the loaded save data and restart the tick loop.
        // Without this the city is visually rebuilt on the main thread but the simulation
        // remains halted because clearTimeout above killed the previous loop.
        this.playMap(true);
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


    getOverlayMap(type) {

        let data = []

        // data = this.map.getTileValues(0,0,Micro.MAP_WIDTH, Micro.MAP_HEIGHT)

        switch( type ){
            case 'Density':
                data = this.getTileType( this.simulation.blockMaps.populationDensityMap )
                //data = this.simulation.blockMaps.populationDensityMap.data;
            break;
            case 'Growth':
                data = this.getTileType( this.simulation.blockMaps.rateOfGrowthMap )
                //data = this.simulation.blockMaps.rateOfGrowthMap.data;
            break;
            case 'Land value':
                data = this.getTileType( this.simulation.blockMaps.landValueMap )
                //data = this.simulation.blockMaps.landValueMap.data;
            break;
            case 'Crime Rate':
                data = this.getTileType( this.simulation.blockMaps.crimeRateMap )
                //data = this.simulation.blockMaps.crimeRateMap.data;
            break;
            case 'Pollution':
                data = this.getTileType( this.simulation.blockMaps.pollutionDensityMap )
            break;
            case 'Traffic':
                data = this.getTileType( this.simulation.blockMaps.trafficDensityMap )
                //data = this.simulation.blockMaps.trafficDensityMap.data;
            break;
            case 'Power Grid': // ??
                //data = this.simulation.blockMaps.pollutionDensityMap.data;
            break;
            case 'Fire':
                data = this.getTileType( this.simulation.blockMaps.fireStationEffectMap )
                //data = this.simulation.blockMaps.fireStationEffectMap.data;
            break;
            case 'Police':
                data = this.getTileType( this.simulation.blockMaps.policeStationEffectMap )
                //data = this.simulation.blockMaps.policeStationEffectMap.data;
            break;

        }

        

        CityGame.post({ tell:"SHOWOVERLAY", type:type, data:data });

    }

    getTileType( base ) {

        let result = [];
        let w = Micro.MAP_WIDTH;
        let h = Micro.MAP_HEIGHT;

        for (let y = 0, ylim = h; y < ylim; y++) {
            for (let x = 0, xlim = w; x < xlim; x++) {
               
                let i =  x + y * w;
                result[ i ] = base.worldGet(x,y);
            }
        }

        return result;

    }

}