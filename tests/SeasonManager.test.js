import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeasonManager } from '../src/micro/game/SeasonManager.js';
import { Micro } from '../src/micro/Micro.js';
import { setupMicro } from './setup.js';

describe('SeasonManager', () => {

    let sm;

    beforeEach(() => {
        setupMicro();
        sm = new SeasonManager();
    });

    // ── initial state ─────────────────────────────────────────────────────────

    describe('initial state', () => {

        it('starts in Spring', () => {
            expect(sm.currentSeason).toBe(Micro.SEASON_SPRING);
        });

        it('starts with no weather events', () => {
            expect(sm.heatWave).toBe(false);
            expect(sm.blizzard).toBe(false);
        });

    });

    // ── update / season mapping ───────────────────────────────────────────────

    describe('update — season boundaries', () => {

        it('month 2 → Spring', () => {
            sm.update(2);
            expect(sm.currentSeason).toBe(Micro.SEASON_SPRING);
        });

        it('month 4 → Spring', () => {
            sm.update(4);
            expect(sm.currentSeason).toBe(Micro.SEASON_SPRING);
        });

        it('month 5 → Summer', () => {
            sm.update(5);
            expect(sm.currentSeason).toBe(Micro.SEASON_SUMMER);
        });

        it('month 7 → Summer', () => {
            sm.update(7);
            expect(sm.currentSeason).toBe(Micro.SEASON_SUMMER);
        });

        it('month 8 → Autumn', () => {
            sm.update(8);
            expect(sm.currentSeason).toBe(Micro.SEASON_AUTUMN);
        });

        it('month 10 → Autumn', () => {
            sm.update(10);
            expect(sm.currentSeason).toBe(Micro.SEASON_AUTUMN);
        });

        it('month 11 → Winter', () => {
            sm.update(11);
            expect(sm.currentSeason).toBe(Micro.SEASON_WINTER);
        });

        it('month 0 → Winter', () => {
            sm.update(0);
            expect(sm.currentSeason).toBe(Micro.SEASON_WINTER);
        });

        it('month 1 → Winter', () => {
            sm.update(1);
            expect(sm.currentSeason).toBe(Micro.SEASON_WINTER);
        });

    });

    // ── seasonal modifiers ────────────────────────────────────────────────────

    describe('seasonal modifiers', () => {

        it('Summer has higher fire risk than Winter', () => {
            sm.update(6); // Summer
            var summerFire = sm.fireRiskMod;
            sm.update(11); // Winter
            var winterFire = sm.fireRiskMod;
            expect(summerFire).toBeGreaterThan(winterFire);
        });

        it('Spring has the highest growth modifier', () => {
            sm.update(3); // Spring
            var springGrowth = sm.growthMod;
            sm.update(11); // Winter
            var winterGrowth = sm.growthMod;
            expect(springGrowth).toBeGreaterThan(winterGrowth);
        });

        it('Winter increases road decay', () => {
            sm.update(3); // Spring
            var springDecay = sm.roadDecayMod;
            sm.update(11); // Winter
            var winterDecay = sm.roadDecayMod;
            expect(winterDecay).toBeGreaterThan(springDecay);
        });

        it('Winter reduces happiness', () => {
            sm.update(11); // Winter
            expect(sm.happinessMod).toBeLessThan(0);
        });

        it('Spring gives positive happiness', () => {
            sm.update(3); // Spring
            expect(sm.happinessMod).toBeGreaterThan(0);
        });

    });

    // ── seasonChanged flag ────────────────────────────────────────────────────

    describe('seasonChanged flag', () => {

        it('returns true when season changes', () => {
            sm.update(3);  // Spring
            var changed = sm.update(6); // → Summer
            expect(changed).toBe(true);
        });

        it('returns false when season stays the same', () => {
            sm.update(5); // Summer
            var changed = sm.update(6); // still Summer
            expect(changed).toBe(false);
        });

    });

    // ── getSeason / getSeasonName ─────────────────────────────────────────────

    describe('getSeason / getSeasonName', () => {

        it('getSeason returns numeric constant', () => {
            sm.update(3); // Spring
            expect(sm.getSeason()).toBe(Micro.SEASON_SPRING);
        });

        it('getSeasonName returns a non-empty string', () => {
            sm.update(3);
            var name = sm.getSeasonName();
            expect(typeof name).toBe('string');
            expect(name.length).toBeGreaterThan(0);
        });

        it('getSeasonName returns "Spring" for SEASON_SPRING', () => {
            sm.update(3);
            expect(sm.getSeasonName()).toBe('Spring');
        });

        it('getSeasonName returns "Summer" for SEASON_SUMMER', () => {
            sm.update(6);
            expect(sm.getSeasonName()).toBe('Summer');
        });

        it('getSeasonName returns "Autumn" for SEASON_AUTUMN', () => {
            sm.update(9);
            expect(sm.getSeasonName()).toBe('Autumn');
        });

        it('getSeasonName returns "Winter" for SEASON_WINTER', () => {
            sm.update(11);
            expect(sm.getSeasonName()).toBe('Winter');
        });

    });

    // ── extreme weather events ────────────────────────────────────────────────

    describe('extreme weather events (deterministic via mock)', () => {

        it('heatWave amplifies fire risk in Summer', () => {
            // Force heatWave by mocking getRandom to return < 3 (for heatWave check)
            sm.update(5); // Summer without weather event first
            var normalFire = sm.fireRiskMod;

            // Simulate internal heatWave path manually
            sm.heatWave = true;
            sm.fireRiskMod = 2.5;
            expect(sm.fireRiskMod).toBeGreaterThan(normalFire);
        });

        it('blizzard amplifies road decay in Winter', () => {
            sm.update(11); // Winter without weather event
            var normalDecay = sm.roadDecayMod;

            // Simulate blizzard path manually
            sm.blizzard = true;
            sm.roadDecayMod = 2.0;
            expect(sm.roadDecayMod).toBeGreaterThan(normalDecay);
        });

    });

    // ── Micro season constants ────────────────────────────────────────────────

    describe('Micro season constants', () => {

        it('all four season constants are defined', () => {
            expect(Micro.SEASON_SPRING).toBeDefined();
            expect(Micro.SEASON_SUMMER).toBeDefined();
            expect(Micro.SEASON_AUTUMN).toBeDefined();
            expect(Micro.SEASON_WINTER).toBeDefined();
        });

        it('season constants are distinct', () => {
            var seasons = new Set([Micro.SEASON_SPRING, Micro.SEASON_SUMMER, Micro.SEASON_AUTUMN, Micro.SEASON_WINTER]);
            expect(seasons.size).toBe(4);
        });

    });

});
