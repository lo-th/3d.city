
//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//

var HUB = { REVISION: '0.1a' };

HUB.Base = function(){
	this.hub = document.getElementById('hub');
	this.full = null;
	this.title = null;

    this.isIntro = true;

	this.intro();
	this.timer = null;
	this.bg = 1;

	this.buttons = [];

    this.R=null;
    this.C=null;
    this.I=null;

    this.colors = ['#ffffff', '#338099'];//#377BA7

    this.radius = "-moz-border-radius: 60px; -webkit-border-radius: 60px; border-radius: 60px;";
}

HUB.Base.prototype = {
    constructor: HUB.Base,
    init:function() {
    },
    intro:function(){
    	this.full = document.createElement('div'); 
    	this.full.style.cssText ='position:absolute; background:rgba(102,102,230,1); top:0px; left:0px; width:100%; height:100%; pointer-events:none; display:block;';
        this.title = document.createElement('div');
        this.title.innerHTML = "3D.CITY";
    	this.title.style.cssText = 'position:absolute; font-size:40px; top:50%; left:50%; margin-top:-40px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';
        this.subtitle = document.createElement('div');
        this.subtitle.style.cssText = 'position:absolute; top:50%; left:50%; margin-top:20px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';
        this.subtitle.innerHTML = "Generating world...";

    	this.full.appendChild( this.title );
        this.full.appendChild( this.subtitle );
    	this.hub.appendChild( this.full );
    },
    start:function(){
    	if(this.isIntro){
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

            t.isIntro = false;
    		//t.full = null;
    	}
    },

    //--------------------------------------start hub

    initStartHub : function(){
        this.full = document.createElement('div'); 
        this.full.style.cssText ='position:absolute; top:30px; left:50%; margin-left:-154px; width:316px; pointer-events:none;';
        this.hub.appendChild( this.full );
        this.addButton('Play Game', [300,50, 40]);
    	this.addButton('New Map');
        this.addButton('Height Map');

        this.buttons[0].addEventListener('click',  function ( e ) { e.preventDefault(); playMap(); }, false);
        this.buttons[1].addEventListener('click',  function ( e ) { e.preventDefault(); newMap(); }, false);
        this.buttons[2].addEventListener('click',  function ( e ) { e.preventDefault(); newHeightMap(); }, false);
        

        this.addSelector("Difficulty", ['LOW', 'MEDIUM', 'HARD'], setDifficulty, 0);
    },

    //--------------------------------------game hub

    initGameHub : function(){
        this.removeSelector("Difficulty");
        this.removeButtons();
        this.hub.removeChild( this.full );
        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText ='position:absolute; top:60px; right:12px; width:200px; height:500px; pointer-events:none; display:block;';
        this.hub.appendChild( this.toolSet );
        this.toolInfo = document.createElement('div');
        this.toolInfo.style.cssText ='margin-left:10px; margin-right:10px; margin-top:10px; width:160px; height:40px; pointer-events:none; font-size:14px;';
        this.toolSet.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = "Selecte<br>Tool";

        var bname = ['MOVE', 'residential','commercial','industrial','Police', 'park', 'Fire','road','bulldozer','rail','coal','wire','nuclear', 'Port','stadium','airport','query', 'DRAG'];
        for(var i = 0; i<bname.length; i++){
            if(i==0 || i==17) this.addButton(bname[i], [60, 16, 14] );
            else if(i<4)this.addButton(bname[i], [50,70, 14], true, this.showToolInfo );
            else this.addButton(bname[i], [50,50, 14], true, this.showToolInfo );
        }
        for(var i = 0; i<this.buttons.length; i++){
            this.buttons[i].name = i;
            this.buttons[i].addEventListener('click',  function(e){ e.preventDefault(); selectTool(this.name); }, false);
        }

        /*this.infoSet = document.createElement('div');
        this.infoSet.style.cssText ='position:absolute; top:12px; left:12px; width:180px; height:500px; pointer-events:none; display:block;';
        this.infoMsg = document.createElement('div');
        this.infoMsg.style.cssText ='margin-left:10px; margin-right:10px; margin-top:10px; width:160px; height:40px; pointer-events:none; font-size:14px; ';
        this.infoSet.appendChild( this.infoMsg );
        this.hub.appendChild( this.infoSet );*/

        this.addSelector("Speed", ['PAUSE', '1', '2', '3', '4'], setSpeed, 1);

        this.initCITYinfo();
        
    },

    //-----------------------------------CITY INFO

    initCITYinfo : function(){
        /*var cont = document.createElement('div');
        cont.id = 'INFO';
        cont.style.cssText = 'font-size:30px; position:absolute; width:100%; height:70px; top:20px;';*/

        this.date = document.createElement('div');
        this.date.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:20px; text-align:left;';

        this.money = document.createElement('div');
        this.money.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:140px; text-align:left;';

        this.population = document.createElement('div');
        this.population.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:260px; text-align:left;';

        this.score = document.createElement('div');
        this.score.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:360px; text-align:left;';

        this.msg = document.createElement('div');
        this.msg.style.cssText = 'font-size:14px; position:absolute; width:400px; height:70px; top:50px; left:20px; text-align:left;';






        this.hub.appendChild( this.date );
        this.hub.appendChild( this.money );
        this.hub.appendChild( this.population );
        this.hub.appendChild( this.score );
        this.hub.appendChild( this.msg );

        this.initRCI();
    },

    updateCITYinfo : function(infos){
        this.date.innerHTML = infos[0];
        this.money.innerHTML = infos[4]+' $';
        this.population.innerHTML = infos[3]+' people';
        this.score.innerHTML =  'score:' + infos[2];

        this.msg.innerHTML = infos[8];


        this.updateRCI( infos[5], infos[6], infos[7] );
    },


    //-----------------------------------RCI

    initRCI : function(){
        var cont = document.createElement('div');
        cont.id = 'RCI';
        cont.style.cssText = 'font-size:10px; position:absolute; width:70px; height:70px; bottom:20px; right:20px;';

        var txt = document.createElement('div');
        txt.style.cssText = 'font-size:10px; position:absolute; width:46px; height:14px; bottom:28px; left:10px; background:#cccccc; padding:0px 2px;  letter-spacing:12px; text-align:center; color:#000000;';
        txt.innerHTML = "RCI";

        this.R = document.createElement('div');
        this.R.id = 'R';
        this.R.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:10px; background:#30ff30;';
        cont.appendChild( this.R );

        this.C = document.createElement('div');
        this.C.id = 'C';
        this.C.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:30px; background:#3030ff;';
        cont.appendChild( this.C );

        this.I = document.createElement('div');
        this.I.id = 'I';
        this.I.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:50px; background:#ffff30;';
        cont.appendChild( this.I );



        cont.appendChild( txt );
        this.hub.appendChild( cont );
    },

    updateRCI : function(r,c,i){
        this.R.style.height = r/100+'px'; 
        this.C.style.height = c/100+'px';
        this.I.style.height = i/100+'px';
        //console.log(r/100)
        if(r>0){ this.R.style.bottom ='42px';}
        else { this.R.style.bottom =28+(r/100)+'px';}

        if(c>0){ this.C.style.bottom ='42px';}
        else { this.C.style.bottom =28+(c/100)+'px'; }

        if(i>0){ this.I.style.bottom ='42px';;}
        else { this.I.style.bottom =28+(i/100)+'px'; }
    },

    //---------------------------------- SELECTOR 

    addSelector : function( type, names, fun, current){
        _this = this;
        var cont = document.createElement('div');
        //cont.style.cssText = 'position:absolute; width:300px; height:50px; font-size:16px; top:0; left:webkit-clac(50% -150px);';
        cont.style.cssText = 'font-size:20px; margin-top:20px;';
        if(type=='Speed') cont.style.cssText = 'font-size:20px; position:absolute; bottom:20px; left:10px; ';
        else cont.innerHTML = type+"<br>";
        cont.id = type;
        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );
            t[i].style.cssText = 'font-size:14px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+'; width:70px; height:16px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
            if(type=='Speed'){ if(i>0) t[i].style.width = '16px'; else t[i].style.width = '60px'; }
            t[i].className = "none";
            t[i].textContent = names[i];
            if(i==current){
                t[i].style.border = '4px solid '+this.colors[0];
                t[i].style.backgroundColor = this.colors[0];
                t[i].style.color = this.colors[1];
                t[i].className = "select";
            }
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );
            t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  }, false );
            t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  if(this.className == 'none')this.style.border = '4px solid '+_this.colors[1];  }, false );
            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelector(this.name, type); }, false );
        }
        //this.hub.appendChild( cont );
        if(type=='Difficulty')this.full.appendChild( cont );
        else this.hub.appendChild( cont );
    },

    setActiveSelector : function (n, type) {
        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                def.style.color = this.colors[0];
                def.style.border = '4px solid '+_this.colors[1]; 
                def.style.backgroundColor = this.colors[1];
                def.className = "none";
            }
        }
        var select = document.getElementById(type+n);
        select.style.border = '4px solid '+_this.colors[0]; 
        select.style.backgroundColor = this.colors[0];
        select.style.color = this.colors[1];
        select.className = "select";
    },

    removeSelector : function(type){
        var h = 10, def;
        target = document.getElementById(type);
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                target.removeChild(def);
            }
        }
        this.full.removeChild(target);
    },

    //------------------------------------------

    /*showInfo : function(){
        if(this.infoMsg)this.infoMsg.innerHTML = gameData.join("\n");
    },*/

    showToolInfo : function(id, t){
        var name = view3d.toolSet[id].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();

        t.toolInfo.innerHTML = name+'<br>'+view3d.toolSet[id].price+"$";
    },

    addButton : function(name, size, tool, extra){
        _this = this;
        if(!size) size = [134, 30, 22];
    	//var b = this.createLabel(name, size, true);
        var b = document.createElement( 'div' );
        var defStyle = 'font-size:'+size[2]+'px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+'; width:'+size[0]+'px; height:'+size[1]+'px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
        b.textContent = name;
    	if(!tool){
            if(name == 'MOVE'){
                b.style.cssText = defStyle+'position:absolute; left:270px; bottom:20px; ';
                this.hub.appendChild( b );
            } else if(name == 'DRAG'){
                b.style.cssText = defStyle+'position:absolute; left:358px; bottom:20px;';
                this.hub.appendChild( b );
            } else {
                b.style.cssText =defStyle+ 'margin-top:20px;';
                this.full.appendChild( b );
            }
        } else {
            b.style.cssText = defStyle+'margin:2px; padding:0px; overflow:hidden;';
            this.toolSet.appendChild( b );
        }

        var _this = this;
    	b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  this.style.backgroundColor = _this.colors[0]; this.style.color = _this.colors[1];if(extra) extra(this.name, _this) }, false );
	    b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[1]; this.style.backgroundColor = _this.colors[1]; this.style.color = _this.colors[0];  }, false );
	    //if(fun!==null) b.addEventListener('click', fun || function(e){}, false);

    	this.buttons.push(b);
    },
    removeButtons : function(){
        var i = this.buttons.length;
        while(i--){
            this.full.removeChild( this.buttons[i] );
        }
        this.buttons = [];
    }
}
