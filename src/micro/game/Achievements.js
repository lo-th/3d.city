/*
 * Achievement system for 3D City
 * Tracks player milestones and unlocks
 */

import { Micro } from '../Micro.js';

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_zone',      name: 'Founder',           desc: 'Place your first zone',             check: (s) => s.census.totalPop > 0 },
    { id: 'pop_500',         name: 'Small Settlement',  desc: 'Reach 500 population',              check: (s) => s.evaluation.cityPop >= 500 },
    { id: 'pop_2000',        name: 'Growing Town',      desc: 'Reach 2,000 population',            check: (s) => s.evaluation.cityPop >= 2000 },
    { id: 'pop_10000',       name: 'City Founder',      desc: 'Reach 10,000 population',           check: (s) => s.evaluation.cityPop >= 10000 },
    { id: 'pop_50000',       name: 'Capital Builder',   desc: 'Reach 50,000 population',           check: (s) => s.evaluation.cityPop >= 50000 },
    { id: 'pop_100000',      name: 'Metropolis Master', desc: 'Reach 100,000 population',          check: (s) => s.evaluation.cityPop >= 100000 },
    { id: 'pop_500000',      name: 'Megalopolis',       desc: 'Reach 500,000 population',          check: (s) => s.evaluation.cityPop >= 500000 },
    { id: 'rich_100k',       name: 'Prosperous',        desc: 'Accumulate $100,000',               check: (s) => s.budget.totalFunds >= 100000 },
    { id: 'rich_1m',         name: 'Tycoon',            desc: 'Accumulate $1,000,000',             check: (s) => s.budget.totalFunds >= 1000000 },
    { id: 'low_crime',       name: 'Safe Streets',      desc: 'Keep crime average below 10',       check: (s) => s.census.crimeAverage < 10 && s.census.totalPop > 100 },
    { id: 'no_pollution',    name: 'Green City',        desc: 'Keep pollution average below 15',   check: (s) => s.census.pollutionAverage < 15 && s.census.totalPop > 100 },
    { id: 'high_approval',   name: 'Beloved Mayor',     desc: 'Get 90%+ approval rating',          check: (s) => s.evaluation.cityYes >= 90 },
    { id: 'high_score',      name: 'Perfect City',      desc: 'Achieve city score of 900+',        check: (s) => s.evaluation.cityScore >= 900 },
    { id: 'nuclear_power',   name: 'Nuclear Age',       desc: 'Build a nuclear power plant',       check: (s) => s.census.nuclearPowerPop > 0 },
    { id: 'airport_built',   name: 'Sky\'s the Limit',  desc: 'Build an airport',                  check: (s) => s.census.airportPop > 0 },
    { id: 'seaport_built',   name: 'Harbor Master',     desc: 'Build a seaport',                   check: (s) => s.census.seaportPop > 0 },
    { id: 'stadium_built',   name: 'Sports Fan',        desc: 'Build a stadium',                   check: (s) => s.census.stadiumPop > 0 },
    { id: 'hospital_built',  name: 'Doctor Mayor',      desc: 'Build a hospital',                  check: (s) => s.census.hospitalPop > 0 },
    { id: 'school_built',   name: 'Educator',          desc: 'Build a school or community center', check: (s) => s.census.churchPop > 0 },
    { id: 'full_services',  name: 'Full Coverage',     desc: 'Have police, fire, and hospital',   check: (s) => s.census.policeStationPop > 0 && s.census.fireStationPop > 0 && s.census.hospitalPop > 0 },
    { id: 'survive_disaster', name: 'Resilient',        desc: 'Survive a disaster',                check: null }, // Triggered manually
    { id: 'year_2000',       name: 'Millennium',        desc: 'Reach the year 2000',               check: (s) => { let yr = Math.floor(s.cityTime / 48) + s.startingYear; return yr >= 2000; } },
    { id: 'high_education',  name: 'Educated City',     desc: 'Reach education level 150+',        check: (s) => s.census.educationLevel >= 150 },
    { id: 'high_health',     name: 'Healthy City',      desc: 'Reach health level 150+',           check: (s) => s.census.healthLevel >= 150 },
    { id: 'happy_city',      name: 'Utopia',            desc: 'Reach happiness level 85+',         check: (s) => s.census.happinessLevel >= 85 },
    { id: 'debt_free',       name: 'Debt Free',         desc: 'Pay off all municipal bond debt',   check: (s) => s.budget.bondDebt === 0 && s.census.totalPop > 500 },
    { id: 'no_fire',         name: 'Fireproof',         desc: 'Keep fire severity at zero for a full evaluation cycle', check: (s) => s.census.firePop === 0 && s.census.fireStationPop > 0 && s.census.totalPop > 1000 },
    { id: 'park_builder',    name: 'Park Builder',      desc: 'Place 20 or more park tiles',       check: (s) => (s.census.parkCount || 0) >= 20 },
];

export class Achievements {

    constructor () {
        this.unlocked = {};
        this.recentUnlock = null;
        this.totalUnlocked = 0;
    }

    save (saveData) {
        saveData.achievements = this.unlocked;
    }

    load (saveData) {
        if (saveData.achievements) {
            this.unlocked = saveData.achievements;
            this.totalUnlocked = Object.keys(this.unlocked).length;
        }
    }

    // Check all achievements against current simulation state
    checkAll (simData) {
        let newUnlocks = [];

        for (let i = 0; i < ACHIEVEMENTS.length; i++) {
            let ach = ACHIEVEMENTS[i];
            if (this.unlocked[ach.id]) continue;
            if (ach.check === null) continue;

            if (ach.check(simData)) {
                this.unlock(ach.id);
                newUnlocks.push(ach);
            }
        }

        return newUnlocks;
    }

    // Manually trigger an achievement
    trigger (id) {
        if (this.unlocked[id]) return null;
        this.unlock(id);
        let ach = ACHIEVEMENTS.find(a => a.id === id);
        return ach || null;
    }

    unlock (id) {
        if (this.unlocked[id]) return;
        this.unlocked[id] = true;
        this.totalUnlocked++;
        this.recentUnlock = id;
    }

    getRecentUnlock () {
        if (!this.recentUnlock) return null;
        let ach = ACHIEVEMENTS.find(a => a.id === this.recentUnlock);
        this.recentUnlock = null;
        return ach;
    }

    getAll () {
        return ACHIEVEMENTS.map(ach => ({
            ...ach,
            unlocked: !!this.unlocked[ach.id],
            check: undefined
        }));
    }

    getProgress () {
        return { unlocked: this.totalUnlocked, total: ACHIEVEMENTS.length };
    }
}
