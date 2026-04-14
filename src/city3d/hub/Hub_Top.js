import { Base } from '../Base.js';
import { AppState } from '../../AppState.js'

import { Hub_Disaster } from './Hub_Disaster.js'
import { Hub_Budget } from './Hub_Budget.js'
import { Hub_Awards } from './Hub_Awards.js'
import { Hub_Eval } from './Hub_Eval.js'
import { Hub_History } from './Hub_History.js'
import { Hub_Overlays } from './Hub_Overlays.js'
import { Hub_Ordinances } from './Hub_Ordinances.js'
import { Hub_Economy } from './Hub_Economy.js'
import { Hub_Save_Load } from './Hub_Save_Load.js'
import { Hub_About } from './Hub_About.js'


//------------------------------------------------------//
//              HUB TOP INFO INTERFACE                  //
//------------------------------------------------------//
const cityIcon = { 
    Village:'🛖',
    Town:'🏡', 
    City:'🏢', 
    Capital:'🏦', 
    Metropolos:'🗽', 
    Megalopolis:'🗼' 
}

const seasonIcons = ['🌱', '☀', '🍂', '❄'];

export class Hub_Top {

	constructor( parent ) {

		this.parent = parent;
		const target = parent.hub

		const self = this;

		this.taxeIncome = ''

		this.content0 = document.createElement('div');
        this.content0.style.cssText ='position:absolute; top:0px; left:0; width:100%; height:200px; pointer-events:none;  background:none;' + ' transform: scale(0.66); transform-origin: top;';
        target.appendChild( this.content0 );

		this.content = document.createElement('div');
        this.content.style.cssText ='position:absolute; top:0px; left:0; width:100%; height:200px; pointer-events:none;  background:none;' + ' transform: scale(0.66); transform-origin: top left;';
        target.appendChild( this.content );

        this.inner = document.createElement('div');
        this.inner.style.cssText ='position:absolute; top:0px; left:0px; border:4px solid var(--c-border); border-radius:0 0 20px 0;  border-top:none; border-left:none; width:548px; height:120px; pointer-events:none; background:var(--c-surface-alt); box-sizing: content-box; box-shadow: var(--shadow-hub);';
        this.content.appendChild( this.inner );


        this.content2 = document.createElement('div');
        this.content2.style.cssText ='position:absolute; top:0px; right:0; width:100%; height:200px; pointer-events:none;  background:none;' + ' transform: scale(0.66); transform-origin: top right;';
        target.appendChild( this.content2 );

        this.inner2 = document.createElement('div');
        this.inner2.style.cssText ='position:absolute; top:0px; right:0px;  border:4px solid var(--c-border); border-top:none; border-right:none; border-radius:0 0 0 20px; width:548px; height:120px; pointer-events:none; background:var(--c-surface-alt); box-sizing: content-box; box-shadow: var(--shadow-hub);';
        this.content2.appendChild( this.inner2 );

        this.initPannel()
        this.initInfo()

	}

	initPannel() {

		this.pannelsIcon =['💰', '🔍', '⚖️', '💡', '🏆', '🏛️', '👁️', '⚠️', '💾', '❓']
        let n = 0

        this.pannels = {

            Budget :      new Hub_Budget(this.parent),
            Eval:         new Hub_Eval(this.parent),
            Orders:       new Hub_Ordinances(this.parent),
            Economy:      new Hub_Economy(this.parent), 
            Awards:       new Hub_Awards(this.parent),

            History:      new Hub_History(this.parent, true),
            Overlay:      new Hub_Overlays(this.parent, true),
            Disaster:     new Hub_Disaster(this.parent, true),
            Files:        new Hub_Save_Load(this.parent, true), 
            About:        new Hub_About(this.parent, true),
        
        }
        
        // ── Top menu bar ──────────────────────────────────────────────

        const topBar = document.createElement('div');
        topBar.style.cssText = 'position:absolute; width:538px; height:45px; top:0px; left:5px; display: flex; align-items: center; justify-content: center; gap:4px 4px;'
        +'background-repeat: repeat-x; background-image: url("./assets/img/stripe_l.png");';
        this.inner.appendChild( topBar );

        const topBar2 = document.createElement('div');
        topBar2.style.cssText = 'position:absolute; width:538px; height:45px; top:0px; left:5px; display: flex; align-items: center; justify-content: center; gap:4px 4px'
        +'background-repeat: repeat-x; background-image: url("./assets/img/stripe_r.png");'
        this.inner2.appendChild( topBar2 );
        //topBar.style.top = '100px'

        let button; 

        for( let m in this.pannels ){

            button = this.parent.addButton(n<5? topBar:topBar2, this.pannelsIcon[n]+m, [0,30,16], '', true);
            button.addEventListener('click',  ( e ) => { e.preventDefault(); this.closePannel( m ); this.pannels[m].open(); }, false);
            n++

        }

	}

	closePannel(mm){
        for( let m in this.pannels ){
            if(m!==mm) this.pannels[m].close()
        }
    }

    setTaxeIncome( v ) {
    	
    }

	initInfo() {

		this.statusBar = document.createElement('div');
        this.statusBar.className = 'hub-statusbar';
        this.statusBar.style.cssText = 'position:absolute; width:528px; height:60px; top:46px; left:10px;';//28
        this.inner.appendChild( this.statusBar );

        this.statusBar2 = document.createElement('div');
        this.statusBar2.className = 'hub-statusbar';
        this.statusBar2.style.cssText = 'position:absolute; width:528px; height:60px; top:46px; right:10px;';//28
        this.inner2.appendChild( this.statusBar2 );

		var stats = [
		    { key:'class',      label:'class',       ref:'class'       },
            { key:'date',       label:'Date',        ref:'date'       },
            { key:'population', label:'Population',  ref:'population' },
            { key:'money',      label:'money',       ref:'money', color:'#00d26a'      },
            { key:'score',      label:'Score',       ref:'score' , color:'#fcd53f'     },
            { key:'happiness',  label:'happiness',   ref:'happiness' , color:'#fcd53f'     },
        ];

        for(var i=0; i<stats.length; i++){
            var block = document.createElement('div');
            block.className = 'hub-stat';
            var lbl = document.createElement('div');
            lbl.className = 'hub-stat-label';
            lbl.textContent = stats[i].label;
            var val = document.createElement('div');
            val.className = 'hub-stat-value';
            if(stats[i].color) val.style.color = stats[i].color
            block.appendChild(lbl);
            block.appendChild(val);
            if(i<3) this.statusBar.appendChild(block);
            else this.statusBar2.appendChild(block);
            this[stats[i].ref] = val;
        }

        this.msg = document.createElement('div');
        this.msg.className = 'hub-stat-message';
        this.msg.style.cssText = 'position:absolute; margin-left:-300px; width:600px; height:20px; top:10px; left:50%; text-align:center;';
        this.content0.appendChild( this.msg );

	}

	updateInfo( infos ) {

		if(!infos) return

		let type = infos[1].toLowerCase();
		type = type.charAt(0).toUpperCase() + type.slice(1);

		const seasonIdx = infos[17];
		const happiness = this.pannels.Eval.happiness;//infos[16];
        const happyColor = happiness >= 70 ? '#4bcc7a' : happiness >= 40 ? '#f0b84a' : '#e05555';
        const happyIcon = happiness >= 70 ? '😆' : happiness >= 40 ? '😊' : '😞';

        this.cashFlow = this.pannels.Budget.cashFlow > 0 ? '▲':'▼';

        this.class.innerHTML  = cityIcon[type]+'&nbsp'+type;
		this.date.innerHTML       = seasonIcons[seasonIdx] +'&nbsp'+ infos[0];
        this.money.innerHTML      = this.cashFlow +'&nbsp'+ infos[4]+'💲';
        this.population.innerHTML = '🏠︎&nbsp' + infos[3];
        this.score.innerHTML      = '⭐&nbsp' + infos[2];
        this.happiness.innerHTML      = '<span style="color:' + happyColor + ';">' + happyIcon +'&nbsp'+ happiness + '%</span>';

        if( infos[8]) this.msg.innerHTML = '💬&nbsp' + infos[8];

	}

}