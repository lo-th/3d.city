export const Base = {

    toolSet: [
        {id:0,  tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'     ,drag:0 },
		{id:1,  tool:'residential', geo:1,    name:'R', build:1, size:3, sy:0.2,  price:100,   color:'#27a866'  ,drag:1 },
		{id:2,  tool:'commercial',  geo:2,    name:'C', build:1, size:3, sy:0.2,  price:100,   color:'#447dab'  ,drag:1 },
		{id:3,  tool:'industrial',  geo:3,    name:'I', build:1, size:3, sy:0.2,  price:100,   color:'#d4cd2a'  ,drag:1 },

		{id:4,  tool:'police',      geo:4,    name:'',  build:1, size:3, sy:1.2,  price:500,   color:'#006ba2'  ,drag:0 },
		{id:5,  tool:'park',        geo:5,    name:'',  build:1, size:1, sy:0.02, price:10,    color:'#abaa2b'  ,drag:0 },
		{id:6,  tool:'fire',        geo:7,    name:'',  build:1, size:3, sy:1.2,  price:500,   color:'#d82d00'  ,drag:0 },

		{id:7,  tool:'road',        geo:0,    name:'',  build:0, size:1, sy:0.1,  price:10,    color:'#515151'  ,drag:1 },
		{id:8,  tool:'bulldozer',   geo:0,    name:'',  build:0, size:1, sy:0,    price:1,     color:'#ff7902'  ,drag:1 },
		{id:9,  tool:'rail',        geo:0,    name:'',  build:0, size:1, sy:0.15, price:20,    color:'#aa9891'  ,drag:1 },

		{id:10, tool:'coal',        geo:8,    name:'',  build:1, size:4, sy:2,    price:3000,  color:'#c3ff00'  ,drag:0 },
		{id:11, tool:'wire',        geo:0,    name:'',  build:0, size:1, sy:0.05, price:5 ,    color:'#c3ff00'  ,drag:1 },	
		{id:12, tool:'nuclear',     geo:9,    name:'',  build:1, size:4, sy:2,    price:5000,  color:'#c3ff00'  ,drag:0 },

		{id:13, tool:'port',        geo:10,   name:'',  build:1, size:4, sy:0.5,  price:3000,  color:'#6c6fee'  ,drag:0 },
		{id:14, tool:'stadium',     geo:11,   name:'',  build:1, size:4, sy:2,    price:5000,  color:'#cdcdcd'  ,drag:0 },
		{id:15, tool:'airport',     geo:12,   name:'',  build:1, size:6, sy:0.5,  price:10000, color:'#888888'  ,drag:0 },
		
		{id:16, tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'     ,drag:0 },
		{id:17, tool:'query',       geo:0,    name:'?', build:0, size:1, sy:0,    price:0,     color:'cyan'     ,drag:0 },
		{id:18, tool:'none',        geo:0,    name:'',  build:0, size:0, sy:0,    price:0,     color:'none'     ,drag:0 }
	],

	H: [ 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260 ],
	R: [ 244, 265, 274, 283, 292, 301, 310, 319, 328, 337, 346, 355, 364, 373, 382, 391, 400, 409, 418 ],
	C: [ 427, 436, 445, 454, 463, 475, 481, 490, 499, 508, 517, 526, 535, 544, 553, 562, 571, 580, 589, 598, 607 ],
	I: [ 616, 625, 634, 643, 652, 661, 670, 679, 688 ],

}

export const Zone = ( size, x, y, v ) => {

	let zone;

    
	//      -Y
	//      |
	// -X --+-- +X
	//      |
	//     +Y

	//      N
	//      |
	//  W --+-- E
	//      |
	//      S

	//   +----
	//   |   |
	//   -----

	switch(size){
		case 0: 
        zone = []
		/*zone = [
			[x, y], [x+1, y],[x, y-1],
			[x, y-1], [x+1, y-1]
		];*/
		if(v===5 || v===6) zone = [[x, y], [x+1, y]] // S
		//if(v===9 || v===10) zone = [[x, y]]
		if(v===13 || v===14) zone = [] // N
		//if(v===17 || v===18) zone = [[x, y]]

		if(v===7 || v===8) zone = [[x, y],  [x+1, y+1]]
		//if(v===11 || v===12) zone = [ [x+1, y], [x, y+1]]
		if(v===17 || v===18) zone = [[x, y], [x, y+1]]
	    if(v===19 || v===20) zone = [ [x+1, y], [x, y+1]]
		//if(v===19 || v===20) zone = [[x, y], [x, y+1], [x-1, y], [x-1, y+1] ]
			
		break;
		case 1: 
		zone = [ 
			[x, y] 
		];
		break;
		case 2: 
		zone = [
			[x, y], [x+1, y],
			[x, y+1], [x+1, y+1]
		];
		break;
		case 3: 
		zone = [ 
		    [x, y], [x-1, y], [x+1, y], 
		    [x, y-1], [x-1, y-1], [x+1, y-1], 
		    [x, y+1], [x-1, y+1], [x+1, y+1]
		];
		break;
		case 4: 
		zone = [ 
			[x, y], [x-1, y], [x+1, y], [x, y-1], 
			[x-1, y-1], [x+1, y-1], [x, y+1], [x-1, y+1], 
			[x+1, y+1], [x+2, y-1], [x+2, y], [x+2, y+1],
			[x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2]  
		];
		break;
		case 6: 
		zone = [ 
			[x, y], [x-1, y], [x+1, y], [x, y-1], [x-1, y-1], [x+1, y-1],   
			[x, y+1], [x-1, y+1], [x+1, y+1], [x+2, y-1], [x+2, y] , [x+2, y+1] , 
			[x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2], [x+3, y-1], [x+4, y-1],   
			[x+3, y], [x+4, y], [x+3, y+1], [x+4, y+1], [x+3, y+2], [x+4, y+2], 
			[x+3, y+3], [x+4, y+3], [x+3, y+4], [x+4, y+4], [x-1, y+3], [x-1, y+4], 
			[x, y+3], [x, y+4],  [x+1, y+3], [x+1, y+4], [x+2, y+3], [x+2, y+4]
		];
		break;
	}

	return zone;

}

export const ZoneExtand = ( size, x, y, v ) => {

	let zone;


	switch(size){
		case 1: 
		zone = [ 
			[x, y] 
		];
		break;
		case 2: 
		zone = [
			[x, y], [x+1, y],
			[x, y+1], [x+1, y+1]
		];
		break;
		case 3: 
		zone = [ 
		    [x-1, y], [x, y], [x+1, y], [x+2, y],
		    [x, y-1], [x-1, y-1], [x+1, y-1], [x+2, y-1],
		    [x, y+1], [x-1, y+1], [x+1, y+1], [x+2, y+1],
		    [x, y+2], [x-1, y+2], [x+1, y+2], [x+2, y+2]
		];
		break;
		case 4: 
		zone = [ 
			[x, y], [x-1, y], [x+1, y], [x+2, y], 
			[x, y-1], [x-1, y-1], [x+1, y-1], [x, y+1], [x-1, y+1], 
			[x+1, y+1], [x+2, y-1], [x+2, y+1],
			[x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2]  
		];
		break;
		case 6: 
		zone = [ 
			[x, y], [x-1, y], [x+1, y], [x, y-1], [x-1, y-1], [x+1, y-1],   
			[x, y+1], [x-1, y+1], [x+1, y+1], [x+2, y-1], [x+2, y] , [x+2, y+1] , 
			[x+2, y+2], [x-1, y+2], [x, y+2], [x+1, y+2], [x+3, y-1], [x+4, y-1],   
			[x+3, y], [x+4, y], [x+3, y+1], [x+4, y+1], [x+3, y+2], [x+4, y+2], 
			[x+3, y+3], [x+4, y+3], [x+3, y+4], [x+4, y+4], [x-1, y+3], [x-1, y+4], 
			[x, y+3], [x, y+4],  [x+1, y+3], [x+1, y+4], [x+2, y+3], [x+2, y+4]
		];
		break;
	}

	return zone;

}