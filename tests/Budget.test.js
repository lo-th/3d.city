import { describe, it, expect, beforeEach } from 'vitest';
import { Budget } from '../src/micro/game/Budget.js';
import { Micro } from '../src/micro/Micro.js';
import { setupMicro } from './setup.js';

describe('Budget', () => {

    let budget;

    beforeEach(() => {
        setupMicro();
        budget = new Budget();
        budget.setFunds(10000);
    });

    // ── issueBond ────────────────────────────────────────────────────────────

    describe('issueBond', () => {

        it('adds bond amount to total funds', () => {
            budget.issueBond(5000);
            expect(budget.totalFunds).toBe(15000);
        });

        it('adds bond amount to bondDebt', () => {
            budget.issueBond(5000);
            expect(budget.bondDebt).toBe(5000);
        });

        it('returns true on success', () => {
            expect(budget.issueBond(1000)).toBe(true);
        });

        it('returns false when amount is zero', () => {
            expect(budget.issueBond(0)).toBe(false);
        });

        it('returns false when amount is negative', () => {
            expect(budget.issueBond(-500)).toBe(false);
        });

        it('returns false when debt cap would be exceeded', () => {
            budget.issueBond(budget.MAX_BOND_DEBT);
            expect(budget.issueBond(1)).toBe(false);
        });

        it('does not exceed MAX_BOND_DEBT', () => {
            budget.issueBond(budget.MAX_BOND_DEBT - 1);
            budget.issueBond(5000);  // would exceed cap
            expect(budget.bondDebt).toBeLessThanOrEqual(budget.MAX_BOND_DEBT);
        });

    });

    // ── getBondAnnualPayment ─────────────────────────────────────────────────

    describe('getBondAnnualPayment', () => {

        it('returns 0 when there is no debt', () => {
            expect(budget.getBondAnnualPayment()).toBe(0);
        });

        it('returns correct interest for outstanding debt', () => {
            budget.bondDebt = 10000;
            budget.bondInterestRate = 0.07;
            expect(budget.getBondAnnualPayment()).toBe(700);
        });

    });

    // ── setZoneTax ───────────────────────────────────────────────────────────

    describe('setZoneTax', () => {

        it('sets individual zone tax rates', () => {
            budget.setZoneTax(5, 8, 10);
            expect(budget.resTaxRate).toBe(5);
            expect(budget.comTaxRate).toBe(8);
            expect(budget.indTaxRate).toBe(10);
        });

        it('clamps rates to 0–20', () => {
            budget.setZoneTax(-5, 25, 10);
            expect(budget.resTaxRate).toBe(0);
            expect(budget.comTaxRate).toBe(20);
        });

        it('updates cityTax as weighted average', () => {
            budget.setZoneTax(6, 6, 6);
            expect(budget.cityTax).toBe(6);
        });

    });

    // ── setTax ───────────────────────────────────────────────────────────────

    describe('setTax', () => {

        it('sets all zone rates to the global rate', () => {
            budget.setTax(9);
            expect(budget.resTaxRate).toBe(9);
            expect(budget.comTaxRate).toBe(9);
            expect(budget.indTaxRate).toBe(9);
            expect(budget.cityTax).toBe(9);
        });

        it('no-ops when the rate is unchanged', () => {
            budget.cityTax = 7;
            budget.setTax(7);
            expect(budget.cityTax).toBe(7);
        });

    });

    // ── setFunds ─────────────────────────────────────────────────────────────

    describe('setFunds', () => {

        it('sets total funds', () => {
            budget.setFunds(5000);
            expect(budget.totalFunds).toBe(5000);
        });

        it('clamps to 0 (funds cannot go negative)', () => {
            budget.setFunds(-100);
            expect(budget.totalFunds).toBe(0);
        });

    });

    // ── spend ────────────────────────────────────────────────────────────────

    describe('spend', () => {

        it('deducts the amount from total funds', () => {
            budget.spend(2000);
            expect(budget.totalFunds).toBe(8000);
        });

        it('clamps to 0 when spending exceeds funds', () => {
            budget.spend(99999);
            expect(budget.totalFunds).toBe(0);
        });

    });

    // ── shouldDegradeRoad ────────────────────────────────────────────────────

    describe('shouldDegradeRoad', () => {

        it('returns false when road effect is at maximum', () => {
            budget.roadEffect = Micro.MAX_ROAD_EFFECT;
            expect(budget.shouldDegradeRoad()).toBe(false);
        });

        it('returns true when road effect is very low', () => {
            budget.roadEffect = 1;
            expect(budget.shouldDegradeRoad()).toBe(true);
        });

    });

    // ── fund getters ─────────────────────────────────────────────────────────

    describe('fund getters', () => {

        it('roadFund aliases roadMaintenanceBudget', () => {
            budget.roadMaintenanceBudget = 1234;
            expect(budget.roadFund).toBe(1234);
        });

        it('fireFund aliases fireMaintenanceBudget', () => {
            budget.fireMaintenanceBudget = 500;
            expect(budget.fireFund).toBe(500);
        });

        it('policeFund aliases policeMaintenanceBudget', () => {
            budget.policeMaintenanceBudget = 750;
            expect(budget.policeFund).toBe(750);
        });

        it('waterFund aliases waterMaintenanceBudget', () => {
            budget.waterMaintenanceBudget = 300;
            expect(budget.waterFund).toBe(300);
        });

    });

});
