
//------------------------------------------------------//
//                 THREE JS & SEA3D                     //
//------------------------------------------------------//

'use strict';

var V3D = { REVISION: '0.2a' };

V3D.Base = function(){
	this.container = document.getElementById( 'container' );

	this.snd_layzone = new Audio("./sound/layzone.mp3");

	this.isWithBackground = true;
	this.isWithHeight = false;

	this.clock = null;
	
	this.ToRad = Math.PI / 180;
    this.camera = null; 
    this.scene = null; 
    this.renderer = null;
    this.timer = null;
    this.imageSrc = null;
    this.mapCanvas = null;

    this.miniCanvas = [];
    this.miniCtx = [];
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

		{id:4,  tool:'police',      geo:4,    name:'',  build:1, size:3, sy:1.2,  price:500,   color:'darkblue'   ,drag:0  },
		{id:5,  tool:'park',        geo:5,    name:'',  build:1, size:1, sy:0.02, price:10,    color:'darkgreen'  ,drag:0  },
		{id:6,  tool:'fire',        geo:7,    name:'',  build:1, size:3, sy:1.2,  price:500,   color:'red'        ,drag:0  },

		{id:7,  tool:'road',        geo:0,    name:'',  build:0, size:1, sy:0.1,  price:10,    color:'black'      ,drag:1  },
		{id:8,  tool:'bulldozer',   geo:0,    name:'',  build:0, size:1, sy:0,    price:1,     color:'salmon'     ,drag:1  },
		{id:9,  tool:'rail',        geo:0,    name:'',  build:0, size:1, sy:0.15, price:20,    color:'brown'      ,drag:1  },

		{id:10, tool:'coal',        geo:8,    name:'',  build:1, size:4, sy:2,    price:3000,  color:'gray'       ,drag:0  },
		{id:11, tool:'wire',        geo:0,    name:'',  build:0, size:1, sy:0.05, price:5 ,    color:'khaki'      ,drag:1  },	
		{id:12, tool:'nuclear',     geo:9,    name:'',  build:1, size:4, sy:2,    price:5000,  color:'mistyrose'  ,drag:0  },

		{id:13, tool:'port',        geo:10,   name:'',  build:1, size:4, sy:0.5,  price:3000,  color:'dodgerblue' ,drag:0  },
		{id:14, tool:'stadium',     geo:11,   name:'',  build:1, size:4, sy:2,    price:5000,  color:'indigo'     ,drag:0  },
		{id:15, tool:'airport',     geo:12,   name:'',  build:1, size:6, sy:0.5,  price:10000, color:'violet'     ,drag:0  },
		
		{id:16, tool:'query',       geo:0,    name:'?', build:0, size:1, sy:0,    price:0,     color:'cyan'       ,drag:0  },
		{id:17, tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'       ,drag:0  }
	];

	this.currentTool = null;

	this.heightData = null;
	this.tempHeightLayers = [];

	
	// textures
	this.worldTexture = null;
	this.centralTexture = null;
	this.serviceTexture = null;
	this.buildingTexture = null;

	// material
	this.townMaterial = null;
	this.buildingMaterial = null;

	// geometry
	this.buildingGeo = null;
	this.residentialGeo = null;
	this.commercialGeo = null;
	this.industrialGeo = null;
	this.spriteGeo = null;
	this.treeGeo = null;
	this.houseGeo = null;

	this.spriteLists = [];
	this.spriteMeshs = [];

	this.treeMeshs = [];
	this.treeLists = [];
	this.tempTreeLayers = [];

	this.powerMeshs = [];
	this.powerMaterial = null;

	this.buildingMeshs = [];
	this.buildingLists = [];
	this.tempBuildingLayers = [];

	this.houseMeshs = [];
	this.houseLists = [];
	this.tempHouseLayers = [];

	this.buildingStaticMeshs = [];
	this.buildingStaticLists = [];

	this.H = [249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260];
	this.R = [244, 265, 274, 283, 292, 301, 310, 319, 328, 337, 346, 355, 364, 373, 382, 391, 400, 409, 418];
	this.C = [427, 436, 445, 454, 463, 475, 481, 490, 499, 508, 517, 526, 535, 544, 553, 562, 571, 580, 589, 598, 607];
	this.I = [616, 625, 634, 643, 652, 661, 670, 679, 688];

	// start by loading 3d mesh 
	this.loadTextures();
    this.loadSea3d();
}

V3D.Base.prototype = {
    constructor: V3D.Base,
    init:function() {
    	this.clock = new THREE.Clock();

    	this.scene = new THREE.Scene();
    	this.camera = new THREE.PerspectiveCamera( 50, this.vsize.z, 0.1, 1000 );
    	this.scene.add( this.camera );

    	this.rayVector = new THREE.Vector3( 0, 0, 1 );
    	this.projector = new THREE.Projector();
    	this.raycaster = new THREE.Raycaster();
    	
        
        this.land = new THREE.Object3D();
        this.scene.add( this.land );

        this.center = new THREE.Vector3();
        this.moveCamera();

        this.ease = new THREE.Vector3();
        this.easeRot = new THREE.Vector3();

        this.powerMaterial = new THREE.SpriteMaterial({map:this.powerTexture(), transparent:true})


         //this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, antialias:false });
    	this.renderer = new THREE.WebGLRenderer({ precision: "mediump", antialias:false });
    	this.renderer.sortObjects = false;
    	//this.renderer.setSize( this.vsize.x, this.vsize.y, true );
    	this.renderer.setSize( this.vsize.x, this.vsize.y );


    	this.townMaterial.map.anisotropy = this.renderer.getMaxAnisotropy();
    	this.buildingMaterial.map.anisotropy = this.renderer.getMaxAnisotropy();
    	this.townMaterial.map.needsUpdate = true;
    	this.buildingMaterial.map.needsUpdate = true;

    	//this.renderer.autoClear = this.isWithBackground;
    	var _this = this;
    	this.container.appendChild( _this.renderer.domElement );

        if(this.isWithBackground ){
        	//var sky = this.gradTexture([[0.5,0.45, 0.2], ['#6666e6','lightskyblue','deepskyblue']]);
        	var sky =  this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','lightskyblue', 'deepskyblue']]);
            this.back = new THREE.Mesh( new THREE.IcosahedronGeometry(300,1), new THREE.MeshBasicMaterial( { map:sky, side:THREE.BackSide, depthWrite: false }  ));
            this.scene.add( this.back );
            this.renderer.autoClear = false;
        } else {
        	this.renderer.setClearColor( 0xcc7f66, 1 );
        }

        
        window.addEventListener( 'resize', function(e) { _this.resize() }, false );

        // disable context menu
        document.addEventListener("contextmenu", function(e){ e.preventDefault(); }, false);

	    this.container.addEventListener( 'mousemove',  function(e) {_this.onMouseMove(e)} , false );
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
	    }
	    //this.render();
	    
	    start();
    },

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

	loadTextures : function (){
		var townTexture =  THREE.ImageUtils.loadTexture( 'img/town.jpg' );
		var buildingTexture =  THREE.ImageUtils.loadTexture( 'img/building.jpg' );

		townTexture.magFilter = THREE.NearestFilter;
        townTexture.minFilter = THREE.LinearMipMapLinearFilter;
        townTexture.repeat.set( 1, -1 );
		townTexture.wrapS = townTexture.wrapT = THREE.RepeatWrapping;
        
		buildingTexture.magFilter = THREE.NearestFilter;
        buildingTexture.minFilter = THREE.LinearMipMapLinearFilter;
        buildingTexture.repeat.set( 1, -1 );
		buildingTexture.wrapS = buildingTexture.wrapT = THREE.RepeatWrapping;

	    this.townMaterial = new THREE.MeshBasicMaterial( { map: townTexture } );
	    this.buildingMaterial = new THREE.MeshBasicMaterial( { map: buildingTexture } );
	},

	//----------------------------------- SEA3D IMPORT

    loadSea3d : function (){
    	var _this = this;
	    var s = 1;
	    var loader = new THREE.SEA3D( true );
	    loader.onComplete = function( e ) {
	        var m, map;
	        var i = loader.meshes.length;
	        while(i--){
	            m = loader.meshes[i];
	            _this.meshs[m.name] = m;
	        }

	        _this.defineGeometry();
	        _this.init();
	    }
	    loader.parser = THREE.SEA3D.DEFAULT;
	    loader.load( 'img/world.sea' );
	},

	//----------------------------------- 3D GEOMETRY

	defineGeometry : function(){
		var i;
		var m = new THREE.Matrix4().makeScale(1, 1, -1);
		var m2 = new THREE.Matrix4();

		// BUILDING

		this.buildingGeo = [];
		this.buildingGeo[0] = null;
		this.buildingGeo[1] = null;
		this.buildingGeo[2] = null;
		this.buildingGeo[3] = null;

		this.buildingGeo[4] = this.meshs['police'].geometry;
		this.buildingGeo[5] = this.meshs['park_1'].geometry;
		this.buildingGeo[6] = this.meshs['park_2'].geometry;
		this.buildingGeo[7] = this.meshs['fire'].geometry;


		this.buildingGeo[8] = this.meshs['coal'].geometry;
		this.buildingGeo[9] = this.meshs['nuclear'].geometry;

		this.buildingGeo[10] = this.meshs['port'].geometry;
		this.buildingGeo[11] = this.meshs['stadium'].geometry;
		this.buildingGeo[12] = this.meshs['airport'].geometry;

		// BASIC 

		this.residentialGeo = [];
		this.commercialGeo = [];
		this.industrialGeo = [];
		this.houseGeo = [];

		i = 9;
		while(i--){
			this.industrialGeo[i] = this.meshs['i_0'+i].geometry;
			this.industrialGeo[i].applyMatrix(m);
		}

		i = 19;
		while(i--){
			if(i<10) this.residentialGeo[i] = this.meshs['r_0'+i].geometry;
			else this.residentialGeo[i] = this.meshs['r_'+i].geometry;
			this.residentialGeo[i].applyMatrix(m);
		}

		i = 21;
		while(i--){
			if(i<10) this.commercialGeo[i] = this.meshs['c_0'+i].geometry;
			else this.commercialGeo[i] = this.meshs['c_'+i].geometry;
			this.commercialGeo[i].applyMatrix(m);
		}

		i = 12;
		while(i--){
			if(i<10) this.houseGeo[i] = this.meshs['rh_0'+i].geometry;
			else this.houseGeo[i] = this.meshs['rh_'+i].geometry;
			this.houseGeo[i].applyMatrix(m);
		}

		i = this.buildingGeo.length;
		while(i--) {
			if(this.buildingGeo[i] !== null) this.buildingGeo[i].applyMatrix(m);
		}

		// SPRITE

		this.spriteGeo = [];
		this.spriteGeo[0] = this.meshs['train'].geometry;
		this.spriteGeo[1] = this.meshs['elico'].geometry;
		this.spriteGeo[2] = this.meshs['plane'].geometry;

		i = this.spriteGeo.length;
		while(i--) {
			this.spriteGeo[i].applyMatrix( m );
		}

		// THREE

		this.treeGeo = [];
		this.treeGeo[0] = this.meshs['tree0'].geometry;
		this.treeGeo[1] = this.meshs['tree0'].geometry.clone();
		this.treeGeo[2] = this.meshs['tree0'].geometry.clone();
		this.treeGeo[3] = this.meshs['tree0'].geometry.clone();

		this.treeGeo[4] = this.meshs['tree1'].geometry;
		this.treeGeo[5] = this.meshs['tree1'].geometry.clone();
		this.treeGeo[6] = this.meshs['tree2'].geometry;
		this.treeGeo[7] = this.meshs['tree2'].geometry.clone();

		i = this.treeGeo.length;
		
		while(i--) {
			this.treeGeo[i].applyMatrix( m );
			this.treeGeo[i].applyMatrix( m2.makeRotationY( (Math.random()*360)*this.ToRad ) );
		}
	},
	getRandomObject : function(){
		var n = this.randRange(0,6);
		var geo, mat, r, n;
		switch(n){
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
	

	//----------------------------------- TREE TEST


    addTree : function(x,y,z,v,layer){
    	// v  21 to 43
    	if(!this.treeLists[layer]) this.treeLists[layer]=[];
    	var r = Math.floor(Math.random()*4);
    	if(v>=36) r+=4;

    	this.treeLists[layer].push([x,y,z,r]);
    },
    populateTree:function(){
    	//this.treeMeshs = [];
    	//this.tempTreeLayers = [];
    	var m = new THREE.Matrix4(), ar;
    	var l = this.nlayers;
    	while(l--){
    		var g = new THREE.Geometry();
    		if(this.treeLists[l]){
	    		var i = this.treeLists[l].length;
	    		while(i--){
	    			//rand = Math.floor(Math.random()*4);
	    			ar = this.treeLists[l][i];
	    			m.makeTranslation(ar[0],ar[1],ar[2]);
	    			g.merge( this.treeGeo[ar[3]], m );
	    			//else g.merge( this.treeGeo[4+rand], m );
	    		}
	    	    this.treeMeshs[l] = new THREE.Mesh( g, this.townMaterial );
	    	    this.scene.add(this.treeMeshs[l]);
	    	    this.tempTreeLayers[l] = 0;
	    	}
    	}
    },
    clearAllTrees : function(){
    	var l = this.nlayers;
    	while(l--){
    		if(this.treeMeshs[l]){
    			this.scene.remove(this.treeMeshs[l]);
    		    this.treeMeshs[l].geometry.dispose();
    		}
    	}
    	this.treeMeshs = [];
    	this.treeLists = [];
    },
    removeTreePack : function(ar){
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
    rebuildTreeLayer : function(l){
    	this.scene.remove(this.treeMeshs[l]);
    	this.treeMeshs[l].geometry.dispose();

    	var m = new THREE.Matrix4(), ar;
    	var g = new THREE.Geometry();
    	var i = this.treeLists[l].length;
    	while(i--){
	    	ar = this.treeLists[l][i];
	    	m.makeTranslation(ar[0],ar[1],ar[2]);
	    	//g.merge( this.treeGeo[0], m );
	    	g.merge( this.treeGeo[ar[3]], m );
	    }
	    this.treeMeshs[l] = new THREE.Mesh( g, this.townMaterial);
	    this.scene.add(this.treeMeshs[l]);
	    this.tempTreeLayers[l] = 0;
    },



    //------------------------------------ TERRAIN MAP


	updateTerrain : function(island){

		this.center.x = this.mapSize[0]*0.5;
		this.center.z = this.mapSize[1]*0.5;

		if( this.isWithHeight ){
		    this.applyHeight();
		    this.center.y = this.heightData[this.findId(this.center.x,this.center.z)];
		} else {
			this.center.y = 0;
		}

		this.moveCamera();

		// background update
		if(this.isWithBackground ){
		    if(island>0) this.back.material.map = this.gradTexture([[0.51,0.49, 0.3], ['#6666e6','lightskyblue', 'deepskyblue']]);
		    else this.back.material.map = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','lightskyblue', 'deepskyblue']]);		    
		    this.back.position.copy(this.center);
		} else {
			if(island>0) this.renderer.setClearColor( 0x6666e6, 1 );
			else this.renderer.setClearColor( 0xcc7f66, 1 );
		}

		// create terrain if not existe
        if(this.miniTerrain.length === 0){
        	var matrix = new THREE.Matrix4();
        	//var pyGeometry = this.meshs['plane'].geometry;

        	var n = 0, texture, geo, mat;
        	for(var i=0; i<8; i++){
        		for(var j=0; j<8; j++){

				    geo = new THREE.PlaneGeometry( 16, 16, 16, 16 );
	        		geo.applyMatrix(new THREE.Matrix4().makeRotationX( - Math.PI / 2 ));

	        		this.miniTerrain[n] = new THREE.Mesh(geo, new THREE.MeshBasicMaterial() );

	        		this.miniTerrain[n].position.set((8+j*16)-0.5,0,(8+i*16)-0.5);
	        		this.land.add( this.miniTerrain[n] );
	        		n++;
	        	}
	        }
	    }

	   

	    // update start map texture
        n = this.miniTerrain.length, texture;
        while(n--){
        	texture = new THREE.Texture( this.miniCanvas[n] );
        	texture.magFilter = THREE.NearestFilter;
        	texture.minFilter = THREE.LinearMipMapLinearFilter;
        	texture.needsUpdate = true;
        	this.miniTerrain[n].material.map = texture;

        	this.terrainTxt[n] = texture;
        } 

        
	},

	//------------------------------------------HEIGHT

	generateHeight : function () {
		var w = this.mapSize[0];
		var h = this.mapSize[1];

		var size = w * h;
		var data = new ARRAY_TYPE( size );
		var perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

		for ( var j = 0; j < 4; j ++ ) {
			//if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;
			for ( var i = 0; i < size; i ++ ) {
				//var x = i % w, y = ( i / w ) | 0;
				var x = i % w, y = ~~ ( i / w );
				//data[ i ] += Math.round(Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 0.2 ))*0.5;
				data[ i ] += (Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 0.2 ))
			}
			quality *= 5;
		}

		var n = data.length;
		var pos, x, y, l, d;
		while(n--){
			pos = this.findPosition(n);
			x = pos[0];
			y = pos[1];
			l = 0; d = 0;
			if(y==16 || y == 32 || y == 48 || y == 64|| y == 80 || y == 96 || y == 112  ) d = 1;
			if(x==16 || x == 32 || x == 48 || x == 64|| x == 80 || x == 96 || x == 112  ) l = 1;

			if(l)data[n]=data[n-1];
			if(d)data[n]=data[n-128];
			if(l && d) data[n]=data[n-129];
			
		}
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
	applyHeight : function () {
		var i = this.heightData.length;
		var pos, layer, h, v;
		while(i--){
			pos = this.findPosition(i);
			layer = this.findLayer(pos[0], pos[1]);
			v = this.findVertices(layer, pos);
			this.moveFaces(this.miniTerrain[layer], v, this.heightData[i]);
			//this.miniTerrain[layer].geometry.vertices[ v ].y = this.heightData[i];
		}

		var n = this.miniTerrain.length;
        while(n--){ 
        	this.miniTerrain[n].geometry.computeFaceNormals();
        	this.miniTerrain[n].geometry.computeVertexNormals();
        	this.miniTerrain[n].geometry.verticesNeedUpdate = true;
        }
	},
	makePlanar:function(ar, y){	
		var layer, v, x, z;
		var i = ar.length;
    	while(i--){
    		x = ar[i][0];
    		z = ar[i][1];
    		layer = this.findLayer(x, z);
    		v = this.findVertices(layer, [x, z] );
    		this.moveFaces(this.miniTerrain[layer], v, y);
    		this.tempHeightLayers[layer] = 1;
    	}
    	// rebuild layers
    	i = this.tempHeightLayers.length;
    	while(i--){
    		if(this.tempHeightLayers[i] === 1){
    			this.miniTerrain[i].geometry.computeFaceNormals();
    			this.miniTerrain[i].geometry.computeVertexNormals();
    			this.miniTerrain[i].geometry.verticesNeedUpdate = true;
    		}
    	}
    	this.tempHeightLayers = [];
	},
	moveFaces : function(obj, n, h){
		var face1 = obj.geometry.faces[n*2];
		var face2 = obj.geometry.faces[(n*2)+1];
		var pv  = obj.geometry.vertices;

		pv[face1.a].y = pv[face1.b].y = pv[face1.c].y = h;
		pv[face2.a].y = pv[face2.b].y = pv[face2.c].y = h;
	},

	//------------------------------------------LAYER 8X8


	findLayer : function(x,z){
		var cy = Math.floor(z/16);
        var cx = Math.floor(x/16);
		return cx+(cy*8);
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
        var py = pos[1]-(16*cy);
        var px = pos[0]-(16*cx);
        v = px + (py*16);
		return v;
	},


	//------------------------------------------RAY



	rayTest : function () {
		this.projector.unprojectVector( this.rayVector, this.camera );
		this.raycaster.set( this.camera.position, this.rayVector.sub( this.camera.position ).normalize() );

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

		if( id === 0 ){
			this.currentTool = null;
        	this.mouse.dragView = false;
        	this.mouse.move = true;
		} else if ( id === 17 ){
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
		var m =  new THREE.Line( geo, new THREE.LineBasicMaterial( { color: color, linewidth:3 } ), THREE.LinePieces );
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
			if( this.isWithHeight ) py = this.heightData[this.findId(x,y)];//this.pos.y;//this.heightData[ n ];

			var tar 
			if(size == 1 ) tar = [ [x, y] ];
			else if(size == 3) tar = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1] ];
			else if(size == 4) tar = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2]   ];
			else if(size == 6) tar = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2],   [x-1, y+2], [x, y+2], [x+1, y+2], 
				[x+3, y-1], [x+4, y-1],   [x+3, y], [x+4, y], [x+3, y+1], [x+4, y+1], [x+3, y+2], [x+4, y+2], [x+3, y+3], [x+4, y+3], [x+3, y+4], [x+4, y+4], 
				[x-1, y+3], [x-1, y+4], [x, y+3], [x, y+4],  [x+1, y+3], [x+1, y+4], [x+2, y+3], [x+2, y+4]
			];

			this.removeTreePack(tar);
			if( this.isWithHeight ) this.makePlanar(tar, py);

			
			/*var b = new THREE.Mesh(new THREE.BoxGeometry(size,sizey,size), new THREE.MeshBasicMaterial({color:this.currentTool.color, transparent:true, opacity:0.5}) );
			if(size == 4) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, sizey*0.5, 0.5));
			else if(size == 6) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1.5, sizey*0.5, 1.5));
			else b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, sizey*0.5, 0));
			b.position.set(x, 0, y);
			this.scene.add(b);*/

			var v = this.currentTool.geo;

			


			if(v<4 && v!==0){
				this.addBaseBuilding(x, py, y, v);
				this.snd_layzone.play();
			}
			if(v==8 || v==9 || v==4 || v==5 || v==7 || v==10 || v==11 || v==12){
			    var mii = new THREE.Mesh( this.buildingGeo[v], this.townMaterial );
			    mii.position.set(x, py, y);
			    this.scene.add(mii);
			    this.snd_layzone.play();
			}
			/*if( v==4 || v==5 || v==7 || v==10 || v==11 || v==12 ){
				var miii = new THREE.Mesh( this.buildingGeo[v], this.townMaterial );
			    miii.position.set(x, py, y);
			    this.scene.add(miii);
			    
			}*/

		} else {
			this.removeTree(x,y);
			if( this.isWithHeight ){
				py = this.heightData[this.findId(x,y)];
			    this.makePlanar( [[x,y]],  py );
			}
			if(this.currentTool.tool==='bulldozer'){
				this.forceUpdate.x = x;
		        this.forceUpdate.y = y;
		    }
		}
	},
	removeTool : function(){
		this.scene.remove(this.tool);
		this.tool.geometry.dispose();
		this.tool = null;
		this.currentTool = null;
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
    	if(this.houseMeshs[l] !== undefined ){
    		if(this.houseMeshs[l] !== null ){
	    	    this.scene.remove(this.houseMeshs[l]);
	        	this.houseMeshs[l].geometry.dispose();
	        	this.houseMeshs[l] = null;
	        }
	    }

    	var m = new THREE.Matrix4(), ar, k;
    	var g = new THREE.Geometry();
    	var i = this.houseLists[l].length;
    	if(i!==0){
	    	while(i--){
		    	ar = this.houseLists[l][i];
		    	m.makeTranslation(ar[0],ar[1],ar[2]);
		    	k = this.H.length;
		    	while(k--){ if(ar[3]===this.H[k]) g.merge( this.houseGeo[k], m );}
		    	//while(k--){ if(ar[3]===this.H[k]) g.merge( this.houseGeo[0], m );}
		    }
		    this.houseMeshs[l] = new THREE.Mesh( g, this.buildingMaterial);
		    this.scene.add(this.houseMeshs[l]);
		    this.tempHouseLayers[l] = 0;
		}
    },


	//--------------------------------------------------BUILDING CREATE/UPDATE

	addBaseBuilding : function(x,y,z,v){
		var layer = this.findLayer(x,z);
		var c = 244;
		if(v==2) c= 427;
		if(v==3) c=616;

		//var hh = 0;
		// if residential add house list
		//if(c==244){
		   // hh = 1;
		   // addBaseHouse(x,y,z,0);
		//}

    	if(!this.buildingLists[layer]) this.buildingLists[layer]=[];
    	this.buildingLists[layer].push([x,y,z,c, 0]);
    	//this.tempBuildingLayers[layer] = 1;

    	
    	 

    	//this.populateBaseBuilding(layer);
    	this.rebuildBuildingLayer(layer);
    },

    /*populateBaseBuilding:function( l ){
    	if(this.buildingMeshs[l] !== undefined ){
    		this.scene.remove(this.buildingMeshs[l]);
    		if(this.buildingMeshs[l].geometry)this.buildingMeshs[l].geometry.dispose();
    	}
    	var m = new THREE.Matrix4(), ar;
    	var g = new THREE.Geometry();
    	var i = this.buildingLists[l].length;

    	while(i--){
	    	ar = this.buildingLists[l][i];
	    	m.makeTranslation(ar[0],ar[1],ar[2]);
	    	if(ar[3] == 244) g.merge( this.residentialGeo[0], m );
	    	else if(ar[3] == 427) g.merge( this.commercialGeo[0], m );
	    	else if(ar[3] == 616) g.merge( this.industrialGeo[0], m );
	    }
	    this.buildingMeshs[l] = new THREE.Mesh( g, this.buildingMaterial );
	    this.scene.add(this.buildingMeshs[l]);
    },
    redrawBuildings:function(){
    	

    },*/
    rebuildBuildingLayer : function(l){
    	if(this.buildingMeshs[l] !== undefined ){
    	    this.scene.remove(this.buildingMeshs[l]);
        	this.buildingMeshs[l].geometry.dispose();
        }

    	var m = new THREE.Matrix4(), ar, k;
    	var g = new THREE.Geometry();
    	var i = this.buildingLists[l].length;
    	while(i--){
	    	ar = this.buildingLists[l][i];
	    	m.makeTranslation(ar[0],ar[1],ar[2]);
	    	k = this.R.length;
	    	while(k--){ 
	    		if(ar[3]===this.R[k]){
	    			g.merge( this.residentialGeo[k], m );
	    			// if residential basic add house list
	    			//if(ar[3]==244){ this.buildingLists[l][i][4] = 1; this.addBaseHouse(ar[0],ar[1],ar[2]); }
	    			//else { if(ar[4]==1){ this.buildingLists[l][i][4] = 0;  this.removeBaseHouse(ar[0],ar[1],ar[2]);} }

	    			if(k===0 && ar[4]===0){ this.buildingLists[l][i][4] = 1; this.addBaseHouse(ar[0],ar[1],ar[2]); }
	    			else if(k>0 && ar[4]===1){ this.buildingLists[l][i][4] = 0;  this.removeBaseHouse(ar[0],ar[1],ar[2]); } 

	    		}
	    	}

	    	k = this.C.length;
	    	while(k--){ if(ar[3]===this.C[k]) g.merge( this.commercialGeo[k], m );}

	    	k = this.I.length;
	    	while(k--){ if(ar[3]===this.I[k]) g.merge( this.industrialGeo[k], m );}
	    }
	    this.buildingMeshs[l] = new THREE.Mesh( g, this.buildingMaterial);
	    this.scene.add(this.buildingMeshs[l]);
	    this.tempBuildingLayers[l] = 0;
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

	    this.mouse.ox = px;
	    this.mouse.oy = py;
	    this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
	    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
	    this.mouse.h = this.cam.horizontal;
	    this.mouse.v = this.cam.vertical;
	    this.mouse.down = true;
	    
	    if(this.currentTool && this.mouse.button<2){// only for tool
	    	this.mouse.click = true;
	        if(this.currentTool.drag) this.mouse.drag = true;
	    }
	   
	},
	onMouseUp : function (e) {
		e.preventDefault();
		this.mouse.button = 0;
	    this.mouse.down = false;
	    this.mouse.drag = false;
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
	        if(this.mouse.move || this.mouse.button===3){  
	        	this.mouse.dragView = false;
		        document.body.style.cursor = 'crosshair';
		        this.cam.horizontal = ((px - this.mouse.ox) * 0.3) + this.mouse.h;
		        this.cam.vertical = (-(py -this. mouse.oy) * 0.3) + this.mouse.v;
		        this.moveCamera();
		    }
		    if(this.mouse.dragView || this.mouse.button===2){
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
	    if(this.cam.distance<2)this.cam.distance = 2;
	    if(this.cam.distance>150)this.cam.distance = 150;
	    this.moveCamera();
	},



	// -----------------------


	gradTexture : function(color) {
	    var c = document.createElement("canvas");
	    var ct = c.getContext("2d");
	    c.width = 16; c.height = 256;
	    var gradient = ct.createLinearGradient(0,0,0,256);
	    var i = color[0].length;
	    while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
	    ct.fillStyle = gradient;
	    ct.fillRect(0,0,16,256);
	    var texture = new THREE.Texture(c);
	    texture.needsUpdate = true;
	    return texture;
	},

	// -----------------------

	paintMap : function( mapSize, island, isStart) {
		if(!tilesData) return;

		if(mapSize) this.mapSize = mapSize;

		if(isStart){ 
			this.clearAllTrees();
			if(this.isWithHeight){  this.heightData = this.generateHeight(); }
		}
		else{ this.tempBuildingLayers = []; this.tempHouseLayers = []; }
		
		// create mini canvas if not existe
		if( this.miniCanvas.length === 0 ){
			for(var i=0; i<this.nlayers; i++){
				this.miniCanvas[i] = document.createElement('canvas');
				this.miniCanvas[i].width = this.miniCanvas[i].height = 256;
        		this.miniCtx[i] = this.miniCanvas[i].getContext("2d");
        		this.txtNeedUpdate[i] = 0;		
        	}
		}

		var force = false;
		var y = this.mapSize[1];
		var x, v, px, py, n = tilesData.length, cy, cx, layer, ar, ty = 0;

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

				if(isStart){ 
					if(v > 1 && v < 21){ // water
					//if(v > 1 && v < 5){ // water
						if( this.isWithHeight ) this.heightData[ n ] = 0; 
					}
					if(v > 20 && v < 44){// tree
						if( this.isWithHeight ) ty = this.heightData[ n ];
						this.addTree( x, ty, y, v, layer ); v=0;
				    } 
				}
				//if(isStart){if(v > 20 && v < 44){ v=0;};}
				px = v % 32 * 16;
                py = Math.floor(v / 32) * 16;


                if(isStart){ // full draw for new map
                	
                	this.miniCtx[layer].drawImage(this.imageSrc,px, py, 16, 16, ((x-(cx*16))*16),((y-(cy*16))*16), 16, 16);
                }
                else{ // draw only need update
                	if(x===this.forceUpdate.x && y===this.forceUpdate.y){ force=true; this.forceUpdate.x=-1; this.forceUpdate.y=-1 }
                	if((v>43 && v<240) || force){ // road . rail . wire
                		if(force){force = false;  if(v > 20 && v < 44){px = 0; py=0;}};// bulldozer
                		this.miniCtx[layer].drawImage(this.imageSrc,px, py, 16, 16, ((x-(cx*16))*16),((y-(cy*16))*16), 16, 16);
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
		    while(i--) if(this.txtNeedUpdate[i]){ this.terrainTxt[i].needsUpdate = true; this.txtNeedUpdate[i] = 0;}	

		     i = this.tempHouseLayers.length;
		    while(i--) if(this.tempHouseLayers[i] === 1){ this.rebuildHouseLayer(i); }

		    i = this.tempBuildingLayers.length;
		    while(i--) if(this.tempBuildingLayers[i] === 1){ this.rebuildBuildingLayer(i); }
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
		//log(i)
		while(i--){
			var c = spriteData[i];
			frame = c[1];
			pos.x =  Math.round((c[2]-8)/16);
			pos.z =  Math.round((c[3]-8)/16);
			pos.y = 0;
			if( this.isWithHeight ) pos.y = this.heightData[this.findId(pos.x,pos.z)];

			if( c[0] == 2) pos.y += 5;
			if( c[0] == 3){
				if(frame==11)pos.y += 0;
				else if(frame==10)pos.y += 1;
				else if (frame==9)pos.y += 3;
				else pos.y += 6;
			}
			//log( frame)
			if(this.spriteMeshs[i] == null) this.addSprite( i, c[0], pos );
			//this.spriteMeshs[i].position.copy(pos);
			this.spriteMeshs[i].position.lerp(pos, 0.6);
			this.spriteMeshs[i].rotation.y = this.rotationSprite(c[0], frame);
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
	addSprite : function(i, v, p){
		var m;
		if(v===1){// train
			m = new THREE.Mesh(this.spriteGeo[0], this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    this.spriteMeshs[i] = m;
		}else if(v===2){// elico
			m = new THREE.Mesh(this.spriteGeo[1], this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    this.spriteMeshs[i] = m;
		}else if(v===3){// plane
			m = new THREE.Mesh(this.spriteGeo[2], this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    this.spriteMeshs[i] = m;
		} else {
			m = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), this.townMaterial );
			m.position.copy(p);
		    this.scene.add(m);
		    this.spriteMeshs[i] = m;
		}
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
		if( this.isWithHeight ) py = this.heightData[this.findId(ar[0],ar[1])];

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
	}


}