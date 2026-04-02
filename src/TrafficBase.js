import * as THREE from './three/three.webgpu.js'
//import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
//import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';
import { mergeGeometries } from './jsm/utils/BufferGeometryUtils.js';

import { Traffic, TrafficWorld } from './traffic/TrafficLib.js';

export class TrafficBase extends THREE.Group {

    constructor( o = {} ) {

        super()

        this.pool = o.pool;

        let isStandard = o.isStandard !== undefined ? o.isStandard : true

        this.withShadow = o.withShadow || false;

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
        const MATYPE = isStandard ? THREE.MeshStandardNodeMaterial : THREE.MeshBasicNodeMaterial
        let op = isStandard ? { color:0xffffff, metalness:0.6, roughness:0.2, vertexColors:false } : {}

        this.car_geo = this.pool.geos.cars;

        this.car_mat = [
		    new MATYPE({ map:this.pool.texture('cars_0'), ...op }),
		    new MATYPE({ map:this.pool.texture('cars_1'), ...op }),
		    new MATYPE({ map:this.pool.texture('cars_2'), ...op }),
		    new MATYPE({ map:this.pool.texture('cars_3'), ...op }),
		]

		//this.feux = this.pool.geos.feux;
		this.signData = {

			'baseMat' : new MATYPE({map:this.pool.texture('feux'), ...op }),
			'redMat'  : new THREE.MeshBasicNodeMaterial({ color:0xff0000, transparent:true, alphaMap:this.pool.texture('light_a') }),
			'greenMat' : new THREE.MeshBasicNodeMaterial({ color:0x00ff00, transparent:true, alphaMap:this.pool.texture('light_a') }),
			'orangeMat' : new THREE.MeshBasicNodeMaterial({ color:0xff9900, transparent:true, alphaMap:this.pool.texture('light_a') }),
		
			'base' : this.pool.geos.feux,
			'red'  : this.pool.geos.feux_r,
			'green' : this.pool.geos.feux_g,
			'orange': this.pool.geos.feux_o

		};

	    this.inter_geo = new THREE.PlaneGeometry( this.grid, this.grid );
	    this.inter_geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		this.road_geo = new THREE.PlaneGeometry( this.grid, this.grid );
		this.road_geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
		let op2 = isStandard ? { metalness:0.5, roughness:0.1, vertexColors:false } : {}
		this.mats['inter_mat'] = new MATYPE( { map:this.pool.texture('roadx'), ...op2 } );
		this.mats['road_mat'] = new MATYPE( { map:this.pool.texture('road'), ...op2 } );

		let debug = false 

		if(debug){
			let t = 19//128//32
			let decal = (t*0.5)-(this.grid*0.5)
			let gridMesh = new THREE.GridHelper(t, t, 0x000000, 0x202020)
			gridMesh.position.set(decal, -0.01, decal);
			this.add(gridMesh);
			if(this.withShadow) this.gridMesh.receiveShadow = true;
		}
		
		//this.loadCarsModel()

		this.init()

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
    	this.car_mat[2].dispose()
    	this.car_mat[3].dispose()

    	this.mats['inter_mat'].dispose()
    	this.mats['road_mat'].dispose()

    	this.cars = [];
        this.roads = [];
        this.signal = [];
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


	addRoad( road ) {

		if ((road.source == null) || (road.target == null)) throw Error('invalid road');
		//let id = road.id.substring(4);
		let id = road.idx;
		if(this.roads[id]==null){


			
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



			let g = mergeGeometries( geoms )

			//var mtx = new THREE.Matrix4().makeScale(scaler,scaler,scaler)
			//g.applyMatrix4( mtx )


			let c = new THREE.Mesh( g, this.mats['road_mat'] );
			if(this.withShadow){
	        	c.receiveShadow = true;
			}
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

	addSignals(sign) {




	}


	addCar( car ) {

		//let id = car.id.substring(3);
		let id = car.idx;
		if( this.cars[id]==null ){
			let r = this.randInt(0,3);
			let c = new THREE.Mesh( this.car_geo[ Traffic.TYPE_OF_CARS[car.type].id ], this.car_mat[r] );
			/*if(this.withShadow){
	        	c.receiveShadow = true;
	        	c.castShadow = true;
			}*/
			
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

	addFeux(m, n, u){
		
		const res = [null,null,null,null]
		let id, f, s, sw = [1,3]

		while(n--){
			id = u[n]
			s = id
			if(s===sw[0]) s = sw[1]
			else if(s===sw[1])s = sw[0]
			f = new Signal( this.signData )
			f.rotation.y = (Math.PI*0.5)*s
			m.add(f)
			res[id] = f
		}

		return res 
		
	}

	addInter( intersection ) {//intersection

		//let id = intersection.id.substring(12);
		let id = intersection.idx;
		if( this.inter[id]==null ){

			this.inter[id] = new THREE.Mesh( this.inter_geo, this.mats['inter_mat'] );
			if(this.withShadow){
	        	this.inter[id].receiveShadow = true;
			}
			this.add( this.inter[id] );
			let type = intersection.roads.length;
			let i = type, u = []
			while(i--){
				u.push( intersection.roads[i].targetSideId )
			}
			
			switch(type){
				case 1: this.inter[id].userData['sign'] = [null,null,null,null]; break;
				case 2: this.inter[id].userData['sign'] = this.addFeux(this.inter[id], 2, u); break;
				case 3: this.inter[id].userData['sign'] = this.addFeux(this.inter[id], 3, u); break;
				case 4: this.inter[id].userData['sign'] = this.addFeux(this.inter[id], 4, u); break;
			}
			let c = intersection.rect.pos();
			this.inter[id].position.set(c.x,0,c.y);
			//inter[id].scale.set(1, 1, 1).multiplyScalar(scaler);
		} else {
			//var c = cc.rect;
			let res = this.inter[id].userData.sign;
			if(!res) return
			let l = intersection.controlSignals.stateString;
			for(let i = 0; i<4; i++){
				if(res[i] !== null) res[i].setState(l[i])
			}

			//if(id===10){
				//console.log(l)
			//}
			//if(l[0]==1)inter[id].material = inter_mat;
			//else inter[id].material = inter_mat0;

		}

	}


	randInt( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }




}



class Signal extends THREE.Mesh {

	constructor( data ){

		super( data.base, data.baseMat )
		this.red = new THREE.Mesh( data.red, data.redMat )
		this.green = new THREE.Mesh( data.green, data.greenMat )
		this.orange = new THREE.Mesh( data.orange, data.orangeMat )

		this.add(this.red)
		this.add(this.green)
		this.add(this.orange)

		this.green.visible = false
		this.orange.visible = false
		this.red.visible = false

	}

	setState( value ){

		this.green.visible = false
		this.orange.visible = false
		this.red.visible = true
		switch(value){
			case 'LFR':
			this.red.visible = true
			break;
			case 'L':
			this.red.visible = false
			this.orange.visible = true
			break;
			case 'FR':
			this.green.visible = true
			this.red.visible = false
			break;
		}

	}



}