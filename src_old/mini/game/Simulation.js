/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
var Residential, Commercial, Industrial, Transport, Road, EmergencyServices, MiscTiles, Stadia;
Micro.savePropsVar = ['cityTime'];

Micro.Simulation = function(gameMap, gameLevel, speed, is3D, savedGame) {
    if (gameLevel !== Micro.LEVEL_EASY && gameLevel !== Micro.LEVEL_MED && gameLevel !== Micro.LEVEL_HARD) throw new Error('Invalid level!');
   // if (speed !== Micro.SPEED_PAUSED && speed !== Micro.SPEED_SLOW && speed !== Micro.SPEED_MED && speed !== Micro.SPEED_FAST) throw new Error('Invalid speed!');

    this.map = gameMap;
    this.gameLevel = gameLevel;

    this.div = this.map.width / 8;

    this.is3D = is3D || false;
    //this.needPower = [];

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

    // And now, the main cast of characters
    this.evaluation = new Micro.Evaluation(this.gameLevel, this);
    this.valves = new Micro.Valves();
    this.budget = new Micro.Budget();
    this.census = new Micro.Census();
    this.messageManager = new Micro.MessageManager();
    this.powerManager = new Micro.PowerManager(this.map, this);
    this.spriteManager = new Micro.SpriteManager(this.map, this);
    this.mapScanner = new Micro.MapScanner(this.map, this);
    this.repairManager = new Micro.RepairManager(this.map);
    this.traffic = new Micro.Traffic(this.map, this.spriteManager);
    this.disasterManager = new Micro.DisasterManager(this.map, this.spriteManager, this.gameLevel);

    this.blockMaps = {
        comRateMap: new Micro.BlockMap(this.map.width, this.map.height, 8, 0),
        crimeRateMap: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),
        fireStationMap: new Micro.BlockMap(this.map.width, this.map.height, 8, 0),
        fireStationEffectMap: new Micro.BlockMap(this.map.width, this.map.height, 8, 0),
        landValueMap: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),
        policeStationMap: new Micro.BlockMap(this.map.width, this.map.height, 8, 0),
        policeStationEffectMap: new Micro.BlockMap(this.map.width, this.map.height, 8, 0),
        pollutionDensityMap: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),
        populationDensityMap: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),
        rateOfGrowthMap: new Micro.BlockMap(this.map.width, this.map.height, 8, 0),

        terrainDensityMap: new Micro.BlockMap(this.map.width, this.map.height, 4, 0),
        trafficDensityMap: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),

        tempMap1: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),
        tempMap2: new Micro.BlockMap(this.map.width, this.map.height, 2, 0),
        tempMap3: new Micro.BlockMap(this.map.width, this.map.height, 4, 0)
        
    };

    this.clearCensus();

    if (savedGame) {
        this.load(savedGame);
        //this.cityPopLast = savedGame.totalPop;      
    } else {
        this.budget.setFunds(20000);
        this.census.totalPop = 1;
    }

    this.init();
}

Micro.Simulation.prototype = {
    constructor: Micro.Simulation,

    save : function(saveData) {
        for (var i = 0, l = Micro.savePropsVar.length; i < l; i++)
            saveData[Micro.savePropsVar[i]] = this[Micro.savePropsVar[i]];

        this.map.save(saveData);
        this.evaluation.save(saveData);
        this.valves.save(saveData);
        this.budget.save(saveData);
        this.census.save(saveData);
    },
    load : function(saveData) {
        //console.log(saveData)
        this.messageManager.clear();
        for (var i = 0, l = Micro.savePropsVar.length; i < l; i++)
            this[Micro.savePropsVar[i]] = saveData[Micro.savePropsVar[i]];

        //this.map.load(saveData);
        this.evaluation.load(saveData);
        this.valves.load(saveData, this.messageManager);
        this.budget.load(saveData, this.messageManager);
        this.census.load(saveData);
    },

    setSpeed : function(s) {
        if (s!== Micro.SPEED_PAUSED && s!== Micro.SPEED_SLOW && s!== Micro.SPEED_MED &&  s!== Micro.SPEED_FAST) throw new Error('Invalid speed!');
        this.speed = s;
    },
    setDifficulty: function(s) {
        if (s !== Micro.LEVEL_EASY && s !== Micro.LEVEL_MED && s !== Micro.LEVEL_HARD) throw new Error('Invalid level!');
        this.gameLevel = s;
        this.disasterManager.setDifficulty(this.gameLevel);
    },
    isPaused : function() {
        return this.speed === Micro.SPEED_PAUSED;
    },
    /*simTick : function() {
        this.simFrame();
        // Move sprite objects
        //this.spriteManager.moveObjects(this._constructSimData());
        this.updateFrontEnd();
        // TODO Graphs
        return this.messageManager.getMessages();
    },*/
    simFrame : function() {
        if (this.budget.awaitingValues) return;
        if (this.speed === 0) return;
        if (this.speed === 1 && (this.speedCycle % 5) !== 0) return;
        if (this.speed === 2 && (this.speedCycle % 3) !== 0) return;

        this.messageManager.clear();
        //var simData = this._constructSimData();
        //this.simulate(simData);
        this.simulate();
    },
    clearCensus : function() {
        this.census.clearCensus();
        this.powerManager.clearPowerStack();
        this.blockMaps.fireStationMap.clear();
        this.blockMaps.policeStationMap.clear();
    },
    init : function() {
        // define 
        Residential = new Micro.Residential(this);
        Commercial = new Micro.Commercial(this);
        Industrial = new Micro.Industrial(this);
        Road = new Micro.Road(this);
        Transport = new Micro.Transport(this);
        EmergencyServices = new Micro.EmergencyServices(this);
        MiscTiles = new Micro.MiscTiles(this);
        Stadia = new Micro.Stadia(this);

        // Register actions
        Commercial.registerHandlers(this.mapScanner, this.repairManager);
        EmergencyServices.registerHandlers(this.mapScanner, this.repairManager);
        Industrial.registerHandlers(this.mapScanner, this.repairManager);
        MiscTiles.registerHandlers(this.mapScanner, this.repairManager);
        this.powerManager.registerHandlers(this.mapScanner, this.repairManager);
        Road.registerHandlers(this.mapScanner, this.repairManager);
        Residential.registerHandlers(this.mapScanner, this.repairManager);
        Stadia.registerHandlers(this.mapScanner, this.repairManager);
        Transport.registerHandlers(this.mapScanner, this.repairManager);

        //this.budget.setFunds(20000);
        

        //var simData = this._constructSimData();
        this.evaluation.evalInit();
        this.valves.setValves(this.gameLevel, this.census, this.budget);
        this.clearCensus();
        //this.mapScanner.mapScan(0, this.map.width, simData);
        this.mapScanner.mapScan(0, this.map.width, null);
        this.powerManager.doPowerScan(this.census, this.messageManager);
        Micro.pollutionTerrainLandValueScan(this.map, this.census, this.blockMaps);
        Micro.crimeScan(this.census, this.blockMaps);
        Micro.populationDensityScan(this.map, this.blockMaps);
        Micro.fireAnalysis(this.blockMaps);
        //this.census.totalPop = 1;

       // if (savedGame) this.load(savedGame);
    },
    /*simulate : function() {
        var speedIndex = this.speed - 1;
           
        if (++this.simCycle > 1023) this.simCycle = 0;
        if (this.doInitialEval) { this.doInitialEval = false;  this.evaluation.cityEvaluation(); }
        this.cityTime++;
        if ((this.simCycle & 1) === 0) this.valves.setValves(this.gameLevel, this.census, this.budget);
        this.clearCensus();
       
        this.mapScanner.mapScan(0, this.map.width, null);
      
        if (this.cityTime % Micro.CENSUS_FREQUENCY_10 === 0){this.census.take10Census(this.budget);};
        if (this.cityTime % Micro.CENSUS_FREQUENCY_120 === 0) {this.census.take120Census(this.budget);}
        if (this.cityTime % Micro.TAX_FREQUENCY === 0)  { this.budget.collectTax(this.gameLevel, this.census, this.messageManager); this.evaluation.cityEvaluation(); };
       
        if ((this.simCycle % 5) === 0){ Micro.decRateOfGrowthMap(this.blockMaps);};  Micro.decTrafficMap(this.blockMaps); this.sendMessages();
        if ((this.simCycle % Micro.speedPowerScan[speedIndex]) === 0) this.powerManager.doPowerScan(this.census, this.messageManager);
        if ((this.simCycle % Micro.speedPollutionTerrainLandValueScan[speedIndex]) === 0) Micro.pollutionTerrainLandValueScan(this.map, this.census, this.blockMaps); 
        if ((this.simCycle % Micro.speedCrimeScan[speedIndex]) === 0) Micro.crimeScan(this.census, this.blockMaps);
        if ((this.simCycle % Micro.speedPopulationDensityScan[speedIndex]) === 0) Micro.populationDensityScan(this.map, this.blockMaps); 
        if ((this.simCycle % Micro.speedFireAnalysis[speedIndex]) === 0) Micro.fireAnalysis(this.blockMaps); this.disasterManager.doDisasters(this.census, this.messageManager); 
    },*/
    simulate : function() {
        this.phaseCycle &= 15;

        var speedIndex = this.speed - 1;
        switch (this.phaseCycle){
            case 0:
                //this.needPower = [];
                if (++this.simCycle > 1023) this.simCycle = 0;
                if (this.doInitialEval) { this.doInitialEval = false;  this.evaluation.cityEvaluation(); }
                this.cityTime++;
                if ((this.simCycle & 1) === 0) this.valves.setValves(this.gameLevel, this.census, this.budget);
                this.clearCensus();
            break;
            case 1: case 2: case 3: case 4: case 5: case 6: case 7: case 8:
                this.mapScanner.mapScan((this.phaseCycle - 1) * this.div, this.phaseCycle * this.div, null);
              //  this.mapScanner.mapScan((this.phaseCycle - 1) * this.map.width / 8, this.phaseCycle * this.map.width / 8, null);
            break;
            case 9:
                if (this.cityTime % Micro.CENSUS_FREQUENCY_10 === 0){this.census.take10Census(this.budget);};
                if (this.cityTime % Micro.CENSUS_FREQUENCY_120 === 0) {this.census.take120Census(this.budget);}
                if (this.cityTime % Micro.TAX_FREQUENCY === 0)  { this.budget.collectTax(this.gameLevel, this.census, this.messageManager); this.evaluation.cityEvaluation(); };
            break;
            case 10: if ((this.simCycle % 5) === 0){ Micro.decRateOfGrowthMap(this.blockMaps);};  Micro.decTrafficMap(this.blockMaps); this.sendMessages(); break;
            case 11: if ((this.simCycle % Micro.speedPowerScan[speedIndex]) === 0) this.powerManager.doPowerScan(this.census, this.messageManager); break;
            case 12: if ((this.simCycle % Micro.speedPollutionTerrainLandValueScan[speedIndex]) === 0) Micro.pollutionTerrainLandValueScan(this.map, this.census, this.blockMaps); break;
            case 13: if ((this.simCycle % Micro.speedCrimeScan[speedIndex]) === 0) Micro.crimeScan(this.census, this.blockMaps); break;
            case 14: if ((this.simCycle % Micro.speedPopulationDensityScan[speedIndex]) === 0) Micro.populationDensityScan(this.map, this.blockMaps); break;
            case 15: if ((this.simCycle % Micro.speedFireAnalysis[speedIndex]) === 0) Micro.fireAnalysis(this.blockMaps); this.disasterManager.doDisasters(this.census, this.messageManager); break;
        }
        // Go on the the next phase.
        this.phaseCycle = (this.phaseCycle + 1) & 15;
    },
    sendMessages : function() {
        this.checkGrowth();
        var totalZonePop = this.census.resZonePop + this.census.comZonePop + this.census.indZonePop;
        var powerPop = this.census.nuclearPowerPop + this.census.coalPowerPop;
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
            case 32: var zoneCount = this.census.unpoweredZoneCount + this.census.poweredZoneCount; if (zoneCount > 0) { if (this.census.poweredZoneCount / zoneCount < 0.7) this.messageManager.sendMessage(Messages.BLACKOUTS_REPORTED);}; break;
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
    },
    checkGrowth : function() {
        if ((this.cityTime & 3) === 0) {
            var message = '';
            var thisCityPop = this.evaluation.getPopulation(this.census);

            if (this.cityPopLast > 0) {
                var lastClass = this.evaluation.getCityClass(this.cityPopLast);
                var newClass = this.evaluation.getCityClass(thisCityPop);
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
            this.cityPopLast = thisCityPop;
        }
    },
    updateFrontEnd : function() {
        // Have valves changed?
        if (this.valves.changed) {
            this._resLast = this.valves.resValve;
            this._comLast = this.valves.comValve;
            this._indLast = this.valves.indValve;

            // Note: the valves changed the population
            this.messageManager.sendMessage(Messages.VALVES_UPDATED, {residential: this.valves.resValve, commercial: this.valves.comValve, industrial: this.valves.indValve});
            this.valves.changed = false;
        }
        this.updateTime();
        if (this.evaluation.changed) {
            this.messageManager.sendMessage(Messages.EVAL_UPDATED, {classification: this.evaluation.cityClass, population: this.evaluation.cityPop, score: this.evaluation.cityScore});
            this.evaluation.changed = false;
        }
    },
    setYear : function(year) {
        if (year < this.startingYear) year = this.startingYear;
        year = (year - this.startingYear) - (this.cityTime / 48);
        this.cityTime += year * 48;
        this.updateTime();
    },
    updateTime : function() {
        var megalinium = 1000000;
        var cityYear = Math.floor(this.cityTime / 48) + this.startingYear;
        var cityMonth = Math.floor(this.cityTime % 48) >> 2;

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