import { describe, it, expect, beforeEach } from 'vitest';
import { CityHistory, HistoryEventType } from '../src/micro/game/CityHistory.js';

describe('CityHistory', () => {

    let history;

    beforeEach(() => {
        history = new CityHistory();
    });

    // ── addEvent ──────────────────────────────────────────────────────────────

    describe('addEvent', () => {

        it('adds an event to the history', () => {
            history.addEvent(HistoryEventType.MILESTONE, 'City founded', 0, 1900);
            expect(history.events.length).toBe(1);
        });

        it('stores event properties correctly', () => {
            var ev = history.addEvent(HistoryEventType.DISASTER, 'Fire broke out', 48, 1900);
            expect(ev.type).toBe(HistoryEventType.DISASTER);
            expect(ev.desc).toBe('Fire broke out');
            expect(ev.year).toBe(1901); // cityTime=48 → 48/48=1 year past 1900
            expect(ev.cityTime).toBe(48);
        });

        it('derives year from cityTime and startingYear', () => {
            var ev = history.addEvent(HistoryEventType.ECONOMIC, 'Tax raised', 96, 1900);
            expect(ev.year).toBe(1902); // 96/48 = 2 years
        });

        it('derives month from cityTime', () => {
            // monthIdx = floor((cityTime % 48) >> 2)
            // cityTime=12: 12%48=12, 12>>2=3
            var ev = history.addEvent(HistoryEventType.GROWTH, 'Growth', 12, 1900);
            expect(ev.month).toBe(3);
        });

        it('returns the event object', () => {
            var result = history.addEvent(HistoryEventType.SEASON, 'Winter arrived', 0, 1900);
            expect(result).toBeDefined();
            expect(result.type).toBe(HistoryEventType.SEASON);
        });

    });

    // ── getRecent ─────────────────────────────────────────────────────────────

    describe('getRecent', () => {

        beforeEach(() => {
            for (var i = 0; i < 15; i++) {
                history.addEvent(HistoryEventType.GROWTH, 'Event ' + i, i, 1900);
            }
        });

        it('returns events in reverse order (most recent first)', () => {
            var recent = history.getRecent(3);
            expect(recent[0].cityTime).toBeGreaterThan(recent[1].cityTime);
        });

        it('respects count parameter', () => {
            expect(history.getRecent(5).length).toBe(5);
        });

        it('defaults to 10 events', () => {
            expect(history.getRecent().length).toBe(10);
        });

        it('returns all events if fewer than count exist', () => {
            var h = new CityHistory();
            h.addEvent(HistoryEventType.MILESTONE, 'A', 0, 1900);
            h.addEvent(HistoryEventType.MILESTONE, 'B', 1, 1900);
            expect(h.getRecent(10).length).toBe(2);
        });

    });

    // ── MAX_HISTORY cap ───────────────────────────────────────────────────────

    describe('MAX_HISTORY cap', () => {

        it('does not exceed 50 events', () => {
            for (var i = 0; i < 60; i++) {
                history.addEvent(HistoryEventType.GROWTH, 'Event ' + i, i, 1900);
            }
            expect(history.events.length).toBeLessThanOrEqual(50);
        });

        it('keeps the most recent events after cap is hit', () => {
            for (var i = 0; i < 60; i++) {
                history.addEvent(HistoryEventType.GROWTH, 'Event ' + i, i, 1900);
            }
            var all = history.getAll();
            // Most recent event should be Event 59
            expect(all[0].desc).toBe('Event 59');
        });

    });

    // ── getAll ────────────────────────────────────────────────────────────────

    describe('getAll', () => {

        it('returns events in reverse chronological order', () => {
            history.addEvent(HistoryEventType.MILESTONE, 'First', 0, 1900);
            history.addEvent(HistoryEventType.MILESTONE, 'Second', 10, 1900);
            history.addEvent(HistoryEventType.MILESTONE, 'Third', 20, 1900);
            var all = history.getAll();
            expect(all[0].desc).toBe('Third');
            expect(all[2].desc).toBe('First');
        });

        it('does not mutate the internal array', () => {
            history.addEvent(HistoryEventType.MILESTONE, 'X', 0, 1900);
            var all = history.getAll();
            all.push({ fake: true });
            expect(history.events.length).toBe(1);
        });

    });

    // ── clear ─────────────────────────────────────────────────────────────────

    describe('clear', () => {

        it('empties the history', () => {
            history.addEvent(HistoryEventType.DISASTER, 'Fire', 0, 1900);
            history.addEvent(HistoryEventType.DISASTER, 'Flood', 5, 1900);
            history.clear();
            expect(history.events.length).toBe(0);
        });

    });

    // ── save / load ───────────────────────────────────────────────────────────

    describe('save / load', () => {

        it('round-trips events through save/load', () => {
            history.addEvent(HistoryEventType.ACHIEVEMENT, 'First milestone', 24, 1900);
            history.addEvent(HistoryEventType.ECONOMIC, 'Tax collected', 48, 1900);

            var saveData = {};
            history.save(saveData);

            var loaded = new CityHistory();
            loaded.load(saveData);

            expect(loaded.events.length).toBe(2);
            expect(loaded.events[0].type).toBe(HistoryEventType.ACHIEVEMENT);
        });

        it('load with missing cityHistory does not throw', () => {
            expect(() => history.load({})).not.toThrow();
            expect(history.events.length).toBe(0);
        });

    });

    // ── HistoryEventType constants ────────────────────────────────────────────

    describe('HistoryEventType', () => {

        it('exports all expected event types', () => {
            expect(HistoryEventType.MILESTONE).toBeDefined();
            expect(HistoryEventType.DISASTER).toBeDefined();
            expect(HistoryEventType.ACHIEVEMENT).toBeDefined();
            expect(HistoryEventType.ECONOMIC).toBeDefined();
            expect(HistoryEventType.GROWTH).toBeDefined();
            expect(HistoryEventType.SEASON).toBeDefined();
        });

    });

});
