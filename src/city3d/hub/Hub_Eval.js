import { Hub_Pannel } from './Hub_Pannel.js';
import { AppState } from '../../AppState.js'

export class Hub_Eval extends Hub_Pannel {

	constructor( hub, isRight  ) {

		super( hub, 'Eval', isRight  );
        this.updateFunction = AppState.main.getEval
        this.happiness = 50;

	}

	_getLevelString  (value, maxValue, strings) {
        var idx = Math.floor((value / maxValue) * (strings.length - 1));
        idx = Math.max(0, Math.min(idx, strings.length - 1));
        var colors = ['#e05555', '#e07744', '#f0b84a', '#8bcc5a', '#4bcc7a'];
        return '<span style="color:' + colors[idx] + ';">' + strings[idx] + '</span>';
    }

	update( data ) {

        
        this.happiness = data[7] || 50;


		if(this.state === 'none') return;
        if(this.state === 'close') return;

		this.evaltYes.innerHTML = 'YES: ' + data[0] + '%';
        this.evaltNo.innerHTML  = 'NO: ' + (100 - data[0]) + '%';

        var lblStyle = 'display:inline-block; width:120px; color:rgba(180,210,240,1); text-align:left; ';
        var titleStyle = 'display:inline-block; width:100%; font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);'
        +'text-align:center; font-weight:bold; border-top:1px solid rgba(100,160,220,0.22); margin-top:8px;';

        //this.evaltProb.innerHTML = '<b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">WORST PROBLEMS</b><br>' + data[1];
        this.evaltProb.innerHTML = '<span style="' + titleStyle + '">WORST PROBLEMS</span><br>' + data[1];

        this.evaltStats.innerHTML = '<span style="' + titleStyle + '">CITY STATISTICS</span><br>'//'<b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">CITY STATISTICS</b><br>'
            + '<span style="' + lblStyle + '">🚨 Crime:</span>'     + data[2] + '<br>'
            + '<span style="' + lblStyle + '">💨 Pollution:</span>' + data[3] + '<br>'
            + '<span style="' + lblStyle + '">🚗 Traffic:</span>'   + data[4] + '<br>';

        // Extended statistics
        let eduLevel = data[5] || 0;
        let healthLevel = data[6] || 0;
        //let happiness = data[7] || 50;
        let unemployment = data[8] || 0;
        let season = data[9] || 'Spring';
        let policeCoverage = data[10] !== undefined ? data[10] : 0;
        let fireCoverage   = data[11] !== undefined ? data[11] : 0;
        let parkCount      = data[12] !== undefined ? data[12] : 0;
        let waterCoverage  = data[13] !== undefined ? data[13] : 100;
        let indDef         = data[14] || null;
        let hospitalCount  = data[15] !== undefined ? data[15] : 0;
        let schoolCount    = data[16] !== undefined ? data[16] : 0;
        let eduCoverage    = data[17] !== undefined ? data[17] : 100;

        let happyColor = this.happiness >= 70 ? '#4bcc7a' : this.happiness >= 40 ? '#f0b84a' : '#e05555';
        let eduStr = this._getLevelString(eduLevel, 200, ['None', 'Poor', 'Basic', 'Good', 'Excellent']);
        let healthStr = this._getLevelString(healthLevel, 200, ['Critical', 'Poor', 'Fair', 'Good', 'Excellent']);
        let policeColor = policeCoverage >= 70 ? '#4bcc7a' : policeCoverage >= 40 ? '#f0b84a' : '#e05555';
        let fireColor   = fireCoverage   >= 70 ? '#4bcc7a' : fireCoverage   >= 40 ? '#f0b84a' : '#e05555';
        let parkColor   = parkCount      >= 10 ? '#4bcc7a' : parkCount      >= 3  ? '#f0b84a' : 'rgba(180,210,240,0.5)';
        let waterColor  = waterCoverage  >= 80 ? '#4bcc7a' : waterCoverage  >= 50 ? '#f0b84a' : '#e05555';
        let eduCovColor = eduCoverage    >= 80 ? '#4bcc7a' : eduCoverage    >= 50 ? '#f0b84a' : '#e05555';
        let indStr = indDef ? (indDef.icon + ' ' + indDef.name) : '🏙️ Mixed';

        this.evaltExtended.innerHTML = '<span style="' + titleStyle + '">CITY WELL-BEING</span><br>'
            //+ '<span style="' + lblStyle + '">Season:</span><span style="color:#4a9edd;">' + season + '</span><br>'
            + '<span style="' + lblStyle + '">👨‍🎓 Education:</span>' + eduStr + '<br>'
            + '<span style="' + lblStyle + '">❤️ Health:</span>' + healthStr + '<br>'
            + '<span style="' + lblStyle + '">😵 Unemployment:</span>' + unemployment + '%<br>'
            + '<span style="' + lblStyle + '">😊 Happiness:</span><span style="color:' + happyColor + '; font-weight:bold;">' + this.happiness + '%</span><br>'
            
            + '<span style="' + titleStyle + '">COVERAGE &amp; AMENITIES</span><br>'
            //+ '<br><b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6); text-align:center;">COVERAGE &amp; AMENITIES</b><br>'
            + '<span style="' + lblStyle + '">🚓 Police:</span><span style="color:' + policeColor + ';">' + policeCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">🚒 Fire:</span><span style="color:' + fireColor + ';">' + fireCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">💧 Water:</span><span style="color:' + waterColor + ';">' + waterCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">💊 Hospitals:</span><span style="color:' + (hospitalCount > 0 ? '#4bcc7a' : 'rgba(180,210,240,0.5)') + ';">' + hospitalCount + '</span><br>'
            + '<span style="' + lblStyle + '">🏫 Schools:</span><span style="color:' + (schoolCount > 0 ? '#4bcc7a' : 'rgba(180,210,240,0.5)') + ';">' + schoolCount + '</span><br>'
            + '<span style="' + lblStyle + '">📚 Edu. Fund:</span><span style="color:' + eduCovColor + ';">' + eduCoverage + '%</span><br>'
            + '<span style="' + lblStyle + '">🌳 Parks:</span><span style="color:' + parkColor + ';">' + parkCount + '</span><br>'
            //+ '<br><b style="font-size:10px; letter-spacing:0.08em; color:rgba(180,210,240,0.6);">ECONOMY FOCUS</b><br>'
            + '<span style="' + titleStyle + '">ECONOMY FOCUS</span><br>'
            + '<span style="color:#f0b84a;">' + indStr + '</span>';

	}

	init() {

		var body = document.createElement('div');
        body.style.cssText = 'padding:10px 12px; pointer-events:none; display:flex; flex-direction:column; align-items: center;';
        this.pannel.appendChild( body );

        this.evaltOpinion = document.createElement('div');
        this.evaltOpinion.style.cssText = 'pointer-events:none; color:' + '#dce8f5' + '; font-size:12px; font-weight:600; margin-bottom:6px;';
        body.appendChild( this.evaltOpinion );

        this.evaltYes = document.createElement('span');
        this.evaltYes.style.cssText = 'color:#4bcc7a; font-size:16px; font-weight:bold; margin-right:20px;';

        this.evaltNo = document.createElement('span');
        this.evaltNo.style.cssText = 'color:#e05555; font-size:16px; font-weight:bold;';

        var voteRow = document.createElement('div');
        voteRow.style.cssText = 'margin-bottom:6px;';
        voteRow.appendChild(this.evaltYes);
        voteRow.appendChild(this.evaltNo);
        body.appendChild(voteRow);

        this.evaltProb = document.createElement('div');
        this.evaltProb.style.cssText = 'pointer-events:none; color:' + '#dce8f5' + '; font-size:13px; line-height:1.5; width:90%; text-align:center; ';
        body.appendChild( this.evaltProb );

        this.evaltStats = document.createElement('div');
        this.evaltStats.style.cssText = 'pointer-events:none; color:' + '#dce8f5' + '; font-size:13px; line-height:1.5; width:90%; text-align:left; ';
        body.appendChild( this.evaltStats );

        this.evaltExtended = document.createElement('div');
        this.evaltExtended.style.cssText = 'pointer-events:none; color:' + '#dce8f5' + '; font-size:13px; line-height:1.5; width:90%; text-align:left; ';
        body.appendChild( this.evaltExtended );

        this.evaltOpinion.innerHTML = '<b>Public Opinion</b><br><span style="font-size:11px; color:rgba(180,210,240,0.6);">Is the mayor doing a good job?</span>';

	}

}