
import * as THREE from '../build/three.module.js'
import * as UIL from '../build/uil.module.js'
import { OrbitControls } from './jsm/controls/OrbitControls.js';

import { TrafficBase } from './TrafficBase.js'


let camera, scene, renderer, controls, traffic

export class Main {

	static init (){

		let grid = 1

		renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 200 );
	    controls = new OrbitControls( camera, renderer.domElement );
	    scene = new THREE.Scene();

	    let t = 19
		let decal = (t*0.5)-(grid*0.5)
		let gridMesh = new THREE.GridHelper(t, t, 0x000000, 0x202020)
		gridMesh.position.set(decal, -0.01, decal);
		scene.add(gridMesh);

	    camera.position.set( decal, 20, decal + 20 )
		controls.target.set( decal, 0, decal )
		controls.update()

		window.addEventListener( 'resize', onWindowResize, false );

	    const cgeo = new THREE.BoxGeometry( 1, 1, 1 );
	    const cmat = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	    let cubemesh = new THREE.Mesh( cgeo, cmat );
	    scene.add( cubemesh );

	    traffic = new TrafficBase( { callback:addGui } )
	    scene.add( traffic )


		animate();
		

		//loadCarsModel()

	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate( t ) {

	requestAnimationFrame( animate );
	renderer.render( scene, camera );

}



function addGui(){

	let ui = new UIL.Gui( { w:300, h:26, close:true } );

	ui.add( traffic.sets, 'timeFactor', { min:0.1, max:10, precision:2 } ).listen();
	ui.add( traffic.world, 'carsNumber', { min:0, max:500, precision:0 } ).listen();
	ui.add( traffic.world, 'instantSpeed', { min:0, max:1, precision:2, lock:true } ).listen();
	ui.add( traffic.sets, 'lightsFlip', { min:0, max:200, precision:0 } ).listen();

	//ui.add( 'button', { name:'clear' } ).onChange( function(){ traffic.clearAll() } );

}
