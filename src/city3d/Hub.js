//import * as UIL from '../../build/uil.module.js'

import { Base } from './Base.js';
import { AppState } from '../AppState.js'

import { Hub_Build } from './hub/Hub_Build.js'
import { Hub_Top } from './hub/Hub_Top.js'

import { Hub_Disaster } from './hub/Hub_Disaster.js'
import { Hub_Budget } from './hub/Hub_Budget.js'
import { Hub_Awards } from './hub/Hub_Awards.js'
import { Hub_Eval } from './hub/Hub_Eval.js'
import { Hub_History } from './hub/Hub_History.js'
import { Hub_Overlays } from './hub/Hub_Overlays.js'
import { Hub_Ordinances } from './hub/Hub_Ordinances.js'
import { Hub_Economy } from './hub/Hub_Economy.js'
import { Hub_Save_Load } from './hub/Hub_Save_Load.js'
import { Hub_About } from './hub/Hub_About.js'


//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//


export class Hub {

    constructor() {

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

        const bottomBar = document.createElement('div');
        bottomBar.className = 'hub-bottombar';
        this.hub.appendChild( bottomBar );

        this.version = document.createElement('div');
        this.version.className = 'hub-version';
        
        this.fps = document.createElement('div');
        this.fps.className = 'hub-fps';
       
        this.full.appendChild(this.loadTitle);
        this.full.appendChild(this.loadSub);
        this.full.appendChild(this.loader);
        this.full.appendChild(this.text);
        
        this.hub.appendChild( this.full );
        bottomBar.appendChild( this.fps )
        bottomBar.appendChild( this.version )
        

    }

    upFps( v ) {

        this.fps.innerHTML = v;

    }

    message( s ) {

        if( this.text ) this.text.textContent = s;

    }


    showError( e ) {

        console.log(e)

    }

    start() {

    	if(this.isIntro){
    		this.timer = setInterval(this.fadding, 80, this);
    	}

    }

    
    fadding( t ) {

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
                this.isGen = true
            }
        } else {
            if( this.isGen ){
                if (this.full.parentNode === this.hub) this.hub.removeChild( this.full );
                this.isGen = false
            }
        }
        
    }

    removeChilds( node ) {
        var last;
        while (last = node.lastChild) node.removeChild(last);
    };

    //--------------------------------------start hub

    initStartHub() {

        let textbase = '<span style="color:#909A96; font-size:10px; ">&nbsp;FPS</span>'
        this.version.innerHTML = textbase + ' . v ' + AppState.version  + (AppState.isWebGPU?' . GPU' : ' . GL2')+(AppState.isWorker ? ' . W' : ' . D');
       
        this.mainmenu = document.createElement('div');
        this.mainmenu.style.cssText ='position:absolute; bottom:0px; left:50%; margin-left:-130px; width:260px; height:200px; pointer-events:none; display:flex; align-items: center;';

        this.hub.appendChild( this.mainmenu );
        const b1 = this.addButton(this.mainmenu, 'New Game', [260, 48, 40], 'position:absolute; top:0px; left:0px;');
        const b2 = this.addButton(this.mainmenu, 'Load Map', [260, 37, 22], 'position:absolute; top:70px; left:0px;');
        const b3 = this.addButton(this.mainmenu, 'About',  [180, 26, 22], 'position:absolute; top:129px; left:40px;');

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.view3d.openMap('NEW'); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); AppState.view3d.openMap('LOAD'); }, false);
        b3.addEventListener('click',  function ( e ) { e.preventDefault(); let w = window.open('https://github.com/lo-th/3d.city','_blank'); }, false);

    }

    clearStartHub() {

        if(!this.mainmenu) return;
        this.removeChilds( this.mainmenu );
        this.hub.removeChild( this.mainmenu );
        this.mainmenu = null;

    }

    //--------------------------------------map creation hub

    initMapHub() {

        this.mapmenu = document.createElement('div');
        this.mapmenu.style.cssText ='position:absolute; top:10px; left:50%; margin-left:-190px; width:380px; height:200px; pointer-events:none;';
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
        this.removeChilds( this.mapmenu );
        this.hub.removeChild( this.mapmenu );
        this.mapmenu = null;

    }

    resetTool() {

        this.buildHub.resetTool()

    }

    updateRCI( r, c, i ) {

        this.buildHub.updateRCI( r, c, i );

    }



    updatePannels( budgetData, evalData ) {

        this.topHub.pannels.Budget.update( budgetData )
        this.topHub.pannels.Eval.update( evalData )
    }




    ///

    updateBudget( data ){

        this.topHub.pannels.Budget.update( data )
    
    }

    updateEval( data ){

        this.topHub.pannels.Eval.update( data )
    
    }

    updateEconomy( list, current ) {

        this.topHub.pannels.Economy.update( list, current )
        
    }

    updateHistory( data ) {

        this.topHub.pannels.History.update( data )

    }

    updateAwards( data, progress ) {

        this.topHub.pannels.Awards.update( data, progress )

    }

    updateOrdinances ( ordinances, annualCost ) {
        
        this.topHub.pannels.Orders.update( ordinances, annualCost )

    }

    


    //--------------------------------------game hub

    initGameHub() {

        if (this._gameHubInit) return;
        this._gameHubInit = true;

        this.topHub = new Hub_Top(this);
        this.buildHub = new Hub_Build(this);


        // new pannel

        /*this.topHub.pannelsIcon =['💰', '🔍', '🏆', '🏛️', '⚖️', '👁️', '⚠️', '💡', '💾', '❓']
        let n = 0

        this.topHub.pannels = {

            Budget :      new Hub_Budget(this),
            Eval:         new Hub_Eval(this),
            Awards:       new Hub_Awards(this),
            History:      new Hub_History(this),
            Ordinances:   new Hub_Ordinances(this),
            Overlays:     new Hub_Overlays(this),
            Disaster:     new Hub_Disaster(this),
            Economy:      new Hub_Economy(this), 
            'Save/Load':  new Hub_Save_Load(this), 
            About:        new Hub_About(this),
        
        }
        
        // ── Top menu bar ──────────────────────────────────────────────

        const topBar = document.createElement('div');
        topBar.className = 'hub-topmenu';
        this.hub.appendChild( topBar );
        //topBar.style.top = '100px'

        let button; 

        for( let m in this.topHub.pannels ){

            button = this.addButton(topBar, this.topHub.pannelsIcon[n], [90,26,14], '', true);
            button.addEventListener('click',  ( e ) => { e.preventDefault(); this.closePannel( m ); this.topHub.pannels[m].open(); }, false);
            n++

        }*/

    }

    hideoldSel() {

        for(var i = 0; i<4; i++){
            this.H[i].style.background = 'none';
        }

    }

    //-----------------------------------CITY INFO

    updateCITYinfo( infos ) {

        this.topHub.updateInfo( infos );
        this.updateRCI( infos[5], infos[6], infos[7] );

    }

    

    //-----------------------------------SLIDER

    addSlider  (target, py, name, value, v2, color, max){
        var _this = this;
        var txt = document.createElement( 'div' );
        var bg  = document.createElement( 'div' );
        var sel = document.createElement( 'div' );

        sel.style.cssText = 'border-radius:6px; position:absolute; pointer-events:none;'
                          + ' margin:4px 4px; height:6px; background:' + color + '; opacity:0.8;';

       
        // Flow layout: wrapper provides top spacing for the label that floats above the track
        txt.style.cssText = 'position:absolute; left:0; top:-18px; pointer-events:none;'
                          + ' width:180px; height:20px; font-size:12px; color:' + this.colors[0] + ';';
        bg.style.cssText  = ' border-radius:6px; position:relative; cursor:w-resize; pointer-events:auto;'
                          + ' width:180px; height:14px;'
                          + ' background:rgba(255,255,255,0.07); border:1px solid rgba(100,160,220,0.22);'
                          + ' transition:border-color 150ms; margin-top:20px; margin-bottom:6px;';
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
                case 'Residential Tax': children[1].innerHTML = t.name+' '+value+'%'; this.topHub.pannels.Budget.resTaxRate = value; this.topHub.pannels.Budget.apply(); break;
                case 'Commercial Tax': children[1].innerHTML = t.name+' '+value+'%'; this.topHub.pannels.Budget.comTaxRate = value; this.topHub.pannels.Budget.apply();break;
                case 'Industrial Tax': children[1].innerHTML = t.name+' '+value+'%'; this.topHub.pannels.Budget.indTaxRate = value; this.topHub.pannels.Budget.apply();break;
                //case 'Tax':     children[1].innerHTML = t.name+' '+value+'%'; this.taxRate=value; break;
                case 'Roads':   children[1].innerHTML = t.name+' '+value+'% of '+(this.topHub.pannels.Budget.roadFund||0)+'$ = '+Math.floor((this.topHub.pannels.Budget.roadFund||0)*(value/100))+'$'; this.topHub.pannels.Budget.roadRate=value; this.topHub.pannels.Budget.apply();break;
                case 'Fire':    children[1].innerHTML = t.name+' '+value+'% of '+(this.topHub.pannels.Budget.fireFund||0)+'$ = '+Math.floor((this.topHub.pannels.Budget.fireFund||0)*(value/100))+'$'; this.topHub.pannels.Budget.fireRate=value; this.topHub.pannels.Budget.apply();break;
                case 'Police':  children[1].innerHTML = t.name+' '+value+'% of '+(this.topHub.pannels.Budget.policeFund||0)+'$ = '+Math.floor((this.topHub.pannels.Budget.policeFund||0)*(value/100))+'$'; this.topHub.pannels.Budget.policeRate=value; this.topHub.pannels.Budget.apply();break;
                case 'Water':   children[1].innerHTML = t.name+' '+value+'% of '+(this.topHub.pannels.Budget.waterFund||0)+'$ = '+Math.floor((this.topHub.pannels.Budget.waterFund||0)*(value/100))+'$'; this.topHub.pannels.Budget.waterRate=value; this.topHub.pannels.Budget.apply();break;
                case 'Education': children[1].innerHTML = t.name+' '+value+'% of '+(this.topHub.pannels.Budget.educationFund||0)+'$ = '+Math.floor((this.topHub.pannels.Budget.educationFund||0)*(value/100))+'$'; this.topHub.pannels.Budget.educationRate=value; this.topHub.pannels.Budget.apply();break;
            }
        }
    }



    //------------------------------------------ DEF BUTTON

    addButton( target, name, size = [128, 30, 22], style = '', top ) {

        const b = document.createElement( 'div' );
        b.className = 'hub-btn';
        let defStyle = `width:${size[0]}px; height:${size[1]}px; font-size:${size[2]}px;`
        if( top ) defStyle = `height:${size[1]}px; font-size:${size[2]}px; border-radius:4px;`
                           + `padding:0px 4px; display: flex; justify-content: center; align-items: center;`
        b.textContent = name;
        b.style.cssText = defStyle + style;
        target.appendChild( b );
        return b;

    }

    //---------------------------------- SELECTOR 

    addSelector( target, type, names, fun, current, size, sizeH ) {

        var _this = this;
        var cont = document.createElement('div');
        cont.className = 'selector-title';
        cont.innerHTML = type+"<br>";
        cont.id = type;

        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );
            t[i].className = 'hub-btn';
            t[i].style.cssText = 'font-size:14px;';
            t[i].style.cssText +=' width:70px; height:16px; margin:2px; padding:7px; pointer-events:auto; cursor:pointer; display:inline-block; ';

            if(i==0) t[i].style.cssText += this.radiusL;
            if(i==names.length-1) t[i].style.cssText += this.radiusR;
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
            t[i].textContent = names[i];
            if(i==current) t[i].className = "hub-btn-select";
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );
            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelector(this.name, type); }, false );
           
        }
        target.appendChild( cont );
        return cont;

    }

    setActiveSelector( n, type ) {

        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                def.className = "hub-btn";
            }
        }
        var select = document.getElementById(type+n);
        select.className = "hub-btn-select";

    }

    removeSelector( type ) {

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

    clearElement( id ) {

        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );
        this.hub.removeChild( el );

    }

}
