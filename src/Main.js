
import { Hub } from './city3d/Hub.js'
import { View } from './city3d/View.js'
import { saveAs } from './saveAs.js';
import { AppState } from './AppState.js';
import { DebugOverlay } from './DebugOverlay.js';
import { WorkerBridge } from './WorkerBridge.js';

//var d = document.getElementById('debug');
const simulation_timestep = 30;
//var stats = null;

//window.tilesData = null;
//window.spriteData = null;
//window.gameData = null;
//window.powerData = null;
//window.layerData = [];

//window.isMobile = false;

/*window.trans = false;
window.newup = false;
window.powerup = false;*/

//var storage;
//window.directMessage = null

const MAP_SIZES = {
    SMALL:  [64,  64],
    MEDIUM: [128, 128],
    LARGE:  [192, 192],
};

AppState.workerBridge = new WorkerBridge();
AppState.debugOverlay = new DebugOverlay();


export class Main {

    static async init ( DirectMessage, enableGPU = false ){

        if( DirectMessage !== undefined ){ 

            AppState.directMessage = DirectMessage;
            AppState.isWorker = false

        }

        if(enableGPU) AppState.forceWebGL = false;
        
        AppState.isMobile = testMobile();

        this.initWorker()

        AppState.main = this;
        AppState.hub = new Hub()
        AppState.view3d = new View();

        await AppState.view3d.initRenderer()

        // Mount the debug overlay once the hub element is available
        //AppState.debugOverlay.mount( document.getElementById('hub') );

    }

    // viex3d

    static initWorker (){

        AppState.workerBridge.boot(
            AppState.isWorker,
            AppState.directMessage,
            simulation_timestep,
            function () { Main.startAutoSave(); }
        );

    }

    static start (){

        //console.log(AppState.isWorker ? 'is Worker !!' : 'is Direct !!', AppState.isWebGPU ? 'is WebGPU !!' : 'is WebGl2 !!');

        AppState.hub.start();

    }

    static sendTool( name ) {

        AppState.workerBridge.post({tell:"TOOL", name:name});
        //post({tell:"TOOL", name:name});
    }

    static destroy( x, y ) {

        // TODO SOUND EXPLOSION
        AppState.workerBridge.post({tell:"MAPCLICK", x:x, y:y, single:true });
        //post({tell:"MAPCLICK", x:x, y:y, single:true });

    }

    static mapClick( tool ) {
        
        const p = AppState.view3d.raypos;
        if( p.x<0 && p.z<0 ) return
        //if( tool === 'bulldozer' ) view3d.testDestruct( p.x, p.y )
        //post({tell:"MAPCLICK", x:p.x, y:p.z });
        AppState.workerBridge.post({tell:"MAPCLICK", x:p.x, y:p.z });

    }

    // HUB

    static selectTool( id ) {
        AppState.view3d.selectTool( id );
    }

    static setTimeColors( id ) {
        AppState.view3d.setTimeColors(id);
    }

    static newMap() {

        if( AppState.view3d.inMapGeneration ) return;

        AppState.hub.generate( true );
        AppState.view3d.inMapGeneration = true;
        setTimeout( () => { AppState.workerBridge.post({tell:"NEWMAP", mapSize: AppState.selectedMapSize}); }, 100);
        //AppState.workerBridge.post({tell:"NEWMAP", mapSize: AppState.selectedMapSize});
        //setTimeout( post, 0, {tell:"NEWMAP"});
        //post({ tell:"NEWMAP" });
    
    }

    static loadGame( isStart = false ) {

        if( isStart ){ 
            AppState.hub.generate( true );
            AppState.view3d.inMapGeneration = true;
        }
        AppState.workerBridge.post({ tell:"LOADGAME", isStart:isStart });
        //post({ tell:"LOADGAME", isStart:isStart });

    }

    static playMap() {

        if( AppState.view3d.inMapGeneration ) return;

        AppState.hub.cleartMaptHub()
        AppState.hub.initGameHub();
        AppState.view3d.startZoom();
        AppState.workerBridge.post({tell:"PLAYMAP"});

    }

    /*static selectTool( id ) {
        AppState.view3d.selectTool(id);
    }*/

    static setSize( value ) {

        let n = 'MEDIUM';
        switch(value){
            case 0: n = 'SMALL'; break;
            case 1: n = 'MEDIUM'; break;
            case 2: n = 'LARGE'; break;
        }

        AppState.selectedMapSize = MAP_SIZES[n];
    
    }

    static setDifficulty( value ) {

        //post({tell:"DIFFICULTY", n:value });
        AppState.workerBridge.post({tell:"DIFFICULTY", n:value });

    }

    static setSpeed( n ) {

        if( AppState.debugOverlay ) AppState.debugOverlay.setSpeed( n );
        AppState.workerBridge.setGamePaused( n === 0 );
        AppState.workerBridge.post({tell:"SPEED", n:n });
        //post({tell:"SPEED", n:n });
    }

    static getBudjet() {
        AppState.workerBridge.post({ tell:"BUDGET" });
        //post({ tell:"BUDGET" });
    }

    static setBudjet( budgetData ) {

        AppState.workerBridge.post({ tell:"BUDGET" });
        //post({ tell:"NEWBUDGET", budgetData:budgetData });
    }

    static getEval() {

        AppState.workerBridge.post({ tell:"EVAL" });
        //post({ tell:"EVAL" });
    }

    /*static setDisaster(disaster){
        console.log(disaster);
        post({ tell:"DISASTER", disaster:disaster });
    }*/

    static getAchievements() {
        AppState.workerBridge.post({ tell:"ACHIEVEMENTS" });
    }

    static getHistory() {
        AppState.workerBridge.post({ tell:"HISTORY" });
    }

    static getOrdinances() {
        AppState.workerBridge.post({ tell:"GETORDINANCES" });
    }

    static setOrdinance(id) {
        AppState.workerBridge.post({ tell:"SETORDINANCE", id:id });
    }

    static issueBond(amount) {
        AppState.workerBridge.post({ tell:"ISSUEBOND", amount:amount });
    }

    static getIndustrySpec() {
        AppState.workerBridge.post({ tell:"GETINDUSTRYSPEC" });
    }

    static setIndustrySpec(id) {
        AppState.workerBridge.post({ tell:"SETINDUSTRYSPEC", id:id });
    }

    static setDisaster(disaster){
        AppState.workerBridge.post({ tell:"DISASTER", disaster:disaster });
    }

    static setOverlays( type ) {
        AppState.view3d.setOverlayMode( type );
    }

    static saveGame() {
        let saveCity = [];
        AppState.view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
        AppState.workerBridge.post({ tell:"SAVEGAME", saveCity:saveCity });
       // var cityData = view3d.saveCityBuild();
        //post({ tell:"SAVEGAME", saveCity:saveCity });
    }

    // Silent background save — writes to localStorage only, no file download
    static autoSave() {
        var saveCity = [];
        AppState.view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
        AppState.workerBridge.post({ tell:"SAVEGAME", saveCity:saveCity, silent:true });
    }

    static startAutoSave( intervalMs ) {
        return
        var ms = intervalMs || 120000; // default 2 minutes
        setInterval(function(){ Main.autoSave(); }, ms);
    }

    

   /* static newGameMap() {
        console.log("new map");

        //saveTextAsFile('test', 'game is saved');
    }*/

    static showStats() {
        AppState.view3d.isWithStats = true;
    }

    static hideStats() {
        AppState.view3d.isWithStats = false;
    }

}


 
function testMobile() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) 
        || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) return true;
    else return false;        
}

/*
function debug( txt ) { d.innerHTML += "<br>"+txt; }
//=======================================
//  SAVE LOAD
//=======================================

function makeGameSave( gameData, key ) {
    window.localStorage.setItem(key, gameData);
    console.log("game is save", key);

    if( !AppState.isMobile ){
        var blob = new Blob([gameData], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "city3d.json");
    }
    
}

function makeLoadGame( key, atStart ) {

    var isStart = atStart || false;
    if(isStart){
        
       // hub.initGameHub();
    }

    let savegame 
    if( AppState.view3d.tmpGameData ){ 
        savegame = AppState.view3d.tmpGameData
    } else {
        savegame = window.localStorage.getItem( key )
    }

    if(savegame){ 
        console.log("game is load");
        post({tell:"MAKELOADGAME", savegame:savegame, isStart:isStart});
        AppState.view3d.tmpGameData = null
        
    } else {
        console.log("No loading game found");
    }
}


//=======================================
//  CITY FLOW
//=======================================

function post( e, buffer ) {

    if( AppState.isWorker ) cityWorker.postMessage( e, buffer );
    else AppState.directMessage( { data : e } )

}

function message( e ) {

    var phase = e.data.tell;
    if( phase == "READY"){

        

    }
    if( phase == "NEWMAP"){

        AppState.hub.generate( false );
        AppState.tilesData = e.data.tilesData;
        AppState.view3d.paintMap( e.data.mapSize, e.data.island );
   
    }

    if( phase == "FULLREBUILD"){

        //console.log('fullrebuild')

        if(e.data.isStart){
            AppState.hub.generate( false );
        }
        AppState.view3d.fullRedraw = true;
        AppState.tilesData = e.data.tilesData;
        AppState.view3d.paintMap( e.data.mapSize, e.data.island );
        AppState.view3d.loadCityBuild( e.data.cityData );

        if( e.data.isStart ) AppState.main.playMap()
    }
    if( phase == "BUILD"){
        AppState.view3d.build(e.data.x, e.data.y);
    }
    if( phase == "RUN"){
        AppState.tilesData = e.data.tilesData;
        AppState.powerData = e.data.powerData;
        AppState.spriteData = e.data.sprites;
        AppState.layerData = e.data.layer;

        AppState.hub.updateCITYinfo(e.data.infos);

        AppState.newup = true;
        AppState.powerup = e.data.infos[9]

        // update only layer change
        AppState.view3d.updateLayer();
        AppState.view3d.moveSprite();
        AppState.view3d.showPower();

    }
    if( phase == "BUDGET"){
        //console.log(e.data.budgetData)
        AppState.hub.openBudget(e.data.budgetData);
    }
    if( phase == "QUERY"){
        AppState.hub.openQuery(e.data.queryTxt);
    }
    if( phase == "EVAL"){
        AppState.hub.openEval(e.data.evalData);
    }
    if( phase == "SAVEGAME"){
        makeGameSave(e.data.gameData, e.data.key);
    }
    if( phase == "LOADGAME"){
        makeLoadGame(e.data.key, e.data.isStart);
    }
}
*/