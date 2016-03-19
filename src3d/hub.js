
//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//

var HUB = { REVISION: '1' };

HUB.round = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="27" stroke="rgb(255,255,255)" stroke-width="1" stroke-opacity="0.0" fill="rgb(0,0,0)" fill-opacity="0.1"/>',
'</svg>'
].join("\n");

HUB.roundSelected = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="27" stroke="rgb(255,255,255)" stroke-width="2" stroke-opacity="0.5" fill="rgb(0,0,0)" fill-opacity="0.3"/>',
'</svg>'
].join("\n");

HUB.roundSelect = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="30" stroke="rgb(255,255,255)" stroke-width="4" stroke-opacity="1" fill="rgb(0,0,0)" fill-opacity="0.5"/>',
'</svg>'
].join("\n");


HUB.Base = function(){
	this.hub = document.getElementById('hub');
	this.full = null;
	this.title = null;

    this.isIntro = true;

	this.timer = null;
	this.bg = 1;

    this.R=null;
    this.C=null;
    this.I=null;

    //this.rrr= null;

    //this.colors = ['#ffffff', '#338099'];
    this.colors = ['rgba(255,255,255,1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)', 'rgba(255,255,255,0.5)'];

    //this.radius = "-moz-border-radius: 20px; -webkit-border-radius: 20px; border-radius: 20px;";
    this.radius = "-moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px;";
    this.radiusL = "-moz-border-top-left-radius: 6px; -webkit-border-top-left-radius: 6px; border-top-left-radius: 6px;";
    this.radiusL += "-moz-border-bottom-left-radius: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px;";
    this.radiusR = "-moz-border-top-right-radius: 6px; -webkit-border-top-right-radius: 6px; border-top-right-radius: 6px;";
    this.radiusR += "-moz-border-bottom-right-radius: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px;";

    this.radiusB = "-moz-border-bottom-left-radius: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px;";
    this.radiusB += "-moz-border-bottom-right-radius: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px;";

    this.windowsStyle = ' top:40px; left:10px; border:1px solid '+this.colors[1]+'; background:'+this.colors[3]+';';


    this.budgetWindow = null;
    this.evaluationWindow  = null;
    this.disasterWindow = null;
    this.exitWindow = null;
    this.queryWindow = null;
    this.overlaysWindow = null;
    this.aboutWindow = null;


    this.selector = null;
    this.select = null;

    this.currentToolName = 0;

    this.disasterTypes = ['None', 'Monster', 'Fire', 'Flood', 'Crash', 'Meltdown', 'Tornado'];
    this.disasterButtons = [];

    this.overlaysTypes = ['None', 'Density', 'Growth', 'Land value', 'Crime Rate', 'Pollution', 'Traffic', 'Power Grid', 'Fire', 'Police'];
    this.overlaysButtons =  [];


    

    this.intro();
}

HUB.Base.prototype = {
    constructor: HUB.Base,
    init:function() {
    },
    intro:function(){

    	this.full = document.createElement('div'); 
    	this.full.style.cssText ='position:absolute; top:0px; left:0px; width:100%; height:100%; pointer-events:none; display:block; background:rgba(102,102,230,1); ' //+ this.degrade();

        this.fullMid = document.createElement('div'); 
        this.fullMid.style.cssText ='position:absolute; top:10px; left:50%; width:300px; height:300px; margin-left:-150px; pointer-events:none; display:block;';

        this.title = document.createElement('div');
        this.title.innerHTML = "3D.CITY";
    	this.title.style.cssText = 'position:absolute; font-size:44px; top:50%; left:0; margin-top:-30px; width:300px; height:60px; pointer-events:none; text-align:center;';
        
        this.subtitle = document.createElement('div');
        this.subtitle.style.cssText = 'position:absolute; font-size:14px; top:50%; left:0; margin-top:20px; width:300px; height:80px; pointer-events:none; text-align:center;';
        this.subtitle.innerHTML = "Generating world...";

        this.logo = document.getElementById('logo');
        this.logo.style.display = 'block';

        this.full.appendChild( this.fullMid );

        this.fullMid.appendChild( this.logo );
    	this.fullMid.appendChild( this.title );
        this.fullMid.appendChild( this.subtitle );

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
       // background-image:linear-gradient(60deg, white, black);
    	if(t.bg<=0){
    		clearInterval(t.timer);
            t.full.removeChild(t.fullMid);
    		t.fullMid.removeChild(t.logo);
            t.fullMid.removeChild(t.title);
            t.fullMid.removeChild(t.subtitle);
    		t.hub.removeChild(t.full);
    		t.initStartHub();
            t.isIntro = false;
    		//t.full = null;
    	}
    },
    /*degrade : function(){
        var a = -160;
        var p = [0, 30, 100]
        var c0 = '#BFDDFF';
        var c1 = '#3C89CD';
        var c2 = '#214F77';
        var deg = [
            'background:-webkit-gradient(linear, top, bottom, color-stop('+p[0]+'%,'+c0+'),  color-stop('+p[1]+'%,'+c1+'), color-stop('+p[2]+'%,'+c2+'));',
            'background:-moz-linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);',
            'background:-webkit-linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);',
            'background:-o-linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);',
            'background:linear-gradient('+a+'deg, '+c0+' '+p[0]+'%, '+c1+' '+p[1]+'%, '+c2+' '+p[2]+'%);'
        ].join("\n");
        return deg;
    },*/

    //--------------------------------------start hub

    initStartHub : function(){
        this.full = document.createElement('div');
        this.full.style.cssText ='position:absolute; top:10px; left:50%; margin-left:-150px; width:300px; height:300px; pointer-events:none;';
        this.full.id = 'fullStart';

        this.hub.appendChild( this.full );
        var b1 = this.addButton(this.full, 'Play Game', [276,48,40], 'position:absolute; top:10px; left:0px;');
    	var b2 = this.addButton(this.full, 'New Map',  [120, 26, 22], 'position:absolute; top:150px; left:0px;');
        var b3 = this.addButton(this.full, 'Height Map',  [120, 26, 22], 'position:absolute; top:150px; right:0px;');
        var b4 = this.addButton(this.full, 'Load Map',  [276, 26, 22], 'position:absolute; top:90px; left:0px;');
        this.addSelector("DIFFICULTY", ['LOW', 'MEDIUM', 'HARD'], setDifficulty, 0);

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); playMap(); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); newMap(); }, false);
        b3.addEventListener('click',  function ( e ) { e.preventDefault(); newHeightMap(); }, false);
        b4.addEventListener('click',  function ( e ) { e.preventDefault(); loadGame(true); }, false);
    },

    //--------------------------------------game hub

    initGameHub : function(){
        var _this = this;
        this.removeSelector("DIFFICULTY");
        this.clearElement('fullStart');

        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText ='position:absolute; margin:0px; padding:0px; top:60px; right:12px; width:198px; height:456px; pointer-events:none;';
        this.hub.appendChild( this.toolSet );
        this.toolInfo = document.createElement('div');
        this.toolInfo.style.cssText ='position:absolute; top:15px; right:12px; width:198px; height:50px; pointer-events:none; font-size:16px;';
        this.hub.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = "Selecte<br>Tool";

        var b;
        for(var i = 0; i<18; i++){
            b = this.addSVGButton(this.toolSet);
            b.name = i+1;
        }

        this.selector = document.createElement('div');
        this.selector.style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none;"
        this.selector.innerHTML = HUB.roundSelected;
        this.toolSet.appendChild( this.selector );

        this.select = document.createElement('div');
        this.select.style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none;"
        this.select.innerHTML = HUB.roundSelect;
        this.toolSet.appendChild( this.select );

        var img = document.createElement("img");
        img.src = "img/interface.png";
        this.toolSet.appendChild(img);
        img.style.cssText ='position:absolute; margin:0px; padding:0px; top:0px; right:0px; width:198px; height:396px; pointer-events:none;';

        this.addSelector("Speed", ['II', '>', '>>', '>>>', '>>>'], setSpeed, 2, [20,20,20,20,20]);

        var b1 = this.addButton(this.hub, 'Budget', [75,16,14], 'position:absolute; left:10px; top:-7px; font-weight:bold;', true);
        b1.addEventListener('click',  function ( e ) { e.preventDefault(); getBudjet(); }, false);

        var b2 = this.addButton(this.hub, 'Eval', [75,16,14], 'position:absolute; left:110px; top:-7px; font-weight:bold;', true);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); getEval(); }, false);

        /*var b3 = this.addButton(this.hub, 'Disaster', [75,16,14], 'position:absolute; left:210px; top:-7px; font-weight:bold;', true);
        b3.addEventListener('click',  function ( e ) { e.preventDefault();  _this.openDisaster(); }, false);*/

        var b4 = this.addButton(this.hub, 'Exit', [75,16,14], 'position:absolute; left:310px; top:-7px; font-weight:bold;', true);
        b4.addEventListener('click',  function ( e ) { e.preventDefault();  _this.openExit();  }, false);

        var b5 = this.addButton(this.hub, 'About', [75,16,14], 'position:absolute; left:410px; top:-7px; font-weight:bold;', true);
        b5.addEventListener('click',  function ( e ) { e.preventDefault();  _this.openAbout();  }, false);


        this.H = [];
        

        this.roo = document.createElement('div');
        this.roo.style.cssText = "position:absolute; bottom:11px; left:10px; width:60px; height:60px; pointer-events:none; transform:rotate(45deg); ";
        this.roo.style.cssText += "-moz-border-radius: 30px; -webkit-border-radius: 30px; border-radius: 30px; overflow:hidden; ";
        this.hub.appendChild( this.roo );

        var dd;
        for(i = 0; i<4; i++){
            dd = document.createElement('div');
            if(i==0)dd.style.cssText = "position:absolute; top:0px; left:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer; background:#ffffff;";
            if(i==1)dd.style.cssText = "position:absolute; top:0px; right:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer;";
            if(i==2)dd.style.cssText = "position:absolute; bottom:0px; right:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer;";
            if(i==3)dd.style.cssText = "position:absolute; bottom:0px; left:0px; width:30px; height:30px; pointer-events:auto; cursor:pointer;";
            dd.name = i;
            this.roo.appendChild( dd );
            dd.addEventListener('click',  function ( e ) { 
                e.preventDefault();
                _this.hideoldSel();
                _this.H[this.name].style.background = '#ffffff';
                setTimeColors(this.name);
                 }, false);
            this.H[i]=dd;
        }


        var winter = document.createElement("div");
        winter.style.cssText = "position:absolute; bottom:80px; left:25px; width:30px; height:30px; pointer-events:auto; cursor:pointer; background:rgba(0,0,0,0); ";
        winter.style.cssText += "-moz-border-radius: 30px; -webkit-border-radius: 30px; border-radius: 30px; ";
        this.hub.appendChild(winter);

        winter.addEventListener('click',  function ( e ) { 
            view3d.winterSwitch();
            if(view3d.isWinter) this.style.background = 'rgba(255,255,255,0.5);';
            else  this.style.background = 'rgba(0,0,0,0);';
        }, false);

        var img2 = document.createElement("img");
        img2.src = "img/basemenu.png";
        this.hub.appendChild(img2);
        img2.style.cssText ='position:absolute; margin:0px; padding:0px; bottom:0px; left:0px; width:630px; height:120px; pointer-events:none;';

        this.initCITYinfo();
    },
    hideoldSel : function(){
        for(var i = 0; i<4; i++){
            this.H[i].style.background = 'none';
        }
    },

    //-----------------------------------CITY INFO

    initCITYinfo : function(){

        this.date = document.createElement('div');
        this.date.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:65px; text-align:right; font-weight:bold;';

        this.money = document.createElement('div');
        this.money.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:295px; text-align:right; font-weight:bold;';

        this.population = document.createElement('div');
        this.population.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:180px; text-align:right; font-weight:bold;';

        this.score = document.createElement('div');
        this.score.style.cssText = 'font-size:14px; position:absolute; width:70px; height:19px; bottom:15px; left:410px; text-align:right; font-weight:bold;';

        this.msg = document.createElement('div');
        this.msg.style.cssText = 'font-size:14px; letter-spacing:0.02em; position:absolute; width:420px; height:20px; bottom:44px; left:76px; text-align:left; color:'+this.colors[4]+'; font-weight:bold;';

        this.hub.appendChild( this.date );
        this.hub.appendChild( this.money );
        this.hub.appendChild( this.population );
        this.hub.appendChild( this.score );
        this.hub.appendChild( this.msg );

        this.initRCI();
    },

    updateCITYinfo : function(infos){
        this.date.innerHTML = infos[0];
        this.money.innerHTML = infos[4];
        this.population.innerHTML = infos[3];
        this.score.innerHTML =  infos[2];

        this.msg.innerHTML = infos[8];

        this.updateRCI( infos[5], infos[6], infos[7] );
    },

    //-----------------------------------QUERY

    //-----------------------------------ALL WINDOW

    testOpen : function(){
        var t = "";
        if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget();
            t = 'budget';
        }
        if(this.evaluationWindow !== null && this.evaluationWindow.className == "open"){
            this.closeEval();
            t = 'evaluation';
        }
        if(this.disasterWindow !== null && this.disasterWindow.className == "open"){
            this.closeDisaster();
            t = 'disaster';
        }
        if(this.exitWindow !== null && this.exitWindow.className == "open"){
            this.closeExit();
            t = 'exit';
        }
        if(this.queryWindow !== null && this.queryWindow.className == "open"){
            this.closeQuery();
            t = 'query';
        }
        if(this.overlaysWindow !== null && this.overlaysWindow.className == "open"){
            this.closeOverlays();
            t = 'overlays';
        }
        if(this.aboutWindow !== null && this.aboutWindow.className == "open"){
            this.closeAbout();
            t = 'about';
        }

        return t;

    },

    //-----------------------------------ABOUT WINDOW

    openAbout : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'about') return;

        if(this.aboutWindow == null){
            this.aboutWindow = document.createElement('div');
            this.aboutWindow.style.cssText = this.radius+ 'position:absolute; width:200px; height:210px; pointer-events:none; display:block;'+ this.windowsStyle;
            this.hub.appendChild( this.aboutWindow );
            var bg1 = this.addButton(this.aboutWindow, 'X', [16,16,14], 'position:absolute; left:10px; top:10px;');
            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeAbout(); }, false);

            this.fps = document.createElement('div');
            this.fps.style.cssText ='position:absolute; top:20px; left:60px; width:120px; height:20px; pointer-events:none; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.aboutWindow.appendChild( this.fps );
            this.abb = document.createElement('div');
            this.abb.style.cssText ='position:absolute; top:60px; left:10px; width:180px; height:180px; pointer-events:none; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.aboutWindow.appendChild( this.abb );
            this.linke = document.createElement('div');
            this.linke.style.cssText ='position:absolute; top:160px; left:10px; width:180px; height:20px; pointer-events:auto; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.aboutWindow.appendChild( this.linke );

            this.abb.innerHTML = "3D CITY<br><br>All 3d side made by Lo.th<br>Simulation from MicropolisJS<br><br><br>More info and source<br>";
            this.linke.innerHTML = "<a href='https://github.com/lo-th/3d.city' target='_blank'>https://github.com/lo-th/3d.city";



        } else {
            this.aboutWindow.style.display = 'block';
        }

        displayStats();

        this.aboutWindow.className = "open";

    },

    upStats : function(fps, memory){
        this.fps.innerHTML = 'Fps: '+ fps + ' <br> geometry: ' + memory;
    },

    closeAbout :function(){
        hideStats();

        this.aboutWindow.style.display = 'none';
        this.aboutWindow.className = "close";
    },


    //-----------------------------------OVERLAYS WINDOW

    openOverlays : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'overlays') return;

        if(this.overlaysWindow == null){
            this.overlaysWindow = document.createElement('div');
            this.overlaysWindow.style.cssText = this.radius+ 'position:absolute; width:140px; height:420px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.overlaysWindow );

            //var bg1 = this.addButton(this.overlaysWindow, 'X', [16,16,14], 'position:absolute; left:50px; top:10px;');
            //bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeQuery(); }, false);

            for(var i=0; i<this.overlaysTypes.length; i++){
                this.overlaysButtons[i] = this.addButton(this.overlaysWindow, this.overlaysTypes[i].toUpperCase(), [96,16,14],'position:absolute; left:10px; top:'+(10+(i*40))+'px;');
                this.overlaysButtons[i].name = this.overlaysTypes[i];
                this.overlaysButtons[i].addEventListener('click',  function(e){ e.preventDefault(); setOverlays(this.name); }, false);
            }
        } else {
            this.overlaysWindow.style.display = 'block';
        }
        this.overlaysWindow.className = "open";
    },
    closeOverlays :function(){
        this.overlaysWindow.style.display = 'none';
        this.overlaysWindow.className = "close";
    },

    //-----------------------------------QUERY WINDOW

    openQuery : function(data){
        var _this = this;

        //var test = this.testOpen();
        //if(test == 'query') return;

        if(this.queryWindow == null){
            this.queryWindow = document.createElement('div');
            this.queryWindow.style.cssText =this.radius+ 'position:absolute; width:140px; height:180px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.queryWindow );

            var bg1 = this.addButton(this.queryWindow, 'X', [16,16,14], 'position:absolute; left:50px; top:10px;');
            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeQuery(); }, false);

            this.queryResult = document.createElement('div');
            this.queryResult.style.cssText ='position:absolute; top:60px; left:10px; width:110px; height:100px; pointer-events:none; font-size:12px; text-align:center; color:'+this.colors[0]+';';
            this.queryWindow.appendChild( this.queryResult );
        } else {
            this.queryWindow.style.display = 'block';
        }

        this.queryResult.innerHTML = data;
        this.queryWindow.className = "open";
    },
    closeQuery :function(){
        this.queryWindow.style.display = 'none';
        this.queryWindow.className = "close";
    },

    //-----------------------------------BUDGET WINDOW

    openEval : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'evaluation') return;

        if(this.evaluationWindow == null){
            this.evaluationWindow = document.createElement('div');
            this.evaluationWindow.style.cssText =this.radius+ 'position:absolute; width:200px; height:300px; pointer-events:none; display:block;'+ this.windowsStyle;
            this.hub.appendChild( this.evaluationWindow );

            this.evaltOpinion = document.createElement('div');
            this.evaltOpinion.style.cssText ='position:absolute; top:10px; left:10px; width:180px; height:100px; pointer-events:none; color:'+this.colors[0]+';';
            this.evaluationWindow.appendChild( this.evaltOpinion );

            this.evaltYes = document.createElement('div');
            this.evaltYes.style.cssText ='position:absolute; top:46px; left:26px; width:60px; height:20px; pointer-events:none; color:#33FF33; font-size:16px; font-weight:bold;';
            this.evaluationWindow.appendChild( this.evaltYes );

            this.evaltNo = document.createElement('div');
            this.evaltNo.style.cssText ='position:absolute; top:46px; right:26px; width:60px; height:20px; pointer-events:none; color:#FF3300;  font-size:16px; font-weight:bold;';
            this.evaluationWindow.appendChild( this.evaltNo );

            this.evaltProb = document.createElement('div');
            this.evaltProb.style.cssText ='position:absolute; top:100px; left:10px; width:180px; height:60px; pointer-events:none; color:'+this.colors[0]+'; font-size:16px; ';
            this.evaluationWindow.appendChild( this.evaltProb );

            this.evaltOpinion.innerHTML = "<b>Public opinion</b><br>Is the mayor doing a good job ?<br> <br> <br> <br>What are the worst problems ?<br>"

        } else {
            this.evaluationWindow.style.display = 'block';
        }

        this.evaltYes.innerHTML = 'YES:' + data[0] + '%';
        this.evaltNo.innerHTML = 'NO:' +(100-data[0] )+ '%';

        this.evaltProb.innerHTML = data[1];

        this.evaluationWindow.className = "open";
    },

    closeEval :function(){
        this.evaluationWindow.style.display = 'none';
        this.evaluationWindow.className = "close";
    },

    //-----------------------------------EXIT WINDOW

    openExit : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'exit') return;

        if(this.exitWindow == null){
            this.exitWindow = document.createElement('div');
            this.exitWindow.style.cssText =this.radius+ 'position:absolute; width:140px; height:180px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.exitWindow );

            var bg1 = this.addButton(this.exitWindow, 'X', [16,16,14], 'position:absolute; left:50px; top:10px;');
            var bg2 = this.addButton(this.exitWindow, 'NEW MAP', [96,16,14], 'position:absolute; left:10px; top:50px;');
            var bg3 = this.addButton(this.exitWindow, 'SAVE', [96,16,14], 'position:absolute; left:10px; top:90px;');
            var bg4 = this.addButton(this.exitWindow, 'LOAD', [96,16,14], 'position:absolute; left:10px; top:130px;');

            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeExit(); }, false);
            bg2.addEventListener('click',  function(e){ e.preventDefault(); newGameMap(); }, false);
            bg3.addEventListener('click',  function(e){ e.preventDefault(); saveGame(); }, false);
            bg4.addEventListener('click',  function(e){ e.preventDefault(); loadGame(); }, false);

            /*var x = document.createElement("INPUT");
            x.setAttribute("id", "fileToLoad");
            x.setAttribute("type", "file");
            x.style.cssText = "pointer-events:auto; opacity:0; position:absolute; left:10px; top:130px; width:120px; height:40px; overflow:hidden;";
            */
           // x.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); bg4.style.border = '4px solid '+_this.colors[0];  bg4.style.backgroundColor = _this.colors[0]; bg4.style.color = _this.colors[1]; }, false );

           // x.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); bg4.style.border = '4px solid '+_this.colors[1]; bg4.style.backgroundColor = _this.colors[1]; bg4.style.color = _this.colors[0];  }, false );

           // x.addEventListener( 'mouseover', function ( e ) { e.preventDefault();  bg4.style.backgroundColor = _this.colors[2]; }, false );
           // x.addEventListener( 'mouseout', function ( e ) { e.preventDefault();  bg4.style.backgroundColor = _this.colors[1];  }, false );

            //x.addEventListener('change', loadGame, false);


            //"fileToLoad"
            //this.exitWindow.appendChild( x );

        } else {
            this.exitWindow.style.display = 'block';
            //this.setBudgetValue();
        }

        this.exitWindow.className = "open";
    },
    closeExit :function(){
        this.exitWindow.style.display = 'none';
        this.exitWindow.className = "close";
    },


    //-----------------------------------BUDGET WINDOW

    openBudget : function(data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'budget') return;

        /*if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget(); 
            return;
        }*/

        this.dataKeys = ['roadFund', 'roadRate', 'fireFund', 'fireRate','policeFund', 'policeRate', 'taxRate', 'totalFunds', 'taxesCollected'];

        var i = this.dataKeys.length;

        var elem;
        while(i--){
            this[this.dataKeys[i]] = data[this.dataKeys[i]];
        }

        var previousFunds = data.totalFunds;
        var taxesCollected = data.taxesCollected;
        var cashFlow = taxesCollected - this.roadFund - this.fireFund - this.policeFund;
        var currentFunds = previousFunds + cashFlow;

        if(this.budgetWindow == null){
            this.budgetWindow = document.createElement('div');
            this.budgetWindow.style.cssText =this.radius+ 'position:absolute; width:200px; height:300px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.budgetWindow );

            this.addSlider(this.budgetWindow, 10, 'Tax', this.taxRate, null, 'green', 20);
            this.addSlider(this.budgetWindow, 70, 'Roads', this.roadRate, this.roadFund, 'red', 100);
            this.addSlider(this.budgetWindow, 110, 'Fire', this.fireRate, this.fireFund, 'red', 100);
            this.addSlider(this.budgetWindow, 150, 'Police', this.policeRate, this.policeFund, 'red', 100);

            this.budgetResult = document.createElement('div');
            this.budgetResult.style.cssText ='position:absolute; top:200px; left:10px; width:180px; height:300px; pointer-events:none; color:'+this.colors[0]+';';
            
            this.budgetWindow.appendChild( this.budgetResult );

            var bg1 = this.addButton(this.budgetWindow, 'CLOSE', [70,16,14], 'position:absolute; left:10px; bottom:10px;');
            var bg2 = this.addButton(this.budgetWindow, 'APPLY', [70,16,14], 'position:absolute; rigth:10px; bottom:10px;');

            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeBudget(); }, false);
            bg2.addEventListener('click',  function(e){ e.preventDefault(); _this.applyBudget(); }, false);

        } else {
            this.budgetWindow.style.display = 'block';
            this.setBudgetValue();
        }

        this.budgetResult.innerHTML = "Annual receipts:" + cashFlow+"$"+"<br>Taxes collected:" + taxesCollected+"$";

        this.budgetWindow.className = "open";

    },

    applyBudget :function(){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";

        setBudjet([this.taxRate, this.roadRate, this.fireRate, this.policeRate ]);
    },

    closeBudget :function(){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";
    },

    setBudgetValue:function(){
        this.setSliderValue('Tax', this.taxRate, 20, null);
        this.setSliderValue('Roads', this.roadRate, 100, this.roadFund);
        this.setSliderValue('Fire', this.fireRate, 100, this.fireFund);
        this.setSliderValue('Police', this.policeRate, 100, this.policeFund);
    },

    //-----------------------------------DISASTER WINDOW

    openDisaster : function(){
        var _this = this;
        var test = this.testOpen();
        if(test == 'disaster') return;
        if(this.disasterWindow == null){
            this.disasterWindow = document.createElement('div');
            this.disasterWindow.style.cssText =this.radius+ 'position:absolute; width:140px; height:300px; pointer-events:none; display:block;'+ this.windowsStyle;;
            this.hub.appendChild( this.disasterWindow );

            for(var i=0; i<this.disasterTypes.length; i++){
                this.disasterButtons[i] = this.addButton(this.disasterWindow, this.disasterTypes[i].toUpperCase(), [96,16,14],'position:absolute; left:10px; top:'+(10+(i*40))+'px;');
                this.disasterButtons[i].name = this.disasterTypes[i];
                this.disasterButtons[i].addEventListener('click',  function(e){ e.preventDefault(); setDisaster(this.name); }, false);
            }
        } else {
            this.disasterWindow.style.display = 'block';
            //this.setBudgetValue();
        }

        this.disasterWindow.className = "open";

    },
    closeDisaster : function(){
        this.disasterWindow.style.display = 'none';
        this.disasterWindow.className = "close";
    },

    //-----------------------------------SLIDER

    addSlider : function(target, py, name, value, v2, color, max){
        var _this = this;
        var txt = document.createElement( 'div' );
        var bg = document.createElement( 'div' );
        var sel = document.createElement( 'div' );
        txt.style.cssText ='position:absolute; left:10px; top:-18px; pointer-events:none; width:180px; height:20px; font-size:12px; color:'+this.colors[0]+';';
        bg.style.cssText =this.radius+'position:absolute; left:10px; top:'+(py+20)+'px; padding:0; cursor:w-resize; pointer-events:auto; width:180px; height:20px; background-color:'+ _this.colors[1]+';';
        sel.style.cssText =this.radius+'position:absolute; pointer-events:none; margin:5px; width:100px; height:10px; background-color:'+color+';';
        target.appendChild( bg );
        bg.appendChild( sel );
        bg.appendChild( txt );
        bg.name = name;
        bg.id = name;

        if(v2!==null){
            txt.innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            txt.innerHTML = name+" "+value+'%';
        }

        sel.style.width = 170*(value/max)+'px';
        bg.className = "up";

        bg.addEventListener( 'mouseout', function(e){ e.preventDefault();this.className = "up"; this.style.backgroundColor = _this.colors[1]; }, false );
        bg.addEventListener( 'mouseover', function(e){ e.preventDefault(); this.style.backgroundColor = _this.colors[2]; }, false );
        bg.addEventListener( 'mouseup', function(e){ e.preventDefault(); this.className = "up"; }, false );
        bg.addEventListener( 'mousedown', function(e){ e.preventDefault(); this.className = "down"; _this.dragSlider(this, e.clientX, max); }, false );
        bg.addEventListener( 'mousemove', function(e){ e.preventDefault(); _this.dragSlider(this, e.clientX, max); } , false );
    },

    setSliderValue:function(name, value, max, v2){
        var slide = document.getElementById(name);
        var children = slide.childNodes;
        children[0].style.width = 170*(value/max)+'px';
        if(v2!==null){
            children[1].innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            children[1].innerHTML = name+" "+value+'%';
        }
    },

    dragSlider : function(t, x, max){
        if(t.className == "down"){
            var children = t.childNodes;
            var rect = t.getBoundingClientRect();
            var value = Math.round(((x-rect.left)/170)*max);
            if(value<0) value = 0;
            if(value>max) value = max;
            children[0].style.width = 170*(value/max)+'px';

            switch(t.name){
                case 'Tax': children[1].innerHTML = t.name+" "+value+'%'; this.taxRate = value; break;
                case 'Roads': children[1].innerHTML = t.name+" "+value+'% of '+this.roadFund+"$ = " + Math.floor(this.roadFund * (value / 100))+"$"; this.roadRate = value; break;
                case 'Fire': children[1].innerHTML = t.name+" "+value+'% of '+this.fireFund+"$ = " + Math.floor(this.fireFund * (value / 100))+"$"; this.fireRate = value; break;
                case 'Police': children[1].innerHTML = t.name+" "+value+'% of '+this.policeFund+"$ = " + Math.floor(this.policeFund * (value / 100))+"$"; this.policeRate = value; break;
            }
        }
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

    addSelector : function( type, names, fun, current, size){
        var _this = this;
        var cont = document.createElement('div');
        //cont.style.cssText = 'position:absolute; width:300px; height:50px; font-size:16px; top:0; left:webkit-clac(50% -150px);';
        cont.style.cssText = 'font-size:14px; margin-top:10px; color:'+this.colors[0]+';';
        if(type=='Speed') cont.style.cssText = 'font-size:20px; position:absolute; bottom:8px; left:497px; ';
        else cont.innerHTML = type+"<br>";
        cont.id = type;
        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );
           // t[i].style.cssText = 'font-size:14px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+';'
           // t[i].style.cssText +=' width:70px; height:16px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
            t[i].style.cssText = 'font-size:14px; border:1px solid '+this.colors[5]+'; background:'+this.colors[1]+'; color:'+this.colors[0]+';';
            if(type=='Speed')t[i].style.cssText +=' width:70px; height:16px; margin-left:2px; padding:6px; pointer-events:auto;  cursor:pointer; display:inline-block; ';
            else t[i].style.cssText +=' width:70px; height:16px; margin:2px; padding:7px; pointer-events:auto;  cursor:pointer; display:inline-block; ';

            if(i==0) t[i].style.cssText += this.radiusL;
            if(i==names.length-1)t[i].style.cssText += this.radiusR;
           // if(type=='Speed'){ if(i>0) t[i].style.width = '16px'; else t[i].style.width = '60px'; }
            if(size){if(size[i]){t[i].style.width = size[i] + 'px'; t[i].style.height = size[i] + 'px'; t[i].style.padding ='0px'; } else t[i].style.width = '60px';}
            else t[i].style.width = '60px';
            t[i].className = "none";
            if(type!=='Speed')t[i].textContent = names[i];
            if(i==current){
                //t[i].style.border = '4px solid '+this.colors[0];
                t[i].style.backgroundColor = this.colors[5];
                t[i].style.color = this.colors[2];
                t[i].className = "select";
            }
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );
            //t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  }, false );
            //t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  if(this.className == 'none')this.style.border = '4px solid '+_this.colors[1];  }, false );

            t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '1px solid '+_this.colors[0];  }, false );
            t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  this.style.border = '1px solid '+_this.colors[5];  }, false );

            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelector(this.name, type); }, false );
        }
        //this.hub.appendChild( cont );
        if(type=='DIFFICULTY'){this.full.appendChild( cont ); cont.style.position = 'absolute'; cont.style.top = '200px';cont.style.width = '300px';}
        else this.hub.appendChild( cont );
    },

    setActiveSelector : function (n, type) {
        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                def.style.color = this.colors[0];
               // def.style.border = '4px solid '+_this.colors[1]; 
                def.style.backgroundColor = this.colors[1];
                def.className = "none";
            }
        }
        var select = document.getElementById(type+n);
        //select.style.border = '4px solid '+_this.colors[0]; 
        select.style.backgroundColor = this.colors[5];
        select.style.color = this.colors[2];
        select.className = "select";
    },

    removeSelector : function(type){
        var h = 10, def;
        var target = document.getElementById(type);
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                target.removeChild(def);
            }
        }
        this.full.removeChild(target);
    },

    //------------------------------------------ TOOLS MENU

    showToolSelect : function(id){
        if(id.name !==  this.currentToolName){
            this.currentToolName = id.name;
           // var px = (id.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            //var py= (id.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top );
            var px = (id.getBoundingClientRect().left - this.toolSet.getBoundingClientRect().left );
            var py= (id.getBoundingClientRect().top - this.toolSet.getBoundingClientRect().top );
            this.select.style.left = px + 'px'; 
            this.select.style.top = py + 'px';
            this.select.style.display = 'block';
        } else {
            this.select.style.display = 'none';
            this.currentToolName = 0;
        }
        selectTool(this.currentToolName);
    },

    showToolInfo : function(id, t){
        var name = view3d.toolSet[id.name].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        if(id.name===16) t.toolInfo.innerHTML = 'Drag view';
        else if(id.name===178) t.toolInfo.innerHTML = 'Get info';
        else if(id.name===18) t.toolInfo.innerHTML = 'Rotate view';
        else t.toolInfo.innerHTML = name+'<br>'+view3d.toolSet[id.name].price+"$";
    },

    addSVGButton : function(target){
        var _this = this;
        var b = document.createElement( 'div' );
        b.style.cssText =" margin:0px; padding:0px; width:66px; height:66px; pointer-events:auto; cursor:pointer; display:inline-block; line-height:0px; vertical-align: top;";
        b.innerHTML = HUB.round;
        b.addEventListener( 'mouseover', function ( e ) { 
            e.preventDefault();
            var px = (this.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            var py= (this.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top )
            _this.selector.style.left = px+ 'px'; 
            _this.selector.style.top = py + 'px';
            _this.selector.style.display = 'block';
            _this.showToolInfo(this, _this);
        }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); _this.selector.style.display = 'none';}, false );
        b.addEventListener('click',  function(e){ e.preventDefault();  _this.showToolSelect(this); }, false);
        target.appendChild( b );
        return b;
    },

    //------------------------------------------ DEF BUTTON

    addButton : function(target, name, size, style, top){
        var _this = this;
        if(!size) size = [128, 30, 22];
        //var b = this.createLabel(name, size, true);
        var b = document.createElement( 'div' );

        //var defStyle = 'font-size:'+size[2]+'px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+'; width:'+size[0]+'px; height:'+size[1]+'px;'
        //defStyle += 'margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;

        var defStyle = 'font-size:'+size[2]+'px;  border:1px solid '+this.colors[5]+'; background:'+this.colors[1]+'; width:'+size[0]+'px; height:'+size[1]+'px; color:'+this.colors[0]+';';
        if(top)defStyle += 'margin:4px; padding:7px; pointer-events:auto;  cursor:pointer; display:inline-block; ' + this.radiusB;
        else defStyle += 'margin:4px; padding:7px; pointer-events:auto;  cursor:pointer; display:inline-block; ' + this.radius;

        b.textContent = name;
        if(style) b.style.cssText = defStyle+ style;
        else b.style.cssText = defStyle+ 'margin-top:20px;';
        
       // b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  this.style.backgroundColor = _this.colors[0]; this.style.color = _this.colors[1]; }, false );
       // b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[1]; this.style.backgroundColor = _this.colors[1]; this.style.color = _this.colors[0];  }, false );

        b.addEventListener( 'mouseover', function ( e ) { e.preventDefault();  this.style.backgroundColor = _this.colors[5];this.style.color = _this.colors[2]; }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.backgroundColor = _this.colors[1];this.style.color = _this.colors[0]; }, false );

        target.appendChild( b );

        return b;
    },

    clearElement : function(id){
        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );
        this.hub.removeChild( el );
    }
}
