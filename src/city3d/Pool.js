import * as THREE from '../three/three.webgpu.js';
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
import { HDRLoader } from '../jsm/loaders/HDRLoader.js';

import { LUTCubeLoader } from '../jsm/loaders/LUTCubeLoader.js';
import { LUT3dlLoader } from '../jsm/loaders/LUT3dlLoader.js';
import { LUTImageLoader } from '../jsm/loaders/LUTImageLoader.js';

import { AppState } from '../AppState.js'
//import { KTX2Loader } from '../jsm/loaders/KTX2Loader.js';
//import { KTX2Exporter } from '../jsm/exporters/KTX2Exporter.js';


const mapPath = './assets/textures/'
const modelPath = './assets/models/'

export class Pool {

	constructor(  ) {

		this.imgs = [];
		this.num = 0;

		this.tiles = {
			normal:[],
			roughness:[],
			texture:[],
		}

		this.color = AppState.color;
		this.textures = {}
		this.geos = {}

		this.modelUrl = [ 'cars.glb', 'world.glb' ];
		this.textureUrl = [ 'ground1k.png','ground2k.png', 'ground1k_n.png','ground2k_n.png','title.png', 'water_n.jpg', 'building_nr.png', 'town_nr.png',  'roadx.png', 'road.png', 'feux.png', 'light_a.png' ];
		this.imageUrl = ['tiles.png','town.png','building.png', 'cars.png', 'border.png' ];

		if( AppState.isWithNormal ) this.imageUrl.push( 'tiles_n.png', 'building_n.png', 'town_n.png' )
		if( AppState.isWithRoughness ) this.imageUrl.push( 'tiles_r.png', 'building_r.png', 'town_r.png' )

		let type = 'js'
		if ( navigator.userAgentData ) type = 'wasm'
        else {
            let ua = navigator.userAgent.toLowerCase()
            type = (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) ? 'js' : 'wasm'
        }

    	let dracoLoader = new DRACOLoader().setDecoderPath( './build/draco/' )
    	dracoLoader.setDecoderConfig( { type: type } )

    	this.loaderGLB = new GLTFLoader().setDRACOLoader( dracoLoader ).setPath( modelPath );
    	this.loaderHDR = new HDRLoader();
    	this.loaderHDR = new HDRLoader();
    	this.loaderTexture = new THREE.TextureLoader().setPath( mapPath );
    	this.loaderImage = new THREE.ImageLoader().setPath( mapPath );
		
	}

	async load( callback ){

		//this.callback = callback;

		if( AppState.LUT_on ) await this.loadLUT();
		await this.loadEnvmap()
		await this.loadTexture()
		await this.loadImage()
		await this.loadModel()

		//console.log(this.textures)

		//this.callback()

	}

	displayMessage( str ){

		AppState.hub.message( str )

	}

	//----------------------------------- LUT

	async loadLUT(){

		this.displayMessage( 'Loading Lut ...' )

		const path = './assets/luts/'

		const lutCubeLoader = new LUTCubeLoader();
		const lutImageLoader = new LUTImageLoader();
		const lut3dlLoader = new LUT3dlLoader();

		const lutMap = AppState.LUT_Map

		for ( const name in lutMap ) {

			if ( /\.CUBE$/i.test( name ) ) {

				lutMap[ name ] = lutCubeLoader.loadAsync( path + name );

			} else if ( /\LUT$/i.test( name ) ) {

				lutMap[ name ] = lutImageLoader.loadAsync( path + `${name}.png` );

			} else {

				lutMap[ name ] = lut3dlLoader.loadAsync( path + name );

			}

		}

		const pendings = Object.values( lutMap );
		await Promise.all( pendings );

		for ( const name in lutMap ) {

			lutMap[ name ] = await lutMap[ name ];

		}

	}
 

	//----------------------------------- ENVMAP

	async loadEnvmap() {

		this.displayMessage( 'Loading envmap ...' )

		const envmap = {
			'background': this.loaderHDR.loadAsync( mapPath + AppState.envmap + '.hdr' ),
			'environment': this.loaderHDR.loadAsync( mapPath + AppState.envmap2 + '.hdr' )
		}

		const pendings = Object.values( envmap );
		await Promise.all( pendings );

		for ( const name in envmap ) {
			envmap[ name ] = await envmap[ name ];
			envmap[ name ].mapping = THREE.EquirectangularReflectionMapping;
		}

		this.envmap = envmap;

	}


	//----------------------------------- TEXTURES

	async loadTexture() {

		this.displayMessage( 'Loading texture ...' )

		let name, url, texture;

		for( let i = 0; i<this.textureUrl.length; i++ ){

			url = this.textureUrl[i];
			name = url.substring( url.lastIndexOf('/')+1, url.lastIndexOf('.') );
			this.textures[name] = this.loaderTexture.loadAsync( url );

		}

		const pendings = Object.values( this.textures );
		await Promise.all( pendings );

		for ( const name in this.textures ) {
			this.textures[ name ] = await this.textures[ name ];

			texture = this.textures[ name ]
			texture.flipY = false;
			texture.colorSpace = name.search('_')!==-1 ? THREE.NoColorSpace : THREE.SRGBColorSpace;

			if( name.search('ground')!==-1){
				texture.flipY = true;
				texture.generateMipmaps = false;
				//texture.format = THREE.RGBAFormat
				//texture.type = THREE.UnsignedByteType
				//texture.magFilter = THREE.LinearFilter;
    	        //texture.minFilter = THREE.LinearMipmapLinearFilter//LinearFilter;
			}

			if(name === 'water_n'){
				texture.wrapS = THREE.RepeatWrapping 
			    texture.wrapT = THREE.RepeatWrapping
			    texture.repeat = new THREE.Vector2(4,4);
			}

		}

	}

	//----------------------------------- IMAGES

	async loadImage() {

		this.displayMessage( 'Loading images ...' )

		let name, url;

		for( let i = 0; i<this.imageUrl.length; i++ ){

			url = this.imageUrl[i];
			name = url.substring( url.lastIndexOf('/')+1, url.lastIndexOf('.') );
			this.imgs[name] = this.loaderImage.loadAsync( url );

		}

		const pendings = Object.values( this.imgs );
		await Promise.all( pendings );

		for ( const name in this.imgs ) {
			this.imgs[ name ] = await this.imgs[ name ];
		}

		this.defineCanvas();

	}

	//----------------------------------- 3d MODEL

	async loadModel() {

		this.displayMessage( 'Loading 3d models ...' )

		const self = this;
		const models = {}
		const geometry = {}
		let name, url;

		for( let i = 0; i<this.modelUrl.length; i++ ){

			url = this.modelUrl[i];
			name = url.substring( url.lastIndexOf('/')+1, url.lastIndexOf('.') );
			models[name] = this.loaderGLB.loadAsync( url );

		}

		const pendings = Object.values( models );
		await Promise.all( pendings );

		for ( const name in models ) {

			models[ name ] = await models[ name ];

			models[ name ].scene.traverse( function ( node ) {
				if(node.isMesh){
					if( node.name === 'title' ) self.title = node;
		    		else if( node.name === 'border' ) self.border = node;
					else if( !geometry[node.name] ) {
						node.geometry.name = node.name;
						geometry[node.name] = node.geometry;
					}
				}
			})

			this.defineGeometry( geometry, name );

		}

	}




	//----------------------------------- CANVAS TO TEXTURE

	defineCanvas() {

		this.num = 0;

		this.canvas = {
			town: this.makeCanvas( 'town' ),
			building: this.makeCanvas( 'building' ),
			tiles: this.makeCanvas( 'tiles', true ),
		}

		if( AppState.isWithNormal ) this.canvas[ 'tiles_n' ] = this.makeCanvas( 'tiles_n', true )
		if( AppState.isWithRoughness ) {
			this.canvas[ 'tiles_r' ] = this.makeCanvas( 'tiles_r', true )
			this.canvas[ 'town_r' ] = this.makeCanvas( 'town_r' )
			this.canvas[ 'building_r' ] = this.makeCanvas( 'building_r' )
		}

		this.makeCarColor()
	    this.drawCanvas()
	    

	}

	makeCanvas( name, resize ) {

		let r = resize && AppState.tileSize === 32 ? 0.5 : 1;

		let img = this.imgs[name];
		let c = document.createElement("canvas")
		c.width = img.width*r
		c.height = img.height*r
		return c

	}

	drawCanvas() {

		let c, ctx;

		// TODO add color effect on canvas

		for( let name in this.canvas ){

			c = this.canvas[name];

			ctx = c.getContext('2d', { willReadFrequently: true });
			ctx.clearRect ( 0 , 0, c.width, c.height );
			if( name === 'tiles' || name === 'town' || name === 'building'){
				ctx.fillStyle = this.color.ground;
				ctx.fillRect( 0, 0, c.width, c.height )
			}
			if( name === 'tiles_n' ){
				ctx.fillStyle = this.color.normal;
				ctx.fillRect( 0, 0, c.width, c.height )
			}
			if( name === 'tiles_r' || name === 'town_r' || name === 'building_r'){
				ctx.fillStyle = this.color.lightGrey;
				ctx.fillRect( 0, 0, c.width, c.height )
			}

			//ctx.filter = 'hue-rotate(120deg) grayscale(10%) brightness(150%)';
			ctx.drawImage( this.imgs[ name ], 0, 0, c.width, c.height );
		
		}

		//this.changeColor('tiles',[ 130, 130, 183 ], [ 152, 135, 91 ]  )

		this.defineTextures()

	}

	changeColor( name, c1, c2, rr=1.1 ){

		const canvas = this.canvas[ name ];
		const ctx = canvas.getContext('2d', )
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height )
		const data = imageData.data;
		let i = data.length/4, n, r, g, b

		while(i--){
			n = i*4
			r = data[n]/c1[0]
			g = data[n+1]/c1[1]
			b = data[n+2]/c1[2]

			if(r<rr && g<rr && b<rr ){
				data[n] = c2[0]
				data[n+1] = c2[1]
				data[n+2] = c2[2]
			}
		
		}

		ctx.putImageData(imageData, 0, 0 );

	}

	//this.tint( this.townCanvas, this.imgs[1], this.imgs[4] );
	//this.tint( this.buildingCanvas, this.imgs[2], this.imgs[3] );


	defineTextures() {

		this.makePixelData( 'tiles' )

		this.textures['town'] = new THREE.Texture( this.canvas.town );
		this.filterTexture( this.textures['town'], { flip:false } )

        this.textures['building'] = new THREE.Texture( this.canvas.building );
        this.filterTexture( this.textures['building'], { flip:false } )

        if( AppState.isWithNormal ){

        	this.makePixelData( 'tiles_n' )

        	this.textures['town_n'] = new THREE.Texture( this.imgs['town_n'] );
			this.filterTexture( this.textures['town_n'], { flip:false, normal:true } )

	        this.textures['building_n'] = new THREE.Texture( this.imgs['building_n'] );
	        this.filterTexture( this.textures['building_n'], { flip:false, normal:true } )

        }

        if( AppState.isWithRoughness ){

        	this.makePixelData( 'tiles_r' )

        	this.textures['town_r'] = new THREE.Texture( this.canvas.town_r );
			this.filterTexture( this.textures['town_r'], { flip:false, normal:true } )

	        this.textures['building_r'] = new THREE.Texture( this.canvas.building_r );
	        this.filterTexture( this.textures['building_r'], { flip:false, normal:true } )

        }

        this.textures['border'] = new THREE.Texture( this.imgs['border'] );
		this.filterTexture( this.textures['border'], { flip:false } )

		

        //this.loadModel()

	}

	filterTexture ( texture, o = {} ){

    	if( !o.normal ) texture.colorSpace = THREE.SRGBColorSpace;//texture.encoding = THREE.sRGBEncoding
    	if( o.flip !== undefined ) texture.flipY = o.flip
    	//if( o.midmap !== undefined ) texture.generateMipmaps = o.midmap;
    	//if( o.alpha !== undefined ) texture.premultiplyAlpha = o.alpha;

    	/*if( AppState.isPixelStyle ){
    		texture.magFilter = THREE.NearestFilter;
    	    texture.minFilter = THREE.LinearMipMapLinearFilter;
    	} else {*/
    		texture.magFilter = THREE.LinearFilter;
    	    texture.minFilter = THREE.LinearFilter;//LinearMipmapLinearFilter;
    	//}

    	texture.generateMipmaps = false;
    	//texture.unpackAlignment = 4

    	//texture.format = THREE.FloatType;


    	//texture.magFilter = THREE.NearestFilter;
    	//texture.minFilter = THREE.NearestFilter;
    	//    texture.generateMipmaps = false
    	
    	//texture.anisotropy = this.anisotropy;
    	texture.needsUpdate = true;

    }


    makePixelData( name ) {

		let ctx = this.canvas[ name ].getContext('2d', { willReadFrequently: true })
		let pix = AppState.tileSize, x, y

		let data, texture;
		let n, lng = pix * pix

		for ( let i = 0; i < 240; i++ ){
			
			x = ( i % 32 ) * pix;
			y = Math.floor( i / 32 ) * pix;
			data = ctx.getImageData(x, y, pix, pix).data;
		    texture = new THREE.DataTexture( data, pix, pix )

		    //if(i===0 ) console.log(data)

			texture.flipY = true
			texture.needsUpdate = true;
			
			//const data2 = new Uint8Array( data );
			if ( name === 'tiles_n' ) this.tiles.normal[i] = texture;
			else if ( name === 'tiles_r' ) this.tiles.roughness[i] = texture;
			else this.tiles.texture[i] = texture;

		}

	}


	/*tint( canvas, image, supImage ) {

		let data, i, n;
		let pixels = canvas.width*canvas.height;
	    let ctx = canvas.getContext('2d', { willReadFrequently: true });
	    
	    // draw windows
	    let topData = null;
	    let newImg = null;
	    if(supImage && this.dayTime!==0 && this.dayTime!==1){
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
	        			if(this.dayTime==3) data[n+1]=255;
	        			if(this.dayTime==2) {data[n+0]=0; data[n+3]=60;}
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
	    	ctx.drawImage(this.skyCanvasBasic, 0, 0);
	    }

	    if( this.dayTime!==0 ){
		    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		    data = imageData.data;
		    i = pixels;
		    let c = this.tcolor;
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

	}*/

	//----------------------------------- TITLE

	rand ( low, high ) { return low + Math.random() * ( high - low ); }
	randInt( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }

	makeTitleTexture ( n = 0 ) {

		let color = [ this.color.metal, '#fff' ]
		if(n===1) color = [ '#333333', '#999999' ]
		if(n===2) color = [ '#000', '#999999' ]

	    let s = 0.25

		let c = document.createElement( 'canvas' );
		c.width = c.height = 1024*s;
		let ctx = c.getContext('2d', { willReadFrequently: true });

		ctx.beginPath();
		ctx.fillStyle = color[0];
		ctx.rect(0, 0, 1024*s, 1024*s);
		ctx.fill();

		let i = 8, r1, r2
		while(i--){
			r1 = this.rand( 150, 255 )
			r2 = this.rand( r1-60, r1-20 )
			ctx.beginPath();
			ctx.fillStyle = n!==1 ?  'rgb('+r1+','+r1+','+r2+')': color[1];
			ctx.rect( i*146*s, 0, 146*s, 200*s);
			ctx.fill();
		}

		let t = new THREE.Texture( c )
		this.filterTexture( t, { flip:false } )
		return t;

	}




	//----------------------------------- CARS

	makeCarColor () {

		let k = 4, c, ctx, i, n=0, j=0, tx, s = 0.25;

		while(k--){
			c = document.createElement( 'canvas' );
			c.width = c.height = 1024*s;
			ctx = c.getContext('2d');
			n = 0
			j = 0

			for( i=0; i<16; i++ ){
				ctx.beginPath();
				if(i!==11 && i!==15) ctx.fillStyle = this.carColor();
				ctx.rect(n*256*s, j*256*s, 256*s, 256*s);
				ctx.fill();
				n++
				if(n==4){ n=0; j++; }
			}

			ctx.drawImage( this.imgs.cars, 0, 0, 1024*s, 1024*s );
			let name = 'cars_' + k
			tx = new THREE.CanvasTexture( c );
			tx.flipY = false;
			tx.colorSpace = THREE.SRGBColorSpace;
			tx.needsUpdate = true;

			this.textures[name] = tx;

		}

	}

	carColor () {

		let carcolors = [
		[0xFFFFFF, 0xD0D1D3, 0XEFEFEF, 0xEEEEEE],//white
		[0x252122, 0x302A2B, 0x27362B, 0x2F312B],//black
		[0x8D9495, 0xC1C0BC, 0xCED4D4, 0xBEC4C4],//silver
		[0x939599, 0x424242, 0x5A5A5A, 0x747675],//gray
		[0xC44920, 0xFF4421, 0x600309, 0xD9141E],//red
		[0x4AD1FB, 0x275A63, 0x118DDC, 0x2994A6],//blue
		[0xA67936, 0x874921, 0xD7A56B, 0x550007],//brown
		[0x5FF12C, 0x188047, 0x8DAE29, 0x1AB619],//green
		[0xFFF10A, 0xFFFFBD, 0xFCFADF, 0xFFBD0A],//yellow/gold
		[0xB92968, 0x5C1A4F, 0x001255, 0xFFB7E7]//other
		];

		let l = this.randInt(0,9), n = this.randInt(0,3);
		let base = carcolors[l][n];
	    let resl = base.toString(16);
	    if(resl.length<6) resl = '#0'+resl;
	    else resl = '#'+resl;
		return resl;

	}

	//randInt( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }

	tile( type, id ) {
		return this.tiles[type][id];
	}

	texture( name ) {
		return this.textures[name];
	}


	//----------------------------------- 3D MODEL

	

	defineGeometry ( o, name ){

		let g, n;

		switch( name ){
    		case 'cars':

    		    g = { cars:[] }
    		    for( let c in o ){
    		    	n = Number( c.substring(4) )
    		    	g.cars[n] = o[c]
    		    }

    		break;
    		case 'world':

	    		g = {
					town:[
						null, null, null, null,
						o.police, o.park_1, o.park_2, o.fire,
						o.coal, o.nuclear, o.port, o.stadium, o.airport
					],
					tree:[
					    o.ttt3, o.ttt3, o.ttt4, o.ttt4,
					    o.ttt0, o.ttt1, o.ttt2, o.ttt5
					],
					sprite:[
					   o.train, o.elico.clone(), o.plane.clone()
					],

					feux:o.feux,
					feux_r:o.feux_r,
					feux_g:o.feux_g,
					feux_o:o.feux_o,

					residential:[],
					commercial:[],
					industrial:[],
					house:[]
				}

				// BASIC 
				let i = 9;
				while(i--) g.industrial[i] = o['i_0'+i]
				i = 19;
				while(i--) g.residential[i] = i<10 ? o['r_0'+i] : o['r_'+i]
				i = 21;
				while(i--) g.commercial[i] = i<10 ? o['c_0'+i] : o['c_'+i]
				i = 12;
				while(i--) g.house[i] = i<10 ? o['rh_0'+i] : o['rh_'+i]

    		break;
    	}

    	// ADD TO GEOS POOL 
		this.geos = { ...this.geos, ...g }

	}

	geo ( type, id ){
		return this.geos[type][id] || null;
	}


}
