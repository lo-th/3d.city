
import { Hub } from './city3d/Hub.js'
import { View } from './city3d/View.js'
import { WorkerBridge } from './WorkerBridge.js';
import { DebugOverlay } from './DebugOverlay.js';


var d = document.getElementById('debug');
const simulation_timestep = 30;

window.tilesData = null;
window.spriteData = null;
window.gameData = null;
window.powerData = null;
window.layerData = [];

window.isMobile = false;

window.trans = false;
window.newup = false;
window.powerup = false;

window.directMessage = null
window.isWorker = true

window.withHeight = false

window.workerBridge = new WorkerBridge();
window.debugOverlay = new DebugOverlay();

export class Main {

    static init ( DirectMessage ){

        if( DirectMessage !== undefined ){ 

            directMessage = DirectMessage;
            isWorker = false

        }
        
        isMobile = testMobile();

        this.initWorker()
        window.hub = new Hub()
        window.view3d = new View( isMobile );

        // Mount the debug overlay once the hub element is available
        debugOverlay.mount( document.getElementById('hub') );

    }

    // viex3d

    static initWorker (){

        workerBridge.boot(
            isWorker,
            directMessage,
            simulation_timestep,
            function () { Main.startAutoSave(); }
        );

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

    static setDifficulty( t ) {

        //console.log( t )
        let n = 0;
        if(t === 'MEDIUM') n = 1
        if(t === 'HARD') n = 2
        post({tell:"DIFFICULTY", n:n });
    }

    static setSpeed( n ) {
        if( window.debugOverlay ) window.debugOverlay.setSpeed( n );
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

    static getAchievements() {
        post({ tell:"ACHIEVEMENTS" });
    }

    static getHistory() {
        post({ tell:"HISTORY" });
    }

    static setDisaster(disaster){
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

    // Silent background save — writes to localStorage only, no file download
    static autoSave() {
        var saveCity = [];
        view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
        post({ tell:"SAVEGAME", saveCity:saveCity, silent:true });
    }

    static startAutoSave( intervalMs ) {
        var ms = intervalMs || 120000; // default 2 minutes
        setInterval(function(){ Main.autoSave(); }, ms);
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
//  CITY FLOW
//=======================================

function post( e, buffer ) {

    workerBridge.post( e, buffer );

}