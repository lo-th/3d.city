/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Micro, MiscUtils } from '../Micro.js';
import { math } from '../math/math.js';

export class Census {

    constructor () {

        this.clearCensus();
        this.changed = false;
        this.crimeRamp = 0;
        this.pollutionRamp = 0;

        // Set externally
        this.landValueAverage = 0;
        this.pollutionAverage = 0;
        this.crimeAverage = 0;
        this.totalPop = 0;

        var createArray = function(arrName) {
            //this[arrName] = new M_ARRAY_TYPE(120);
            this[arrName] = [];
            //for (var a = 0; a < 120; a++) this[arrName][a] = 0;
            var a = 120;
            while(a--) this[arrName][a] = 0;
        }

        //for (var i = 0; i < Micro.arrs.length; i++) {

        let i = Micro.arrs.length
        while(i--){
            var name10 = Micro.arrs[i] + 'Hist10';
            var name120 = Micro.arrs[i] + 'Hist120';
            createArray.call(this, name10);
            createArray.call(this, name120);
        }
    }

    save (saveData) {
        for (var i = 0, l = Micro.CensusProps.length; i < l; i++)
            saveData[Micro.CensusProps[i]] = this[Micro.CensusProps[i]];
    }

    load (saveData) {
        for (var i = 0, l = Micro.CensusProps.length; i < l; i++)
            this[Micro.CensusProps[i]] = saveData[Micro.CensusProps[i]];
    }

    clearCensus () {

        this.poweredZoneCount = 0;
        this.unpoweredZoneCount = 0;
        this.firePop = 0;
        this.roadTotal = 0;
        this.railTotal = 0;
        this.resPop = 0;
        this.comPop = 0;
        this.indPop = 0;
        this.resZonePop = 0;
        this.comZonePop = 0;
        this.indZonePop = 0;
        this.hospitalPop = 0;
        this.churchPop = 0;
        this.policeStationPop = 0;
        this.fireStationPop = 0;
        this.stadiumPop = 0;
        this.coalPowerPop = 0;
        this.nuclearPowerPop = 0;
        this.seaportPop = 0;
        this.airportPop = 0;

    }

    take10Census ( budget ) {

        var resPopDenom = 8;
        MiscUtils.rotate10Arrays.call(this);

        this.resHist10[0] = Math.floor(this.resPop / resPopDenom);
        this.comHist10[0] = this.comPop;
        this.indHist10[0] = this.indPop;

        this.crimeRamp += Math.floor((this.crimeAverage - this.crimeRamp) / 4);
        this.crimeHist10[0] = Math.min(this.crimeRamp, 255);

        this.pollutionRamp += Math.floor((this.pollutionAverage - this.pollutionRamp) / 4);
        this.pollutionHist10[0] = Math.min(this.pollutionRamp, 255);

        var x = Math.floor(budget.cashFlow / 20) + 128;
        this.moneyHist10[0] = math.clamp(x, 0, 255);

        var resPopScaled = this.resPop >> 8;

        if (this.hospitalPop < this.resPopScaled) this.needHospital = 1;
        else if (this.hospitalPop > this.resPopScaled) this.needHospital = -1;
        else if (this.hospitalPop === this.resPopScaled) this.needHospital = 0;

        this.changed = true;

    }

    take120Census () {

        MiscUtils.rotate120Arrays.call(this);
        var resPopDenom = 8;

        this.resHist120[0] = Math.floor(this.resPop / resPopDenom);
        this.comHist120[0] = this.comPop;
        this.indHist120[0] = this.indPop;
        this.crimeHist120[0] = this.crimeHist10[0];
        this.pollutionHist120[0] = this.pollutionHist10[0];
        this.moneyHist120[0] = this.moneyHist10[0];
        this.changed = true;
        
    }

}
