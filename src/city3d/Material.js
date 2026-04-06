import * as THREE from '../three/three.webgpu.js';
// https://threejs.org/docs/TSL.html#example
import { 
	uniform, texture, uv, time, emissive, float, vec4, vec3, vec2, Fn, sin, mul, add, sub, hash, oscSine, 
	range, normalMap, transformNormalToView, screenCoordinate, cameraNear, cameraFar, getViewPosition, cameraProjectionMatrixInverse,positionView,
	perspectiveDepthToViewZ, saturate, step, mix, color, pass, viewportDepthTexture, screenUV, positionWorld, linearDepth, viewportLinearDepth
} from '../three/three.tsl2.js';

import { AppState } from '../AppState.js';
import { AutoTexture } from './AutoTexture.js';

export const MAT = {};

export const MAT_LAND = [];

export class Material {

	constructor ( pool ) {

		this.pool = pool;
		this.createMaterial();
		this.createLandMaterial();

	}
		
	createMaterial() {

		let option = AppState.isBestMaterial ? { roughness:0, metalness:0 } : {}
		const Type = AppState.isBestMaterial ? THREE.MeshStandardNodeMaterial : THREE.MeshBasicNodeMaterial;

        MAT['town'] = new Type( { map: this.pool.texture('town'), ...option } );
        //this.modifyShader2( this.townMaterial )
        MAT['building'] = new Type( { map: this.pool.texture('building'), ...option } ) 
        //this.modifyShader2( this.buildingMaterial )

        MAT['title'] = new Type( { map:this.pool.texture('title') } ) 
        if( AppState.isBestMaterial ){ 
        	MAT.title.roughness = 0.3;
        	MAT.title.metalness = 0.8;
        	//MAT.title.lightMap = this.pool.texture('title_l')
        	//MAT.title.emissive =  new THREE.Color( 0x707070 )
        }

        let tx = this.pool.makeTitleTexture(0)

        MAT['title_g'] = new Type( { map:tx, aoMap:this.pool.texture('title'), transparent:true, opacity:0.8, alphaToCoverage:true } ) 
        if( AppState.isBestMaterial ){ 
        	MAT.title_g.roughness = 0.0;
        	MAT.title_g.metalness = 0.5;
        	MAT.title_g.lightMap = tx
        	//MAT.title_g.emissiveMap = this.pool.texture('title')
        	//MAT.title_g.lightMapIntensity = 10
        	//MAT.title_g.emissive =  new THREE.Color( 0xffffee )
        }

        const customColor = Fn( () => {

        	const myTexture = texture( tx );
        	//const r = range(1, 4)
			const t = oscSine(time.mul( 0.2 )).mul(2.5);// time.mul( Math.PI * 2 ).sin().mul( 0.5 ).add( 0.5 )
            const v = hash( time ).mul(3)
			return vec3( 1 ).mul(t).mul(myTexture.rgb);

		});

        MAT['title_g'].emissiveNode = customColor();



        MAT['title_l'] = new Type( { map:tx } ) 
        if( AppState.isBestMaterial ){ 
        	MAT.title_l.roughness = 1.0;
        	MAT.title_l.metalness = 0.0;
        	//MAT.title.roughnessMap = this.pool.makeTitleTexture(1)
        	MAT.title_l.lightMap = tx
        	//MAT.title_l.emissiveMap = tx
        	//MAT.title_l.lightMapIntensity = 10
        	//MAT.title_l.emissive =  new THREE.Color( 0xffffee )
        }

        MAT['title_l'].emissiveNode = customColor();
        //this.modifyShader( this.titleMat )

        /*MAT.title.userData.graphId = 'mat_1-standard'
        MAT.title_g.userData.graphId = 'mat_2-standard'
        MAT.title_l.userData.graphId = 'mat_3-standard'*/



        if( AppState.isBestMaterial ) { option.roughness = 0; option.metalness = 0.9 }

       /*this.water = this.pool.texture('water')
        this.water.repeat.set(12,12)
        this.water.wrapS = THREE.RepeatWrapping 
		this.water.wrapT = THREE.RepeatWrapping*/
        this.water = this.pool.texture('water_n')
        this.water.repeat.set(12,12)
        MAT['water'] = new Type({ 
	        //map:this.water, 
	        normalMap:this.water,
	        normalScale:new THREE.Vector2(0.6,-0.6), 
	        alphaToCoverage:true, 
	        //premultipliedAlpha:true,
	        color:AppState.color.water, transparent:true, opacity:0.8,  ...option 
        })//

        //const ww = texture(this.water_n).toVar();;
        //MAT.water.normalNode = normalMap( vec3( ww.r, ww.g, 1.0), vec2(0.6,0.6) ) 
	    //MAT.water.roughnessNode = ww.b


        //this.waterShader(MAT.water)

        if( AppState.isBestMaterial ) { option.roughness = 0.4;  option.metalness = 0.2 }
        MAT['border'] = new Type({ color:AppState.color.border, alphaMap:this.pool.texture('border'), transparent:true, side:THREE.DoubleSide, ...option })

        const baseTexture = this.pool.texture(AppState.tileSize === 64 ?'ground2k':'ground1k')
		const baseNormal = this.pool.texture(AppState.tileSize === 64 ?'ground2k_n':'ground1k_n')

        if( AppState.isBestMaterial ) { option.roughness = 0.5;  option.metalness = 0.5 }
        MAT['plane'] = new Type({ 
        	//color:AppState.color.ground, 
        	//depthWrite:false, 
        	map:baseTexture,
        	normalMap:baseNormal, //this.pool.texture('dirt_n'), 
        	//normalScale:new THREE.Vector2(2,-2),
        	//aoMap:this.pool.texture('dirt_ao'), 
        	...option 
        })


        if( AppState.isBestMaterial ){

        	if( AppState.isWithRoughness ){

	        	//MAT.town.roughnessMap = this.pool.texture('town_r');
	        	//MAT.building.roughnessMap = this.pool.texture('building_r');
	        }

	        if( AppState.isWithNormal ){

	        	const n1 = texture(this.pool.texture('town_nr')).toVar();
	        	const n2 = texture(this.pool.texture('building_nr'));

	        	//MAT.town.normalNode = normalMap( vec3( n1.x, n1.y, 1.0), vec2(2,2) )//);*/

	        	/*/*const customNorm = Fn( () => {
	        		const n = texture(this.pool.texture('building_nr'))
					return vec3( n.x, n.y, 1.0);

				});*/

	        	//MAT.building.normalNode = transformNormalToView( vec3( n1.x, n1.y, 1.0), vec2(2,2) )//transformNormalToView( vec3( n2.x, n2.y, 1.0) )//.mul(vec2(1,-1));
	        	MAT.building.normalNode = normalMap( vec3( n2.r, n2.g, 1.0), vec2(0.6,0.6) ) 
	        	MAT.building.roughnessNode = n2.b
	        	MAT.building.metalnessNode = float(1.0).sub(n2.b).mul(0.5)

	        	//MAT.town.normalMap = this.pool.texture('town_n');
	        	//MAT.building.normalMap = this.pool.texture('building_n');
	        	//MAT.building.normalScale.set(10,10)// = this.pool.texture('building_nr');
	        }

        }

        MAT['power'] = new THREE.SpriteMaterial({ map:AutoTexture.powerTexture(), transparent:true, depthTest: false, toneMapped:false })

	}


	createLandMaterial() {

		const baseTexture = this.pool.texture(AppState.tileSize === 64 ?'ground2k':'ground1k')
		const baseNormal = this.pool.texture(AppState.tileSize === 64 ?'ground2k_n':'ground1k_n')
		//baseTexture.colorSpace = THREE.SRGBColorSpace;
		//baseTexture.flipY = true;

		/*const w = AppState.tileSize === 64 ? 1024:512;
		this.ground = new THREE.DataTexture(baseTexture.image, w, w);

		this.ground.colorSpace = THREE.SRGBColorSpace;
		//txt.minFilter = THREE.LinearFilter;
		this.ground.flipY = true;
		//txt_n.flipY = true;*/

		

		 // max num layer
		let option = AppState.isBestMaterial ? { roughness:0.5, metalness:0.5 } : {}
		let Type = AppState.isBestMaterial ? THREE.MeshStandardNodeMaterial : THREE.MeshBasicNodeMaterial;

		const baseMat = new Type({ color:0xffffff,  ...option });
		baseMat.map = baseTexture;
		if(AppState.withHeight) baseMat.vertexColors = true

		/*let groundColor = new THREE.Color( AppState.color.ground ).convertLinearToSRGB()
		let RGB = [
			Math.floor(groundColor.r * 255),
			Math.floor(groundColor.g * 255),
			Math.floor(groundColor.b * 255)
		]
		console.log(RGB)*/

		/*const w = AppState.tileSize === 64 ? 1024:512;
	    const lng = w * w
		const data = new Uint8Array( lng * 4 );
		let j = lng, n
		while(j--){
			n = j*4
			data[n] = RGB[0]
			data[n+1] = RGB[1]
			data[n+2] = RGB[2]
			data[n+3] = 1
		}

		const data2 = new Uint8Array( lng * 4 );
		j = lng
		while(j--){
			n = j*4
			data2[n] = 128
			data2[n+1] = 128
			data2[n+2] = 255
			data2[n+3] = 1
		}
		const txt = new THREE.DataTexture(data, w, w);
		const txt_n = new THREE.DataTexture(data2, w, w);
		//const txt = this.pool.texture('land512')
		txt.colorSpace = THREE.SRGBColorSpace;
		//txt.minFilter = THREE.LinearFilter;
		txt.flipY = true;
		txt_n.flipY = true;*/
		//txt.needsUpdate = true;

		//const txt0 = this.pool.texture('land512_n')
		//txt0.flipY = true;
		//


		let i = 144;
		let mat;

		while(i--){

			mat = baseMat.clone();

			mat.map = baseTexture.clone();;
            if( AppState.isWithNormal ) mat.normalMap = baseNormal.clone();
            //if( AppState.isWithRoughness ) mat.roughnessMap = txt.clone();

            //mat.needsUpdate = true;
			MAT_LAND[i] = mat

		}

	}

	resetLandMaterial( numLayer ) {

		if( AppState.firstDraw ) return

		const baseTexture = this.pool.texture(AppState.tileSize === 64 ?'ground2k':'ground1k')
		const baseNormal = this.pool.texture(AppState.tileSize === 64 ?'ground2k_n':'ground1k_n')

		const renderer = AppState.view3d.getRenderer()
		const render = AppState.isWebGPU ? renderer : renderer.backend; 

		let i = numLayer; // max num layer
		let pos = new THREE.Vector2( 0, 0 )

		while(i--){

			render.copyTextureToTexture( baseTexture, MAT_LAND[i].map, null, pos );
		    if( AppState.isWithNormal ) render.copyTextureToTexture( baseNormal, MAT_LAND[i].normalMap, null, pos );
		}

	}

	waterShader( material ){

		this.depthMaterial = new THREE.MeshDepthMaterial()
        this.depthMaterial.depthPacking = THREE.RGBADepthPacking
        this.depthMaterial.blending = THREE.NoBlending

		const depthTexture = new THREE.DepthTexture();
		depthTexture.type = THREE.FloatType;

		this.renderTarget = new THREE.RenderTarget( window.innerWidth, window.innerHeight  );
		this.renderTarget.depthTexture = depthTexture;

		const tDepth = texture( depthTexture )


		//const scenePass = pass( AppState.view3d.scene, AppState.view3d.camera );
		//const depthTexture =  texture( /* <THREE.Texture> */ )//scenePass.getTextureNode( 'depth' );

		//const scenePass = pass( scene, camera );

		//const tDepth = texture( /* <THREE.Texture> */ );
		const waterUv = this.pool.texture('water')
		waterUv.wrapS = THREE.RepeatWrapping 
		waterUv.wrapT = THREE.RepeatWrapping
		const tDudv = texture( this.pool.texture('water') );
		tDudv.wrapS = THREE.RepeatWrapping 
		tDudv.wrapT = THREE.RepeatWrapping
		tDudv.needsUpdate = true;
		const waterColor = uniform( color( '#013788' ) );
		const foamColor = uniform( color( '#ffffff' ) );

		const threshold = uniform( 0.15 );
		const scaler = uniform( 16 );
		const resolution = uniform( vec2( window.innerWidth , window.innerHeight ) );
		const transparency = uniform( 0.6 );

		const gl_FragCoord = vec3( screenCoordinate.x, screenCoordinate.y.oneMinus(), screenCoordinate.z );


	//https://discourse.threejs.org/t/world-position-from-depth-using-webgpu-tsl/82414

	    const getDepth = /*@__PURE__*/ Fn( ( [ screenPosition ] ) => {

			return tDepth.sample( screenPosition ).r;

		} );

		const getViewZ = /*@__PURE__*/ Fn( ( [ depth ] ) => {

			return perspectiveDepthToViewZ( depth, 1, 10 );
			//return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

		} );

		

		material.colorNode = Fn( () => {

			const depth = linearDepth();
			const depthWater = viewportLinearDepth//.sub( depth )

			//const fragmentLinearEyeDepth = getViewZ( positionView.z );
			const fragmentLinearEyeDepth = getViewZ( depth );
			const linearEyeDepth = getViewZ( getDepth( uv() ) );
			//const linearEyeDepth = getViewZ( tDepth.x );
			
			//const linearEyeDepth = getViewZ( dd );

			//const depthTexture = scenePass.getTextureNode( 'depth' );

			//const screenUV = gl_FragCoord.xy.div( resolution );
			//const eyeDepth = perspectiveDepthToViewZ( worldPos.z, 0.0, 120 )
			//const depth = linearDepth();
			//const linearEyeDepth = perspectiveDepthToViewZ( viewportDepthTexture(screenUV).x;//getViewZ( getDepth( screenUV ) );
			//const eyeDepth = perspectiveDepthToViewZ( viewportLinearDepth)//.sub( depth ) //getViewPosition(screenUV.xy, linearEyeDepth, cameraProjectionMatrixInverse).z;
			//const viewPos = getViewPosition(screenUV.xy, depth, cameraProjectionMatrixInverse);
  
			const diff = saturate( fragmentLinearEyeDepth.sub( linearEyeDepth ) );

			//const displacement = tDudv.mul( scaler ).sub( time.mul( 0.05 ))//.sample( uv().mul( scaler ).sub( time.mul( 0.05 ) ) ).xy;
			const displacement = texture( waterUv, uv().mul( scaler ).sub( time.mul( 0.05 ) )).xy
			displacement.assign( displacement.mul( 2.0 ).sub( 1.0 ).mul( 1.0 ) );
			//diff.addAssign( displacement.x );
			//const gl_FragColor = vec4(1.0);
			//gl_FragColor.rgb.assign( mix( foamColor, waterColor, step( threshold, diff ) ) );
			//gl_FragColor.a.assign( 1.0 );
			//gl_FragColor.assign( mix( vec4( foamColor, 0.9 ), vec4( waterColor, transparency ), step( threshold, diff ) ) );

			//return gl_FragColor;
			return vec4(linearEyeDepth, 0.0, 0.0, 1.0);


		} )();

	}





	modifyShader( m ) {

		return

		if( !AppState.isBestMaterial ) return

		m.onBeforeCompile = function ( s ) {
	        s.fragmentShader = s.fragmentShader.replace( '#include <metalnessmap_fragment>', `
	            float metalnessFactor = metalness;
	            #ifdef USE_ROUGHNESSMAP
	            metalnessFactor *= 1.0 - texelRoughness.g;
	            #endif
	        `);
	    }

	}

	modifyShader2( m ) {

		return

		if( !AppState.isBestMaterial ) return

		m.onBeforeCompile = function ( s ) {
			s.fragmentShader = s.fragmentShader.replace( '#include <normal_fragment_maps>', `
	            #ifdef USE_NORMALMAP_OBJECTSPACE

					normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

					#ifdef FLIP_SIDED

						normal = - normal;

					#endif

					#ifdef DOUBLE_SIDED

						normal = normal * faceDirection;

					#endif

					normal = normalize( normalMatrix * normal );

				#elif defined( USE_NORMALMAP_TANGENTSPACE )

					vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
					
					#if defined( USE_PACKED_NORMALMAP )

						mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );

					#endif

					mapN.xy *= normalScale;
					mapN.z = 1.0;

					normal = normalize( tbn * mapN );

				#elif defined( USE_BUMPMAP )

					normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );

				#endif
	        `);
			s.fragmentShader = s.fragmentShader.replace( '#include <roughnessmap_fragment>', `
	            float roughnessFactor = roughness;
	            #ifdef USE_NORMALMAP
	            vec4 texelRoughness = texture2D( normalMap, vNormalMapUv );
	            roughnessFactor *= texelRoughness.b;
	            #endif
	        `);
	        s.fragmentShader = s.fragmentShader.replace( '#include <metalnessmap_fragment>', `
	            float metalnessFactor = metalness;
	            #ifdef USE_NORMALMAP
	            metalnessFactor *= 1.0 - texelRoughness.b;
	            #endif
	        `);
	    }

	}







}