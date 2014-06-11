
//------------------------------------------------------//
//                 THREE JS & SEA3D                     //
//------------------------------------------------------//

'use strict';

var V3D = { REVISION: '0.1a' };

V3D.Base = function(){
	this.container = document.getElementById( 'container' );

	this.isWithBackground = true;
	
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
    this.mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, dx:0, dy:0, down:false, over:false, drag:false, click:false , move:true};
    this.pos =  {x:-1, y:0, z:-1};

    this.select = '';
    this.meshs = {};

    this.trees = [];
    this.mapSize = [128,128];

    this.terrain = null;

    this.tool = null;

    this.notAuto = false;

	this.toolSet = [
        {id:0,  tool:'none',        name:'',  build:0, size:0, sy:0,    price:0,     color:'none'       ,drag:0  },
		{id:1,  tool:'residential', name:'R', build:1, size:3, sy:0.2,  price:100,   color:'lime'       ,drag:0  },
		{id:2,  tool:'commercial',  name:'C', build:1, size:3, sy:0.2,  price:100,   color:'blue'       ,drag:0  },
		{id:3,  tool:'industrial',  name:'I', build:1, size:3, sy:0.2,  price:100,   color:'yellow'     ,drag:0  },

		{id:4,  tool:'police',      name:'',  build:1, size:3, sy:1.2,  price:500,   color:'darkblue'   ,drag:0  },
		{id:5,  tool:'park',        name:'',  build:1, size:1, sy:0.1,  price:10,    color:'darkgreen'  ,drag:0  },
		{id:6,  tool:'fire',        name:'',  build:1, size:3, sy:1.2,  price:500,   color:'red'        ,drag:0  },

		{id:7,  tool:'road',        name:'',  build:0, size:1, sy:0.1,  price:10,    color:'black'      ,drag:1  },
		{id:8, tool:'bulldozer',    name:'',  build:0, size:1, sy:0,    price:1,     color:'salmon'     ,drag:1  },
		{id:9,  tool:'rail',        name:'',  build:0, size:1, sy:0.15, price:20,    color:'brown'      ,drag:1  },

		{id:10, tool:'coal',        name:'',  build:1, size:4, sy:2,    price:3000,  color:'gray'       ,drag:0  },
		{id:11,  tool:'wire',       name:'',  build:0, size:1, sy:0.05, price:5 ,    color:'khaki'      ,drag:1  },	
		{id:12, tool:'nuclear',     name:'',  build:1, size:4, sy:2,    price:5000,  color:'mistyrose'  ,drag:0  },

		{id:13, tool:'port',        name:'',  build:1, size:4, sy:0.5,  price:3000,  color:'dodgerblue' ,drag:0  },
		{id:14, tool:'stadium',     name:'',  build:1, size:4, sy:2,    price:5000,  color:'indigo'     ,drag:0  },
		{id:15, tool:'airport',     name:'',  build:1, size:6, sy:0.5,  price:10000, color:'violet'     ,drag:0  },
		
		{id:16, tool:'query',       name:'?', build:0, size:1, sy:0,    price:0,     color:'cyan'       ,drag:0  },
		
	];

	this.currentTool = null;


	this.heightData = new ARRAY_TYPE(128*128);
	//this.perlin = new ImprovedNoise();

	this.treeMeshs = [];
	this.treeLists = [];
	this.treeMaterial = null;

	this.spriteLists = [];
	this.spriteMeshs = [];

	this.powerMeshs = [];
	this.powerMaterial = null;


	// start by loading 3d mesh 
    this.loadSea3d();
}

V3D.Base.prototype = {
    constructor: V3D.Base,
    init:function() {
    	

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

        this.powerMaterial = new THREE.SpriteMaterial({map:this.powerTexture(), transparent:true})


         //this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, antialias:false });
    	this.renderer = new THREE.WebGLRenderer({ precision: "mediump", antialias:false });
    	this.renderer.sortObjects = false;
    	//this.renderer.setSize( this.vsize.x, this.vsize.y, true );
    	this.renderer.setSize( this.vsize.x, this.vsize.y );
    	//this.renderer.autoClear = this.isWithBackground;
    	var _this = this;
    	this.container.appendChild( _this.renderer.domElement );

        if(this.isWithBackground ){
        	var sky = this.gradTexture([[0.5,0.45, 0.2], ['#6666e6','lightskyblue', 'deepskyblue']]);
            this.back = new THREE.Mesh( new THREE.IcosahedronGeometry(300,1), new THREE.MeshBasicMaterial( { map:sky, side:THREE.BackSide, depthWrite: false }  ));
            this.scene.add( this.back );
            this.renderer.autoClear = false;
        }

        
        window.addEventListener( 'resize', function(e) { _this.resize() }, false );

        //this.generateHeight( 129, 129 );
        
       // this.container.addEventListener( 'click',  function(e) {_this.onMouseClick(e)}, false );

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
	            if(m.material.map){
		            map = m.material.map;
		            m.material = new THREE.MeshBasicMaterial({ map:map });
		        } else {
		        	m.material = new THREE.MeshBasicMaterial({ color:0xffffff });
		        }
	            //m.scale.set(s,s,-s);
	            _this.meshs[m.name] = m;
	        }
	        _this.defineTreeGeo();
	        _this.init();
	    }
	    //loader.parser = THREE.SEA3D.DEFAULT;
	    loader.load( 'img/world.sea' );
	},
	

	//----------------------------------- TREE TEST



	defineTreeGeo : function(){
		this.treeGeo = [];
		this.treeGeo[0] = this.meshs['tree0'].geometry;
		this.treeGeo[1] = this.meshs['tree0'].geometry.clone();
		this.treeGeo[2] = this.meshs['tree0'].geometry.clone();
		this.treeGeo[3] = this.meshs['tree0'].geometry.clone();

		this.treeGeo[4] = this.meshs['tree1'].geometry;
		this.treeGeo[5] = this.meshs['tree1'].geometry.clone();
		this.treeGeo[6] = this.meshs['tree2'].geometry;
		this.treeGeo[7] = this.meshs['tree2'].geometry.clone();

		this.treeMaterial = this.meshs['tree0'].material;

		var i = this.treeGeo.length;
		// reverse geometry
		var m = new THREE.Matrix4().makeScale(1, 1, -1);
		var m2 = new THREE.Matrix4();
		while(i--) {
			this.treeGeo[i].applyMatrix(m);
			this.treeGeo[i].applyMatrix( m2.makeRotationY( (Math.random()*360)*this.ToRad ) );
		}
	},
    addTree : function(x,y,z,v,layer){
    	// v  21 to 43
    	if(!this.treeLists[layer]) this.treeLists[layer]=[];
    	var r = Math.floor(Math.random()*4);
    	if(v>=36) r+=4;
    	this.treeLists[layer].push([x,y,z,r]);
    },
    populateTree:function(){
    	//this.treeMeshs = [];
    	this.tempTreeLayers = [];
    	var m = new THREE.Matrix4(), ar;
    	var l = 64;
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
	    	    this.treeMeshs[l] = new THREE.Mesh( g, this.treeMaterial );
	    	    this.scene.add(this.treeMeshs[l]);
	    	    this.tempTreeLayers[l] = 0;
	    	}
    	}
    },
    clearTree : function(){
    	var l = 64;
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
	    this.treeMeshs[l] = new THREE.Mesh( g, this.treeMaterial);
	    this.scene.add(this.treeMeshs[l]);
	    this.tempTreeLayers[l] = 0;
    },



    //------------------------------------ TERRAIN MAP




	updateTerrain : function(island){

		this.center.x = this.mapSize[0]*0.5;
		this.center.z = this.mapSize[1]*0.5;
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
        	var pyGeometry = this.meshs['plane'].geometry;

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
	generateHeight : function ( width, height ) {

				var size = width * height, data = new Uint8Array( size ),
				perlin = new ImprovedNoise(), quality = 1, z = 0;//Math.random() * 100;

				for ( var j = 0; j < 4; j ++ ) {

					for ( var i = 0; i < size; i ++ ) {

						var x = i % width, y = ~~ ( i / width );
						data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

					}

					quality *= 5;

				}

				return data;

			},
	/*generateHeight : function ( width, height, z, xo, yo) {
		//var size = , 
		var data = new Uint8Array( width * height );
		var perlin = new ImprovedNoise();
		var quality = 1, n = 0;
		var freq = 1///120;
		//for ( var j = 0; j <4; j ++ ) {
		//	for ( var i = 0; i < size; i ++ ) {
		for ( var j = xo; j < width+xo; j ++ ) {
		 	for ( var i = yo; i < height+yo; i ++ ) {
				//ar x = i % width, y = ~~ ( i / width );
				data[ n ] =  ( Math.abs(noise( (j / freq), (i / freq)), 100 ) );//*
				//data[ i ] += Math.abs( perlin.noise( (x*xo) / quality, (y*yo) / quality, z ) * quality * 1.75 );
				n++
			}
			//quality *= 5;
		}
		console.log(data.length, data[10])
		return data;
	},*/

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


	//------------------------------------------RAY



	rayTest : function () {
		this.projector.unprojectVector( this.rayVector, this.camera );
		this.raycaster.set( this.camera.position, this.rayVector.sub( this.camera.position ).normalize() );

		if ( this.land.children.length > 0 ) {
			var intersects = this.raycaster.intersectObjects( this.land.children );
			if ( intersects.length > 0 ) {
				this.pos.x = Math.round(intersects[0].point.x);
				this.pos.z = Math.round(intersects[0].point.z);
				

				if(this.currentTool){
					this.tool.position.set(this.pos.x, 0, this.pos.z);
					if(this.mouse.click || this.mouse.drag) mapClick();

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
		//this.rebuildTree()
		if(this.tool !== null) this.removeTool();
		//this.currentTool = this.toolSet[id];//id;
		//var ntool = this.toolSet[id];
		//var name = ntool.tool;
		if(id){
			this.currentTool = this.toolSet[id];
			this.mouse.move = false;
			this.tool = this.customTool();//ntool.size, ntool.color);
	        this.scene.add(this.tool);
        } else {
        	this.currentTool = null;
        	this.mouse.move = true;
        }
        sendTool(this.toolSet[id].tool);
	},
	customTool : function(size, color){
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

			var tar 
			if(size == 1 ) tar = [ [x, y] ];
			else if(size == 3 ) tar = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1] ];
			else if(size == 4) tar = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2]   ];
			else if(size == 6) tar = [ [x, y], [x-1, y], [x+1, y],  [x, y-1], [x-1, y-1], [x+1, y-1],   [x, y+1], [x-1, y+1], [x+1, y+1],       [x+2, y-1],  [x+2, y] , [x+2, y+1] , [x+2, y+2],   [x-1, y+2], [x, y+2], [x+1, y+2], 
				[x+3, y-1], [x+4, y-1],   [x+3, y], [x+4, y], [x+3, y+1], [x+4, y+1], [x+3, y+2], [x+4, y+2], [x+3, y+3], [x+4, y+3], [x+3, y+4], [x+4, y+4], 
				[x-1, y+3], [x-1, y+4], [x, y+3], [x, y+4],  [x+1, y+3], [x+1, y+4], [x+2, y+3], [x+2, y+4]
			];

			this.removeTreePack(tar);

			//var name = ntool.tool;
			var b = new THREE.Mesh(new THREE.BoxGeometry(size,sizey,size), new THREE.MeshBasicMaterial({color:this.currentTool.color, transparent:true, opacity:0.5}) );
			if(size == 4) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, sizey*0.5, 0.5));
			else if(size == 6) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1.5, sizey*0.5, 1.5));
			else b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, sizey*0.5, 0));
			b.position.set(x, 0, y);
			this.scene.add(b);
		} else {
			this.removeTree(x,y);
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



	//---------------------------------------------------



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
	moveCamera : function () {
	    this.camera.position.copy(this.Orbit(this.center, this.cam.horizontal, this.cam.vertical, this.cam.distance));
	    this.camera.lookAt(this.center);
	    //this.render();
	},
	/*onMouseClick : function (e) {
		e.preventDefault();
		mapClick();
		
	},*/
	onMouseDown : function (e) {   
		e.preventDefault();
	    var px, py;
	    if(e.touches){
	        px = e.clientX || e.touches[ 0 ].pageX;
	        py = e.clientY || e.touches[ 0 ].pageY;
	    } else {
	        px = e.clientX;
	        py = e.clientY;
	    }
	    this.mouse.ox = px;
	    this.mouse.oy = py;
	    this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
	    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
	    this.mouse.h = this.cam.horizontal;
	    this.mouse.v = this.cam.vertical;
	    this.mouse.down = true;
	    
	    if(this.currentTool){
	    	this.mouse.click = true;
	        if(this.currentTool.drag) this.mouse.drag = true;
	    }
	    
	    //this.rayTest();
	    //this.render();
	    
	},
	onMouseUp : function (e) {
		e.preventDefault();
	    this.mouse.down = false;
	    this.mouse.drag = false;
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
	    
	    if (this.mouse.down && this.mouse.move) {      
	        document.body.style.cursor = 'move';
	        this.cam.horizontal = ((px - this.mouse.ox) * 0.3) + this.mouse.h;
	        this.cam.vertical = (-(py -this. mouse.oy) * 0.3) + this.mouse.v;
	        this.moveCamera();
	    } else {
			this.rayVector.x = ( px / this.vsize.x ) * 2 - 1;
		    this.rayVector.y = - ( py / this.vsize.y ) * 2 + 1;
			this.rayTest();
		}
	    //if(!self.focus())self.focus();
	    //this.render();
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
	    //this.render(); 
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
		if(isStart) this.clearTree();
		
		// create mini canvas if not existe
		if( this.miniCanvas.length === 0 ){
			for(var i=0; i<64; i++){
				this.miniCanvas[i] = document.createElement('canvas');
				this.miniCanvas[i].width = this.miniCanvas[i].height = 256;
        		this.miniCtx[i] = this.miniCanvas[i].getContext("2d");
        		this.txtNeedUpdate[i] = 0;		
        	}
		}

		if(mapSize) this.mapSize = mapSize;
		
		var force = false;
		var y = this.mapSize[1];
		var x, v, px, py, n = tilesData.length, cy, cx, layer;
		while(y--){
			x = this.mapSize[0];
			while(x--){

				// find layer
				cy = Math.floor(y/16);
                cx = Math.floor(x/16);
				layer = cx+(cy*8);

				n--;
				v = tilesData[n];

				if(isStart){ if(v > 20 && v < 44){ this.addTree( x, 0, y, v, layer ); v=0;}; }
				//if(isStart){if(v > 20 && v < 44){ v=0;};}
				px = v % 32 * 16;
                py = Math.floor(v / 32) * 16;


                if(isStart){ // full draw for new map
                	this.miniCtx[layer].drawImage(this.imageSrc,px, py, 16, 16, ((x-(cx*16))*16),((y-(cy*16))*16), 16, 16);
                }
                else{ // draw only need update
                	if(x===this.forceUpdate.x && y===this.forceUpdate.y){ force=true; this.forceUpdate.x=-1; this.forceUpdate.y=-1 }
                	if(v>43 || force){ 
                		if(force){force = false;  if(v > 20 && v < 44){px = 0; py=0;}};// bulldozer
                		this.miniCtx[layer].drawImage(this.imageSrc,px, py, 16, 16, ((x-(cx*16))*16),((y-(cy*16))*16), 16, 16);
                		this.txtNeedUpdate[layer] = 1;
                	}
                }
			}
		}
		
		if(isStart){
			this.updateTerrain(island);
			this.populateTree();
		} else {
			i = 64;
		    while(i--) if(this.txtNeedUpdate[i]){ this.terrainTxt[i].needsUpdate = true; this.txtNeedUpdate[i] = 0;}	
		}
	},



	//-------------------- sprite


	moveSprite : function(){
		if(!spriteData) return;
		var i = spriteData.length;
		var pos = new THREE.Vector3(0,0.25,0);
		var frame = 0;
		//log(i)
		while(i--){
			var c = spriteData[i];
			frame = c[1];
			pos.x =  Math.round((c[2]-8)/16);
			pos.z =  Math.round((c[3]-8)/16);
			//log( frame)
			if(this.spriteMeshs[i] == null) this.addSprite( i, c[0] );
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
			else if(f===3) r = -45*this.ToRad;
			else if(f===4) r = 45*this.ToRad;
		}
		return r;
	},
	addSprite : function(i, v){
		var m = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,1.5), new THREE.MeshBasicMaterial({color:0xff0000}) );
		this.scene.add(m);
		this.spriteMeshs[i] = m;
		//console.log('new Sprite' + v)
	},




	//-----------------------power zone


	showPower : function(){
		if(!powerData) return;
		var i = powerData.length;
		while(i--){
			if(powerData[i]==2){ if(this.powerMeshs[i] == null) this.addPowerMesh(i, this.findPosition(i)); }
			else if(powerData[i]==1){ if(this.powerMeshs[i] !== null) this.removePowerMesh(i); }
		}
	},
	addPowerMesh : function(i, ar){
		//var m = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5), this.powerMaterial );

		var m = new THREE.Sprite( this.powerMaterial );
		//m.scale.set( 2, 2, 1 );
		m.position.set(ar[0], 1, ar[1]);
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
		grd.addColorStop(1,"red")
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