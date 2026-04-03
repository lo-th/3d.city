import * as THREE from '../three/three.webgpu.js'
import { 
	mix, mul, oneMinus, positionLocal, smoothstep, texture, time, rotateUV, Fn, uv, vec2, vec3, vec4, pass, texture3D, uniform, renderOutput,
	sample, mrt, screenUV, normalView, velocity, directionToColor, colorToDirection, colorSpaceToWorking, builtinAOContext 
} from '../three/three.tsl2.js';

import { AppState } from '../AppState.js'
import { lut3D } from '../jsm/tsl/display/Lut3DNode.js';
//import { ao } from '../jsm/tsl/display/GTAONode.js';
//import { traa } from '../jsm/tsl/display/TRAANode.js';

/*const params = {
	lut: 'FILM2.CUBE',
	intensity: 1,

	samples: 16,
	distanceExponent: 1,
	distanceFallOff: 1,
	radius: 0.25,
	scale: 1,
	thickness: 1,
	aoOnly: true,
	transparentOpacity: 0.3
};*/

let lutPass, aoPass, traaPass, transparentMesh;


export class PostEffect {

	constructor () {

		this.pipeline = null

	}

	init( renderer, scene, camera, pool ){

		this.renderer = renderer 
		this.camera = camera
		this.scene = scene
		this.pool = pool

		this.pipeline = new THREE.RenderPipeline( renderer );
		

	}

	LutPass(){

		// ignore default output color transform ( toneMapping and outputColorSpace )
		// use renderOutput() for control the sequence
		this.pipeline.outputColorTransform = false;

		const lut = AppState.LUT_Map['FILM2.CUBE'] ;

		const scenePass = pass( this.scene, this.camera );
		const outputPass = renderOutput( scenePass );
		lutPass = lut3D( outputPass, texture3D( lut.texture3D ), lut.texture3D.image.width, uniform( AppState.LUT_intensity ) );
		this.pipeline.outputNode = lutPass;

	}

	setLut(){

		const lut = AppState.LUT_Map[ AppState.LUT_current ];
		lutPass.lutNode.value = lut.texture3D;
		lutPass.size.value = lut.texture3D.image.width;

	}

	setLutIntensity(){

		lutPass.intensityNode.value = AppState.LUT_intensity;

	}

	/*AoPass(){

		// pre-pass

		const prePass = pass( this.scene, this.camera )//.toInspector( 'Normal', ( inspectNode ) => colorSpaceToWorking( inspectNode, THREE.SRGBColorSpace ) );
		prePass.name = 'Pre-Pass';
		prePass.transparent = false;

		prePass.setMRT( mrt( {
			output: directionToColor( normalView ),
			velocity: velocity
		} ) );

		const prePassNormal = sample( ( uv ) => {

			return colorToDirection( prePass.getTextureNode().sample( uv ) );

		} );

		const prePassDepth = prePass.getTextureNode( 'depth' )//.toInspector( 'Depth', () => prePass.getLinearDepthNode() );
		const prePassVelocity = prePass.getTextureNode( 'velocity' )//.toInspector( 'Velocity' );

		// pre-pass - bandwidth optimization

		const normalTexture = prePass.getTexture( 'output' );
		normalTexture.type = THREE.UnsignedByteType;

		// scene pass

		const scenePass = pass( this.scene, this.camera )//.toInspector( 'Color' );

		// ao

		aoPass = ao( prePassDepth, prePassNormal, this.camera )//.toInspector( 'GTAO', ( inspectNode ) => inspectNode.r );
		/*aoPass.resolutionScale = 0.5; // running AO in half resolution is often sufficient
		aoPass.useTemporalFiltering = true;

		aoPass.samples.value = params.samples;
		aoPass.distanceExponent.value = params.distanceExponent;
		aoPass.distanceFallOff.value = params.distanceFallOff;
		aoPass.radius.value = params.radius;
		aoPass.scale.value = params.scale;
		aoPass.thickness.value = params.thickness;*/

		/*const aoPassOutput = aoPass.getTextureNode();

		// scene context

		scenePass.contextNode = builtinAOContext( aoPassOutput.sample( screenUV ).r );



		// final output + traa

		traaPass = traa( scenePass, prePassDepth, prePassVelocity, this.camera );

		traaPass.useSubpixelCorrection = false;

		// lut pass

		const lut = this.pool.getLUT()[params.lut] ;
		lutPass = lut3D( traaPass, texture3D( lut.texture3D ), lut.texture3D.image.width, uniform( params.intensity ) );

		this.pipeline.outputNode = lutPass;
		//this.pipeline.outputNode = vec4( vec3( aoPass.r ), 1 );

		// options
		if( AppState.inspector ){

			const gui = this.renderer.inspector.createParameters( 'Settings' );

			gui.add( params, 'lut', Object.keys( this.pool.getLUT() ) ).onChange(()=>{ 
					const lut = this.pool.getLUT()[ params.lut ];
					lutPass.lutNode.value = lut.texture3D;
					lutPass.size.value = lut.texture3D.image.width;
			});
			gui.add( params, 'intensity', 0, 1 ).onChange(()=>{ lutPass.intensityNode.value = params.intensity; });

			gui.add( params, 'samples', 4, 32, 1 ).onChange( this.updateParameters );
			gui.add( params, 'distanceExponent', 1, 2 ).onChange( this.updateParameters );
			gui.add( params, 'distanceFallOff', 0.01, 1 ).onChange( this.updateParameters );
			gui.add( params, 'radius', 0.1, 1 ).onChange( this.updateParameters );
			gui.add( params, 'scale', 0.01, 2 ).onChange( this.updateParameters );
			gui.add( params, 'thickness', 0.01, 2 ).onChange( this.updateParameters );
			gui.add( aoPass, 'useTemporalFiltering' ).name( 'temporal filtering' );
			//gui.add( transparentMesh, 'visible' ).name( 'show transparent mesh' );
			//gui.add( params, 'transparentOpacity', 0, 1, 0.01 ).name( 'transparent opacity' ).onChange( updateParameters );
			gui.add( params, 'aoOnly' ).onChange( ( value ) => {

				if ( value === true ) {

					this.pipeline.outputNode = vec4( vec3( aoPass.r ), 1 );

				} else {


					this.pipeline.outputNode = lutPass;

				}

				this.pipeline.needsUpdate = true;

			});
		
		}
	}

	updateParameters() {

		aoPass.samples.value = params.samples;
		aoPass.distanceExponent.value = params.distanceExponent;
		aoPass.distanceFallOff.value = params.distanceFallOff;
		aoPass.radius.value = params.radius;
		aoPass.scale.value = params.scale;
		aoPass.thickness.value = params.thickness;

		//transparentMesh.material.opacity = params.transparentOpacity;

	}*/

}