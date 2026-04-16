import * as THREE from '../three/three.webgpu.js'
import { Fn, uniform, time, instanceIndex, instancedBufferAttribute, vec2, vec4, uv, sin, oscSine, texture, pointUV, mod, floor } from '../three/three.tsl2.js';

import { AutoTexture } from './AutoTexture.js';
import { AppState } from '../AppState.js';

export class Sprites extends THREE.Sprite {

	constructor (name, max = 5000) {

		super()

		this.name = name

		this.map = new Map();

		this.idp = [];

		this.pp = []
		let i = max
		while(i--) this.pp.push(0,0,0)

		this.pos = new THREE.InstancedBufferAttribute( new Float32Array( max*3 ), 3 );
		this.pos.usage = THREE.DynamicDrawUsage

		let map; 
		if(name==='power') map = AutoTexture.powerTexture();

		if(name==='fire'){

			this.uv = new THREE.InstancedBufferAttribute( new Float32Array( max*2 ), 2 );
			map = AppState.pool.texture('fire');

		}
		
		map.colorSpace = THREE.SRGBColorSpace;

		this.material = new THREE.SpriteNodeMaterial( { sizeAttenuation: true, map, alphaTest: 0.1 } );
		//this.material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
		this.material.positionNode = instancedBufferAttribute( this.pos );
		//this.material.rotationNode = time.add( instanceIndex ).sin();
		this.material.scaleNode = uniform( 1 );

		
		if(this.name === 'fire'){

			const selfUV = instancedBufferAttribute( this.uv )

			const animCycle = 1/12

			const spriteSheet = Fn(()=>{

				const fTime = floor(time.div( animCycle )).mod(8);
				const uv0 = uv().mul( vec2(0.125, 1) ).add(selfUV);
				const animateUv = vec2( uv0.x.add( ( fTime ).mul(0.125) ), uv0.y )
				const myMap = texture( map, animateUv )
				return myMap

			})

			this.material.colorNode = spriteSheet()

		}

		this.count = 0;
		this.frustumCulled = false;

	}

	hasItem(i){
		
		return this.map.has(i)

	}

	addItem( i, x, y, z){

		//if(this.map.has(i)) return // block if already exist

		this.pos.addUpdateRange( this.count, 3 )
		this.pos.setXYZ( this.count, x, y, z ) 
		this.map.set( i, this.count )

		if(this.name === 'fire' ){
			this.uv.setXY( this.count, 0.125 * AppState.randInt(0,7), 1 );
			this.uv.needsUpdate = true
		}
		
		this.count++
		this.pos.needsUpdate = true

	}

	removeItem( i ){

		if(!this.map.has(i)) return

		let j = this.map.get(i);

	    let isFire = this.name === 'fire'

	    // switch current with last
	    let last = this.count-1
	    if( j < last ){ 
	    	this.pos.setXYZ( j, this.pos.getX(last), this.pos.getY(last), this.pos.getZ(last) ) 
	    	if( isFire ) this.color.setXYZ( j, this.color.getX(last), this.color.getY(last), this.color.getZ(last) )
	    }
	    
		this.count--
	    this.map.delete( i )
		this.pos.needsUpdate = true


	}


}