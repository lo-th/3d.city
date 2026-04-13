import { Base } from '../Base.js';
import { AppState } from '../../AppState.js'

//------------------------------------------------------//
//                HUB BUILD INTERFACE                   //
//------------------------------------------------------//


export class Hub_Pannel {

	constructor( hubMain, title, isRight = false ) {

		this.hubMain = hubMain;
		this.title = title;
		this.state = 'none';

		this.pannel = document.createElement('div');
        this.pannel.className = 'hub-panel';

        this.pannel.style.cssText = 'position:absolute; top:90px; width:240px; padding: 4px 4px;'
            + ' pointer-events:none; display:none; flex-direction:column; border-radius:10px; ';

        if( isRight ) this.pannel.style.right = '10px'
        else this.pannel.style.left = '10px'

        this.updateFunction = ()=>{};

	}

	init() {

	}

	open() {

		if( this.state === 'open' ){ 
			this.close()
			return
		}

		if( this.state === 'none' ){
			this.makeWindowHeader();
			this.init();
			this.hubMain.hub.appendChild( this.pannel );
		}

		this.pannel.style.display = 'flex';
		this.state = 'open';

		this.updateFunction()

	}

	close() {

		if( this.state!=='open' ) return
		this.pannel.style.display = 'none';
        this.state = 'close';
		
	}

	makeWindowHeader() {

		const close = this.close.bind(this);

        var h = document.createElement('div');
        h.className = 'hub-win-header';

        var t = document.createElement('span');
        t.className = 'hub-win-title';
        t.textContent = this.title;
        h.appendChild(t);

        var c = document.createElement('button');
        c.className = 'hub-win-close';
        c.innerHTML = '✕';
        c.title = 'Close (Esc)';
        c.addEventListener('click', function(e){ e.preventDefault(); close(); }, false);
        h.appendChild(c);
        
        this.pannel.appendChild(h);

    }

}