import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Economy extends Hub_Pannel {

	constructor( hub, isRight  ) {

		super( hub, 'Economy', isRight  );
        this.updateFunction = AppState.main.getIndustrySpec

	}

	update(list, current){
		// Rebuild each time
        this.body.innerHTML = '';

        var hdr = document.createElement('div');
        hdr.style.cssText = 'font-size:11px; color:rgba(180,210,240,0.6); margin-bottom:10px; pointer-events:none; line-height:1.5;';
        hdr.textContent = 'Choose your city\'s economic focus. Specializations affect tax yields, pollution, and city growth.';
        this.body.appendChild(hdr);

        if (Array.isArray(list)) {
            for (var i = 0; i < list.length; i++) {
                this._addIndustrySpecRow(this.body, list[i]);
            }
        }
	}

	init() {

		this.body = document.createElement('div');
        this.body.style.cssText = 'padding:8px 12px; pointer-events:auto; overflow-y:auto; max-height:400px;'
        + 'scrollbar-color: var(--c-accent) var(--c-bg); scrollbar-width: thin;'
        this.pannel.appendChild(this.body);

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

}