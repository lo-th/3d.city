import * as THREE from '../three/three.webgpu.js';
import { exponentialHeightFogFactor, uniform, fog, color, mul } from '../three/three.tsl2.js';

import { AppState } from '../AppState.js';
import { Inspector } from '../jsm/inspector/Inspector.js';
import { TSLGraphLoader } from '../jsm/inspector/extensions/tsl-graph/TSLGraphLoader.js';

let renderer

export const InspectorTool = {

	init: () => {

		renderer = AppState.view3d.getRenderer()
		renderer.inspector = new Inspector();

		const gui = renderer.inspector.createParameters( 'Viewport' );
		gui.add( AppState, 'exposure', 0,2  ).onChange(()=>{ renderer.toneMappingExposure = AppState.exposure });
		gui.add( AppState, 'environmentIntensity', 0, 6 ).onChange(()=>{AppState.view3d.scene.environmentIntensity = AppState.environmentIntensity;  AppState.view3d.forceUP();});
		gui.add( AppState, 'backgroundIntensity', 0, 6 ).onChange(()=>{AppState.view3d.scene.backgroundIntensity = AppState.backgroundIntensity;});
		gui.add( AppState, 'backgroundBlurriness', 0, 1 ).onChange(()=>{AppState.view3d.scene.backgroundBlurriness = AppState.backgroundBlurriness;});
		gui.add( AppState, 'direct', 0, 20 ).onChange(()=>{ AppState.view3d.sun.intensity = AppState.direct;});

		gui.add( AppState, 'LUT_current', Object.keys( AppState.LUT_Map ) ).onChange( ()=>{AppState.view3d.postEffect.setLut()} );
		gui.add( AppState, 'LUT_intensity', 0, 1 ).onChange( ()=>{ AppState.view3d.postEffect.setLutIntensity()} );

		// hide option at start !!
		renderer.inspector.profiler.hide();

	},

	addGraph:()=>{

		// TSL Graph Editor

		renderer.inspector.onExtension( 'TSL Graph', async ( tslGraph ) => {

			renderer.inspector.setActiveTab( tslGraph );

			// Apply TSL Graph from Local Storage if exists
			// Every time a TSL Graph is changed, it will be stored in the local storage

			if ( tslGraph.hasGraphs ) {

				tslGraph.apply( scene );

			} else {

				// Load a TSL Graph from a file
				// Use it for production

				const tslLoader = new TSLGraphLoader();
				const applier = await tslLoader.setPath( './shaders/' ).loadAsync( 'tsl-graphs.json' );

				applier.apply( scene );

			}

		} );

		// Active TSL Graph Editor
		// Only is needed if you don't activate it from the GUI

		renderer.inspector.setActiveExtension( 'TSL Graph', true );

	}

}