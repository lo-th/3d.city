import { Mesh, PlaneGeometry, NodeMaterial } from '../three/three.webgpu.js';
import { attribute, color, uniform, vec2, vec3, uv, dot, smoothstep, sub, float, vec4, sin, fract, add, If, Fn, clamp } from '../three/three.tsl2.js';

export class Vignette extends Mesh {

    //https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language#math

    constructor( o = {} ) {

        const geometry = new PlaneGeometry( 2, 2, 1, 1 );
        const material = new NodeMaterial();

        super(geometry, material);

        this._color = uniform( color( '#04060A' ) );
        this._offset = uniform( 1.05 );
        this._darkness = uniform( 1 );
        this._grain = uniform( 0.1 ); 

        //screenUV//

        const uv0 = uv();
        const self = this

        const position = attribute("position")
        this.material.vertexNode = vec4( position, 1.0 );


        this.material.colorNode = Fn( () => {

            const uv = vec2( uv0.sub( vec2( 0.5 ) ).mul( vec2( self._offset ) ) ).toVar();
            const alpha = float( smoothstep( 0.0, 1.0, dot( uv, uv ) ).sub( sub( 1.0, self._darkness ) ) ).toVar();
            const ret = vec4(self._color, alpha).toVar();

            // film grain noise
            If( self._grain.notEqual( 0.0 ), () => {

                const noise = float( fract( sin( dot( uv, vec2( 12.9898, 78.233 ).mul( 2.0 ) ) ).mul( 43758.5453 ) ) );
                const alphaAdd = ( noise.mul( self._grain ).mul( add( 0.5, alpha ) ) ).toVar();
                ret.assign( vec4( self._color, clamp(alpha.add(alphaAdd), 0.0, 1.0 ) ) );

            })

            return ret;

        } )();

        this.material.transparent = true
        this.material.depthWrite = false
        this.material.depthTest = false
        this.material.dithering = true
        this.material.toneMapped = true
        this.material.allowOverride = false
 
        Object.defineProperties(this, {

            color: {
                enumerable: true,
                //get: ( v ) => { console.log(this._color); return this._color.value.getHex(); },
                get: () => ( this._color.value.getHex() ),
                set: ( v ) => { this._color.value.setHex( v ) },
            },
            offset: {
                enumerable: true,
                get: () => ( this._offset.value ),
                set: ( v ) => { this._offset.value = v },
            },
            darkness: {
                enumerable: true,
                get: () => ( this._darkness.value ),
                set: ( v ) => { this._darkness.value = v },
            },
            grain: {
                enumerable: true,
                get: () => ( this._grain.value ),
                set: ( v ) => { this._grain.value = v },
            },
        })

        this.frustumCulled = false;
        this.renderOrder = 100000;
        this.matrixAutoUpdate = false;

    }

    raycast() {

        return

    }

    dispose () {

        this.parent.remove(this);
        this.geometry.dispose()
        this.material.dispose()
        
    }

}