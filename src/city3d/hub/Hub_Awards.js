import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Awards extends Hub_Pannel {

	constructor( hub, isRight ) {

		super( hub, 'Awards', isRight );
        this.updateFunction = AppState.main.getAwards

	}

	update( data, progress ){

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

        this.body.innerHTML = html;

	}

	init() {

		this.body = document.createElement('div');
        this.body.style.cssText = 'padding:10px 12px; pointer-events:auto; overflow-y:auto; max-height:400px;' 
        + 'scrollbar-color: var(--c-accent) var(--c-bg); scrollbar-width: thin;'
        //* 'overflow-y: scroll; scrollbar-color: rebeccapurple green; scrollbar-width: thin;';;
        this.pannel.appendChild( this.body );

	}

}