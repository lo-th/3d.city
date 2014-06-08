
//------------------------------------------------------//
//                 THREE JS & SEA3D                     //
//------------------------------------------------------//

var V3D = { REVISION: '0.1a' };

V3D.Base = function(){
	this.ToRad = Math.PI / 180;
	this.canvas = document.getElementById("threeCanvas");
    this.camera = null; 
    this.scene = null; 
    this.renderer = null;
    this.timer = null;

    this.cam = { horizontal:90, vertical:65, distance:120 };
    this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
    this.mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, dx:0, dy:0, down:false, over:false, drag:false, click:false };
    this.pos =  {x:-1, y:0, z:-1};

    this.select = '';
    this.meshs = {};

    this.trees = [];

    this.terrain = null;
    this.tool = null;

    this.notAuto = true;

    this.toolSet = [
        {id:0,  tool:'none',        size:0, sy:0,    price:0,     color:'none'},
		{id:1,  tool:'residential', size:3, sy:0.2,  price:100,   color:'lime'},
		{id:2,  tool:'commercial',  size:3, sy:0.2,  price:100,   color:'blue'},
		{id:3,  tool:'industrial',  size:3, sy:0.2,  price:100,   color:'yellow'},
		{id:4,  tool:'police',      size:3, sy:1.2,  price:500,   color:'darkblue'},
		{id:5,  tool:'fire',        size:3, sy:1.2,  price:500,   color:'red'},
		{id:6,  tool:'port',        size:4, sy:0.5,  price:3000,  color:'dodgerblue'},
		{id:7,  tool:'airport',     size:6, sy:0.5,  price:10000, color:'violet'},
		{id:8,  tool:'stadium',     size:4, sy:2,    price:5000,  color:'indigo'},
		{id:9,  tool:'coal',        size:4, sy:2,    price:3000,  color:'gray'},
		{id:10, tool:'nuclear',     size:4, sy:2,    price:5000,  color:'mistyrose'},
		{id:11, tool:'road',        size:1, sy:0.1,  price:10,    color:'black'},
		{id:12, tool:'rail',        size:1, sy:0.15, price:20,    color:'brown'},
		{id:13, tool:'wire',        size:1, sy:0.05, price:5 ,    color:'khaki'},
		{id:14, tool:'park',        size:1, sy:0.1,  price:10,    color:'darkgreen'},
		{id:15, tool:'query',       size:1, sy:0,    price:0,     color:'cyan'},
		{id:16, tool:'bulldozer',   size:1, sy:0,    price:1,     color:'salmon'}
	];

	this.currentTool = 0;


	// start by loading 3d mesh 
    this.loadSea3d();
}

V3D.Base.prototype = {
    constructor: V3D.Base,
    init:function() {

    	this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, antialias:false });
    	this.renderer.setSize( this.vsize.x, this.vsize.y, true );
    	this.renderer.autoClear = false;

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

        

        var sky = this.gradTexture([[0.5,0.45, 0.2], ['#6666e6','lightskyblue', 'deepskyblue']]);
        this.back = new THREE.Mesh( new THREE.IcosahedronGeometry(300,1), new THREE.MeshBasicMaterial( { map:sky, side:THREE.BackSide, depthWrite: false }  ));
        this.scene.add( this.back );

        var _this = this;

        window.addEventListener( 'resize', function(e) { _this.resize() }, false );

        this.canvas.addEventListener( 'click',  function(e) {_this.onMouseClick(e)}, false );

	    this.canvas.addEventListener( 'mousemove',  function(e) {_this.onMouseMove(e)} , false );
	    this.canvas.addEventListener( 'mousedown',  function(e) {_this.onMouseDown(e)}, false );
	    this.canvas.addEventListener( 'mouseup',  function(e) {_this.onMouseUp(e)}, false );
	    this.canvas.addEventListener( 'mouseout',  function(e) {_this.onMouseUp(e)}, false );
	    
	    this.canvas.addEventListener( 'touchstart',  function(e) {_this.onMouseDown(e)}, false );
	    this.canvas.addEventListener( 'touchend',  function(e) {_this.onMouseUp(e)}, false );
	    this.canvas.addEventListener( 'touchmove',  function(e) {_this.onMouseMove(e)}, false );
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
    loadSea3d : function (){
    	_this = this;
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
	            m.scale.set(s,s,-s);
	            //_this.getFaces(m);
	            _this.meshs[m.name] = m;
	            
	            //scene.add(m);
	        }
	        _this.init();
	    }
	    //loader.parser = THREE.SEA3D.DEFAULT;
	    loader.load( 'img/world.sea' );
	},
	startZoom : function(){
		this.timer = setInterval(this.faddingZoom, 1000/60, this);
	},
	faddingZoom : function(t){
		if(t.cam.distance>20){
			t.cam.distance--;
			t.moveCamera();
			t.render();
		}else{
			clearInterval(t.timer);
		}
	},
    addTree : function(x,y,v){
    	var b;
    	if(this.meshs['tree'+v]) b = this.meshs['tree'+v].clone();
    	else b = this.meshs['tree21'].clone();
        b.position.set(x,0,y);
        this.scene.add( b );
        this.trees.push(b);
    },
    clearTree : function(){
    	if ( this.trees.length > 0 ) {
    		var i = this.trees.length;
    		while(i--){
    			this.scene.remove( this.trees[i] );
    		}
    		this.trees = [];
    	}
    },
    render:function(){
    	if(!this.notAuto) return;
    	this.renderer.clear();
    	this.renderer.render( this.scene, this.camera );
    	//log(this.select);
    },
    resize: function(){
    	this.vsize = { x:window.innerWidth, y:window.innerHeight, z:window.innerWidth/window.innerHeight};
	    this.camera.aspect = this.vsize.z;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setSize(this.vsize.x,this.vsize.y, true);
	    this.render();
	},
	updateTerrain : function(canvas, size, island){	
		this.center.x = size[0]*0.5;
		this.center.z = size[1]*0.5;
		this.moveCamera();
		this.back.position.copy(this.center);
		
		if(island>0) this.back.material.map = this.gradTexture([[0.51,0.49, 0.3], ['#6666e6','lightskyblue', 'deepskyblue']]);//this.back.material.color.setHex(0x6666e6);
		else this.back.material.map = this.gradTexture([[0.51,0.49, 0.3], ['#cc7f66','lightskyblue', 'deepskyblue']]);//this.back.material.color.setHex(0xcc7f66);

        if(this.terrain === null){
			//this.terrain = this.meshs['plane'].clone();
			this.terrain = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1, 1, 1 ),  new THREE.MeshBasicMaterial({map:new THREE.Texture(canvas)}) );
			this.terrain.material.map.needsUpdate = true;
            this.terrain.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-90*this.ToRad));
			this.land.add( this.terrain );
		} else {
			this.terrain.material.map = new THREE.Texture(canvas);
	        this.terrain.material.map.needsUpdate = true;
		}
		this.terrain.scale.set(size[0], 1, size[1]);
		this.terrain.position.set((size[0]*0.5)-0.5, 0, (size[1]*0.5)-0.5);
	    this.render();
	},
	rayTest : function () {
		this.projector.unprojectVector( this.rayVector, this.camera );
		this.raycaster.set( this.camera.position, this.rayVector.sub( this.camera.position ).normalize() );

		if ( this.land.children.length > 0 ) {
			var intersects = this.raycaster.intersectObjects( this.land.children );
			if ( intersects.length > 0 ) {
				this.pos.x = Math.round(intersects[0].point.x);
				this.pos.z = Math.round(intersects[0].point.z);
				//logLand(intersects[0].object.name);
				//this.select = intersects[0].object.name;
				if(this.currentTool){
					//if(!this.tool.visible) this.tool.visible = true;


					this.tool.position.set(this.pos.x, 0, this.pos.z);
				} 

				//log(intersects[0].point.x, intersects[0].point.z)
				/*marker.position.set( 0, 0, 0 );
				if(intersects[0].face)marker.lookAt(intersects[0].face.normal);
				marker.position.copy( intersects[0].point );*/
				
				//if(sh)shoot();
		    } else {
		    	this.pos.x = -1;
		    	this.pos.z = -1;
		    	if(this.tool!==null){
		    		if(this.tool.visible) this.tool.visible = false;
		    	}
		    	//this.select = '';
		    }
		}
	},
	addTool : function(id){
		if(this.tool !== null) this.removeTool();

		this.currentTool = id;

		var ntool = this.toolSet[id];
		var size = ntool.size;
		var name = ntool.tool;
		if(id){
			this.tool = new THREE.Object3D();
			var m = new THREE.BoxHelper();
			m.material.color.set( ntool.color );
			m.material.linewidth = 1;
			m.scale.set( size*0.5,0.5,size*0.5 );

			if(size == 6 || size == 4) m.position.set(0.5, 0.51, 0.5);
			else m.position.set(0, 0.51, 0);

			this.tool.add(m);

			//this.tool.matrix.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0, 0.5));
			//this.tool = new THREE.Mesh(new THREE.BoxGeometry(size,1,size), new THREE.MeshBasicMaterial({color:ntool.color}) )
			//if(size == 6 || size == 4) this.tool.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0, 0.5));
	        this.scene.add(this.tool);
	        this.tool.visible = false;

	        
        }
        sendTool(name);
	},
	build : function(x,y,id){
		if(id == 15 || id == 16) return;
		var ntool = this.toolSet[id];
		var size = ntool.size;
		var sizey = ntool.sy;
		var name = ntool.tool;
		var b = new THREE.Mesh(new THREE.BoxGeometry(size,sizey,size), new THREE.MeshBasicMaterial({color:ntool.color}) );
		if(size == 6 || size == 4) b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, sizey*0.5, 0.5));
		else b.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, sizey*0.5, 0));
		b.position.set(x, 0, y);
		this.scene.add(b);
		this.render();
	},
	removeTool : function(){
		this.scene.remove(this.tool);
		this.tool = null;
		this.currentTool = 0;
	},
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
	onMouseClick : function (e) {
		
		mapClick();
		e.preventDefault();
	},
	onMouseDown : function (e) {   
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
	    
	    //this.rayTest();
	    this.render();
	    e.preventDefault();
	},
	onMouseUp : function (e) {
	    this.mouse.down = false;
	    document.body.style.cursor = 'auto';
	    e.preventDefault();
	},
	onMouseMove : function (e) {
	    //e.preventDefault();
	    var px, py;
	    if(e.touches){
	        px = e.clientX || e.touches[ 0 ].pageX;
	        py = e.clientY || e.touches[ 0 ].pageY;
	    } else {
	        px = e.clientX;
	        py = e.clientY;
	    }
	    
	    if (this.mouse.down && !this.mouse.drag) {      
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
	    this.render();
	    e.preventDefault();
	},
	onMouseWheel : function (e) {    
	    var delta = 0;
	    if(e.wheelDelta){delta=e.wheelDelta*-1;}
	    else if(e.detail){delta=e.detail*20;}
	    this.cam.distance+=(delta/80);
	    if(this.cam.distance<2)this.cam.distance = 2;
	    if(this.cam.distance>150)this.cam.distance = 150;
	    this.moveCamera();
	    this.render(); 
	    e.preventDefault();
	},
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
	paintMap : function(src, ar, mapSize, island) {
		this.clearTree();
		var c = document.createElement('canvas');
		var ctx = c.getContext("2d");
		c.width = mapSize[0]*16;
		c.height = mapSize[1]*16;
		var y = mapSize[1];
		var x, v, px, py, n = ar.length;
		while(y--){
			x = mapSize[0];
			while(x--){
				n--;
				v = ar[n];
				if(v > 20 && v < 44){ this.addTree(x, y, v); v=0 };
				px = v % 32 * 16;
                py = Math.floor(v / 32) * 16;
				ctx.drawImage(src,px, py, 16, 16, x*16, y*16, 16, 16);
			}
		}
		this.updateTerrain(c, mapSize, island);
	}
}