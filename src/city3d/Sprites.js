import * as THREE from '../three/three.webgpu.js'
import { uniform, time, instanceIndex, instancedBufferAttribute } from '../three/three.tsl2.js';

import { AutoTexture } from './AutoTexture.js';


export class Sprites extends THREE.Sprite {

	constructor (name, max = 1000) {

		super()

		this.name = name

		this.map = new Map();

		this.idp = [];

		this.pp = []
		let i = max
		while(i--) this.pp.push(0,0,0)

		this.pos = new THREE.InstancedBufferAttribute( new Float32Array( max*3 ), 3 );
		this.pos.usage = THREE.DynamicDrawUsage

		const map = AutoTexture.powerTexture();
		map.colorSpace = THREE.SRGBColorSpace;

		this.material = new THREE.SpriteNodeMaterial( { sizeAttenuation: true, map, alphaTest: 0.1 } );
		//this.material.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
		this.material.positionNode = instancedBufferAttribute( this.pos );
		//this.material.rotationNode = time.add( instanceIndex ).sin();
		this.material.scaleNode = uniform( 1 );

		this.count = 0;
		this.frustumCulled = false;

	}

	hasItem(i){
		return this.map.has(i)
	}

	addItem( i, x, y, z){

		//if(this.map.has(i)) return // block if already exist

		this.pos.setXYZ( this.count, x, y, z ) 
		this.map.set( i, this.count )
		
		this.count++
		this.pos.needsUpdate = true

	}

	removeItem( i ){

		if(!this.map.has(i)) return

		let j = this.map.get(i);
	    

	    //console.log(j, this.count-1)

	    // switch current with last
	    let last = this.count-1
	    if( j < last ) this.pos.setXYZ( j, this.pos.getX(last), this.pos.getY(last), this.pos.getZ(last) ) 
	    
		this.count--
	    this.map.delete( i )
		this.pos.needsUpdate = true


	}


}