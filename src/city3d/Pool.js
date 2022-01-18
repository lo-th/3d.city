import * as THREE from '../../build/three.module.js'
import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
import { RGBELoader } from '../jsm/loaders/RGBELoader.js';

export class Pool {

	constructor( callback, tileSize=64, normal=true, roughness=false, pixel=false ) {

		this.sky = 'day';

		this.callback = callback;

		this.tileSize = tileSize
		this.isWithNormal = normal 
		this.isWithRoughness = roughness
		this.isPixelStyle = pixel

		this.loaderGLB = new GLTFLoader();
    	let dracoLoader = new DRACOLoader().setDecoderPath( './build/draco/' )
    	this.loaderGLB.setDRACOLoader( dracoLoader )

		this.mapPath = './assets/textures/'
		this.modelPath = './assets/models/'

		this.modelSrc = [ 'cars', 'world' ];

		this.imgSrc = ['tiles.png','town.png','building.png', 'cars.png' ];

		if( this.isWithNormal ) this.imgSrc.push( 'tiles_n.png', 'building_n.png', 'town_n.png' )
		if( this.isWithRoughness ) this.imgSrc.push( 'tiles_r.png', 'building_r.png', 'town_r.png' )
		this.imgSrc.push( 'border.jpg', 'border_a.jpg' )

		this.imgs = [];
		this.num = 0;

		this.tiles = {
			normal:[],
			roughness:[],
			texture:[],
		}

		this.color = {
			ground:'#c68564',
			normal:'#8080ff',
			snow:'#e6f0ff',
			white:'#ffffff',
			lightGrey:'#CCCCCC',
			metal:'#AAAAAA',
			sky:'#8397ac',
		}

		this.textures = {}
		this.geos = {}

		this.loadEnvmap()

	}

	displayMessage( str ){

		if( hub ) hub.message( str )

	}
 

	//----------------------------------- ENVMAP

	loadEnvmap() {

		this.displayMessage( 'Loading envmap ...' )

		new RGBELoader().load( this.mapPath + this.sky + '.hdr', function ( texture ) {

			this.env = texture;
			this.loadImages();

		}.bind(this))

	}


	//----------------------------------- TEXTURES

	loadImages() {

		this.displayMessage( 'Loading images ...' )

		let n = this.num;
		let url = this.imgSrc[n]
		let name = url.substring( url.lastIndexOf('/')+1, url.lastIndexOf('.') );


    	this.imgs[name] = new Image();
    	this.imgs[name].onload = function(){ 
    		this.num++;
    		if( this.num === this.imgSrc.length ) this.defineCanvas();
    		else this.loadImages();
    	}.bind(this);
        this.imgs[name].src = this.mapPath + url; 

	}



	defineCanvas() {

		this.num = 0;

		this.canvas = {
			town: this.makeCanvas( 'town' ),
			building: this.makeCanvas( 'building' ),
			tiles: this.makeCanvas( 'tiles', true ),
		}

		if( this.isWithNormal ) this.canvas[ 'tiles_n' ] = this.makeCanvas( 'tiles_n', true )
		if( this.isWithRoughness ) {
			this.canvas[ 'tiles_r' ] = this.makeCanvas( 'tiles_r', true )
			this.canvas[ 'town_r' ] = this.makeCanvas( 'town_r' )
			this.canvas[ 'building_r' ] = this.makeCanvas( 'building_r' )
		}

	    this.drawCanvas()

	    this.makeCarColor()

	}

	makeCanvas( name, resize ) {

		let r = resize && this.tileSize === 32 ? 0.5 : 1;

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

			ctx = c.getContext('2d');
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

			 ctx.drawImage( this.imgs[ name ], 0, 0, c.width, c.height );
		
		}

		this.defineTextures()

	}

	//this.tint( this.townCanvas, this.imgs[1], this.imgs[4] );
	//this.tint( this.buildingCanvas, this.imgs[2], this.imgs[3] );


	defineTextures() {

		this.makePixelData( 'tiles' )

		this.textures['town'] = new THREE.Texture( this.canvas.town );
		this.filterTexture( this.textures['town'], { flip:false } )

        this.textures['building'] = new THREE.Texture( this.canvas.building );
        this.filterTexture( this.textures['building'], { flip:false } )

        if( this.isWithNormal ){

        	this.makePixelData( 'tiles_n' )

        	this.textures['town_n'] = new THREE.Texture( this.imgs['town_n'] );
			this.filterTexture( this.textures['town_n'], { flip:false, normal:true } )

	        this.textures['building_n'] = new THREE.Texture( this.imgs['building_n'] );
	        this.filterTexture( this.textures['building_n'], { flip:false, normal:true } )

        }

        if( this.isWithRoughness ){

        	this.makePixelData( 'tiles_r' )

        	this.textures['town_r'] = new THREE.Texture( this.canvas.town_r );
			this.filterTexture( this.textures['town_r'], { flip:false, normal:true } )

	        this.textures['building_r'] = new THREE.Texture( this.canvas.building_r );
	        this.filterTexture( this.textures['building_r'], { flip:false, normal:true } )

        }

        this.textures['border'] = new THREE.Texture( this.imgs['border'] );
		this.filterTexture( this.textures['border'], { flip:false } )

		this.textures['border_a'] = new THREE.Texture( this.imgs['border_a'] );
		this.filterTexture( this.textures['border_a'], { flip:false } )

        this.loadModel()

	}

	filterTexture ( texture, o = {} ){

    	if( !o.normal ) texture.encoding = THREE.sRGBEncoding
    	if( o.flip !== undefined ) texture.flipY = o.flip
    	if( o.midmap !== undefined ) texture.generateMipmaps = o.midmap;
    	if( o.alpha !== undefined ) texture.premultiplyAlpha = o.alpha;

    	if( this.isPixelStyle ){
    		texture.magFilter = THREE.NearestFilter;
    	    texture.minFilter = THREE.LinearMipMapLinearFilter;
    	} else {
    		texture.magFilter = THREE.LinearFilter;
    	    texture.minFilter = THREE.LinearMipmapLinearFilter;
    	}
    	
    	//texture.anisotropy = this.anisotropy;
    	texture.needsUpdate = true;

    }


    makePixelData( name ) {

		let ctx = this.canvas[ name ].getContext('2d')
		let pix = this.tileSize, x, y

		for ( let i = 0; i < 240; i++ ){

			x = ( i % 32 ) * pix;
			y = Math.floor( i / 32 ) * pix;
			let data = ctx.getImageData(x, y, pix, pix).data;
			if ( name === 'tiles_n' ) this.tiles.normal[i] = new THREE.DataTexture( data, pix, pix );
			else if ( name === 'tiles_r' ) this.tiles.roughness[i] = new THREE.DataTexture( data, pix, pix );
			else this.tiles.texture[i] = new THREE.DataTexture( data, pix, pix );

		}

	}


	tint( canvas, image, supImage ) {

		let data, i, n;
		let pixels = canvas.width*canvas.height;
	    let ctx = canvas.getContext('2d');
	    
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

	}

	//----------------------------------- TITLE

	rand ( low, high ) { return low + Math.random() * ( high - low ); }

	makeTitleTexture ( n = 0 ) {

		let color = [ this.color.metal, '#fff' ]
		if(n===1) color = [ '#333333', '#999999' ]
		if(n===2) color = [ '#000', '#999999' ]

	    let s = 0.25

		let c = document.createElement( 'canvas' );
		c.width = c.height = 1024*s;
		let ctx = c.getContext('2d');

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

		let c = document.createElement( 'canvas' );
		c.width = c.height = 1024;
		let ctx = c.getContext('2d');
		let i, n=0, j=0, k = 3;

		while(k--){

			ctx.clearRect ( 0 , 0, c.width, c.height );

			for( i=0; i<16; i++ ){
				ctx.beginPath();
				if(i!==11 && i!==15) ctx.fillStyle = this.carColor();
				ctx.rect(n*256, j*256, 256, 256);
				ctx.fill();
				n++
				if(n==4){ n=0; j++; }
			}

			ctx.drawImage( this.imgs.cars, 0, 0 );
			let name = 'cars_' + k
			this.textures[name] = new THREE.Texture( c );
	        this.filterTexture( this.textures[name], { flip:false } )

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

	randInt( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }

	tile( type, id ) {
		return this.tiles[type][id];
	}

	texture( name ) {
		return this.textures[name];
	}


	//----------------------------------- 3D MODEL

	loadModel() {

		this.displayMessage( 'Loading 3d model ...' )

		let n = this.num;
		let name = this.modelSrc[n]

	    this.loaderGLB.load( this.modelPath + name + '.glb', function ( gltf ) {

	    	let o = {}, b1, b2, t;
	    	gltf.scene.traverse( function ( node ) {
	    		if( node.name === 'title' ) t = node;
	    		if( node.name === 'border' ) b1 = node;
	    		if( node.name === 'border_min' ) b2 = node;
				if( node.isMesh && !o[node.name] ) o[node.name] = node.geometry;
			})
			if(b1) this.border = b1;
			if(b2) this.border_min = b2;
			if(t) this.title = t;
			this.defineGeometry( o, name )

	    	this.num++;
			if( this.num === this.modelSrc.length ){ 
				this.displayMessage( '...' )
				this.callback()
			} else {
				this.loadModel()
			}

	    }.bind(this))

	}

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
