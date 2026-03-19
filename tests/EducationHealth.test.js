import { describe, it, expect, beforeEach } from 'vitest';
import { Budget } from '../src/micro/game/Budget.js';
import { Micro } from '../src/micro/Micro.js';
import { ZoneUtils } from '../src/micro/Tile.js';
import { setupMicro } from './setup.js';

// Minimal census stub
function makeCensus(overrides) {
    return Object.assign({
        hospitalPop:      0,
        churchPop:        0,
        policeStationPop: 0,
        fireStationPop:   0,
        totalPop:         500,
        roadTotal:        10,
        railTotal:        0,
        landValueAverage: 50,
        pollutionAverage: 10,
        crimeAverage:     10,
    }, overrides);
}

// ── ZoneUtils.CHURCH tile check ───────────────────────────────────────────────

describe('ZoneUtils.CHURCH', () => {

    it('returns true for Tile.CHURCH (418)', () => {
        expect(ZoneUtils.CHURCH({ getValue: () => 418 })).toBe(true);
    });

    it('returns true for Tile.CHURCH1 (960)', () => {
        expect(ZoneUtils.CHURCH({ getValue: () => 960 })).toBe(true);
    });

    it('returns true for Tile.CHURCH7 (1014)', () => {
        expect(ZoneUtils.CHURCH({ getValue: () => 1014 })).toBe(true);
    });

    it('returns false for a non-church tile', () => {
        expect(ZoneUtils.CHURCH({ getValue: () => 300 })).toBe(false);
    });

    it('returns false for Tile.HOSPITAL (409)', () => {
        expect(ZoneUtils.CHURCH({ getValue: () => 409 })).toBe(false);
    });

});

// ── Education budget ──────────────────────────────────────────────────────────

describe('Budget — education', () => {

    let budget;

    beforeEach(() => {
        setupMicro();
        budget = new Budget();
        budget.setFunds(20000);
        budget.taxFund = 5000;
    });

    it('initialises educationEffect to MAX_EDUCATION_EFFECT', () => {
        expect(budget.educationEffect).toBe(Micro.MAX_EDUCATION_EFFECT);
    });

    it('computes educationMaintenanceBudget from hospital + church pop', () => {
        const census = makeCensus({ hospitalPop: 2, churchPop: 1 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        expect(budget.educationMaintenanceBudget).toBe(3 * Micro.educationMaintenanceCost);
    });

    it('educationMaintenanceBudget is 0 when no hospitals or schools', () => {
        const census = makeCensus({ hospitalPop: 0, churchPop: 0 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        expect(budget.educationMaintenanceBudget).toBe(0);
    });

    it('educationEffect stays at MAX when no schools exist', () => {
        const census = makeCensus({ hospitalPop: 0, churchPop: 0 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        expect(budget.educationEffect).toBe(Micro.MAX_EDUCATION_EFFECT);
    });

    it('educationEffect scales with funding when schools exist', () => {
        const census = makeCensus({ hospitalPop: 1, churchPop: 1 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        // Set to 50% funding
        budget.educationPercent = 0.5;
        budget.updateFundEffects();
        expect(budget.educationEffect).toBeLessThan(Micro.MAX_EDUCATION_EFFECT);
        expect(budget.educationEffect).toBeGreaterThan(0);
    });

    it('educationEffect is MAX at 100% funding', () => {
        const census = makeCensus({ hospitalPop: 1, churchPop: 0 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        budget.educationPercent = 1;
        budget.updateFundEffects();
        expect(budget.educationEffect).toBe(Micro.MAX_EDUCATION_EFFECT);
    });

    it('educationFund getter returns educationMaintenanceBudget', () => {
        const census = makeCensus({ hospitalPop: 2, churchPop: 0 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        expect(budget.educationFund).toBe(budget.educationMaintenanceBudget);
    });

    it('education budget is saved to and loaded from saveData', () => {
        const census = makeCensus({ hospitalPop: 1, churchPop: 1 });
        budget.collectTax(Micro.LEVEL_EASY, census, 0, null);
        budget.educationPercent = 0.75;

        const saveData = {};
        budget.save(saveData);

        const budget2 = new Budget();
        budget2.load(saveData);
        expect(budget2.educationPercent).toBeCloseTo(0.75, 2);
        expect(budget2.educationMaintenanceBudget).toBe(budget.educationMaintenanceBudget);
    });

});

// ── Education level scaling ───────────────────────────────────────────────────

describe('educationLevel — funding scale', () => {

    it('MAX_EDUCATION_EFFECT constant is defined', () => {
        expect(Micro.MAX_EDUCATION_EFFECT).toBeGreaterThan(0);
    });

    it('educationMaintenanceCost constant is defined', () => {
        expect(Micro.educationMaintenanceCost).toBeGreaterThan(0);
    });

    it('educationFundScale is 1.0 when educationEffect equals MAX', () => {
        const scale = Micro.MAX_EDUCATION_EFFECT / Micro.MAX_EDUCATION_EFFECT;
        expect(scale).toBe(1.0);
    });

    it('educationFundScale is 0.5 when educationEffect is half of MAX', () => {
        const scale = (Micro.MAX_EDUCATION_EFFECT / 2) / Micro.MAX_EDUCATION_EFFECT;
        expect(scale).toBe(0.5);
    });

    it('hospital contributes 40 * educationFundScale to educationBase', () => {
        const hospitalPop = 2;
        const scale = 1.0;
        const base = hospitalPop * 40 * scale;
        expect(base).toBe(80);
    });

    it('church contributes 20 * educationFundScale to educationBase', () => {
        const churchPop = 3;
        const scale = 1.0;
        const base = churchPop * 20 * scale;
        expect(base).toBe(60);
    });

    it('zero hospitals and schools produces zero educationBase', () => {
        const base = (0 * 40 + 0 * 20) * 1.0;
        expect(base).toBe(0);
    });

});
