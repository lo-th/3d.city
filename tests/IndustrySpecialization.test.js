import { describe, it, expect, beforeEach } from 'vitest';
import { IndustrySpecialization, SPECIALIZATION_DEFS } from '../src/micro/game/IndustrySpecialization.js';
import { Micro } from '../src/micro/Micro.js';

describe('IndustrySpecialization', () => {

    let spec;

    beforeEach(() => {
        spec = new IndustrySpecialization();
    });

    // ── initial state ────────────────────────────────────────────────────────

    it('defaults to MIXED economy', () => {
        expect(spec.getCurrent()).toBe(Micro.INDUSTRY_MIXED);
    });

    it('MIXED effects are all zero', () => {
        var fx = spec.getEffects();
        expect(fx.resTaxMod).toBe(0);
        expect(fx.comTaxMod).toBe(0);
        expect(fx.indTaxMod).toBe(0);
        expect(fx.pollutionMod).toBe(0);
        expect(fx.unemployMod).toBe(0);
    });

    // ── setSpecialization ────────────────────────────────────────────────────

    describe('setSpecialization', () => {

        it('returns true for valid specialization id', () => {
            expect(spec.setSpecialization(Micro.INDUSTRY_TECH)).toBe(true);
        });

        it('changes current specialization', () => {
            spec.setSpecialization(Micro.INDUSTRY_TECH);
            expect(spec.getCurrent()).toBe(Micro.INDUSTRY_TECH);
        });

        it('returns false for unknown id', () => {
            expect(spec.setSpecialization('INVALID_TYPE')).toBe(false);
        });

        it('does not change current when id is invalid', () => {
            spec.setSpecialization('INVALID_TYPE');
            expect(spec.getCurrent()).toBe(Micro.INDUSTRY_MIXED);
        });

    });

    // ── getEffects ───────────────────────────────────────────────────────────

    describe('getEffects', () => {

        it('TECH has negative pollution modifier', () => {
            spec.setSpecialization(Micro.INDUSTRY_TECH);
            expect(spec.getEffects().pollutionMod).toBeLessThan(0);
        });

        it('MANUFACTURING has positive pollution modifier', () => {
            spec.setSpecialization(Micro.INDUSTRY_MANUFACTURING);
            expect(spec.getEffects().pollutionMod).toBeGreaterThan(0);
        });

        it('TOURISM has positive land value modifier', () => {
            spec.setSpecialization(Micro.INDUSTRY_TOURISM);
            expect(spec.getEffects().landValueMod).toBeGreaterThan(0);
        });

        it('FARMING has positive health modifier', () => {
            spec.setSpecialization(Micro.INDUSTRY_FARMING);
            expect(spec.getEffects().healthMod).toBeGreaterThan(0);
        });

        it('falls back to MIXED for invalid current', () => {
            spec._current = 'CORRUPT_VALUE';
            var fx = spec.getEffects();
            expect(fx.pollutionMod).toBe(0); // MIXED has 0 pollution mod
        });

    });

    // ── getCurrentDef ────────────────────────────────────────────────────────

    describe('getCurrentDef', () => {

        it('returns full definition for current specialization', () => {
            spec.setSpecialization(Micro.INDUSTRY_TECH);
            var def = spec.getCurrentDef();
            expect(def.id).toBe(Micro.INDUSTRY_TECH);
            expect(def).toHaveProperty('name');
            expect(def).toHaveProperty('icon');
            expect(def).toHaveProperty('description');
            expect(def).toHaveProperty('effects');
        });

    });

    // ── getList ──────────────────────────────────────────────────────────────

    describe('getList', () => {

        it('returns all specialization definitions', () => {
            expect(spec.getList()).toHaveLength(SPECIALIZATION_DEFS.length);
        });

        it('marks active specialization correctly', () => {
            spec.setSpecialization(Micro.INDUSTRY_TECH);
            var list = spec.getList();
            var techEntry = list.find(s => s.id === Micro.INDUSTRY_TECH);
            var mixedEntry = list.find(s => s.id === Micro.INDUSTRY_MIXED);
            expect(techEntry.active).toBe(true);
            expect(mixedEntry.active).toBe(false);
        });

        it('includes required fields', () => {
            spec.getList().forEach(s => {
                expect(s).toHaveProperty('id');
                expect(s).toHaveProperty('name');
                expect(s).toHaveProperty('icon');
                expect(s).toHaveProperty('description');
                expect(s).toHaveProperty('active');
            });
        });

    });

    // ── save / load ──────────────────────────────────────────────────────────

    describe('save and load', () => {

        it('round-trips the active specialization', () => {
            spec.setSpecialization(Micro.INDUSTRY_TECH);
            var saveData = {};
            spec.save(saveData);

            var fresh = new IndustrySpecialization();
            fresh.load(saveData);
            expect(fresh.getCurrent()).toBe(Micro.INDUSTRY_TECH);
        });

        it('load defaults to MIXED when save data is absent', () => {
            spec.load({});
            expect(spec.getCurrent()).toBe(Micro.INDUSTRY_MIXED);
        });

        it('load ignores unknown specialization ids in save data', () => {
            spec.load({ industrySpecialization: 'DOES_NOT_EXIST' });
            expect(spec.getCurrent()).toBe(Micro.INDUSTRY_MIXED);
        });

    });

});
