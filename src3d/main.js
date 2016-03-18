var d = document.getElementById('debug');
var miniGlCanvas = document.getElementById("miniGlCanvas");
var simulation_timestep = 30;
var stats = null;

var tilesData = null;
var spriteData = null;
var gameData = null;
var powerData = null;

var isMobile = false;

var trans = false;
var newup = false;
var powerup = false;
var cityWorker = new Worker( 'js/worker.city.js' );
var view3d, hub, im;
var isWithMiniMap = false;

var storage;


function debug(txt){ d.innerHTML += "<br>"+txt; }

//window.onload = init;
 
function testMobile() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) 
        || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) return true;
    else return false;        
}

function init(){
    
    isMobile = testMobile();

    storage = window.localStorage;

    //cityWorker = new Worker('js/worker.city.js');
    
    hub = new HUB.Base();
    view3d = new V3D.Base(isMobile);
    if(isWithMiniMap)view3d.initMiniRender();
}

//=======================================
//  3D LOOP
//=======================================

function loop() {
    
    requestAnimationFrame( loop );

    if(newup){ 
        view3d.paintMap(); 
        view3d.moveSprite();
        newup = false;
    }
    if(powerup){
        view3d.showPower();
        powerup = false;
    }
    if( view3d.mouse.dragView || view3d.mouse.button===3 ){
        view3d.dragCenterposition();
    }else{
        if(!isMobile)view3d.updateKey();
    }

    view3d.renderer.render( view3d.scene, view3d.camera );

    if(view3d.isWithStats) view3d.runStats();

    if(isWithMiniMap){
        view3d.miniCheck();
        view3d.miniRenderer.render( view3d.miniScene, view3d.topCamera );
    }

}

//=======================================
//  SAVE LOAD
//=======================================

function saveGame(){
    var saveCity = [];
    view3d.saveCityBuild(saveCity);
    saveCity = JSON.stringify(saveCity);
   // var cityData = view3d.saveCityBuild();
    cityWorker.postMessage({tell:"SAVEGAME", saveCity:saveCity });
}
function loadGame(atStart){
    var isStart = atStart || false;
    cityWorker.postMessage({tell:"LOADGAME", isStart:isStart});
}

function makeGameSave(gameData, key){
    window.localStorage.setItem(key, gameData);
    console.log("game is save");
}

function makeLoadGame(key, atStart){
    var isStart = atStart || false;
    if(atStart){
        hub.initGameHub();
    }
    var savegame = window.localStorage.getItem(key);
    if(savegame){ 
        cityWorker.postMessage({tell:"MAKELOADGAME", savegame:savegame, isStart:isStart});
        console.log("game is load");
    } else {
        console.log("No loading game found");
    }
}

function newGameMap(){
    console.log("new map");

    //saveTextAsFile('test', 'game is saved');
}

//=======================================
//  STATS
//=======================================

function displayStats() {
    view3d.isWithStats = true;
}

function hideStats() {
    view3d.isWithStats = false;
}

//=======================================
//  CITY INIT
//=======================================

var ARRAY_TYPE;
if(!ARRAY_TYPE) { ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array; }



function start() {
    initCity();
}

function setTimeColors(id) {
    view3d.setTimeColors(id);
}


function newMap() {
    if(view3d.isWithHeight){ view3d.resetHeight();}
	cityWorker.postMessage({tell:"NEWMAP"});
}

function newHeightMap() {
    view3d.isWithHeight = true;
    cityWorker.postMessage({tell:"NEWMAP"});
}

function playMap() {
	hub.initGameHub();
    view3d.startZoom();
    cityWorker.postMessage({tell:"PLAYMAP"});
}

function selectTool(id) {
    view3d.selectTool(id);
}

function sendTool(name) {
    cityWorker.postMessage({tell:"TOOL", name:name});
}

function setDifficulty(n){
    cityWorker.postMessage({tell:"DIFFICULTY", n:n });
}

function setSpeed(n){
    cityWorker.postMessage({tell:"SPEED", n:n });
}

function getBudjet(){
    cityWorker.postMessage({ tell:"BUDGET" });
}

function setBudjet(budgetData){
    cityWorker.postMessage({ tell:"NEWBUDGET", budgetData:budgetData });
}

function getEval(){
    cityWorker.postMessage({ tell:"EVAL" });
}

function setDisaster(disaster){
    console.log(disaster);
    cityWorker.postMessage({ tell:"DISASTER", disaster:disaster });
}

function setOverlays(type){
    //cityWorker.postMessage({ tell:"OVERLAYS", type:type });
}

function destroy(x,y) {
    cityWorker.postMessage({tell:"DESTROY", x:x, y:y});
}

function mapClick() {
    var p = view3d.pos;
    if(p.x>0 && p.z>0) cityWorker.postMessage({tell:"MAPCLICK", x:p.x, y:p.z });
}

function initCity() {
    hub.subtitle.innerHTML = "Generating world...";
    loop();

    cityWorker.postMessage = cityWorker.webkitPostMessage || cityWorker.postMessage;
    cityWorker.postMessage({tell:"INIT", url:document.location.href.replace(/\/[^/]*$/,"/") + "build/city.3d.min.js", timestep:simulation_timestep });
    //cityWorker.postMessage({tell:"INIT", url:document.location.href.replace(/\/[^/]*$/,"/") + "build/city.3d.js", timestep:simulation_timestep });
}

cityWorker.onmessage = function(e) {

    var phase = e.data.tell;
    if( phase == "NEWMAP"){
        tilesData = e.data.tilesData;
        view3d.paintMap( e.data.mapSize, e.data.island, true);
        //trans = e.data.trans;
        hub.start();
    }
    if( phase == "FULLREBUILD"){
        if(e.data.isStart){
            //hub.initGameHub();
            view3d.startZoom();
        }
        view3d.fullRedraw = true;
        tilesData = e.data.tilesData;
        view3d.paintMap( e.data.mapSize, e.data.island, true, true);
        view3d.loadCityBuild(e.data.cityData);
    }
    if( phase == "BUILD"){
        view3d.build(e.data.x, e.data.y);
    }
    if( phase == "RUN"){
        tilesData = e.data.tilesData;
        powerData = e.data.powerData;
        spriteData = e.data.sprites;

        hub.updateCITYinfo(e.data.infos);

        newup = true;
        if(powerData) powerup = true; 
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