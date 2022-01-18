/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.PROBLEMS = ['CVP_CRIME', 'CVP_POLLUTION', 'CVP_HOUSING', 'CVP_TAXES', 'CVP_TRAFFIC', 'CVP_UNEMPLOYMENT', 'CVP_FIRE'];
Micro.NUMPROBLEMS = Micro.PROBLEMS.length;
Micro.NUM_COMPLAINTS = 4;
Micro.EvalProps = ['cityClass', 'cityScore'];

Micro.getTrafficAverage = function( blockMaps ) {
    var trafficDensityMap = blockMaps.trafficDensityMap;
    var landValueMap = blockMaps.landValueMap;
    var trafficTotal = 0;
    var count = 1;

    for (var x = 0; x < landValueMap.gameMapWidth; x += landValueMap.blockSize) {
        for (var y = 0; y < landValueMap.gameMapHeight; y += landValueMap.blockSize) {
            if (landValueMap.worldGet(x, y) > 0) {
                trafficTotal += trafficDensityMap.worldGet(x, y);
                count++;
            }
        }
    }
    var trafficAverage = Math.floor(trafficTotal / count) * 2.4;
    return trafficAverage;
};


Micro.getUnemployment = function(census) {
    var b = (census.comPop + census.indPop) * 8;
    if (b === 0) return 0;
    // Ratio total people / working. At least 1.
    var r = census.resPop / b;
    b = Math.round((r - 1) * 255);
    return Math.min(b, 255);
};


Micro.getFireSeverity = function(census) {
    return Math.min(census.firePop * 5, 255);
};


Micro.Evaluation = function (gameLevel, SIM) {
    this.sim = SIM;
    this.problemVotes = [];
    this.problemOrder = [];
    this.evalInit();
    this.gameLevel = '' + gameLevel;
    this.changed = false;
}

Micro.Evaluation.prototype = {
    constructor: Micro.Evaluation,
    save : function(saveData) {
        for (var i = 0, l = Micro.EvalProps.length; i < l; i++)
            saveData[Micro.EvalProps[i]] = this[Micro.EvalProps[i]];
    },
    load : function(saveData) {
        for (var i = 0, l = Micro.EvalProps.length; i < l; i++)
            this[Micro.EvalProps[i]] = saveData[Micro.EvalProps[i]];
    },
    cityEvaluation : function() {
        var census = this.sim.census;

        if (census.totalPop > 0) {
            var problemTable = [];
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) problemTable.push(0);
            this.getAssessedValue(census);
            this.doPopNum(census);
            this.doProblems(this.sim.census, this.sim.budget, this.sim.blockMaps, problemTable);
            this.getScore(problemTable);
            this.doVotes();
            this.changeEval();
        } else {
            this.evalInit();
            this.cityYes = 50;
            this.changeEval();
        }
    },
    /*cityEvaluation : function(simData) {
        var census = simData.census;

        if (census.totalPop > 0) {
            var problemTable = [];
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) problemTable.push(0);
            this.getAssessedValue(census);
            this.doPopNum(census);
            this.doProblems(simData.census, simData.budget, simData.blockMaps, problemTable);
            this.getScore(simData, problemTable);
            this.doVotes();
            this.changeEval();
        } else {
            this.evalInit();
            this.cityYes = 50;
            this.changeEval();
        }
    },*/
    evalInit : function() {
        this.cityYes = 0;
        this.cityPop = 0;
        this.cityPopDelta = 0;
        this.cityAssessedValue = 0;
        this.cityClass = Micro.CC_VILLAGE;
        this.cityScore = 500;
        this.cityScoreDelta = 0;
        for (var i = 0; i < Micro.NUMPROBLEMS; i++) this.problemVotes[i] = 0;
        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) this.problemOrder[i] = Micro.NUMPROBLEMS;
    },
    getAssessedValue: function( census ) {
        var value;

        value = census.roadTotal * 5;
        value += census.railTotal * 10;
        value += census.policeStationPop * 1000;
        value += census.fireStationPop * 1000;
        value += census.hospitalPop * 400;
        value += census.stadiumPop * 3000;
        value += census.seaportPop * 5000;
        value += census.airportPop * 10000;
        value += census.coalPowerPop * 3000;
        value += census.nuclearPowerPop * 6000;

        this.cityAssessedValue = value * 1000;
    },
    getPopulation : function( census ) {
        var population = (census.resPop + (census.comPop + census.indPop) * 8) * 20;
        return population;
    },
    doPopNum : function(census) {
        var oldCityPop = this.cityPop;

        this.cityPop = this.getPopulation(census);

        if (oldCityPop == -1)
            oldCityPop = this.cityPop;

        this.cityPopDelta = this.cityPop - oldCityPop;
        this.cityClass = this.getCityClass(this.cityPop);
    },
    getCityClass : function(cityPopulation) {
        this.cityClassification = Micro.CC_VILLAGE;
        if (cityPopulation > 2000) this.cityClassification = Micro.CC_TOWN;
        if (this.cityPopulation > 10000) this.cityClassification = Micro.CC_CITY;
        if (this.cityPopulation > 50000) this.cityClassification = Micro.CC_CAPITAL;
        if (this.cityPopulation > 100000) this.cityClassification = Micro.CC_METROPOLIS;
        if (this.cityPopulation > 500000) this.cityClassification = Micro.CC_MEGALOPOLIS;
        return this.cityClassification;
    },
    voteProblems : function(problemTable) {
    for (var i = 0; i < Micro.NUMPROBLEMS; i++) this.problemVotes[i] = 0;
        var problem = 0;
        var voteCount = 0;
        var loopCount = 0;

        while (voteCount < 100 && loopCount < 600) {
            if (Random.getRandom(300) < problemTable[problem]) {
                this.problemVotes[problem]++;
                voteCount++;
            }
            problem++;
            if (problem > Micro.NUMPROBLEMS) {
                problem = 0;
            }
            loopCount++;
        }
    },
    doProblems : function(census, budget, blockMaps, problemTable) {
        var problemTaken = [];

        for (var i = 0; i < Micro.NUMPROBLEMS; i++) {
            problemTaken[i] = false;
            problemTable[i] = 0;
        }

        problemTable[Micro.CRIME]        = census.crimeAverage;
        problemTable[Micro.POLLUTION]    = census.pollutionAverage;
        problemTable[Micro.HOUSING]      = census.landValueAverage * 7 / 10;
        problemTable[Micro.TAXES]        = budget.cityTax * 10;
        problemTable[Micro.TRAFFIC]      = Micro.getTrafficAverage(blockMaps);
        problemTable[Micro.UNEMPLOYMENT] = Micro.getUnemployment(census);
        problemTable[Micro.FIRE]         = Micro.getFireSeverity(census);

        this.voteProblems(problemTable);

        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) {
            // Find biggest problem not taken yet
            var maxVotes = 0;
            var bestProblem = Micro.NUMPROBLEMS;
            for (var j = 0; j < Micro.NUMPROBLEMS; j++) {
                if ((this.problemVotes[j] > maxVotes) && (!problemTaken[j])) {
                   bestProblem = j;
                   maxVotes = this.problemVotes[j];
                }
            }
            // bestProblem == NUMPROBLEMS means no problem found
            this.problemOrder[i] = bestProblem;
            if (bestProblem < Micro.NUMPROBLEMS) {
                problemTaken[bestProblem] = true;
            }
        }
    },
    //getScore : function(simData, problemTable) {
    getScore : function(problemTable) {
        var census = this.sim.census;
        var budget = this.sim.budget;
        var valves = this.sim.valves;

        var cityScoreLast;

        cityScoreLast = this.cityScore;
        var score = 0;

        for (var i = 0; i < Micro.NUMPROBLEMS; i++) score += problemTable[i];

        score = Math.floor(score / 3);
        score = Math.min(score, 256);
        score = Micro.clamp((256 - score) * 4, 0, 1000);

        if (valves.resCap) score = Math.round(score * 0.85);

        if (valves.comCap) score = Math.round(score * 0.85);

        if (valves.indCap) score = Math.round(score * 0.85);

        if (budget.roadEffect < budget.MAX_ROAD_EFFECT) score -= budget.MAX_ROAD_EFFECT - budget.roadEffect;

        if (budget.policeEffect < budget.MAX_POLICE_STATION_EFFECT) {
            score = Math.round(score * (0.9 + (budget.policeEffect / (10.0001 * budget.MAX_POLICE_STATION_EFFECT))));
        }

        if (budget.fireEffect < budget.MAX_FIRE_STATION_EFFECT) {
            score = Math.round(score * (0.9 + (budget.fireEffect / (10.0001 * budget.MAX_FIRE_STATION_EFFECT))));
        }

        if (valves.resValve < -1000) score = Math.round(score * 0.85);
        if (valves.comValve < -1000) score = Math.round(score * 0.85);
        if (valves.indValve < -1000)  score = Math.round(score * 0.85);


        var scale = 1.0;
        if (this.cityPop === 0 || this.cityPopDelta === 0) {
            scale = 1.0; // there is nobody or no migration happened
        } else if (this.cityPopDelta == this.cityPop) {
            scale = 1.0; // city sprang into existence or doubled in size
        } else if (this.cityPopDelta > 0) {
            scale = (this.cityPopDelta / this.cityPop) + 1.0;
        } else if (this.cityPopDelta < 0) {
            scale = 0.95 + Math.floor(this.cityPopDelta / (this.cityPop - this.cityPopDelta));
        }

        score = Math.round(score * scale);
        score = score - Micro.getFireSeverity(census) - budget.cityTax; // dec score for fires and tax

        scale = census.unpoweredZoneCount + census.poweredZoneCount;   // dec score for unpowered zones
        if (scale > 0.0) score = Math.round(score * (census.poweredZoneCount / scale));

        score = Micro.clamp(score, 0, 1000);

        this.cityScore = Math.round((this.cityScore + score) / 2);

        this.cityScoreDelta = this.cityScore - cityScoreLast;
    },
    doVotes : function() {
        var i;
        this.cityYes = 0;
        for (i = 0; i < 100; i++) {
            if (Random.getRandom(1000) < this.cityScore) this.cityYes++;
        }
    },
    changeEval : function() {
        this.changed = true;
    },
    countProblems : function() {
        var i;
        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) {
            if (this.problemOrder[i] === Micro.NUMPROBLEMS) break;
        }
        return i;
    },
    getProblemNumber : function(i) {
        if (i < 0 || i >= Micro.NUM_COMPLAINTS || this.problemOrder[i] === Micro.NUMPROBLEMS) return -1;
        else return this.problemOrder[i];
    },
    getProblemVotes : function(i) {
        if (i < 0 || i >= Micro.NUM_COMPLAINTS || this.problemOrder[i] == Micro.NUMPROBLEMS) return -1;
        else return this.problemVotes[this.problemOrder[i]];
    }
}
