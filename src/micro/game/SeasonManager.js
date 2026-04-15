/*
 * Season Manager for 3D City
 * Manages seasonal effects on the simulation
 */

import { Micro } from '../Micro.js';
import { math } from '../math/math.js';

export class SeasonManager {

    constructor () {
        this.currentSeason = Micro.SEASON_SPRING;
        this.seasonChanged = false;

        // Seasonal modifiers
        this.fireRiskMod = 1.0;      // Multiplier for fire risk
        this.growthMod = 1.0;        // Multiplier for zone growth
        this.roadDecayMod = 1.0;     // Multiplier for road deterioration
        this.pollutionMod = 1.0;     // Multiplier for pollution
        this.happinessMod = 0;       // Additive modifier for happiness

        // Weather events
        this.heatWave = false;
        this.blizzard = false;
    }

    // Derive season from the simulation month (0-11)
    update (cityMonth) {
        let newSeason;

        if (cityMonth >= 2 && cityMonth <= 4)       newSeason = Micro.SEASON_SPRING;
        else if (cityMonth >= 5 && cityMonth <= 7)   newSeason = Micro.SEASON_SUMMER;
        else if (cityMonth >= 8 && cityMonth <= 10)  newSeason = Micro.SEASON_AUTUMN;
        else                                          newSeason = Micro.SEASON_WINTER;

        this.seasonChanged = (newSeason !== this.currentSeason);
        this.currentSeason = newSeason;

        this._applySeasonalEffects();
        this._checkWeatherEvents();

        return this.seasonChanged;
    }

    _applySeasonalEffects () {
        switch (this.currentSeason) {
            case Micro.SEASON_SPRING:
                this.fireRiskMod = 0.8;
                this.growthMod = 1.2;
                this.roadDecayMod = 1.0;
                this.pollutionMod = 0.9;
                this.happinessMod = 5;
                break;

            case Micro.SEASON_SUMMER:
                this.fireRiskMod = 1.5;
                this.growthMod = 1.0;
                this.roadDecayMod = 0.8;
                this.pollutionMod = 1.2;
                this.happinessMod = 3;
                break;

            case Micro.SEASON_AUTUMN:
                this.fireRiskMod = 1.0;
                this.growthMod = 0.9;
                this.roadDecayMod = 1.1;
                this.pollutionMod = 1.0;
                this.happinessMod = 0;
                break;

            case Micro.SEASON_WINTER:
                this.fireRiskMod = 0.5;
                this.growthMod = 0.7;
                this.roadDecayMod = 1.4;
                this.pollutionMod = 1.1;
                this.happinessMod = -5;
                break;
        }
    }

    _checkWeatherEvents () {
        this.heatWave = false;
        this.blizzard = false;

        if (this.currentSeason === Micro.SEASON_SUMMER && math.getRandom(1000) < 3) {
            this.heatWave = true;
            this.fireRiskMod = 2.5;
            this.happinessMod = -5;
        }

        if (this.currentSeason === Micro.SEASON_WINTER && math.getRandom(1000) < 5) {
            this.blizzard = true;
            this.roadDecayMod = 2.0;
            this.happinessMod = -10;
        }
    }

    getSeason () {
        return this.currentSeason;
    }

    getSeasonName () {
        let names = ['Spring', 'Summer', 'Autumn', 'Winter'];
        return names[this.currentSeason];
    }
}
