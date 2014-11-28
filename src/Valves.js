/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 
Micro.Valves = function () {
    this.changed = false;
    this.resValve = 0;
    this.comValve = 0;
    this.indValve = 0;
    this.resCap = false;
    this.comCap = false;
    this.indCap = false;
}

Micro.Valves.prototype = {
    constructor: Micro.Valves,
    save : function(saveData) {
        saveData.resValve = this.resValve;
        saveData.comValve = this.comValve;
        saveData.indValve = this.indValve;
    },
    load : function(saveData, messageManager) {
        this.resValve = saveData.resValve;
        this.comValve = saveData.comValve;
        this.indValve = saveData.indValve;
        this.changed = true;
        if (messageManager !== undefined) messageManager.sendMessage(Messages.VALVES_UPDATED);
    },
    setValves : function(gameLevel, census, budget) {
        var resPopDenom = 8;
        var birthRate = 0.02;
        var labourBaseMax = 1.3;
        var internalMarketDenom = 3.7;
        var projectedIndPopMin = 5.0;
        var resRatioDefault = 1.3;
        var resRatioMax = 2;
        var comRatioMax = 2;
        var indRatioMax = 2;
        var taxMax = 20;
        var taxTableScale = 600;
        var employment, labourBase;

        var normalizedResPop = census.resPop / resPopDenom;
        census.totalPop = Math.round(normalizedResPop + census.comPop + census.indPop);

        if (census.resPop > 0) employment = (census.comHist10[1] + census.indHist10[1]) / normalizedResPop;
        else employment = 1;

        var migration = normalizedResPop * (employment - 1);
        var births = normalizedResPop * birthRate;
        var projectedResPop = normalizedResPop + migration + births;

        // Compute labourBase
        var temp = census.comHist10[1] + census.indHist10[1];
        if (temp > 0.0) labourBase = (census.resHist10[1] / temp);
        else labourBase = 1;

        labourBase = Micro.clamp(labourBase, 0.0, labourBaseMax);
        var internalMarket = (normalizedResPop + census.comPop + census.indPop) / internalMarketDenom;
        var projectedComPop = internalMarket * labourBase;
        var projectedIndPop = census.indPop * labourBase * Micro.extMarketParamTable[gameLevel];
        projectedIndPop = Math.max(projectedIndPop, projectedIndPopMin);

        var resRatio;
        if (normalizedResPop > 0) resRatio = projectedResPop / normalizedResPop;
        else resRatio = resRatioDefault;

        var comRatio;
        if (census.comPop > 0) comRatio = projectedComPop / census.comPop;
        else comRatio = projectedComPop;

        var indRatio;
        if (census.indPop > 0) indRatio = projectedIndPop / census.indPop;
        else indRatio = projectedIndPop;

        resRatio = Math.min(resRatio, resRatioMax);
        comRatio = Math.min(comRatio, comRatioMax);
        indRatio = Math.min(indRatio, indRatioMax);

        // Global tax and game level effects.
        var z = Math.min((budget.cityTax + gameLevel), taxMax);
        resRatio = (resRatio - 1) * taxTableScale + Micro.taxTable[z];
        comRatio = (comRatio - 1) * taxTableScale + Micro.taxTable[z];
        indRatio = (indRatio - 1) * taxTableScale + Micro.taxTable[z];

        // Ratios are velocity changes to valves.
        this.resValve = Micro.clamp(this.resValve + Math.round(resRatio), -Micro.RES_VALVE_RANGE, Micro.RES_VALVE_RANGE);
        this.comValve = Micro.clamp(this.comValve + Math.round(comRatio), -Micro.COM_VALVE_RANGE, Micro.COM_VALVE_RANGE);
        this.indValve = Micro.clamp(this.indValve + Math.round(indRatio), -Micro.IND_VALVE_RANGE, Micro.IND_VALVE_RANGE);

        if (this.resCap && this.resValve > 0) this.resValve = 0;
        if (this.comCap && this.comValve > 0) this.comValve = 0;
        if (this.indCap && this.indValve > 0) this.indValve = 0;

        this.changed = true;
    }
}
