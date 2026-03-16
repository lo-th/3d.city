import * as UIL from '../../build/uil.module.js'

import { Main } from '../Main.js';
import { Base } from './Base.js';


//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//


export class Hub {

    constructor () {

        this.mapPath = './assets/textures/'

        // ── Tool button SVG ring shapes ───────────────────────────────
        this.round = [
        '<svg height="66" width="66">',
        '<circle cx="33" cy="33" r="27" stroke="rgba(140,200,255,0.15)" stroke-width="1" fill="rgba(20,30,48,0.25)"/>',
        '</svg>'
        ].join("\n");

        this.roundSelected = [
        '<svg height="66" width="66">',
        '<circle cx="33" cy="33" r="27" stroke="rgba(140,200,255,0.5)" stroke-width="2" fill="rgba(20,30,48,0.45)"/>',
        '</svg>'
        ].join("\n");

        this.roundSelect = [
        '<svg height="66" width="66">',
        '<circle cx="33" cy="33" r="30" stroke="rgba(74,158,221,1)" stroke-width="3" fill="rgba(20,30,48,0.70)"/>',
        '</svg>'
        ].join("\n");

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

        // ── Design tokens (mirrors CSS variables for JS-built elements) ──
        this.colors = [
            '#dce8f5',                      // [0] primary text
            'rgba(20,30,48,0.82)',           // [1] panel surface
            '#ffffff',                       // [2] inverse / hover text
            'rgba(14,22,38,0.90)',           // [3] deeper surface
            'rgba(240,184,74,1)',            // [4] warning / message text
            'rgba(74,158,221,0.85)'          // [5] accent / selected
        ];

        this.radius  = "border-radius:10px;";
        this.radiusL = "border-radius:10px 0 0 10px;";
        this.radiusR = "border-radius:0 10px 10px 0;";
        this.radiusB = "border-radius:0 0 10px 10px;";

        this.windowsStyle = ' top:44px; left:10px; border:1px solid rgba(100,160,220,0.22);'
                          + ' background:rgba(14,22,38,0.90); box-shadow:0 8px 32px rgba(0,0,0,0.55);'
                          + ' backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);';

        this.budgetWindow     = null;
        this.evaluationWindow = null;
        this.disasterWindow   = null;
        this.exitWindow       = null;
        this.queryWindow      = null;
        this.overlaysWindow   = null;
        this.aboutWindow      = null;

        this.selector = null;
        this.select   = null;

        this.currentToolName = 0;

        this.disasterTypes = ['None', 'Monster', 'Fire', 'Flood', 'Crash', 'Meltdown', 'Tornado'];
        this.disasterButtons = [];

        this.overlaysTypes = ['None', 'Density', 'Growth', 'Land value', 'Crime Rate', 'Pollution', 'Traffic', 'Power Grid', 'Fire', 'Police'];
        this.overlaysButtons = [];

        // ── Loading screen ────────────────────────────────────────────
        this.full = document.createElement('div');
        this.full.id = 'hub-loading';
        this.full.style.cssText = 'position:absolute; inset:0; display:flex; flex-direction:column;'
                                + ' align-items:center; justify-content:center; pointer-events:none;'
                                + ' background:linear-gradient(160deg,#0f1923 0%,#1a2d45 50%,#0d1e2e 100%);';

        const loadTitle = document.createElement('div');
        loadTitle.className = 'loading-title';
        loadTitle.textContent = '3D.CITY';

        const loadSub = document.createElement('div');
        loadSub.className = 'loading-subtitle';
        loadSub.textContent = 'City Builder';

        this.loadSpinner = document.createElement('div');
        this.loadSpinner.className = 'loading-spinner';

        this.text = document.createElement('div');
        this.text.className = 'loading-status';
        this.text.textContent = 'Loading…';

        this.full.appendChild(loadTitle);
        this.full.appendChild(loadSub);
        this.full.appendChild(this.loadSpinner);
        this.full.appendChild(this.text);

        // ── Intro links (shown before game starts) ────────────────────
        this.link = UIL.add('button', {
            target:this.hub, w:64, h:64, pos:{left:'10px', bottom:'10px'}, simple:true,
            button:'#1a2d45'
        }).icon( UIL.Tools.icon('github', '#74bfff', 50) ).onChange( function(v){ window.open('https://github.com/lo-th/3d.city','_blank'); } )

        this.donate = UIL.add('button', {
            target:this.hub, w:64, h:64, pos:{left:'84px', bottom:'10px'}, simple:true,
            button:'#1a2d45'
        }).icon( UIL.Tools.icon('donate', '#74bfff', 50) ).onChange( function(v){ window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=8KTXA987XHYNQ','_blank'); } )

        this.version = document.createElement('div');
        this.version.style.cssText = 'position:absolute; font-size:12px; font-weight:600; letter-spacing:0.06em;'
                                   + ' color:rgba(140,200,255,0.5); right:12px; bottom:10px; pointer-events:none;';
        this.version.textContent = 'v ' + Base.version;
        this.hub.appendChild(this.version);

        this.hub.appendChild(this.full);
    }

    message ( s ){

        if( this.text ) this.text.textContent = s;

    }

    start (){
    	if(this.isIntro){
    		this.timer = setInterval(this.fadding, 80, this);
    	}
    }

    fadding (t){
    	t.bg -= 0.08;
        t.full.style.opacity = Math.max(0, t.bg);
    	if(t.bg <= 0){
    		clearInterval(t.timer);
    		t.hub.removeChild(t.full);
            t.isIntro = false;
    	}
    }

    generate( b ) {

        if( b ){
            if(!this.isGen) {
                this.full.style.opacity = '1';
                this.hub.appendChild( this.full );
                this.text.textContent = 'Generating map…';
                this.isGen = true;
            }
        } else {
            if( this.isGen ){
                this.hub.removeChild( this.full );
                this.isGen = false;
            }
        }
        
    }



    initPrevHub() {

        /*this.full = document.createElement('div');
        this.full.style.cssText ='position:absolute; top:10px; left:50%; margin-left:-150px; width:300px; height:300px; pointer-events:none;';
        this.full.id = 'fullStart';*/

        //this.hub.appendChild( this.full );
        //var b1 = this.addButton(this.full, 'Play Game', [276,48,40], 'position:absolute; top:10px; left:0px;');
        //let b2 = this.addButton(this.full, 'New Map',  [276, 26, 22], 'position:absolute; top:150px; left:0px;');
        //var b3 = this.addButton(this.full, 'Height Map',  [120, 26, 22], 'position:absolute; top:150px; right:0px;');
        //let b4 = this.addButton(this.full, 'Load Map',  [276, 26, 22], 'position:absolute; top:90px; left:0px;');
        //this.addSelector("DIFFICULTY", ['LOW', 'MEDIUM', 'HARD'], Main.setDifficulty, 0);

        //b1.addEventListener('click',  function ( e ) { e.preventDefault(); Main.playMap(); }, false);
        //b2.addEventListener('click',  function ( e ) { e.preventDefault(); Main.newMap(); }, false);
       // b3.addEventListener('click',  function ( e ) { e.preventDefault(); Main.newHeightMap(); }, false);
        //b4.addEventListener('click',  function ( e ) { e.preventDefault(); Main.loadGame(true); }, false);

    }

    //--------------------------------------start hub

    initStartHub() {

       /* this.full = document.createElement('div');
        this.full.style.cssText ='position:absolute; top:10px; left:50%; margin-left:-150px; width:300px; height:300px; pointer-events:none;';
        this.full.id = 'fullStart';

        this.hub.appendChild( this.full );
        var b1 = this.addButton(this.full, 'Play Game', [276,48,40], 'position:absolute; top:10px; left:0px;');
    	var b2 = this.addButton(this.full, 'New Map',  [120, 26, 22], 'position:absolute; top:150px; left:0px;');
        var b3 = this.addButton(this.full, 'Height Map',  [120, 26, 22], 'position:absolute; top:150px; right:0px;');
        var b4 = this.addButton(this.full, 'Load Map',  [276, 26, 22], 'position:absolute; top:90px; left:0px;');
        this.addSelector("DIFFICULTY", ['LOW', 'MEDIUM', 'HARD'], Main.setDifficulty, 0);

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); Main.playMap(); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); Main.newMap(); }, false);
        b3.addEventListener('click',  function ( e ) { e.preventDefault(); Main.newHeightMap(); }, false);
        b4.addEventListener('click',  function ( e ) { e.preventDefault(); Main.loadGame(true); }, false);*/

    }


    //--------------------------------------game hub

    initGameHub  (){

        this.link.dispose()
        this.donate.dispose()

        var _this = this;

        // ── Top menu bar ──────────────────────────────────────────────
        var topBar = document.createElement('div');
        topBar.className = 'hub-topmenu';
        this.hub.appendChild( topBar );

        var b1 = this.addButton(topBar, 'Budget',  [75,22,11], null, true);
        b1.addEventListener('click', function(e){ e.preventDefault(); Main.getBudjet(); }, false);

        var b2 = this.addButton(topBar, 'Eval',    [60,22,11], null, true);
        b2.addEventListener('click', function(e){ e.preventDefault(); Main.getEval(); }, false);

        var b3 = this.addButton(topBar, 'Disaster',[75,22,11], null, true);
        b3.addEventListener('click', function(e){ e.preventDefault(); _this.openDisaster(); }, false);

        var b4 = this.addButton(topBar, 'Save/Load',[80,22,11], null, true);
        b4.addEventListener('click', function(e){ e.preventDefault(); _this.openExit(); }, false);

        var b5 = this.addButton(topBar, 'About',   [60,22,11], null, true);
        b5.addEventListener('click', function(e){ e.preventDefault(); _this.openAbout(); }, false);

        // Speed selector is appended to the topBar in addSelector below

        // ── Tool panel ────────────────────────────────────────────────
        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText = 'position:absolute; margin:0; padding:0; top:44px; right:12px;'
                                   + ' width:198px; height:456px; pointer-events:none;';
        this.hub.appendChild( this.toolSet );

        this.toolInfo = document.createElement('div');
        this.toolInfo.className = 'hub-toolinfo';
        this.toolInfo.style.cssText += 'position:absolute; top:44px; right:12px; width:198px; height:44px;'
                                     + ' font-size:13px; font-weight:600; color:#dce8f5;'
                                     + ' text-align:right; letter-spacing:0.03em; pointer-events:none;';
        this.hub.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = 'Select<br>Tool';

        var b;
        for(var i = 0; i<18; i++){
            b = this.addSVGButton(this.toolSet);
            b.name = i+1;
        }

        this.selector = document.createElement('div');
        this.selector.style.cssText = 'position:absolute; top:0; left:0; pointer-events:none; display:none;';
        this.selector.innerHTML = this.roundSelected;
        this.toolSet.appendChild( this.selector );

        this.select = document.createElement('div');
        this.select.style.cssText = 'position:absolute; top:0; left:0; pointer-events:none; display:none;';
        this.select.innerHTML = this.roundSelect;
        this.toolSet.appendChild( this.select );

        var img = document.createElement('img');
        img.src = this.mapPath + 'interface.png';
        img.style.cssText = 'position:absolute; margin:0; padding:0; top:0; right:0; width:198px; height:396px; pointer-events:none; opacity:0.85;';
        this.toolSet.appendChild(img);

        // ── Speed selector added to topBar ────────────────────────────
        this.addSelector('Speed', ['❚❚', '▶', '▶▶', '▶▶▶', '▶▶▶▶'], Main.setSpeed, 2, [26,26,26,26,26], topBar);

        // ── Bottom status bar (CSS, no PNG) ───────────────────────────
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'hub-statusbar';
        this.hub.appendChild( this.statusBar );

        this.H = [];

        // Time/color wheel (compact, bottom-left area of status bar)
        this.roo = document.createElement('div');
        this.roo.className = 'hub-timewheel';
        this.roo.style.cssText = 'position:absolute; bottom:50px; left:10px; width:54px; height:54px;'
                               + ' border-radius:50%; overflow:hidden; transform:rotate(45deg);'
                               + ' background:rgba(20,30,48,0.85); border:1.5px solid rgba(100,160,220,0.3);'
                               + ' pointer-events:none;';
        this.hub.appendChild( this.roo );

        var timeColors = ['#e8b44f','#4a9edd','#e05555','#4bcc7a'];
        var dd;
        for(i = 0; i<4; i++){
            dd = document.createElement('div');
            dd.className = 'hub-timewheel-cell';
            if(i==0) dd.style.cssText = 'position:absolute; top:0; left:0; width:27px; height:27px; pointer-events:auto; cursor:pointer; background:'+timeColors[0]+';';
            if(i==1) dd.style.cssText = 'position:absolute; top:0; right:0; width:27px; height:27px; pointer-events:auto; cursor:pointer; background:'+timeColors[1]+';';
            if(i==2) dd.style.cssText = 'position:absolute; bottom:0; right:0; width:27px; height:27px; pointer-events:auto; cursor:pointer; background:'+timeColors[2]+';';
            if(i==3) dd.style.cssText = 'position:absolute; bottom:0; left:0; width:27px; height:27px; pointer-events:auto; cursor:pointer; background:'+timeColors[3]+';';
            dd.name = i;
            this.roo.appendChild( dd );
            dd.addEventListener('click', function(e){
                e.preventDefault();
                _this.hideoldSel();
                _this.H[this.name].style.outline = '2px solid #fff';
                Main.setTimeColors(this.name);
            }, false);
            this.H[i] = dd;
        }

        // Winter toggle
        var winter = document.createElement('div');
        winter.className = 'hub-winter';
        winter.style.cssText = 'position:absolute; bottom:110px; left:28px; width:26px; height:26px;'
                             + ' border-radius:50%; background:transparent;'
                             + ' border:1.5px solid rgba(100,160,220,0.35); cursor:pointer; pointer-events:auto;'
                             + ' transition:background 150ms,border-color 150ms;'
                             + ' display:flex; align-items:center; justify-content:center;'
                             + ' font-size:14px; line-height:1;';
        winter.innerHTML = '❄';
        winter.title = 'Toggle winter';
        this.hub.appendChild(winter);
        winter.addEventListener('click', function(e){
            view3d.winterSwitch();
            if(view3d.isWinter){
                this.style.background = 'rgba(140,200,255,0.35)';
                this.style.borderColor = 'rgba(140,200,255,0.8)';
            } else {
                this.style.background = 'transparent';
                this.style.borderColor = 'rgba(100,160,220,0.35)';
            }
        }, false);

        this.initCITYinfo();
    }

    hideoldSel  (){
        for(var i = 0; i<4; i++){
            this.H[i].style.outline = 'none';
        }
    }

    //-----------------------------------CITY INFO

    initCITYinfo  (){

        // ── Stat blocks in status bar ─────────────────────────────────
        var stats = [
            { key:'date',       label:'Date',       ref:'date'       },
            { key:'population', label:'Population',  ref:'population' },
            { key:'money',      label:'Funds',       ref:'money'      },
            { key:'score',      label:'Score',       ref:'score'      },
        ];

        for(var i=0; i<stats.length; i++){
            var block = document.createElement('div');
            block.className = 'hub-stat';
            var lbl = document.createElement('div');
            lbl.className = 'hub-stat-label';
            lbl.textContent = stats[i].label;
            var val = document.createElement('div');
            val.className = 'hub-stat-value';
            block.appendChild(lbl);
            block.appendChild(val);
            this.statusBar.appendChild(block);
            this[stats[i].ref] = val;
        }

        // City class tag
        this.cityClass = document.createElement('div');
        this.cityClass.style.cssText = 'font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;'
                                     + ' color:rgba(74,158,221,0.85); padding: 0 12px; border-right:1px solid rgba(100,160,220,0.22);';
        this.statusBar.appendChild( this.cityClass );

        // RCI block (inline in status bar)
        this.initRCI();

        // Message (above status bar)
        this.msg = document.createElement('div');
        this.msg.className = 'hub-msg';
        this.hub.appendChild( this.msg );
    }

    updateCITYinfo  (infos){
        this.date.textContent       = infos[0];
        this.money.textContent      = infos[4];
        this.population.textContent = infos[3];
        this.score.textContent      = infos[2];
        this.cityClass.textContent  = infos[1];
        this.msg.textContent        = infos[8];
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

        Main.showStats();

        this.aboutWindow.className = "open";

    }

    upStats  (fps, memory){
        this.fps.innerHTML = 'Fps: '+ fps + ' <br> geometry: ' + memory;
    }

    closeAbout  (){
        Main.hideStats();

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

            var bg1 = this.addButton(this.evaluationWindow, 'X', [16,16,14], 'position:absolute; right:10px; top:10px;');
            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeEval(); }, false);

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

            this.evaltStats = document.createElement('div');
            this.evaltStats.style.cssText ='position:absolute; top:175px; left:10px; width:180px; height:120px; pointer-events:none; color:'+this.colors[0]+'; font-size:12px; ';
            this.evaluationWindow.appendChild( this.evaltStats );

            this.evaltOpinion.innerHTML = "<b>Public opinion</b><br>Is the mayor doing a good job ?<br> <br> <br> <br>What are the worst problems ?<br>"

        } else {
            this.evaluationWindow.style.display = 'block';
        }

        this.evaltYes.innerHTML = 'YES:' + data[0] + '%';
        this.evaltNo.innerHTML = 'NO:' +(100-data[0] )+ '%';

        this.evaltProb.innerHTML = data[1];

        this.evaltStats.innerHTML = '<b>City Statistics</b><br>'
            + '<span style="display:inline-block;width:70px">Crime:</span>' + data[2] + '<br>'
            + '<span style="display:inline-block;width:70px">Pollution:</span>' + data[3] + '<br>'
            + '<span style="display:inline-block;width:70px">Traffic:</span>' + data[4] + '<br>';

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
            bg2.addEventListener('click',  function(e){ e.preventDefault(); Main.newGameMap(); }, false);
            bg3.addEventListener('click',  function(e){ e.preventDefault(); Main.saveGame(); }, false);
            bg4.addEventListener('click',  function(e){ e.preventDefault(); Main.loadGame(); }, false);

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

    openBudget  (data){
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

    }

    applyBudget  (){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";

        Main.setBudjet([this.taxRate, this.roadRate, this.fireRate, this.policeRate ]);
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
                this.disasterButtons[i].addEventListener('click',  function(e){ e.preventDefault(); Main.setDisaster(this.name); }, false);
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
        var bg  = document.createElement( 'div' );
        var sel = document.createElement( 'div' );
        txt.style.cssText = 'position:absolute; left:10px; top:-18px; pointer-events:none;'
                          + ' width:180px; height:20px; font-size:12px; color:' + this.colors[0] + ';';
        bg.style.cssText  = 'border-radius:6px; position:absolute; left:10px; top:'+(py+20)+'px;'
                          + ' padding:0; cursor:w-resize; pointer-events:auto; width:180px; height:20px;'
                          + ' background:rgba(255,255,255,0.07); border:1px solid rgba(100,160,220,0.22);'
                          + ' transition:border-color 150ms;';
        sel.style.cssText = 'border-radius:6px; position:absolute; pointer-events:none;'
                          + ' margin:4px; height:12px; background:' + color + '; opacity:0.85;';
        target.appendChild( bg );
        bg.appendChild( sel );
        bg.appendChild( txt );
        bg.name = name;
        bg.id   = name;

        if(v2!==null){
            txt.innerHTML = name+' '+value+'% of '+v2+'$ = '+Math.floor(v2*(value/100))+'$';
        } else {
            txt.innerHTML = name+' '+value+'%';
        }

        sel.style.width = 170*(value/max)+'px';
        bg.className = 'up';

        bg.addEventListener( 'mouseout',   function(e){ e.preventDefault(); this.className='up'; this.style.borderColor='rgba(100,160,220,0.22)'; }, false );
        bg.addEventListener( 'mouseover',  function(e){ e.preventDefault(); this.style.borderColor='rgba(140,200,255,0.55)'; }, false );
        bg.addEventListener( 'mouseup',    function(e){ e.preventDefault(); this.className='up'; }, false );
        bg.addEventListener( 'mousedown',  function(e){ e.preventDefault(); this.className='down'; _this.dragSlider(this, e.clientX, max); }, false );
        bg.addEventListener( 'mousemove',  function(e){ e.preventDefault(); _this.dragSlider(this, e.clientX, max); }, false );
    }

    setSliderValue (name, value, max, v2){
        var slide = document.getElementById(name);
        var children = slide.childNodes;
        children[0].style.width = 170*(value/max)+'px';
        if(v2!==null){
            children[1].innerHTML = name+' '+value+'% of '+v2+'$ = '+Math.floor(v2*(value/100))+'$';
        } else {
            children[1].innerHTML = name+' '+value+'%';
        }
    }

    dragSlider  (t, x, max){
        if(t.className == 'down'){
            var children = t.childNodes;
            var rect  = t.getBoundingClientRect();
            var value = Math.round(((x-rect.left)/170)*max);
            if(value<0)   value = 0;
            if(value>max) value = max;
            children[0].style.width = 170*(value/max)+'px';

            switch(t.name){
                case 'Tax':    children[1].innerHTML = t.name+' '+value+'%'; this.taxRate=value; break;
                case 'Roads':  children[1].innerHTML = t.name+' '+value+'% of '+this.roadFund+'$ = '+Math.floor(this.roadFund*(value/100))+'$'; this.roadRate=value; break;
                case 'Fire':   children[1].innerHTML = t.name+' '+value+'% of '+this.fireFund+'$ = '+Math.floor(this.fireFund*(value/100))+'$'; this.fireRate=value; break;
                case 'Police': children[1].innerHTML = t.name+' '+value+'% of '+this.policeFund+'$ = '+Math.floor(this.policeFund*(value/100))+'$'; this.policeRate=value; break;
            }
        }
    }


    //-----------------------------------RCI

    initRCI  (){

        var cont = document.createElement('div');
        cont.id = 'RCI';
        cont.style.cssText = 'display:flex; flex-direction:column; align-items:center;'
                           + ' padding: 0 10px; border-right:1px solid rgba(100,160,220,0.22);';

        var bars = document.createElement('div');
        bars.style.cssText = 'display:flex; align-items:flex-end; gap:6px; height:28px;';

        this.R = document.createElement('div');
        this.R.style.cssText = 'width:8px; min-height:2px; border-radius:2px 2px 0 0; background:#4bcc7a;';

        this.C = document.createElement('div');
        this.C.style.cssText = 'width:8px; min-height:2px; border-radius:2px 2px 0 0; background:#4a9edd;';

        this.I = document.createElement('div');
        this.I.style.cssText = 'width:8px; min-height:2px; border-radius:2px 2px 0 0; background:#f0b84a;';

        bars.appendChild( this.R );
        bars.appendChild( this.C );
        bars.appendChild( this.I );

        var lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:9px; font-weight:700; letter-spacing:0.12em;'
                          + ' color:rgba(140,200,255,0.55); margin-top:2px;';
        lbl.textContent = 'RCI';

        cont.appendChild( bars );
        cont.appendChild( lbl );
        this.statusBar.appendChild( cont );
    }

    updateRCI  (r,c,i){
        this.R.style.height = Math.max(2, Math.abs(r)/100) + 'px';
        this.C.style.height = Math.max(2, Math.abs(c)/100) + 'px';
        this.I.style.height = Math.max(2, Math.abs(i)/100) + 'px';
    }

    //---------------------------------- SELECTOR 

    addSelector  ( type, names, fun, current, size, parentTarget ){
        var _this = this;
        var cont = document.createElement('div');

        if(type==='Speed'){
            cont.style.cssText = 'display:flex; align-items:center; gap:2px;'
                               + ' padding:0 8px; border-left:1px solid rgba(100,160,220,0.22); margin-left:auto;';
        } else {
            cont.style.cssText = 'font-size:12px; margin-top:8px; color:' + this.colors[0] + ';';
            cont.innerHTML = '<span style="font-weight:600; letter-spacing:0.06em;">' + type + '</span><br>';
        }
        cont.id = type;

        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );

            var baseStyle = 'font-size:12px; font-weight:700; border:1px solid rgba(100,160,220,0.3);'
                          + ' background:rgba(20,30,48,0.82); color:' + this.colors[0] + ';'
                          + ' cursor:pointer; pointer-events:auto; text-align:center;'
                          + ' transition:background 120ms, border-color 120ms, color 120ms;';

            if(type==='Speed'){
                var w = (size && size[i]) ? size[i] : 26;
                t[i].style.cssText = baseStyle
                                   + ' width:' + w + 'px; height:26px; display:flex;'
                                   + ' align-items:center; justify-content:center; border-radius:4px;';
            } else {
                var w2 = (size && size[i]) ? size[i] : 60;
                t[i].style.cssText = baseStyle
                                   + ' width:' + w2 + 'px; height:22px; margin:2px;'
                                   + ' padding:4px 6px; display:inline-block;';
                if(i===0) t[i].style.borderRadius = '6px 0 0 6px';
                else if(i===names.length-1) t[i].style.borderRadius = '0 6px 6px 0';
            }

            t[i].className = 'none';
            if(type!=='Speed') t[i].textContent = names[i];
            else               t[i].innerHTML   = '<span style="font-size:10px;">' + names[i] + '</span>';

            if(i===current){
                t[i].style.background   = 'rgba(74,158,221,0.85)';
                t[i].style.borderColor  = 'rgba(140,200,255,0.6)';
                t[i].style.color        = '#fff';
                t[i].className = 'select';
            }

            t[i].name = i;
            t[i].id   = type + i;
            cont.appendChild( t[i] );

            t[i].addEventListener( 'mouseover', function(e){ e.preventDefault();
                if(this.className!=='select'){ this.style.background='rgba(74,158,221,0.35)'; this.style.borderColor='rgba(140,200,255,0.5)'; }
            }, false );
            t[i].addEventListener( 'mouseout',  function(e){ e.preventDefault();
                if(this.className!=='select'){ this.style.background='rgba(20,30,48,0.82)'; this.style.borderColor='rgba(100,160,220,0.3)'; }
            }, false );
            t[i].addEventListener( 'click', function(e){ e.preventDefault(); fun(this.name); _this.setActiveSelector(this.name, type); }, false );
        }

        var dest = parentTarget || this.hub;
        dest.appendChild( cont );
    }

    setActiveSelector   (n, type) {
        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                def.style.color      = this.colors[0];
                def.style.background = 'rgba(20,30,48,0.82)';
                def.style.borderColor= 'rgba(100,160,220,0.3)';
                def.className = 'none';
            }
        }
        var sel = document.getElementById(type+n);
        sel.style.background   = 'rgba(74,158,221,0.85)';
        sel.style.borderColor  = 'rgba(140,200,255,0.6)';
        sel.style.color        = '#fff';
        sel.className = 'select';
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

    //------------------------------------------ TOOLS MENU

    showToolSelect  (id){
        if(id.name !==  this.currentToolName){
            this.currentToolName = id.name;
            var px = (id.getBoundingClientRect().left - this.toolSet.getBoundingClientRect().left );
            var py = (id.getBoundingClientRect().top  - this.toolSet.getBoundingClientRect().top );
            this.select.style.left    = px + 'px'; 
            this.select.style.top     = py + 'px';
            this.select.style.display = 'block';
        } else {
            this.select.style.display = 'none';
            this.currentToolName = 0;
        }

        Main.selectTool(this.currentToolName);

    }

    showToolInfo  (id, t){
        var name = Base.toolSet[id.name].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        if(id.name===16)       t.toolInfo.innerHTML = 'Drag view';
        else if(id.name===178) t.toolInfo.innerHTML = 'Get info';
        else if(id.name===18)  t.toolInfo.innerHTML = 'Rotate view';
        else                   t.toolInfo.innerHTML = name + '<br><span style="color:rgba(74,158,221,0.9);font-size:11px;">' + Base.toolSet[id.name].price + '$</span>';
    }

    addSVGButton  (target){
        var _this = this;
        var b = document.createElement( 'div' );
        b.style.cssText = 'margin:0; padding:0; width:66px; height:66px;'
                        + ' pointer-events:auto; cursor:pointer; display:inline-block;'
                        + ' line-height:0; vertical-align:top;'
                        + ' transition:filter 120ms;';
        b.innerHTML = this.round;
        b.addEventListener( 'mouseover', function(e){
            e.preventDefault();
            var px = (this.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            var py = (this.getBoundingClientRect().top  - _this.toolSet.getBoundingClientRect().top );
            _this.selector.style.left    = px + 'px'; 
            _this.selector.style.top     = py + 'px';
            _this.selector.style.display = 'block';
            _this.showToolInfo(this, _this);
        }, false );
        b.addEventListener( 'mouseout',  function(e){ e.preventDefault(); _this.selector.style.display='none'; }, false );
        b.addEventListener( 'click',     function(e){ e.preventDefault(); _this.showToolSelect(this); }, false );
        target.appendChild( b );
        return b;
    }

    //------------------------------------------ DEF BUTTON

    addButton  (target, name, size, style, top){
        var _this = this;
        if(!size) size = [128, 30, 22];
        var b = document.createElement( 'div' );

        var defStyle = 'font-size:' + size[2] + 'px;'
                     + ' border:1px solid rgba(100,160,220,0.3);'
                     + ' background:rgba(20,30,48,0.82);'
                     + ' width:' + size[0] + 'px; height:' + size[1] + 'px;'
                     + ' color:' + this.colors[0] + ';'
                     + ' padding:5px 8px; cursor:pointer; pointer-events:auto; display:inline-block;'
                     + ' font-weight:600; letter-spacing:0.04em; text-align:center;'
                     + ' border-radius:' + (top ? '0 0 8px 8px' : '8px') + ';'
                     + ' transition:background 120ms, border-color 120ms, color 120ms, transform 80ms;';

        b.textContent = name;
        b.style.cssText = defStyle + (style || '');

        b.addEventListener( 'mouseover', function(e){
            e.preventDefault();
            this.style.background   = 'rgba(74,158,221,0.85)';
            this.style.borderColor  = 'rgba(140,200,255,0.6)';
            this.style.color        = '#fff';
        }, false );
        b.addEventListener( 'mouseout', function(e){
            e.preventDefault();
            this.style.background   = 'rgba(20,30,48,0.82)';
            this.style.borderColor  = 'rgba(100,160,220,0.3)';
            this.style.color        = _this.colors[0];
        }, false );

        target.appendChild( b );
        return b;
    }

    clearElement  (id){
        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );
        this.hub.removeChild( el );
    }
}
