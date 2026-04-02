import * as THREE from '../three/three.webgpu.js';

export class BuildTool extends THREE.Object3D {

	constructor () {

		super()

		this.space = 0.075;

		let geo = new THREE.BufferGeometry()
		let p1 = 0.5+(this.space*0.5);
		let p2 = 0.5-(this.space*0.5);
		let v = [-p2, 0, p2, -p1, 0, p1, p2, 0, p2, p1, 0, p1, p1, 0, -p1, p2, 0, -p2, -p2, 0, -p2, -p1, 0, -p1];
		let indices = [0, 1, 2, 1, 3, 2, 3, 4, 2, 2, 4, 5, 5, 4, 6, 4, 7, 6, 7, 1, 6, 1, 0, 6];
		let n = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
		let uv = [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0];

		geo.setIndex( indices );
		geo.setAttribute( 'position', new THREE.Float32BufferAttribute( v, 3 ) );
		geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( n, 3 ) );
		geo.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );

		geo.morphAttributes.position = [];

		geo.morphAttributes.position.push( this.makeMorph(3) );
		geo.morphAttributes.position.push( this.makeMorph(4, 0.5) );
		geo.morphAttributes.position.push( this.makeMorph(6, 1.5) );

		this.mesh = new THREE.Mesh( geo )

		this.mesh.material.depthWrite = true; 
		this.mesh.material.depthTest = false;
		//this.mesh.material.toneMapped = false;
		this.mesh.material.morphTargets = false;
		this.mesh.material.transparent = true;
		this.mesh.material.renderOrder = 1

		this.type = 'Tool';
		this.add(this.mesh)

	}

	makeMorph ( s, d = 0 ) {

		let p1 = (s*0.5)+(this.space*0.5);
		let p2 = (s*0.5)-(this.space*0.5);

		let v = [-p2, 0, p2, -p1, 0, p1, p2, 0, p2, p1, 0, p1, p1, 0, -p1, p2, 0, -p2, -p2, 0, -p2, -p1, 0, -p1];

		let i = v.length/3, n
		while(i--){ n=i*3; v[n] += d; v[n+2] += d; }

		return new THREE.Float32BufferAttribute( v, 3 );

	}

	set color( c ) {
		this.mesh.material.color.set(c).convertSRGBToLinear()
	}

	set resize ( s ) {

		this.mesh.morphTargetInfluences[ 0 ] = 0;
		this.mesh.morphTargetInfluences[ 1 ] = 0;
		this.mesh.morphTargetInfluences[ 2 ] = 0;

		if( s==3 ) this.mesh.morphTargetInfluences[ 0 ] = 1;
		if( s==4 ) this.mesh.morphTargetInfluences[ 1 ] = 1;
		if( s==6 ) this.mesh.morphTargetInfluences[ 2 ] = 1;

	}

}


// CONSTRUCTION ANIMATION

export class Markers extends THREE.Group {

	constructor () {

		super()

		this.duration = 600; // ms
		this.queue = []

	}

	spawn( tool ){

		const m = tool.mesh.clone()
		m.material = tool.mesh.material.clone()
		m.position.copy(tool.position)
		m.visible = true
		m.material.depthTest = true;
		m.material.transparent = true;
		m.material.opacity = 0.95;
		m.startTime = Date.now()
		m.startY = m.position.y
		this.add(m)
		this.queue.push(m)

	}

	ease(t, b, c, d){
		t /= d;
        return -c * t * (t - 2) + b;
	}

	update(){
		if (!this.queue.length) return;
		const now = Date.now();
		let i = this.queue.length, m, age;
		while(i--){
			m = this.queue[i];
			age = now - m.startTime;
			if (age >= this.duration) {
				this.remove(m);
                m.geometry.dispose();
                m.material.dispose();
                this.queue.splice(i, 1);
			} else {
				const t = age / this.duration;
				//const e = this.ease(now, 1, 1.4, this.duration)
                // Pulse scale
                //const scale = 1 + Math.sin(t * Math.PI * 6) * 0.1;

                //const e = 0.4 + Math.sin(t * Math.PI * 10 ) * 0.4;
                //const scale = 1 + Math.sin(t * Math.PI * 6) * 0.2;
                m.scale.setScalar(1 + (t*0.1));
                m.position.y = m.startY + (t*0.6) 
                // Fade out in last 40%
                m.material.opacity = t < 0.6 ? 0.95 : 0.95 * (1 - (t - 0.6) / 0.4);
			}

		}

	}

}

