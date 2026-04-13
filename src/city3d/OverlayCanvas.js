import * as THREE from '../three/three.webgpu.js'
import { AppState } from '../AppState.js'


export class OverlayCanvas  {

	constructor () {

		this.canvas = document.createElement("canvas");
	    
	    this.canvas.width = AppState.selectedMapSize[0];
	    this.canvas.height = AppState.selectedMapSize[1];

	    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

	    this.texture = new THREE.Texture( this.canvas );
	    this.texture.colorSpace = THREE.SRGBColorSpace;
	    this.texture.needsUpdate = true;

	}

	draw( type, data ){

		//console.log(data)
		this.ctx.fillStyle = '#FF00FF';
	    this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height );
		const topData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
		const td = topData.data;

		let n = 0, v, d
		for(let i=0; i<data.length; i++){
			n = i*4
			v = data[i]

			if(v===0){
				td[n] = 255;
				td[n+1] = 255;
				td[n+2] = 255;
			} else {
				if(v > 0){
					td[n] = v;
					td[n+1] = 255-v;
					td[n+2] = 255-v;
				}else{
					td[n] = 255+v;
					td[n+1] = 255+v;
					td[n+2] = -v;
				}
			}

			td[n+3] = 1;



			
			
		}

		//console.log(data.length, topData.data.length / 4)

		this.ctx.putImageData(topData, 0, 0);




		this.texture.needsUpdate = true;

	}


}
