Micro.Census = function(){
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
        this[arrName] = [];
        for (var a = 0; a < 120; a++) this[arrName][a] = 0;
    }

    for (var i = 0; i < Micro.arrs.length; i++) {
        var name10 = Micro.arrs[i] + 'Hist10';
        var name120 = Micro.arrs[i] + 'Hist120';
        createArray.call(this, name10);
        createArray.call(this, name120);
    }
}

Micro.Census.prototype = {
    constructor: Micro.Census,
    clearCensus : function() {
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
    },
    take10Census : function(budget) {
        var resPopDenom = 8;
        Micro.rotate10Arrays.call(this);

        this.resHist10[0] = Math.floor(this.resPop / resPopDenom);
        this.comHist10[0] = this.comPop;
        this.indHist10[0] = this.indPop;

        this.crimeRamp += Math.floor((this.crimeAverage - this.crimeRamp) / 4);
        this.crimeHist10[0] = Math.min(this.crimeRamp, 255);

        this.pollutionRamp += Math.floor((this.pollutionAverage - this.pollutionRamp) / 4);
        this.pollutionHist10[0] = Math.min(this.pollutionRamp, 255);

        var x = Math.floor(budget.cashFlow / 20) + 128;
        this.moneyHist10[0] = Micro.clamp(x, 0, 255);

        var resPopScaled = this.resPop >> 8;

        if (this.hospitalPop < this.resPopScaled)
          this.needHospital = 1;
        else if (this.hospitalPop > this.resPopScaled)
          this.needHospital = -1;
        else if (this.hospitalPop === this.resPopScaled)
          this.needHospital = 0;

        this.changed = true;
    },
    take120Census : function() {
        Micro.rotate120Arrays.call(this);
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
