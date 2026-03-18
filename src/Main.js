
import { Hub } from './city3d/Hub.js'
import { View } from './city3d/View.js'
import { WorkerBridge } from './WorkerBridge.js';
import { DebugOverlay } from './DebugOverlay.js';
import { AppState } from './AppState.js';


const simulation_timestep = 30;

const MAP_SIZES = {
    SMALL:  [64,  64],
    MEDIUM: [128, 128],
    LARGE:  [192, 192],
};

AppState.workerBridge = new WorkerBridge();
AppState.debugOverlay = new DebugOverlay();

export class Main {

    static init ( DirectMessage ){

        if( DirectMessage !== undefined ){

            AppState.directMessage = DirectMessage;
            AppState.isWorker = false;

        }

        AppState.isMobile = testMobile();

        this.initWorker();
        AppState.hub = new Hub();
        AppState.view3d = new View( AppState.isMobile );

        // Mount the debug overlay once the hub element is available
        AppState.debugOverlay.mount( document.getElementById('hub') );

    }

    static initWorker (){

        AppState.workerBridge.boot(
            AppState.isWorker,
            AppState.directMessage,
            simulation_timestep,
            function () { Main.startAutoSave(); }
        );

    }

    static start (){

        AppState.hub.start();

    }

    static sendTool( name ) {
        AppState.workerBridge.post({tell:"TOOL", name:name});
    }

    static destroy( x, y ) {
        AppState.workerBridge.post({tell:"MAPCLICK", x:x, y:y, single:true });
    }

    static mapClick( tool ) {
        var p = AppState.view3d.raypos;

        if( p.x<0 && p.z<0 ) return

        AppState.workerBridge.post({tell:"MAPCLICK", x:p.x, y:p.z });
    }

    // HUB

    static selectTool( id ) {
        AppState.view3d.selectTool( id );
    }

    static setTimeColors( id ) {
        AppState.view3d.setTimeColors(id);
    }

    static setMapSize( label ) {
        AppState.selectedMapSize = MAP_SIZES[label] || [128, 128];
    }

    static newMap( t ) {

        if( AppState.view3d.inMapGeneration ) return;

        AppState.hub.generate( true );
        AppState.withHeight = t!=='NEW';
        AppState.view3d.inMapGeneration = true;
        setTimeout( () => { AppState.workerBridge.post({tell:"NEWMAP", mapSize: AppState.selectedMapSize}); }, 1000);

    }

    static playMap() {

        AppState.hub.initGameHub();
        AppState.view3d.startZoom();
        AppState.workerBridge.post({tell:"PLAYMAP"});

    }

    static setDifficulty( t ) {

        let n = 0;
        if(t === 'MEDIUM') n = 1
        if(t === 'HARD') n = 2
        AppState.workerBridge.post({tell:"DIFFICULTY", n:n });
    }

    static setSpeed( n ) {
        if( AppState.debugOverlay ) AppState.debugOverlay.setSpeed( n );
        AppState.workerBridge.setGamePaused( n === 0 );
        AppState.workerBridge.post({tell:"SPEED", n:n });
    }

    static getBudget() {
        AppState.workerBridge.post({ tell:"BUDGET" });
    }

    static setBudget( budgetData ) {
        AppState.workerBridge.post({ tell:"NEWBUDGET", budgetData:budgetData });
    }

    static getEval() {
        AppState.workerBridge.post({ tell:"EVAL" });
    }

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
        var saveCity = [];
        AppState.view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
        AppState.workerBridge.post({ tell:"SAVEGAME", saveCity:saveCity });
    }

    // Silent background save — writes to localStorage only, no file download
    static autoSave() {
        var saveCity = [];
        AppState.view3d.saveCityBuild(saveCity);
        saveCity = JSON.stringify(saveCity);
        AppState.workerBridge.post({ tell:"SAVEGAME", saveCity:saveCity, silent:true });
    }

    static startAutoSave( intervalMs ) {
        var ms = intervalMs || 120000; // default 2 minutes
        setInterval(function(){ Main.autoSave(); }, ms);
    }

    static loadGame( atStart ) {
        var isStart = atStart || false;
        if( isStart ){
            AppState.hub.generate( true );
            AppState.view3d.inMapGeneration = true;
        }
        AppState.workerBridge.post({ tell:"LOADGAME", isStart:isStart });
    }

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
