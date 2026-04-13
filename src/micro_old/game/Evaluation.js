/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { EventEmitter, Micro } from '../Micro.js';
import { Messages } from '../Messages.js';

import { math } from '../math/math.js';

export class EvaluationUtils {

    static getTrafficAverage ( blockMaps, census ) {

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
        //census.trafficAverage = trafficAverage //??
        return trafficAverage;

    }


    static getUnemployment ( census ) {

        var b = (census.comPop + census.indPop) * 8;
        if (b === 0) return 0;
        // Ratio total people / working. At least 1.
        var r = census.resPop / b;
        b = Math.round((r - 1) * 255);
        return Math.min(b, 255);

    }


    static getFireSeverity ( census ) {

        return Math.min(census.firePop * 5, 255);

    }

}


export class Evaluation {

    constructor ( gameLevel ) {

        this.problemVotes = [];
        this.problemOrder = [];
        this.evalInit();
        this.gameLevel = '' + gameLevel;
        this.changed = false;

    }

    save (saveData) {
        for (var i = 0, l = Micro.EvalProps.length; i < l; i++)
            saveData[Micro.EvalProps[i]] = this[Micro.EvalProps[i]];
    }

    load (saveData) {
        for (var i = 0, l = Micro.EvalProps.length; i < l; i++)
            this[Micro.EvalProps[i]] = saveData[Micro.EvalProps[i]];
    }

    cityEvaluation ( simData ) {

        if(!simData) simData = Micro.simData

        var census = simData.census;

        if ( census.totalPop > 0 ) {

            Micro.problemData = []
            //var problemTable = [];
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) Micro.problemData.push(0)
            this.getAssessedValue( census )
            this.getPopulation( census )
            this.doProblems( simData.census, simData.budget, simData.blockMaps );
            this.getScore( simData )
            this.doVotes()
            this.changeEval()
        } else {
            this.evalInit();
            this.cityYes = 50;
            this.changeEval();
        }
    }
   
    evalInit () {

        let i;
        this.cityYes = 0;
        this.cityPop = 0;
        this.cityPopDelta = 0;
        this.cityAssessedValue = 0;
        this.cityClass = Micro.CC_VILLAGE;
        this.cityClassLast = Micro.CC_VILLAGE;
        this.cityScore = 500;
        this.cityScoreDelta = 0;
        for (i = 0; i < Micro.NUMPROBLEMS; i++) this.problemVotes[i] = { index: i, voteCount: 0 };
        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) this.problemOrder[i] = Micro.NUMPROBLEMS;
        
    }

    getAssessedValue( census ) {

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

    }

    getPopulation ( census ) {

        let oldPopulation = this.cityPop;
        this.cityPop = (census.resPop + (census.comPop + census.indPop) * 8) * 20;
        this.cityPopDelta = this.cityPop - oldPopulation;
        if (this.cityPopDelta !== 0) EventEmitter.emitEvent(Messages.POPULATION_UPDATED, this.cityPop);
        return this.cityPop;

    }

    getCityClass ( cityPopulation ) {

        this.cityClass = Micro.CC_VILLAGE;
        if (cityPopulation > 2000) this.cityClass = Micro.CC_TOWN;
        if (cityPopulation > 10000) this.cityClass = Micro.CC_CITY;
        if (cityPopulation > 50000) this.cityClass = Micro.CC_CAPITAL;
        if (cityPopulation > 100000) this.cityClass = Micro.CC_METROPOLIS;
        if (cityPopulation > 500000) this.cityClass = Micro.CC_MEGALOPOLIS;
        
        if ( this.cityClass !== this.cityClassLast ) {
            this.cityClassLast = this.cityClass;
            EventEmitter.emitEvent( Messages.CLASSIFICATION_UPDATED, this.cityClass );
        }

        return this.cityClass;

    }

    voteProblems () {

        for (var i = 0; i < Micro.NUMPROBLEMS; i++) {
            this.problemVotes[i].index = i;
            this.problemVotes[i].voteCount = 0;
        }

        var problem = 0;
        var voteCount = 0;
        var loopCount = 0;

        while (voteCount < 100 && loopCount < 600) {
            var voterProblemTolerance = math.getRandom(300);
            if ( Micro.problemData[problem] > voterProblemTolerance ) {
                this.problemVotes[problem].voteCount += 1;
                voteCount++;
            }

            problem = (problem + 1) % Micro.NUMPROBLEMS;
            loopCount++;
        }
    }

    doProblems ( census, budget, blockMaps ) {
        //var problemTaken = [];

        /*for (var i = 0; i < Micro.NUMPROBLEMS; i++) {
            problemTaken[i] = false;
            problemTable[i] = 0;
        }*/

        Micro.problemData[Micro.CRIME]        = census.crimeAverage;
        Micro.problemData[Micro.POLLUTION]    = census.pollutionAverage;
        Micro.problemData[Micro.HOUSING]      = census.landValueAverage * 7 / 10;
        Micro.problemData[Micro.TAXES]        = budget.cityTax * 10;
        Micro.problemData[Micro.TRAFFIC]      = EvaluationUtils.getTrafficAverage( blockMaps, census );
        Micro.problemData[Micro.UNEMPLOYMENT] = EvaluationUtils.getUnemployment( census );
        Micro.problemData[Micro.FIRE]         = EvaluationUtils.getFireSeverity( census );

        this.voteProblems();

        // Rank the problems
        this.problemVotes.sort(function(a, b) {
            return b.voteCount - a.voteCount;
        });

        this.problemOrder = this.problemVotes.map(function(pv, i) {
            if (i >= Micro.NUM_COMPLAINTS || pv.voteCount === 0) return null;
            return pv.index;
        });

        /*for (i = 0; i < Micro.NUM_COMPLAINTS; i++) {
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
        }*/
    }

    getScore ( simData ) {

        var census = simData.census;
        var budget = simData.budget;
        var valves = simData.valves;

        var cityScoreLast;

        cityScoreLast = this.cityScore;
        var score = 0;

        for ( var i = 0; i < Micro.NUMPROBLEMS; i++ ) score += Micro.problemData[i];

        score = Math.floor(score / 3);
        score = (250 - Math.min(score, 250)) * 4;
        //score = Math.min(score, 256);
        //score = math.clamp((256 - score) * 4, 0, 1000);

        // Penalise the player by 15% if demand for any type of zone is capped due
        // to lack of suitable buildings
        let demandPenalty = 0.85;

        if (valves.resCap) score = Math.round(score * demandPenalty);

        if (valves.comCap) score = Math.round(score * demandPenalty);

        if (valves.indCap) score = Math.round(score * demandPenalty);

        // Penalize if roads/rail underfunded

        if (budget.roadEffect < budget.MAX_ROAD_EFFECT) score -= budget.MAX_ROAD_EFFECT - budget.roadEffect;

        // Penalize player by up to 10% for underfunded police and fire services

        if (budget.policeEffect < budget.MAX_POLICE_STATION_EFFECT) {
            score = Math.round(score * (0.9 + (budget.policeEffect / (10 * budget.MAX_POLICE_STATION_EFFECT))));
        }

        if (budget.fireEffect < budget.MAX_FIRE_STATION_EFFECT) {
            score = Math.round(score * (0.9 + (budget.fireEffect / (10 * budget.MAX_FIRE_STATION_EFFECT))));
        }

        // Penalise the player by 15% if demand for any type of zone has collapsed due to overprovision

        if (valves.resValve < -1000) score = Math.round(score * 0.85);
        if (valves.comValve < -1000) score = Math.round(score * 0.85);
        if (valves.indValve < -1000) score = Math.round(score * 0.85);

        var scale = 1.0;
        if ( this.cityPop === 0 || this.cityPopDelta === 0 || this.cityPopDelta === this.cityPop ) {
            // Leave score unchanged if city is empty, if there hasn't been any migration, if the
            // initial settlers have just arrived, or if the city has doubled in size
            scale = 1.0;
        } else if (this.cityPopDelta > 0) {
            // If the city is growing, scale score by percentage growth in population
            scale = (this.cityPopDelta / this.cityPop) + 1.0;
        } else if (this.cityPopDelta < 0) {
            // If the city is shrinking, scale down by up to 5% based on level of outward migration
            scale = 0.95 + Math.floor(this.cityPopDelta / (this.cityPop - this.cityPopDelta));
        }

        score = Math.round( score * scale );

        // Penalize player for having fires and a burdensome tax rate
        score = score - EvaluationUtils.getFireSeverity(census) - budget.cityTax; // dec score for fires and tax

        // Penalize player based on ratio of unpowered zones to total zones
        scale = census.unpoweredZoneCount + census.poweredZoneCount;   // dec score for unpowered zones
        if (scale > 0.0) score = Math.round(score * (census.poweredZoneCount / scale));

        // Force in to range 0-1000. New score is average of last score and new computed value
        score = math.clamp(score, 0, 1000);
        this.cityScore = Math.round((this.cityScore + score) / 2);

        this.cityScoreDelta = this.cityScore - cityScoreLast;

        if (this.cityScoreDelta !== 0) EventEmitter.emitEvent(Messages.SCORE_UPDATED, this.cityScore)

    }

    doVotes () {
        this.cityYes = 0;

        for (let i = 0; i < 100; i++) {
            let voterExpectation = math.getRandom(1000);
            if (this.cityScore > voterExpectation) this.cityYes++;
        }
    }

    changeEval () {
        this.changed = true;
    }

    countProblems () {
        var i;
        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) {
            if (this.problemOrder[i] === Micro.NUMPROBLEMS) break;
        }
        return i;
    }

    getProblemNumber (i) {
        if (i < 0 || i >= Micro.NUM_COMPLAINTS || this.problemOrder[i] === Micro.NUMPROBLEMS) return -1;
        else return this.problemOrder[i];
    }

    getProblemVotes (i) {
        if (i < 0 || i >= Micro.NUM_COMPLAINTS || this.problemOrder[i] == Micro.NUMPROBLEMS) return -1;
        else return this.problemVotes[this.problemOrder[i]].voteCount;
    }

}
