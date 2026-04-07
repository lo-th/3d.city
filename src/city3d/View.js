//import * as THREE from '../three/three.module.min.js'
import * as THREE from '../three/three.webgpu.js'
import { exponentialHeightFogFactor, uniform, fog, color, mul } from '../three/three.tsl2.js';

import { ImprovedNoise } from '../jsm/math/ImprovedNoise.js';


import { AppState } from '../AppState.js'
import { Material, MAT, MAT_LAND } from './Material.js'
import { Base, Zone, ZoneExtand } from './Base.js';
import { BuildTool, Markers } from './BuildTool.js';
import { PostEffect } from './PostEffect.js';
import { Pool } from './Pool.js';

//import { Inspector } from '../jsm/inspector/Inspector.js';
//import { TSLGraphLoader } from '../jsm/inspector/extensions/tsl-graph/TSLGraphLoader.js';

import { TrafficBase } from '../TrafficBase.js'


//let Audio;
let renderer, camera, scene, timer, sun;
const tm = { tmp:0, n:0, fps:0 };
const tmpPos = new THREE.Vector2( 0, 0 );

export class View {

	constructor () {

		this.pauseRender = false
		this.firstDraw = true

		this.currentLayerSize = 0

		this.container = document.getElementById( 'container' );

		this.mapPath = './assets/textures/'
		this.modelPath = './assets/models/'
		this.rootModel = this.modelPath + 'world.glb';


		this.isMenu = false;

		this.inMapGeneration = false;

		this.isPixelStyle = false;

	    this.metalness = 0.6;
	    this.roughness = 0.3;
	    this.wireframe = false;

	    this.loadGame = null


	    this.M_list = ['treeLists'     , 'townLists'     , 'houseLists'       , 'buildingLists' ];
	    this.M_temp = ['tempTreeLayers', 'temptownLayers', 'tempHouseLayers'  , 'tempBuildingLayers' ];
	    //this.M_geom = ['treeGeo'       , 'buildingGeo'   , 'houseGeo'         , 'X' ];
	    this.M_mesh = ['treeMeshs'     , 'townMeshs'     , 'houseMeshs'       , 'buildingMeshs' ];
	    this.M_mats = ['town'          , 'town'          , 'building'         , 'building' ];
		
		this.pix = 1//window.devicePixelRatio;
		//if( this.pix > 2 ) this.pix = 2;


		this.isLow = false;

		this.ARRAY_TYPE = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;


		this.isWithEnv = true;
	    //this.isWithNormal = false;
	    //this.isWithRoughness = false;
	    
		this.isIsland = false;
		this.isWinter = false;

		this.isComputeVertex = true;
		this.isTransGeo = true;

		//this.tmpCanvas = null;
		//this.AppState.tilesDataNormal = [];
		//this.AppState.tilesDataTextures = [];

		this.key = [0,0,0,0,0,0,0];

		this.oldData = [];

		//this.tileSize = 64;
		

		if(AppState.isMobile){ 
			this.pix = 1
	        AppState.isWithTree = false;
	        this.isWithEnv = false;
	        AppState.isWithNormal = false;
	        AppState.isWithLight = false;
	        AppState.withShadow = false;
	        AppState.tileSize = 32;
	    }

	    this.mu = AppState.tileSize === 64 ? 4 : 2;

		this.f = [0,0,0];
		this.stats = [0,0];
		this.isWithStats = false;


		this.dayTime = 0;

		this.tcolor = {r:10, g: 15, b: 80, a: 0.9};

		this.snd_layzone = new Audio("./sound/layzone.mp3");


		this.winterMapLoaded = false;

	    this.tmpGameData = null

	
		this.imgs = [];
		this.num = 0;

		this.fullRedraw = false;

		//this.isWithBackground = false;
		

		// camera
		this.ToRad = Math.PI / 180;
	    this.camera = null;
	    this.scene = null; 
	    //this.renderer = null;
	    this.timer = null;


	    this.miniTerrain = [];
	    this.terrainTxt = [];
	    this.terrainTxtN = [];
	    this.terrainTxtR = [];

	    this.forceUpdate = { x:-1, y:-1 };

	    this.cam = { horizontal:90, vertical:70, distance:120 };
	    this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
	    this.mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, dx:0, dy:0, down:false, over:false, drag:false, click:false, move:true, dragView:false, button:0 };
	    this.raypos =  {x:-1, y:0, z:-1};

	    // vertical orbit limits (degrees) — keep camera above horizon and below zenith
	    this.CAM_V_MIN = 5;
	    this.CAM_V_MAX = 87;

	    // smooth camera state
	    this.zoomVelocity = 0;
	    this.orbitVelocityH = 0;
	    this.orbitVelocityV = 0;
	    this.pinchStartDist = 0;
	    this.pinchStartCamDist = 0;
	    this.pinchMidX = 0;
	    this.pinchMidY = 0;

	    this.select = '';
	    this.meshs = {};

	    this.mapSize = [128,128];
	    this.layerW = 8;
	    this.layerH = 8;
	    this.nlayers = 64;

	    this.tool = null;

		this.currentTool = null;

		this.heightData = null;
		
		this.treeMeshs = [];
		this.treeLists = [];
		this.tempTreeLayers = [];
		this.treeValue = [];

		this.powerMeshs = [];

		this.buildingMeshs = [];
		this.buildingLists = [];
		this.tempBuildingLayers = [];

		this.townMeshs = [];
		this.townLists = [];
		this.temptownLayers = [];

		this.houseMeshs = [];
		this.houseLists = [];
		this.tempHouseLayers = [];


		this.tempDestruct = [];

		this.currentLayer = 0;

		this.needResize = false;

		this.ease_p = -1
		this.onEase = false;

		this.ease = new THREE.Vector3();
        this.easeRot = new THREE.Vector3();

		// Construction animation markers
		this.constructionGroup = null;
		this.constructionQueue = [];
		

		this.spriteLists = ['train', 'elico', 'plane', 'boat', 'monster', 'tornado', 'sparks'];
		this.spriteMeshs = [];
		this.spriteObjs = {};

		this.cameraNeedUpdate = false;

	}

	//----------------------------------- RENDER

    animate( time ) {

    	timer.update( time );

    	this.getFps()

		AppState.delta = timer.getDelta();

        //requestAnimationFrame( this.loop.bind(this) );

        if(this.material.water){
        	this.material.water.offset.x += 0.0001
        	this.material.water.offset.y -= 0.00008
        }


    	if( this.needResize ) this.doResize()

    	if( this.onEase ) this.easing()

	    if( this.dragMode() ) this.dragCenterposition();
	    else this.updateKey();
	    
	    this.applyZoomInertia();
	    this.applyOrbitMomentum();
	    this.updateCamera()
	    if(this.markers) this.markers.update();

	    if( this.postEffect.pipeline !== null ) this.postEffect.pipeline.render();
	    else renderer.render( scene, camera )
	    

    }

	getFps(){

		if ( timer._currentTime - 1000 > tm.tmp ){ 
	        tm.tmp = timer._currentTime;
	        tm.fps = tm.n;
	        tm.n = 0;
	        AppState.hub.upFps(tm.fps);
	    }
	    tm.n++;

	}
	

	//----------------------------------- INIT RENDER

	async initRenderer(){

		renderer = new THREE.WebGPURenderer({ antialias:true, forceWebGL:AppState.forceWebGL });
		renderer.setSize( this.vsize.x, this.vsize.y );
        renderer.setPixelRatio( this.pix )
    	//renderer.sortObjects = false;
    	//renderer.sortElements = false;
    	//renderer.autoClear = this.isWithBackground;
    	renderer.toneMapping = THREE.NeutralToneMapping;
    	renderer.toneMappingExposure = AppState.exposure;

    	//if( AppState.inspector ) renderer.inspector = new Inspector();

    	this.container.appendChild( renderer.domElement );
    	await renderer.init(); // MUST await before using

    	AppState.isWebGPU = renderer.backend.isWebGLBackend !== undefined ? false : true;

    	this.postEffect = new PostEffect()

    	// preload all resource
    	this.pool = new Pool();
    	await this.pool.load();

		this.init();

		this.material = new Material(this.pool);

		if(AppState.LUT_on){ 

			// testing post effect 

			this.postEffect.init( renderer, scene, camera, this.pool );
			this.postEffect.LutPass()
			//this.postEffect.AoPass()

		}

		this.preIntro();

		AppState.main.start();

	}

	getRenderer(){ return renderer; }

	preIntro() {

		this.center.x = 19*0.5;
        this.center.z = 19*0.5;
        this.cam.distance = 30
        this.moveCamera();

		this.addBorder();

		const cgeo = new THREE.PlaneGeometry( 19, 19, 3, 3 );
		cgeo.rotateX( -Math.PI * 0.5 );
  
        this.basePlane = new THREE.Mesh( cgeo, MAT.plane );
        this.basePlane.position.copy( this.center )
        this.scene.add( this.basePlane );

        if(AppState.withShadow){
        	this.basePlane.receiveShadow = true;
		}

        this.title = this.pool.title;
        this.title.material = MAT.title;
        if(AppState.withShadow){
        	this.title.receiveShadow = true;
        	this.title.castShadow = true;
		}

		this.title.children[0].material = MAT.title_l;
		this.title.children[1].material = MAT.title_g;

        this.title.position.copy( this.center )
        this.scene.add( this.title )

	    // add random building 
	    this.buildings = new THREE.Group()
	    let j = 16, m, px = 0, pz = 0
	    while(j--){
	    	if(px === 4){ pz ++; px = 0 }
	    	m = this.getRandomObject()
	    	m.position.set( (px*4)+3, 0.01,( pz*4)+3)
	    	this.buildings.add(m)
	    	px++
	    }
	    this.scene.add( this.buildings )

	    // force land material in memory

	    this.fakeLand = new THREE.Group();
	    this.fakeLand.position.copy( this.center );
	    let pp, g = new THREE.PlaneGeometry( 1, 1, 1, 1 );  
	    g.rotateX( -Math.PI * 0.5 );
	    let i = 144;
	    while(i--){
	    	pp = new THREE.Mesh( g.clone(), MAT_LAND[i] )
	    	pp.position.y = -0.1+(i*-0.001)
	    	this.fakeLand.add(pp)
	    }
	    this.scene.add( this.fakeLand )


	    // traffic map 
        this.traffic = new TrafficBase({ pool:this.pool, isStandard:AppState.isBestMaterial, withShadow:AppState.withShadow })
	    this.scene.add( this.traffic )


	    // test water

	    /*let wat = new THREE.Mesh( cgeo, MAT.water )
	    wat.position.copy( this.center )
	    wat.position.y = 0.5
	    this.scene.add( wat )

	    this.tmpWater = wat*/


	    AppState.hub.initStartHub();

	    this.isMenu = true;

	}

	forceUP(){
		let i = 144;
	    while(i--){
	    	MAT_LAND[i].envMapIntensity = this.scene.environmentIntensity
	    }

	    MAT['building'].envMapIntensity = this.scene.environmentIntensity
	    MAT['town'].envMapIntensity = this.scene.environmentIntensity
	}

	clearIntro(){

		let i = 144, pp//.length
		while (i--) {
			pp = this.fakeLand.children[i];
			pp.geometry.dispose()
			this.fakeLand.remove(pp)
		}
		this.scene.remove( this.fakeLand );

		this.traffic.clearAll()

		this.title.material.dispose();
		this.title.children[0].material.dispose();
		this.title.children[1].material.dispose();
		this.title.geometry.dispose()
		this.title.children[0].geometry.dispose();
		this.title.children[1].geometry.dispose();
		this.title.children = []
		this.scene.remove( this.title )

		this.buildings.children = []
		this.scene.remove( this.buildings )

		AppState.hub.clearStartHub()

	}

	fileSelect( e ){

		AppState.hub.generate( true );
        this.inMapGeneration = true;

		const file = e.target.files[0]
		const reader = new FileReader();
        let fname = file.name;
        let type = fname.substring(fname.lastIndexOf('.')+1, fname.length );
        if( type !== 'json' ) return
        reader.readAsText( file );

        reader.onload = function (e) {

        	this.tmpGameData = e.target.result
        	this.openMap( 'LOADDONE' )

        }.bind(this);

	}

	openMap( type ){

		if( AppState.isMobile && type === 'LOAD' ){ 
			if( window.localStorage.getItem( 'micropolisJSGame' ) ) type = 'LOADDONE'
			else return
		}

		if( type==='LOAD' ){

			if(!this.fileInput){

				this.fileInput = document.createElement("input")
				this.fileInput.type ='file'
				this.fileInput.style.display='none'
				this.fileInput.onchange = this.fileSelect.bind(this)
				//fileInput.func=func
				document.body.appendChild( this.fileInput )
				
			}

			let eventMouse = document.createEvent("MouseEvents")
			eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
			this.fileInput.dispatchEvent(eventMouse)

			return
		}

		if( this.fileInput ) document.body.removeChild(this.fileInput)

		this.command = type;

		//this.isMenu = false;

		this.ease_p = 0;
		this.onEase = true;

		this.clearIntro();

	}

	endOpen() {

		this.isMenu = false;

		if( this.command === 'LOADDONE' ){

			//this.loadGame( e.target.result )

			//this.paintMap()

			//this.isMenu = false;
			//setTimeout( function(){ this.ui.dispose() }.bind(this), 100 )

			AppState.main.loadGame( true )


		}

		if( this.command === 'NEW' ){
		
		    //const self = this

		    AppState.hub.initMapHub()

		    // generate new map
		    AppState.main.newMap()

		}

	}




	easing() {

		let v = this.ease_p;
		if( v >= 1 ) {
			this.onEase = false;
			v = 1;
			this.endOpen();
		} else {
			this.ease_p += 0.01
		}

		let p = 19*0.5
		this.center.x = this.center.z = p + ( (this.mapSize[0]*0.5) - p ) * v;
		this.cam.distance = 40 + ( 150 - 40 ) * v;
        this.moveCamera();

        this.basePlane.position.copy( this.center )
        let s = 1 + ( (128/19) - 1 ) * v;
        this.basePlane.scale.set( s, 1, s )
        //this.basePlane.material.normalMap.

		//this.border.morphTargetInfluences[ 0 ] = 1 - v

		this.resizeBorder( 19+ (this.mapSize[0]-19) * v )

	}



	//----------------------------------- BORDER

	resizeBorderGenerator( size ){
		this.resizeBorder( size )
		let p = 19*0.5
		this.center.x = this.center.z = p + ( (size*0.5) - p ) * 1;

		this.updateSunPosition()
		/*if(this.plane){
			this.plane.position.copy(this.center)
		    this.plane.position.y = 4
		    this.plane.position.z = size+6
		}*/
		
	}

	addBorder() {

		this.border = this.pool.border;
		this.borderGeometry = this.border.geometry.clone()
        this.border.position.set( 0, 0, 0 );
        this.border.material = MAT.border;
        this.scene.add( this.border );
        this.border.frustumCulled = false;
        if(AppState.withShadow) this.border.receiveShadow = true;
		
	}



	resizeBorder( size ) {

		const baseGeometry = this.borderGeometry;
		const geometry = this.border.geometry;
		//const center = new THREE.Vector3();
		//geometry.boundingBox.getCenter( center );
		const position = geometry.attributes.position;
		const baseAr = baseGeometry.attributes.position.array;
		const ar = position.array;
		let i = position.count, n=0;

		while(i--){
			n = i*3;
			if(baseAr[n]>9.5) ar[n] = baseAr[n] + (size-19.5);
			if(baseAr[n+2]>9.5) ar[n+2] = baseAr[n+2] + (size-19.5)
		}

	    position.needsUpdate = true;
	    geometry.computeBoundingBox()

	}



	//----------------------------------- INIT

    init() {

    	timer = new THREE.Timer();
		timer.connect( document );

    	scene = new THREE.Scene();
    	this.scene = scene
    	
    	camera = new THREE.PerspectiveCamera( 50, this.vsize.z, 0.1, 1000 );
    	this.scene.add( camera );
    	this.camera = camera

    	this.rayVector = new THREE.Vector2( 0, 0 );
    	this.raycaster = new THREE.Raycaster();
    	
        this.land = new THREE.Group();
        this.scene.add( this.land );

        if( AppState.activeFOG ){

        	/*AppState.fog_Density = uniform( AppState.fog_Density );
			AppState.fog_Height = uniform( AppState.fog_Height );
			AppState.fog_Alpha = uniform( AppState.fog_Alpha );

			const fogFactor = exponentialHeightFogFactor( AppState.fog_Density, AppState.fog_Height );
		
			scene.fogNode = fog( color( AppState.color.fog ), fogFactor.mul(AppState.fog_Alpha) )

			const gui = renderer.inspector.createParameters( 'Fog Settings' );

			gui.add( AppState.fog_Density, 'value', 0.001, 0.1 ).step( 0.0001 );
			gui.add( AppState.fog_Height, 'value', 0, 10 )
			gui.add( AppState.fog_Alpha, 'value', 0, 1 )*/

        	//this.fog = new THREE.Fog( 0xCC7F66, 1, 100 );
        	this.fog = new THREE.Fog( AppState.color.fog, 1, 100 );
        	this.scene.fog = this.fog;
        
        }

        this.center = new THREE.Vector3();
        this.center.x = this.mapSize[0]*0.5;
        this.center.z = this.mapSize[1]*0.5;
        this.moveCamera();

    	this.anisotropy = 1.0//renderer.capabilities.getMaxAnisotropy();

    	//this.renderer.autoClear = false;
        

        if( this.isWithEnv ){

    	    this.scene.background = this.pool.envmap.background;
			this.scene.environment = this.pool.envmap.environment;
			this.scene.backgroundBlurriness = AppState.backgroundBlurriness;
			this.scene.backgroundIntensity = AppState.backgroundIntensity;
			this.scene.environmentIntensity = AppState.environmentIntensity;

        }


        if( AppState.isWithLight ){

        	sun = new THREE.DirectionalLight( AppState.directColor , AppState.direct );
			sun.position.set( this.center.x+10 , 100, this.center.z+50 );
			sun.target.position.set( this.center.x, this.center.y, this.center.z );
			sun.castShadow = true;
			this.scene.add( sun );
			this.scene.add( sun.target );

			this.sun = sun

			if(AppState.withShadow){

				renderer.shadowMap.enabled = true;
				const shadow = sun.shadow;
				shadow.mapSize.width = shadow.mapSize.height = 2048*2;
				shadow.radius = 2;
				shadow.bias = - 0.0005;
				shadow.intensity = 1;
				const shadowCam = shadow.camera, s = 100;
				shadowCam.near = 60;
				shadowCam.far = 170;
				shadowCam.right = shadowCam.top	= s;
				shadowCam.left = shadowCam.bottom = - s;
				// debug shadow
			    //this.scene.add(  new THREE.CameraHelper(shadowCam) );

			}

			this.sun = sun;

        }
    	
    	//let _this = this;
    

        /*if( this.isWithBackground ){

        	this.skyCanvasBasic = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','#A7DCFA', 'deepskyblue']]);
        	this.skyCanvas = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','#A7DCFA', 'deepskyblue']]);
        	this.skyTexture = new THREE.Texture(this.skyCanvas);
        	//this.skyTexture.encoding = THREE.sRGBEncoding
        	this.skyTexture.colorSpace = THREE.SRGBColorSpace;
		    this.skyTexture.needsUpdate = true;
            this.back = new THREE.Mesh( new THREE.IcosahedronGeometry(300,1), new THREE.MeshBasicMaterial( { map:this.skyTexture, side:THREE.BackSide, depthWrite: false, fog:false }  ));
            this.scene.add( this.back );
            //this.renderer.autoClear = false;

        } else {

        	this.renderer.setClearColor( this.pool.color.sky, 1 );

        }*/

        
        window.addEventListener( 'resize', function(e) { this.resize() }.bind(this), false );

        // disable context menu
        document.addEventListener("contextmenu", function(e){ e.preventDefault(); }, false);

        document.addEventListener( 'mousewheel', this, false );

        const dom = renderer.domElement
        //const dom = this.container

        dom.addEventListener( 'mousemove', this, false );
        dom.addEventListener( 'mousedown', this, false );
        //this.container.addEventListener( 'mouseup', this, false );
        //this.container.addEventListener( 'mouseout', this, false );

        dom.addEventListener( 'touchmove', this, false );
        dom.addEventListener( 'touchstart', this, false );
        dom.addEventListener( 'touchend', this, false );

        document.addEventListener( 'mouseup', this, false );

        this.initLayer()


        // new Tool
        this.tool = new BuildTool()
        this.scene.add( this.tool );
        this.tool.visible = false;

        this.markers = new Markers();
        this.scene.add( this.markers );

        // Construction animation group
        //this.constructionGroup = new THREE.Group();
        //this.scene.add( this.constructionGroup );

	    // active key
	    if(!AppState.isMobile) this.bindKeys();

	    const animate = this.animate.bind(this)
		renderer.setAnimationLoop( animate );

    }

    updateSunPosition(){
    	sun.position.set( this.center.x+10 , 100, this.center.z+50 );
		sun.target.position.set( this.center.x, this.center.y, this.center.z );
    }




    //----------------------------------- RESIZE

    resize( e ) { this.needResize = true; }

    doResize() {

    	this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
	    this.camera.aspect = this.vsize.z;
	    this.camera.updateProjectionMatrix();
	    renderer.setSize( this.vsize.x,this.vsize.y );
	    this.needResize = false;

    }


    //----------------------------------- EVENT

    handleEvent( e ) {

        switch( e.type ) {
            case 'mouseup': case 'mouseout': case 'touchend':this.onMouseUp( e ); break;
            case 'mousedown': case 'touchstart': this.onMouseDown( e ); break;
            case 'mousemove': case 'touchmove': this.onMouseMove( e ); break;
            case 'mousewheel': this.onMouseWheel( e ); break;
        }

    }


    //----------------------------------- ZOOM

	startZoom() {

		this.timer = setInterval( this.faddingZoom, 1000/60, this );
	
	}

	faddingZoom( t ) {
		if(t.cam.distance>20){
			t.cam.distance--;
			t.moveCamera();
		} else { 
			clearInterval(t.timer);
		}
	}


	//----------------------------------- MATH

    clamp( value, min, max ) {

        if (value < min) return min;
        if (value > max) return max;
        return value;

    }

    randRange( min, max ) {

		return Math.floor(Math.random() * (max - min + 1)) + min;

	}

	unwrapDegrees( r ) {

		r = r % 360;
		if (r > 180) r -= 360;
		if (r < -180) r += 360;
		return r;

	}


	//----------------------------------- LOAD IMAGES

	

    winterSwitch() {
    	/*if(!this.isWinter && this.winterMapLoaded) this.isWinter = true;
    	else this.isWinter = false;

		this.updateBackground();
		this.setTimeColors(this.dayTime);*/
    }

	textureSwitch( type ) {
		/*switch(type){
			case 'normal': 
			    this.townMaterial.map = this.townTexture;
			    this.buildingMaterial.map =  this.buildingTexture;
			break;
			case 'white':
			    
			break;
		}*/

	}

	setTimeColors( id ) {

		/*this.dayTime = id;
		if(this.dayTime==1)this.tcolor = {r:100, g: 15, b: 80, a: 0.3};
		if(this.dayTime==2)this.tcolor = {r:10, g: 15, b: 80, a: 0.8};
		if(this.dayTime==3)this.tcolor = {r:10, g: 15, b: 80, a: 0.6};

		this.tint(this.skyCanvas);

		if(!this.isWinter){
			//this.tint(this.groundCanvas, this.imgs[0]);
			this.tint(this.townCanvas, this.imgs[1], this.imgs[4]);
			this.tint(this.buildingCanvas, this.imgs[2], this.imgs[3]);
	    } else {
			//this.tint(this.groundCanvas, this.imgs[5]);
			this.tint(this.townCanvas, this.imgs[6], this.imgs[4]);
			this.tint(this.buildingCanvas, this.imgs[7], this.imgs[3]);
		}

		if(AppState.activeFOG){
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
        this.fullRedraw = true;*/

	}

	//----------------------------------- 3D GEOMETRY FOR INTRO

	getRandomObject( nn ) {

		nn = nn || this.randRange(0,2);
		let geo, mat, r, n;
		switch(nn){

			case 0: geo = this.pool.geo('residential', this.randRange(1,18) ); break;
			case 1: geo = this.pool.geo('commercial', this.randRange(1,20) ); break;
			case 2: geo = this.pool.geo('industrial', this.randRange(1,8) ); break;

		}

		let mesh = new THREE.Mesh( geo,  MAT.building );
		if(AppState.withShadow){
        	mesh.receiveShadow = true;
		    mesh.castShadow = true;
		}

		return mesh;

	}

	
	//----------------------------------- MESH CONSTRUCTOR    

    buildMeshLayer( layer, type = 'tree' ) {

        type = type;

        let id = 0;

        if( type === 'tree' ) id = 0;
        if( type === 'town' ) id = 1;
        if( type === 'house' ) id = 2;
        if( type === 'building' ) id = 3;

        let list = this.M_list[id];
        let temp = this.M_temp[id];
        //let geom = this.M_geom[id];
        let mesh = this.M_mesh[id];
        let mats = this.M_mats[id];

		let isIndexed = false, index, indexOffset = 0;

        let _g, v, nr, uv, t, i, j, lng, n, ar, k, decal = 0;

        if( this[list][layer] ){

            i = this[list][layer].length;

            v = [];
            uv = [];
            nr = [];
            index = [];

            while( i-- ){

                ar = this[list][layer][i];

                if( id === 3 ){ // building

                    k = Base.R.length;
                    while(k--){ 
                        if( ar[3] === Base.R[k] ){ 
                            _g = this.pool.geo('residential', k);
                            // remove little house
                            if(k===0 && ar[5]===0){ this.buildingLists[layer][i][5] = 1; this.addBaseHouse( ar[0], ar[1], ar[2] ); }
                            else if(k>0 && ar[5]===1){ this.buildingLists[layer][i][5] = 0;  this.removeBaseHouse( ar[0], ar[1], ar[2] ); }
                        }

                    }

                    k = Base.C.length;
                    while(k--){ if( ar[3] === Base.C[k] ) _g = this.pool.geo('commercial', k)  }

                    k = Base.I.length;
                    while(k--){ if( ar[3] === Base.I[k] ) _g = this.pool.geo('industrial', k) }

                } else if( id === 2 ){ // house

                    k = Base.H.length;
                    while(k--){ if( ar[3] === Base.H[k] ) _g = this.pool.geo('house', k) }

                } else { // other

                    _g = this.pool.geo( type, ar[3] )

                }

                // add to temp array if geometry

                if( _g ){

                	// index
                	if( _g.index !== null ){ 

		        		isIndexed = true
		        		lng = _g.index.count

		        		for ( j = 0; j < lng; ++ j ) index.push( _g.index.getX( j ) + indexOffset )
		        		indexOffset += _g.attributes.position.count
		        		
		        	}

                	// position
                    t = _g.attributes.position.array
                    lng = _g.attributes.position.count

                    for( j = 0; j < lng; ++ j ){
                        n = j * 3
                        v.push( t[n] + ar[0], t[n+1] + ar[1], t[n+2] + ar[2] + decal )
                    }

                    // normal
                	nr = [ ...nr, ..._g.attributes.normal.array ]
                	// uv
                	uv = [ ...uv, ..._g.attributes.uv.array ]

                }

            }

            // remove old mesh

            if( this[mesh][layer] ){
                
                this[mesh][layer].geometry.dispose();
                this.scene.remove( this[mesh][layer] );

            }

            if( v.length > 0 ){

                // final geometry

                let g = new THREE.BufferGeometry();

                if( isIndexed ) g.setIndex( index );
                g.setAttribute( 'position', new THREE.Float32BufferAttribute( v , 3 ) );
                g.setAttribute( 'normal', new THREE.Float32BufferAttribute( nr, 3 ) );
                g.setAttribute( 'uv', new THREE.Float32BufferAttribute(  uv, 2 ) );

                // final mesh
	            this[mesh][layer] = new THREE.Mesh( g, MAT[mats] );
	            if(AppState.withShadow){
	            	this[mesh][layer].receiveShadow = true;
				    this[mesh][layer].castShadow = true;
				}
	            this.scene.add( this[mesh][layer] );

            }

            // clear temp
            this[temp][layer] = 0;

        }

    }

    //----------------------------------- TREE TEST

    addTree ( x, y = 0, z, v, layer ) {

        if( !AppState.isWithTree ) return;
        // v  21 to 43
        if( !this.treeLists[layer] ) this.treeLists[layer]=[];
        this.treeLists[layer].push([x,y,z,v]);

    }

    populateTree (){

    	if(!AppState.isWithTree) return;

    	let l = this.nlayers;

    	while( l-- ){

            this.buildMeshLayer( l );

    	}

    }

    clearAllTrees () {

    	if(!AppState.isWithTree) return;
    	let l = this.nlayers;
    	while(l--){
    		if( this.treeMeshs[l] ){
    			this.scene.remove( this.treeMeshs[l] );
    			if(this.treeMeshs[l].geometry) this.treeMeshs[l].geometry.dispose();
    		}
    	}
    	this.treeMeshs = [];
    	this.treeLists = [];
    	this.tempTreeLayers = [];
    	this.treeValue = [];

    }

    removeTreePack ( ar ) {

    	if(!AppState.isWithTree) return;
    	//this.tempTreeLayers = [];
    	let i = ar.length;
    	while(i--){
    		this.removeTree(ar[i][0], ar[i][1], true);
    	}
    	// rebuild layers
    	i = this.tempTreeLayers.length;
    	while(i--){
    		if(this.tempTreeLayers[i] === 1){ this.rebuildTreeLayer(i); }
    	}
    }

    removeTree ( x, z, m ) {

    	let l = this.findLayer(x, z), ar;
		if(this.treeLists[l]){
			let i = this.treeLists[l].length;
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
    }

    rebuildTreeLayer ( l ) {

    	if(!AppState.isWithTree) return;
    	this.scene.remove(this.treeMeshs[l]);
    	this.treeMeshs[l].geometry.dispose();

        this.buildMeshLayer(l);

    }


    //------------------------------------ BACKGROUND MAP

    /*updateBackground () {

    	let rootColors;
        let fogColors;
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
		    	if(AppState.activeFOG){
		    		this.fog.color.setHex(fogColors);
		    		//this.fog.color.convertSRGBToLinear()
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
		    	if(AppState.activeFOG){
		    		this.fog.color.setHex(fogColors);
		    		//this.fog.color.convertSRGBToLinear()
		    	}
		    }
		    this.skyTexture = new THREE.Texture(this.skyCanvas);
		    //this.skyTexture.encoding = THREE.sRGBEncoding
		    this.skyTexture.colorSpace = THREE.SRGBColorSpace;
		    this.skyTexture.needsUpdate = true;
		    this.back.material.map = this.skyTexture;
		} else {
			if(this.isIsland) this.renderer.setClearColor( 0x6666e6, 1 );
			else this.renderer.setClearColor( 0xcc7f66, 1 );
		}

        
    }*/

    

    //------------------------------------ TERRAIN MAP

    clearTerrain () {

    	//this.disposeTerrainMaterial()

		if( this.miniTerrain.length > 0 ){
			let i = this.miniTerrain.length;
			while(i--){
			    this.miniTerrain[i].geometry.dispose()
				this.land.remove( this.miniTerrain[i] ); 
			}
			this.miniTerrain = [];
		}

	}

	initTerrain() {

		//if(this.debugTime) console.time("initTerrain");

		this.center.x = this.mapSize[0]*0.5;
		this.center.z = this.mapSize[1]*0.5;

		// Update layer dimensions based on current map size
		this.layerW = Math.ceil(this.mapSize[0] / 16);
		this.layerH = Math.ceil(this.mapSize[1] / 16);
		this.nlayers = this.layerW * this.layerH;

		// reset to default texture
		this.material.resetLandMaterial( this.nlayers )
		AppState.firstDraw = false;

		let recreate = this.nlayers !== this.currentLayerSize

		if( recreate ){

			this.firstDraw = true;

			this.currentLayerSize = this.nlayers;

			this.clearTerrain();
			// rebuild terrain material 
		    //this.createTerrainMaterial();

			// create terrain if not existe
	        //if( this.miniTerrain.length === 0 ){

        	let n = 0, i, j, k, geo, mesh;

        	let divid = AppState.withHeight ? 16 : 1;

        	let colors;

        	for( i=0; i<this.layerH; i++){
        		for( j=0; j<this.layerW; j++){
        		
                    geo = new THREE.PlaneGeometry( 16, 16, divid, divid );
                    geo.rotateX( -Math.PI * 0.5 );
                    geo.translate( (8+j*16)-0.5, 0, (8+i*16)-0.5 );

                    k = geo.attributes.position.array.length
                    colors = [];//new Float32Array( lng );
                    while( k-- ) colors[k] = 1.0
                    geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

                    //MAT_LAND[ n ].needsUpdate = true 
                    mesh = new THREE.Mesh( geo, MAT_LAND[ n ] )

                    if(AppState.withShadow){
		            	mesh.receiveShadow = true;
					}

                    mesh.name = 'terrain_' + n;
                    mesh.matrixAutoUpdate = false
                    this.miniTerrain[n] = mesh;
	        		this.land.add( mesh );

	        		n++;

	        	}
	        }

	    }

	    // update start map texture

        if( AppState.withHeight ){

		    this.applyHeight();
		    //this.center.y = this.heightData[this.findId(this.center.x,this.center.z)];
            this.center.y = this.heightData[this.findHeightId(this.center.x,this.center.z)];

		} else {

			this.center.y = 0;

		}

		//this.renderer.render( this.scene, this.camera )

		this.moveCamera();
		//if( this.isWithBackground ) this.back.position.copy(this.center);

		
		//if(this.debugTime) console.timeEnd("initTerrain");

	}

	

	//------------------------------------------HEIGHT

	generateHeight() {

        let d = this.mapSize[0]+1;
		let size = d * d;

		this.heightData = new this.ARRAY_TYPE(size);

		let perlin = new ImprovedNoise()

        let noise;

        let r = 1 / d;
        let quality = 1 / 20;
        let i = size, x, y, min = 0, max = 0

        while( i-- ){

			x = i % d;
            y = Math.floor( i * r );
            noise = (perlin.noise( x * quality, 0, y * quality ) + 1)*0.5;
            noise *= AppState.heightMulty;
            noise = Math.pow( noise, AppState.heightPow );
			this.heightData[ i ] = noise

			if(noise<min) min = noise
			if(noise>max) max = noise

		}

	    

	}

	clearHeight() {

		if( this.water ){ 
			this.water.geometry.dispose()
			this.scene.remove( this.water );
		}
		this.heightData = null
		//AppState.withHeight = false;

	}

	applyHeight() {

		const debugHeight = false

		let i, j, gr, gn, gc;
        let lng = this.heightData.length;
		let pos, layer, h, v, d=0, n, nn, geo, id, deep;
        this.Gtmp = [];

        let big = new THREE.PlaneGeometry( this.mapSize[0], this.mapSize[1], this.mapSize[0], this.mapSize[1] );
        big.rotateX( -Math.PI * 0.5 );
        big.translate( this.center.x-0.5, 0, this.center.z-0.5 );

        gr = big.attributes.position.array;

        i = lng;
        while(i--){
            n = i*3;
            gr[n+1] = this.heightData[i];
        }

        big.attributes.position.needUpdate = true;
        big.computeVertexNormals();
        let rn = big.attributes.normal.array;

        i = this.nlayers;

        while (i--){

        	geo = this.miniTerrain[i].geometry

            gr = geo.attributes.position.array;
            gn = geo.attributes.normal.array;
            gc = geo.attributes.color.array;

            j = gr.length/3;

            this.Gtmp[i] = new this.ARRAY_TYPE(j);

            while(j--){

                n = j * 3;
                //id = this.findHeightId( gr[n], gr[n+2] )
                id = this.findHeightId( gr[n]+0.5, gr[n+2]+0.5 )


                gr[n+1] = this.Gtmp[i][j] = this.heightData[ id ]; 

                nn = id*3;
                gn[n] = rn[nn];
                gn[n+1] = rn[nn+1];
                gn[n+2] = rn[nn+2];

                deep = 0.5 + this.clamp( this.heightData[ id ]/3, -1, 1) * 0.5;

                // color
                gc[n] = gc[n+1] = gc[n+2] = deep;

                
                if( gr[n+1]<0 ){ // under sea
                	 gc[n] -= deep * 0.5
                	 gc[n+1] -= deep * 0.25
                	 
                }

                // border smooth
                if(gr[n]===-0.5 || gr[n+2]===-0.5 || gr[n]===this.mapSize[0]-0.5 || gr[n+2]===this.mapSize[1]-0.5){
                	if( gr[n+1]>0 ) gr[n+1] = this.heightData[ id ] = 0.25
                	if( gr[n+1]<0 ) gr[n+1] = this.heightData[ id ] = 0
                }

            }
                	
            
            geo.attributes.position.needsUpdate = true;
            geo.attributes.normal.needsUpdate = true;
            geo.attributes.color.needsUpdate = true;
            geo.computeBoundingBox()
            geo.computeBoundingSphere()

        }

        if(debugHeight){
        	const bigPreview = new THREE.Mesh(big, new THREE.MeshBasicMaterial({color:0x000000, wireframe:true }))
            scene.add(bigPreview )
        }else{
        	big.dispose();
        	big = null;
        }


        // add water mesh

        let waterGeo = new THREE.PlaneGeometry( this.mapSize[0], this.mapSize[1], 1, 1 );
        waterGeo.rotateX( -Math.PI * 0.5 );
        waterGeo.translate( this.center.x-0.5, 0, this.center.z-0.5 );


        this.material.water.repeat.set(this.mapSize[0]*0.125, this.mapSize[1]*0.125)
        //this.pool.water.repeat.set()
        //MAT.water.normalScale.set(0.5,0.5)
        this.water = new THREE.Mesh( waterGeo, MAT.water )
        this.scene.add( this.water );

	}

	makePlanar( ar, y ) {

		let layer, v, x, z, id;
        let tmp = [];
		let i = ar.length;
		let tempHeightLayers = []

    	while( i-- ) {
    		x = ar[i][0];
    		z = ar[i][1]; 
    		id = this.findHeightId(x, z)  

    		this.heightData[ id ] = y      
    		
    		layer = this.findLayer(x, z);

    		//v = this.findVertices( layer, [x, z] );//findVertices(layer, [x, z] );
            //this.Gtmp[layer][v] = y;
    		tempHeightLayers[layer] = 1;
    	}

    	// rebuild layers
    	i = tempHeightLayers.length;
    	while ( i-- ) {
    		if(tempHeightLayers[i] === 1) this.updateVertices( i );
    	}

	}

    updateVertices ( layer ){

    	let g = this.miniTerrain[ layer ].geometry;
    	//let ar = this.Gtmp[ layer ];

        let v = g.attributes.position.array;
        let c = g.attributes.color.array;
        let i = v.length/3, n, id;

        while(i--){ 

        	n = i*3;
        	id = this.findHeightId( v[n]+0.5, v[n+2]+0.5 )
        	v[n+1] = this.heightData[ id ];


        	/*v[n+1] = ar[i]; 
        	c[n+1] = 0; 	
        	c[n+2] = 0;*/ 
        }
 
        g.attributes.position.needsUpdate = true;
        //g.attributes.color.needsUpdate = true;
        //g.computeBoundingSphere();
        g.computeVertexNormals();

        //console.log('updated !!')

    }


	//------------------------------------------LAYER TOOL 8X8

	findLayer( x, y ) {
        let cx = Math.floor(x/16)
        let cy = Math.floor(y/16)
		return cx+(cy*this.layerW)
	}

	findLayerPos( x, y, layer ) {
		let cy = Math.floor(layer/this.layerW)
        let cx = layer-(cy*this.layerW)
		let py = y-(16*cy)
        let px = x-(16*cx)
        return [px,py]
	}

	findPosition( id ) {
		let y = Math.floor(id/this.mapSize[1])
		let x = id-(y*this.mapSize[1])
		return [x,y]
	}

	findId( x, y ) {
		return x+(y*this.mapSize[1])
	}

	findVertices( layer, pos ){
		let cy = Math.floor(layer/this.layerW)
        let cx = layer-(cy*this.layerW)
        let py = pos[1]-(16*cy)
        let px = pos[0]-(16*cx)
		return px + (py*16)
	}

	findHeightId( x, y ) {
    	return x+(y*(this.mapSize[0]+1))
    }


	//------------------------------------------RAY

	rayTest () {

		let intersects;

        this.raycaster.setFromCamera( this.rayVector, this.camera );

        /*if( this.isMenu && !this.inMapGeneration ){
        	
        	this.ui.noMouse();

        	intersects = this.raycaster.intersectObjects( this.scene.children );

        	if ( intersects.length > 0 ){
        		if( intersects[ 0 ].object.name === 'p1' ){
        			this.ui.setMouse( intersects[ 0 ].uv );
        		}
        	} 
        	
        }*/

		if ( this.land.children.length > 0 ) {
			intersects = this.raycaster.intersectObjects( this.land.children );
			if ( intersects.length > 0 ) {

				this.raypos.x = Math.round( intersects[0].point.x );
				this.raypos.z = Math.round( intersects[0].point.z );

				if( AppState.withHeight ) this.raypos.y = intersects[0].point.y;//Math.round( intersects[0].point.y );
				else this.raypos.y = 0;

				if( this.currentTool ){

					this.tool.position.set(this.raypos.x, this.raypos.y, this.raypos.z);

					//this.tool.position.set(this.raypos.x, this.raypos.y, this.raypos.z);
					if(this.mouse.click || this.mouse.drag){ 
						AppState.main.mapClick( this.currentTool.tool );

					}
					//if(this.mouse.click || this.currentTool.drag) mapClick();

					this.mouse.click=false;
				}
		    } else {
		    	this.raypos.x = -1;
		    	this.raypos.z = -1;
		    }
		}
	}


	//------------------------------------------TOOL

	selectTool ( id ) {

		this.tool.visible = false;
		this.raypos.x = -1;
		this.raypos.z = -1;

		if( id === 0 || id === 18){
			this.currentTool = null;
        	this.mouse.dragView = false;
        	this.mouse.move = true;
		} else if ( id === 16 ){
			this.currentTool = null;
        	this.mouse.move = false;
        	this.mouse.dragView = true;
		} else {
			this.currentTool = Base.toolSet[id];
			this.mouse.move = false;
			this.mouse.dragView = false;

			this.tool.visible = true;
			this.tool.color = this.currentTool.color;
			this.tool.resize = this.currentTool.size;

		}

        AppState.main.sendTool( Base.toolSet[id].tool );

	}


	//------------------------------------------BUILD

	build( x, y ) {
		
		if( this.currentTool.tool === 'query' ) return;

		if( this.currentTool.build ){

			let size = this.currentTool.size;
			let sizey = this.currentTool.sy;

			let py = 0;

            if( AppState.withHeight ) py = this.heightData[ this.findHeightId(x,y) ];

            // get full position of zone tiles
            const zone = Zone( size, x, y );
            const zoneExtand = ZoneExtand( size, x, y );

            // clear tree if existe in this zone
			this.removeTreePack( zone );

			// flat terrain 
			if( AppState.withHeight && size !== 1 ) this.makePlanar( zoneExtand, py );

			let v = this.currentTool.geo;

			// standard building
			if(v<4 && v!==0){
				this.snd_layzone.play();
				///this._spawnConstructionMarker(x, py, y, size);
				this.markers.spawn( this.tool )
				this.addBaseBuilding(x, py, y, v, zone);
			}
			// town building
			if(v==8 || v==9 || v==4 || v==5 || v==7 || v==10 || v==11 || v==12){	
				this.snd_layzone.play();
				//this._spawnConstructionMarker(x, py, y, size)
				this.markers.spawn( this.tool )
				this.addBaseTown(x,py,y,v,zone);
			}

		} else {

			this.removeTree(x,y);
			if( AppState.withHeight ){
                let py = this.heightData[this.findHeightId(x,y)];
			    this.makePlanar( [[x,y]],  py );
			}
			if( this.currentTool.tool === 'bulldozer' ){
				this.forceUpdate.x = x;
		        this.forceUpdate.y = y;
		        this.testDestruct(x,y);
		    }
		}
	}


	//--------------------------------------------------TEST DESTRUCT

	testLayer( x, y ) {

		let l = this.findLayer(x,y);
		let list = [l];
		let pos = this.findLayerPos(x,y,l);
		let a = 0,b = 0;

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
	}

	testDestruct( x, y ){

		let i, j, ar, ar2, l;
		let list = this.testLayer(x,y);

		for(let h= 0; h<list.length; h++){
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
							AppState.main.destroy(ar2[0][0], ar2[0][1]);
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
							AppState.main.destroy(ar2[0][0], ar2[0][1]);
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
	}

	showDestruct( ar ) {

		this.tempDestruct = ar[4];

	}

	//--------------------------------------------------TOWN BUILDING

	addBaseTown( x, y, z, v, zone ) {

		let layer = this.findLayer(x,z);
		if(!this.townLists[layer]) this.townLists[layer]=[];
    	this.townLists[layer].push([x,y,z,v,zone]);
    	this.rebuildTownLayer(layer);

	}

	rebuildTownLayer(l) {

        this.buildMeshLayer( l, 'town' );

	}

	//--------------------------------------------------HOUSE CREATE/UPDATE/DELETE

	addBaseHouse(x,y,z) {

		let layer = this.findLayer(x,z);
		let pos = [ [x, z], [x-1, z], [x+1, z], [x, z-1], [x-1, z-1], [x+1, z-1], [x, z+1], [x-1, z+1], [x+1, z+1] ];

		if(!this.houseLists[layer]) this.houseLists[layer]=[];
		let i = 9;
		while(i--){
			this.houseLists[layer].push([pos[i][0],y,pos[i][1], 0 ]);
		}
	}

	removeBaseHouse(x,y,z) {
		//console.log('h remove !!')
		let layer = this.findLayer(x,z);
		let pos = [ [x, z], [x-1, z], [x+1, z], [x, z-1], [x-1, z-1], [x+1, z-1], [x, z+1], [x-1, z+1], [x+1, z+1] ];
		let i = this.houseLists[layer].length, h, j;
		while(i--){
			h = this.houseLists[layer][i];
			j = 9;
			while(j--){
			    if(h[0] === pos[j][0] && h[2] === pos[j][1]) this.houseLists[layer].splice(i, 1);
		    }
		}
		this.rebuildHouseLayer(layer);
	}

	rebuildHouseLayer( l ) {

        this.buildMeshLayer( l, 'house' );

    }


	//--------------------------------------------------BUILDING CREATE/UPDATE

	addBaseBuilding ( x, y, z, v, zone ) {
		let layer = this.findLayer(x,z);
		let c = 244;
		if(v==2) c = 427;
		if(v==3) c = 616;

    	if(!this.buildingLists[layer]) this.buildingLists[layer]=[];
    	//this.buildingLists[layer].push([x,y,z,c, 0, zone]);
    	this.buildingLists[layer].push([x,y,z,c, zone, 0 ]);

    	this.rebuildBuildingLayer(layer);

    }

    rebuildBuildingLayer ( l ) {

        this.buildMeshLayer( l, 'building' );

    }


    //---------------------------------------------------BUILDING LISTING

    saveCityBuild(saveCity) {
    	
    	let l = this.nlayers;
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
    }

    loadCityBuild(saveCity) {
    	saveCity = JSON.parse(saveCity);
    	let l = this.nlayers;
    	let ldata;
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
    }



	// -----------------------
	//  MOUSE NAVIGATION
	// -----------------------

	dragMode (){
		return this.mouse.dragView || this.mouse.button === 3
	}

	Orbit ( origine, horizontal, vertical, distance ) {

	    let p = new THREE.Vector3();
	    if(vertical>87)vertical=87;
	    if(vertical<1)vertical=1;
	    let phi = vertical*this.ToRad;
	    let theta = horizontal*this.ToRad;
	    p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
	    p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
	    p.y = (distance * Math.cos(phi)) + origine.y;
	    return p;

	}

	moveCamera () {
		this.cameraNeedUpdate = true
	}

	updateCamera () {

		if(!this.cameraNeedUpdate) return;

		let far = this.cam.distance*4;
	    far = this.clamp(far, 20, 1000)
	    if(this.fog) this.fog.far = far

	    this.camera.position.copy(this.Orbit(this.center, this.cam.horizontal, this.cam.vertical, this.cam.distance));
	    this.camera.lookAt(this.center);

	    this.cameraNeedUpdate = false;

	}

	applyOrbitMomentum() {

	    if( this.orbitVelocityH === 0 && this.orbitVelocityV === 0 ) return;
	    if( this.mouse.down ) { this.orbitVelocityH = 0; this.orbitVelocityV = 0; return; }
	    this.cam.horizontal += this.orbitVelocityH;
	    this.cam.vertical   += this.orbitVelocityV;
	    // clamp vertical so momentum never flips camera past ground or zenith
	    if( this.cam.vertical > this.CAM_V_MAX ) { this.cam.vertical = this.CAM_V_MAX; this.orbitVelocityV = 0; }
	    if( this.cam.vertical < this.CAM_V_MIN ) { this.cam.vertical = this.CAM_V_MIN; this.orbitVelocityV = 0; }
	    this.orbitVelocityH *= 0.88;
	    this.orbitVelocityV *= 0.88;
	    if( Math.abs(this.orbitVelocityH) < 0.01 ) this.orbitVelocityH = 0;
	    if( Math.abs(this.orbitVelocityV) < 0.01 ) this.orbitVelocityV = 0;

	    this.moveCamera();

	}

	dragCenterposition (){

		if ( this.ease.x == 0 && this.ease.z == 0 ) return;
    	this.easeRot.y = this.cam.horizontal*this.ToRad;
    	//let rot = this.unwrapDegrees(Math.round(this.cam.horizontal));
        this.easeRot.x = Math.sin(this.easeRot.y) * this.ease.x + Math.cos(this.easeRot.y) * this.ease.z;
        this.easeRot.z = Math.cos(this.easeRot.y) * this.ease.x - Math.sin(this.easeRot.y) * this.ease.z;

    	this.center.x += this.easeRot.x; 
    	this.center.z -= this.easeRot.z; 

    	if(this.center.x<0) this.center.x = 0;
    	if(this.center.x>this.mapSize[0]) this.center.x = this.mapSize[0];
    	if(this.center.z<0) this.center.z = 0;
    	if(this.center.z>this.mapSize[1]) this.center.z = this.mapSize[1];
    	
        this.moveCamera();

	}

	/*onMouseDown  (e) {   

		e.preventDefault();
	    let px, py;
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
	   
	}*/

	// Apply a world-space pan offset (dx, dz in screen-space units) without
	// disturbing the shared this.ease vector.
	panCenter ( dx, dz ) {

	    const ry = this.cam.horizontal * this.ToRad;
	    const wx =  Math.sin(ry) * dx + Math.cos(ry) * dz;
	    const wz =  Math.cos(ry) * dx - Math.sin(ry) * dz;
	    this.center.x = this.clamp( this.center.x + wx, 0, this.mapSize[0] );
	    this.center.z = this.clamp( this.center.z - wz, 0, this.mapSize[1] );
	    this.moveCamera();

	}

	onMouseDown  (e) {

		e.preventDefault();
	    let px, py;
	    if(e.touches){
	        // two-finger gesture: track pinch-start and mid-point for zoom+pan
	        if(e.touches.length === 2){
	            this.pinchStartDist = Math.hypot(
	                e.touches[0].pageX - e.touches[1].pageX,
	                e.touches[0].pageY - e.touches[1].pageY
	            );
	            this.pinchStartCamDist = this.cam.distance;
	            this.pinchMidX = (e.touches[0].pageX + e.touches[1].pageX) * 0.5;
	            this.pinchMidY = (e.touches[0].pageY + e.touches[1].pageY) * 0.5;
	            return;
	        }
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
	        this.rayTest();

	    }

	    

	}

	onMouseUp  (e) {

		e.preventDefault();

		if(this.currentTool && this.mouse.button===3 && this.ease.x===0 && this.ease.y === 0 ){
	    	this.tool.position.set(-1, -1, -1);
	    	AppState.hub.resetTool()
	    }

		this.mouse.button = 0;
	    this.mouse.down = false;
	    this.mouse.drag = false;
	    if(this.currentTool==null)this.mouse.move = true;
	    this.ease.x = 0;
	    this.ease.z = 0;
	    this.pinchStartDist = 0;
	    this.pinchMidX = 0;
	    this.pinchMidY = 0;
	    document.body.style.cursor = 'auto';

	}

	onMouseMove  (e) {

	    e.preventDefault();

	    let px, py;
	    if(e.touches){
	        // two-finger gesture: pinch zoom + midpoint pan
	        if(e.touches.length === 2 && this.pinchStartDist > 0){
	            const d = Math.hypot(
	                e.touches[0].pageX - e.touches[1].pageX,
	                e.touches[0].pageY - e.touches[1].pageY
	            );
	            // zoom via pinch
	            this.cam.distance = this.clamp( this.pinchStartCamDist * (this.pinchStartDist / d), 1, 150 );
	            // pan via midpoint shift
	            const midX = (e.touches[0].pageX + e.touches[1].pageX) * 0.5;
	            const midY = (e.touches[0].pageY + e.touches[1].pageY) * 0.5;
	            const panScale = this.clamp( this.cam.distance / 2000, 0.0005, 0.08 );
	            this.panCenter( (midX - this.pinchMidX) * panScale, (midY - this.pinchMidY) * panScale );
	            this.pinchMidX = midX;
	            this.pinchMidY = midY;
	            return;
	        }
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
		        const newH = ((px - this.mouse.ox) * 0.3) + this.mouse.h;
		        const newV = this.clamp( (-(py - this.mouse.oy) * 0.3) + this.mouse.v, this.CAM_V_MIN, this.CAM_V_MAX );
		        this.orbitVelocityH = newH - this.cam.horizontal;
		        this.orbitVelocityV = newV - this.cam.vertical;
		        this.cam.horizontal = newH;
		        this.cam.vertical = newV;
		        this.moveCamera();
		    }
		    if(this.mouse.dragView || this.mouse.button===3){
		    	document.body.style.cursor = 'move';
		    	this.mouse.move = false;
		    	this.ease.x = (px - this.mouse.ox)/1000;
		    	this.ease.z = (py - this. mouse.oy)/1000;
		    }
	    }

	    if(this.currentTool !== null || this.isMenu ){
			this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
		    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
			this.rayTest();
		}
	}


	onMouseWheel  (e) {
		//e.preventDefault();
	    let delta = 0;
	    if(e.deltaY !== undefined){ delta = e.deltaY; }
	    else if(e.wheelDelta){ delta = e.wheelDelta * -1; }
	    else if(e.detail){ delta = e.detail * 20; }
	    // scale zoom speed proportionally to current distance so close-up is precise
	    const sensitivity = this.clamp( this.cam.distance / 50, 0.2, 4 );
	    this.zoomVelocity += (delta / 80) * sensitivity;

	}

	applyZoomInertia() {

	    if( this.zoomVelocity === 0 ) return;
	    this.cam.distance += this.zoomVelocity;
	    this.zoomVelocity *= 0.82;
	    if( Math.abs(this.zoomVelocity) < 0.05 ) this.zoomVelocity = 0;
	    if( this.cam.distance < 1 ) { this.cam.distance = 1; this.zoomVelocity = 0; }
	    if( this.cam.distance > 150 ) { this.cam.distance = 150; this.zoomVelocity = 0; }
	    this.moveCamera();
	    
	}


	// -----------------------
	//  GROUND TEXTURE 
	// -----------------------

	paintMap ( mapSize, island = false ) {

		if(AppState.debugTime) console.time("PaintMap");

		// reset to default texture
		//this.material.resetLandMaterial()
		//AppState.firstDraw = false;
		
		this.isIsland = island;

		if( mapSize ){ 
			if(this.mapSize[0] !== mapSize[0]) this.resizeBorderGenerator(mapSize[0])
			this.mapSize = mapSize;
			this.layerW = Math.ceil(mapSize[0] / 16);
			this.layerH = Math.ceil(mapSize[1] / 16);

		}

		if( this.basePlane ) this.scene.remove( this.basePlane )

		//this.clearTerrain()
		this.clearAllTrees()
		this.clearHeight()



		if( AppState.withHeight ) this.generateHeight()

		
		let y = this.mapSize[1];
		let x, v, px, py, n = AppState.tilesData.length, cy, cx, layer, ar, r, ty = 0, id;

		while( y-- ){
			x = this.mapSize[0];
			while( x-- ){

				// find layer
				cy = Math.floor(y/16);
                cx = Math.floor(x/16);
				layer = cx+(cy*this.layerW);

				n--;
				v = AppState.tilesData[n];

				if( AppState.withHeight ){

					if( v > 1 && v < 5 ){ // water
						id = this.findHeightId(x, y)
						this.heightData[ id ] = -Math.pow(this.heightData[ id ]* AppState.seaMulty, AppState.seaPow) 
						//this.heightData[ id ] *= -1;
						if( x === this.mapSize[0]-1 ) this.heightData[ id+1 ] *= -1;
						if( y === this.mapSize[1]-1 ) this.heightData[ id+this.mapSize[1] ] *= -1;
						//AppState.tilesData[n] = 0 
					}
	                if( v > 4 && v < 21 ){ // water border

	                	let d = AppState.heightBorder

	                	id = this.findHeightId(x, y)
	                    //this.heightData[ this.findHeightId(x, y) ] *= 0.5;
	                	let zz = Zone(0,x,y,v)
	                	let baseY = this.heightData[ this.findHeightId(x, y) ]

	                	if(v===13 || v===14){
	                		this.heightData[ id ] = -d
	                		this.heightData[ id+1 ] = -d
	                	}
	                	if(v===9 || v===10){
	                		this.heightData[ id ] = -d
	                		this.heightData[ this.findHeightId(x, y+1) ] = -d
	                	}
	                	if(v===11 || v===12){
	                		this.heightData[ id ] = -d
	                	}

	                	if(v===7 || v===8){
	                		this.heightData[ this.findHeightId(x, y+1) ] = 0
	                	}

	                	if(v===15 || v===16){
	                		this.heightData[ this.findHeightId(x+1, y) ] = 0
	                	}

	                	
	                    let w = zz.length, wn
	                    while(w--){
	                    	wn = this.findHeightId(zz[w][0], zz[w][1])
	                    	if(wn) this.heightData[ wn ] = d//*0.75// this.heightData[ wn ]+0.5;

	                    }
	                }
	            }
				if( v > 20 && v < 30 ){// tree 44

					if( AppState.withHeight ) ty = this.heightData[ this.findHeightId(x, y) ]-0.1;

					r = v-21;
					if(r===8) r = Math.floor(Math.random()*7)//r=8// big middle tree

					if( AppState.withHeight && ty > 0.5 ){
						if( x===0 || y===0 || x===this.mapSize[0]-1 || y===this.mapSize[0]-1) ty = 0.5
					}

					this.addTree( x, ty, y, r, layer );
					this.treeValue[n] = v;

			    } 
				
			}
		}


		this.initTerrain();



		if(AppState.debugTime) console.time("drawLayer");
		//this.pauseRender = true;
		let i = this.nlayers;
	    while(i--){ 
	    	this.drawLayer( i, true )
	    }
	    //this.pauseRender = false;
	    if(AppState.debugTime) console.timeEnd("drawLayer");
		
		this.populateTree();
		
		if(this.fullRedraw){
			this.fullRedraw = false;
		}

		if(AppState.debugTime) console.timeEnd("PaintMap");

		this.inMapGeneration = false;

	}

	initLayer() {

		let i = this.nlayers;
	    while(i--){
			this.tempHouseLayers[i] = 0;	
			this.tempBuildingLayers[i] = 0;
		}

	}

	updateLayer() {

		let i = this.nlayers;

	    while(i--){ 

	    	if( AppState.layerData[i] === 1 ) this.drawLayer( i )
	    	if(this.tempHouseLayers[i] === 1){ this.rebuildHouseLayer(i); this.tempHouseLayers[i] = 0 }
	    	if(this.tempBuildingLayers[i] === 1){ this.rebuildBuildingLayer(i); this.tempBuildingLayers[i] = 0; }

	    }

	}

	drawLayer ( layer, full = false ){

		let y = 16, x, v, n, cy, cx, ar, i, vx, vy, g;
		const ly = Math.floor(layer/this.layerW);
		const lx = layer-(ly*this.layerW);

		const pix = 32;
		const mid = pix * 0.5;

		const render = AppState.isWebGPU ? renderer : renderer.backend; 
		
		while( y-- ){
			x = 16;
			while(x--){

				vx = (lx*16)+x
                vy = (ly*16)+y

				n = vx+(vy*this.mapSize[1])
				v = AppState.tilesData[n];

				g = v < 240 ? v : 0;

				if( !full && v === this.oldData[n] ) continue;
                this.oldData[n] = v;

                if( g < 240 ){

                	let draw = true

                	if(g<1) draw = false // not ground 
                	if(g>20 && g<30) draw = false // not tree

                	if( this.currentTool ) draw = true

                	if(draw){
                		tmpPos.x = x*mid*this.mu;
	                	tmpPos.y = (240 - y*mid)*this.mu;

	                	// apply tile change
	                	render.copyTextureToTexture( this.pool.tile('texture', g), MAT_LAND[layer].map, null, tmpPos );
	                	if( AppState.isWithNormal ) render.copyTextureToTexture( this.pool.tile('normal', g), MAT_LAND[layer].normalMap, null, tmpPos );
	            		if( AppState.isWithRoughness ) render.copyTextureToTexture( this.pool.tile('roughness', g), MAT_LAND[layer].roughnessMap, null, tmpPos );


	            		//if(layer === 1) console.log(MAT_LAND[layer].map)
                	}

                	
            		/*
            		render.copyTextureToTexture( this.pool.tile('texture', g), this.terrainTxt[layer], null, tmpPos );
                	if( AppState.isWithNormal ) render.copyTextureToTexture( this.pool.tile('normal', g), this.terrainTxtN[layer], null, tmpPos );
            		if( AppState.isWithRoughness ) render.copyTextureToTexture( this.pool.tile('roughness', g), this.terrainTxtR[layer], null, tmpPos );
            		*/
            	
	            }

	            if( v > 239 ){

	            	// MESH BUILD
	            	if((v>248 && v<261) || v==0){
            			if(this.houseLists[layer]){
            				i = this.houseLists[layer].length;
	                		while(i--){
	                			ar = this.houseLists[layer][i];
	                			if( ar[0] === vx && ar[2] === vy ){ 
		                			if( ar[3] !== v ){
		                				this.houseLists[layer][i][3] = v;
			                			this.tempHouseLayers[layer] = 1;
		                			}
		                		}
	                		}
            			}
            		} else {
                		if(this.buildingLists[layer]){
	                		i = this.buildingLists[layer].length;
	                		while(i--){
	                			ar = this.buildingLists[layer][i];
	                			if( ar[0] === vx && ar[2] === vy ){ 
	                				if( ar[3] !== v ){
		                				this.buildingLists[layer][i][3] = v;
		                				this.tempBuildingLayers[layer] = 1;
		                			}
	                			}
	                		}
	                	}
	                }

	            }

			}
		}

		//this.pauseRender = false
	}


	// -----------------------
	//  SPRITE
	// -----------------------

	moveSprite () {

		if(!AppState.spriteData) return

		let i = AppState.spriteData.length;
		let pos = new THREE.Vector3();
		let v, frame, c;

		while(i--){
			c = AppState.spriteData[i]
			frame = c[1]
			v = c[0]
			pos.x = Math.round((c[2]-8)/16);
			pos.z = Math.round((c[3]-8)/16);
			pos.y = 0;


            if( AppState.withHeight ) pos.y = this.heightData[ this.findHeightId(pos.x,pos.z) ];
            

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
	}

	rotationSprite ( v, f ) {

		let r = 0;
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
		return r

	}

	addSprite ( v, p ) {

		let m;
		if(v===1){// train
			m = new THREE.Mesh(this.pool.geo('sprite',0), MAT.town );
            //m.scale.set(1, 1, -1 )
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		    //this.spriteObjs[this.spriteLists[v]] = m;
		}else if(v===2){// elico
			m = new THREE.Mesh(this.pool.geo('sprite',1), MAT.town );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		}else if(v===3){// plane
			m = new THREE.Mesh(this.pool.geo('sprite',2), MAT.town );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		} else {
			m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), MAT.town );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		}
		return m;

		//this.spriteObjs[this.spriteLists[v]] = m;
	}



	// -----------------------
	//  POWER SPRITE                                                  
	// -----------------------

	showPower (){

		let i = AppState.powerData.length, pos;
		while(i--){
			if(AppState.powerData[i]===0) continue;//{ if( this.powerMeshs[i] !== null ) this.removePowerMesh(i); }
			else if(AppState.powerData[i]===2){ if(this.powerMeshs[i] == null) this.addPowerMesh(i, this.findPosition(i)); }
			else if(AppState.powerData[i]===1){ if(this.powerMeshs[i] !== null) this.removePowerMesh(i); }
		}

	}

	addPowerMesh ( i, ar ) {

		let py = 0;

        if( AppState.withHeight ) py = this.heightData[ this.findHeightId(ar[0],ar[1])];

		let m = new THREE.Sprite( MAT.power );
		//m.scale.set( 2, 2, 1 );
		m.position.set(ar[0], py+1, ar[1]);
		this.scene.add(m);
		this.powerMeshs[i] = m;
	}

	removePowerMesh ( i ) {
		this.scene.remove(this.powerMeshs[i]);
     	this.powerMeshs[i] = null;
	}


	// -----------------------
	//  KEYBOARD
	// -----------------------

	updateKey (){

		if( AppState.isMobile ) return;

		let f = 0.3, d = false;

		if(this.key[0] == 1 || this.key[1] == 1 ){ 
			if(this.key[0] == 1) this.ease.z = -f; 
			if(this.key[1] == 1) this.ease.z = f;
			d = true;
		}
		else this.ease.z = 0;

		if(this.key[2] == 1 || this.key[3] == 1 ){ 
			if(this.key[2] == 1) this.ease.x = -f; 
			if(this.key[3] == 1) this.ease.x = f;
			d = true;
		}
		else this.ease.x = 0;
		if( d ) this.dragCenterposition();

	}

	/*bindKeys (){

		let _this = this;

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

	}*/

	bindKeys (){

		let _this = this;

		document.addEventListener('keydown', function(e) {
			switch ( e.code ) {
			    case 'ArrowUp':    case 'KeyW': case 'KeyZ': _this.key[0] = 1; break; // up, W, Z
				case 'ArrowDown':  case 'KeyS':              _this.key[1] = 1; break; // down, S
				case 'ArrowLeft':  case 'KeyA': case 'KeyQ': _this.key[2] = 1; break; // left, A, Q
				case 'ArrowRight': case 'KeyD':              _this.key[3] = 1; break; // right, D
			}
		}, false);
		document.addEventListener('keyup', function(e) {
			switch ( e.code ) {
				case 'ArrowUp':    case 'KeyW': case 'KeyZ': _this.key[0] = 0; break; // up, W, Z
				case 'ArrowDown':  case 'KeyS':              _this.key[1] = 0; break; // down, S
				case 'ArrowLeft':  case 'KeyA': case 'KeyQ': _this.key[2] = 0; break; // left, A, Q
				case 'ArrowRight': case 'KeyD':              _this.key[3] = 0; break; // right, D
			}
		}, false);
	    self.focus();

	}


	// ── Overlay Modes ────────────────────────────────────────────────────────
	// Switch the active map overlay (power, crime, pollution, traffic, none).
	// Currently the power overlay is always visible when power data is present;
	// this method stores the requested mode and extends that logic in future.
	setOverlayMode ( type ) {

		this.overlayMode = type || 'none';

	}


}