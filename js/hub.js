
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
        //this.full.style.cssText ='position:absolute; background:rgba(102,102,230,1); top:0; left:0; bottom:0; right:0%; pointer-events:none; display:block;  text-align:center;';
    	this.title = this.createLabel("3D.CITY", [200, 80]);
    	this.title.style.cssText = 'position:absolute; top:50%; left:50%; margin-top:-40px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';
        this.subtitle = document.createElement('div');
        this.subtitle.style.cssText = 'position:absolute; top:50%; left:50%; margin-top:20px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';
        this.subtitle.innerHTML = "Generating world...";

    	this.full.appendChild( this.title );
        this.full.appendChild( this.subtitle );
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

    //--------------------------------------start hub

    initStartHub : function(){
    	this.addButton('New Map');
        this.addButton('Height Map');
    	this.addButton('Play Game');

        this.buttons[0].addEventListener('click',  function ( e ) { e.preventDefault(); newMap(); }, false);
        this.buttons[1].addEventListener('click',  function ( e ) { e.preventDefault(); newHeightMap(); }, false);
        this.buttons[2].addEventListener('click',  function ( e ) { e.preventDefault(); playMap(); }, false);
    },

    //--------------------------------------game hub

    initGameHub : function(){
        this.removeButtons();
        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText ='position:absolute; top:60px; right:12px; width:180px; height:500px; pointer-events:none; display:block;';
        this.hub.appendChild( this.toolSet );
        this.toolInfo = document.createElement('div');
        this.toolInfo.style.cssText ='margin-left:10px; margin-right:10px; margin-top:10px; width:160px; height:40px; pointer-events:none; font-size:14px;';
        this.toolSet.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = "Selecte<br>Tool";

        var bname = ['MOVE', 'residential','commercial','industrial','Police', 'park', 'Fire','road','bulldozer','rail','coal','wire','nuclear', 'Port','stadium','airport','query'];
        for(var i = 0; i<bname.length; i++){
            if(i==0) this.addButton(bname[i], [180,40] );
            else if(i<4)this.addButton(bname[i], [50,70], true, this.showToolInfo );
            else this.addButton(bname[i], [50,50], true, this.showToolInfo );
        }
        for(var i = 0; i<this.buttons.length; i++){
            this.buttons[i].name = i;
            this.buttons[i].addEventListener('click',  function(e){ e.preventDefault(); selectTool(this.name); }, false);
        }

        this.infoSet = document.createElement('div');
        this.infoSet.style.cssText ='position:absolute; top:12px; left:12px; width:180px; height:500px; pointer-events:none; display:block;';
        this.infoMsg = document.createElement('div');
        this.infoMsg.style.cssText ='margin-left:10px; margin-right:10px; margin-top:10px; width:160px; height:40px; pointer-events:none; font-size:14px;';
        this.infoSet.appendChild( this.infoMsg );
        this.hub.appendChild( this.infoSet );
    },

    // 

    //------------------------------------------

    showInfo : function(){
        if(this.infoMsg)this.infoMsg.innerHTML = gameData.join("\n");
    },


    showToolInfo : function(id, t){
        var name = view3d.toolSet[id].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase()//name[0].toUpperCase();

        t.toolInfo.innerHTML = name+'<br>'+view3d.toolSet[id].price+"$";
    },


    addButton : function(name, size, tool, extra){
        if(!size) size = [140, 40];
    	var b = this.createLabel(name, size, true);
    	if(!tool){
            if(name == 'MOVE'){
                b.style.cssText = 'position:absolute; right:0; top:0; margin:10px; pointer-events:auto; border:2px solid rgba(255,255,255,0);';
                this.hub.appendChild( b );
            } else {
                b.style.cssText = 'margin:10px; pointer-events:auto; border:2px solid rgba(255,255,255,0);';
                this.hub.appendChild( b );
            }
        } else {
            b.style.cssText = 'margin:2px; pointer-events:auto; border:2px solid rgba(255,255,255,0);';
            this.toolSet.appendChild( b );
        }

        var _this = this;
    	b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '2px solid rgba(255,255,255,1)'; this.style.backgroundColor = 'rgba(0,0,0,0.3)'; if(extra) extra(this.name, _this) }, false );
	    b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '2px solid rgba(255,255,255,0)'; this.style.backgroundColor = 'rgba(255,255,255,0)';   }, false );
	    //if(fun!==null) b.addEventListener('click', fun || function(e){}, false);

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
			ctx.strokeStyle = 'rgba(255,255,255,1)';
			ctx.lineWidth=4;
			ctx.strokeRect(0,0,c.width,c.height);
		}
		return c;
	}
}
