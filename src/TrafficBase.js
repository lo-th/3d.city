import * as THREE from '../build/three.module.js'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { mergeBufferGeometries } from './jsm/utils/BufferGeometryUtils.js';

import { TrafficWorld, Traffic } from './traffic/Traffic.js';


export class TrafficBase extends THREE.Group {

    constructor( o = {} ) {

        super()

        let isStandard = o.isStandard !== undefined ? o.isStandard : true

        this.position.y = 0.01

        this.callback = o.callback || null

        this.cars = [];
        this.roads = [];
        this.inter = [];
        this.mats = {}

        this.mapPath = './assets/textures/'
        this.modelPath = './assets/models/'

        const loader = new THREE.TextureLoader()
        this.grid = Traffic.settings.gridSize;

        this.sets = { 
        	timeFactor:5,
        	lightsFlip:0
        }



        //const MATYPE = THREE.MeshBasicMaterial
        const MATYPE = isStandard ? THREE.MeshStandardMaterial : THREE.MeshBasicMaterial
        let op = isStandard ? { metalness:0.8, roughness:0.2 } : {}

        this.car_geo = {}
        this.car_mat = [];



	    this.car_mat[0] = new MATYPE( op );
	    this.car_mat[1] = new MATYPE( op );
	    this.car_mat[2] = new MATYPE( op );

	    let tx;
		let img = new Image();
	    img.onload = function(){
	        this.generateRandomColor( img, this.car_mat[0] );
	        this.generateRandomColor( img, this.car_mat[1] );
	        this.generateRandomColor( img, this.car_mat[2] );
	    }.bind(this)
	    img.src = this.mapPath + 'cars.png';

	    this.inter_geo = new THREE.PlaneGeometry( this.grid, this.grid );
	    this.inter_geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		this.road_geo = new THREE.PlaneGeometry( this.grid, this.grid );
		this.road_geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		this.mats['inter_mat'] = new MATYPE( { map:loader.load( this.mapPath + 'roadx.png' ), ...op } );
		this.mats['road_mat'] = new MATYPE( { map:loader.load( this.mapPath + 'road.png' ), ...op } );

		let debug = false 

		if(debug){
			let t = 19//128//32
			let decal = (t*0.5)-(this.grid*0.5)
			let gridMesh = new THREE.GridHelper(t, t, 0x000000, 0x202020)
			gridMesh.position.set(decal, -0.01, decal);
			this.add(gridMesh);
		}
		


		this.loadCarsModel()


    }

    clearAll(){

    	clearInterval( this.interval )

    	let i = this.children.length
    	while(i--){
    		this.remove(this.children[i])
    	}

    	// geometry

    	for(let g in this.car_geo){

    		this.car_geo[g].dispose()

    	}
    	this.road_geo.dispose()
    	this.inter_geo.dispose()

    	// material

    	this.car_mat[0].dispose()
    	this.car_mat[1].dispose()
    	this.car_mat[2]

    	this.mats['inter_mat'].dispose()
    	this.mats['road_mat'].dispose()

    	this.cars = [];
        this.roads = [];
        this.inter = [];
        this.mats = {}

        this.parent.remove(this)

    }

    init(){

		Traffic.settings.gridSize = 1
		Traffic.settings.carScale = 0.05
		Traffic.settings.carSpeed = 0.05
		Traffic.settings.defaultTimeFactor = 5

		this.world = new TrafficWorld();
		this.world.generateMap( 2, 2, 4, 1, 100 );
		//world.generateMap( 6, 6, 2, 1, 100 );
		//world.generateMap( 1, 1, 10, 0.5, 100 );
		//world.carsNumber = 100;
		this.previousTime = 0;
		this.sets.timeFactor = Traffic.settings.defaultTimeFactor;
		this.sets.lightsFlip = Traffic.settings.lightsFlipInterval


		this.interval = setInterval( this.update.bind(this), 1000/60);


		if(this.callback) this.callback()

		//setTimeout(function(){ world.roadFromTo({x:4, y:3},{x:4,y:8}); }, 3000);
		//setTimeout(function(){ world.roadFromTo({x:4, y:8},{x:10,y:8}); }, 4000);
		//setTimeout(function(){ world.generateMap( 1, 1, 8, 1, 100 );; }, 6000);

	}

	update(){

		Traffic.settings.lightsFlipInterval = this.sets.lightsFlip

		let now = Date.now();
		let dt = now - this.lastUpdate;
		this.lastUpdate = now;
		let time = Date.now();

		let delta = (time - this.previousTime) || 0;
		//if (delta > 1) {
			if (delta > 100) { delta = 100;  }
			this.previousTime = time;
			this.world.onTick( this.sets.timeFactor * delta / 1000 );
			//console.log(dt)
			//var dt = 0.1;
			//var dt = Math.random()
			//world.onTick(0.1);

			let o0, o1, o2, o3, id;

			o0 = this.world.intersections.all();
			for (id in o0) {
				this.addInter(o0[id]);
	        }
	        o1 = this.world.roads.all();
	        for (id in o1) {
	            this.addRoad(o1[id]);
	            this.addSignals(o1[id]);
	        }
	        /*o2 = this.world.roads.all();
	        for (id in o2) {
	        	//road = _ref2[id];
	        	this.drawSignals(road);
	        }*/

	        // remove car 
	        let i = this.world.toRemove.length;
	        while(i--){ this.removeCar( this.world.toRemove[i]); };
	        this.world.clearTmpRemove();

			o3 = this.world.cars.all();
			for (id in o3) {
	            this.addCar( o3[id], id );
	        }
	    //}

	    // window.requestAnimationFrame(update);
	}

    generateRandomColor( img, mat ) {

		const canvas = document.createElement( 'canvas' );
		canvas.width = canvas.height = 1024;
		const ctx = canvas.getContext('2d');
		let i, n=0, j=0;

		for( i=0; i<16; i++ ){
			ctx.beginPath();
			if(i!==11 && i!==15) ctx.fillStyle = this.randCarColor();
			ctx.rect(n*256, j*256, 256, 256);
			ctx.fill();
			n++
			if(n==4){ n=0; j++; }
		}

		ctx.drawImage(img, 0, 0, 1024,1024);
	    let tx = new THREE.Texture(canvas);
	    tx.needsUpdate = true;
	    tx.flipY = false;
	    mat.map = tx;
	    mat.needsUpdate = true;

	}

	loadCarsModel() {

		let geo = this.car_geo
	    let glbLoader = new GLTFLoader();
		let dracoLoader = new DRACOLoader().setDecoderPath( './build/draco/' )
		glbLoader.setDRACOLoader( dracoLoader )

		glbLoader.load( this.modelPath + 'cars.glb', function ( gltf ) {

			gltf.scene.traverse( function ( node ) {

				if( node.isMesh ) geo[node.name] = node.geometry

			})

			this.init()

		}.bind(this))

	}

	addRoad( road ) {

		if ((road.source == null) || (road.target == null)) throw Error('invalid road');
		let id = road.id.substring(4);
		if(this.roads[id]==null){
			//var sourceSide = road.sourceSide;
		   // var targetSide = road.targetSide
			
			let p0 = road.source.rect.pos();
			let p1 = road.target.rect.pos();
			let lngx = ((p1.x-p0.x)/this.grid);
			let lngy = ((p1.y-p0.y)/this.grid);
			let side = 0;
			let dir = 1;

			//if( lngy===0 && lngx=== 0 ) return;

			if(lngy!=0) side=1;
			let i;

			if(side==0){
				i = Math.abs(lngx)-1;
				if(lngx<0) dir = -1;
			}else{
				i = Math.abs(lngy)-1;
				if(lngy<0) dir = -1;
			}

			if( i<=0 ) return;

			//var g = new THREE.BufferGeometry();
			let m = new THREE.Matrix4();

			let ng
			let geoms = []

			while(i--){
				if(side==0){
					m.makeTranslation((p0.x+(this.grid*dir)+((i*this.grid)*dir)), 0, p0.y);
					m.multiply(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
				}else{ 
					m.makeTranslation(p0.x, 0, (p0.y+(this.grid*dir)+((i*this.grid)*dir)));
				}

				ng = this.road_geo.clone()
				ng.applyMatrix4( m )

				geoms.push( ng )

				
				//g.merge( road_geo, m );
			}



			let g = mergeBufferGeometries( geoms )

			//var mtx = new THREE.Matrix4().makeScale(scaler,scaler,scaler)
			//g.applyMatrix4( mtx )


			let c = new THREE.Mesh( g, this.mats['road_mat'] );
			this.add( c );


			/*var dir = 0, lng;
			if(lng1>lng0) dir=1;

			if(dir == 0 ) lng = lng0/14;
			else lng = lng1/14;*/

			//console.log(lngx, lngy)

			//c.position.set(p0.x, 0.8,p0.y);
			this.roads[id] = c;
		}
		/*;
		var start = sourceSide.source.x;*/
		//var end = targetSide.target.center();
		//console.log(sourceSide)

		

		//(sourceSide.source, sourceSide.target, targetSide.source, targetSide.target)
	}

	addSignals(cc, id) {
	}


	addCar( car ) {

		let id = car.id.substring(3);
		if( this.cars[id]==null ){
			let r = this.randInt(0,2);
			let c = new THREE.Mesh( this.car_geo[ Traffic.TYPE_OF_CARS[ car.type].m ], this.car_mat[r] );
			
			this.add( c );
			c.position.set(10000, 0,0);
			c.scale.set(5, 5, 5);
			//c.scale.set(car.length, car.length/2, car.width);
			this.cars[id] = c;
		} else {
			let p = car.pos;
			let r = car.direction;
			this.cars[id].position.set(p.x,0,p.y);
			this.cars[id].rotation.y = -r+(Math.PI*0.5);
		}
	}

	removeCar( id ) {
		
		id = id.substring(3);
		if(this.cars[id]!=null){
			this.remove( this.cars[id] );
			this.cars[id] = null;
		}

	}

	addInter( intersection ) {//intersection

		let id = intersection.id.substring(12);
		if( this.inter[id]==null ){
			this.inter[id] = new THREE.Mesh( this.inter_geo, this.mats['inter_mat'] );
			this.add( this.inter[id] );
			let type = intersection.roads.length;
			// console.log(intersection.inRoads.length)
			/*var i = type;
			while(i){
				var sideId = intersection.roads[i].targetSideId;
				console.log(sideId)
			}*/
			/*switch(type){
				case 4: inter[id].material = inter_matx; break;
				case 3: inter[id].material = inter_maty; break;
				case 2: inter[id].material = inter_matz; break;
				case 1: inter[id].material = inter_mate; break;
			}*/
			let c = intersection.rect.pos();
			this.inter[id].position.set(c.x,0,c.y);
			//inter[id].scale.set(1, 1, 1).multiplyScalar(scaler);
		} else {
			//var c = cc.rect;
			let l = intersection.controlSignals.state[0];
			//if(l[0]==1)inter[id].material = inter_mat;
			//else inter[id].material = inter_mat0;

		}

	}

	// some math function

	randColor() { return '#'+Math.floor(Math.random()*16777215).toString(16); }

	randCarColor () {

		let carcolors = [
		[0xFFFFFF, 0xD0D1D3, 0XEFEFEF, 0xEEEEEE],//white
		[0x252122, 0x302A2B, 0x27362B, 0x2F312B],//black
		[0x8D9495, 0xC1C0BC, 0xCED4D4, 0xBEC4C4],//silver
		[0x939599, 0x424242, 0x5A5A5A, 0x747675],//gray
		[0xC44920, 0xFF4421, 0x600309, 0xD9141E],//red
		[0x4AD1FB, 0x275A63, 0x118DDC, 0x2994A6],//blue
		[0xA67936, 0x874921, 0xD7A56B, 0x550007],//brown
		[0x5FF12C, 0x188047, 0x8DAE29, 0x1AB619],//green
		[0xFFF10A, 0xFFFFBD, 0xFCFADF, 0xFFBD0A],//yellow/gold
		[0xB92968, 0x5C1A4F, 0x001255, 0xFFB7E7]//other
		];

		let l, p = this.randInt(0,100), n = this.randInt(0,3);

		if(p<23)l=0;
		else if(p<44)l=1;
		else if(p<62)l=2;
		else if(p<76)l=3;
		else if(p<84)l=4;
		else if(p<90)l=5;
		else if(p<96)l=6;
		else if(p<97)l=7;
		else if(p<98)l=8;
		else l=9;

		let base = carcolors[l][n];

	    let resl = base.toString(16);
	    if(resl.length<6) resl = '#0'+resl;
	    else resl = '#'+resl;
		return resl;
	}

	randInt( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }




}