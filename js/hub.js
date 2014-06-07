
//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//

var HUB = { REVISION: '0.1a' };

HUB.Base = function(){
	this.hub = document.getElementById('hub');
	this.full = null;
	this.title = null;

	this.intro();
	this.timer = null;
	this.bg = 1;

	this.buttons = [];
}

HUB.Base.prototype = {
    constructor: HUB.Base,
    init:function() {
    },
    intro:function(){
    	this.full = document.createElement('div'); 
    	this.full.style.cssText ='position:absolute; background:rgba(102,102,230,1); top:0px; left:0px; width:100%; height:100%; pointer-events:none; display:block;';
    	this.title = this.createLabel("3D.CITY", [200, 80]);
    	this.title.style.cssText = 'position:absolute; top:50%; left:50%; margin-top:-40px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';

    	this.full.appendChild( this.title );
    	this.hub.appendChild( this.full );
    },
    start:function(){
    	if(this.full !== null){
    		this.timer = setInterval(this.fadding, 100, this);
    	}
    },
    fadding:function(t){
    	t.bg -= 0.1;
    	t.full.style.background = 'rgba(102,102,230,'+t.bg+')';
    	if(t.bg<=0){
    		clearInterval(t.timer);
    		t.full.removeChild(t.title);
    		t.hub.removeChild(t.full);
    		t.initStartHub();
    		t.full = null;
    	}
    },
    initStartHub : function(){
    	this.addButton('New Map', newMap );
    	this.addButton('Play Game', playMap );
    	this.addButton('Play 2D', play2d );
        //this.addButton('Tool Test', testTool );
    },
    initGameHub : function(){
        this.removeButtons();
        var bname = ['none', 'residential','commercial','industrial','Police', 'Fire','Port','airport','stadium', 'coal','nuclear','road','rail','wire','park','query','bulldozer'];
        for(var i = 0; i<bname.length; i++){
            this.addButton(bname[i], null, [70,30] );
        }
        for(var i = 0; i<this.buttons.length; i++){
            this.buttons[i].name = i;
            this.buttons[i].addEventListener('click',  function(e){addTool(this.name)}, false);
        }
    },
    addButton : function(name, fun, size){
        if(!size) size = [140, 40];
    	var b = this.createLabel(name, size, true);
    	if(size[0]>100) b.style.cssText = 'margin:10px; pointer-events:auto; border:1px solid rgba(255,255,255,0);';
        else b.style.cssText = 'margin:4px; pointer-events:auto; border:1px solid rgba(255,255,255,0);';
    	this.hub.appendChild( b );

    	b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '1px solid rgba(255,255,255,1)'; this.style.backgroundColor = 'rgba(0,0,0,0.3)';  }, false );
	    b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '1px solid rgba(255,255,255,0)'; this.style.backgroundColor = 'rgba(255,255,255,0)';  }, false );
	    if(fun!==null) b.addEventListener('click', fun || function(e){}, false);

    	this.buttons.push(b);
    },
    removeButtons : function(){
        var i = this.buttons.length;
        while(i--){
            this.hub.removeChild( this.buttons[i] );
        }
        this.buttons = [];
    },
    createLabel : function(text, size, b) {
		var color = 'white';//'rgba(255,255,255,1)'; //"#FFFFFF";
		if(!size) size = [100, 100];

		var c = document.createElement("canvas");
		c.width = size[0];
		c.height = size[1];

		var px = c.width *0.5;
		var py = c.height *0.5;

		ctx = c.getContext("2d");
		//ctx.font = 'italic '+40+'pt Calibri';
		ctx.font = 'bold '+26+'pt Calibri';
		if(b){
            if(size[0]>100) ctx.font = 'bold '+20+'pt Calibri';
            else ctx.font = 'normal '+10+'pt Calibri';
        }
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		
		ctx.fillStyle = 'rgba(0,0,0,0.1)';//'red'
		ctx.fillText(text, px-1, py-1);
		ctx.fillStyle = 'rgba(0,0,0,0.5)';//'cyan'
		ctx.fillText(text, px+1, py+1);
		ctx.fillStyle = color;
		ctx.fillText(text, px, py);

		if(b){
			ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			ctx.lineWidth=2;
			ctx.strokeRect(0,0,c.width,c.height);
		}
		return c;
	}
}
