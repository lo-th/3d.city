import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Disaster extends Hub_Pannel {

	constructor( hub, isRight ) {

		super( hub, 'Disaster', isRight );

		this.type = ['None', 'Monster', 'Fire', 'Flood', 'Crash', 'Meltdown', 'Tornado', 'Earthquake'];
		this.icon = ['', '🦖 ', '🔥 ', '🌊 ', '✈︎ ', '💥 ', '🌪️ ', '♒︎ '];	
		this.buttons = [];

	}

	init() {

		this.body = document.createElement('div');
        this.body.style.cssText = 'width:100%; padding:10px 0px; align-items: center; pointer-events:none; display:flex; flex-direction:column; gap:6px;';
        this.pannel.appendChild( this.body );

		for(var i=0; i<this.type.length; i++){
            this.buttons[i] = this.hubMain.addButton( this.body, this.icon[i] + this.type[i].toUpperCase(), [138, 24, 11],null);
            this.buttons[i].name = this.type[i];
            this.buttons[i].addEventListener('click',  function(e){ e.preventDefault(); AppState.main.setDisaster(this.name); }, false);
        }

	}

}