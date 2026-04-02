import * as THREE from '../three/three.webgpu.js'

export const AutoTexture = {

	powerTexture: () => {

	    let c = document.createElement("canvas");
	    let ctx = c.getContext("2d");
	    c.width = c.height = 64;
	    let grd = ctx.createLinearGradient(0,0,64,64);
		grd.addColorStop(0.3,"yellow");
		grd.addColorStop(1,"red");
		ctx.beginPath();
		ctx.moveTo(44,0);
		ctx.lineTo(10,34);
		ctx.lineTo(34,34);
		ctx.lineTo(20,64);
		ctx.lineTo(54,30);
		ctx.lineTo(30,30);
		ctx.lineTo(44,0);
		ctx.closePath();
		ctx.strokeStyle="red";
		ctx.stroke();
		ctx.fillStyle = grd;
		ctx.fill();
	    let texture = new THREE.Texture(c);
	    texture.needsUpdate = true;
	    return texture;

	},

	gradTexture:(color) => {

		// for fake sky

	    let c = document.createElement("canvas");
	    let ctx = c.getContext("2d");
	    c.width = 16; c.height = 256;
	    let gradient = ctx.createLinearGradient(0,0,0,256);
	    let i = color[0].length;
	    while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
	    ctx.fillStyle = gradient;
	    ctx.fillRect(0,0,16,256);
	    //this.tint(c);
	    //let texture = new THREE.Texture(c);
	    //texture.needsUpdate = true;
	    return c;
	},

	tint: (canvas, image, supImage, dayTime, tcolor, skyCanvasBasic)  => {

		let data, i, n;
		let pixels = canvas.width*canvas.height;
	    let ctx = canvas.getContext('2d');
	    
	    // draw windows
	    let topData = null;
	    let newImg = null;
	    if(supImage && dayTime!==0 && dayTime!==1){
	    	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	        ctx.drawImage(supImage, 0, 0);
	        topData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	        data = topData.data;
	        i = pixels;
	        while(i--){
	        	n = i<<2;
	        	if(data[n+3] !== 0){
	        		if(data[n+0]==0 && data[n+1]==0 && data[n+2]==0){// black
	        		    data[n+3]=60;
	        		}
	        		if(data[n+1]==0){
	        		//if(data[n+0]==255 && data[n+1]==0 && data[n+2]==0){// red
	        			if(dayTime==3) data[n+1]=255;
	        			if(dayTime==2) {data[n+0]=0; data[n+3]=60;}
	        		}

	        	}
	        }
	        ctx.putImageData(topData, 0, 0);
	        newImg = document.createElement('img');
	        newImg.src = canvas.toDataURL("image/png");
	    }

	    if(image){
	    	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	        ctx.drawImage(image, 0, 0);
	    } else {
	    	ctx.drawImage(skyCanvasBasic, 0, 0);
	    }

	    if(dayTime!==0){
		    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		    data = imageData.data;
		    i = pixels;
		    let c = tcolor;
		    while(i--){
		    	n = i<<2;//i*4;
		    	data[n+0] = data[n+0] * (1-c.a) + (c.r*c.a);
			    data[n+1] = data[n+1] * (1-c.a) + (c.g*c.a);
			    data[n+2] = data[n+2] * (1-c.a) + (c.b*c.a);
		    }
		    ctx.putImageData(imageData, 0, 0);
		    if(newImg){
		    	ctx.drawImage(newImg, 0, 0);
		    }
		}
	}

}