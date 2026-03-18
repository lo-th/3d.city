import { describe, it, expect, beforeEach } from 'vitest';
import { Achievements } from '../src/micro/game/Achievements.js';
import { setupMicro } from './setup.js';

// Minimal simData stub for achievement checks
function makeSimData(overrides) {
    return Object.assign({
        cityTime:      0,
        startingYear:  1900,
        census: {
            totalPop:          0,
            crimeAverage:      5,
            pollutionAverage:  5,
            nuclearPowerPop:   0,
            airportPop:        0,
            seaportPop:        0,
            stadiumPop:        0,
            policeStationPop:  0,
            fireStationPop:    0,
            hospitalPop:       0,
            educationLevel:    0,
            healthLevel:       0,
            happinessLevel:    50,
        },
        evaluation: {
            cityPop:   0,
            cityYes:   50,
            cityScore: 500,
        },
        budget: {
            totalFunds: 0,
        },
    }, overrides);
}

describe('Achievements', () => {

    let achievements;

    beforeEach(() => {
        setupMicro();
        achievements = new Achievements();
    });

    // ── unlock / getProgress ─────────────────────────────────────────────────

    describe('unlock', () => {

        it('unlocks an achievement by id', () => {
            achievements.unlock('first_zone');
            expect(achievements.unlocked['first_zone']).toBe(true);
        });

        it('increments totalUnlocked', () => {
            achievements.unlock('first_zone');
            expect(achievements.totalUnlocked).toBe(1);
        });

        it('does not double-count the same achievement', () => {
            achievements.unlock('first_zone');
            achievements.unlock('first_zone');
            expect(achievements.totalUnlocked).toBe(1);
        });

    });

    // ── trigger ──────────────────────────────────────────────────────────────

    describe('trigger', () => {

        it('unlocks and returns the achievement definition', () => {
            var ach = achievements.trigger('survive_disaster');
            expect(ach).not.toBeNull();
            expect(ach.id).toBe('survive_disaster');
        });

        it('returns null when already unlocked', () => {
            achievements.unlock('survive_disaster');
            expect(achievements.trigger('survive_disaster')).toBeNull();
        });

        it('returns null for an unknown id', () => {
            // trigger calls unlock which succeeds silently, but find returns undefined → null
            var result = achievements.trigger('does_not_exist');
            // The achievement won't be in the list, so ach will be undefined → null
            // Actually it will be undefined because ACHIEVEMENTS.find returns undefined
            // but the method does `return ach || null` so it returns null
            expect(result).toBeNull();
        });

    });

    // ── getRecentUnlock ──────────────────────────────────────────────────────

    describe('getRecentUnlock', () => {

        it('returns the most recently unlocked achievement', () => {
            achievements.unlock('nuclear_power');
            var ach = achievements.getRecentUnlock();
            expect(ach).not.toBeNull();
            expect(ach.id).toBe('nuclear_power');
        });

        it('clears recentUnlock after reading', () => {
            achievements.unlock('nuclear_power');
            achievements.getRecentUnlock();
            expect(achievements.getRecentUnlock()).toBeNull();
        });

        it('returns null when nothing was recently unlocked', () => {
            expect(achievements.getRecentUnlock()).toBeNull();
        });

    });

    // ── getAll ───────────────────────────────────────────────────────────────

    describe('getAll', () => {

        it('returns an array of achievement definitions', () => {
            var all = achievements.getAll();
            expect(Array.isArray(all)).toBe(true);
            expect(all.length).toBeGreaterThan(0);
        });

        it('marks unlocked achievements correctly', () => {
            achievements.unlock('first_zone');
            var all = achievements.getAll();
            var found = all.find(a => a.id === 'first_zone');
            expect(found.unlocked).toBe(true);
        });

        it('marks locked achievements as false', () => {
            var all = achievements.getAll();
            var found = all.find(a => a.id === 'first_zone');
            expect(found.unlocked).toBe(false);
        });

        it('strips the check function from returned objects', () => {
            var all = achievements.getAll();
            expect(all[0].check).toBeUndefined();
        });

    });

    // ── getProgress ──────────────────────────────────────────────────────────

    describe('getProgress', () => {

        it('returns unlocked count and total', () => {
            var prog = achievements.getProgress();
            expect(prog.unlocked).toBe(0);
            expect(prog.total).toBeGreaterThan(0);
        });

        it('reflects newly unlocked achievements', () => {
            achievements.unlock('first_zone');
            achievements.unlock('nuclear_power');
            expect(achievements.getProgress().unlocked).toBe(2);
        });

    });

    // ── checkAll ─────────────────────────────────────────────────────────────

    describe('checkAll', () => {

        it('returns empty array when no conditions are met', () => {
            var simData = makeSimData();
            expect(achievements.checkAll(simData)).toHaveLength(0);
        });

        it('unlocks population milestone when pop threshold is met', () => {
            var simData = makeSimData();
            simData.evaluation.cityPop = 600;
            simData.census.totalPop    = 600;
            var unlocked = achievements.checkAll(simData);
            var ids = unlocked.map(a => a.id);
            expect(ids).toContain('pop_500');
        });

        it('does not unlock already-unlocked achievements', () => {
            achievements.unlock('pop_500');
            var simData = makeSimData();
            simData.evaluation.cityPop = 600;
            simData.census.totalPop    = 600;
            var unlocked = achievements.checkAll(simData);
            expect(unlocked.find(a => a.id === 'pop_500')).toBeUndefined();
        });

        it('skips achievements with null check function', () => {
            // 'survive_disaster' has check: null — must not throw
            var simData = makeSimData();
            expect(() => achievements.checkAll(simData)).not.toThrow();
        });

        it('unlocks rich milestone when funds threshold is met', () => {
            var simData = makeSimData();
            simData.budget.totalFunds = 150000;
            simData.census.totalPop = 500;
            simData.evaluation.cityPop = 500;
            var unlocked = achievements.checkAll(simData);
            var ids = unlocked.map(a => a.id);
            expect(ids).toContain('rich_100k');
        });

    });

    // ── save / load ──────────────────────────────────────────────────────────

    describe('save and load', () => {

        it('round-trips unlocked achievements through save/load', () => {
            achievements.unlock('first_zone');
            achievements.unlock('nuclear_power');

            var saveData = {};
            achievements.save(saveData);

            var fresh = new Achievements();
            fresh.load(saveData);

            expect(fresh.unlocked['first_zone']).toBe(true);
            expect(fresh.unlocked['nuclear_power']).toBe(true);
            expect(fresh.totalUnlocked).toBe(2);
        });

        it('load is a no-op when achievements key is absent', () => {
            expect(() => achievements.load({})).not.toThrow();
            expect(achievements.totalUnlocked).toBe(0);
        });

    });

});
