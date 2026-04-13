import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Ordinances extends Hub_Pannel {

	constructor( hub, isRight  ) {

		super( hub, 'Ordinances', isRight  );
        this.updateFunction = AppState.main.getOrdinances

	}

	update( ordinances, annualCost ){

		// Rebuild the list each time (ordinances may have toggled)
        this.body.innerHTML = '';

        var costLabel = document.createElement('div');
        costLabel.style.cssText = 'font-size:11px; color:rgba(180,210,240,0.6); margin-bottom:8px; pointer-events:none;';
        costLabel.textContent = 'Annual ordinance cost: ' + (annualCost || 0) + '$';
        this.body.appendChild(costLabel);

        if (Array.isArray(ordinances)) {
            for (var i = 0; i < ordinances.length; i++) {
                this._addOrdinanceRow(this.body, ordinances[i]);
            }
        }

	}

	init() {

		this.body = document.createElement('div');
        this.body.style.cssText = 'padding:8px 12px; pointer-events:auto; overflow-y:auto; max-height:400px;'
        + 'scrollbar-color: var(--c-accent) var(--c-bg); scrollbar-width: thin;'
        this.pannel.appendChild( this.body );

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

}