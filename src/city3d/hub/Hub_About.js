import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_About extends Hub_Pannel {

	constructor( hub, isRight ) {

		super( hub, 'About', isRight );

	}

	init() {

		var body = document.createElement('div');
        body.style.cssText = 'padding:10px 12px; pointer-events:none;';
        this.pannel.appendChild( body );

        var desc = document.createElement('div');
        desc.style.cssText = 'font-size:12px; color:#dce8f5; line-height:1.6; margin-bottom:10px; pointer-events:auto;';
        desc.innerHTML = '<b>3d.city</b> v' + AppState.version + '<br>'
                       + 'Author <a href="https://github.com/lo-th" target="_blank">lo-th</a><br><br>'
                       + '3d with <b>three.js</b><br>'
                       + 'Simulation inspired by MicropolisJS';
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
        this.linke.style.cssText = 'pointer-events:auto; font-size:12px;';
        this.linke.innerHTML = "<a href=https://github.com/lo-th/3d.city' target='_blank'>Source Code on GitHub ↗</a>";
        body.appendChild( this.linke );

	}

}