import { MeshStandardMaterial } from '../three/three.module.js'
  

export class GroundShader extends MeshStandardMaterial {

	constructor( o = {}, extra = {} ) {

		super( {vertexColors:true, ...o} )

		this.tilesRef = extra.tilesRef
		this.tileNorm = extra.tileNorm

	}

	onBeforeCompile( shader ){

		var uniforms = shader.uniforms;

		uniforms[ "tileRef" ] = { value: this.tilesRef };
        uniforms[ "tileNorm" ] = { value: this.tilesNorm };

        shader.uniforms = uniforms;

        var vertex = shader.vertexShader;
        vertex = vertex.replace( 'varying vec3 vViewPosition;', vert_pars  );
        //vertex = vertex.replace( '#include <fog_vertex>', vertMainAdd );
        shader.vertexShader = vertex;

        var fragment = shader.fragmentShader;
        fragment = fragment.replace( 'uniform vec3 diffuse;', frag_pars );

        fragment = fragment.replace( '#include <color_fragment>', '' );
        fragment = fragment.replace( '#include <map_fragment>', map_frag );
        fragment = fragment.replace( '#include <normal_fragment_maps>', normal_frag );
        fragment = fragment.replace( '#include <roughnessmap_fragment>', roughnessmap_frag );
        fragment = fragment.replace( '#include <metalnessmap_fragment>', metalnessmap_frag );

        shader.fragmentShader = fragment;

	}

	dispose() {
        //this.normal.dispose()
        this.dispatchEvent( { type: 'dispose' } );
    }


}

const vert_pars =/* glsl */`
varying vec3 vViewPosition;
`;

const frag_pars =/* glsl */`
uniform sampler2D tileRef;
uniform sampler2D tileNorm;
uniform vec3 diffuse;

//vec4 tile (vec3 pos, float n){
//	vec4 c = texture2D( tileRef, (vMapUv*0.0625) )
//}

`;



const map_frag =/* glsl */`
#ifdef USE_MAP

	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	diffuseColor *= sampledDiffuseColor;
	diffuseColor = vColor;

#endif
`;

const normal_frag =/* glsl */`
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
`;

const roughnessmap_frag =/* glsl */`
float roughnessFactor = roughness;
#ifdef USE_NORMALMAP
vec4 texelRoughness = texture2D( normalMap, vNormalMapUv );
roughnessFactor *= texelRoughness.b;
#endif
`;

const metalnessmap_frag =/* glsl */`
float metalnessFactor = metalness;
#ifdef USE_NORMALMAP
metalnessFactor *= 1.0 - texelRoughness.b;
#endif
`;