
import { Hub } from './city3d/Hub.js'
import { View } from './city3d/View.js'
import { saveAs } from './saveAs.js';



var d = document.getElementById('debug');
const simulation_timestep = 30;
var stats = null;

window.tilesData = null;
window.spriteData = null;
window.gameData = null;
window.powerData = null;
window.layerData = [];

window.isMobile = false;

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
        
        isMobile = testMobile();

        //storage = window.localStorage;

        this.initWorker()
        window.hub = new Hub()
        window.view3d = new View( isMobile );

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

        hub.start();

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
        var p = view3d.raypos;

        if( p.x<0 && p.z<0 ) return

        //if( tool === 'bulldozer' ) view3d.testDestruct( p.x, p.y )
        post({tell:"MAPCLICK", x:p.x, y:p.z });
    }

    // HUB

    static selectTool( id ) {
        view3d.selectTool( id );
    }

    static setTimeColors( id ) {
        view3d.setTimeColors(id);
    }

    static newMap( t ) {

        if( view3d.inMapGenation ) return;

        hub.generate( true );
        withHeight = t!=='NEW';
        view3d.inMapGenation = true;
        setTimeout( post, 1000, {tell:"NEWMAP"});
    
    }

    static playMap() {

        hub.initGameHub();
        view3d.startZoom();
        post({tell:"PLAYMAP"});

    }

    static selectTool( id ) {
        view3d.selectTool(id);
    }

    static setDifficulty( t ) {

        //console.log( t )
        let n = 0;
        if(t === 'MEDIUM') n = 1
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
        view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
       // var cityData = view3d.saveCityBuild();
        post({ tell:"SAVEGAME", saveCity:saveCity });
    }

    static loadGame( atStart ) {
        var isStart = atStart || false;
        if( isStart ){ 
            hub.generate( true );
            view3d.inMapGenation = true;
        }
        post({ tell:"LOADGAME", isStart:isStart });
    }

    static newGameMap() {
        console.log("new map");

        //saveTextAsFile('test', 'game is saved');
    }

    static showStats() {
        view3d.isWithStats = true;
    }

    static hideStats() {
        view3d.isWithStats = false;
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

    if( !view3d.isMobile ){
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
    if( view3d.tmpGameData ){ 
        savegame = view3d.tmpGameData
    } else {
        savegame = window.localStorage.getItem( key )
    }

    if(savegame){ 
        console.log("game is load");
        post({tell:"MAKELOADGAME", savegame:savegame, isStart:isStart});
        view3d.tmpGameData = null
        
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

        hub.generate( false );
        tilesData = e.data.tilesData;
        view3d.paintMap( e.data.mapSize, e.data.island, withHeight );
   
    }

    if( phase == "FULLREBUILD"){

        //console.log('fullrebuild')

        if(e.data.isStart){
            hub.generate( false );
        }
        view3d.fullRedraw = true;
        tilesData = e.data.tilesData;
        view3d.paintMap( e.data.mapSize, e.data.island, withHeight );
        view3d.loadCityBuild( e.data.cityData );

        if( e.data.isStart ) view3d.startPlay()
    }
    if( phase == "BUILD"){
        view3d.build(e.data.x, e.data.y);
    }
    if( phase == "RUN"){
        tilesData = e.data.tilesData;
        powerData = e.data.powerData;
        spriteData = e.data.sprites;
        layerData = e.data.layer;

        hub.updateCITYinfo(e.data.infos);

        newup = true;
        powerup = e.data.infos[9]

        // update only layer change
        view3d.updateLayer();
        view3d.moveSprite();
        view3d.showPower();

    }
    if( phase == "BUDGET"){
        hub.openBudget(e.data.budgetData);
    }
    if( phase == "QUERY"){
        hub.openQuery(e.data.queryTxt);
    }
    if( phase == "EVAL"){
        hub.openEval(e.data.evalData);
    }
    if( phase == "SAVEGAME"){
        makeGameSave(e.data.gameData, e.data.key);


    }
    if( phase == "LOADGAME"){
        makeLoadGame(e.data.key, e.data.isStart);
    }
}