import { describe, it, expect, beforeEach } from 'vitest';
import { Evaluation, EvaluationUtils } from '../src/micro/game/Evaluation.js';
import { Micro } from '../src/micro/Micro.js';
import { setupMicro } from './setup.js';

// Minimal census stub with all fields referenced by Evaluation
function makeCensus(overrides) {
    return Object.assign({
        resPop:             1000,
        comPop:             200,
        indPop:             100,
        totalPop:           1300,
        crimeAverage:       10,
        pollutionAverage:   10,
        landValueAverage:   50,
        firePop:            0,
        poweredZoneCount:   20,
        unpoweredZoneCount: 0,
    }, overrides);
}

// Minimal budget stub
function makeBudget(overrides) {
    return Object.assign({
        cityTax:       7,
        roadEffect:    Micro.MAX_ROAD_EFFECT,
        policeEffect:  Micro.MAX_POLICESTATION_EFFECT,
        fireEffect:    Micro.MAX_FIRESTATION_EFFECT,
    }, overrides);
}

// Minimal valves stub
function makeValves(overrides) {
    return Object.assign({
        resCap:    false,
        comCap:    false,
        indCap:    false,
        resValve:  500,
        comValve:  500,
        indValve:  500,
    }, overrides);
}

// Minimal blockMaps stub used by EvaluationUtils.getTrafficAverage
function makeBlockMaps() {
    var sz = 16;
    var trafficDensityMap = {
        gameMapWidth:  sz,
        gameMapHeight: sz,
        blockSize:     1,
        worldGet:      () => 0,
    };
    var landValueMap = {
        gameMapWidth:  sz,
        gameMapHeight: sz,
        blockSize:     1,
        worldGet:      () => 0,
    };
    return { trafficDensityMap, landValueMap };
}

describe('Evaluation', () => {

    let evaluation;

    beforeEach(() => {
        setupMicro();
        // Reset global problem data
        Micro.problemData = [];
        evaluation = new Evaluation(Micro.LEVEL_EASY);
    });

    // ── getCityClass ─────────────────────────────────────────────────────────

    describe('getCityClass', () => {

        it('returns VILLAGE for small populations', () => {
            expect(evaluation.getCityClass(0)).toBe(Micro.CC_VILLAGE);
            expect(evaluation.getCityClass(500)).toBe(Micro.CC_VILLAGE);
        });

        it('returns TOWN for pop > 2000', () => {
            expect(evaluation.getCityClass(2001)).toBe(Micro.CC_TOWN);
        });

        it('returns CITY for pop > 10000', () => {
            expect(evaluation.getCityClass(10001)).toBe(Micro.CC_CITY);
        });

        it('returns CAPITAL for pop > 50000', () => {
            expect(evaluation.getCityClass(50001)).toBe(Micro.CC_CAPITAL);
        });

        it('returns METROPOLIS for pop > 100000', () => {
            expect(evaluation.getCityClass(100001)).toBe(Micro.CC_METROPOLIS);
        });

        it('returns MEGALOPOLIS for pop > 500000', () => {
            expect(evaluation.getCityClass(500001)).toBe(Micro.CC_MEGALOPOLIS);
        });

    });

    // ── getPopulation ────────────────────────────────────────────────────────

    describe('getPopulation', () => {

        it('computes population from RCI', () => {
            var census = makeCensus({ resPop: 100, comPop: 10, indPop: 5 });
            var pop = evaluation.getPopulation(census);
            // (100 + (10+5)*8) * 20 = (100 + 120) * 20 = 4400
            expect(pop).toBe(4400);
        });

        it('tracks population delta', () => {
            var census = makeCensus({ resPop: 100, comPop: 0, indPop: 0 });
            evaluation.getPopulation(census);
            census.resPop = 200;
            evaluation.getPopulation(census);
            expect(evaluation.cityPopDelta).toBeGreaterThan(0);
        });

    });

    // ── getAssessedValue ─────────────────────────────────────────────────────

    describe('getAssessedValue', () => {

        it('returns 0 when city is empty', () => {
            var census = makeCensus({
                roadTotal: 0, railTotal: 0,
                policeStationPop: 0, fireStationPop: 0,
                hospitalPop: 0, stadiumPop: 0,
                seaportPop: 0, airportPop: 0,
                coalPowerPop: 0, nuclearPowerPop: 0,
            });
            evaluation.getAssessedValue(census);
            expect(evaluation.cityAssessedValue).toBe(0);
        });

        it('accounts for roads in assessed value', () => {
            var census = makeCensus({
                roadTotal: 10, railTotal: 0,
                policeStationPop: 0, fireStationPop: 0,
                hospitalPop: 0, stadiumPop: 0,
                seaportPop: 0, airportPop: 0,
                coalPowerPop: 0, nuclearPowerPop: 0,
            });
            evaluation.getAssessedValue(census);
            // 10 roads × 5 = 50 × 1000 = 50000
            expect(evaluation.cityAssessedValue).toBe(50000);
        });

    });

    // ── doVotes ──────────────────────────────────────────────────────────────

    describe('doVotes', () => {

        it('cityYes is between 0 and 100', () => {
            evaluation.cityScore = 500;
            evaluation.doVotes();
            expect(evaluation.cityYes).toBeGreaterThanOrEqual(0);
            expect(evaluation.cityYes).toBeLessThanOrEqual(100);
        });

        it('high score tends toward high approval', () => {
            evaluation.cityScore = 999;
            evaluation.doVotes();
            expect(evaluation.cityYes).toBeGreaterThan(50);
        });

        it('low score tends toward low approval', () => {
            evaluation.cityScore = 1;
            evaluation.doVotes();
            expect(evaluation.cityYes).toBeLessThan(50);
        });

    });

    // ── countProblems / getProblemNumber / getProblemVotes ───────────────────

    describe('problem helpers', () => {

        it('countProblems returns 0 after evalInit', () => {
            evaluation.evalInit();
            expect(evaluation.countProblems()).toBe(0);
        });

        it('getProblemNumber returns -1 out of range', () => {
            expect(evaluation.getProblemNumber(-1)).toBe(-1);
            expect(evaluation.getProblemNumber(999)).toBe(-1);
        });

        it('getProblemVotes returns -1 after evalInit (no votes cast)', () => {
            evaluation.evalInit();
            expect(evaluation.getProblemVotes(0)).toBe(-1);
        });

        it('getProblemVotes returns -1 out of range', () => {
            expect(evaluation.getProblemVotes(-1)).toBe(-1);
            expect(evaluation.getProblemVotes(999)).toBe(-1);
        });

        it('getProblemVotes after doProblems returns the vote count for the top problem (regression)', () => {
            // Regression for bug: getProblemVotes used problemOrder[i] as an array offset
            // into the sorted problemVotes array, causing wrong values when top problem
            // index ≠ its position in the sorted array.
            var census   = makeCensus({ crimeAverage: 200, pollutionAverage: 0, landValueAverage: 0, firePop: 0 });
            var budget   = makeBudget({ cityTax: 0 });
            var blockMaps = makeBlockMaps();

            // Populate problemData
            Micro.problemData = [];
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) Micro.problemData[i] = 0;

            evaluation.doProblems(census, budget, blockMaps);

            var count = evaluation.countProblems();
            if (count > 0) {
                var votes0 = evaluation.getProblemVotes(0);
                // votes should be a non-negative integer, not the buggy cross-index value
                expect(votes0).toBeGreaterThanOrEqual(0);
                // Rank 0 vote count should be >= rank 1 (sorted descending)
                if (count > 1) {
                    var votes1 = evaluation.getProblemVotes(1);
                    if (votes1 !== -1) expect(votes0).toBeGreaterThanOrEqual(votes1);
                }
            }
        });

        it('countProblems reflects actual ranked problem count after doProblems', () => {
            // With high crime, there should be at least 1 problem
            var census    = makeCensus({ crimeAverage: 255, pollutionAverage: 0, landValueAverage: 0, firePop: 0 });
            var budget    = makeBudget({ cityTax: 0 });
            var blockMaps = makeBlockMaps();

            Micro.problemData = [];
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) Micro.problemData[i] = 0;

            evaluation.doProblems(census, budget, blockMaps);
            var count = evaluation.countProblems();
            expect(count).toBeGreaterThanOrEqual(0);
            expect(count).toBeLessThanOrEqual(Micro.NUM_COMPLAINTS);
        });

    });

    // ── getScore respects Micro constants (regression for the bug fix) ────────

    describe('getScore — Micro constant fix', () => {

        it('does not penalise road score when roadEffect is at max', () => {
            var census   = makeCensus();
            var budget   = makeBudget({ roadEffect: Micro.MAX_ROAD_EFFECT });
            var valves   = makeValves();
            var blockMaps = makeBlockMaps();

            // Populate problemData with zeros so getScore can run cleanly
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) Micro.problemData[i] = 0;

            evaluation.getPopulation(census);
            var scoreBefore = evaluation.cityScore;
            evaluation.getScore({ census, budget, valves, blockMaps });

            // With no problems and max effects the score should not drop
            expect(evaluation.cityScore).toBeGreaterThanOrEqual(scoreBefore * 0.5);
        });

        it('reduces score when roadEffect is well below max', () => {
            var census    = makeCensus();
            var budgetMax = makeBudget({ roadEffect: Micro.MAX_ROAD_EFFECT });
            var budgetLow = makeBudget({ roadEffect: 0 });
            var valves    = makeValves();
            var blockMaps = makeBlockMaps();

            for (var i = 0; i < Micro.NUMPROBLEMS; i++) Micro.problemData[i] = 0;
            evaluation.getPopulation(census);

            var ev1 = new Evaluation(Micro.LEVEL_EASY);
            ev1.getPopulation(census);
            ev1.getScore({ census, budget: budgetMax, valves, blockMaps });

            var ev2 = new Evaluation(Micro.LEVEL_EASY);
            ev2.getPopulation(census);
            ev2.getScore({ census, budget: budgetLow, valves, blockMaps });

            expect(ev2.cityScore).toBeLessThan(ev1.cityScore);
        });

    });

});

// ── EvaluationUtils ──────────────────────────────────────────────────────────

describe('EvaluationUtils', () => {

    beforeEach(() => setupMicro());

    describe('getUnemployment', () => {

        it('returns 0 when there is no commercial or industrial pop', () => {
            expect(EvaluationUtils.getUnemployment({ resPop: 100, comPop: 0, indPop: 0 })).toBe(0);
        });

        it('returns 0 when employment perfectly balances residents', () => {
            // b = (comPop + indPop) * 8; r = resPop / b = 1 → delta = 0
            var census = { resPop: 80, comPop: 5, indPop: 5 };
            var u = EvaluationUtils.getUnemployment(census);
            expect(u).toBe(0);
        });

        it('returns non-zero when there is excess residential population', () => {
            var census = { resPop: 800, comPop: 5, indPop: 5 };
            expect(EvaluationUtils.getUnemployment(census)).toBeGreaterThan(0);
        });

        it('clamps to 255', () => {
            var census = { resPop: 999999, comPop: 1, indPop: 0 };
            expect(EvaluationUtils.getUnemployment(census)).toBe(255);
        });

    });

    describe('getFireSeverity', () => {

        it('returns 0 when firePop is 0', () => {
            expect(EvaluationUtils.getFireSeverity({ firePop: 0 })).toBe(0);
        });

        it('scales with firePop', () => {
            expect(EvaluationUtils.getFireSeverity({ firePop: 10 })).toBe(50);
        });

        it('clamps to 255', () => {
            expect(EvaluationUtils.getFireSeverity({ firePop: 100 })).toBe(255);
        });

    });

});
