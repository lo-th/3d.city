import { describe, it, expect, beforeEach } from 'vitest';
import { Ordinances, ORDINANCE_DEFS } from '../src/micro/game/Ordinances.js';

describe('Ordinances', () => {

    let ordinances;

    beforeEach(() => {
        ordinances = new Ordinances();
    });

    // ── initial state ────────────────────────────────────────────────────────

    it('initialises all ordinances to inactive', () => {
        var list = ordinances.getList();
        list.forEach(o => expect(o.active).toBe(false));
    });

    // ── toggle ───────────────────────────────────────────────────────────────

    describe('toggle', () => {

        it('activates an inactive ordinance', () => {
            ordinances.toggle('FREE_CLINICS');
            expect(ordinances.isActive('FREE_CLINICS')).toBe(true);
        });

        it('deactivates an active ordinance', () => {
            ordinances.toggle('FREE_CLINICS');
            ordinances.toggle('FREE_CLINICS');
            expect(ordinances.isActive('FREE_CLINICS')).toBe(false);
        });

        it('returns the new state after toggle', () => {
            expect(ordinances.toggle('RECYCLING_PROGRAM')).toBe(true);
            expect(ordinances.toggle('RECYCLING_PROGRAM')).toBe(false);
        });

        it('returns false for unknown ordinance id', () => {
            expect(ordinances.toggle('DOES_NOT_EXIST')).toBe(false);
        });

    });

    // ── isActive ─────────────────────────────────────────────────────────────

    describe('isActive', () => {

        it('returns false for inactive ordinance', () => {
            expect(ordinances.isActive('NOISE_ORDINANCE')).toBe(false);
        });

        it('returns true after activation', () => {
            ordinances.toggle('NOISE_ORDINANCE');
            expect(ordinances.isActive('NOISE_ORDINANCE')).toBe(true);
        });

    });

    // ── getEffects ───────────────────────────────────────────────────────────

    describe('getEffects', () => {

        it('returns all-zero effects when no ordinances are active', () => {
            var fx = ordinances.getEffects();
            expect(fx.healthBonus).toBe(0);
            expect(fx.pollutionMod).toBe(0);
            expect(fx.educationBonus).toBe(0);
            expect(fx.trafficMod).toBe(0);
            expect(fx.comTaxMod).toBe(0);
        });

        it('accumulates health bonus from FREE_CLINICS', () => {
            ordinances.toggle('FREE_CLINICS');
            var fx = ordinances.getEffects();
            expect(fx.healthBonus).toBe(20);
        });

        it('accumulates pollution reduction from RECYCLING_PROGRAM', () => {
            ordinances.toggle('RECYCLING_PROGRAM');
            var fx = ordinances.getEffects();
            expect(fx.pollutionMod).toBe(-15);
        });

        it('stacks effects from multiple active ordinances', () => {
            ordinances.toggle('FREE_CLINICS');        // healthBonus: 20
            ordinances.toggle('RECYCLING_PROGRAM');   // healthBonus: 5, pollutionMod: -15
            var fx = ordinances.getEffects();
            expect(fx.healthBonus).toBe(25);
            expect(fx.pollutionMod).toBe(-15);
        });

        it('applies comTaxMod from SMALL_BIZ_INCENTIVE', () => {
            ordinances.toggle('SMALL_BIZ_INCENTIVE');
            var fx = ordinances.getEffects();
            expect(fx.comTaxMod).toBeCloseTo(-0.10);
        });

        it('applies trafficMod from PUBLIC_TRANSIT_SUBSIDY', () => {
            ordinances.toggle('PUBLIC_TRANSIT_SUBSIDY');
            var fx = ordinances.getEffects();
            expect(fx.trafficMod).toBe(-10);
        });

    });

    // ── getAnnualCost ────────────────────────────────────────────────────────

    describe('getAnnualCost', () => {

        it('returns 0 when nothing is active', () => {
            expect(ordinances.getAnnualCost()).toBe(0);
        });

        it('returns cost of single active ordinance', () => {
            ordinances.toggle('FREE_CLINICS');  // annualCost: 200
            expect(ordinances.getAnnualCost()).toBe(200);
        });

        it('sums costs of multiple active ordinances', () => {
            ordinances.toggle('FREE_CLINICS');         // 200
            ordinances.toggle('EDUCATION_SUBSIDIES'); // 300
            expect(ordinances.getAnnualCost()).toBe(500);
        });

        it('zero-cost ordinances do not add to total', () => {
            ordinances.toggle('NOISE_ORDINANCE');       // 0
            ordinances.toggle('SMALL_BIZ_INCENTIVE'); // 0
            expect(ordinances.getAnnualCost()).toBe(0);
        });

    });

    // ── getList ──────────────────────────────────────────────────────────────

    describe('getList', () => {

        it('returns the same number of entries as ORDINANCE_DEFS', () => {
            expect(ordinances.getList()).toHaveLength(ORDINANCE_DEFS.length);
        });

        it('marks active ordinances correctly in the list', () => {
            ordinances.toggle('FREE_CLINICS');
            var list = ordinances.getList();
            var entry = list.find(o => o.id === 'FREE_CLINICS');
            expect(entry.active).toBe(true);
        });

        it('includes all required fields', () => {
            var list = ordinances.getList();
            list.forEach(o => {
                expect(o).toHaveProperty('id');
                expect(o).toHaveProperty('name');
                expect(o).toHaveProperty('description');
                expect(o).toHaveProperty('annualCost');
                expect(o).toHaveProperty('active');
            });
        });

    });

    // ── save / load ──────────────────────────────────────────────────────────

    describe('save and load', () => {

        it('round-trips active ordinances through save/load', () => {
            ordinances.toggle('FREE_CLINICS');
            ordinances.toggle('RECYCLING_PROGRAM');

            var saveData = {};
            ordinances.save(saveData);

            var fresh = new Ordinances();
            fresh.load(saveData);

            expect(fresh.isActive('FREE_CLINICS')).toBe(true);
            expect(fresh.isActive('RECYCLING_PROGRAM')).toBe(true);
            expect(fresh.isActive('NOISE_ORDINANCE')).toBe(false);
        });

        it('load is a no-op when saveData is null', () => {
            expect(() => ordinances.load(null)).not.toThrow();
        });

        it('load ignores unknown ordinance ids in save data', () => {
            var saveData = { ordinances: { UNKNOWN_ID: true } };
            expect(() => ordinances.load(saveData)).not.toThrow();
        });

    });

});
