import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Save_Load extends Hub_Pannel {

	constructor( hub, isRight ) {

		super( hub, 'Save Load', isRight );

	}

	init() {

		this.body = document.createElement('div');
        this.body.style.cssText = 'padding:10px 12px; pointer-events:none; align-items: center; display:flex; flex-direction:column; gap:6px;';
        this.pannel.appendChild( this.body );

        const bg2 = this.hubMain.addButton(this.body, 'LOCAL SAVE', [138, 26, 11], null);
        const bg3 = this.hubMain.addButton(this.body, 'SAVE', [138, 26, 11], null);
        const bg4 = this.hubMain.addButton(this.body, 'LOAD', [138, 26, 11], null);

        bg2.title = 'Save current city to localStorage';
        bg3.title = 'Save current city to a JSON file';
        bg4.title = 'Load a previously saved city';

        bg2.addEventListener('click', function(e){ e.preventDefault(); AppState.main.autoSave();   }, false);
        bg3.addEventListener('click', function(e){ e.preventDefault(); AppState.main.saveGame();   }, false);
        bg4.addEventListener('click', function(e){ e.preventDefault(); AppState.main.loadGame();   }, false);

        var sep = document.createElement('div');
        sep.style.cssText = 'border-top:1px solid rgba(100,160,220,0.22); margin:2px 0;';
        this.body.appendChild(sep);

        const bg1 = this.hubMain.addButton(this.body, 'NEW MAP',  [138, 26, 11], null);
        bg1.title = 'Create a new city on a freshly generated map';
        bg1.addEventListener('click', function(e){
            e.preventDefault();
            _this.closeExit();
            _this.openNewMap(function(){ Main.playMap(); });
        }, false);

	}

}