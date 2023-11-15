import * as THREE from '../../build/three.module.js'
import * as UIL from '../../build/uil.module.js'
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../jsm/loaders/RGBELoader.js';
import { ImprovedNoise } from '../jsm/math/ImprovedNoise.js';
//import { BufferGeometryUtils } from './jsm/utils/BufferGeometryUtils.js';

import { Main } from '../Main.js';

import { Base } from './Base.js';
import { BuildTool } from './BuildTool.js';
import { Pool } from './Pool.js';


import { TrafficBase } from '../TrafficBase.js'

//let Audio;

export class View {

	constructor ( isMobile, Hub, pix, isLow ) {

		this.container = document.getElementById( 'container' );

		this.mapPath = './assets/textures/'
		this.modelPath = './assets/models/'
		this.rootModel = this.modelPath + 'world.glb';

		this.hub = null;

		this.isMenu = false;

		this.inMapGenation = false;

		this.isPixelStyle = false;

	    this.metalness = 0.6;
	    this.roughness = 0.3;
	    this.wireframe = false;

	    this.loadGame = null


	    this.M_list = ['treeLists'     , 'townLists'     , 'houseLists'       , 'buildingLists' ];
	    this.M_temp = ['tempTreeLayers', 'temptownLayers', 'tempHouseLayers'  , 'tempBuildingLayers' ];
	    //this.M_geom = ['treeGeo'       , 'buildingGeo'   , 'houseGeo'         , 'X' ];
	    this.M_mesh = ['treeMeshs'     , 'townMeshs'     , 'houseMeshs'       , 'buildingMeshs' ];
	    this.M_mats = ['townMaterial'  , 'townMaterial'  , 'buildingMaterial' , 'buildingMaterial' ];
		
		this.pix = window.devicePixelRatio;
		if( this.pix > 2 ) this.pix = 2;

		this.isLow = isLow || false;
		
		this.isMobile = isMobile || false;

		this.ARRAY_TYPE = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

		this.isWithTree = true;
	    this.isWithLight = true;

	    this.isStandardMaterial = true;

		this.isWithEnv = true;
	    this.isWithNormal = true;
	    this.isWithRoughness = true
		this.isWithFog = true;
		this.isIsland = false;
		this.isWinter = false;

		this.isComputeVertex = true;
		this.isTransGeo = true;

		//this.tmpCanvas = null;
		//this.tilesDataNormal = [];
		//this.tilesDataTextures = [];

		this.key = [0,0,0,0,0,0,0];

		this.oldData = [];

		this.tileSize = 64//64;
		

		if(this.isMobile || this.isLow){ 
			this.pix = 1
	        this.isWithTree = false;
	        this.isWithEnv = false;
	        this.isWithNormal = false;
	        this.isWithLight = false;
	        this.tileSize = 32;
	    }

	    this.mu = this.tileSize === 64 ? 4 : 2;

		this.f = [0,0,0];
		this.stats = [0,0];
		this.isWithStats = false;


		this.dayTime = 0;

		this.tcolor = {r:10, g: 15, b: 80, a: 0.9};

		this.snd_layzone = new Audio("./sound/layzone.mp3");

		this.imgSrc = ['tiles'+this.tileSize+'.png','town.jpg','building.jpg','building_win.png','town_win.png' ];
		if( this.isWithNormal ) {
			this.imgSrc.push( 'building_n.png', 'town_n.png', 'tiles'+this.tileSize+'_n.png' )
		}
		this.imgSrcPlus = ['tiles'+this.tileSize+'_w.png','town_w.jpg','building_w.jpg'];

		let j = this.imgSrc.length
		while(j--) this.imgSrc[j] = this.mapPath + this.imgSrc[j]

		j = this.imgSrcPlus.length
		while(j--) this.imgSrcPlus[j] = this.mapPath + this.imgSrcPlus[j]

		this.winterMapLoaded = false;

	    this.tmpGameData = null

	
		this.imgs = [];
		this.num = 0;

		this.fullRedraw = false;

		this.isWithBackground = false;
		this.isWithHeight = false;
		

		// camera
		this.ToRad = Math.PI / 180;
	    this.camera = null;


	    this.scene = null; 
	    this.renderer = null;
	    this.timer = null;


	    this.miniTerrain = [];
	    this.terrainTxt = [];
	    this.terrainTxtN = [];
	    this.terrainTxtR = [];

	    this.forceUpdate = { x:-1, y:-1 };

	    this.cam = { horizontal:90, vertical:60, distance:120 };
	    this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
	    this.mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, dx:0, dy:0, down:false, over:false, drag:false, click:false, move:true, dragView:false, button:0 };
	    this.raypos =  {x:-1, y:0, z:-1};

	    this.select = '';
	    this.meshs = {};

	    this.mapSize = [128,128];
	    this.nlayers = 64;

	    //this.terrain = null;

	    this.tool = null;

		this.currentTool = null;

		this.heightData = null;
		
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
		//this.groundCanvas = null;
		this.skyCanvas = null;
		this.skyCanvasBasic = null;

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


		this.tempDestruct = [];

		this.currentLayer = 0;

		this.needResize = false;

		this.env = null

		this.ease_p = -1
		this.onEase = null;
		

		this.spriteLists = ['train', 'elico', 'plane', 'boat', 'monster', 'tornado', 'sparks'];
		//this.spriteLists = [];
		this.spriteMeshs = [];
		this.spriteObjs = {};

		this.terrainMaterials = []


		this.pool = new Pool( function() {this.done()}.bind(this), this.tileSize, this.isWithNormal, this.isWithRoughness, this.isPixelStyle )


	}

	preIntro() {

		this.center.x = 19*0.5;
        this.center.z = 19*0.5;
        this.cam.distance = 30
        this.moveCamera();

		this.addBorder()

		const cgeo = new THREE.PlaneGeometry( 19, 19, 3, 3 );
		cgeo.rotateX( -Math.PI * 0.5 );
  
        this.basePlane = new THREE.Mesh( cgeo, this.planeMat );
        this.basePlane.position.copy( this.center )
        this.scene.add( this.basePlane );

        this.title = this.pool.title;
        this.title.material = this.titleMat

        
        
        this.title.position.copy( this.center )
        this.scene.add( this.title )


        // traffic map 
        this.traffic = new TrafficBase({ isStandard:this.isStandardMaterial })
	    this.scene.add( this.traffic )

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

        this.plane = new THREE.Mesh( new THREE.PlaneGeometry( 18, 4.5, 5, 1 ), new THREE.MeshBasicMaterial( { transparent:true, alphaToCoverage: true } ) );
		this.plane.geometry.rotateX( -Math.PI * 0.4 );
		this.plane.position.copy(this.center)
		this.plane.position.y = 0.8
		this.plane.position.z = 19+3.2
	    this.plane.name = 'p1';
	    this.scene.add( this.plane )

	    UIL.Tools.setStyle({
			fontFamily: 'sans-serif',
			fontWeight:'bold',
			fontShadow: 'none',
			button : '#c1cbd7',
			overoff : '#223143',
			over : '#6c819a',
			select : '#45586f',
			text : '#223143',
			textOver : '#FFFFFF',
			border: '#6c819a',
			borderSize: 3,
			fontSize: 20,
		})

        this.ui = new UIL.Gui( { w:512, maxHeight:128, parent:null, isCanvas:true, close:false, transparent:true, plane:this.plane } )
        let gg = this.ui.add('grid', { values:['NEW','LOAD'], selectable:false, bsize:[200, 40 ], spaces:[ 18,2 ], radius:40 }).onChange( this.openMap.bind(this) );

        //let loaderButton = gg.c[3]

       //console.log(loaderButton)
        //loaderButton.type = "file";
       // loaderButton.addEventListener( 'change', function(e){ this.fileSelect( e.target.files[0] ); }.bind(this), false );
        
        this.ui.onDraw = function () {

	        if( this.screen === null ){

	            this.screen = new THREE.Texture( this.canvas );
	            //this.screen.minFilter = THREE.LinearFilter;
	            this.screen.encoding = THREE.sRGBEncoding;
	            this.plane.material.map = this.screen;
	            this.plane.material.needsUpdate = true;
	            
	        }
	            
	        this.screen.needsUpdate = true;

	    }

	    this.isMenu = true;

	}

	fileSelect( e ){

		hub.generate( true );
        this.inMapGenation = true;

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

		if( this.isMobile && type==='LOAD' ){ 
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

		this.isMenu = false;

		this.ease_p = 0;
		this.onEase = this.easing;

		this.scene.remove( this.title )
		this.scene.remove( this.plane )

		this.traffic.clearAll()
		this.scene.remove( this.buildings )

		this.ui.clear()

	}

	endOpen() {

		if( this.command === 'LOADDONE' ){

			//this.loadGame( e.target.result )

			//this.paintMap()

			this.isMenu = false;
			setTimeout( function(){ this.ui.dispose() }.bind(this), 100 )

			Main.loadGame( true )


		}

		if( this.command === 'NEW' ){
		
		    Main.newMap('NEW')

		    this.scene.add( this.plane )
		    this.plane.position.copy(this.center)
		    this.plane.position.y = 4
		    this.plane.position.z = 128-5
		    this.isMenu = true;

		    this.plane.scale.set(4,4,4)

		    this.ui.add('grid', { values:['NEW','HIGH'], selectable:false, bsize:[140, 30 ], spaces:[ 18,2 ], radius:30 }).onChange(  function(t){ setTimeout( Main.newMap, 1000, t ) } );
		    this.ui.add('selector', { name:'', h:30, values:['LOW', 'MEDIUM', 'HARD'], radius:30, value:'MEDIUM', p:0 }).onChange( Main.setDifficulty )
		    this.ui.add('button', { name:'PLAY THIS MAP', h:40, radius:40, p:20, forceWidth: 300 }).onChange( this.startPlay.bind(this) );

		}

	}

	startPlay(){

		this.isMenu = false;
		if(this.plane) this.scene.remove( this.plane )
		setTimeout( function(){ this.ui.dispose() }.bind(this), 100 )

		//
		
		Main.playMap()

	}

	easing() {

		let v = this.ease_p;
		if( v >= 1 ) {
			this.onEase = null
			v = 1;
			this.endOpen()
		}

		let p = 19*0.5
		this.center.x = this.center.z = p + ( (this.mapSize[0]*0.5) - p ) * v;
		this.cam.distance = 40 + ( 150 - 40 ) * v;
        this.moveCamera();

        this.basePlane.position.copy( this.center )
        let s = 1 + ( (128/19) - 1 ) * v;
        this.basePlane.scale.set( s, 1, s )

		this.border.morphTargetInfluences[ 0 ] = 1 - v

		this.ease_p = v + 0.01

	}



	//----------------------------------- BORDER

	addBorder() {

		this.border = this.pool.border;
		this.border_m = this.pool.border_min;
		this.border_m.position.set( 0, 0, 0 )
        this.border.position.set( 0, 0, 0 )
        this.scene.add( this.border )

        this.border.material = this.borderMat
        this.border.geometry.morphAttributes.position = [ this.border_m.geometry.attributes.position ]
        this.border.updateMorphTargets();
        this.border.morphTargetInfluences[ 0 ] = 1;

	}

	done() {



		//console.log( 'pool full loaded !!!' )

		this.init();
		this.createMaterial()

		Main.start();

	}

	createMaterial() {

		this.colors = {
			ground: new THREE.Color( this.pool.color.ground ).convertSRGBToLinear(),
			metal: new THREE.Color( this.pool.color.metal ).convertSRGBToLinear(),
			sky: new THREE.Color( this.pool.color.sky ).convertSRGBToLinear()
		}

		let i = this.nlayers; 
		let option = this.isStandardMaterial ? { roughness:1, metalness:1, envMapIntensity:1 } : {}
		let Type = this.isStandardMaterial ? THREE.MeshStandardMaterial : THREE.MeshBasicMaterial;

		while(i--){ 
			this.terrainMaterials[i] = new Type({ color:0xffffff, vertexColors:true, ...option })
			this.modifyShader( this.terrainMaterials[i] )
		}

        this.townMaterial = new Type( { map: this.pool.texture('town'), ...option } );
        this.modifyShader( this.townMaterial )
        this.buildingMaterial = new Type( { map: this.pool.texture('building'), ...option } ) 
        this.modifyShader( this.buildingMaterial )

        this.titleMat = new Type( { map: this.pool.makeTitleTexture(), ...option } ) 
        if( this.isStandardMaterial ){ 
        	this.titleMat.roughnessMap = this.pool.makeTitleTexture(1)
        	this.titleMat.emissiveMap = this.pool.makeTitleTexture(2)
        	this.titleMat.emissive =  new THREE.Color( 0x666622 )
        }
        this.modifyShader( this.titleMat )

        if( this.isStandardMaterial ) option.roughness = 0
        this.waterMat = new Type({ color:0x645cab, transparent:true, opacity:0.8, ...option })

        if( this.isStandardMaterial ) { option.roughness = 0.2;  option.metalness = 0.8 }
        //this.borderMat = new Type({ map:this.pool.texture('border'), alphaMap:this.pool.texture('border_a'), transparent:true, ...option })
        this.borderMat = new Type({ color:this.colors.metal , alphaMap:this.pool.texture('border_a'), transparent:true, ...option })

        if( this.isStandardMaterial ) { option.roughness = 0.8;  option.metalness = 0.2 }
        this.planeMat = new Type({ color:this.colors.ground, depthWrite:false, ...option })


        if( this.isStandardMaterial ){

        	if( this.isWithRoughness ){
	        	this.townMaterial.roughnessMap = this.pool.texture('town_r');
	        	this.buildingMaterial.roughnessMap = this.pool.texture('building_r');
	        }

	        if( this.isWithNormal ){
	        	this.townMaterial.normalMap = this.pool.texture('town_n');
	        	this.buildingMaterial.normalMap = this.pool.texture('building_n');
	        }

        }

        this.powerMaterial = new THREE.SpriteMaterial({ map:this.powerTexture(), transparent:true, depthTest: false, toneMapped:false })

        this.preIntro() 

	}

	modifyShader( m ) {

		if( !this.isStandardMaterial ) return

		m.onBeforeCompile = function ( s ) {
	        s.fragmentShader = s.fragmentShader.replace( '#include <metalnessmap_fragment>', `
	            float metalnessFactor = metalness;
	            #ifdef USE_ROUGHNESSMAP
	            metalnessFactor *= 1.0 - texelRoughness.g;
	            #endif
	        `);
	    }

	}

	


	//----------------------------------- INIT

    init () {

    	this.tmpPos = new THREE.Vector2( 0, 0 );

    	//if(this.isMobile) this.pix = 0.5;
    	//this.clock = new THREE.Clock();

    	this.scene = new THREE.Scene();
    	

    	this.camera = new THREE.PerspectiveCamera( 50, this.vsize.z, 0.1, 1000 );
    	this.scene.add( this.camera );

    	this.rayVector = new THREE.Vector2( 0, 0 );
    	this.raycaster = new THREE.Raycaster();
    	
        this.land = new THREE.Group();
        this.scene.add( this.land );

        if( this.isWithFog ){

        	//this.fog = new THREE.Fog( 0xCC7F66, 1, 100 );
        	this.fog = new THREE.Fog( 0x90a3b7, 1, 100 );
        	this.scene.fog = this.fog;
        
        }

        this.center = new THREE.Vector3();
        this.center.x = this.mapSize[0]*0.5;
        this.center.z = this.mapSize[1]*0.5;
        this.moveCamera();

        this.ease = new THREE.Vector3();
        this.easeRot = new THREE.Vector3();


         //this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, antialias:false });
    	let renderer = new THREE.WebGLRenderer({ antialias:false });
        renderer.setSize( this.vsize.x, this.vsize.y );
        renderer.setPixelRatio( this.pix )
    	//renderer.sortObjects = false;
    	//renderer.sortElements = false;
    	//renderer.autoClear = this.isWithBackground;

    	renderer.outputEncoding = THREE.sRGBEncoding
    	renderer.toneMapping = THREE.ACESFilmicToneMapping
    	//renderer.physicallyCorrectLights = true
    	renderer.toneMappingExposure = 1.0

    	this.anisotropy = renderer.capabilities.getMaxAnisotropy();

    	//this.renderer.autoClear = false;
        this.container.appendChild( renderer.domElement );

        this.renderer = renderer

        if( this.isWithEnv ){

        	let envmap = this.pool.env;
        	let pmremGenerator = new THREE.PMREMGenerator( renderer );
    	    this.env = pmremGenerator.fromEquirectangular( envmap ).texture;
    	    this.scene.background = this.env;
			this.scene.environment = this.env;
    	    envmap.dispose()
    	    pmremGenerator.dispose()

        }


        if( this.isWithLight ){

            /*let light = new THREE.DirectionalLight( 0xffffff, 0.5 );//new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 10, 2 );
            light.position.set(  this.center.x+100 , 300, this.center.z-100 );
            light.target.position.set( this.center.x, this.center.y, this.center.z );
            this.scene.add( light );*/

            //let hemiLight = new THREE.HemisphereLight( 0xCC7F66, 0xEFEFFF, 0.8 );
            //let hemiLight = new THREE.HemisphereLight( 0xffff00, 0xff8000, 1 );
            //hemiLight.color.setHSL( 0.6, 1, 0.6 );
            //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
           // hemiLight.position.set( 0, 20, 0 );
            //this.scene.add( hemiLight );


            //this.hemiLight = hemiLight;



            /*let pointLight = new THREE.PointLight( 0xFFFFFF, 1 );
            pointLight.position.set( this.center.x, 10, this.center.x );
            this.scene.add( pointLight );*/

            //this.scene.add( new THREE.AmbientLight( 0xcc7f66 ) );


        }
    	
    	//let _this = this;
    

        if( this.isWithBackground ){

        	this.skyCanvasBasic = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','#A7DCFA', 'deepskyblue']]);
        	this.skyCanvas = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','#A7DCFA', 'deepskyblue']]);
        	this.skyTexture = new THREE.Texture(this.skyCanvas);
        	this.skyTexture.encoding = THREE.sRGBEncoding
		    this.skyTexture.needsUpdate = true;
            this.back = new THREE.Mesh( new THREE.IcosahedronGeometry(300,1), new THREE.MeshBasicMaterial( { map:this.skyTexture, side:THREE.BackSide, depthWrite: false, fog:false }  ));
            this.scene.add( this.back );
            //this.renderer.autoClear = false;

        } else {

        	this.renderer.setClearColor( this.pool.color.sky, 1 );

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

        this.initLayer()


        // new Tool
        this.tool = new BuildTool()
        this.scene.add( this.tool );
        this.tool.visible = false;





	    // active key
	    if(!this.isMobile) this.bindKeys();


	    this.loop(0)

    }

     //----------------------------------- RENDER

    loop( time ) {

    	requestAnimationFrame( this.loop.bind(this) );

    	//requestAnimationFrame( function(t){ this.loop(t) }.bind(this) );

    	if( this.onEase !== null ) this.onEase()

	    if( this.dragMode() ){
	        this.dragCenterposition();
	    }else{
	        this.updateKey();
	    }

	    this.render( time );

    }


    //----------------------------------- RENDER

    render( time ) {

    	this.doResize()
    	this.renderer.render( this.scene, this.camera )

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


    //----------------------------------- RESIZE

    resize( e ) { this.needResize = true; }

    doResize() {

    	if( !this.needResize ) return;

    	this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
	    this.camera.aspect = this.vsize.z;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setSize( this.vsize.x,this.vsize.y );
	    this.needResize = false;

    }


    //----------------------------------- ZOOM

	startZoom() {
		this.timer = setInterval( this.faddingZoom, 1000/60, this );
	}

	faddingZoom( t ) {
		if(t.cam.distance>20){
			t.cam.distance--;
			t.moveCamera();
		}else clearInterval(t.timer);
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
        this.fullRedraw = true;*/

	}

	//----------------------------------- 3D GEOMETRY

	getRandomObject( nn ) {

		nn = nn || this.randRange(0,2);
		let geo, mat, r, n;
		switch(nn){

			case 0: geo = this.pool.geo('residential', this.randRange(1,18) ); break;
			case 1: geo = this.pool.geo('commercial', this.randRange(1,20) ); break;
			case 2: geo = this.pool.geo('industrial', this.randRange(1,8) ); break;

			/*case 0: geo = this.buildingGeo[this.randRange(4,12)]; mat = this.townMaterial; break;
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
			break;*/
		}

		//

		
		let mesh = new THREE.Mesh( geo,  this.buildingMaterial );
		//mesh.name = geo.name;
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
	            this[mesh][layer] = new THREE.Mesh( g, this[mats] );
	            this.scene.add( this[mesh][layer] );

            }

            // clear temp
            this[temp][layer] = 0;

        }

    }

    //----------------------------------- TREE TEST

    addTree ( x, y = 0, z, v, layer ) {

        if( !this.isWithTree ) return;
        // v  21 to 43
        if( !this.treeLists[layer] ) this.treeLists[layer]=[];
        this.treeLists[layer].push([x,y,z,v]);

    }

    populateTree (){

    	if(!this.isWithTree) return;

    	let l = this.nlayers;

    	while( l-- ){

            this.buildMeshLayer( l );

    	}

    }

    clearAllTrees () {

    	if(!this.isWithTree) return;
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

    	if(!this.isWithTree) return;
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

    	if(!this.isWithTree) return;
    	this.scene.remove(this.treeMeshs[l]);
    	this.treeMeshs[l].geometry.dispose();

        this.buildMeshLayer(l);

    }


    //------------------------------------ BACKGROUND MAP

    updateBackground () {

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
		    	if(this.isWithFog){
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
		    	if(this.isWithFog){
		    		this.fog.color.setHex(fogColors);
		    		//this.fog.color.convertSRGBToLinear()
		    	}
		    }
		    this.skyTexture = new THREE.Texture(this.skyCanvas);
		    this.skyTexture.encoding = THREE.sRGBEncoding
		    this.skyTexture.needsUpdate = true;
		    this.back.material.map = this.skyTexture;
		} else {
			if(this.isIsland) this.renderer.setClearColor( 0x6666e6, 1 );
			else this.renderer.setClearColor( 0xcc7f66, 1 );
		}

        if(this.isWithLight){

            //this.hemiLight.groundColor.setHex( fogColors );

        }
    }

    

    //------------------------------------ TERRAIN MAP

    clearTerrain () {

		if( this.miniTerrain.length !== 0 ){
			let e = this.miniTerrain.length;
			while(e--){ this.land.remove( this.miniTerrain[e] ); }
			this.miniTerrain = [];
		}

	}

	initTerrain() {

		this.center.x = this.mapSize[0]*0.5;
		this.center.z = this.mapSize[1]*0.5;

		// create terrain if not existe
        if( this.miniTerrain.length === 0 ){

        	let n = 0, i, j, k, geo, mesh;

        	let divid = this.isWithHeight ? 16 : 1;

        	let colors;

        	for( i=0; i<8; i++){
        		for( j=0; j<8; j++){
        		
                    geo = new THREE.PlaneBufferGeometry( 16, 16, divid, divid );
                    geo.rotateX( -Math.PI * 0.5 );
                    geo.translate( (8+j*16)-0.5, 0, (8+i*16)-0.5 );

                    k = geo.attributes.position.array.length
                    colors = [];//new Float32Array( lng );
                    while( k-- ) colors[k] = 1.0
                    geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

                    mesh = new THREE.Mesh( geo, this.terrainMaterials[ n ] )
	        		
                   // if( this.isWithLight ) mesh = new THREE.Mesh( geo, new THREE.MeshStandardMaterial({ color:0xffffff, metalness:this.metalness, roughness:this.roughness, wireframe:this.wireframe, vertexColors:true }) );
                    //else mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial({ color:0xffffff, vertexColors:true }) );

                    mesh.name = 'terrain_' + n;
	        		this.land.add( mesh );
	        		this.miniTerrain[n] = mesh;
	        		n++;

	        	}
	        }
	    }

	    // update start map texture

        if( this.isWithHeight ){

		    this.applyHeight();
		    //this.center.y = this.heightData[this.findId(this.center.x,this.center.z)];
            this.center.y = this.heightData[this.findHeightId(this.center.x,this.center.z)];

		} else {

			this.center.y = 0;

		}


		this.initTerrainTexture()

		this.moveCamera();
		if( this.isWithBackground ) this.back.position.copy(this.center);

        
	}

	initTerrainTexture () {

		let n = this.nlayers;
        let texture, textureN, textureR;
        let canvas = document.createElement('canvas');
		canvas.width = canvas.height = 256*this.mu;

        while( n-- ){

        	texture = new THREE.Texture( canvas );
        	this.pool.filterTexture( texture, {} )

        	this.miniTerrain[n].material.map = texture;
        	this.terrainTxt[n] = texture;

            if( this.isWithNormal ){

                textureN = new THREE.Texture( canvas );
                this.pool.filterTexture( textureN, { normal:true } )

                this.miniTerrain[n].material.normalMap = textureN;
                this.terrainTxtN[n] = textureN;

            }

            if( this.isWithRoughness ){

                textureR = new THREE.Texture( canvas );
                this.pool.filterTexture( textureR, { normal:true } )

                this.miniTerrain[n].material.roughnessMap = textureR;
                //this.miniTerrain[n].material.metalnessMap = textureR;
                this.terrainTxtR[n] = textureR;

            }
        	
        }

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
            noise *= 2;
            noise = Math.pow( noise, 3 );
			this.heightData[ i ] = noise



			if(noise<min) min = noise
			if(noise>max) max = noise

		}

	    //console.log(min, max)
		this.isWithHeight = true;

	}

	clearHeight() {

		if( this.water ) this.scene.remove( this.water );
		this.heightData = null
		this.isWithHeight = false;

	}

	applyHeight() {

		let i, j, gr, gn, gc;
        let lng = this.heightData.length;
		let pos, layer, h, v, d=0, n, nn, geo, id, deep;
        this.Gtmp = [];

        let big = new THREE.PlaneGeometry( 16*8, 16*8, 16*8, 16*8 );
        big.rotateX( -Math.PI * 0.5 );
        big.translate( this.center.x, 0, this.center.z );

        gr = big.attributes.position.array;

        i = lng;
        while(i--){
            n = i*3;
            gr[n+1] = this.heightData[i];
        }

        big.attributes.position.needUpdate = true;
        big.computeVertexNormals();
        let rn = big.attributes.normal.array;

        i = 64;
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

                gc[n] = gc[n+1] = gc[n+2] = deep;

                if( gr[n+1]<0 ){ // under sea
                	 gc[n] -= deep * 0.5
                	 gc[n+1] -= deep * 0.4
                }

                // border smooth
                if(gr[n]===-0.5 || gr[n+2]===-0.5 || gr[n]===128-0.5 || gr[n+2]===128-0.5){
                	if( gr[n+1]>0 ) gr[n+1] = this.heightData[ id ] = 0.25
                	if( gr[n+1]<0 ) gr[n+1] = this.heightData[ id ] = 0
                }

            }
                	
            
            geo.attributes.position.needsUpdate = true;
            geo.attributes.normal.needsUpdate = true;
            geo.attributes.color.needsUpdate = true;
            //geo.computeVertexNormals();

        }

        big.dispose();
        big = null;

        // add water mesh

        let waterGeo = new THREE.PlaneGeometry( 16*8, 16*8, 1, 1 );
        waterGeo.rotateX( -Math.PI * 0.5 );
        waterGeo.translate( this.center.x-0.5, 0, this.center.z-0.5 );

        
        this.water = new THREE.Mesh( waterGeo, this.waterMat )
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
        //g.computeVertexNormals();

        console.log('updated !!')

    }


	//------------------------------------------LAYER TOOL 8X8

	findLayer( x, y ) {
        let cx = Math.floor(x/16)
        let cy = Math.floor(y/16)
		return cx+(cy*8)
	}

	findLayerPos( x, y, layer ) {
		let cy = Math.floor(layer/8)
        let cx = Math.floor(layer-(cy*8))
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
		let cy = Math.floor(layer/8)
        let cx = Math.floor(layer-(cy*8))
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

        if( this.isMenu && !this.inMapGenation ){
        	
        	this.ui.noMouse();

        	intersects = this.raycaster.intersectObjects( this.scene.children );

        	if ( intersects.length > 0 ){
        		if( intersects[ 0 ].object.name === 'p1' ){
        			this.ui.setMouse( intersects[ 0 ].uv );
        		}
        	} 
        	
        }

		if ( this.land.children.length > 0 ) {
			intersects = this.raycaster.intersectObjects( this.land.children );
			if ( intersects.length > 0 ) {

				this.raypos.x = Math.round( intersects[0].point.x );
				this.raypos.z = Math.round( intersects[0].point.z );

				if( this.isWithHeight ) this.raypos.y = Math.round( intersects[0].point.y );
				else this.raypos.y = 0;

				if( this.currentTool ){

					this.tool.position.set(this.raypos.x, this.raypos.y, this.raypos.z);

					//this.tool.position.set(this.raypos.x, this.raypos.y, this.raypos.z);
					if(this.mouse.click || this.mouse.drag){ 
						Main.mapClick( this.currentTool.tool );

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

        Main.sendTool( Base.toolSet[id].tool );

	}


	//------------------------------------------BUILD

	build( x, y ) {
		
		if( this.currentTool.tool==='query' ) return;

		if( this.currentTool.build ){

			let size = this.currentTool.size;
			let sizey = this.currentTool.sy;

			let py = 0;

            if( this.isWithHeight ) py = this.heightData[ this.findHeightId(x,y) ];

			let zone; 
			if(size == 1 ) zone = [ [x, y] ];
			else if(size == 3) zone = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1] ];
			else if(size == 4) zone = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2]   ];
			else if(size == 6) zone = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2],   [x-1, y+2], [x, y+2], [x+1, y+2], 
				[x+3, y-1], [x+4, y-1],   [x+3, y], [x+4, y], [x+3, y+1], [x+4, y+1], [x+3, y+2], [x+4, y+2], [x+3, y+3], [x+4, y+3], [x+3, y+4], [x+4, y+4], 
				[x-1, y+3], [x-1, y+4], [x, y+3], [x, y+4],  [x+1, y+3], [x+1, y+4], [x+2, y+3], [x+2, y+4]
			];

			this.removeTreePack(zone);

			if( this.isWithHeight && size !== 1 ) this.makePlanar( zone, py );

			let v = this.currentTool.geo;

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
							Main.destroy(ar2[0][0], ar2[0][1]);
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
							Main.destroy(ar2[0][0], ar2[0][1]);
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
		//console.log('h add !!')
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
	    let phi = vertical*this.ToRad ;
	    let theta = horizontal*this.ToRad;
	    p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
	    p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
	    p.y = (distance * Math.cos(phi)) + origine.y;
	    return p;

	}

	moveCamera () {

	    this.camera.position.copy(this.Orbit(this.center, this.cam.horizontal, this.cam.vertical, this.cam.distance));
	    this.camera.lookAt(this.center);

	    if(this.isWithFog){
	        this.fog.far=this.cam.distance*4;
	        if(this.fog.far<20)this.fog.far=20;
	    }

	}

	dragCenterposition (){

		if ( this.ease.x == 0 && this.ease.z == 0 ) return;
    	this.easeRot.y = this.cam.horizontal*this.ToRad;
    	let rot = this.unwrapDegrees(Math.round(this.cam.horizontal));
        this.easeRot.x = Math.sin(this.easeRot.y) * this.ease.x + Math.cos(this.easeRot.y) * this.ease.z;
        this.easeRot.z = Math.cos(this.easeRot.y) * this.ease.x - Math.sin(this.easeRot.y) * this.ease.z;

    	this.center.x += this.easeRot.x; 
    	this.center.z -= this.easeRot.z; 

    	if(this.center.x<0) this.center.x = 0;
    	if(this.center.x>128) this.center.x = 128;
    	if(this.center.z<0) this.center.z = 0;
    	if(this.center.z>128) this.center.z = 128;
    	
        this.moveCamera();

	}

	onMouseDown  (e) {   

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
	   
	}

	onMouseUp  (e) {
		e.preventDefault();
		this.mouse.button = 0;
	    this.mouse.down = false;
	    this.mouse.drag = false;
	    if(this.currentTool==null)this.mouse.move = true;
	    this.ease.x = 0;
	    this.ease.z = 0;
	    document.body.style.cursor = 'auto';
	}

	onMouseMove  (e) {
	    e.preventDefault();

	    let px, py;
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

	    if(this.currentTool !== null || this.isMenu ){
			this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
		    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
			this.rayTest();
		}
	}

	onMouseWheel  (e) { 
		//e.preventDefault();   
	    let delta = 0;
	    if(e.wheelDelta){delta=e.wheelDelta*-1;}
	    else if(e.detail){delta=e.detail*20;}
	    this.cam.distance+=(delta/80);
	    if(this.cam.distance<1)this.cam.distance = 1;
	    if(this.cam.distance>150)this.cam.distance = 150;
	    this.moveCamera();

	}


	// -----------------------
	//  GROUND TEXTURE 
	// -----------------------

	paintMap ( mapSize, island = false, withHeight = false ) {

		this.isIsland = island;

		if( mapSize ) this.mapSize = mapSize;

		if( this.basePlane ) this.scene.remove( this.basePlane )

		//console.log(tilesData.length)
		this.clearTerrain()
		this.clearAllTrees()
		this.clearHeight()

		if( withHeight ) this.generateHeight()

		//this.initTerrain();
		
		let y = this.mapSize[1];
		let x, v, px, py, n = tilesData.length, cy, cx, layer, ar, r, ty = 0, id;

		while( y-- ){
			x = this.mapSize[0];
			while( x-- ){

				// find layer
				cy = Math.floor(y/16);
                cx = Math.floor(x/16);
				layer = cx+(cy*8);

				n--;
				v = tilesData[n];

				if( this.isWithHeight ){

					if( v > 1 && v < 5 ){ // water
						id = this.findHeightId(x, y)
						this.heightData[ id ] *= -1;
						if( x === this.mapSize[0]-1 ) this.heightData[ id+1 ] *= -1;
						if( y === this.mapSize[1]-1 ) this.heightData[ id+this.mapSize[1] ] *= -1;
						tilesData[n] = 0 
					}
	                if( v > 4 && v < 21 ){ // water border
	                    this.heightData[ this.findHeightId(x, y) ] *= 0.5;
	                    tilesData[n] = 0 
	                }
	            }
				if( v > 20 && v < 30 ){// tree 44

					if( this.isWithHeight ) ty = this.heightData[ this.findHeightId(x, y) ]-0.1;

					r = v-21;
					if(r===8) r = Math.floor(Math.random()*7)//r=8// big middle tree

					if( withHeight && ty > 0.5 ){
						if( x===0 || y===0 || x===this.mapSize[0]-1 || y===this.mapSize[0]-1) ty = 0.5
					}

						
					
					this.addTree( x, ty, y, r, layer );
					this.treeValue[n] = v;

			    } 
				
			}
		}

		this.updateBackground();

		this.initTerrain();

		let i = this.nlayers;
	    while(i--){ 
	    	this.drawLayer( i, true )
	    }
		
		this.populateTree();
		
		if(this.fullRedraw){
			this.fullRedraw = false;
		}

		this.inMapGenation = false;

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

	    	if( layerData[i] === 1 ) this.drawLayer( i )
	    	if(this.tempHouseLayers[i] === 1){ this.rebuildHouseLayer(i); this.tempHouseLayers[i] = 0 }
	    	if(this.tempBuildingLayers[i] === 1){ this.rebuildBuildingLayer(i); this.tempBuildingLayers[i] = 0; }

	    }

	}

	drawLayer ( layer, full ){

		let y = 16, x, v, n, cy, cx, ar, i, vx, vy, g;
		let ly = Math.floor(layer/8)
		let lx = Math.floor(layer-(ly*8))

		let pix = 32;
		let mid = pix * 0.5;

		while( y-- ){

			x = 16;
			while(x--){

				vx = (lx*16)+x
                vy = (ly*16)+y

				n = vx+(vy*this.mapSize[1])
				v = tilesData[n];

				g = v < 240 ? v : 0;

				if( !full && v === this.oldData[n] ) continue;
                this.oldData[n] = v;

                if( g < 240 ){

                	this.tmpPos.x = x*mid*this.mu 
                	this.tmpPos.y = (240 - y*mid)*this.mu

                	// apply tile change
            		this.renderer.copyTextureToTexture( this.tmpPos, this.pool.tile('texture', g), this.terrainTxt[layer] );
            		if( this.isWithNormal ) this.renderer.copyTextureToTexture( this.tmpPos, this.pool.tile('normal', g), this.terrainTxtN[layer] );
            		if( this.isWithRoughness ) this.renderer.copyTextureToTexture( this.tmpPos, this.pool.tile('roughness', g), this.terrainTxtR[layer] );
                	
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
	}


	// -----------------------
	//  SPRITE
	// -----------------------

	moveSprite () {

		if(!spriteData) return

		let i = spriteData.length;
		let pos = new THREE.Vector3();
		let v, frame, c;

		while(i--){
			c = spriteData[i]
			frame = c[1]
			v = c[0]
			pos.x = Math.round((c[2]-8)/16);
			pos.z = Math.round((c[3]-8)/16);
			pos.y = 0;


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
			m = new THREE.Mesh(this.pool.geo('sprite',0), this.townMaterial );
            //m.scale.set(1, 1, -1 )
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		    //this.spriteObjs[this.spriteLists[v]] = m;
		}else if(v===2){// elico
			m = new THREE.Mesh(this.pool.geo('sprite',1), this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    //this.spriteMeshs[i] = m;
		}else if(v===3){// plane
			m = new THREE.Mesh(this.pool.geo('sprite',2), this.townMaterial );
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
	}



	// -----------------------
	//  POWER SPRITE                                                  
	// -----------------------

	showPower (){

		//if( !powerData ) return

		let i = powerData.length, pos;
		while(i--){
			if(powerData[i]===0) continue;//{ if( this.powerMeshs[i] !== null ) this.removePowerMesh(i); }
			else if(powerData[i]===2){ if(this.powerMeshs[i] == null) this.addPowerMesh(i, this.findPosition(i)); }
			else if(powerData[i]===1){ if(this.powerMeshs[i] !== null) this.removePowerMesh(i); }
		}

	}

	addPowerMesh ( i, ar ) {

		let py = 0;

        if( this.isWithHeight ) py = this.heightData[ this.findHeightId(ar[0],ar[1])];

		let m = new THREE.Sprite( this.powerMaterial );
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
	//  AUTO TEXTURE
	// -----------------------

	powerTexture () {

	    let c = document.createElement("canvas");
	    let ctx = c.getContext("2d");
	    c.width = c.height = 64;
	    let grd = ctx.createLinearGradient(0,0,64,64);
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
	    let texture = new THREE.Texture(c);
	    texture.needsUpdate = true;
	    return texture;

	}

	gradTexture (color) {
	    let c = document.createElement("canvas");
	    let ctx = c.getContext("2d");
	    c.width = 16; c.height = 256;
	    let gradient = ctx.createLinearGradient(0,0,0,256);
	    let i = color[0].length;
	    while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
	    ctx.fillStyle = gradient;
	    ctx.fillRect(0,0,16,256);
	    //this.tint(c);
	    //let texture = new THREE.Texture(c);
	    //texture.needsUpdate = true;
	    return c;
	}

	tint (canvas, image, supImage) {
		let data, i, n;
		let pixels = canvas.width*canvas.height;
	    let ctx = canvas.getContext('2d');
	    
	    // draw windows
	    let topData = null;
	    let newImg = null;
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
		    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		    data = imageData.data;
		    i = pixels;
		    let c = this.tcolor;
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
	}

	// -----------------------
	//  KEYBOARD
	// -----------------------

	updateKey (){

		if( this.isMobile ) return;

		let f = 0.3, d = false;

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
		if( d ) this.dragCenterposition();

	}

	bindKeys (){

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

	}


}