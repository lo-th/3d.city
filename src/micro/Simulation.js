/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * switch to ES6 & 3D by lo-th
 *
 */


import { Micro } from './Micro.js';
import { Messages } from './Messages.js';
import { MessageManager } from './MessageManager.js';

import { TXT } from './Text.js';
import { SpriteManager } from './sprite/SpriteManager.js';

import { Evaluation } from './game/Evaluation.js';
import { Valves } from './game/Valves.js';
import { Budget } from './game/Budget.js';
import { Census } from './game/Census.js';
import { BlockMap } from './game/BlockMap.js';
import { PowerManager } from './game/PowerManager.js';
import { MapScanner } from './game/MapScanner.js';
import { RepairManager } from './game/RepairManager.js';
import { Traffic } from './game/Traffic.js';
import { DisasterManager } from './game/DisasterManager.js';

import { Residential } from './zone/Residential.js';
import { Commercial } from './zone/Commercial.js';
import { Industrial } from './zone/Industrial.js';
import { Road } from './zone/Road.js'; 
import { Transport } from './zone/Transport.js';
import { EmergencyServices } from './zone/EmergencyServices.js';
import { MiscTiles } from './zone/MiscTiles.js';
import { Stadia } from './zone/Stadia.js';

import { MapUtils } from './map/MapUtils.js';

export class Simulation {

    constructor ( gameMap, gameLevel, speed, is3D, savedGame ) {

        if (gameLevel !== Micro.LEVEL_EASY && gameLevel !== Micro.LEVEL_MED && gameLevel !== Micro.LEVEL_HARD) throw new Error('Invalid level!');
       // if (speed !== Micro.SPEED_PAUSED && speed !== Micro.SPEED_SLOW && speed !== Micro.SPEED_MED && speed !== Micro.SPEED_FAST) throw new Error('Invalid speed!');

        this.map = gameMap;
        this.gameLevel = gameLevel;

        this.div = this.map.width / 8;

        this.is3D = is3D || false;

        this.time = typeof performance === 'undefined' ? Date : performance;

        this.speed = speed;
        this.speedCycle = 0;
        this.phaseCycle = 0;
        this.simCycle = 0;
        this.doInitialEval = true;
        this.cityTime = 50;
        this.cityPopLast = 0;
        this.messageLast = Messages.VILLAGE_REACHED;
        this.startingYear = 1900;

        // Last valves updated to the user
        this.resValveLast = 0;
        this.comValveLast = 0;
        this.indValveLast = 0;

        // Last date sent to front end
        this._cityYearLast = -1;
        this._cityMonthLast = -1;

        // Last time we relayed a message from PowerManager to the front-end
        this._lastPowerMessage = null;

        this.infos = []

        // And now, the main cast of characters
        this.evaluation = new Evaluation( this.gameLevel );
        this.valves = new Valves();
        this.budget = new Budget();
        this.census = new Census();
        this.powerManager = new PowerManager( this.map );
        this.spriteManager = new SpriteManager( this.map );
        this.mapScanner = new MapScanner(this.map);
        this.repairManager = new RepairManager(this.map);
        this.traffic = new Traffic(this.map, this.spriteManager);
        this.disasterManager = new DisasterManager(this.map, this.spriteManager, this.gameLevel);

        this.messageManager = new MessageManager();
        Micro.messageManager = this.messageManager;

        let w = this.map.width, h = this.map.height;

        this.blockMaps = {

            // Holds a "distance score" for the block from the city centre, range  -64 to 64
            cityCentreDistScoreMap: new BlockMap( w, h, 8),

            // Holds a score representing how dangerous an area is, in range 0-250 (larger is worse)
            crimeRateMap: new BlockMap( w, h, 2),

            // A map used to note positions of fire stations during the map scan, range 0-1000
            fireStationMap: new BlockMap( w, h, 8),
            // Holds a value containing a score representing the effect of fire cover in this neighborhood, range 0-1000
            fireStationEffectMap: new BlockMap( w, h, 8),

            // Holds scores representing the land value in the range 0-250
            landValueMap: new BlockMap( w, h, 2),

            // A map used to note positions of police stations during the map scan, range 0-1000
            policeStationMap: new BlockMap( w, h, 8),
            // Holds a value containing a score representing how much crime is dampened in this block, range 0-1000
            policeStationEffectMap: new BlockMap( w, h, 8),

            // Holds a value representing the amount of pollution in a neighbourhood, in the range 0-255
            pollutionDensityMap: new BlockMap( w, h, 2),

            // Holds a value representing population density of a block, in the range 0-510
            populationDensityMap: new BlockMap( w, h, 2),

            // Holds a value representing the rate of growth of a neighbourhood in the range -200 to +200
            rateOfGrowthMap: new BlockMap( w, h, 8),

            // Scores a block on how undeveloped/unspoilt it is, range 0-240
            terrainDensityMap: new BlockMap( w, h, 4),
            // Scores the volume of traffic in this cluster, range 0-240
            trafficDensityMap: new BlockMap( w, h, 2),

            // Temporary maps
            tempMap1: new BlockMap( w, h, 2),
            tempMap2: new BlockMap( w, h, 2),
            tempMap3: new BlockMap( w, h, 4)
            
        };

        this.clearCensus();

        if (savedGame) {
            this.load(savedGame);
            //this.cityPopLast = savedGame.totalPop;      
        } else {
            this.budget.setFunds( 20000 );
            this.census.totalPop = 1;
        }

        Micro.simData = this;

        this.init();

    }


    save ( saveData ) {

        for (let i = 0, l = Micro.savePropsVar.length; i < l; i++)
            saveData[Micro.savePropsVar[i]] = this[Micro.savePropsVar[i]];

        this.map.save(saveData);
        this.evaluation.save(saveData);
        this.valves.save(saveData);
        this.budget.save(saveData);
        this.census.save(saveData);

    }

    load (saveData) {
        //console.log(saveData)
        this.messageManager.clear();
        for (let i = 0, l = Micro.savePropsVar.length; i < l; i++)
            this[Micro.savePropsVar[i]] = saveData[Micro.savePropsVar[i]];

        //this.map.load(saveData);
        this.evaluation.load(saveData);
        this.valves.load(saveData);
        this.budget.load(saveData);
        this.census.load(saveData);

    }

    setSpeed (s) {
        this.speed = s;
    }

    setDifficulty(s) {

        if (s !== Micro.LEVEL_EASY && s !== Micro.LEVEL_MED && s !== Micro.LEVEL_HARD) throw new Error('Invalid level!');
        this.gameLevel = s;
        this.disasterManager.setDifficulty( this.gameLevel );

    }

    isPaused () {

        return this.speed === Micro.SPEED_PAUSED;

    }

    simTick () {

        let up = this.simFrame();

        if(up){
            this.updateTime();
            this.updateInfo();
        }

        return up;

    }

    updateInfo(){

        this.infos[0] = [TXT.months[ this._cityMonthLast ], this._cityYearLast].join(' ');

        this.infos[1] = TXT.cityClass[this.evaluation.cityScore];
        this.infos[2] = this.evaluation.cityScore;
        this.infos[3] = this.evaluation.cityPop;

        this.infos[4] = this.budget.totalFunds;
        this.infos[5] = this.valves.resValve;
        this.infos[6] = this.valves.comValve;
        this.infos[7] = this.valves.indValve;

        //this.infos[8] = '' // message

        this.infos[9] = this.map.powerChange;
        this.map.powerChange = false;

        return this.infos

    }

    simFrame () {

        if ( this.budget.awaitingValues ) return false;

        if ( this.speed === Micro.SPEED_PAUSED ) return false;

        // Default to slow speed
        let threshold = 100;
        if (this.speed === Micro.SPEED_MED ) threshold = 50;
        if (this.speed === Micro.SPEED_FAST ) threshold = 10;
        if (this.speed === Micro.SPEED_ULTRA ) threshold = 5;

        let now = this.time.now();//new Date()
        if ( now - this.prevTime < threshold ) return false;

        this.messageManager.clear();

        this.simulate();
        this.prevTime = now;
        return true

    }

    clearCensus () {
        this.census.clearCensus();
        this.powerManager.clearPowerStack();
        this.blockMaps.fireStationMap.clear();
        this.blockMaps.policeStationMap.clear();
    }

    init () {

        this.prevTime = -1;


        // Register actions
        this.powerManager.registerHandlers(this.mapScanner, this.repairManager);
        Commercial.registerHandlers(this.mapScanner, this.repairManager);
        EmergencyServices.registerHandlers(this.mapScanner, this.repairManager);
        Industrial.registerHandlers(this.mapScanner, this.repairManager);
        MiscTiles.registerHandlers(this.mapScanner, this.repairManager);
        Road.registerHandlers(this.mapScanner, this.repairManager);
        Residential.registerHandlers(this.mapScanner, this.repairManager);
        Stadia.registerHandlers(this.mapScanner, this.repairManager);
        Transport.registerHandlers(this.mapScanner, this.repairManager);

        
        this.evaluation.evalInit();
        this.valves.setValves(this.gameLevel, this.census, this.budget);
        this.clearCensus();
        //this.mapScanner.mapScan(0, this.map.width, simData);
        this.mapScanner.mapScan(0, this.map.width, null);
        this.powerManager.doPowerScan(this.census);
        
        MapUtils.pollutionTerrainLandValueScan(this.map, this.census, this.blockMaps);
        MapUtils.crimeScan(this.census, this.blockMaps);
        MapUtils.populationDensityScan(this.map, this.blockMaps);
        MapUtils.fireAnalysis(this.blockMaps);
        //this.census.totalPop = 1;

       // if (savedGame) this.load(savedGame);
    }

    simulate () {

        this.phaseCycle &= 15;

        let speedIndex = this.speed - 1;
        switch (this.phaseCycle){
            case 0:
                if (++this.simCycle > 1023) this.simCycle = 0;
                if (this.doInitialEval) { this.doInitialEval = false;  this.evaluation.cityEvaluation(); }
                this.cityTime++;
                if ((this.simCycle & 1) === 0) this.valves.setValves( this.gameLevel, this.census, this.budget );
                this.clearCensus();
            break;
            case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8:
                this.mapScanner.mapScan((this.phaseCycle - 1) * this.div, this.phaseCycle * this.div, null);
            break;
            case 9:
                if (this.cityTime % Micro.CENSUS_FREQUENCY_10 === 0) this.census.take10Census(this.budget);
                if (this.cityTime % Micro.CENSUS_FREQUENCY_120 === 0) this.census.take120Census(this.budget);
                if (this.cityTime % Micro.TAX_FREQUENCY === 0) { this.budget.collectTax( this.gameLevel, this.census ); this.evaluation.cityEvaluation(); };
            break;
            case 10: if ((this.simCycle % 5) === 0){ MapUtils.neutraliseRateOfGrowthMap(this.blockMaps);};  MapUtils.neutraliseTrafficMap(this.blockMaps); this.sendMessages(); break;
            case 11: if ((this.simCycle % Micro.speedPowerScan[speedIndex]) === 0) this.powerManager.doPowerScan(this.census); break;
            case 12: if ((this.simCycle % Micro.speedPollutionTerrainLandValueScan[speedIndex]) === 0) MapUtils.pollutionTerrainLandValueScan(this.map, this.census, this.blockMaps); break;
            case 13: if ((this.simCycle % Micro.speedCrimeScan[speedIndex]) === 0) MapUtils.crimeScan(this.census, this.blockMaps); break;
            case 14: if ((this.simCycle % Micro.speedPopulationDensityScan[speedIndex]) === 0) MapUtils.populationDensityScan(this.map, this.blockMaps); break;
            case 15: if ((this.simCycle % Micro.speedFireAnalysis[speedIndex]) === 0) MapUtils.fireAnalysis(this.blockMaps); this.disasterManager.doDisasters(this.census ); break;
        }
        // Go on the the next phase.
        this.phaseCycle = (this.phaseCycle + 1) & 15;
    }

    sendMessages () {

        this.checkGrowth();
        let totalZonePop = this.census.resZonePop + this.census.comZonePop + this.census.indZonePop;
        let powerPop = this.census.nuclearPowerPop + this.census.coalPowerPop;
        switch (this.cityTime & 63) {
            case 1: if (Math.floor(totalZonePop / 4) >= this.census.resZonePop) this.messageManager.sendMessage(Messages.NEED_MORE_RESIDENTIAL); break;
            case 5: if (Math.floor(totalZonePop / 8) >= this.census.comZonePop) this.messageManager.sendMessage(Messages.NEED_MORE_COMMERCIAL); break;
            case 10: if (Math.floor(totalZonePop / 8) >= this.census.indZonePop) this.messageManager.sendMessage(Messages.NEED_MORE_INDUSTRIAL); break;
            case 14: if (totalZonePop > 10 && totalZonePop * 2 > this.census.roadTotal) this.messageManager.sendMessage(Messages.NEED_MORE_ROADS); break;
            case 18: if (totalZonePop > 50 && totalZonePop > this.census.railTotal) this.messageManager.sendMessage(Messages.NEED_MORE_RAILS); break;
            case 22: if (totalZonePop > 10 && powerPop == 0) this.messageManager.sendMessage(Messages.NEED_ELECTRICITY); break;
            case 26: if (this.census.resPop > 500 && this.census.stadiumPop === 0) { this.messageManager.sendMessage(Messages.NEED_STADIUM); this.valves.resCap = true; } else { this.valves.resCap = false;}; break;
            case 28: if (this.census.indPop > 70 && this.census.seaportPop === 0) { this.messageManager.sendMessage(Messages.NEED_SEAPORT); this.valves.indCap = true; } else { this.valves.indCap = false; }; break;
            case 30: if (this.census.comPop > 100 && this.census.airportPop === 0) { this.messageManager.sendMessage(Messages._NEED_AIRPORT); this.valves.comCap = true; } else { this.valves.comCap = false; }; break;
            case 32: let zoneCount = this.census.unpoweredZoneCount + this.census.poweredZoneCount; if (zoneCount > 0) { if (this.census.poweredZoneCount / zoneCount < 0.7) this.messageManager.sendMessage(Messages.BLACKOUTS_REPORTED);}; break;
            case 35: if (this.census.pollutionAverage > 60) this.messageManager.sendMessage(Messages.HIGH_POLLUTION); break;
            case 42: if (this.census.crimeAverage > 100) this.messageManager.sendMessage(Messages.HIGH_CRIME); break;
            case 45: if (this.census.totalPop > 60 && this.census.fireStationPop === 0) this.messageManager.sendMessage(Messages.NEED_FIRE_STATION); break;
            case 48: if (this.census.totalPop > 60 && this.census.policeStationPop === 0) this.messageManager.sendMessage(Messages.NEED_POLICE_STATION); break;
            case 51: if (this.budget.cityTax > 12) this.messageManager.sendMessage(Messages.TAX_TOO_HIGH); break;
            case 54: if (this.budget.roadEffect < Math.floor(5 * this.budget.MAX_ROAD_EFFECT / 8) && this.census.roadTotal > 30) this.messageManager.sendMessage(Messages.ROAD_NEEDS_FUNDING); break;
            case 57: if (this.budget.fireEffect < Math.floor(7 * this.budget.MAX_FIRE_STATION_EFFECT / 10) && this.census.totalPop > 20) this.messageManager.sendMessage(Messages.FIRE_STATION_NEEDS_FUNDING); break;
            case 60: if (this.budget.policeEffect < Math.floor(7 * this.budget.MAX_POLICE_STATION_EFFECT / 10) && this.census.totalPop > 20) this.messageManager.sendMessage(Messages.POLICE_NEEDS_FUNDING); break;
            case 63: if (this.census.trafficAverage > 60) this.messageManager.sendMessage(Messages.TRAFFIC_JAMS, -1, -1, true); break;
        }
    }

    checkGrowth () {

        if ((this.cityTime & 3) !== 0) return;

        let message = '';
        let cityPop = this.evaluation.getPopulation(this.census);

        if ( cityPop !== this.cityPopLast ) {
            let lastClass = this.evaluation.getCityClass(this.cityPopLast);
            let newClass = this.evaluation.getCityClass(cityPop);
            if (lastClass !== newClass) {
                switch (newClass) {
                    case Micro.CC_VILLAGE:
                      // Don't mention it.
                    break;
                    case Micro.CC_TOWN: message = Messages.REACHED_TOWN; break;
                    case Micro.CC_CITY: message = Messages.REACHED_CITY; break;
                    case Micro.CC_CAPITAL: message = Messages.REACHED_CAPITAL; break;
                    case Micro.CC_METROPOLIS: message = Messages.REACHED_METROPOLIS; break;
                    case Micro.CC_MEGALOPOLIS: message = Messages.REACHED_MEGALOPOLIS; break;
                    default: break;
                }
            }
        }
        if (message !== '' && message !== this.messageLast) {
            this.messageManager.sendMessage(message);
            this.messageLast = message;
        }
        this.cityPopLast = cityPop;
    
    }

    // update date 

    setYear (year) {
        if (year < this.startingYear) year = this.startingYear;
        year = (year - this.startingYear) - (this.cityTime / 48);
        this.cityTime += year * 48;
        this.updateTime();
    }

    updateTime () {

        let megalinium = 1000000;
        let cityYear = Math.floor(this.cityTime / 48) + this.startingYear;
        let cityMonth = Math.floor(this.cityTime % 48) >> 2;

        if (cityYear >= megalinium) {
            this.setYear(this.startingYear);
            return;
        }

        if (this._cityYearLast !== cityYear || this._cityMonthLast !== cityMonth) {
            this._cityYearLast = cityYear;
            this._cityMonthLast = cityMonth;
            this.messageManager.sendMessage(Messages.DATE_UPDATED, {month: cityMonth, year: cityYear});
        }
    }

}