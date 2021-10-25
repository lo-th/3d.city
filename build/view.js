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

//------------------------------------------------------//
//                 THREE JS & SEA3D                     //
//------------------------------------------------------//

'use strict';
var Audio, THREE;
var V3D = { REVISION: '0.4' };

V3D.Base = function(isMobile, pix, isLow){

    this.metalness = 0.8;
    this.roughness = 0.5;
    this.wireframe = false;
    this.envType = 'base';


    this.M_list = ['treeLists'     , 'townLists'     , 'houseLists'       , 'buildingLists' ];
    this.M_temp = ['tempTreeLayers', 'temptownLayers', 'tempHouseLayers'  , 'tempBuildingLayers' ];
    this.M_geom = ['treeGeo'       , 'buildingGeo'   , 'houseGeo'         , 'X' ];
    this.M_mesh = ['treeMeshs'     , 'townMeshs'     , 'houseMeshs'       , 'buildingMeshs' ];
    this.M_mats = ['townMaterial'  , 'townMaterial'  , 'buildingMaterial' , 'buildingMaterial' ];
	
	this.pix = pix || 1;
	this.isLow = isLow || false;
	this.container = document.getElementById( 'container' );
	this.isMobile = isMobile || false;
    
	//this.seaBuffer = true;
	//this.isBuffer = true;
	this.isWithTree = true;

    this.isWithLight = true;

	this.isWithEnv = true;//true;
    this.isWithNormal = false;
	this.isWithFog = true;
	this.isIsland = false;
	this.isWinter = false;

	this.isComputeVertex = true;
	this.isTransGeo = true;

	this.key = [0,0,0,0,0,0,0];

	if(this.isMobile || this.isLow){ 
        this.isWithTree = false;
        this.isWithEnv = false;
        this.isWithNormal = false;
        this.isWithLight = false;
    }

	this.f = [0,0,0];
	this.stats = [0,0];
	this.isWithStats = false;


	this.dayTime = 0;

	this.tcolor = {r:10, g: 15, b: 80, a: 0.9};

	this.snd_layzone = new Audio("./sound/layzone.mp3");

	this.imgSrc = ['img/tiles32.png','img/town.jpg','img/building.jpg','img/w_building.png','img/w_town.png', 'img/env/'+this.envType+'.jpg'];//, 'img/building_n.png', 'img/town_n.png', 'img/tiles32_n.png' 
	this.imgSrcPlus = ['img/tiles32_w.png','img/town_w.jpg','img/building_w.jpg'];
	this.winterMapLoaded = false;

	//if(this.isWinter) this.imgSrc = ['img/tiles32_w.png','img/town_w.jpg','img/building_w.jpg','img/w_building.png','img/w_town.png'];
	this.rootModel = 'img/world.sea';
	this.imgs = [];
	this.num = 0;

	this.fullRedraw = false;

	this.isWithBackground = true;
	this.isWithHeight = false;
	this.isColorTest = false;

	this.deepthTest = false;

	//this.clock = null;

	//this.tileSize = 32;
	this.mu = 2;
	
	this.ToRad = Math.PI / 180;
    this.camera = null;
    this.topCamera = null; 
    this.topCameraDistance = 100;
    this.scene = null; 
    this.renderer = null;
    this.timer = null;
    this.imageSrc = null;
    this.mapCanvas = null;

    this.miniRenderer = null;
    this.miniSize = {w:200, h:200};

    this.miniCanvas = [];
    this.miniCtx = [];
    this.miniCanvasN = [];
    this.miniCtxN = [];
    this.txtNeedUpdate = [];
    this.miniTerrain = [];
    this.terrainTxt = [];

    this.forceUpdate = { x:-1, y:-1 };

    this.Bulldoze = false;

    this.cam = { horizontal:90, vertical:45, distance:120 };
    this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
    this.mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, dx:0, dy:0, down:false, over:false, drag:false, click:false , move:true, dragView:false ,button:0 };
    this.pos =  {x:-1, y:0, z:-1};

    this.select = '';
    this.meshs = {};

    this.mapSize = [128,128];
    this.nlayers = 64;

    this.terrain = null;

    this.tool = null;
	this.toolSet = [
        {id:0,  tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'       ,drag:0  },
		{id:1,  tool:'residential', geo:1,    name:'R', build:1, size:3, sy:0.2,  price:100,   color:'lime'       ,drag:0  },
		{id:2,  tool:'commercial',  geo:2,    name:'C', build:1, size:3, sy:0.2,  price:100,   color:'blue'       ,drag:0  },
		{id:3,  tool:'industrial',  geo:3,    name:'I', build:1, size:3, sy:0.2,  price:100,   color:'yellow'     ,drag:0  },

		{id:4,  tool:'police',      geo:4,    name:'',  build:1, size:3, sy:1.2,  price:500,   color:'blue'       ,drag:0  },
		{id:5,  tool:'park',        geo:5,    name:'',  build:1, size:1, sy:0.02, price:10,    color:'darkgreen'  ,drag:0  },
		{id:6,  tool:'fire',        geo:7,    name:'',  build:1, size:3, sy:1.2,  price:500,   color:'red'        ,drag:0  },

		{id:7,  tool:'road',        geo:0,    name:'',  build:0, size:1, sy:0.1,  price:10,    color:'black'      ,drag:1  },
		{id:8,  tool:'bulldozer',   geo:0,    name:'',  build:0, size:1, sy:0,    price:1,     color:'deeppink'   ,drag:1  },
		{id:9,  tool:'rail',        geo:0,    name:'',  build:0, size:1, sy:0.15, price:20,    color:'brown'      ,drag:1  },

		{id:10, tool:'coal',        geo:8,    name:'',  build:1, size:4, sy:2,    price:3000,  color:'gray'       ,drag:0  },
		{id:11, tool:'wire',        geo:0,    name:'',  build:0, size:1, sy:0.05, price:5 ,    color:'khaki'      ,drag:1  },	
		{id:12, tool:'nuclear',     geo:9,    name:'',  build:1, size:4, sy:2,    price:5000,  color:'orange'  ,drag:0  },

		{id:13, tool:'port',        geo:10,   name:'',  build:1, size:4, sy:0.5,  price:3000,  color:'dodgerblue' ,drag:0  },
		{id:14, tool:'stadium',     geo:11,   name:'',  build:1, size:4, sy:2,    price:5000,  color:'yellowgreen',drag:0  },
		{id:15, tool:'airport',     geo:12,   name:'',  build:1, size:6, sy:0.5,  price:10000, color:'lightblue'  ,drag:0  },
		
		{id:16, tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'       ,drag:0  },
		{id:17, tool:'query',       geo:0,    name:'?', build:0, size:1, sy:0,    price:0,     color:'cyan'       ,drag:0  },
		{id:18, tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'       ,drag:0  }
	];

	this.currentTool = null;

	this.heightData = null;
	this.tempHeightLayers = [];

	
	// textures
	this.worldTexture = null;
	this.centralTexture = null;
	this.serviceTexture = null;
	this.buildingTexture = null;
	this.skyTexture = null;

	// material
	this.townMaterial = null;
	this.buildingMaterial = null;

	this.townCanvas = null;
	this.buildingCanvas = null;
	this.groundCanvas = null;
	this.skyCanvas = null;
	this.skyCanvasBasic = null;

	this.townHeigth = null;
	this.buildingHeigth = null;
	this.townMap = null;
	this.buildingMap = null;

	// geometry
	this.buildingGeo = null;
	this.residentialGeo = null;
	this.commercialGeo = null;
	this.industrialGeo = null;
	this.spriteGeo = null;
	this.treeGeo = null;
	this.houseGeo = null;

	

	this.treeMeshs = [];
	this.treeLists = [];
	this.tempTreeLayers = [];


	this.treeDeepMeshs = [];
	this.treeValue = [];

	this.powerMeshs = [];
	this.powerMaterial = null;

	this.buildingMeshs = [];
	this.buildingLists = [];
	this.tempBuildingLayers = [];

	this.townMeshs = [];
	this.townLists = [];
	this.temptownLayers = [];

	this.houseMeshs = [];
	this.houseLists = [];
	this.tempHouseLayers = [];

	this.buildingStaticMeshs = [];
	this.buildingStaticLists = [];

	this.H = [ 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260 ];
	this.R = [ 244, 265, 274, 283, 292, 301, 310, 319, 328, 337, 346, 355, 364, 373, 382, 391, 400, 409, 418 ];
	this.C = [ 427, 436, 445, 454, 463, 475, 481, 490, 499, 508, 517, 526, 535, 544, 553, 562, 571, 580, 589, 598, 607 ];
	this.I = [ 616, 625, 634, 643, 652, 661, 670, 679, 688 ];

	this.tilesUpdateList = [];

	this.tempDestruct=[];

	this.currentLayer = 0;
	

	this.spriteLists = ['train', 'elico', 'plane', 'boat', 'monster', 'tornado', 'sparks'];
	//this.spriteLists = [];
	this.spriteMeshs = [];
	this.spriteObjs = {};

	// start by loading texture
	this.loadImages();
}

V3D.Base.prototype = {

    constructor: V3D.Base,

    init:function() {

    	//if(this.isMobile) this.pix = 0.5;
    	this.clock = new THREE.Clock();

    	this.scene = new THREE.Scene();

    	this.camera = new THREE.PerspectiveCamera( 55, this.vsize.z, 0.1, 1000 );
    	this.scene.add( this.camera );

    	this.rayVector = new THREE.Vector2( 0, 0 );
    	this.raycaster = new THREE.Raycaster();
    	
        this.land = new THREE.Group();
        this.scene.add( this.land );

        if( this.isWithFog ){

        	this.fog = new THREE.Fog( 0xCC7F66, 1, 100 );
        	this.scene.fog = this.fog;
        
        }

        this.center = new THREE.Vector3();
        this.center.x = this.mapSize[0]*0.5;
        this.center.z = this.mapSize[1]*0.5;
        this.moveCamera();

        this.ease = new THREE.Vector3();
        this.easeRot = new THREE.Vector3();

        this.powerMaterial = new THREE.SpriteMaterial({ map:this.powerTexture(), transparent:true })

         //this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, antialias:false });
    	var renderer = new THREE.WebGLRenderer({ precision: "mediump", antialias:false });
        renderer.setSize( this.vsize.x, this.vsize.y );
        renderer.setPixelRatio( this.pix || window.devicePixelRatio )
    	renderer.sortObjects = false;
    	renderer.sortElements = false;
    	renderer.autoClear = this.isWithBackground;

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

    	//this.renderer.autoClear = false;
        this.container.appendChild( renderer.domElement );


    	this.renderer = renderer;

        if( this.isWithLight ){

            var light = new THREE.DirectionalLight( 0xfffffe, 0.6 );//new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 10, 2 );
            light.position.set(  this.center.x+100 , 300, this.center.z-100 );
            light.target.position.set( this.center.x, this.center.y, this.center.z );

            this.scene.add( light );

            //var hemiLight = new THREE.HemisphereLight( 0xCC7F66, 0xEFEFFF, 0.8 );
            var hemiLight = new THREE.HemisphereLight( 0x6666e6, 0xeffffff, 1 );
            //hemiLight.color.setHSL( 0.6, 1, 0.6 );
            //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
            hemiLight.position.set( 0, 20, 0 );
            this.scene.add( hemiLight );


            this.hemiLight = hemiLight;



            /*var pointLight = new THREE.PointLight( 0xFFFFFF, 1 );
            pointLight.position.set( this.center.x, 10, this.center.x );
            this.scene.add( pointLight );*/

            //this.scene.add( new THREE.AmbientLight( 0xcc7f66 ) );


        }
    	
    	//var _this = this;
    

        if(this.isWithBackground ){
        	this.skyCanvasBasic = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','#A7DCFA', 'deepskyblue']]);
        	this.skyCanvas = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','#A7DCFA', 'deepskyblue']]);
        	this.skyTexture = new THREE.Texture(this.skyCanvas);
		    this.skyTexture.needsUpdate = true;
            this.back = new THREE.Mesh( new THREE.IcosahedronGeometry(300,1), new THREE.MeshBasicMaterial( { map:this.skyTexture, side:THREE.BackSide, depthWrite: false, fog:false }  ));
            this.scene.add( this.back );
            this.renderer.autoClear = false;
        } else {
        	this.renderer.setClearColor( 0xcc7f66, 1 );
        }

        
        window.addEventListener( 'resize', function(e) { this.resize() }.bind(this), false );

        // disable context menu
        document.addEventListener("contextmenu", function(e){ e.preventDefault(); }, false);

        document.addEventListener( 'mousewheel', this, false );

        this.container.addEventListener( 'mousemove', this, false );
        this.container.addEventListener( 'mousedown', this, false );
        //this.container.addEventListener( 'mouseup', this, false );
        //this.container.addEventListener( 'mouseout', this, false );

        this.container.addEventListener( 'touchmove', this, false );
        this.container.addEventListener( 'touchstart', this, false );
        this.container.addEventListener( 'touchend', this, false );

        document.addEventListener( 'mouseup', this, false );


        /*this.bigG = new THREE.PlaneBufferGeometry( 16*8, 16*8, 16*8, 16*8 );
        this.bigG.rotateX( -Math.PI * 0.5 );

        var qq = this.bigG.attributes.position.array;
        var k = qq.length/3;
        while(k--){
            var m = k * 3;
            qq[m] += this.center.x-0.5;
            qq[m+2] += this.center.z-0.5;
        }*/

        //var bigm = new THREE.Mesh(this.bigG, new THREE.MeshStandardMaterial({color:0xffffff, metalness:0.8, roughness:0.3 }) );//, wireframe:true }) );
        //bigm.position.set(this.center.x-0.5, -0.1, this.center.z-0.5)

        //console.log(this.bigG.attributes.position.array.length/3)

        //this.scene.add(bigm);

	   /* this.container.addEventListener( 'mousemove',  function(e) {_this.onMouseMove(e)} , false );
	    this.container.addEventListener( 'mousedown',  function(e) {_this.onMouseDown(e)}, false );
	    this.container.addEventListener( 'mouseup',  function(e) {_this.onMouseUp(e)}, false );
	    this.container.addEventListener( 'mouseout',  function(e) {_this.onMouseUp(e)}, false );
	    
	    this.container.addEventListener( 'touchstart',  function(e) {_this.onMouseDown(e)}, false );
	    this.container.addEventListener( 'touchend',  function(e) {_this.onMouseUp(e)}, false );
	    this.container.addEventListener( 'touchmove',  function(e) {_this.onMouseMove(e)}, false );

	    var body = document.body;
	    if( body.addEventListener ){
	        body.addEventListener( 'mousewheel',  function(e) {_this.onMouseWheel(e)}, false ); //chrome
	        body.addEventListener( 'DOMMouseScroll',  function(e) {_this.onMouseWheel(e)}, false ); // firefox
	    }else if( body.attachEvent ){
	        body.attachEvent("onmousewheel" ,  function(e) {_this.onMouseWheel(e)}); // ie
	    }*/

	    // active key
	    if(!this.isMobile) this.bindKeys();
	    
	    start();

	    // load winter extra map
		this.loadImagesPlus();
    },

    handleEvent : function( e ) {

        switch( e.type ) {
            case 'mouseup': case 'mouseout': case 'touchend':this.onMouseUp( e ); break;
            case 'mousedown': case 'touchstart': this.onMouseDown( e ); break;
            case 'mousemove': case 'touchmove': this.onMouseMove( e ); break;
            case 'mousewheel': this.onMouseWheel( e ); break;
        }

    },

    //----------------------------------- RENDER

    runStats : function(){
    	this.f[1] = Date.now();
        if (this.f[1]-1000 > this.f[0]){ 
        	this.f[0] = this.f[1];
        	hub.upStats(this.f[2], this.renderer.info.memory.geometries );
        	this.f[2] = 0;
	    }
	    this.f[2]++;
    },

    render: function(){
    	if(this.isWithStats) this.runStats();
    	//this.renderer.clear();
    	this.renderer.render( this.scene, this.camera );
    	if(this.deepthTest) this.miniRender();//miniRenderer.render( this.miniScene, this.topCamera );
    },

    //----------------------------------- MINI DEEP RENDER

    initMiniRender: function(){
    	this.miniTree = null;
		this.minibuilding = null;
		this.miniTreeUpdate = 0;
    	this.townHeigth = this.customShader();
	    //this.buildingHeigth = this.customShader();
    	
    	this.miniScene = new THREE.Scene();

    	var w = 5;
    	this.topCamera = new THREE.OrthographicCamera( -w , w , w , -w , 0.1, 200 );
    	this.topCameraDistance = 10;
    	this.miniScene.add( this.topCamera );

    	this.miniRenderer = new THREE.WebGLRenderer({ canvas:miniGlCanvas, precision: "lowp", antialias: false});
    	this.miniRenderer.setSize( this.miniSize.w, this.miniSize.h, true );
    	this.miniRenderer.sortObjects = false;
	    this.miniRenderer.sortElements = false;

	    this.deepthTest = true;
    },
    customShader:function(){

		var deepShader={
		    attributes:{},
		    uniforms:{ 
		    	deep: {type: 'f', value: 0.1}
		    },
		    fs:[
		        'precision lowp float;',
		        'varying vec4 vc;',
		        'void main(void) { gl_FragColor = vc; }'
		    ].join("\n"),
		    vs:[
		        'uniform float deep;',
		        'varying float dy;',
		        'varying vec4 vc;',
		        'void main(void) {',
		            'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		            'dy = position.y*deep;',
		            'vc = vec4(dy,dy,dy, 1.0);',
		        '}'
		    ].join("\n")
		};
		var material = new THREE.ShaderMaterial({
			uniforms: deepShader.uniforms,
			attributes: deepShader.attributes,
			vertexShader: deepShader.vs,
			fragmentShader: deepShader.fs
		});
		return material;

	},

    miniClear:function(){

    	var i = this.miniScene.children.length;
    	var m;
    	while(i--){
    		m = this.miniScene.children[ i ];
    		if (m.geometry) {
	    		m.geometry.dispose();
	    		this.miniScene.remove(m);
	    	}
    		
    	}

    },

    miniClearMesh:function(m){

	    m.geometry.dispose();
	    this.miniScene.remove(m);
	    m = null;

    },

    miniCheck: function(){
    	var l = this.findLayer(this.center.x, this.center.z);
    	var m;

    	if(l!==this.currentLayer){
    		this.currentLayer = l;
    		this.miniUpTree(l);
    		this.miniUpBuilding(l);
    		/*if(this.miniTree !== null) this.miniClearMesh(this.miniTree);
    		this.miniTree = new THREE.Mesh( this.treeMeshs[l].geometry.clone(), this.townHeigth);
			this.miniScene.add(this.miniTree);*/
    	} else {
    		if(this.miniTreeUpdate==1){
    			this.miniUpTree(l);
    			/*if(this.miniTree !== null) this.miniClearMesh(this.miniTree);
    			this.miniTree = new THREE.Mesh( this.treeMeshs[l].geometry.clone(), this.townHeigth);
    			this.miniScene.add(this.miniTree);*/
    			this.miniTreeUpdate = 0;
    		}
    	}
    },

    miniUpTree:function(l){
    	if(this.miniTree !== null) this.miniClearMesh(this.miniTree);
    	this.miniTree = new THREE.Mesh( this.treeMeshs[l].geometry.clone(), this.townHeigth);
    	this.miniScene.add(this.miniTree);
    },

    miniUpBuilding:function(l){
    	if(this.buildingMeshs[l]){
	    	if(this.minibuilding !== null) this.miniClearMesh(this.minibuilding);
	    	this.minibuilding = new THREE.Mesh( this.buildingMeshs[l].geometry.clone(), this.townHeigth);
	    	this.miniScene.add(this.minibuilding);
	    }
    },

    miniRender: function(){
    	if(this.deepthTest){
    		this.miniCheck();
    		this.miniRenderer.render( this.miniScene, this.topCamera );
    	}
    },

    

    //----------------------------------- RESIZE

    resize: function(){
    	this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
	    this.camera.aspect = this.vsize.z;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setSize(this.vsize.x,this.vsize.y);
	},

	startZoom : function(){
		this.timer = setInterval(this.faddingZoom, 1000/60, this);
	},

	faddingZoom : function(t){
		if(t.cam.distance>20){
			t.cam.distance--;
			t.moveCamera();
		}else clearInterval(t.timer);
	},

	//----------------------------------- LOAD IMAGES

	loadImages:function(){
    	var _this = this;
    	var n = this.num;
    	this.imgs[n] = new Image();
    	this.imgs[n].onload = function(){ 
    		_this.num++; 
    		if(_this.num===1) if(hub!==null) hub.subtitle.innerHTML = "Loading textures ...";
    		
    		if(_this.num === _this.imgSrc.length){ _this.changeTextures(); _this.num=0; }
    		else _this.loadImages();
    	};
        this.imgs[n].src = this.imgSrc[n];   
    },

    loadImagesPlus:function(){
    	var _this = this;
    	var n = this.num + 5;

    	this.imgs[n] = new Image();
    	this.imgs[n].src = this.imgSrcPlus[this.num];
    	this.imgs[n].onload = function(){ 
    		_this.num++;
    		if(_this.num === _this.imgSrcPlus.length){ _this.winterMapLoaded = true; }
    		else _this.loadImagesPlus();
    	};
    },

    winterSwitch : function (){
    	if(!this.isWinter && this.winterMapLoaded) this.isWinter = true;
    	else this.isWinter = false;

		this.updateBackground();
		this.setTimeColors(this.dayTime);
    },

	changeTextures : function (){

        this.envCanvas = document.createElement("canvas");
		this.groundCanvas = document.createElement("canvas");
		this.townCanvas = document.createElement("canvas");
		this.buildingCanvas = document.createElement("canvas");

        this.envCanvas.width = this.envCanvas.height = this.imgs[5].width;
		this.groundCanvas.width = this.groundCanvas.height = this.imgs[0].width;
		this.townCanvas.width = this.townCanvas.height = this.imgs[1].width;
		this.buildingCanvas.width = this.buildingCanvas.height = this.imgs[2].width;

        this.tint(this.envCanvas, this.imgs[5]);
		this.tint(this.groundCanvas, this.imgs[0]);
		this.tint(this.townCanvas, this.imgs[1], this.imgs[4]);
		this.tint(this.buildingCanvas, this.imgs[2], this.imgs[3]);

		this.imageSrc = this.groundCanvas;

		this.createTextures();
	},

	createTextures : function (){
		
		if(this.isWithEnv){
            this.environment = new THREE.Texture( this.envCanvas );
            this.environment.mapping = THREE.SphericalReflectionMapping;
            this.environment.needsUpdate = true;
            
		    //this.environment = THREE.ImageUtils.loadTexture( 'img/env.jpg', THREE.SphericalReflectionMapping);
		    //this.environment2 = THREE.ImageUtils.loadTexture( 'img/env.jpg', THREE.SphericalReflectionMapping);
		}

		this.townTexture = new THREE.Texture( this.townCanvas );
		this.townTexture.flipY = false;
		//this.townTexture.magFilter = THREE.NearestFilter;
        //this.townTexture.minFilter = THREE.LinearMipMapLinearFilter;
        this.townTexture.needsUpdate = true;

        this.buildingTexture = new THREE.Texture( this.buildingCanvas );
		this.buildingTexture.flipY = false;
		//this.buildingTexture.magFilter = THREE.NearestFilter;
        //this.buildingTexture.minFilter = THREE.LinearMipMapLinearFilter;
        this.buildingTexture.needsUpdate = true;


        
        
        // materials

        if(this.isWithLight){
            var s = new THREE.Vector2( 2, 2 );
            this.townMaterial = new THREE.MeshStandardMaterial( { map: this.townTexture, metalness:this.metalness, roughness:this.roughness, wireframe:this.wireframe  } );
            this.buildingMaterial = new THREE.MeshStandardMaterial( { map: this.buildingTexture, metalness:this.metalness, roughness:this.roughness, wireframe:this.wireframe  } );
        } else {
            this.townMaterial = new THREE.MeshBasicMaterial( { map: this.townTexture } );
            this.buildingMaterial = new THREE.MeshBasicMaterial( { map: this.buildingTexture } );
        }
        
	    



	    if(this.isWithEnv){
	    	this.townMaterial.envMap = this.environment;
	    	this.buildingMaterial.envMap = this.environment;
	    }

        if(this.isWithNormal){
            this.addNormalMap();
        }

	    /*
	    this.townMaterial.vertexColors = THREE.VertexColors
	    this.townMaterial.map = null;

	    this.townMaterial.vertexColors = null;
	    this.townMaterial.map = this.townTexture;*/

	    /*this.townMaterial.map.anisotropy = this.renderer.getMaxAnisotropy();
    	this.buildingMaterial.map.anisotropy = this.renderer.getMaxAnisotropy();
    	this.townMaterial.map.needsUpdate = true;
    	this.buildingMaterial.map.needsUpdate = true;*/

    	//this.townMaterial.transparent=true;
    	//this.buildingMaterial.transparent=true;

    	this.loadSea3d();
	},

    addNormalMap:function(){

        this.buildingTexture_n = new THREE.Texture( this.imgs[6] );
        this.buildingTexture_n.flipY = false;
        //this.buildingTexture_n.magFilter = THREE.NearestFilter;
        //this.buildingTexture_n.minFilter = THREE.LinearMipMapLinearFilter;
        this.buildingTexture_n.needsUpdate = true;

        this.townTexture_n = new THREE.Texture( this.imgs[7] );
        this.townTexture_n.flipY = false;
        //this.townTexture_n.magFilter = THREE.NearestFilter;
        //this.townTexture_n.minFilter = THREE.LinearMipMapLinearFilter;
        this.townTexture_n.needsUpdate = true;

        this.ground_n = this.imgs[8];

        this.townMaterial.normalMap = this.townTexture_n;
        this.buildingMaterial.normalMap = this.buildingTexture_n;

    },

	textureSwitch : function(type){
		switch(type){
			case 'normal': 
			    this.townMaterial.map = this.townTexture;
			    this.buildingMaterial.map =  this.buildingTexture;
			break;
			case 'white':
			    
			break;
		}

	},

	setTimeColors : function(id){

		this.dayTime = id;
		if(this.dayTime==1)this.tcolor = {r:100, g: 15, b: 80, a: 0.3};
		if(this.dayTime==2)this.tcolor = {r:10, g: 15, b: 80, a: 0.8};
		if(this.dayTime==3)this.tcolor = {r:10, g: 15, b: 80, a: 0.6};

		this.tint(this.skyCanvas);

		if(!this.isWinter){
			this.tint(this.groundCanvas, this.imgs[0]);
			this.tint(this.townCanvas, this.imgs[1], this.imgs[4]);
			this.tint(this.buildingCanvas, this.imgs[2], this.imgs[3]);
	    } else {
			this.tint(this.groundCanvas, this.imgs[5]);
			this.tint(this.townCanvas, this.imgs[6], this.imgs[4]);
			this.tint(this.buildingCanvas, this.imgs[7], this.imgs[3]);
		}

		if(this.isWithFog){
			if(this.isIsland){
				if(this.isWinter){
					if(this.dayTime==0)this.fog.color.setHex(0xAFEEEE);
					if(this.dayTime==1)this.fog.color.setHex(0x98ABBF);
					if(this.dayTime==2)this.fog.color.setHex(0x2B3C70);
					if(this.dayTime==3)this.fog.color.setHex(0x4C688F);
				}else{
					if(this.dayTime==0)this.fog.color.setHex(0x6666e6);
					if(this.dayTime==1)this.fog.color.setHex(0x654CB9);
					if(this.dayTime==2)this.fog.color.setHex(0x1C206E);
					if(this.dayTime==3)this.fog.color.setHex(0x2F328C);
				}
			} else {
				if(this.isWinter){
					if(this.dayTime==0)this.fog.color.setHex(0xE6F0FF);
					if(this.dayTime==1)this.fog.color.setHex(0xBFACCA);
					if(this.dayTime==2)this.fog.color.setHex(0x363C73);
					if(this.dayTime==3)this.fog.color.setHex(0x626996);
				}else{
					if(this.dayTime==0)this.fog.color.setHex(0xE2946D);
					if(this.dayTime==1)this.fog.color.setHex(0xBC6C64);
					if(this.dayTime==2)this.fog.color.setHex(0x352A56);
					if(this.dayTime==3)this.fog.color.setHex(0x60445C);
				}
			}
		}
		this.buildingTexture.needsUpdate = true;
        this.townTexture.needsUpdate = true;
        this.skyTexture.needsUpdate = true;

        this.fullRedraw = true;
	},

	//----------------------------------- SEA3D IMPORT

    loadSea3d : function (){
    	var _this = this;
	    var loader = new THREE.SEA3D();// true );
	    //var basicMap = new THREE.MeshBasicMaterial( {color:0x000000} )
	    loader.onComplete = function( e ) {
	        var m, map;
	        var i = loader.meshes.length;
	        while(i--){
	            m = loader.meshes[i];
                //console.log(m.name)
	            m.material.dispose();
	            //m.material = basicMap;
	            _this.meshs[m.name] = m;
	        }
	        _this.defineGeometry();
	    }
	    //if(!this.seaBuffer)loader.parser = THREE.SEA3D.DEFAULT;
	    //else loader.parser = THREE.SEA3D.BUFFER;
	    loader.load( this.rootModel );

	    if(hub!==null)hub.subtitle.innerHTML = "Loading 3d model ...";
	},

	//----------------------------------- 3D GEOMETRY

	defineGeometry : function(){
		var i;
		//var m = new THREE.Matrix4().makeScale(1, 1, 1);
		//var m2 = new THREE.Matrix4().makeTranslation(0.5, 0,0);

        var o = this.meshs;

		// BUILDING

		this.buildingGeo = [];
		this.buildingGeo[0] = null;
		this.buildingGeo[1] = null;
		this.buildingGeo[2] = null;
		this.buildingGeo[3] = null;

		this.buildingGeo[4] = o['police'].geometry;
		this.buildingGeo[5] = o['park_1'].geometry;
		this.buildingGeo[6] = o['park_2'].geometry;
		this.buildingGeo[7] = o['fire'].geometry;

		this.buildingGeo[8] = o['coal'].geometry;
		this.buildingGeo[9] = o['nuclear'].geometry;

		this.buildingGeo[10] = o['port'].geometry;
		this.buildingGeo[11] = o['stadium'].geometry;
		this.buildingGeo[12] = o['airport'].geometry;

		// BASIC 

		this.residentialGeo = [];
		this.commercialGeo = [];
		this.industrialGeo = [];
		this.houseGeo = [];

		i = 9;
		while(i--){
			this.industrialGeo[i] = o['i_0'+i].geometry;
			//this.industrialGeo[i].applyMatrix(m);
		}

		i = 19;
		while(i--){
			if(i<10) this.residentialGeo[i] = o['r_0'+i].geometry;
			else this.residentialGeo[i] = o['r_'+i].geometry;
			//this.residentialGeo[i].applyMatrix(m);
		}

		i = 21;
		while(i--){
			if(i<10) this.commercialGeo[i] = o['c_0'+i].geometry;
			else this.commercialGeo[i] = o['c_'+i].geometry;
			//this.commercialGeo[i].applyMatrix(m);
		}

		i = 12;
		while(i--){
			if(i<10) this.houseGeo[i] = o['rh_0'+i].geometry;
			else this.houseGeo[i] = o['rh_'+i].geometry;
			//this.houseGeo[i].applyMatrix(m);
		}

		//i = this.buildingGeo.length;
		//while(i--) {
		//	if(this.buildingGeo[i] !== null) this.buildingGeo[i].applyMatrix(m);
		//}

		// SPRITE

		this.spriteGeo = [];
		this.spriteGeo[0] = o['train'].geometry;//.clone();
		this.spriteGeo[1] = o['elico'].geometry.clone();
		this.spriteGeo[2] = o['plane'].geometry.clone();

		//i = this.spriteGeo.length;
		//while(i--) {
		//	this.spriteGeo[i].applyMatrix( m );
		//}

		// THREE

		this.treeGeo = [];

		this.treeGeo[0] = o['ttt3'].geometry;
		this.treeGeo[1] = o['ttt3'].geometry.clone();
		this.treeGeo[2] = o['ttt4'].geometry;
		this.treeGeo[3] = o['ttt4'].geometry.clone();

		this.treeGeo[4] = o['ttt0'].geometry;
		this.treeGeo[5] = o['ttt1'].geometry;
		this.treeGeo[6] = o['ttt2'].geometry;
		this.treeGeo[7] = o['ttt5'].geometry;

		//i = this.treeGeo.length;
		
		//while(i--) {
		//	this.treeGeo[i].applyMatrix( m );
			//this.treeGeo[i].applyMatrix( m2.makeRotationY( (Math.random()*360)*this.ToRad ) );
		//}

		// finish loading start render
		this.init();
	},

	getRandomObject : function(){
		var nn = this.randRange(0,6);
		var geo, mat, r, n;
		switch(nn){
			case 0: geo = this.buildingGeo[this.randRange(4,12)]; mat = this.townMaterial; break;
			case 1: geo = this.residentialGeo[this.randRange(1, this.residentialGeo.length-1)]; mat = this.buildingMaterial; break;
			case 2: geo = this.commercialGeo[this.randRange(1, this.commercialGeo.length-1)]; mat = this.buildingMaterial; break;
			case 3: geo = this.industrialGeo[this.randRange(1, this.industrialGeo.length-1)]; mat = this.buildingMaterial; break;
			case 4: geo = this.houseGeo[this.randRange(0, this.houseGeo.length-1)]; mat = this.buildingMaterial; break;
			case 5: geo = this.spriteGeo[this.randRange(0, this.spriteGeo.length-1)]; mat = this.townMaterial; break;
			case 6: 
			    r = this.randRange(0,2);
			    n = 0;
			    if(r==1) n= 4;
			    if(r==2) n= 6;
			    geo = this.treeGeo[n]; 
			    mat = this.townMaterial; 
			break;
		}
		var mesh = new THREE.Mesh(geo.clone(), mat.clone());
		mesh.name = geo.name;
		return mesh;
	},

	randRange : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	//----------------------------------- GEOMETRY PROCESS

	/*transGeo : function(g){
		if(this.isTransGeo){
			g.mergeVertices();
			g.computeVertexNormals( true );
			//g.computeTangents();
			//g.computeBoundingBox();
			//g.computeBoundingSphere();
			g.verticesNeedUpdate = true;
		}
		return g;
	},*/
	

	//----------------------------------- MESH CONSTRUCTOR    

    buildMeshLayer:function( layer, type ){

        type = type || 'tree';

        var id = 0;

        if( type === 'tree' ) id = 0;
        if( type === 'town' ) id = 1;
        if( type === 'house' ) id = 2;
        if( type === 'building' ) id = 3;

        

        var list = this.M_list[id];
        var temp = this.M_temp[id];
        var geom = this.M_geom[id];
        var mesh = this.M_mesh[id];
        var mats = this.M_mats[id];

        var g, _g, v, nr, uv, t, i, j, lng, n, ar, k, decal = 0;

        if( this[list][layer] ){

            i = this[list][layer].length;

            v = [];
            uv = [];
            nr = [];

            while(i--){

                ar = this[list][layer][i];

                if( id === 3 ){ // building

                    k = this.R.length;
                    while(k--){ 
                        if(ar[3] === this.R[k] ){ 
                            _g = this.residentialGeo[k];
                            // remove little house
                            if(k===0 && ar[5]===0){ this.buildingLists[layer][i][5] = 1; this.addBaseHouse( ar[0], ar[1], ar[2] ); }
                            else if(k>0 && ar[5]===1){ this.buildingLists[layer][i][5] = 0;  this.removeBaseHouse( ar[0], ar[1], ar[2] ); }
                        }

                    }

                    k = this.C.length;
                    while(k--){ if(ar[3] === this.C[k] ) _g = this.commercialGeo[k]; }

                    k = this.I.length;
                    while(k--){ if(ar[3] === this.I[k] ) _g = this.industrialGeo[k]; }

                } else if( id === 2 ){// house

                    k = this.H.length;
                    while(k--){ if( ar[3] === this.H[k] ) _g = this.houseGeo[k]; }

                } else {

                    if(ar[3] === 8 || ar[3] === 9 || ar[3] === 10 || ar[3] === 11) decal = 1;
                    if(ar[3] === 12) decal = 3;

                    _g = this[geom][ar[3]];

                }

                

                // position

                if( _g ){

                    t = _g.attributes.position.array;
                    lng = t.length/3;

                    for( j = 0; j < lng; j++){

                        n = j * 3;
                        v.push( t[n] + ar[0]  );
                        v.push( t[n+1] + ar[1] );
                        v.push( -t[n+2] + ar[2] + decal );

                    }

                    // normal

                    t = _g.attributes.normal.array;
                    lng = t.length/3;

                    for( j = 0; j < lng; j++){
                        n = j * 3;
                        nr.push( t[n] );
                        nr.push( t[n+1] );
                        nr.push( -t[n+2] );
                    }

                    // uv

                    t = _g.attributes.uv.array;
                    lng = t.length;

                    for( j = 0; j < lng; j++){
                        uv.push( t[j] );
                    }

                }

            }

            // remove old mesh

            if( this[mesh][layer] ){
                //console.log('remove');
                this.scene.remove( this[mesh][layer] );
                this[mesh][layer].geometry.dispose();

            }

            

            if( v.length > 0 ){

                // final geometry

                g = new THREE.BufferGeometry();
                g.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( v ), 3 ) );
                g.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( nr ), 3 ) );
                g.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uv ), 2 ) );
                
                //g.computeVertexNormals();

                // final mesh

                this[mesh][layer] = new THREE.Mesh( g, this[mats] );
                this.scene.add( this[mesh][layer] );

            }

            // clear temp

            this[temp][layer] = 0;

        }

    },

    //----------------------------------- TREE TEST

    addTree : function(x,y,z,v,layer){
        if( !this.isWithTree ) return;
        // v  21 to 43
        if( !this.treeLists[layer] ) this.treeLists[layer]=[];
        this.treeLists[layer].push([x,y,z,v]);
    },

    populateTree:function(){
    	if(!this.isWithTree) return;

    	var l = this.nlayers;

    	while( l-- ){

            this.buildMeshLayer( l );

    	}

    },

    clearAllTrees : function(){
    	if(!this.isWithTree) return;
    	var l = this.nlayers;
    	while(l--){
    		if( this.treeMeshs[l] ){
    			this.scene.remove( this.treeMeshs[l] );
    			if(this.treeMeshs[l].geometry) this.treeMeshs[l].geometry.dispose();
    		}
    	}
    	this.treeMeshs = [];
    	this.treeLists = [];
    	this.tempTreeLayers = [];
    },

    removeTreePack : function(ar){
    	if(!this.isWithTree) return;
    	//this.tempTreeLayers = [];
    	var i = ar.length;
    	while(i--){
    		this.removeTree(ar[i][0], ar[i][1], true);
    	}
    	// rebuild layers
    	i = this.tempTreeLayers.length;
    	while(i--){
    		if(this.tempTreeLayers[i] === 1){ this.rebuildTreeLayer(i); }
    	}
    },

    removeTree : function(x, z, m){
    	var l = this.findLayer(x, z), ar;
		if(this.treeLists[l]){
			var i = this.treeLists[l].length;
    		while(i--){
    			ar = this.treeLists[l][i];
    			if(ar[0] == x && ar[2]==z){
    				this.treeLists[l].splice(i, 1);
    				if(!m){ 
    					this.rebuildTreeLayer(l); 
    					return; 
    				} else {
    					// multy trees
    					this.tempTreeLayers[l] = 1;
    				}
    			} 
    		}
		}
    },

    rebuildTreeLayer : function( l ){
    	if(!this.isWithTree) return;
    	this.scene.remove(this.treeMeshs[l]);
    	this.treeMeshs[l].geometry.dispose();

        this.buildMeshLayer(l);

	    if(l == this.currentLayer) this.miniTreeUpdate = 1;

    },



    //------------------------------------ BACKGROUND MAP

    updateBackground : function(){
    	var rootColors;
        var fogColors;
    	if(this.isWithBackground ){
		    if(this.isIsland){
		    	rootColors = '#6666e6';
                fogColors = 0x6666e6; 
		    	if(this.isWinter){ 
                    rootColors = '#AFEEEE';
                    fogColors = 0xAFEEEE; 
                }
		    	this.skyCanvasBasic = this.gradTexture([[0.51,0.49, 0.3], [rootColors,'#BFDDFF', '#4A65FF']]);
		    	this.skyCanvas = this.gradTexture([[0.51,0.49, 0.3], [rootColors,'#BFDDFF', '#4A65FF']]);
		    	if(this.isWithFog){
		    		this.fog.color.setHex(fogColors);
		    	}
		    }
		    else{
		    	rootColors = '#E2946D';
                fogColors = 0xE2946D; 
		    	if(this.isWinter){ 
                    rootColors = '#E6F0FF';
                    fogColors = 0xE6F0FF; 
                }
		    	this.skyCanvasBasic =  this.gradTexture([[0.51,0.49, 0.3], [rootColors,'#BFDDFF', '#4A65FF']]);
		    	this.skyCanvas = this.gradTexture([[0.51,0.49, 0.3], [rootColors,'#BFDDFF', '#4A65FF']]);
		    	if(this.isWithFog){
		    		this.fog.color.setHex(fogColors);
		    	}
		    }
		    this.skyTexture = new THREE.Texture(this.skyCanvas);
		    this.skyTexture.needsUpdate = true;
		    this.back.material.map = this.skyTexture;
		} else {
			if(this.isIsland) this.renderer.setClearColor( 0x6666e6, 1 );
			else this.renderer.setClearColor( 0xcc7f66, 1 );
		}

        if(this.isWithLight){

            this.hemiLight.groundColor.setHex( fogColors );

        }
    },

    //------------------------------------ TERRAIN MAP

	updateTerrain : function(island){

		this.isIsland = island || false;

		this.center.x = this.mapSize[0]*0.5;
		this.center.z = this.mapSize[1]*0.5;

		this.updateBackground();

        

		// create terrain if not existe
        if(this.miniTerrain.length === 0){

        	var n = 0;//, texture, mat;
        	var colorsX = [ 0x000000, 0x220000, 0x440000, 0x660000, 0x880000, 0xaa0000, 0xcc0000, 0xff0000 ];
        	var colorsY = [ 0x000000, 0x002200, 0x004400, 0x006600, 0x008800, 0x00aa00, 0x00cc00, 0x00ff00 ];
        	for(var i=0; i<8; i++){
        		for(var j=0; j<8; j++){
        			//var geo = new THREE.PlaneGeometry( 16, 16, 16, 16 );
        			var geo;
        			if(this.isWithHeight){  
                        geo = new THREE.PlaneBufferGeometry( 16, 16, 16, 16 );
                    } else {
                        geo = new THREE.PlaneBufferGeometry( 16, 16, 1, 1 );  
                    }

                    geo.rotateX( -Math.PI * 0.5 );


                    var qq = geo.attributes.position.array;
                    var k = qq.length/3;
                    while(k--){
                        var m = k * 3;
                        qq[m] += (8+j*16)-0.5;
                        qq[m+2] += (8+i*16)-0.5;
                    }
        			//geo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI * 0.5 ) );
                    
        			//geo.computeBoundingSphere();
	        		//this.miniTerrain[n] = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({color:colorsX[i]+colorsY[j]}) );
	        		if(this.isColorTest) this.miniTerrain[n] = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:colorsX[i]+colorsY[j]}) );
	        		else{
                        if(this.isWithLight) this.miniTerrain[n] = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color:0xffffff, metalness:this.metalness, roughness:this.roughness, wireframe:this.wireframe }) );
                        else this.miniTerrain[n] = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:0xffffff}) );
                    }

	        		if(this.isWithEnv) this.miniTerrain[n].material.envMap = this.environment;
	        		//this.miniTerrain[n].position.set((8+j*16)-0.5,0,(8+i*16)-0.5);
	        		this.land.add( this.miniTerrain[n] );
	        		n++;
	        	}
	        }
	    }

	    // update start map texture
        n = this.miniTerrain.length;
        var texture, textureN;
        while(n--){
        	texture = new THREE.Texture( this.miniCanvas[n] );
        	//texture.magFilter = THREE.NearestFilter;
        	//texture.minFilter = THREE.LinearMipMapLinearFilter;
        	texture.needsUpdate = true;
        	this.miniTerrain[n].material.map = texture;

            if(this.isWithNormal){
                textureN = new THREE.Texture( this.miniCanvasN[n] );
                //textureN.magFilter = THREE.NearestFilter;
                //textureN.minFilter = THREE.LinearMipMapLinearFilter;
                textureN.needsUpdate = true;
                this.miniTerrain[n].material.normalMap = textureN;
            }
        	
        	//this.miniTerrain[n].material.transparent = true;

        	this.terrainTxt[n] = texture;
        } 

        if( this.isWithHeight ){
		    this.applyHeight();
		    //this.center.y = this.heightData[this.findId(this.center.x,this.center.z)];
            this.center.y = this.heightData[this.findHeightId(this.center.x,this.center.z)];
		} else {
			this.center.y = 0;
		}

		this.moveCamera();
		this.back.position.copy(this.center);

        
	},

	//------------------------------------------HEIGHT

	generateHeight : function () {
		if(this.miniTerrain.length != 0){
			var e = this.miniTerrain.length;
			while(e--){ this.land.remove( this.miniTerrain[e] ); }
			this.miniTerrain = [];
		}


        this.bigG = new THREE.PlaneBufferGeometry( 16*8, 16*8, 16*8, 16*8 );
        this.bigG.rotateX( -Math.PI * 0.5 );

        var qq = this.bigG.attributes.position.array;
        var k = qq.length/3;
        while(k--){
            var m = k * 3;
            qq[m] += this.center.x;//-0.5;
            qq[m+2] += this.center.z;//-0.5;
        }

		
		var w = this.mapSize[0];
		var h = this.mapSize[1];

        var i, j, x, y;

        var d = (8*16)+1;
		var size = d * d;

		var data = new ARRAY_TYPE( size );
		var perlin = new Perlin();//, z = Math.random() * 100;

        var noise;

        var r = 1 / d;//w;
        var quality = 1 / 20;

        var multy = 3 + ( Math.random() * 2 );

        i = size;



        while(i--){

			x = i % d;
            y = ~~ ( i * r );

            noise = perlin.noise( x * quality, y  * quality );

			data[ i ] = (0.5+(noise*0.5))*multy;
		}

        //console.log('total: ' + data.length )

		return data;
	},

	resetHeight : function () {
		var i = this.heightData.length;
		while(i--){
			this.heightData[i] = 0;
		}
		this.applyHeight();
		this.isWithHeight = false;
	},

    findHeightId : function ( x, z ){
        return this.findSamePoint(x, z);
        //var ratio = 16384 / 16641;
        //return Math.floor(n*ratio);
    },

    findSamePoint : function(x, z){
        var ar 
        if( this.bigG ) ar = this.bigG.attributes.position.array;
        else ar = this.positionRef;
        var i = ar.length/3, n, y = 0;
        while(i--){
            n = i*3;
            if(ar[n] === x && ar[n+2] === z){ 
                y = i;//ar[n+1];
                break; 
            }
        }

        return y;

    },

	applyHeight : function () {

		var i, j, gr, gn;
        var lng = this.heightData.length;
		var pos, layer, h, v, d=0, n, nn, idd;
        this.Gtmp = [];

        gr = this.bigG.attributes.position.array;

        
        i = gr.length/3;
        while(i--){
            n = i*3;
            gr[n+1] = this.heightData[i];
        }

        this.bigG.attributes.position.needUpdate = true;
        this.bigG.computeVertexNormals();

        this.positionRef = new Float32Array( gr.length );
        i = gr.length;
        while(i--){
            this.positionRef[i] = gr[i];
        }

        //this.positionRef = this.bigG.attributes.position.array;///new Float32Array( this.bigG.attributes.position.array );


        var rn = this.bigG.attributes.normal.array;

        //console.log( 'base' ,  this.bigG.attributes.position.array[0], this.bigG.attributes.position.array[2] )


        i = 64;
        while (i--){
            this.Gtmp[i] = new ARRAY_TYPE(289);
        }

        i = 64;
        while (i--){
            gr = this.miniTerrain[i].geometry.attributes.position.array;
            gn = this.miniTerrain[i].geometry.attributes.normal.array;
            j = gr.length/3;
            while(j--){
                n = j * 3;

                idd = this.findSamePoint( gr[n]+0.5, gr[n+2]+0.5 );
                this.Gtmp[j] = this.heightData[ idd ]; 

                gr[n+1] = this.Gtmp[j];

                nn = idd*3;
                gn[n] = rn[nn];
                gn[n+1] = rn[nn+1];
                gn[n+2] = rn[nn+2];

                //if(j===0) console.log(gr[n], gr[n+2] )

                //this.Gtmp[i][j] = 
            }

            this.miniTerrain[i].geometry.attributes.position.needUpdate = true;
            this.miniTerrain[i].geometry.attributes.normal.needUpdate = true;
            //this.miniTerrain[i].geometry.computeVertexNormals();

        }

        this.bigG.dispose();
        this.bigG = null;
        /*for(i = 0; i < lng; i++ ){
            pos = this.findPositionDisp(i);
            //layer = this.findLayer(pos[0], pos[1]);
            layer = this.findLayerDisp(pos[0], pos[1]);
            //pos = this.findPosition(i);
            //layer = Math.floor(i/289);
            if( this.Gtmp[layer] === undefined ){ 
                //console.log(layer)
                this.Gtmp[layer] = [];
            }
            //v = this.findVertices( layer, pos );
            v = this.findVerticesDisp( layer, pos );
            //v = i - (layer*289);
            //v = this.findVertices( layer, pos );
            this.Gtmp[layer][v] = this.heightData[i];

        }*/
      /*  var i = lng;
		while(i--){

            n = i*3;
            this.bigG.attributes.position.array[n+1] = this.heightData[i];

            //pos = [this.bigG.attributes.position.array[n], this.bigG.attributes.position.array[n+2]]



			pos = this.findPositionDisp(i);//this.findPosition(i);
			layer = this.findLayerDisp( pos[0], pos[1] );
            //if( this.Gtmp[layer] === undefined ) this.Gtmp[layer] = [];
			//v = this.findVertices( layer, pos );
            v = this.findVerticesDisp( layer, pos );
            //d = layer*33;
            this.Gtmp[layer][v] = this.heightData[i];

		}

        console.log(this.Gtmp.length, this.Gtmp[0].length,  this.miniTerrain[0].geometry.attributes.position.array.length/3, this.heightData.length/64, this.heightData.length/289 )

		i = this.miniTerrain.length;
        while(i--){ 
            this.updateVertices( this.miniTerrain[i].geometry, this.Gtmp[i] );
        }

        this.bigG.attributes.position.needUpdate = true;
        this.bigG.computeVertexNormals();*/
        //tmp = null;
	},

	makePlanar:function(ar, y){

		/*var layer, v, x, z;
        var tmp = [];
		var i = ar.length;
    	while(i--){
    		x = ar[i][0];
    		z = ar[i][1];
    		layer = this.findLayer(x, z);
            //if( tmp[layer] === undefined ) tmp[layer] = [];
    		v = this.findVertices(layer, [x, z] );//findVertices(layer, [x, z] );
            this.Gtmp[layer][v] = y;//this.heightData[i];
    		this.tempHeightLayers[layer] = 1;
    	}
    	// rebuild layers
    	i = this.tempHeightLayers.length;
    	while(i--){
    		if(this.tempHeightLayers[i] === 1){
                this.updateVertices( this.miniTerrain[i].geometry, this.Gtmp[i]  );
    		}
    	}
    	this.tempHeightLayers = [];*/
        //tmp = null;

	},

    updateVertices : function( g, ar ){
        var vertices = g.attributes.position.array;
        var i = ar.length, n;
        while(i--){
            n = i*3;
            vertices[n+1] = ar[i]; 
        }

        g.attributes.position.needUpdate = true;
        //g.computeBoundingSphere();
        //g.computeVertexNormals();

    },

	//------------------------------------------LAYER 8X8

    findPositionDisp : function(id){
        var n = Math.floor(id/129);
        var y = n;
        var x = id-Math.floor(n*129);
        return [x,y];
    },

    findLayerDisp : function(x,z){
        var cy = Math.floor(z/16);
        var cx = Math.floor(x/16);
        return cx+(cy*8);
    },

    findVerticesDisp : function(layer, pos){
        var v = 0;
        var cy = Math.floor(layer/8);
        var cx = Math.floor(layer-(cy*8));
        //var py = pos[1]-(16*cy);
        //var px = pos[0]-(16*cx);
        //v = px + (py*16);
        var py = pos[1]-(16*cy);
        var px = pos[0]-(16*cx);
        v = px + (py*16);
        return v;
    },


	findLayer : function(x,z){
		var cy = Math.floor(z/16);
        var cx = Math.floor(x/16);
		return cx+(cy*8);
	},

    

	findLayerPos:function(x,y,layer){
		var cy = Math.floor(layer/8);
        var cx = Math.floor(layer-(cy*8));
		var py = y-(16*cy);
        var px = x-(16*cx);
        return [px,py];
	},

    

	findPosition : function(id){
		var n = Math.floor(id/this.mapSize[1]);
		var y = n;
		var x = id-(n*this.mapSize[1]);
		return [x,y];
	},

	findId : function(x, y){
		var id = x+(y*this.mapSize[1]);
		return id;
	},

    

	findVertices : function(layer, pos){
		var v = 0;
		var cy = Math.floor(layer/8);
        var cx = Math.floor(layer-(cy*8));
        //var py = pos[1]-(16*cy);
        //var px = pos[0]-(16*cx);
        //v = px + (py*16);
        var py = pos[1]-(16*cy);
        var px = pos[0]-(16*cx);
        v = px + (py*16);
		return v;
	},


	//------------------------------------------RAY

	rayTest : function () {

        this.raycaster.setFromCamera( this.rayVector, this.camera );

		if ( this.land.children.length > 0 ) {
			var intersects = this.raycaster.intersectObjects( this.land.children );
			if ( intersects.length > 0 ) {

				this.pos.x = Math.round(intersects[0].point.x);
				this.pos.z = Math.round(intersects[0].point.z);

				if( this.isWithHeight )this.pos.y = Math.round(intersects[0].point.y);
				else this.pos.y = 0;
				
				

				if(this.currentTool){
					this.tool.position.set(this.pos.x, this.pos.y, this.pos.z);
					if(this.mouse.click || this.mouse.drag) mapClick();
					//if(this.mouse.click || this.currentTool.drag) mapClick();

					this.mouse.click=false;
				}
		    } else {
		    	this.pos.x = -1;
		    	this.pos.z = -1;
		    }
		}
	},

	//------------------------------------------TOOL

	selectTool : function(id){
		this.pos.x = -1;
		this.pos.z = -1;
		// remove old tool
		if(this.tool !== null) this.removeTool();

		if( id === 0 || id === 18){
			this.currentTool = null;
        	this.mouse.dragView = false;
        	this.mouse.move = true;
		} else if ( id === 16 ){
			this.currentTool = null;
        	this.mouse.move = false;
        	this.mouse.dragView = true;
		} else {
			this.currentTool = this.toolSet[id];
			this.mouse.move = false;
			this.mouse.dragView = false;
			this.tool = this.customTool();
	        this.scene.add(this.tool);
		}

		/*if(id){
			if( id === 17 ){
				this.currentTool = null;
	        	this.mouse.dragView = true;
	        } else {
				this.currentTool = this.toolSet[id];
				this.mouse.move = false;
				this.tool = this.customTool();
		        this.scene.add(this.tool);
		    }
        } else {
        	this.currentTool = null;
        	this.mouse.move = true;
        }*/
        sendTool(this.toolSet[id].tool);
	},

	customTool : function(){
		var size = this.currentTool.size;
		var color = this.currentTool.color;
		
		var mid = size*0.5;
		var d = 0, y=0.02;
		if(size == 4) d=0.5;
		else if(size == 6 ) d=1.5;
		var geo = new THREE.Geometry();
		var vertices = [ new THREE.Vector3( -mid+d, y, -mid+d ), new THREE.Vector3( -mid+d, y, mid+d ), new THREE.Vector3( mid+d, y, mid+d ), new THREE.Vector3( mid+d, y, -mid+d ) ];
	    geo.vertices.push( vertices[ 0 ], vertices[ 1 ], vertices[ 1 ], vertices[ 2 ], vertices[ 2 ], vertices[ 3 ], vertices[ 3 ], vertices[ 0 ] );
		//var m =  new THREE.Line( geo, new THREE.LineBasicMaterial( { color: color, linewidth:3 } ), THREE.LinePieces );
        var m = new THREE.LineSegments( geo, new THREE.LineBasicMaterial({ color: color, linewidth:3, depthWrite: false, depthTest: false }))
		m.overdraw = true;
		return m;
	},

	build : function(x,y){
		
		if(this.currentTool.tool==='query') return;

		if(this.currentTool.build){
			//var ntool = this.toolSet[id];
			var size = this.currentTool.size;
			var sizey = this.currentTool.sy;

			var py = 0;
			//if( this.isWithHeight ) py = this.heightData[this.findId(x,y)];//this.pos.y;//this.heightData[ n ];
            if( this.isWithHeight ) py = this.heightData[this.findHeightId(x,y)];

			var zone; 
			if(size == 1 ) zone = [ [x, y] ];
			else if(size == 3) zone = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1] ];
			else if(size == 4) zone = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2]   ];
			else if(size == 6) zone = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2],   [x-1, y+2], [x, y+2], [x+1, y+2], 
				[x+3, y-1], [x+4, y-1],   [x+3, y], [x+4, y], [x+3, y+1], [x+4, y+1], [x+3, y+2], [x+4, y+2], [x+3, y+3], [x+4, y+3], [x+3, y+4], [x+4, y+4], 
				[x-1, y+3], [x-1, y+4], [x, y+3], [x, y+4],  [x+1, y+3], [x+1, y+4], [x+2, y+3], [x+2, y+4]
			];

			this.removeTreePack(zone);
			this.cleanGround(zone);
			if( this.isWithHeight ) this.makePlanar(zone, py);

			
			/*var b = new THREE.Mesh(new THREE.BoxGeometry(size,sizey,size), new THREE.MeshBasicMaterial({color:this.currentTool.color, transparent:true, opacity:0.5}) );
			if(size == 4) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, sizey*0.5, 0.5));
			else if(size == 6) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1.5, sizey*0.5, 1.5));
			else b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, sizey*0.5, 0));
			b.position.set(x, 0, y);
			this.scene.add(b);*/

			var v = this.currentTool.geo;

			// standard building
			if(v<4 && v!==0){
				this.addBaseBuilding(x, py, y, v, zone);
				this.snd_layzone.play();
			}
			// town building
			if(v==8 || v==9 || v==4 || v==5 || v==7 || v==10 || v==11 || v==12){
				this.addBaseTown(x,py,y,v,zone);
			    this.snd_layzone.play();
			}

		} else {
			this.removeTree(x,y);
			if( this.isWithHeight ){
				//py = this.heightData[this.findId(x,y)];
                py = this.heightData[this.findHeightId(x,y)];
			    this.makePlanar( [[x,y]],  py );
			}
			if(this.currentTool.tool=='bulldozer'){
				this.forceUpdate.x = x;
		        this.forceUpdate.y = y;
		        this.testDestruct(x,y);
		    }
		}
	},

	removeTool : function(){
		this.scene.remove(this.tool);
		this.tool.geometry.dispose();
		this.tool = null;
		this.currentTool = null;
	},

	//--------------------------------------------------TEST DESTRUCT

	testLayer:function(x,y){
		var l = this.findLayer(x,y);
		var list = [l];
		var pos = this.findLayerPos(x,y,l);
		var a = 0,b = 0;

		if(pos[0]<4) a=1;
		else if(pos[0]>13) a=2;

		if(pos[1]<4) b=1;
		else if(pos[1]>13) b=2;

		if(b==1) if(l-8>-1) list.push(l-8);
		if(b==2) if(l+8<64) list.push(l+8);

		if(a==1) if(l-1>-1) list.push(l-1);
		if(a==2) if(l+1<64) list.push(l+1);

		if(a==1 && b==1) if(l-9>-1) list.push(l-9);
		if(a==2 && b==2) if(l+9<64) list.push(l+9);

		if(a==1 && b==2) if(l+7<64) list.push(l+7);
		if(a==2 && b==1) if(l-7>-1) list.push(l-7);

		//console.log(list);
		return list;
	},

	testDestruct:function(x,y){
		var i, j, ar, ar2, l;
		var list = this.testLayer(x,y);

		for(var h= 0; h<list.length; h++){
			l = list[h];
			// IF TOWN
			if(this.townLists[l]){
				i = this.townLists[l].length;
				while(i--){
					ar = this.townLists[l][i];
					ar2 = ar[4];
					j = ar2.length;
					while(j--){
						if(x == ar2[j][0] && y == ar2[j][1]){
							this.showDestruct(ar);
							destroy(ar2[0][0], ar2[0][1]);
							this.townLists[l].splice(i, 1);
							this.rebuildTownLayer(l);
							return;
						}
					}
				}
			}
			// IF BUILDING
			if(this.buildingLists[l]){
				i = this.buildingLists[l].length;
				while(i--){
					ar = this.buildingLists[l][i];
					ar2 = ar[4];
					j = ar2.length;
					while(j--){
						if(x == ar2[j][0] && y == ar2[j][1]){
							this.showDestruct(ar);
							destroy(ar2[0][0], ar2[0][1]);
							// IF HOUSE
							if(ar[5]===1){ this.removeBaseHouse(ar[0],ar[1],ar[2]); }

							this.buildingLists[l].splice(i, 1);
							this.rebuildBuildingLayer(l);

							return;
						}
					}
				}
			}
	    }
	},

	showDestruct:function(ar){

		this.tempDestruct = ar[4];

	},

	//--------------------------------------------------TOWN BUILDING

	addBaseTown : function( x, y, z, v, zone ){

		var layer = this.findLayer(x,z);
		if(!this.townLists[layer]) this.townLists[layer]=[];
    	this.townLists[layer].push([x,y,z,v,zone]);
    	this.rebuildTownLayer(layer);

	},

	rebuildTownLayer : function(l){

        this.buildMeshLayer( l, 'town' );

	},

	//--------------------------------------------------HOUSE CREATE/UPDATE/DELETE

	addBaseHouse : function(x,y,z){
		//console.log('h add !!')
		var layer = this.findLayer(x,z);
		var pos = [ [x, z], [x-1, z], [x+1, z], [x, z-1], [x-1, z-1], [x+1, z-1], [x, z+1], [x-1, z+1], [x+1, z+1] ];

		if(!this.houseLists[layer]) this.houseLists[layer]=[];
		var i = 9;
		while(i--){
			this.houseLists[layer].push([pos[i][0],y,pos[i][1], 0 ]);
		}
	},

	removeBaseHouse : function(x,y,z){
		//console.log('h remove !!')
		var layer = this.findLayer(x,z);
		var pos = [ [x, z], [x-1, z], [x+1, z], [x, z-1], [x-1, z-1], [x+1, z-1], [x, z+1], [x-1, z+1], [x+1, z+1] ];
		var i = this.houseLists[layer].length, h, j;
		while(i--){
			h = this.houseLists[layer][i];
			j = 9;
			while(j--){
			    if(h[0] === pos[j][0] && h[2] === pos[j][1]) this.houseLists[layer].splice(i, 1);
		    }
		}
		this.rebuildHouseLayer(layer);
	},

	rebuildHouseLayer : function(l){

        this.buildMeshLayer( l, 'house' );

    },


	//--------------------------------------------------BUILDING CREATE/UPDATE

	addBaseBuilding : function(x,y,z,v,zone){
		var layer = this.findLayer(x,z);
		var c = 244;
		if(v==2) c = 427;
		if(v==3) c = 616;

    	if(!this.buildingLists[layer]) this.buildingLists[layer]=[];
    	//this.buildingLists[layer].push([x,y,z,c, 0, zone]);
    	this.buildingLists[layer].push([x,y,z,c, zone, 0 ]);

    	this.rebuildBuildingLayer(layer);
    },

    rebuildBuildingLayer : function(l){

        this.buildMeshLayer( l, 'building' );

    },

    //---------------------------------------------------BUILDING LISTING

    saveCityBuild : function (saveCity){
    	
    	var l = this.nlayers;
    	while(l--){
    		saveCity[l]= [0,0,0];
    		if(this.townLists[l] !== undefined ){saveCity[l][0] = this.townLists[l];}
	    	if(this.houseLists[l] !== undefined ){saveCity[l][1] = this.houseLists[l];}
	    	if(this.buildingLists[l] !== undefined ){saveCity[l][2] = this.buildingLists[l];}
	    	/*
	    	if(this.townMeshs[l] !== undefined ){saveCity[l][0] = this.townMeshs[l];}
	    	if(this.houseMeshs[l] !== undefined ){saveCity[l][1] = this.houseMeshs[l];}
	    	if(this.buildingMeshs[l] !== undefined ){saveCity[l][2] = this.buildingMeshs[l];}*/
	    }
	    //
	   // return saveCity;
    },

    loadCityBuild : function (saveCity){
    	saveCity = JSON.parse(saveCity);
    	var l = this.nlayers;
    	var ldata;
    	while(l--){
    		ldata = saveCity[l];
    		if(ldata[0] !== 0 ){ this.townLists[l] = ldata[0]; this.rebuildTownLayer(l); }
	    	if(ldata[1] !== 0 ){ this.houseLists[l] = ldata[1]; this.rebuildHouseLayer(l); }
	    	if(ldata[2] !== 0 ){ this.buildingLists[l] = ldata[2]; this.rebuildBuildingLayer(l); }
	    	/*
    		if(ldata[0] !== 0 ){ this.townMeshs[l] = ldata[0]; this.rebuildTownLayer(l); }
	    	if(ldata[1] !== 0 ){ this.houseMeshs[l] = ldata[1]; this.rebuildHouseLayer(l); }
	    	if(ldata[2] !== 0 ){ this.buildingMeshs[l] = ldata[2]; this.rebuildBuildingLayer(l); }
	    	*/
    	}
    },


	//--------------------------------------------------- NAVIGATION



	Orbit : function (origine, horizontal, vertical, distance) {
	    var p = new THREE.Vector3();
	    if(vertical>87)vertical=87;
	    if(vertical<1)vertical=1;
	    var phi = vertical*this.ToRad ;
	    var theta = horizontal*this.ToRad;
	    p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
	    p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
	    p.y = (distance * Math.cos(phi)) + origine.y;
	    return p;
	},

	unwrapDegrees : function (r){
		r = r % 360;
		if (r > 180) r -= 360;
		if (r < -180) r += 360;
		return r;
	},

	moveCamera : function () {
	    this.camera.position.copy(this.Orbit(this.center, this.cam.horizontal, this.cam.vertical, this.cam.distance));
	    this.camera.lookAt(this.center);
	    if(this.isWithFog){
	        this.fog.far=this.cam.distance*4;
	        if(this.fog.far<20)this.fog.far=20;
	    }

	    if(this.deepthTest){
	    	this.topCamera.position.set(this.center.x, this.topCameraDistance, this.center.z);
	    	this.topCamera.lookAt(this.center);
	    }
	},

	dragCenterposition : function(){
		if ( this.ease.x == 0 && this.ease.z == 0 ) return;
    	this.easeRot.y = this.cam.horizontal*this.ToRad;
    	var rot = this.unwrapDegrees(Math.round(this.cam.horizontal));
        this.easeRot.x = Math.sin(this.easeRot.y) * this.ease.x + Math.cos(this.easeRot.y) * this.ease.z;
        this.easeRot.z = Math.cos(this.easeRot.y) * this.ease.x - Math.sin(this.easeRot.y) * this.ease.z;

    	this.center.x += this.easeRot.x; 
    	this.center.z -= this.easeRot.z; 

    	if(this.center.x<0) this.center.x = 0;
    	if(this.center.x>128) this.center.x = 128;
    	if(this.center.z<0) this.center.z = 0;
    	if(this.center.z>128) this.center.z = 128;
    	
        this.moveCamera();
	},

	onMouseDown : function (e) {   
		e.preventDefault();
	    var px, py;
	    if(e.touches){
	        px = e.clientX || e.touches[ 0 ].pageX;
	        py = e.clientY || e.touches[ 0 ].pageY;
	    } else {
	        px = e.clientX;
	        py = e.clientY;
	        // 0: default  1: left  2: middle  3: right
	        this.mouse.button = e.which;
	    }

	    //if(this.mouse.button===1 && this.currentTool) this.mouse.move = true;

	    this.mouse.ox = px;
	    this.mouse.oy = py;
	    this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
	    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
	    this.mouse.h = this.cam.horizontal;
	    this.mouse.v = this.cam.vertical;
	    this.mouse.down = true;
	    
	    if(this.currentTool && this.mouse.button<2){// only for tool
	    	this.mouse.click = true;
	        if(this.currentTool.drag){ this.mouse.drag = true;}
	        
	    }
	   
	},

	onMouseUp : function (e) {
		e.preventDefault();
		this.mouse.button = 0;
	    this.mouse.down = false;
	    this.mouse.drag = false;
	    if(this.currentTool==null)this.mouse.move = true;
	    this.ease.x = 0;
	    this.ease.z = 0;
	    document.body.style.cursor = 'auto';
	},

	onMouseMove : function (e) {
	    e.preventDefault();

	    var px, py;
	    if(e.touches){
	        px = e.clientX || e.touches[ 0 ].pageX;
	        py = e.clientY || e.touches[ 0 ].pageY;
	    } else {
	        px = e.clientX;
	        py = e.clientY;
	    }
	    
	    if (this.mouse.down) {
	        if(this.mouse.move || this.mouse.button===2){  
	        	this.mouse.dragView = false;
		        document.body.style.cursor = 'crosshair';
		        this.cam.horizontal = ((px - this.mouse.ox) * 0.3) + this.mouse.h;
		        this.cam.vertical = (-(py -this. mouse.oy) * 0.3) + this.mouse.v;
		        this.moveCamera();
		    }
		    if(this.mouse.dragView || this.mouse.button===3){
		    	document.body.style.cursor = 'move';
		    	this.mouse.move = false;
		    	this.ease.x = (px - this.mouse.ox)/1000;
		    	this.ease.z = (py - this. mouse.oy)/1000;
		    }
	    } 

	    if(this.currentTool !== null){
			this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
		    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
			this.rayTest();
		}
	},

	onMouseWheel : function (e) { 
		e.preventDefault();   
	    var delta = 0;
	    if(e.wheelDelta){delta=e.wheelDelta*-1;}
	    else if(e.detail){delta=e.detail*20;}
	    this.cam.distance+=(delta/80);
	    if(this.cam.distance<1)this.cam.distance = 1;
	    if(this.cam.distance>150)this.cam.distance = 150;
	    this.moveCamera();
	},





	// -----------------------

	cleanGround: function(ar){
		var i = ar.length, l, x, y, cx, cy;
    	while(i--){
    		x = ar[i][0];
    		y = ar[i][1];
    		cx = Math.floor(x/16);
    		cy = Math.floor(y/16);
    		l = cx+(cy*8);
    		this.miniCtx[l].drawImage(this.imageSrc,0, 0, 16*this.mu, 16*this.mu, ((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu);
    		this.txtNeedUpdate[l] = 1;
    	}
	},

	paintMap : function( mapSize, island, isStart, fullRebuild) {
		if(!tilesData) return;

		if(mapSize) this.mapSize = mapSize;

		if(isStart){ 
			this.treeValue = [];
			this.clearAllTrees();
			if(this.isWithHeight){  this.heightData = this.generateHeight(); }
		}
		else{ this.tempBuildingLayers = []; this.tempHouseLayers = []; }
		
		// create mini canvas if not existe
		if( this.miniCanvas.length === 0 ){
			for(var i=0; i<this.nlayers; i++){
				this.miniCanvas[i] = document.createElement('canvas');
				this.miniCanvas[i].width = this.miniCanvas[i].height = 256*this.mu;
        		this.miniCtx[i] = this.miniCanvas[i].getContext("2d");

                if(this.isWithNormal){
                    this.miniCanvasN[i] = document.createElement('canvas');
                    this.miniCanvasN[i].width = this.miniCanvasN[i].height = 256*this.mu;
                    this.miniCtxN[i] = this.miniCanvasN[i].getContext("2d");
                }
        		this.txtNeedUpdate[i] = 0;		
        	}
		}

		var force = false;
		var y = this.mapSize[1];
		var x, v, px, py, n = tilesData.length, cy, cx, layer, ar, r, ty = 0;
		//var gx, gy, mx, my, gg = this.tileSize*2;

		while(y--){
			x = this.mapSize[0];
			while(x--){

				// find layer
				//layer = this.findLayer(x, y);

				cy = Math.floor(y/16);
                cx = Math.floor(x/16);
				layer = cx+(cy*8);

				n--;
				v = tilesData[n];

				if(isStart){// || this.fullRedraw){ 
					//if(v > 1 && v < 21){ // water
					if(v > 1 && v < 5){ // water
						if( this.isWithHeight ) this.heightData[ this.findHeightId(x, y) ] = -0.1; 
					}
                    if(v > 5 && v < 21){ // water border
                        if( this.isWithHeight ) this.heightData[ this.findHeightId(x, y) ] *= 0.5; 
                    }
					if(v > 20 && v < 44){// tree
						if( this.isWithHeight ) ty = this.heightData[ this.findHeightId( x, y) ]-0.1;
						r = Math.floor(Math.random()*4);
						//if(v==43 || v==42|| v==41) r = 4;
						//if( v==40 || v==39|| v==38 || v==37 || v==36) r = 5;

						
						if(v>=36) r+=4;
						
						if(isStart)this.addTree( x, ty, y, r, layer ); 
						if(this.isWithTree)v=21+r;
						else v=21+8+r;
						this.treeValue[n] = v;
						//v=0;
				    } 
				}
				if(this.fullRedraw){ if(v > 20 && v < 44) v = this.treeValue[n];}
				//if(isStart){if(v > 20 && v < 44){ v=0;};}
				px = v % 32 * 16;
                py = Math.floor(v / 32) * 16;


                if(isStart || this.fullRedraw){ // full draw for new map

                	//this.miniCtx[layer].drawImage(this.imageSrc,px*this.mu, py*this.mu, 16*this.mu, 16*this.mu, ((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu);
                	//if(v==1)this.miniCtx[layer].clearRect(((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu);
                	//else 
                	this.miniCtx[layer].drawImage(this.imageSrc,px*this.mu, py*this.mu, 16*this.mu, 16*this.mu, ((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu);
                    if(this.isWithNormal){ this.miniCtxN[layer].drawImage(this.ground_n,px*this.mu, py*this.mu, 16*this.mu, 16*this.mu, ((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu); }
                } else { // draw only need update
                	if(x===this.forceUpdate.x && y===this.forceUpdate.y){ force=true; this.forceUpdate.x=-1; this.forceUpdate.y=-1 }
                	if((v>43 && v<240) || force){ // road . rail . wire
                		if(force){force = false;  if(v > 20 && v < 44){px = 0; py=0;}};// bulldozer
                		//this.miniCtx[layer].drawImage(this.imageSrc,px, py, 16, 16, ((x-(cx*16))*16),((y-(cy*16))*16), 16, 16);
                		this.miniCtx[layer].drawImage(this.imageSrc,px*this.mu, py*this.mu, 16*this.mu, 16*this.mu, ((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu);
                		if(this.isWithNormal){ this.miniCtxN[layer].drawImage(this.ground_n,px*this.mu, py*this.mu, 16*this.mu, 16*this.mu, ((x-(cx*16))*16)*this.mu,((y-(cy*16))*16)*this.mu, 16*this.mu, 16*this.mu); }
                        this.txtNeedUpdate[layer] = 1;
                	}
                	else if(v>240 || v==0){
                		if((v>248 && v<261) || v==0){
                			if(this.houseLists[layer]){
                				i = this.houseLists[layer].length;
		                		while(i--){
		                			ar = this.houseLists[layer][i];
		                			if( ar[0] === x && ar[2] === y ){ 
			                			if( ar[3] !== v ){
			                				this.houseLists[layer][i][3] = v;
				                			this.tempHouseLayers[layer] = 1;
			                			}
			                		}
		                		}
                			}
                		}else{
	                		if(this.buildingLists[layer]){
		                		i = this.buildingLists[layer].length;
		                		while(i--){
		                			ar = this.buildingLists[layer][i];
		                			if( ar[0] === x && ar[2] === y ){ 
		                				if( ar[3] !== v ){
			                				this.buildingLists[layer][i][3] = v;
			                				this.tempBuildingLayers[layer] = 1;
			                			}
		                			}
		                		}
		                	}
		                }
                	}

                	
                	//this.tempBuildingLayers
                	// 240 - 422 residential  -- center empty 244; test 3*3 house 249-260  r1:265  -- r18
                	// 423 - 611 comercial    -- center empty 427; ------------------------c1:436 - c2:445 - c3:454 - c4:463 - c5:472 - c6:481 - c7:490 - c8:499 - c9:508 - c10:      -- c20:607
                	// 612 - 692 industrial   -- center empty 616; ------------------------i1:625 - i2:634 - i3: -- i8:
                	// 9
                }
			}
		}


		
		if(isStart){
			this.updateTerrain(island);
			this.populateTree();
		} else {
			i = this.nlayers;
		    while(i--) if(this.txtNeedUpdate[i] || this.fullRedraw){ this.terrainTxt[i].needsUpdate = true; this.txtNeedUpdate[i] = 0;}

		     i = this.tempHouseLayers.length;
		    while(i--) if(this.tempHouseLayers[i] === 1){ this.rebuildHouseLayer(i); }

		    i = this.tempBuildingLayers.length;
		    while(i--) if(this.tempBuildingLayers[i] === 1){ this.rebuildBuildingLayer(i); }
		}
		if(this.fullRedraw){
			this.fullRedraw = false;
		}

	},

/*this.residences = [244, 265, 274, 283, 292, 301, 310, 319, 328, 337, 346, 355, 364, 373, 382, 391, 400, 409, 418 ];
this.commercials = [427, 436, 445, 454, 463, 475, 481, 490, 499, 508, 517, 526, 535, 544, 553, 562, 571, 580, 589, 598, 607];
this.industrials = [616, 625, 634, 643, 652, 661, 670, 679, 688];*/

	//-------------------- sprite


	moveSprite : function(){

		if(!spriteData) return;
		var i = spriteData.length;
		var pos = new THREE.Vector3();
		var frame = 0;
		var v=0;
		//log(i)
		while(i--){
			var c = spriteData[i];
			frame = c[1];
			v = c[0];
			pos.x =  Math.round((c[2]-8)/16);
			pos.z =  Math.round((c[3]-8)/16);
			pos.y = 0;
			//if( this.isWithHeight ) pos.y = this.heightData[this.findId(pos.x,pos.z)];

            if( this.isWithHeight ) pos.y = this.heightData[ this.findHeightId(pos.x,pos.z) ];
            

			if( c[0] == 2) pos.y += 5;
			if( c[0] == 3){
				if(frame==11)pos.y += 0;
				else if(frame==10)pos.y += 1;
				else if (frame==9)pos.y += 3;
				else pos.y += 6;
			}

			//if(this.spriteMeshs[i] == null) this.addSprite( i, c[0], pos );
			//this.spriteMeshs[i].position.lerp(pos, 0.6);
			//this.spriteMeshs[i].rotation.y = this.rotationSprite(c[0], frame);

			/*if(this.spriteObjs[this.spriteLists[v]] == null) this.spriteObjs[this.spriteLists[v]] = this.addSprite( v, pos );
			this.spriteObjs[this.spriteLists[v]].position.lerp(pos, 0.6);
			this.spriteObjs[this.spriteLists[v]].rotation.y = this.rotationSprite(c[0], frame);*/

			if(this.spriteObjs[this.spriteLists[v]] == null) this.spriteObjs[this.spriteLists[v]] = this.addSprite( v, pos );

			// underwater train
			if(v===1 && frame===5)this.spriteObjs[this.spriteLists[v]].visible = false;
			else this.spriteObjs[this.spriteLists[v]].visible = true;

			this.spriteObjs[this.spriteLists[v]].position.lerp(pos, 0.6);
			this.spriteObjs[this.spriteLists[v]].rotation.y = this.rotationSprite(c[0], frame);
		}
	},

	rotationSprite : function(v, f){
		var r = 0;
		if(v===1){// train
			if(f===1) r = 0;
			else if(f===2) r = 90*this.ToRad;
			else if(f===3) r = 45*this.ToRad;
			else if(f===4) r = -45*this.ToRad;
		}else if(v===2 || v===3){// elico plane
			if(f===1) r = 0;
			else if(f===2) r = -45*this.ToRad;
			else if(f===3) r = -90*this.ToRad;
			else if(f===4) r = -135*this.ToRad;
			else if(f===5) r = -180*this.ToRad;
			else if(f===6) r = -225*this.ToRad;
			else if(f===7) r = -270*this.ToRad;
			else if(f===8) r = -315*this.ToRad;

			else if(f===9) r = -90*this.ToRad;
			else if(f===10) r = -90*this.ToRad;
			else if(f===11) r = -90*this.ToRad;
		}
		return r;
	},

	addSprite : function(v, p){
		var m;
		if(v===1){// train
			m = new THREE.Mesh(this.spriteGeo[0], this.townMaterial );
            //m.scale.set(1, 1, -1 )
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		    //this.spriteObjs[this.spriteLists[v]] = m;
		}else if(v===2){// elico
			m = new THREE.Mesh(this.spriteGeo[1], this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		}else if(v===3){// plane
			m = new THREE.Mesh(this.spriteGeo[2], this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		} else {
			m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		}
		return m;

		//this.spriteObjs[this.spriteLists[v]] = m;
	},






	//-----------------------power zone


	showPower : function(){

		if(!powerData) return;
		var i = powerData.length, pos;

		/*var j = this.powerMeshs.length;
		while(j--){
			if( !powerData[j] ) this.removePowerMesh(j);
		}*/

		while(i--){
			/*if(this.powerMeshs[i] == null) this.addPowerMesh(i, this.findPosition(powerData[i]));
			else{
				pos = this.findPosition(powerData[i]);
			    this.powerMeshs[i].position.set(pos[0], 1, pos[1]);
			}*/



			if(powerData[i]==2){ if(this.powerMeshs[i] == null) this.addPowerMesh(i, this.findPosition(i)); }
			else if(powerData[i]==1){ if(this.powerMeshs[i] !== null) this.removePowerMesh(i); }
		}
	},

	addPowerMesh : function(i, ar){
		//var m = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), this.powerMaterial );
		var py = 0;
		//if( this.isWithHeight ) py = this.heightData[this.findId(ar[0],ar[1])];

        if( this.isWithHeight ) py = this.heightData[ this.findHeightId(ar[0],ar[1])];

		var m = new THREE.Sprite( this.powerMaterial );
		//m.scale.set( 2, 2, 1 );
		m.position.set(ar[0], py+1, ar[1]);
		this.scene.add(m);
		this.powerMeshs[i] = m;
	},

	removePowerMesh : function(i){
		this.scene.remove(this.powerMeshs[i]);
		this.powerMeshs[i] = null;
	},

	powerTexture : function() {

	    var c = document.createElement("canvas");
	    var ctx = c.getContext("2d");
	    c.width = c.height = 64;
	    var grd = ctx.createLinearGradient(0,0,64,64);
		grd.addColorStop(0.3,"yellow");
		grd.addColorStop(1,"red");
		ctx.beginPath();
		ctx.moveTo(44,0);
		ctx.lineTo(10,34);
		ctx.lineTo(34,34);
		ctx.lineTo(20,64);
		ctx.lineTo(54,30);
		ctx.lineTo(30,30);
		ctx.lineTo(44,0);
		ctx.closePath();
		ctx.strokeStyle="red";
		ctx.stroke();
		ctx.fillStyle = grd;
		ctx.fill();
	    var texture = new THREE.Texture(c);
	    texture.needsUpdate = true;
	    return texture;

	},


	// -----------------------


	gradTexture : function(color) {
	    var c = document.createElement("canvas");
	    var ctx = c.getContext("2d");
	    c.width = 16; c.height = 256;
	    var gradient = ctx.createLinearGradient(0,0,0,256);
	    var i = color[0].length;
	    while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
	    ctx.fillStyle = gradient;
	    ctx.fillRect(0,0,16,256);
	    //this.tint(c);
	    //var texture = new THREE.Texture(c);
	    //texture.needsUpdate = true;
	    return c;
	},

	tint : function(canvas, image, supImage) {
		var data, i, n;
		var pixels = canvas.width*canvas.height;
	    var ctx = canvas.getContext('2d');
	    
	    // draw windows
	    var topData = null;
	    var newImg = null;
	    if(supImage && this.dayTime!==0 && this.dayTime!==1){
	    	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	        ctx.drawImage(supImage, 0, 0);
	        topData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	        data = topData.data;
	        i = pixels;
	        while(i--){
	        	n = i<<2;
	        	if(data[n+3] !== 0){
	        		if(data[n+0]==0 && data[n+1]==0 && data[n+2]==0){// black
	        		    data[n+3]=60;
	        		}
	        		if(data[n+1]==0){
	        		//if(data[n+0]==255 && data[n+1]==0 && data[n+2]==0){// red
	        			if(this.dayTime==3) data[n+1]=255;
	        			if(this.dayTime==2) {data[n+0]=0; data[n+3]=60;}
	        		}

	        	}
	        }
	        ctx.putImageData(topData, 0, 0);
	        newImg = document.createElement('img');
	        newImg.src = canvas.toDataURL("image/png");
	    }

	    if(image){
	    	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	        ctx.drawImage(image, 0, 0);
	    } else {
	    	ctx.drawImage(this.skyCanvasBasic, 0, 0);
	    }

	    if(this.dayTime!==0){
		    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		    data = imageData.data;
		    i = pixels;
		    var c = this.tcolor;
		    while(i--){
		    	n = i<<2;//i*4;
		    	data[n+0] = data[n+0] * (1-c.a) + (c.r*c.a);
			    data[n+1] = data[n+1] * (1-c.a) + (c.g*c.a);
			    data[n+2] = data[n+2] * (1-c.a) + (c.b*c.a);
		    }
		    ctx.putImageData(imageData, 0, 0);
		    if(newImg){
		    	ctx.drawImage(newImg, 0, 0);
		    }
		}
	},

	// key

	updateKey:function(){
		var f = 0.3;
		var d = false;

		if(this.key[0] == 1 || this.key[1] == 1 ){ 
			if(this.key[0] == 1)this.ease.z = -f; 
			if(this.key[1] == 1)this.ease.z = f;
			d = true;
		}
		else this.ease.z = 0;

		if(this.key[2] == 1 || this.key[3] == 1 ){ 
			if(this.key[2] == 1)this.ease.x = -f; 
			if(this.key[3] == 1)this.ease.x = f;
			d = true;
		}
		else this.ease.x = 0;
		if(d)this.dragCenterposition();
	},

	bindKeys:function(){
		var _this = this;
		document.onkeydown = function(e) {
		    e = e || window.event;
			switch ( e.keyCode ) {
			    case 38: case 87: case 90: _this.key[0] = 1; break; // up, W, Z
				case 40: case 83:          _this.key[1] = 1; break; // down, S
				case 37: case 65: case 81: _this.key[2] = 1; break; // left, A, Q
				case 39: case 68:          _this.key[3] = 1; break; // right, D
				//case 17: case 67:          _this.key[4] = 1; break; // ctrl, C
				//case 69:                   _this.key[5] = 1; break; // E
				//case 32:                   _this.key[6] = 1; break; // space
			}
		}
		document.onkeyup = function(e) {
		    e = e || window.event;
			switch( e.keyCode ) {
				case 38: case 87: case 90: _this.key[0] = 0; break; // up, W, Z
				case 40: case 83:          _this.key[1] = 0; break; // down, S
				case 37: case 65: case 81: _this.key[2] = 0; break; // left, A, Q
				case 39: case 68:          _this.key[3] = 0; break; // right, D
				//case 17: case 67:          _this.key[4] = 0; break; // ctrl, C
				//case 69:                   _this.key[5] = 0; break; // E
				//case 32:                   _this.key[6] = 0; break; // space
			}
		}
	    self.focus();
	}


}

//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//

var HUB = { REVISION: '1' };

HUB.round = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="27" stroke="rgb(255,255,255)" stroke-width="1" stroke-opacity="0.0" fill="rgb(0,0,0)" fill-opacity="0.1"/>',
'</svg>'
].join("\n");

HUB.roundSelected = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="27" stroke="rgb(255,255,255)" stroke-width="2" stroke-opacity="0.5" fill="rgb(0,0,0)" fill-opacity="0.3"/>',
'</svg>'
].join("\n");

HUB.roundSelect = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="30" stroke="rgb(255,255,255)" stroke-width="4" stroke-opacity="1" fill="rgb(0,0,0)" fill-opacity="0.5"/>',
'</svg>'
].join("\n");


HUB.Base = function(){
	this.hub = document.getElementById('hub');
	this.full = null;
	this.title = null;

    this.isIntro = true;

	this.timer = null;
	this.bg = 1;

    this.R=null;
    this.C=null;
    this.I=null;

    //this.rrr= null;

    //this.colors = ['#ffffff', '#338099'];
    this.colors = ['rgba(255,255,255,1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)', 'rgba(255,255,255,0.5)'];

    //this.radius = "-moz-border-radius: 20px; -webkit-border-radius: 20px; border-radius: 20px;";
    this.radius = "-moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px;";
    this.radiusL = "-moz-border-top-left-radius: 6px; -webkit-border-top-left-radius: 6px; border-top-left-radius: 6px;";
    this.radiusL += "-moz-border-bottom-left-radius: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px;";
    this.radiusR = "-moz-border-top-right-radius: 6px; -webkit-border-top-right-radius: 6px; border-top-right-radius: 6px;";
    this.radiusR += "-moz-border-bottom-right-radius: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px;";

    this.radiusB = "-moz-border-bottom-left-radius: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px;";
    this.radiusB += "-moz-border-bottom-right-radius: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px;";

    this.windowsStyle = ' top:40px; left:10px; border:1px solid '+this.colors[1]+'; background:'+this.colors[3]+';';


    this.budgetWindow = null;
    this.evaluationWindow  = null;
    this.disasterWindow = null;
    this.exitWindow = null;
    this.queryWindow = null;
    this.overlaysWindow = null;
    this.aboutWindow = null;


    this.selector = null;
    this.select = null;

    this.currentToolName = 0;

    this.disasterTypes = ['None', 'Monster', 'Fire', 'Flood', 'Crash', 'Meltdown', 'Tornado'];
    this.disasterButtons = [];

    this.overlaysTypes = ['None', 'Density', 'Growth', 'Land value', 'Crime Rate', 'Pollution', 'Traffic', 'Power Grid', 'Fire', 'Police'];
    this.overlaysButtons =  [];


    

    this.intro();
}

HUB.Base.prototype = {
    constructor: HUB.Base,
    init:function() {
    },
    intro:function(){

    	this.full = document.createElement('div'); 
    	this.full.style.cssText ='position:absolute; top:0px; left:0px; width:100%; height:100%; pointer-events:none; display:block; background:rgba(102,102,230,1); ' //+ this.degrade();

        this.fullMid = document.createElement('div'); 
        this.fullMid.style.cssText ='position:absolute; top:10px; left:50%; width:300px; height:300px; margin-left:-150px; pointer-events:none; display:block;';

        this.title = document.createElement('div');
        this.title.innerHTML = "3D.CITY";
    	this.title.style.cssText = 'position:absolute; font-size:44px; top:50%; left:0; margin-top:-30px; width:300px; height:60px; pointer-events:none; text-align:center;';
        
        this.subtitle = document.createElement('div');
        this.subtitle.style.cssText = 'position:absolute; font-size:14px; top:50%; left:0; margin-top:20px; width:300px; height:80px; pointer-events:none; text-align:center;';
        this.subtitle.innerHTML = "Generating world...";

        this.logo = document.getElementById('logo');
        this.logo.style.display = 'block';

        this.full.appendChild( this.fullMid );

        this.fullMid.appendChild( this.logo );
    	this.fullMid.appendChild( this.title );
        this.fullMid.appendChild( this.subtitle );

    	this.hub.appendChild( this.full );

    },
    start:function(){
    	if(this.isIntro){
    		this.timer = setInterval(this.fadding, 100, this);
    	}
    },
    fadding:function(t){
    	t.bg -= 0.1;
    	t.full.style.background = 'rgba(102,102,230,'+t.bg+')';
       // background-image:linear-gradient(60deg, white, black);
    	if(t.bg<=0){
    		clearInterval(t.timer);
            t.full.removeChild(t.fullMid);
    		t.fullMid.removeChild(t.logo);
            t.fullMid.removeChild(t.title);
            t.fullMid.removeChild(t.subtitle);
    		t.hub.removeChild(t.full);
    		t.initStartHub();
            t.isIntro = false;
    		//t.full = null;
    	}
    },
    /*degrade : function(){
        var a = -160;
        var p = [0, 30, 100]
        var c0 = '#BFDDFF';
        var c1 = '#3C89CD';
        var c2 = '#214F77';
        var deg = [
            'background:-webkit-gradient(linear, top, bottom, color-stop('+p[0]+'%,'+c0+'),  color-stop('+p[1]+'%,'+c1+'), color-stop('+p[2]+'%,'+c2+'));',
            'background:-moz-linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);',
            'background:-webkit-linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);',
            'background:-o-linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);',
            'background:linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);'
        ].join("\n");
        return deg;
    },*/

    //--------------------------------------start hub

    initStartHub : function(){
        this.full = document.createElement('div');
        this.full.style.cssText ='position:absolute; top:10px; left:50%; margin-left:-150px; width:300px; height:300px; pointer-events:none;';
        this.full.id = 'fullStart';

        this.hub.appendChild( this.full );
        var b1 = this.addButton(this.full, 'Play Game', [276,48,40], 'position:absolute; top:10px; left:0px;');
    	var b2 = this.addButton(this.full, 'New Map',  [120, 26, 22], 'position:absolute; top:150px; left:0px;');
        var b3 = this.addButton(this.full, 'Height Map',  [120, 26, 22], 'position:absolute; top:150px; right:0px;');
        var b4 = this.addButton(this.full, 'Load Map',  [276, 26, 22], 'position:absolute; top:90px; left:0px;');
        this.addSelector("DIFFICULTY", ['LOW', 'MEDIUM', 'HARD'], setDifficulty, 0);

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); playMap(); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); newMap(); }, false);
        b3.addEventListener('click',  function ( e ) { e.preventDefault(); newHeightMap(); }, false);
        b4.addEventListener('click',  function ( e ) { e.preventDefault(); loadGame(true); }, false);
    },

    //--------------------------------------game hub

    initGameHub : function(){
        var _this = this;
        this.removeSelector("DIFFICULTY");
        this.clearElement('fullStart');

        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText ='position:absolute; margin:0px; padding:0px; top:60px; right:12px; width:198px; height:456px; pointer-events:none;';
        this.hub.appendChild( this.toolSet );
        this.toolInfo = document.createElement('div');
        this.toolInfo.style.cssText ='position:absolute; top:15px; right:12px; width:198px; height:50px; pointer-events:none; font-size:16px;';
        this.hub.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = "Selecte<br>Tool";

        var b;
        for(var i = 0; i<18; i++){
            b = this.addSVGButton(this.toolSet);
            b.name = i+1;
        }

        this.selector = document.createElement('div');
        this.selector.style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none;"
        this.selector.innerHTML = HUB.roundSelected;
        this.toolSet.appendChild( this.selector );

        this.select = document.createElement('div');
        this.select.style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none;"
        this.select.innerHTML = HUB.roundSelect;
        this.toolSet.appendChild( this.select );

        var img = document.createElement("img");
        img.src = "img/interface.png";
        this.toolSet.appendChild(img);
        img.style.cssText ='position:absolute; margin:0px; padding:0px; top:0px; right:0px; width:198px; height:396px; pointer-events:none;';

        this.addSelector("Speed", ['II', '>', '>>', '>>>', '>>>'], setSpeed, 2, [20,20,20,20,20]);

        var b1 = this.addButton(this.hub, 'Budget', [75,16,14], 'position:absolute; left:10px; top:-7px; font-weight:bold;', true);
        b1.addEventListener('click',  function ( e ) { e.preventDefault(); getBudjet(); }, false);

        var b2 = this.addButton(this.hub, 'Eval', [75,16,14], 'position:absolute; left:110px; top:-7px; font-weight:bold;', true);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); getEval(); }, false);

        /*var b3 = this.addButton(this.hub, 'Disaster', [75,16,14], 'position:absolute; left:210px; top:-7px; font-weight:bold;', true);
        b3.addEventListener('click',  function ( e ) { e.preventDefault();  _this.openDisaster(); }, false);*/

        var b4 = this.addButton(this.hub, 'Exit', [75,16,14], 'position:absolute; left:310px; top:-7px; font-weight:bold;', true);
        b4.addEventListener('click',  function ( e ) { e.preventDefault();  _this.openExit();  }, false);

        var b5 = this.addButton(this.hub, 'About', [75,16,14], 'position:absolute; left:410px; top:-7px; font-weight:bold;', true);
        b5.addEventListener('click',  function ( e ) { e.preventDefault();  _this.openAbout();  }, false);


        this.H = [];
        

        this.roo = document.createElement('div');
        this.roo.style.cssText = "position:absolute; bottom:11px; left:10px; width:60px; height:60px; pointer-events:none; transform:rotate(45deg); ";
        this.roo.style.cssText += "-moz-border-radius: 30px; -webkit-border-radius: 30px; border-radius: 30px; overflow:hidden; ";
        this.hub.appendChild( this.roo );

        var dd;
        for(i = 0; i<4; i++){
            dd = document.createElement('div');
            if(i==0)dd.style.cssText = "position:absolute; top:0px; left:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer; background:#ffffff;";
            if(i==1)dd.style.cssText = "position:absolute; top:0px; right:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer;";
            if(i==2)dd.style.cssText = "position:absolute; bottom:0px; right:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer;";
            if(i==3)dd.style.cssText = "position:absolute; bottom:0px; left:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer;";
            dd.name = i;
            this.roo.appendChild( dd );
            dd.addEventListener('click',  function ( e ) { 
                e.preventDefault();
                _this.hideoldSel();
                _this.H[this.name].style.background = '#ffffff';
                setTimeColors(this.name);
                 }, false);
            this.H[i]=dd;
        }


        var winter = document.createElement("div");
        winter.style.cssText = "position:absolute; bottom:80px; left:25px; width:30px; height:30px; pointer-events:auto; cursor:pointer; background:rgba(0,0,0,0); ";
        winter.style.cssText += "-moz-border-radius: 30px; -webkit-border-radius: 30px; border-radius: 30px; ";
        this.hub.appendChild(winter);

        winter.addEventListener('click',  function ( e ) { 
            view3d.winterSwitch();
            if(view3d.isWinter) this.style.background = 'rgba(255,255,255,0.5);';
            else  this.style.background = 'rgba(0,0,0,0);';
        }, false);

        var img2 = document.createElement("img");
        img2.src = "img/basemenu.png";
        this.hub.appendChild(img2);
        img2.style.cssText ='position:absolute; margin:0px; padding:0px; bottom:0px; left:0px; width:630px; height:120px; pointer-events:none;';

        this.initCITYinfo();
    },
    hideoldSel : function(){
        for(var i = 0; i<4; i++){
            this.H[i].style.background = 'none';
        }
    },

    //-----------------------------------CITY INFO

    initCITYinfo : function(){

        this.date = document.createElement('div');
        this.date.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:65px; text-align:right; font-weight:bold;';

        this.money = document.createElement('div');
        this.money.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:295px; text-align:right; font-weight:bold;';

        this.population = document.createElement('div');
        this.population.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:180px; text-align:right; font-weight:bold;';

        this.score = document.createElement('div');
        this.score.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:410px; text-align:right; font-weight:bold;';

        this.msg = document.createElement('div');
        this.msg.style.cssText = 'font-size:14px; letter-spacing:0.02em; position:absolute; width:420px; height:20px; bottom:44px; left:76px; text-align:left; color:'+this.colors[4]+'; font-weight:bold;';

        this.hub.appendChild( this.date );
        this.hub.appendChild( this.money );
        this.hub.appendChild( this.population );
        this.hub.appendChild( this.score );
        this.hub.appendChild( this.msg );

        this.initRCI();
    },

    updateCITYinfo : function(infos){
        this.date.innerHTML = infos[0];
        this.money.innerHTML = infos[4];
        this.population.innerHTML = infos[3];
        this.score.innerHTML =  infos[2];

        this.msg.innerHTML = infos[8];

        this.updateRCI( infos[5], infos[6], infos[7] );
    },

    //-----------------------------------QUERY

    //-----------------------------------ALL WINDOW

    testOpen : function(){
        var t = "";
        if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget();
            t = 'budget';
        }
        if(this.evaluationWindow !== null && this.evaluationWindow.className == "open"){
            this.closeEval();
            t = 'evaluation';
        }
        if(this.disasterWindow !== null && this.disasterWindow.className == "open"){
            this.closeDisaster();
            t = 'disaster';
        }
        if(this.exitWindow !== null && this.exitWindow.className == "open"){
            this.closeExit();
            t = 'exit';
        }
        if(this.queryWindow !== null && this.queryWindow.className == "open"){
            this.closeQuery();
            t = 'query';
        }
        if(this.overlaysWindow !== null && this.overlaysWindow.className == "open"){
            this.closeOverlays();
            t = 'overlays';
        }
        if(this.aboutWindow !== null && this.aboutWindow.className == "open"){
            this.closeAbout();
            t = 'about';
        }

        return t;

    },

    //-----------------------------------ABOUT WINDOW

    openAbout : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'about') return;

        if(this.aboutWindow == null){
            this.aboutWindow = document.createElement('div');
            this.aboutWindow.style.cssText = this.radius+ 'position:absolute; width:200px; height:210px; pointer-events:none; display:block;'+ this.windowsStyle;
            this.hub.appendChild( this.aboutWindow );
            var bg1 = this.addButton(this.aboutWindow, 'X', [16,16,14], 'position:absolute; left:10px; top:10px;');
            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeAbout(); }, false);

            this.fps = document.createElement('div');
            this.fps.style.cssText ='position:absolute; top:20px; left:60px; width:120px; height:20px; pointer-events:none; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.aboutWindow.appendChild( this.fps );
            this.abb = document.createElement('div');
            this.abb.style.cssText ='position:absolute; top:60px; left:10px; width:180px; height:180px; pointer-events:none; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.aboutWindow.appendChild( this.abb );
            this.linke = document.createElement('div');
            this.linke.style.cssText ='position:absolute; top:160px; left:10px; width:180px; height:20px; pointer-events:auto; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.aboutWindow.appendChild( this.linke );

            this.abb.innerHTML = "3D CITY<br><br>All 3d side made by Lo.th<br>Simulation from MicropolisJS<br><br><br>More info and source<br>";
            this.linke.innerHTML = "<a href='https://github.com/lo-th/3d.city' target='_blank'>https://github.com/lo-th/3d.city";



        } else {
            this.aboutWindow.style.display = 'block';
        }

        displayStats();

        this.aboutWindow.className = "open";

    },

    upStats : function(fps, memory){
        this.fps.innerHTML = 'Fps: '+ fps + ' <br> geometry: ' + memory;
    },

    closeAbout :function(){
        hideStats();

        this.aboutWindow.style.display = 'none';
        this.aboutWindow.className = "close";
    },


    //-----------------------------------OVERLAYS WINDOW

    openOverlays : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'overlays') return;

        if(this.overlaysWindow == null){
            this.overlaysWindow = document.createElement('div');
            this.overlaysWindow.style.cssText = this.radius+ 'position:absolute; width:140px; height:420px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.overlaysWindow );

            //var bg1 = this.addButton(this.overlaysWindow, 'X', [16,16,14], 'position:absolute; left:50px; top:10px;');
            //bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeQuery(); }, false);

            for(var i=0; i<this.overlaysTypes.length; i++){
                this.overlaysButtons[i] = this.addButton(this.overlaysWindow, this.overlaysTypes[i].toUpperCase(), [96,16,14],'position:absolute; left:10px; top:'+(10+(i*40))+'px;');
                this.overlaysButtons[i].name = this.overlaysTypes[i];
                this.overlaysButtons[i].addEventListener('click',  function(e){ e.preventDefault(); setOverlays(this.name); }, false);
            }
        } else {
            this.overlaysWindow.style.display = 'block';
        }
        this.overlaysWindow.className = "open";
    },
    closeOverlays :function(){
        this.overlaysWindow.style.display = 'none';
        this.overlaysWindow.className = "close";
    },

    //-----------------------------------QUERY WINDOW

    openQuery : function(data){
        var _this = this;

        //var test = this.testOpen();
        //if(test == 'query') return;

        if(this.queryWindow == null){
            this.queryWindow = document.createElement('div');
            this.queryWindow.style.cssText =this.radius+ 'position:absolute; width:140px; height:180px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.queryWindow );

            var bg1 = this.addButton(this.queryWindow, 'X', [16,16,14], 'position:absolute; left:50px; top:10px;');
            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeQuery(); }, false);

            this.queryResult = document.createElement('div');
            this.queryResult.style.cssText ='position:absolute; top:60px; left:10px; width:110px; height:100px; pointer-events:none; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.queryWindow.appendChild( this.queryResult );
        } else {
            this.queryWindow.style.display = 'block';
        }

        this.queryResult.innerHTML = data;
        this.queryWindow.className = "open";
    },
    closeQuery :function(){
        this.queryWindow.style.display = 'none';
        this.queryWindow.className = "close";
    },

    //-----------------------------------BUDGET WINDOW

    openEval : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'evaluation') return;

        if(this.evaluationWindow == null){
            this.evaluationWindow = document.createElement('div');
            this.evaluationWindow.style.cssText =this.radius+ 'position:absolute; width:200px; height:300px; pointer-events:none; display:block;'+ this.windowsStyle;
            this.hub.appendChild( this.evaluationWindow );

            this.evaltOpinion = document.createElement('div');
            this.evaltOpinion.style.cssText ='position:absolute; top:10px; left:10px; width:180px; height:100px; pointer-events:none; color:'+this.colors[0]+';';
            this.evaluationWindow.appendChild( this.evaltOpinion );

            this.evaltYes = document.createElement('div');
            this.evaltYes.style.cssText ='position:absolute; top:46px; left:26px; width:60px; height:20px; pointer-events:none; color:#33FF33; font-size:16px; font-weight:bold;';
            this.evaluationWindow.appendChild( this.evaltYes );

            this.evaltNo = document.createElement('div');
            this.evaltNo.style.cssText ='position:absolute; top:46px; right:26px; width:60px; height:20px; pointer-events:none; color:#FF3300;  font-size:16px; font-weight:bold;';
            this.evaluationWindow.appendChild( this.evaltNo );

            this.evaltProb = document.createElement('div');
            this.evaltProb.style.cssText ='position:absolute; top:100px; left:10px; width:180px; height:60px; pointer-events:none; color:'+this.colors[0]+'; font-size:16px; ';
            this.evaluationWindow.appendChild( this.evaltProb );

            this.evaltOpinion.innerHTML = "<b>Public opinion</b><br>Is the mayor doing a good job ?<br> <br> <br> <br>What are the worst problems ?<br>"

        } else {
            this.evaluationWindow.style.display = 'block';
        }

        this.evaltYes.innerHTML = 'YES:' + data[0] + '%';
        this.evaltNo.innerHTML = 'NO:' +(100-data[0] )+ '%';

        this.evaltProb.innerHTML = data[1];

        this.evaluationWindow.className = "open";
    },

    closeEval :function(){
        this.evaluationWindow.style.display = 'none';
        this.evaluationWindow.className = "close";
    },

    //-----------------------------------EXIT WINDOW

    openExit : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'exit') return;

        if(this.exitWindow == null){
            this.exitWindow = document.createElement('div');
            this.exitWindow.style.cssText =this.radius+ 'position:absolute; width:140px; height:180px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.exitWindow );

            var bg1 = this.addButton(this.exitWindow, 'X', [16,16,14], 'position:absolute; left:50px; top:10px;');
            var bg2 = this.addButton(this.exitWindow, 'NEW MAP', [96,16,14], 'position:absolute; left:10px; top:50px;');
            var bg3 = this.addButton(this.exitWindow, 'SAVE', [96,16,14], 'position:absolute; left:10px; top:90px;');
            var bg4 = this.addButton(this.exitWindow, 'LOAD', [96,16,14], 'position:absolute; left:10px; top:130px;');

            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeExit(); }, false);
            bg2.addEventListener('click',  function(e){ e.preventDefault(); newGameMap(); }, false);
            bg3.addEventListener('click',  function(e){ e.preventDefault(); saveGame(); }, false);
            bg4.addEventListener('click',  function(e){ e.preventDefault(); loadGame(); }, false);

            /*var x = document.createElement("INPUT");
            x.setAttribute("id", "fileToLoad");
            x.setAttribute("type", "file");
            x.style.cssText = "pointer-events:auto; opacity:0; position:absolute; left:10px; top:130px; width:120px; height:40px; overflow:hidden;";
            */
           // x.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); bg4.style.border = '4px solid '+_this.colors[0];  bg4.style.backgroundColor = _this.colors[0]; bg4.style.color = _this.colors[1]; }, false );

           // x.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); bg4.style.border = '4px solid '+_this.colors[1]; bg4.style.backgroundColor = _this.colors[1]; bg4.style.color = _this.colors[0];  }, false );

           // x.addEventListener( 'mouseover', function ( e ) { e.preventDefault();  bg4.style.backgroundColor = _this.colors[2]; }, false );
           // x.addEventListener( 'mouseout', function ( e ) { e.preventDefault();  bg4.style.backgroundColor = _this.colors[1];  }, false );

            //x.addEventListener('change', loadGame, false);


            //"fileToLoad"
            //this.exitWindow.appendChild( x );

        } else {
            this.exitWindow.style.display = 'block';
            //this.setBudgetValue();
        }

        this.exitWindow.className = "open";
    },
    closeExit :function(){
        this.exitWindow.style.display = 'none';
        this.exitWindow.className = "close";
    },


    //-----------------------------------BUDGET WINDOW

    openBudget : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'budget') return;

        /*if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget(); 
            return;
        }*/

        this.dataKeys = ['roadFund', 'roadRate', 'fireFund', 'fireRate','policeFund', 'policeRate', 'taxRate', 'totalFunds', 'taxesCollected'];

        var i = this.dataKeys.length;

        var elem;
        while(i--){
            this[this.dataKeys[i]] = data[this.dataKeys[i]];
        }

        var previousFunds = data.totalFunds;
        var taxesCollected = data.taxesCollected;
        var cashFlow = taxesCollected - this.roadFund - this.fireFund - this.policeFund;
        var currentFunds = previousFunds + cashFlow;

        if(this.budgetWindow == null){
            this.budgetWindow = document.createElement('div');
            this.budgetWindow.style.cssText =this.radius+ 'position:absolute; width:200px; height:300px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.budgetWindow );

            this.addSlider(this.budgetWindow, 10, 'Tax', this.taxRate, null, 'green', 20);
            this.addSlider(this.budgetWindow, 70, 'Roads', this.roadRate, this.roadFund, 'red', 100);
            this.addSlider(this.budgetWindow, 110, 'Fire', this.fireRate, this.fireFund, 'red', 100);
            this.addSlider(this.budgetWindow, 150, 'Police', this.policeRate, this.policeFund, 'red', 100);

            this.budgetResult = document.createElement('div');
            this.budgetResult.style.cssText ='position:absolute; top:200px; left:10px; width:180px; height:300px; pointer-events:none; color:'+this.colors[0]+';';
            
            this.budgetWindow.appendChild( this.budgetResult );

            var bg1 = this.addButton(this.budgetWindow, 'CLOSE', [70,16,14], 'position:absolute; left:10px; bottom:10px;');
            var bg2 = this.addButton(this.budgetWindow, 'APPLY', [70,16,14], 'position:absolute; rigth:10px; bottom:10px;');

            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeBudget(); }, false);
            bg2.addEventListener('click',  function(e){ e.preventDefault(); _this.applyBudget(); }, false);

        } else {
            this.budgetWindow.style.display = 'block';
            this.setBudgetValue();
        }

        this.budgetResult.innerHTML = "Annual receipts:" + cashFlow+"$"+"<br>Taxes collected:" + taxesCollected+"$";

        this.budgetWindow.className = "open";

    },

    applyBudget :function(){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";

        setBudjet([this.taxRate, this.roadRate, this.fireRate, this.policeRate ]);
    },

    closeBudget :function(){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";
    },

    setBudgetValue:function(){
        this.setSliderValue('Tax', this.taxRate, 20, null);
        this.setSliderValue('Roads', this.roadRate, 100, this.roadFund);
        this.setSliderValue('Fire', this.fireRate, 100, this.fireFund);
        this.setSliderValue('Police', this.policeRate, 100, this.policeFund);
    },

    //-----------------------------------DISASTER WINDOW

    openDisaster : function(){
        var _this = this;
        var test = this.testOpen();
        if(test == 'disaster') return;
        if(this.disasterWindow == null){
            this.disasterWindow = document.createElement('div');
            this.disasterWindow.style.cssText =this.radius+ 'position:absolute; width:140px; height:300px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.disasterWindow );

            for(var i=0; i<this.disasterTypes.length; i++){
                this.disasterButtons[i] = this.addButton(this.disasterWindow, this.disasterTypes[i].toUpperCase(), [96,16,14],'position:absolute; left:10px; top:'+(10+(i*40))+'px;');
                this.disasterButtons[i].name = this.disasterTypes[i];
                this.disasterButtons[i].addEventListener('click',  function(e){ e.preventDefault(); setDisaster(this.name); }, false);
            }
        } else {
            this.disasterWindow.style.display = 'block';
            //this.setBudgetValue();
        }

        this.disasterWindow.className = "open";

    },
    closeDisaster : function(){
        this.disasterWindow.style.display = 'none';
        this.disasterWindow.className = "close";
    },

    //-----------------------------------SLIDER

    addSlider : function(target, py, name, value, v2, color, max){
        var _this = this;
        var txt = document.createElement( 'div' );
        var bg = document.createElement( 'div' );
        var sel = document.createElement( 'div' );
        txt.style.cssText ='position:absolute; left:10px; top:-18px; pointer-events:none; width:180px; height:20px; font-size:12px; color:'+this.colors[0]+';';
        bg.style.cssText =this.radius+'position:absolute; left:10px; top:'+(py+20)+'px; padding:0; cursor:w-resize; pointer-events:auto; width:180px; height:20px; background-color:'+ _this.colors[1]+';';
        sel.style.cssText =this.radius+'position:absolute; pointer-events:none; margin:5px; width:100px; height:10px; background-color:'+color+';';
        target.appendChild( bg );
        bg.appendChild( sel );
        bg.appendChild( txt );
        bg.name = name;
        bg.id = name;

        if(v2!==null){
            txt.innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            txt.innerHTML = name+" "+value+'%';
        }

        sel.style.width = 170*(value/max)+'px';
        bg.className = "up";

        bg.addEventListener( 'mouseout', function(e){ e.preventDefault();this.className = "up"; this.style.backgroundColor = _this.colors[1]; }, false );
        bg.addEventListener( 'mouseover', function(e){ e.preventDefault(); this.style.backgroundColor = _this.colors[2]; }, false );
        bg.addEventListener( 'mouseup', function(e){ e.preventDefault(); this.className = "up"; }, false );
        bg.addEventListener( 'mousedown', function(e){ e.preventDefault(); this.className = "down"; _this.dragSlider(this, e.clientX, max); }, false );
        bg.addEventListener( 'mousemove', function(e){ e.preventDefault(); _this.dragSlider(this, e.clientX, max); } , false );
    },

    setSliderValue:function(name, value, max, v2){
        var slide = document.getElementById(name);
        var children = slide.childNodes;
        children[0].style.width = 170*(value/max)+'px';
        if(v2!==null){
            children[1].innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            children[1].innerHTML = name+" "+value+'%';
        }
    },

    dragSlider : function(t, x, max){
        if(t.className == "down"){
            var children = t.childNodes;
            var rect = t.getBoundingClientRect();
            var value = Math.round(((x-rect.left)/170)*max);
            if(value<0) value = 0;
            if(value>max) value = max;
            children[0].style.width = 170*(value/max)+'px';

            switch(t.name){
                case 'Tax': children[1].innerHTML = t.name+" "+value+'%'; this.taxRate = value; break;
                case 'Roads': children[1].innerHTML = t.name+" "+value+'% of '+this.roadFund+"$ = " + Math.floor(this.roadFund * (value / 100))+"$"; this.roadRate = value; break;
                case 'Fire': children[1].innerHTML = t.name+" "+value+'% of '+this.fireFund+"$ = " + Math.floor(this.fireFund * (value / 100))+"$"; this.fireRate = value; break;
                case 'Police': children[1].innerHTML = t.name+" "+value+'% of '+this.policeFund+"$ = " + Math.floor(this.policeFund * (value / 100))+"$"; this.policeRate = value; break;
            }
        }
    },


    //-----------------------------------RCI

    initRCI : function(){
        var cont = document.createElement('div');
        cont.id = 'RCI';
        cont.style.cssText = 'font-size:10px; position:absolute; width:70px; height:70px; bottom:20px; right:20px;';

        var txt = document.createElement('div');
        txt.style.cssText = 'font-size:10px; position:absolute; width:46px; height:14px; bottom:28px; left:10px; background:#cccccc; padding:0px 2px;  letter-spacing:12px; text-align:center; color:#000000;';
        txt.innerHTML = "RCI";

        this.R = document.createElement('div');
        this.R.id = 'R';
        this.R.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:10px; background:#30ff30;';
        cont.appendChild( this.R );

        this.C = document.createElement('div');
        this.C.id = 'C';
        this.C.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:30px; background:#3030ff;';
        cont.appendChild( this.C );

        this.I = document.createElement('div');
        this.I.id = 'I';
        this.I.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:50px; background:#ffff30;';
        cont.appendChild( this.I );

        cont.appendChild( txt );
        this.hub.appendChild( cont );
    },

    updateRCI : function(r,c,i){
        this.R.style.height = r/100+'px'; 
        this.C.style.height = c/100+'px';
        this.I.style.height = i/100+'px';
        //console.log(r/100)
        if(r>0){ this.R.style.bottom ='42px';}
        else { this.R.style.bottom =28+(r/100)+'px';}

        if(c>0){ this.C.style.bottom ='42px';}
        else { this.C.style.bottom =28+(c/100)+'px'; }

        if(i>0){ this.I.style.bottom ='42px';;}
        else { this.I.style.bottom =28+(i/100)+'px'; }
    },

    //---------------------------------- SELECTOR 

    addSelector : function( type, names, fun, current, size){
        var _this = this;
        var cont = document.createElement('div');
        //cont.style.cssText = 'position:absolute; width:300px; height:50px; font-size:16px; top:0; left:webkit-clac(50% -150px);';
        cont.style.cssText = 'font-size:14px; margin-top:10px; color:'+this.colors[0]+';';
        if(type=='Speed') cont.style.cssText = 'font-size:20px; position:absolute; bottom:8px; left:497px; ';
        else cont.innerHTML = type+"<br>";
        cont.id = type;
        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );
           // t[i].style.cssText = 'font-size:14px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+';'
           // t[i].style.cssText +=' width:70px; height:16px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
            t[i].style.cssText = 'font-size:14px; border:1px solid '+this.colors[5]+'; background:'+this.colors[1]+'; color:'+this.colors[0]+';';
            if(type=='Speed')t[i].style.cssText +=' width:70px; height:16px; margin-left:2px; padding:6px; pointer-events:auto;  cursor:pointer; display:inline-block; ';
            else t[i].style.cssText +=' width:70px; height:16px; margin:2px; padding:7px; pointer-events:auto;  cursor:pointer; display:inline-block; ';

            if(i==0) t[i].style.cssText += this.radiusL;
            if(i==names.length-1)t[i].style.cssText += this.radiusR;
           // if(type=='Speed'){ if(i>0) t[i].style.width = '16px'; else t[i].style.width = '60px'; }
            if(size){if(size[i]){t[i].style.width = size[i] + 'px'; t[i].style.height = size[i] + 'px'; t[i].style.padding ='0px'; } else t[i].style.width = '60px';}
            else t[i].style.width = '60px';
            t[i].className = "none";
            if(type!=='Speed')t[i].textContent = names[i];
            if(i==current){
                //t[i].style.border = '4px solid '+this.colors[0];
                t[i].style.backgroundColor = this.colors[5];
                t[i].style.color = this.colors[2];
                t[i].className = "select";
            }
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );
            //t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  }, false );
            //t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  if(this.className == 'none')this.style.border = '4px solid '+_this.colors[1];  }, false );

            t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '1px solid '+_this.colors[0];  }, false );
            t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  this.style.border = '1px solid '+_this.colors[5];  }, false );

            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelector(this.name, type); }, false );
        }
        //this.hub.appendChild( cont );
        if(type=='DIFFICULTY'){this.full.appendChild( cont ); cont.style.position = 'absolute'; cont.style.top = '200px';cont.style.width = '300px';}
        else this.hub.appendChild( cont );
    },

    setActiveSelector : function (n, type) {
        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                def.style.color = this.colors[0];
               // def.style.border = '4px solid '+_this.colors[1]; 
                def.style.backgroundColor = this.colors[1];
                def.className = "none";
            }
        }
        var select = document.getElementById(type+n);
        //select.style.border = '4px solid '+_this.colors[0]; 
        select.style.backgroundColor = this.colors[5];
        select.style.color = this.colors[2];
        select.className = "select";
    },

    removeSelector : function(type){
        var h = 10, def;
        var target = document.getElementById(type);
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                target.removeChild(def);
            }
        }
        this.full.removeChild(target);
    },

    //------------------------------------------ TOOLS MENU

    showToolSelect : function(id){
        if(id.name !==  this.currentToolName){
            this.currentToolName = id.name;
           // var px = (id.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            //var py= (id.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top );
            var px = (id.getBoundingClientRect().left - this.toolSet.getBoundingClientRect().left );
            var py= (id.getBoundingClientRect().top - this.toolSet.getBoundingClientRect().top );
            this.select.style.left = px + 'px'; 
            this.select.style.top = py + 'px';
            this.select.style.display = 'block';
        } else {
            this.select.style.display = 'none';
            this.currentToolName = 0;
        }
        selectTool(this.currentToolName);
    },

    showToolInfo : function(id, t){
        var name = view3d.toolSet[id.name].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        if(id.name===16) t.toolInfo.innerHTML = 'Drag view';
        else if(id.name===178) t.toolInfo.innerHTML = 'Get info';
        else if(id.name===18) t.toolInfo.innerHTML = 'Rotate view';
        else t.toolInfo.innerHTML = name+'<br>'+view3d.toolSet[id.name].price+"$";
    },

    addSVGButton : function(target){
        var _this = this;
        var b = document.createElement( 'div' );
        b.style.cssText =" margin:0px; padding:0px; width:66px; height:66px; pointer-events:auto; cursor:pointer; display:inline-block; line-height:0px; vertical-align: top;";
        b.innerHTML = HUB.round;
        b.addEventListener( 'mouseover', function ( e ) { 
            e.preventDefault();
            var px = (this.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            var py= (this.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top )
            _this.selector.style.left = px+ 'px'; 
            _this.selector.style.top = py + 'px';
            _this.selector.style.display = 'block';
            _this.showToolInfo(this, _this);
        }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); _this.selector.style.display = 'none';}, false );
        b.addEventListener('click',  function(e){ e.preventDefault();  _this.showToolSelect(this); }, false);
        target.appendChild( b );
        return b;
    },

    //------------------------------------------ DEF BUTTON

    addButton : function(target, name, size, style, top){
        var _this = this;
        if(!size) size = [128, 30, 22];
        //var b = this.createLabel(name, size, true);
        var b = document.createElement( 'div' );

        //var defStyle = 'font-size:'+size[2]+'px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+'; width:'+size[0]+'px; height:'+size[1]+'px;'
        //defStyle += 'margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;

        var defStyle = 'font-size:'+size[2]+'px;  border:1px solid '+this.colors[5]+'; background:'+this.colors[1]+'; width:'+size[0]+'px; height:'+size[1]+'px; color:'+this.colors[0]+';';
        if(top)defStyle += 'margin:4px; padding:7px; pointer-events:auto;  cursor:pointer; display:inline-block; ' + this.radiusB;
        else defStyle += 'margin:4px; padding:7px; pointer-events:auto;  cursor:pointer; display:inline-block; ' + this.radius;

        b.textContent = name;
        if(style) b.style.cssText = defStyle+ style;
        else b.style.cssText = defStyle+ 'margin-top:20px;';
        
       // b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  this.style.backgroundColor = _this.colors[0]; this.style.color = _this.colors[1]; }, false );
       // b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[1]; this.style.backgroundColor = _this.colors[1]; this.style.color = _this.colors[0];  }, false );

        b.addEventListener( 'mouseover', function ( e ) { e.preventDefault();  this.style.backgroundColor = _this.colors[5];this.style.color = _this.colors[2]; }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.backgroundColor = _this.colors[1];this.style.color = _this.colors[0]; }, false );

        target.appendChild( b );

        return b;
    },

    clearElement : function(id){
        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );
        this.hub.removeChild( el );
    }
}


var ARRAY8 = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array;

var Perlin = function () {
    this.F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    this.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    var random = Math.random;
    this.p = new ARRAY8(256);
    this.perm = new ARRAY8(512);
    this.permMod12 = new ARRAY8(512);
    for (var i = 0; i < 256; i++) {
        this.p[i] = random() * 256;
    }
    for (i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
    }
}

Perlin.prototype = {

    grad3: new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]),
    
    noise: function (xin, yin) {
        var permMod12 = this.permMod12, perm = this.perm, grad3 = this.grad3;
        var n0=0, n1=0, n2=0;
        var s = (xin + yin) * this.F2;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * this.G2;
        var X0 = i - t;
        var Y0 = j - t;
        var x0 = xin - X0;
        var y0 = yin - Y0;
        var i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }
        var x1 = x0 - i1 + this.G2;
        var y1 = y0 - j1 + this.G2;
        var x2 = x0 - 1.0 + 2.0 * this.G2;
        var y2 = y0 - 1.0 + 2.0 * this.G2;
        var ii = i & 255;
        var jj = j & 255;
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = permMod12[ii + perm[jj]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    }
}
