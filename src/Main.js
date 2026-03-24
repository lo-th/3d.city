
import { Hub } from './city3d/Hub.js'
import { View } from './city3d/View.js'
import { saveAs } from './saveAs.js';
import { AppState } from './AppState.js';


var d = document.getElementById('debug');
const simulation_timestep = 30;
var stats = null;

window.tilesData = null;
window.spriteData = null;
window.gameData = null;
window.powerData = null;
window.layerData = [];

//window.isMobile = false;

window.trans = false;
window.newup = false;
window.powerup = false;

//var storage;
window.directMessage = null
window.isWorker = true

window.withHeight = false

export class Main {

    static init ( DirectMessage ){

        if( DirectMessage !== undefined ){ 

            directMessage = DirectMessage;
            isWorker = false

        }
        
        AppState.isMobile = testMobile();
        AppState.main = this;

        //storage = window.localStorage;

        this.initWorker()

        AppState.hub = new Hub()
        AppState.view3d = new View();



    }

    // viex3d

    static initWorker (){

        if( isWorker ){

            window.cityWorker = new Worker( './build/citygame.min.js' );

            //window.cityWorker = new Worker( 'js/worker.city.js' );
            cityWorker.postMessage = cityWorker.webkitPostMessage || cityWorker.postMessage;
            //post({tell:"INIT", url:document.location.href.replace(/\/[^/]*$/,"/") + "build/city.3d.js", timestep:simulation_timestep });
            cityWorker.onmessage = message;

            post({ tell:"INIT", timestep:simulation_timestep });

        } else {

            post({ tell:"INIT", timestep:simulation_timestep, returnMessage:message });

        }

    }

    static start (){

        AppState.hub.start();

        //hub.message('Generating world...')
        //post({ tell:"NEWMAP"})

    }

    static sendTool( name ) {
        post({tell:"TOOL", name:name});
    }

    static destroy( x, y ) {

        // TODO SOUND EXPLOSION
        post({tell:"MAPCLICK", x:x, y:y, single:true });

    }

    static mapClick( tool ) {
        
        const p = AppState.view3d.raypos;
        if( p.x<0 && p.z<0 ) return
        //if( tool === 'bulldozer' ) view3d.testDestruct( p.x, p.y )
        post({tell:"MAPCLICK", x:p.x, y:p.z });

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
        withHeight = false;//t!=='NEW';
        AppState.view3d.inMapGeneration = true;
        //setTimeout( post, 0, {tell:"NEWMAP"});
        post({ tell:"NEWMAP" });
    
    }

    static playMap() {

        AppState.hub.initGameHub();
        AppState.view3d.startZoom();
        post({tell:"PLAYMAP"});

    }

    static selectTool( id ) {
        AppState.view3d.selectTool(id);
    }

    static setSize( t ) {

        let n = 64;
        if(t === 'MEDIUM') n = 128
        if(t === 'LARGE') n = 192
        post({tell:"MAPSIZE", n:n });
    
    }

    static setDifficulty( t ) {

        let n = 0;
        if(t === 'NORMAL') n = 1
        if(t === 'HARD') n = 2
        post({tell:"DIFFICULTY", n:n });

    }

    static setSpeed( n ) {
        post({tell:"SPEED", n:n });
    }

    static getBudjet() {
        post({ tell:"BUDGET" });
    }

    static setBudjet( budgetData ) {
        post({ tell:"NEWBUDGET", budgetData:budgetData });
    }

    static getEval() {
        post({ tell:"EVAL" });
    }

    static setDisaster(disaster){
        console.log(disaster);
        post({ tell:"DISASTER", disaster:disaster });
    }

    static setOverlays( type ) {
        //cityWorker.postMessage({ tell:"OVERLAYS", type:type });
    }

    static saveGame() {
        var saveCity = [];
        AppState.view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
       // var cityData = view3d.saveCityBuild();
        post({ tell:"SAVEGAME", saveCity:saveCity });
    }

    static loadGame( atStart ) {
        var isStart = atStart || false;
        if( isStart ){ 
            AppState.hub.generate( true );
            AppState.view3d.inMapGeneration = true;
        }
        post({ tell:"LOADGAME", isStart:isStart });
    }

    static newGameMap() {
        console.log("new map");

        //saveTextAsFile('test', 'game is saved');
    }

    static showStats() {
        AppState.view3d.isWithStats = true;
    }

    static hideStats() {
        AppState.view3d.isWithStats = false;
    }

    



}

function debug( txt ) { d.innerHTML += "<br>"+txt; }
 
function testMobile() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) 
        || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) return true;
    else return false;        
}



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

    if( isWorker ) cityWorker.postMessage( e, buffer );
    else directMessage( { data : e } )

}

function message( e ) {

    var phase = e.data.tell;
    if( phase == "READY"){

        console.log(isWorker ? 'is Worker !!' : 'is Direct !!')

    }
    if( phase == "NEWMAP"){

        

        AppState.hub.generate( false );
        tilesData = e.data.tilesData;
        AppState.view3d.paintMap( e.data.mapSize, e.data.island, withHeight );
   
    }

    if( phase == "FULLREBUILD"){

        //console.log('fullrebuild')

        if(e.data.isStart){
            AppState.hub.generate( false );
        }
        AppState.view3d.fullRedraw = true;
        tilesData = e.data.tilesData;
        AppState.view3d.paintMap( e.data.mapSize, e.data.island, withHeight );
        AppState.view3d.loadCityBuild( e.data.cityData );

        if( e.data.isStart ) AppState.view3d.startPlay()
    }
    if( phase == "BUILD"){
        AppState.view3d.build(e.data.x, e.data.y);
    }
    if( phase == "RUN"){
        tilesData = e.data.tilesData;
        powerData = e.data.powerData;
        spriteData = e.data.sprites;
        layerData = e.data.layer;

        AppState.hub.updateCITYinfo(e.data.infos);

        newup = true;
        powerup = e.data.infos[9]

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