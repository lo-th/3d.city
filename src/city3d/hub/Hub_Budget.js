import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Budget extends Hub_Pannel {

	constructor( hub, isRight ) {

		super( hub, 'Budget', isRight );

		this.resTaxRate = 7;
        this.comTaxRate = 7;
        this.indTaxRate = 7;

        this.roadRate = 0
        this.roadFund = 0
        this.fireRate = 0
        this.fireFund = 0
        this.policeRate = 0
        this.policeFund = 0
        this.waterRate = 0
        this.waterFund = 0
        this.educationRate = 0
        this.educationFund = 0

        this.totalFunds = 0
        this.taxesCollected = 0
        this.bondAnnualPayment = 0
        this.bondMaxDebt = 0

        this.bondDebt =  0;
        this.bondAnnualPayment = 0;
        this.bondMaxDebt = 0

        this.cashFlow = 0

        this.updateFunction = AppState.main.getBudget

	}

	update( data ) {

		for(let m in data){
			if(this[m]!==undefined){ 
				this[m] = data[m];
			}
		}

        var previousFunds = this.totalFunds;
        var taxesCollected = this.taxesCollected || 0;
        this.cashFlow = taxesCollected - (this.roadFund || 0) - (this.fireFund || 0) - (this.policeFund || 0) - (this.waterFund || 0);

	    if(this.state === 'none') return;
        if(this.state === 'close') return;

	    this.hubMain.setSliderValue('Residential Tax', this.resTaxRate, 20, null);
        this.hubMain.setSliderValue('Commercial Tax', this.comTaxRate, 20, null);
        this.hubMain.setSliderValue('Industrial Tax', this.indTaxRate, 20, null);
        this.hubMain.setSliderValue('Roads',   this.roadRate,   100, this.roadFund);
        this.hubMain.setSliderValue('Fire',    this.fireRate,   100, this.fireFund);
        this.hubMain.setSliderValue('Police',  this.policeRate, 100, this.policeFund);
        this.hubMain.setSliderValue('Water',   this.waterRate !== undefined ? this.waterRate : 100, 100, this.waterFund);
        this.hubMain.setSliderValue('Education', this.educationRate !== undefined ? this.educationRate : 100, 100, this.educationFund);

        

        this.budgetResult.innerHTML = '<span style="color:rgba(180,210,240,0.6)">Annual receipts:</span> ' + this.cashFlow + '$'
                                    + '<br><span style="color:rgba(180,210,240,0.6)">Taxes collected:</span> ' + taxesCollected + '$';

        // Update bond info display
        var bondDebt    = this.bondDebt        || 0;
        var bondPayment = this.bondAnnualPayment || 0;
        var bondMax     = this.bondMaxDebt      || 50000;
        var debtColor   = bondDebt === 0 ? 'rgba(180,210,240,0.6)' : bondDebt > bondMax * 0.8 ? '#e05555' : '#f0b84a';
        if (this.bondDebtInfo) {
            this.bondDebtInfo.innerHTML = '<span style="color:rgba(180,210,240,0.6);">Outstanding debt:</span>'
                + ' <span style="color:' + debtColor + '; font-weight:600;">' + bondDebt + '$</span>'
                + '<br><span style="color:rgba(180,210,240,0.6);">Interest / yr:</span>'
                + ' <span style="color:' + (bondPayment > 0 ? '#f0b84a' : 'rgba(180,210,240,0.6)') + ';">' + bondPayment + '$</span>'
                + '<br><span style="color:rgba(180,210,240,0.4); font-size:10px;">Max: ' + bondMax + '$ (7% annual)</span>';
        }

	}

	init() {

		const body = document.createElement('div');
        body.style.cssText = 'padding:10px 12px 6px; pointer-events:none; overflow-y:auto; overflow-x:hidden;'
                           + ' display:flex; flex-direction:column; align-items: center;';
        this.pannel.appendChild( body );

        var taxLabel = document.createElement('div');
        taxLabel.style.cssText = 'font-size:10px; font-weight:700;'
                               + ' letter-spacing:0.08em; color:rgba(75,204,122,0.8); text-transform:uppercase;'
                               + ' margin-bottom:2px;';
        taxLabel.textContent = 'Tax Rates';
        body.appendChild(taxLabel);

        this.hubMain.addSlider(body, null, 'Residential Tax', this.resTaxRate, null, '#27a866', 20);
        this.hubMain.addSlider(body, null, 'Commercial Tax', this.comTaxRate, null, '#61B2F4', 20);
        this.hubMain.addSlider(body, null, 'Industrial Tax', this.indTaxRate, null, '#d4cd2a', 20);

        var svcLabel = document.createElement('div');
            svcLabel.style.cssText = 'font-size:10px; font-weight:700;'
                                   + ' letter-spacing:0.08em; color:rgba(224,85,85,0.8); text-transform:uppercase;'
                                   + ' margin-top:6px; margin-bottom:2px;';
            svcLabel.textContent = 'Services';
            body.appendChild(svcLabel);

        this.hubMain.addSlider(body, null, 'Roads',  this.roadRate,   this.roadFund,   '#e05555', 100);
        this.hubMain.addSlider(body, null, 'Fire',   this.fireRate,   this.fireFund,   '#e05555', 100);
        this.hubMain.addSlider(body, null, 'Police', this.policeRate, this.policeFund, '#e05555', 100);
        this.hubMain.addSlider(body, null, 'Water',  this.waterRate !== undefined ? this.waterRate : 100, this.waterFund,  '#4a9edd', 100);
        this.hubMain.addSlider(body, null, 'Education', this.educationRate !== undefined ? this.educationRate : 100, this.educationFund, '#a855f7', 100);

        this.budgetResult = document.createElement('div');
        this.budgetResult.style.cssText = 'pointer-events:none; color:' + '#dce8f5' + '; font-size:12px; line-height:1.6;'
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
        this.bondDebtInfo.style.cssText = 'pointer-events:none; color:' + '#dce8f5' + '; font-size:11px; line-height:1.5;'
                                        + ' margin-bottom:6px;';
        body.appendChild(this.bondDebtInfo);


        var bondBtnsRow = document.createElement('div');
        bondBtnsRow.style.cssText = 'display:flex; gap:4px; pointer-events:auto; margin-bottom:6px;';
        body.appendChild(bondBtnsRow);

        var b5k  = this.hubMain.addButton(bondBtnsRow, '+$5K',  [58, 22, 12], null);
        var b10k = this.hubMain.addButton(bondBtnsRow, '+$10K', [62, 22, 12], null);
        var b20k = this.hubMain.addButton(bondBtnsRow, '+$20K', [62, 22, 12], null);
        b5k.title  = 'Issue $5,000 bond (7% interest/yr)';
        b10k.title = 'Issue $10,000 bond (7% interest/yr)';
        b20k.title = 'Issue $20,000 bond (7% interest/yr)';
        b5k.addEventListener( 'click', function(e){ e.preventDefault(); AppState.main.issueBond(5000);  }, false);
        b10k.addEventListener('click', function(e){ e.preventDefault(); AppState.main.issueBond(10000); }, false);
        b20k.addEventListener('click', function(e){ e.preventDefault(); AppState.main.issueBond(20000); }, false);

        

	}

	apply(){

		var wRate = this.waterRate !== undefined ? this.waterRate : 100;
        var eRate = this.educationRate !== undefined ? this.educationRate : 100;
        AppState.main.setBudget([this.resTaxRate, this.comTaxRate, this.indTaxRate, this.roadRate, this.fireRate, this.policeRate, wRate, eRate]);

        //this.close()

	}

}