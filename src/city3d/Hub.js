import * as UIL from '../../build/uil.module.js'

import { Main } from '../Main.js';
import { AppState } from '../AppState.js';
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

        this.budgetWindow       = null;
        this.evaluationWindow   = null;
        this.disasterWindow     = null;
        this.exitWindow         = null;
        this.newMapWindow       = null;
        this.queryWindow        = null;
        this.overlaysWindow     = null;
        this.aboutWindow        = null;
        this.achievementsWindow = null;
        this.historyWindow      = null;
        this.ordinancesWindow   = null;
        this.industrySpecWindow = null;

        this._gameHubInit       = false;
        this._newMapTerrainType = 'NEW';
        this._newMapPlayFn      = null;

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
        }).icon( UIL.Tools.icon('github', '#74bfff', 50) ).onChange( function(v){ window.open('https://github.com/awest813/OpenPublica','_blank'); } )

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
    	if(t.bg <= 0){
    		clearInterval(t.timer);
            t.timer = null;
            // Only remove if not already removed by generate(false) during the fade
            if (t.full.parentNode === t.hub) t.hub.removeChild(t.full);
            t.isIntro = false;
    	}
    }

    generate( b ) {

        if( b ){
            if(!this.isGen) {
                this.full.style.opacity = '1';
                // Guard: only append when not already in the DOM (intro may still be fading)
                if (this.full.parentNode !== this.hub) this.hub.appendChild( this.full );
                this.text.textContent = 'Generating map…';
                this.isGen = true;
            }
        } else {
            if( this.isGen ){
                if (this.full.parentNode === this.hub) this.hub.removeChild( this.full );
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

        if (this._gameHubInit) return;
        this._gameHubInit = true;

        this.link.dispose()
        this.donate.dispose()

        var _this = this;

        // ── Top menu bar ──────────────────────────────────────────────
        var topBar = document.createElement('div');
        topBar.className = 'hub-topmenu';
        this.hub.appendChild( topBar );

        var b1 = this.addButton(topBar, 'Budget',  [75,22,11], null, true);
        b1.title = 'Budget (B)';
        b1.addEventListener('click', function(e){ e.preventDefault(); Main.getBudget(); }, false);

        var b2 = this.addButton(topBar, 'Eval',    [60,22,11], null, true);
        b2.title = 'City Evaluation (E)';
        b2.addEventListener('click', function(e){ e.preventDefault(); Main.getEval(); }, false);

        var b3 = this.addButton(topBar, 'Disaster',[75,22,11], null, true);
        b3.title = 'Disasters (D)';
        b3.addEventListener('click', function(e){ e.preventDefault(); _this.openDisaster(); }, false);

        var b4 = this.addButton(topBar, 'Save/Load',[80,22,11], null, true);
        b4.title = 'Save / Load / New Map (S)';
        b4.addEventListener('click', function(e){ e.preventDefault(); _this.openExit(); }, false);

        var b5 = this.addButton(topBar, 'About',   [60,22,11], null, true);
        b5.title = 'About / Keyboard Shortcuts (?)';
        b5.addEventListener('click', function(e){ e.preventDefault(); _this.openAbout(); }, false);

        var b6 = this.addButton(topBar, 'Awards', [60,22,11], null, true);
        b6.title = 'Achievements (A)';
        b6.addEventListener('click', function(e){ e.preventDefault(); Main.getAchievements(); }, false);

        var b7 = this.addButton(topBar, 'History', [65,22,11], null, true);
        b7.title = 'City History (H)';
        b7.addEventListener('click', function(e){ e.preventDefault(); Main.getHistory(); }, false);

        var b8 = this.addButton(topBar, 'Overlays', [70,22,11], null, true);
        b8.title = 'Map Overlays (O)';
        b8.addEventListener('click', function(e){ e.preventDefault(); _this.openOverlays(); }, false);

        var b9 = this.addButton(topBar, 'Ordinances', [88,22,11], null, true);
        b9.title = 'City Ordinances (N)';
        b9.addEventListener('click', function(e){ e.preventDefault(); Main.getOrdinances(); }, false);

        var b10 = this.addButton(topBar, 'Economy', [72,22,11], null, true);
        b10.title = 'Industry Specialization (I)';
        b10.addEventListener('click', function(e){ e.preventDefault(); Main.getIndustrySpec(); }, false);

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
            AppState.view3d.winterSwitch();
            if(AppState.view3d.isWinter){
                this.style.background = 'rgba(140,200,255,0.35)';
                this.style.borderColor = 'rgba(140,200,255,0.8)';
            } else {
                this.style.background = 'transparent';
                this.style.borderColor = 'rgba(100,160,220,0.35)';
            }
        }, false);

        this.initCITYinfo();
        this.initKeyboard();
    }

    hideoldSel  (){
        for(var i = 0; i<4; i++){
            this.H[i].style.outline = 'none';
        }
    }

    initKeyboard  (){
        var _this = this;
        document.addEventListener('keydown', function(e){
            // Only handle shortcuts when not focused in a text input
            if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            switch(e.key){
                case 'Escape': _this.testOpen(); break;
                case 'b': case 'B': Main.getBudget();          break;
                case 'e': case 'E': Main.getEval();            break;
                case 'd': case 'D': _this.openDisaster();      break;
                case 's': case 'S': _this.openExit();          break;
                case 'a': case 'A': Main.getAchievements();    break;
                case 'h': case 'H': Main.getHistory();         break;
                case '?':           _this.openAbout();         break;
                case 'o': case 'O': _this.openOverlays();      break;
                case 'n': case 'N': Main.getOrdinances();      break;
                case 'i': case 'I': Main.getIndustrySpec();    break;
                case '`':           if(AppState.debugOverlay) AppState.debugOverlay.toggle(); break;
            }
        }, false);
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

        // Season indicator
        this.seasonIndicator = document.createElement('div');
        this.seasonIndicator.style.cssText = 'font-size:10px; font-weight:600; letter-spacing:0.06em;'
                                           + ' color:rgba(176,136,224,0.85); padding: 0 8px; border-right:1px solid rgba(100,160,220,0.22);';
        this.statusBar.appendChild( this.seasonIndicator );

        // Happiness indicator
        this.happinessIndicator = document.createElement('div');
        this.happinessIndicator.style.cssText = 'font-size:10px; font-weight:600; letter-spacing:0.06em;'
                                              + ' padding: 0 8px; border-right:1px solid rgba(100,160,220,0.22);';
        this.statusBar.appendChild( this.happinessIndicator );

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

        // Season display
        var seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
        var seasonIcons = ['🌱', '☀', '🍂', '❄'];
        var seasonIdx = infos[17] || 0;
        if (this.seasonIndicator) {
            this.seasonIndicator.textContent = seasonIcons[seasonIdx] + ' ' + seasonNames[seasonIdx];
        }

        // Happiness display
        var happiness = infos[16] || 50;
        var happyColor = happiness >= 70 ? '#4bcc7a' : happiness >= 40 ? '#f0b84a' : '#e05555';
        if (this.happinessIndicator) {
            this.happinessIndicator.innerHTML = '<span style="color:' + happyColor + ';">☺ ' + happiness + '%</span>';
        }
    }

    // Brief "Auto-saved" indicator that fades out
    flashAutoSave () {
        if(!this.autoSaveIndicator){
            this.autoSaveIndicator = document.createElement('div');
            this.autoSaveIndicator.style.cssText = 'position:absolute; bottom:44px; left:50%; transform:translateX(-50%);'
                + ' background:rgba(20,30,48,0.88); color:rgba(74,200,140,0.9);'
                + ' font-size:11px; font-weight:600; letter-spacing:0.06em;'
                + ' padding:4px 12px; border-radius:20px; pointer-events:none;'
                + ' border:1px solid rgba(74,200,140,0.35); opacity:0; transition:opacity 0.4s;';
            this.autoSaveIndicator.textContent = '✔ Auto-saved';
            this.hub.appendChild(this.autoSaveIndicator);
        }
        var el = this.autoSaveIndicator;
        el.style.transition = 'none';
        el.style.opacity = '1';
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(function(){
            el.style.transition = 'opacity 1.5s';
            el.style.opacity = '0';
        }, 1500);
    }

    // Persistent error banner — shown when the simulation encounters a fatal error.
    // Stays visible until dismissed by the user (click ✕) or replaced by a new error.
    showError ( message ) {
        if ( !this.errorBanner ) {
            this.errorBanner = document.createElement('div');
            this.errorBanner.style.cssText = 'position:absolute; top:44px; left:50%;'
                + ' transform:translateX(-50%); z-index:9999;'
                + ' background:rgba(40,10,10,0.95); color:#ff7070;'
                + ' font-size:12px; font-weight:600; letter-spacing:0.04em;'
                + ' padding:7px 14px 7px 12px; border-radius:8px; max-width:420px;'
                + ' border:1px solid rgba(220,60,60,0.6); box-shadow:0 4px 16px rgba(0,0,0,0.6);'
                + ' display:flex; align-items:flex-start; gap:8px;';
            var closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = 'background:none; border:none; color:#ff9090; cursor:pointer;'
                + ' font-size:13px; padding:0; line-height:1; flex-shrink:0; margin-top:1px;';
            var _this = this;
            closeBtn.addEventListener('click', function () {
                if ( _this.errorBanner && _this.errorBanner.parentNode ) {
                    _this.errorBanner.parentNode.removeChild( _this.errorBanner );
                }
                _this.errorBanner = null;
            }, false);
            this.errorBanner.appendChild( closeBtn );
            this._errorText = document.createElement('span');
            this.errorBanner.appendChild( this._errorText );
            this.hub.appendChild( this.errorBanner );
        }
        this._errorText.textContent = message;
    }

    //-----------------------------------QUERY

    //-----------------------------------ALL WINDOW

    // ── Helper: build a titled window header with optional close button ──

    makeWindowHeader ( title, closeFn ) {
        var h = document.createElement('div');
        h.className = 'hub-win-header';

        var t = document.createElement('span');
        t.className = 'hub-win-title';
        t.textContent = title;
        h.appendChild(t);

        if (closeFn) {
            var c = document.createElement('button');
            c.className = 'hub-win-close';
            c.innerHTML = '✕';
            c.title = 'Close (Esc)';
            c.addEventListener('click', function(e){ e.preventDefault(); closeFn(); }, false);
            h.appendChild(c);
        }
        return h;
    }

    testOpen  (){
        var t = "";
        if(this.budgetWindow !== null && this.budgetWindow.dataset.state === 'open'){
            this.closeBudget();
            t = 'budget';
        }
        if(this.evaluationWindow !== null && this.evaluationWindow.dataset.state === 'open'){
            this.closeEval();
            t = 'evaluation';
        }
        if(this.disasterWindow !== null && this.disasterWindow.dataset.state === 'open'){
            this.closeDisaster();
            t = 'disaster';
        }
        if(this.exitWindow !== null && this.exitWindow.dataset.state === 'open'){
            this.closeExit();
            t = 'exit';
        }
        if(this.newMapWindow !== null && this.newMapWindow.dataset.state === 'open'){
            this.closeNewMap();
            t = 'newmap';
        }
        if(this.queryWindow !== null && this.queryWindow.dataset.state === 'open'){
            this.closeQuery();
            t = 'query';
        }
        if(this.overlaysWindow !== null && this.overlaysWindow.dataset.state === 'open'){
            this.closeOverlays();
            t = 'overlays';
        }
        if(this.aboutWindow !== null && this.aboutWindow.dataset.state === 'open'){
            this.closeAbout();
            t = 'about';
        }
        if(this.achievementsWindow !== null && this.achievementsWindow.dataset.state === 'open'){
            this.closeAchievements();
            t = 'achievements';
        }
        if(this.historyWindow !== null && this.historyWindow.dataset.state === 'open'){
            this.closeHistory();
            t = 'history';
        }
        if(this.ordinancesWindow !== null && this.ordinancesWindow.dataset.state === 'open'){
            this.closeOrdinances();
            t = 'ordinances';
        }
        if(this.industrySpecWindow !== null && this.industrySpecWindow.dataset.state === 'open'){
            this.closeIndustrySpec();
            t = 'industryspec';
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
            this.aboutWindow.className = 'hub-panel';
            this.aboutWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:228px;'
                                           + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.aboutWindow );

            this.aboutWindow.appendChild( this.makeWindowHeader('About', function(){ _this.closeAbout(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px; pointer-events:none;';
            this.aboutWindow.appendChild( body );

            this.fps = document.createElement('div');
            this.fps.style.cssText = 'font-size:11px; color:rgba(180,210,240,0.6); margin-bottom:10px;';
            body.appendChild( this.fps );

            var desc = document.createElement('div');
            desc.style.cssText = 'font-size:12px; color:#dce8f5; line-height:1.6; margin-bottom:10px;';
            desc.innerHTML = '<b>OpenPublica</b> v' + Base.version + '<br>'
                           + '3D engine base by <a href="https://github.com/lo-th/3d.city" target="_blank">lo-th/3d.city</a><br>'
                           + 'Simulation: MicropolisJS';
            body.appendChild( desc );

            var kbdDiv = document.createElement('div');
            kbdDiv.style.cssText = 'font-size:11px; color:rgba(180,210,240,0.6);'
                                 + ' border-top:1px solid rgba(100,160,220,0.22);'
                                 + ' padding-top:8px; margin-bottom:10px; line-height:1.8;';
            kbdDiv.innerHTML = '<b style="color:#dce8f5; letter-spacing:0.05em;">KEYBOARD SHORTCUTS</b><br>'
                             + '<span class="hub-kbd">B</span> Budget &nbsp;'
                             + '<span class="hub-kbd">E</span> Eval<br>'
                             + '<span class="hub-kbd">D</span> Disaster &nbsp;'
                             + '<span class="hub-kbd">S</span> Save/Load<br>'
                             + '<span class="hub-kbd">A</span> Awards &nbsp;'
                             + '<span class="hub-kbd">H</span> History<br>'
                             + '<span class="hub-kbd">O</span> Overlays &nbsp;'
                             + '<span class="hub-kbd">N</span> Ordinances<br>'
                             + '<span class="hub-kbd">I</span> Economy<br>'
                             + '<span class="hub-kbd">?</span> This panel<br>'
                             + '<span class="hub-kbd">Esc</span> Close window';
            body.appendChild( kbdDiv );

            this.linke = document.createElement('div');
            this.linke.style.cssText = 'pointer-events:auto; font-size:11px;';
            this.linke.innerHTML = "<a href='https://github.com/awest813/OpenPublica' target='_blank'>Source Code on GitHub ↗</a>";
            body.appendChild( this.linke );

        } else {
            this.aboutWindow.style.display = 'flex';
        }

        Main.showStats();

        this.aboutWindow.dataset.state = 'open';

    }

    upStats  (fps, memory){
        this.fps.innerHTML = 'FPS: '+ fps + ' &nbsp;·&nbsp; geometry: ' + memory;
    }

    closeAbout  (){
        Main.hideStats();

        this.aboutWindow.style.display = 'none';
        this.aboutWindow.dataset.state = 'close';
    }


    //-----------------------------------OVERLAYS WINDOW  

    openOverlays  (data){
        var _this = this;     

        var test = this.testOpen();
        if(test == 'overlays') return;

        if(this.overlaysWindow == null){
            this.overlaysWindow = document.createElement('div');
            this.overlaysWindow.className = 'hub-panel';
            this.overlaysWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:160px;'
                                              + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.overlaysWindow );

            this.overlaysWindow.appendChild( this.makeWindowHeader('Overlays', function(){ _this.closeOverlays(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:8px 10px; pointer-events:none;';
            this.overlaysWindow.appendChild( body );

            for(var i=0; i<this.overlaysTypes.length; i++){
                this.overlaysButtons[i] = this.addButton(body, this.overlaysTypes[i].toUpperCase(), [118,20,11], 'display:block; margin-bottom:4px;');
                this.overlaysButtons[i].name = this.overlaysTypes[i];
                this.overlaysButtons[i].addEventListener('click',  function(e){ e.preventDefault(); setOverlays(this.name); }, false);
            }
        } else {
            this.overlaysWindow.style.display = 'flex';
        }
        this.overlaysWindow.dataset.state = 'open';
    }

    closeOverlays  (){
        this.overlaysWindow.style.display = 'none';
        this.overlaysWindow.dataset.state = 'close';
    }


    //-----------------------------------QUERY WINDOW

    openQuery  (data){
        var _this = this;

        //var test = this.testOpen();
        //if(test == 'query') return;

        if(this.queryWindow == null){
            this.queryWindow = document.createElement('div');
            this.queryWindow.className = 'hub-panel';
            this.queryWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:180px;'
                                           + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.queryWindow );

            this.queryWindow.appendChild( this.makeWindowHeader('Query', function(){ _this.closeQuery(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px; pointer-events:none;';
            this.queryWindow.appendChild( body );

            this.queryResult = document.createElement('div');
            this.queryResult.style.cssText = 'font-size:12px; color:' + this.colors[0] + '; line-height:1.6;';
            body.appendChild( this.queryResult );

        } else {
            this.queryWindow.style.display = 'flex';
        }

        this.queryResult.innerHTML = data;
        this.queryWindow.dataset.state = 'open';
    }

    closeQuery  (){
        this.queryWindow.style.display = 'none';
        this.queryWindow.dataset.state = 'close';
    }

    //-----------------------------------BUDGET WINDOW

    openEval  (data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'evaluation') return;

        if(this.evaluationWindow == null){
            this.evaluationWindow = document.createElement('div');
            this.evaluationWindow.className = 'hub-panel';
            this.evaluationWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:240px;'
                                                + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.evaluationWindow );

            this.evaluationWindow.appendChild( this.makeWindowHeader('City Evaluation', function(){ _this.closeEval(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px; pointer-events:none;';
            this.evaluationWindow.appendChild( body );

            this.evaltOpinion = document.createElement('div');
            this.evaltOpinion.style.cssText = 'pointer-events:none; color:' + this.colors[0] + '; font-size:12px; font-weight:600; margin-bottom:6px;';
            body.appendChild( this.evaltOpinion );

            this.evaltYes = document.createElement('span');
            this.evaltYes.style.cssText = 'color:#4bcc7a; font-size:16px; font-weight:bold; margin-right:20px;';

            this.evaltNo = document.createElement('span');
            this.evaltNo.style.cssText = 'color:#e05555; font-size:16px; font-weight:bold;';

            var voteRow = document.createElement('div');
            voteRow.style.cssText = 'margin-bottom:12px;';
            voteRow.appendChild(this.evaltYes);
            voteRow.appendChild(this.evaltNo);
            body.appendChild(voteRow);

            this.evaltProb = document.createElement('div');
            this.evaltProb.style.cssText = 'pointer-events:none; color:' + this.colors[0] + '; font-size:13px; line-height:1.5; margin-bottom:10px;';
            body.appendChild( this.evaltProb );

            this.evaltStats = document.createElement('div');
            this.evaltStats.style.cssText = 'pointer-events:none; color:' + this.colors[0] + '; font-size:12px; line-height:1.6; margin-bottom:10px;';
            body.appendChild( this.evaltStats );

            this.evaltExtended = document.createElement('div');
            this.evaltExtended.style.cssText = 'pointer-events:none; color:' + this.colors[0] + '; font-size:12px; line-height:1.6;'
                                              + ' border-top:1px solid rgba(100,160,220,0.22); padding-top:8px;';
            body.appendChild( this.evaltExtended );

            this.evaltOpinion.innerHTML = '<b>Public Opinion</b><br><span style="font-size:11px; color:rgba(180,210,240,0.6);">Is the mayor doing a good job?</span>';

        } else {
            this.evaluationWindow.style.display = 'flex';
        }

        this.evaltYes.innerHTML = 'YES: ' + data[0] + '%';
        this.evaltNo.innerHTML  = 'NO: ' + (100 - data[0]) + '%';

        this.evaltProb.innerHTML = '<b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">WORST PROBLEMS</b><br>' + data[1];

        var lblStyle = 'display:inline-block;width:90px;color:rgba(180,210,240,0.6);';
        this.evaltStats.innerHTML = '<b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">CITY STATISTICS</b><br>'
            + '<span style="' + lblStyle + '">Crime:</span>'     + data[2] + '<br>'
            + '<span style="' + lblStyle + '">Pollution:</span>' + data[3] + '<br>'
            + '<span style="' + lblStyle + '">Traffic:</span>'   + data[4] + '<br>';

        // Extended statistics
        var eduLevel = data[5] || 0;
        var healthLevel = data[6] || 0;
        var happiness = data[7] || 50;
        var unemployment = data[8] || 0;
        var season = data[9] || 'Spring';
        var policeCoverage = data[10] !== undefined ? data[10] : 0;
        var fireCoverage   = data[11] !== undefined ? data[11] : 0;
        var parkCount      = data[12] !== undefined ? data[12] : 0;
        var waterCoverage  = data[13] !== undefined ? data[13] : 100;
        var indDef         = data[14] || null;

        var happyColor = happiness >= 70 ? '#4bcc7a' : happiness >= 40 ? '#f0b84a' : '#e05555';
        var eduStr = this._getLevelString(eduLevel, 200, ['None', 'Poor', 'Basic', 'Good', 'Excellent']);
        var healthStr = this._getLevelString(healthLevel, 200, ['Critical', 'Poor', 'Fair', 'Good', 'Excellent']);
        var policeColor = policeCoverage >= 70 ? '#4bcc7a' : policeCoverage >= 40 ? '#f0b84a' : '#e05555';
        var fireColor   = fireCoverage   >= 70 ? '#4bcc7a' : fireCoverage   >= 40 ? '#f0b84a' : '#e05555';
        var parkColor   = parkCount      >= 10 ? '#4bcc7a' : parkCount      >= 3  ? '#f0b84a' : 'rgba(180,210,240,0.5)';
        var waterColor  = waterCoverage  >= 80 ? '#4bcc7a' : waterCoverage  >= 50 ? '#f0b84a' : '#e05555';
        var indStr = indDef ? (indDef.icon + ' ' + indDef.name) : '🏙️ Mixed';

        this.evaltExtended.innerHTML = '<b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">CITY WELL-BEING</b><br>'
            + '<span style="' + lblStyle + '">Season:</span><span style="color:#4a9edd;">' + season + '</span><br>'
            + '<span style="' + lblStyle + '">Education:</span>' + eduStr + '<br>'
            + '<span style="' + lblStyle + '">Health:</span>' + healthStr + '<br>'
            + '<span style="' + lblStyle + '">Unemployment:</span>' + unemployment + '%<br>'
            + '<span style="' + lblStyle + '">Happiness:</span><span style="color:' + happyColor + '; font-weight:bold;">' + happiness + '%</span><br>'
            + '<br><b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">COVERAGE &amp; AMENITIES</b><br>'
            + '<span style="' + lblStyle + '">🚓 Police:</span><span style="color:' + policeColor + ';">' + policeCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">🚒 Fire:</span><span style="color:' + fireColor + ';">' + fireCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">💧 Water:</span><span style="color:' + waterColor + ';">' + waterCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">🌳 Parks:</span><span style="color:' + parkColor + ';">' + parkCount + '</span><br>'
            + '<br><b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">ECONOMY</b><br>'
            + '<span style="' + lblStyle + '">Focus:</span><span style="color:#f0b84a;">' + indStr + '</span>';

        this.evaluationWindow.dataset.state = 'open';
    }

    closeEval  (){
        this.evaluationWindow.style.display = 'none';
        this.evaluationWindow.dataset.state = 'close';
    }

    //-----------------------------------EXIT WINDOW

    openExit  (data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'exit') return;

        if(this.exitWindow == null){
            this.exitWindow = document.createElement('div');
            this.exitWindow.className = 'hub-panel';
            this.exitWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:180px;'
                                          + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.exitWindow );

            this.exitWindow.appendChild( this.makeWindowHeader('Save / Load', function(){ _this.closeExit(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px; pointer-events:none; display:flex; flex-direction:column; gap:6px;';
            this.exitWindow.appendChild( body );

            var bg3 = this.addButton(body, 'SAVE',     [138, 26, 11], null);
            var bg4 = this.addButton(body, 'LOAD',     [138, 26, 11], null);

            bg3.title = 'Save current city to a JSON file';
            bg4.title = 'Load a previously saved city';

            bg3.addEventListener('click', function(e){ e.preventDefault(); Main.saveGame();   }, false);
            bg4.addEventListener('click', function(e){ e.preventDefault(); Main.loadGame();   }, false);

            var sep = document.createElement('div');
            sep.style.cssText = 'border-top:1px solid rgba(100,160,220,0.22); margin:2px 0;';
            body.appendChild(sep);

            var bg2 = this.addButton(body, 'NEW MAP',  [138, 26, 11], null);
            bg2.title = 'Create a new city on a freshly generated map';
            bg2.addEventListener('click', function(e){
                e.preventDefault();
                _this.closeExit();
                _this.openNewMap(function(){ Main.playMap(); });
            }, false);

        } else {
            this.exitWindow.style.display = 'flex';
        }

        this.exitWindow.dataset.state = 'open';
    }

    closeExit  (){
        this.exitWindow.style.display = 'none';
        this.exitWindow.dataset.state = 'close';
    }


    //-----------------------------------NEW MAP WINDOW

    // Helper: create a labelled group of toggle buttons.
    // Returns the container div; each button gets .selected on the active one.
    _makeOptionGroup  (parent, label, options, defaultVal, onChange){
        var group = document.createElement('div');
        group.className = 'hub-option-group';
        parent.appendChild(group);

        var lbl = document.createElement('div');
        lbl.className = 'hub-option-label';
        lbl.textContent = label;
        group.appendChild(lbl);

        var row = document.createElement('div');
        row.className = 'hub-option-btns';
        group.appendChild(row);

        var buttons = [];
        for(var i = 0; i < options.length; i++){
            (function(opt, btns){
                var btn = document.createElement('div');
                btn.className = 'hub-option-btn' + (opt === defaultVal ? ' selected' : '');
                btn.textContent = opt;
                btn.addEventListener('click', function(e){
                    e.preventDefault();
                    for(var j = 0; j < btns.length; j++) btns[j].classList.remove('selected');
                    this.classList.add('selected');
                    onChange(opt);
                }, false);
                row.appendChild(btn);
                btns.push(btn);
            })(options[i], buttons);
        }

        return group;
    }

    openNewMap  (playFn){
        var _this = this;

        this._newMapPlayFn      = playFn;
        this._newMapTerrainType = 'NEW';

        // Set default map-size and difficulty so the first generated map matches UI defaults
        Main.setMapSize('MEDIUM');
        Main.setDifficulty('MEDIUM');

        if(this.newMapWindow == null){
            // Full-screen semi-transparent backdrop
            this.newMapWindow = document.createElement('div');
            this.newMapWindow.className = 'hub-newmap-overlay';
            this.hub.appendChild(this.newMapWindow);

            // Inner card
            var panel = document.createElement('div');
            panel.className = 'hub-panel';
            panel.style.cssText = 'width:310px; pointer-events:none; display:flex; flex-direction:column; border-radius:12px;';
            this.newMapWindow.appendChild(panel);

            panel.appendChild(this.makeWindowHeader('New Map', function(){ _this.closeNewMap(); }));

            var body = document.createElement('div');
            body.style.cssText = 'padding:14px 16px 10px; pointer-events:none;'
                               + ' display:flex; flex-direction:column; gap:12px;';
            panel.appendChild(body);

            // ── Map Size ─────────────────────────────────────────────────
            this._makeOptionGroup(body, 'Map Size', ['SMALL','MEDIUM','LARGE'], 'MEDIUM', function(v){
                Main.setMapSize(v);
            });

            // ── Terrain ──────────────────────────────────────────────────
            this._makeOptionGroup(body, 'Terrain', ['FLAT','HEIGHTMAP'], 'FLAT', function(v){
                _this._newMapTerrainType = (v === 'HEIGHTMAP') ? 'HIGH' : 'NEW';
            });

            // ── Difficulty ───────────────────────────────────────────────
            this._makeOptionGroup(body, 'Difficulty', ['LOW','MEDIUM','HARD'], 'MEDIUM', function(v){
                Main.setDifficulty(v);
            });

            // ── Action buttons ────────────────────────────────────────────
            var actions = document.createElement('div');
            actions.className = 'hub-newmap-actions';
            body.appendChild(actions);

            var genBtn = document.createElement('div');
            genBtn.className = 'hub-btn';
            genBtn.textContent = 'Generate';
            genBtn.title = 'Generate a new map with the current settings';
            genBtn.addEventListener('click', function(e){
                e.preventDefault();
                Main.newMap(_this._newMapTerrainType);
            }, false);
            actions.appendChild(genBtn);

            var playBtn = document.createElement('div');
            playBtn.className = 'hub-btn primary';
            playBtn.textContent = 'Play This Map';
            playBtn.title = 'Start a new city on the generated map';
            playBtn.addEventListener('click', function(e){
                e.preventDefault();
                var fn = _this._newMapPlayFn;
                _this.closeNewMap();
                if(fn) fn();
            }, false);
            actions.appendChild(playBtn);

        }

        this.newMapWindow.style.display = 'flex';
        this.newMapWindow.dataset.state = 'open';
    }

    closeNewMap  (){
        if(!this.newMapWindow) return;
        this.newMapWindow.style.display = 'none';
        this.newMapWindow.dataset.state = 'close';
    }


    //-----------------------------------BUDGET WINDOW

    openBudget  (data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'budget') return;

        this.dataKeys = ['roadFund', 'roadRate', 'fireFund', 'fireRate', 'policeFund', 'policeRate',
                         'resTaxRate', 'comTaxRate', 'indTaxRate', 'totalFunds', 'taxesCollected',
                         'bondDebt', 'bondAnnualPayment', 'bondMaxDebt',
                         'waterFund', 'waterRate'];

        var i = this.dataKeys.length;

        while(i--){
            this[this.dataKeys[i]] = data[this.dataKeys[i]];
        }

        // Fallback for saves that pre-date per-zone taxes
        if (this.resTaxRate === undefined) this.resTaxRate = data.taxRate || 7;
        if (this.comTaxRate === undefined) this.comTaxRate = data.taxRate || 7;
        if (this.indTaxRate === undefined) this.indTaxRate = data.taxRate || 7;

        var previousFunds = data.totalFunds;
        var taxesCollected = data.taxesCollected || 0;
        var cashFlow = taxesCollected - (this.roadFund || 0) - (this.fireFund || 0) - (this.policeFund || 0) - (this.waterFund || 0);

        if(this.budgetWindow == null){
            this.budgetWindow = document.createElement('div');
            this.budgetWindow.className = 'hub-panel';
            this.budgetWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:220px;'
                                            + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;'
                                            + ' max-height:calc(100vh - 54px);';
            this.hub.appendChild( this.budgetWindow );

            this.budgetWindow.appendChild( this.makeWindowHeader('Budget', function(){ _this.closeBudget(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px 6px; pointer-events:none; overflow-y:auto;'
                               + ' display:flex; flex-direction:column;';
            this.budgetWindow.appendChild( body );

            var taxLabel = document.createElement('div');
            taxLabel.style.cssText = 'font-size:10px; font-weight:700;'
                                   + ' letter-spacing:0.08em; color:rgba(75,204,122,0.8); text-transform:uppercase;'
                                   + ' margin-bottom:2px;';
            taxLabel.textContent = 'Tax Rates';
            body.appendChild(taxLabel);

            this.addSlider(body, null, 'Res Tax', this.resTaxRate, null, '#4bcc7a', 20);
            this.addSlider(body, null, 'Com Tax', this.comTaxRate, null, '#4bcc7a', 20);
            this.addSlider(body, null, 'Ind Tax', this.indTaxRate, null, '#4bcc7a', 20);

            var svcLabel = document.createElement('div');
            svcLabel.style.cssText = 'font-size:10px; font-weight:700;'
                                   + ' letter-spacing:0.08em; color:rgba(224,85,85,0.8); text-transform:uppercase;'
                                   + ' margin-top:6px; margin-bottom:2px;';
            svcLabel.textContent = 'Services';
            body.appendChild(svcLabel);

            this.addSlider(body, null, 'Roads',  this.roadRate,   this.roadFund,   '#e05555', 100);
            this.addSlider(body, null, 'Fire',   this.fireRate,   this.fireFund,   '#e05555', 100);
            this.addSlider(body, null, 'Police', this.policeRate, this.policeFund, '#e05555', 100);
            this.addSlider(body, null, 'Water',  this.waterRate !== undefined ? this.waterRate : 100,
                                                this.waterFund,  '#4a9edd', 100);

            this.budgetResult = document.createElement('div');
            this.budgetResult.style.cssText = 'pointer-events:none; color:' + this.colors[0] + '; font-size:12px; line-height:1.6;'
                                            + ' margin-top:8px; margin-bottom:4px;';
            body.appendChild( this.budgetResult );

            // ── Municipal Bonds section ───────────────────────────────
            var bondLabel = document.createElement('div');
            bondLabel.style.cssText = 'font-size:10px; font-weight:700;'
                                    + ' letter-spacing:0.08em; color:rgba(240,184,74,0.8); text-transform:uppercase;'
                                    + ' margin-top:6px; margin-bottom:4px;';
            bondLabel.textContent = 'Municipal Bonds';
            body.appendChild(bondLabel);

            this.bondDebtInfo = document.createElement('div');
            this.bondDebtInfo.style.cssText = 'pointer-events:none; color:' + this.colors[0] + '; font-size:11px; line-height:1.5;'
                                            + ' margin-bottom:6px;';
            body.appendChild(this.bondDebtInfo);

            var bondBtnsRow = document.createElement('div');
            bondBtnsRow.style.cssText = 'display:flex; gap:4px; pointer-events:auto; margin-bottom:6px;';
            body.appendChild(bondBtnsRow);

            var b5k  = this.addButton(bondBtnsRow, '+$5K',  [58, 22, 10], null);
            var b10k = this.addButton(bondBtnsRow, '+$10K', [62, 22, 10], null);
            var b20k = this.addButton(bondBtnsRow, '+$20K', [62, 22, 10], null);
            b5k.title  = 'Issue $5,000 bond (7% interest/yr)';
            b10k.title = 'Issue $10,000 bond (7% interest/yr)';
            b20k.title = 'Issue $20,000 bond (7% interest/yr)';
            b5k.addEventListener( 'click', function(e){ e.preventDefault(); Main.issueBond(5000);  }, false);
            b10k.addEventListener('click', function(e){ e.preventDefault(); Main.issueBond(10000); }, false);
            b20k.addEventListener('click', function(e){ e.preventDefault(); Main.issueBond(20000); }, false);

            var actionRow = document.createElement('div');
            actionRow.style.cssText = 'display:flex; gap:8px; padding:6px 0; pointer-events:auto;'
                                    + ' border-top:1px solid rgba(100,160,220,0.22); margin-top:4px; flex-shrink:0;';
            body.appendChild(actionRow);

            var bg1 = this.addButton(actionRow, 'CLOSE', [88, 22, 11], null);
            var bg2 = this.addButton(actionRow, 'APPLY', [88, 22, 11], null);

            bg1.addEventListener('click', function(e){ e.preventDefault(); _this.closeBudget(); }, false);
            bg2.addEventListener('click', function(e){ e.preventDefault(); _this.applyBudget(); }, false);

        } else {
            this.budgetWindow.style.display = 'flex';
            this.setBudgetValue();
        }

        this.budgetResult.innerHTML = '<span style="color:rgba(180,210,240,0.6)">Annual receipts:</span> ' + cashFlow + '$'
                                    + '<br><span style="color:rgba(180,210,240,0.6)">Taxes collected:</span> ' + taxesCollected + '$';

        // Update bond info display
        var bondDebt    = data.bondDebt        || 0;
        var bondPayment = data.bondAnnualPayment || 0;
        var bondMax     = data.bondMaxDebt      || 50000;
        var debtColor   = bondDebt === 0 ? 'rgba(180,210,240,0.6)' : bondDebt > bondMax * 0.8 ? '#e05555' : '#f0b84a';
        if (this.bondDebtInfo) {
            this.bondDebtInfo.innerHTML = '<span style="color:rgba(180,210,240,0.6);">Outstanding debt:</span>'
                + ' <span style="color:' + debtColor + '; font-weight:600;">' + bondDebt + '$</span>'
                + '<br><span style="color:rgba(180,210,240,0.6);">Interest / yr:</span>'
                + ' <span style="color:' + (bondPayment > 0 ? '#f0b84a' : 'rgba(180,210,240,0.6)') + ';">' + bondPayment + '$</span>'
                + '<br><span style="color:rgba(180,210,240,0.4); font-size:10px;">Max: ' + bondMax + '$ (7% annual)</span>';
        }

        this.budgetWindow.dataset.state = 'open';

    }

    applyBudget  (){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.dataset.state = 'close';

        var wRate = this.waterRate !== undefined ? this.waterRate : 100;
        Main.setBudget([this.resTaxRate, this.comTaxRate, this.indTaxRate, this.roadRate, this.fireRate, this.policeRate, wRate]);
    }

    closeBudget  (){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.dataset.state = 'close';
    }

    setBudgetValue (){
        this.setSliderValue('Res Tax', this.resTaxRate, 20, null);
        this.setSliderValue('Com Tax', this.comTaxRate, 20, null);
        this.setSliderValue('Ind Tax', this.indTaxRate, 20, null);
        this.setSliderValue('Roads',   this.roadRate,   100, this.roadFund);
        this.setSliderValue('Fire',    this.fireRate,   100, this.fireFund);
        this.setSliderValue('Police',  this.policeRate, 100, this.policeFund);
        this.setSliderValue('Water',   this.waterRate !== undefined ? this.waterRate : 100, 100, this.waterFund);
    }

    //-----------------------------------DISASTER WINDOW

    openDisaster  (){
        var _this = this;
        var test = this.testOpen();
        if(test == 'disaster') return;
        if(this.disasterWindow == null){
            this.disasterWindow = document.createElement('div');
            this.disasterWindow.className = 'hub-panel';
            this.disasterWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:180px;'
                                              + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.disasterWindow );

            this.disasterWindow.appendChild( this.makeWindowHeader('Disasters', function(){ _this.closeDisaster(); }) );

            var body = document.createElement('div');
            body.style.cssText = 'padding:10px 12px; pointer-events:none; display:flex; flex-direction:column; gap:6px;';
            this.disasterWindow.appendChild( body );

            for(var i=0; i<this.disasterTypes.length; i++){
                this.disasterButtons[i] = this.addButton(body, this.disasterTypes[i].toUpperCase(), [138, 24, 11], null);
                this.disasterButtons[i].name = this.disasterTypes[i];
                this.disasterButtons[i].addEventListener('click', function(e){ e.preventDefault(); Main.setDisaster(this.name); }, false);
            }
        } else {
            this.disasterWindow.style.display = 'flex';
        }

        this.disasterWindow.dataset.state = 'open';

    }

    closeDisaster  (){
        this.disasterWindow.style.display = 'none';
        this.disasterWindow.dataset.state = 'close';
    }


    //-----------------------------------SLIDER

    addSlider  (target, py, name, value, v2, color, max){
        var _this = this;
        var txt = document.createElement( 'div' );
        var bg  = document.createElement( 'div' );
        var sel = document.createElement( 'div' );

        sel.style.cssText = 'border-radius:6px; position:absolute; pointer-events:none;'
                          + ' margin:4px; height:12px; background:' + color + '; opacity:0.85;';

        if(py !== null){
            // Legacy absolute-positioned layout (used for backwards-compat if needed)
            txt.style.cssText = 'position:absolute; left:10px; top:-18px; pointer-events:none;'
                              + ' width:180px; height:20px; font-size:12px; color:' + this.colors[0] + ';';
            bg.style.cssText  = 'border-radius:6px; position:absolute; left:10px; top:'+(py+20)+'px;'
                              + ' padding:0; cursor:w-resize; pointer-events:auto; width:180px; height:20px;'
                              + ' background:rgba(255,255,255,0.07); border:1px solid rgba(100,160,220,0.22);'
                              + ' transition:border-color 150ms;';
            target.appendChild( bg );
        } else {
            // Flow layout: wrapper provides top spacing for the label that floats above the track
            txt.style.cssText = 'position:absolute; left:0; top:-18px; pointer-events:none;'
                              + ' width:180px; height:20px; font-size:12px; color:' + this.colors[0] + ';';
            bg.style.cssText  = 'border-radius:6px; position:relative; cursor:w-resize; pointer-events:auto;'
                              + ' width:180px; height:20px;'
                              + ' background:rgba(255,255,255,0.07); border:1px solid rgba(100,160,220,0.22);'
                              + ' transition:border-color 150ms; margin-top:20px; margin-bottom:6px;';
            target.appendChild( bg );
        }

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
                case 'Res Tax': children[1].innerHTML = t.name+' '+value+'%'; this.resTaxRate=value; break;
                case 'Com Tax': children[1].innerHTML = t.name+' '+value+'%'; this.comTaxRate=value; break;
                case 'Ind Tax': children[1].innerHTML = t.name+' '+value+'%'; this.indTaxRate=value; break;
                case 'Tax':     children[1].innerHTML = t.name+' '+value+'%'; this.taxRate=value; break;
                case 'Roads':   children[1].innerHTML = t.name+' '+value+'% of '+(this.roadFund||0)+'$ = '+Math.floor((this.roadFund||0)*(value/100))+'$'; this.roadRate=value; break;
                case 'Fire':    children[1].innerHTML = t.name+' '+value+'% of '+(this.fireFund||0)+'$ = '+Math.floor((this.fireFund||0)*(value/100))+'$'; this.fireRate=value; break;
                case 'Police':  children[1].innerHTML = t.name+' '+value+'% of '+(this.policeFund||0)+'$ = '+Math.floor((this.policeFund||0)*(value/100))+'$'; this.policeRate=value; break;
                case 'Water':   children[1].innerHTML = t.name+' '+value+'% of '+(this.waterFund||0)+'$ = '+Math.floor((this.waterFund||0)*(value/100))+'$'; this.waterRate=value; break;
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

    //-----------------------------------HELPER

    _getLevelString  (value, maxValue, strings) {
        var idx = Math.floor((value / maxValue) * (strings.length - 1));
        idx = Math.max(0, Math.min(idx, strings.length - 1));
        var colors = ['#e05555', '#e07744', '#f0b84a', '#8bcc5a', '#4bcc7a'];
        return '<span style="color:' + colors[idx] + ';">' + strings[idx] + '</span>';
    }

    //-----------------------------------ACHIEVEMENTS WINDOW

    openAchievements  (data, progress){
        var _this = this;

        var test = this.testOpen();
        if(test == 'achievements') return;

        if(this.achievementsWindow == null){
            this.achievementsWindow = document.createElement('div');
            this.achievementsWindow.className = 'hub-panel';
            this.achievementsWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:260px; max-height:400px;'
                                                   + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.achievementsWindow );

            this.achievementsWindow.appendChild( this.makeWindowHeader('Awards', function(){ _this.closeAchievements(); }) );

            this.achBody = document.createElement('div');
            this.achBody.style.cssText = 'padding:10px 12px; pointer-events:auto; overflow-y:auto; max-height:340px;';
            this.achievementsWindow.appendChild( this.achBody );

        } else {
            this.achievementsWindow.style.display = 'flex';
        }

        // Populate achievements
        var html = '<div style="font-size:11px; color:rgba(180,210,240,0.6); margin-bottom:8px;">'
                 + 'Progress: <span style="color:#4a9edd; font-weight:bold;">' + progress.unlocked + '</span> / ' + progress.total + '</div>';

        for (var i = 0; i < data.length; i++) {
            var ach = data[i];
            var unlocked = ach.unlocked;
            var bgColor = unlocked ? 'rgba(74,158,221,0.15)' : 'rgba(20,30,48,0.5)';
            var borderColor = unlocked ? 'rgba(74,158,221,0.4)' : 'rgba(100,160,220,0.15)';
            var iconColor = unlocked ? '#f0b84a' : 'rgba(180,210,240,0.3)';
            var nameColor = unlocked ? '#dce8f5' : 'rgba(180,210,240,0.4)';
            var descColor = unlocked ? 'rgba(180,210,240,0.7)' : 'rgba(180,210,240,0.25)';
            var icon = unlocked ? '★' : '☆';

            html += '<div style="display:flex; align-items:center; gap:8px; padding:6px 8px; margin-bottom:4px;'
                  + ' background:' + bgColor + '; border:1px solid ' + borderColor + '; border-radius:6px;">'
                  + '<span style="font-size:18px; color:' + iconColor + ';">' + icon + '</span>'
                  + '<div><div style="font-size:12px; font-weight:600; color:' + nameColor + ';">' + ach.name + '</div>'
                  + '<div style="font-size:10px; color:' + descColor + ';">' + ach.desc + '</div></div></div>';
        }

        this.achBody.innerHTML = html;
        this.achievementsWindow.dataset.state = 'open';
    }

    closeAchievements  (){
        this.achievementsWindow.style.display = 'none';
        this.achievementsWindow.dataset.state = 'close';
    }

    //-----------------------------------HISTORY WINDOW

    openHistory  (data){
        var _this = this;

        var test = this.testOpen();
        if(test == 'history') return;

        if(this.historyWindow == null){
            this.historyWindow = document.createElement('div');
            this.historyWindow.className = 'hub-panel';
            this.historyWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:280px; max-height:400px;'
                                              + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.historyWindow );

            this.historyWindow.appendChild( this.makeWindowHeader('City History', function(){ _this.closeHistory(); }) );

            this.histBody = document.createElement('div');
            this.histBody.style.cssText = 'padding:10px 12px; pointer-events:auto; overflow-y:auto; max-height:340px;';
            this.historyWindow.appendChild( this.histBody );

        } else {
            this.historyWindow.style.display = 'flex';
        }

        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        var html = '';
        if (!data || data.length === 0) {
            html = '<div style="font-size:12px; color:rgba(180,210,240,0.5); text-align:center; padding:20px;">No events recorded yet</div>';
        } else {
            for (var i = 0; i < data.length; i++) {
                var evt = data[i];
                var typeColors = {
                    milestone: '#4bcc7a',
                    disaster: '#e05555',
                    achievement: '#f0b84a',
                    economic: '#4a9edd',
                    growth: '#8bcc5a',
                    season: '#b088e0'
                };
                var typeIcons = {
                    milestone: '◆',
                    disaster: '⚠',
                    achievement: '★',
                    economic: '$',
                    growth: '▲',
                    season: '◐'
                };
                var color = typeColors[evt.type] || '#dce8f5';
                var icon = typeIcons[evt.type] || '•';
                var monthStr = months[evt.month] || '???';
                var dateStr = monthStr + ' ' + evt.year;

                html += '<div style="display:flex; gap:8px; padding:5px 0; border-bottom:1px solid rgba(100,160,220,0.1);">'
                      + '<span style="color:' + color + '; font-size:14px; min-width:16px; text-align:center;">' + icon + '</span>'
                      + '<div style="flex:1;">'
                      + '<div style="font-size:11px; color:rgba(180,210,240,0.5);">' + dateStr + '</div>'
                      + '<div style="font-size:12px; color:#dce8f5;">' + evt.desc + '</div>'
                      + '</div></div>';
            }
        }

        this.histBody.innerHTML = html;
        this.historyWindow.dataset.state = 'open';
    }

    closeHistory  (){
        this.historyWindow.style.display = 'none';
        this.historyWindow.dataset.state = 'close';
    }

    //-----------------------------------ORDINANCES WINDOW

    openOrdinances (ordinances, annualCost) {
        var _this = this;

        var test = this.testOpen();
        if(test == 'ordinances') return;

        if(this.ordinancesWindow == null){
            this.ordinancesWindow = document.createElement('div');
            this.ordinancesWindow.className = 'hub-panel';
            this.ordinancesWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:280px;'
                                                + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild( this.ordinancesWindow );

            this.ordinancesWindow.appendChild( this.makeWindowHeader('City Ordinances', function(){ _this.closeOrdinances(); }) );

            this.ordBody = document.createElement('div');
            this.ordBody.style.cssText = 'padding:8px 12px; pointer-events:none; overflow-y:auto; max-height:420px;';
            this.ordinancesWindow.appendChild( this.ordBody );

        } else {
            this.ordinancesWindow.style.display = 'flex';
        }

        // Rebuild the list each time (ordinances may have toggled)
        this.ordBody.innerHTML = '';

        var costLabel = document.createElement('div');
        costLabel.style.cssText = 'font-size:11px; color:rgba(180,210,240,0.6); margin-bottom:8px; pointer-events:none;';
        costLabel.textContent = 'Annual ordinance cost: ' + (annualCost || 0) + '$';
        this.ordBody.appendChild(costLabel);

        if (Array.isArray(ordinances)) {
            for (var i = 0; i < ordinances.length; i++) {
                this._addOrdinanceRow(this.ordBody, ordinances[i]);
            }
        }

        this.ordinancesWindow.dataset.state = 'open';
    }

    _addOrdinanceRow (container, ord) {
        var _this = this;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:flex-start; gap:8px; margin-bottom:10px; pointer-events:auto; cursor:pointer;'
                          + ' padding:8px; border-radius:6px; border:1px solid rgba(100,160,220,0.2);'
                          + ' background:' + (ord.active ? 'rgba(75,204,122,0.12)' : 'rgba(255,255,255,0.03)') + ';'
                          + ' transition:background 120ms;';
        row.dataset.id = ord.id;

        var toggle = document.createElement('div');
        toggle.style.cssText = 'flex-shrink:0; width:16px; height:16px; border-radius:3px; border:1.5px solid '
                             + (ord.active ? '#4bcc7a' : 'rgba(100,160,220,0.4)') + ';'
                             + ' background:' + (ord.active ? '#4bcc7a' : 'transparent') + ';'
                             + ' margin-top:2px;';
        row.appendChild(toggle);

        var info = document.createElement('div');
        info.style.cssText = 'pointer-events:none;';
        info.innerHTML = '<div style="font-size:13px; font-weight:600; color:#dce8f5;">' + ord.name + '</div>'
                       + '<div style="font-size:11px; color:rgba(180,210,240,0.6); line-height:1.4;">' + ord.description + '</div>'
                       + (ord.annualCost > 0 ? '<div style="font-size:11px; color:rgba(224,160,60,0.85); margin-top:2px;">Cost: ' + ord.annualCost + '$ / year</div>' : '<div style="font-size:11px; color:rgba(180,210,240,0.4); margin-top:2px;">No annual cost</div>');
        row.appendChild(info);

        row.addEventListener('click', function(e){
            e.preventDefault();
            Main.setOrdinance(this.dataset.id);
        }, false);

        container.appendChild(row);
    }

    closeOrdinances (){
        this.ordinancesWindow.style.display = 'none';
        this.ordinancesWindow.dataset.state = 'close';
    }

    //-----------------------------------INDUSTRY SPECIALIZATION WINDOW

    openIndustrySpec (list, current) {
        var _this = this;

        var test = this.testOpen();
        if (test === 'industryspec') return;

        if (this.industrySpecWindow === null) {
            this.industrySpecWindow = document.createElement('div');
            this.industrySpecWindow.className = 'hub-panel';
            this.industrySpecWindow.style.cssText = 'position:absolute; top:44px; left:10px; width:260px;'
                                                  + ' pointer-events:none; display:flex; flex-direction:column; border-radius:10px;';
            this.hub.appendChild(this.industrySpecWindow);

            this.industrySpecWindow.appendChild(this.makeWindowHeader('City Economy <span class="hub-kbd">I</span>', function(){ _this.closeIndustrySpec(); }));

            this.indSpecBody = document.createElement('div');
            this.indSpecBody.style.cssText = 'padding:8px 12px; pointer-events:none; overflow-y:auto; max-height:460px;';
            this.industrySpecWindow.appendChild(this.indSpecBody);
        } else {
            this.industrySpecWindow.style.display = 'flex';
        }

        // Rebuild each time
        this.indSpecBody.innerHTML = '';

        var hdr = document.createElement('div');
        hdr.style.cssText = 'font-size:11px; color:rgba(180,210,240,0.6); margin-bottom:10px; pointer-events:none; line-height:1.5;';
        hdr.textContent = 'Choose your city\'s economic focus. Specializations affect tax yields, pollution, and city growth.';
        this.indSpecBody.appendChild(hdr);

        if (Array.isArray(list)) {
            for (var i = 0; i < list.length; i++) {
                this._addIndustrySpecRow(this.indSpecBody, list[i]);
            }
        }

        this.industrySpecWindow.dataset.state = 'open';
    }

    _addIndustrySpecRow (container, spec) {
        var _this = this;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; pointer-events:auto; cursor:pointer;'
                          + ' padding:8px; border-radius:6px; border:1px solid '
                          + (spec.active ? 'rgba(240,184,74,0.6)' : 'rgba(100,160,220,0.2)') + ';'
                          + ' background:' + (spec.active ? 'rgba(240,184,74,0.10)' : 'rgba(255,255,255,0.03)') + ';'
                          + ' transition:background 120ms;';
        row.dataset.id = spec.id;

        var icon = document.createElement('div');
        icon.style.cssText = 'flex-shrink:0; font-size:22px; line-height:1; margin-top:2px;';
        icon.textContent = spec.icon || '🏙️';
        row.appendChild(icon);

        var info = document.createElement('div');
        info.style.cssText = 'pointer-events:none; flex:1;';
        info.innerHTML = '<div style="font-size:13px; font-weight:600; color:#dce8f5;">' + spec.name
                       + (spec.active ? ' <span style="color:#f0b84a; font-size:10px;">[Active]</span>' : '') + '</div>'
                       + '<div style="font-size:11px; color:rgba(180,210,240,0.6); line-height:1.4; margin-top:2px;">' + spec.description + '</div>';
        row.appendChild(info);

        row.addEventListener('click', function(e){
            e.preventDefault();
            Main.setIndustrySpec(this.dataset.id);
        }, false);

        container.appendChild(row);
    }

    closeIndustrySpec () {
        if (this.industrySpecWindow) {
            this.industrySpecWindow.style.display = 'none';
            this.industrySpecWindow.dataset.state = 'close';
        }
    }

    clearElement  (id){
        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );
        this.hub.removeChild( el );
    }
}
