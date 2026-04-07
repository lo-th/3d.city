//import * as UIL from '../../build/uil.module.js'

import { Base } from './Base.js';
import { AppState } from '../AppState.js'

//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//


export class Hub {

    constructor () {

        this.mapPath = './assets/textures/'

    	this.hub = document.getElementById('hub');
    	this.full = null;
    	this.title = null;

        this.isIntro = true;

    	this.timer = null;
    	this.bg = 1;

        this.R=null;
        this.C=null;
        this.I=null;

        this.isGen = false

        //this.rrr= null;

        //this.colors = ['#ffffff', '#338099'];
        this.colors = ['rgba(255,255,255,1)', 'rgba(63,76,105,0.4)', 'rgba(0,0,0,1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)', 'rgba(255,255,255,0.5)'];

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


        this.toolOver = null;
        this.toolSelect = null;

        this.currentToolName = 0;

        this.disasterTypes = ['None', 'Monster', 'Fire', 'Flood', 'Crash', 'Meltdown', 'Tornado'];
        this.disasterButtons = [];

        this.overlaysTypes = ['None', 'Density', 'Growth', 'Land value', 'Crime Rate', 'Pollution', 'Traffic', 'Power Grid', 'Fire', 'Police'];
        this.overlaysButtons =  [];
                                                    

        this.full = document.createElement('div');
        this.full.id = 'hub-loading';

        this.loadTitle = document.createElement('div');
        this.loadTitle.className = 'loading-title';
        this.loadTitle.textContent = '3D.CITY';

        this.loadSub = document.createElement('div');
        this.loadSub.className = 'loading-subtitle';
        this.loadSub.textContent = 'City Builder';

        this.text = document.createElement('div');
        this.text.className = 'loading-status';
        this.text.textContent = 'Loading…';

        this.loader = document.createElement('div');
        this.loader.className = 'loading-spinner';

        this.version = document.createElement('div');
        this.version.className = 'hub-version';
        
        this.fps = document.createElement('div');
        this.fps.className = 'hub-fps';
       
        this.full.appendChild(this.loadTitle);
        this.full.appendChild(this.loadSub);
        this.full.appendChild(this.loader);
        this.full.appendChild(this.text);
        
        this.hub.appendChild( this.full );
        this.hub.appendChild( this.version )
        this.hub.appendChild( this.fps )

    }

    upFps( v ){

        this.fps.innerHTML = v + 'F/S|'

    }

    message ( s ){

        if( this.text ) this.text.textContent = s;

    }


    showError( e ){
        console.log(e)
    }

    start (){
    	if(this.isIntro){
    		this.timer = setInterval(this.fadding, 80, this);
    	}
    }

    
    fadding (t){

        // If generation starts while intro is fading, stop intro fade and keep
        // the loading overlay fully visible until generation finishes.
        if (t.isGen) {
            clearInterval(t.timer);
            t.timer = null;
            t.bg = 1;
            t.full.style.opacity = '1';
            t.isIntro = false;
            return;
        }

    	t.bg -= 0.08;
        t.full.style.opacity = Math.max(0, t.bg);
    	//t.full.style.background = 'rgba(144,163,183,'+t.bg+')';
       // background-image:linear-gradient(60deg, white, black);
    	if(t.bg<=0){
    		clearInterval(t.timer);
            t.timer = null
            //t.loader.style.display = 'none'
            //t.hub.removeChild(t.loader);
           //t.hub.removeChild(t.text);
    		// Only remove if not already removed by generate(false) during the fade
            if (t.full.parentNode === t.hub) t.hub.removeChild(t.full);

            //console.log('done')

    		//t.initPrevHub();
            t.isIntro = false;
    	}
    }

    generate( b ) {

        if( b ){
            if(!this.isGen) {
                this.full.style.background = 'none' 
                this.full.style.opacity = '1';
                // Guard: only append when not already in the DOM (intro may still be fading)
                
                if (this.full.parentNode !== this.hub) this.hub.appendChild( this.full );
                if(this.loadTitle){this.full.removeChild(this.loadTitle);this.loadTitle = null;}
                if(this.loadSub){this.full.removeChild(this.loadSub);this.loadSub= null;}
                this.text.textContent = 'Generating map…'
                //this.loader.style.display = 'block'
                //this.hub.appendChild( this.loader );
                //this.hub.appendChild( this.text );
                //this.text.innerHTML = 'Generating map...'
                this.isGen = true
            }
        } else {
            if( this.isGen ){
                if (this.full.parentNode === this.hub) this.hub.removeChild( this.full );
                //this.loader.style.display = 'none'
                //this.hub.removeChild( this.loader );
                //this.hub.removeChild( this.text );
                this.isGen = false
            }
        }
        
    }

    removeChilds (node) {
        var last;
        while (last = node.lastChild) node.removeChild(last);
    };

    //--------------------------------------start hub

    initStartHub() {

        this.version.innerHTML = "V" + AppState.version + (AppState.isWebGPU?'|GPU' : '|GL2')+(AppState.isWorker ? '|W' : '|D')
        if(AppState.isWebGPU) this.fps.style.right = '130px'
        this.mainmenu = document.createElement('div');
        this.mainmenu.style.cssText ='position:absolute; bottom:0px; left:50%; margin-left:-130px; width:260px; height:200px; pointer-events:none; display:flex; align-items: center;';
        //this.full.id = 'fullStart';

        this.hub.appendChild( this.mainmenu );
        const b1 = this.addButton(this.mainmenu, 'New Game', [260, 48, 40], 'position:absolute; top:0px; left:0px;');
        const b2 = this.addButton(this.mainmenu, 'Load Map', [260, 37, 22], 'position:absolute; top:70px; left:0px;');
        const b3 = this.addButton(this.mainmenu, 'About',  [180, 26, 22], 'position:absolute; top:129px; left:40px;');

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.view3d.openMap('NEW'); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.view3d.openMap('LOAD'); }, false);
        b3.addEventListener('click',  function ( e ) { e.preventDefault(); let w = window.open('https://github.com/lo-th/3d.city','_blank'); }, false);
        //b4.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.main.loadGame(true); }, false);

    }

    clearStartHub() {
        if(!this.mainmenu) return;
        this.removeChilds( this.mainmenu )
        this.hub.removeChild( this.mainmenu );
        this.mainmenu = null
    }

    //--------------------------------------map creation hub

    initMapHub() {

        this.mapmenu = document.createElement('div');
        this.mapmenu.style.cssText ='position:absolute; top:10px; left:50%; margin-left:-190px; width:380px; height:200px; pointer-events:none; ';
        this.hub.appendChild( this.mapmenu );

        const s1 = this.addSelector(this.mapmenu, "DIFFICULTY", ['EASY', 'MEDIUM', 'HARD'], AppState.main.setDifficulty, 1, [120,120,120], [24,24,24]);
        const s2 = this.addSelector(this.mapmenu, "MAP SIZE", ['SMALL', 'MEDIUM', 'LARGE'], AppState.main.setSize, 1, [120,120,120], [24,24,24]);

        const b1 = this.addButton(this.mapmenu, 'GENERATE', [180, 37,22], 'position:absolute; top:118px; left:6px;');
        const b2 = this.addButton(this.mapmenu, 'PLAY',  [180, 37, 22], 'position:absolute; top:118px; left:194px;');

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.main.newMap(); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.main.playMap(); }, false);
    }

    cleartMaptHub() {
        if(!this.mapmenu) return;
        this.removeChilds( this.mapmenu )
        this.hub.removeChild( this.mapmenu );
        this.mapmenu = null
    }


    //--------------------------------------game hub

    initGameHub  (){

        if (this._gameHubInit) return;
        this._gameHubInit = true;

        //return

        //this.link.dispose()
        //this.donate.dispose()

        var _this = this;
        //this.removeSelector("DIFFICULTY");
        //this.clearElement('fullStart');

        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText ='position:absolute; margin:0px; padding:0px; top:60px; right:12px; width:198px; height:456px; pointer-events:none;';
        this.hub.appendChild( this.toolSet );
        this.toolInfo = document.createElement('div');
        this.toolInfo.style.cssText ='position:absolute; top:15px; right:12px; width:198px; height:50px; pointer-events:none; font-size:16px;';
        this.hub.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = "Selecte<br>Tool";

        var b;
        for(var i = 0; i<18; i++){
            b = this.addToolButton(this.toolSet);
            b.name = i+1;
        }

        // b.style.cssText =" margin:0px; padding:0px; width:66px; height:66px; pointer-events:auto; cursor:pointer; display:inline-block; line-height:0px;  vertical-align: top; border-radius:33px";
        //b.innerHTML = this.round;

        this.toolOver = document.createElement('div');
        this.toolOver.style.cssText = "position:absolute; top:0px; left:0px; margin:2px 2px; pointer-events:none; display:none; width:62px; height:62px; border-radius:31px; border:3px dashed #ffffff; background:rgba(0,0,0,0.25);"
        this.toolSet.appendChild( this.toolOver );

       

        this.toolSelect = document.createElement('div');
        this.toolSelect.style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none; width:66px; height:66px; border-radius:33px; border:5px solid #ffffff; background:rgba(0,0,0,0.5);"
        //this.toolSelect.innerHTML = this.roundSelect;
        this.toolSet.appendChild( this.toolSelect );

        var img = document.createElement("img");
        img.src = this.mapPath + "interface.png";
        this.toolSet.appendChild(img);
        img.style.cssText ='position:absolute; margin:0px; padding:0px; top:0px; right:0px; width:198px; height:396px; pointer-events:none;';

        this.addSelectorSpeed(this.hub, "Speed", ['II', '>', '>>', '>>>', '>>>'], AppState.main.setSpeed, 2, [20,20,20,20,20]);


        var b1 = this.addButton(this.hub, 'Budget', [75,16,14], 'position:absolute; left:10px; top:-7px; font-weight:bold;', true);
        b1.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.main.getBudjet(); }, false);

        var b2 = this.addButton(this.hub, 'Eval', [75,16,14], 'position:absolute; left:110px; top:-7px; font-weight:bold;', true);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.main.getEval(); }, false);

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
                AppState.main.setTimeColors(this.name);
                 }, false);
            this.H[i]=dd;
        }


        var winter = document.createElement("div");
        winter.style.cssText = "position:absolute; bottom:80px; left:25px; width:30px; height:30px; pointer-events:auto; cursor:pointer; background:rgba(0,0,0,0); ";
        winter.style.cssText += "-moz-border-radius: 30px; -webkit-border-radius: 30px; border-radius: 30px; ";
        this.hub.appendChild(winter);

        winter.addEventListener('click',  function ( e ) { 
            AppState.view3d.winterSwitch();
            if(AppState.view3d.isWinter) this.style.background = 'rgba(255,255,255,0.5);';
            else  this.style.background = 'rgba(0,0,0,0);';
        }, false);

        var img2 = document.createElement("img");
        img2.src = this.mapPath + "basemenu.png";
        this.hub.appendChild(img2);
        img2.style.cssText ='position:absolute; margin:0px; padding:0px; bottom:0px; left:0px; width:630px; height:120px; pointer-events:none;';

        this.initCITYinfo();
    }

    hideoldSel  (){
        for(var i = 0; i<4; i++){
            this.H[i].style.background = 'none';
        }
    }

    //-----------------------------------CITY INFO

    initCITYinfo  (){

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
    }

    updateCITYinfo  (infos){

        //return

        this.date.innerHTML = infos[0];
        this.money.innerHTML = infos[4];
        this.population.innerHTML = infos[3];
        this.score.innerHTML =  infos[2];

        this.msg.innerHTML = infos[8];

        this.updateRCI( infos[5], infos[6], infos[7] );

    }

    //-----------------------------------QUERY

    //-----------------------------------ALL WINDOW

    testOpen  (){
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

    }

    //-----------------------------------ABOUT WINDOW

    openAbout  (data){
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

        AppState.main.showStats();

        this.aboutWindow.className = "open";

    }

    /*upStats  (fps, memory){
        this.fps.innerHTML = 'Fps: '+ fps + ' <br> geometry: ' + memory;
    }*/

    closeAbout  (){
        AppState.main.hideStats();

        this.aboutWindow.style.display = 'none';
        this.aboutWindow.className = "close";
    }


    //-----------------------------------OVERLAYS WINDOW  

    openOverlays  (data){
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
    }

    closeOverlays  (){
        this.overlaysWindow.style.display = 'none';
        this.overlaysWindow.className = "close";
    }


    //-----------------------------------QUERY WINDOW

    openQuery  (data){
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
    }

    closeQuery  (){
        this.queryWindow.style.display = 'none';
        this.queryWindow.className = "close";
    }

    //-----------------------------------BUDGET WINDOW

    openEval  (data){
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
    }

    closeEval  (){
        this.evaluationWindow.style.display = 'none';
        this.evaluationWindow.className = "close";
    }

    //-----------------------------------EXIT WINDOW

    openExit  (data){
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
            //bg2.addEventListener('click',  function(e){ e.preventDefault(); AppState.main.newGameMap(); }, false);
            bg3.addEventListener('click',  function(e){ e.preventDefault(); AppState.main.saveGame(); }, false);
            bg4.addEventListener('click',  function(e){ e.preventDefault(); AppState.main.loadGame(); }, false);

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
    }

    closeExit  (){
        this.exitWindow.style.display = 'none';
        this.exitWindow.className = "close";
    }


    //-----------------------------------BUDGET WINDOW

    openBudget (data){
        var _this = this;

        var test = this.testOpen();
        

        /*if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget(); 
            return;
        }*/

        this.dataKeys = ['roadFund', 'roadRate', 'fireFund', 'fireRate','policeFund', 'policeRate', 'taxRate', 'totalFunds', 'taxesCollected'];

        var i = this.dataKeys.length;

        //var elem;
        while(i--){
            this[this.dataKeys[i]] = data[this.dataKeys[i]] || 0;
        }

        /*this.roadFund = 0;
        this.fireFund = 0;
        this.policeFund = 0;*/

        //console.log( this.roadRate )

        if(test == 'budget') return;

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

    }

    applyBudget  (){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";

        AppState.main.setBudjet([this.taxRate, this.roadRate, this.fireRate, this.policeRate ]);
    }

    closeBudget  (){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";
    }

    setBudgetValue (){
        this.setSliderValue('Tax', this.taxRate, 20, null);
        this.setSliderValue('Roads', this.roadRate, 100, this.roadFund);
        this.setSliderValue('Fire', this.fireRate, 100, this.fireFund);
        this.setSliderValue('Police', this.policeRate, 100, this.policeFund);
    }

    //-----------------------------------DISASTER WINDOW

    openDisaster  (){
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
                this.disasterButtons[i].addEventListener('click',  function(e){ e.preventDefault(); AppState.main.setDisaster(this.name); }, false);
            }
        } else {
            this.disasterWindow.style.display = 'block';
            //this.setBudgetValue();
        }

        this.disasterWindow.className = "open";

    }

    closeDisaster  (){
        this.disasterWindow.style.display = 'none';
        this.disasterWindow.className = "close";
    }


    //-----------------------------------SLIDER

    addSlider  (target, py, name, value, v2, color, max){
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
    }

    setSliderValue (name, value, max, v2){
        var slide = document.getElementById(name);
        var children = slide.childNodes;
        children[0].style.width = 170*(value/max)+'px';
        if(v2!==null){
            children[1].innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            children[1].innerHTML = name+" "+value+'%';
        }
    }

    dragSlider  (t, x, max){
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
    }


    //-----------------------------------RCI

    initRCI  (){

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
    }

    updateRCI  (r,c,i){
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
    }

    

    //------------------------------------------ TOOLS MENU

    resetTool (){

        this.toolSelect.style.display = 'none';
        this.currentToolName = 0;
        AppState.main.selectTool(this.currentToolName);

    }

    showToolSelect  (id){
        if(id.name !==  this.currentToolName){
            this.currentToolName = id.name;
           // var px = (id.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            //var py= (id.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top );
            var px = (id.getBoundingClientRect().left - this.toolSet.getBoundingClientRect().left );
            var py = (id.getBoundingClientRect().top - this.toolSet.getBoundingClientRect().top );
            this.toolSelect.style.left = px + 'px'; 
            this.toolSelect.style.top = py + 'px';
            this.toolSelect.style.display = 'block';
            this.toolSelect.style.borderColor = Base.toolSet[id.name].color

        } else {
            this.toolSelect.style.display = 'none';
            this.currentToolName = 0;
        }

        AppState.main.selectTool(this.currentToolName);

    }

    showToolInfo  (id, t){
        this.toolOver.style.borderColor = Base.toolSet[id.name].color
        var name = Base.toolSet[id.name].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        if(id.name===16) t.toolInfo.innerHTML = 'Drag view';
        else if(id.name===178) t.toolInfo.innerHTML = 'Get info';
        else if(id.name===18) t.toolInfo.innerHTML = 'Rotate view';
        else t.toolInfo.innerHTML = name+'<br>'+ Base.toolSet[id.name].price+"$";
    }

    addToolButton  (target){
        var _this = this;
        var b = document.createElement( 'div' );
        b.style.cssText =" margin:0px; padding:0px; width:66px; height:66px; pointer-events:auto; cursor:pointer; display:inline-block; line-height:0px;  vertical-align: top; border-radius:33px";
        //b.innerHTML = this.round;
        b.addEventListener( 'mouseover', function ( e ) { 
            e.preventDefault();
            var px = (this.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            var py = (this.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top )
            _this.toolOver.style.left = px + 'px'; 
            _this.toolOver.style.top = py + 'px';
            _this.toolOver.style.display = 'block';

            _this.showToolInfo(this, _this);
        }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); _this.toolOver.style.display = 'none';}, false );
        b.addEventListener('click',  function(e){ e.preventDefault();  _this.showToolSelect(this); }, false);
        target.appendChild( b );
        return b;
    }

    //------------------------------------------ DEF BUTTON

    addButton  ( target, name, size= [128, 30, 22], style, top ){

        const b = document.createElement( 'div' );
        b.className = 'hub-btn';
        const defStyle = `font-size:${size[2]}px; line-height:${size[1]}px; width:${size[0]}px; height:${size[1]}px;`
        b.textContent = name;
        if(style) b.style.cssText = defStyle + style;
        else b.style.marginTop = '20px';
        target.appendChild( b );
        return b;

    }


     //---------------------------------- SPEED SELECTOR 


    addSelectorSpeed  ( target, type, names, fun, current, size){
        var _this = this;
        var cont = document.createElement('div');
        //cont.style.cssText = 'position:absolute; width:300px; height:50px; font-size:16px; top:0; left:webkit-clac(50% -150px);';
        //cont.style.cssText = 'font-size:14px; margin-top:10px; color:'+this.colors[0]+';';
        cont.style.cssText = 'position:absolute; font-size:20px; bottom:8px; left:497px;';
        cont.id = type;
        var t = [];
        for(var i=0; i!==names.length; i++){

            t[i] = document.createElement( 'div' );
            t[i].style.cssText = 'font-size:14px; border:1px solid '+this.colors[5]+'; background:'+this.colors[1]+'; color:'+this.colors[0]+';';
            t[i].style.cssText +=' width:70px; height:16px; margin-left:2px; padding:0px; pointer-events:auto;  cursor:pointer; display:inline-block; ';

            if(i==0) t[i].style.cssText += this.radiusL;
            if(i==names.length-1) t[i].style.cssText += this.radiusR;
           // if(type=='Speed'){ if(i>0) t[i].style.width = '16px'; else t[i].style.width = '60px'; }
            t[i].style.width = 22 + 'px'; 
            t[i].style.height = 20 + 'px';
            t[i].className = "none";

            if(i==current){
                //t[i].style.border = '4px solid '+this.colors[0];
                t[i].style.backgroundColor = this.colors[5];
                t[i].style.color = this.colors[2];
                t[i].className = "select";
            }
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );
            t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '1px solid '+_this.colors[0];  }, false );
            t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  this.style.border = '1px solid '+_this.colors[5];  }, false );
            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelectorSpeed(this.name, type); }, false );
        }

        target.appendChild( cont );
        return cont;

    }

    setActiveSelectorSpeed (n, type) {
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
    }

    //---------------------------------- SELECTOR 

    addSelector  ( target, type, names, fun, current, size, sizeH ){
        var _this = this;
        var cont = document.createElement('div');
        //cont.style.cssText = 'position:absolute; width:300px; height:50px; font-size:16px; top:0; left:webkit-clac(50% -150px);';
        //cont.style.cssText = 'font-size:14px; margin-top:10px; color:'+this.colors[0]+';';
        if(type==='Speed') cont.style.cssText = 'font-size:20px; position:absolute; bottom:8px; left:497px; ';
        else{ 
            cont.className = 'selector-title';
            cont.innerHTML = type+"<br>";
        }
        cont.id = type;

        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );
            t[i].className = 'hub-btn';
            if(type==='Speed') {
                t[i].className = 'none';
                t[i].style.cssText = 'font-size:14px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+';'
            }
           //
           // t[i].style.cssText +=' width:70px; height:16px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
            //t[i].style.cssText = 'font-size:14px; border:1px solid '+this.colors[5]+'; background:'+this.colors[1]+'; color:'+this.colors[0]+';';
            t[i].style.cssText = 'font-size:14px;';
            if(type==='Speed') t[i].style.cssText +=' width:70px; height:16px; margin-left:2px; padding:0px 0px; pointer-events:auto; cursor:pointer; display:inline-block; ';
            else t[i].style.cssText +=' width:70px; height:16px; margin:2px; padding:7px; pointer-events:auto; cursor:pointer; display:inline-block; ';

            if(i==0) t[i].style.cssText += this.radiusL;
            if(i==names.length-1) t[i].style.cssText += this.radiusR;
           // if(type=='Speed'){ if(i>0) t[i].style.width = '16px'; else t[i].style.width = '60px'; }
            if(size){
                if(size[i]){

                    t[i].style.width = size[i] + 'px'; 
                    t[i].style.height = (sizeH ? sizeH[i] : size[i]) + 'px'; 
                    t[i].style.padding ='0px 0px';  
                    if(sizeH) t[i].style.lineHeight = ((sizeH[i]))+ 'px';
                } 
                else t[i].style.width = '60px';
             }
            else t[i].style.width = '60px';
            //t[i].className = "none";
            if(type!=='Speed') t[i].textContent = names[i];
            if(i==current){
                //t[i].style.border = '4px solid '+this.colors[0];
                //t[i].style.backgroundColor = this.colors[5];
                //t[i].style.color = this.colors[2];
                t[i].className = "hub-btn-select";
            }
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );

            if(type==='Speed'){
                t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  }, false );
                t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  if(this.className == 'none')this.style.border = '4px solid '+_this.colors[1];  }, false );

            //t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '1px solid '+_this.colors[0];  }, false );
            //t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  this.style.border = '1px solid '+_this.colors[5];  }, false );
            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelectorSpeed(this.name, type); }, false );

            } else {
                 t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelector(this.name, type); }, false );
            }
            //t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  }, false );
            //t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  if(this.className == 'none')this.style.border = '4px solid '+_this.colors[1];  }, false );

            //t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '1px solid '+_this.colors[0];  }, false );
            //t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  this.style.border = '1px solid '+_this.colors[5];  }, false );
           
        }
        //this.hub.appendChild( cont );
        //if(type=='DIFFICULTY'){this.full.appendChild( cont ); cont.style.position = 'absolute'; cont.style.top = '200px';cont.style.width = '300px';}
        target.appendChild( cont );
        return cont;
    }

    setActiveSelector   (n, type) {
        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                //def.style.color = this.colors[0];
               // def.style.border = '4px solid '+_this.colors[1]; 
                //def.style.backgroundColor = this.colors[1];
                def.className = "hub-btn";
            }
        }
        var select = document.getElementById(type+n);
        //select.style.border = '4px solid '+_this.colors[0]; 
        //select.style.backgroundColor = this.colors[5];
        //select.style.color = this.colors[2];
        select.className = "hub-btn-select";
    }

    removeSelector  (type){
        var h = 10, def;
        var target = document.getElementById(type);
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                target.removeChild(def);
            }
        }
        this.full.removeChild(target);
    }

    clearElement  (id){
        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );
        this.hub.removeChild( el );
    }
}
