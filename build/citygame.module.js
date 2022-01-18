/**
 * @license
 * Copyright 2010-2022 3d.City.js Authors
 * SPDX-License-Identifier: MIT
 */
/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */



const Micro = {

    haveMapAnimation: true,

    localStorage : null,

    GameMapProps : ['cityCentreX', 'cityCentreY', 'pollutionMaxX', 'pollutionMaxY', 'width', 'height'],
    savePropsVar : ['cityTime'],
    CensusProps : ['resPop', 'comPop', 'indPop', 'crimeRamp', 'pollutionRamp', 'landValueAverage', 'pollutionAverage',
               'crimeAverage', 'totalPop', 'resHist10', 'resHist120', 'comHist10', 'comHist120', 'indHist10',
               'indHist120', 'crimeHist10', 'crimeHist120', 'moneyHist10', 'moneyHist120', 'pollutionHist10', 'pollutionHist120'
               ],
    BudgetProps : ['autoBudget', 'totalFunds', 'policePercent', 'roadPercent', 'firePercent', 'roadSpend',
                   'policeSpend', 'fireSpend', 'roadMaintenanceBudget', 'policeMaintenanceBudget',
                   'fireMaintenanceBudget', 'cityTax', 'roadEffect', 'policeEffect', 'fireEffect'
                   ],
    // eval
    PROBLEMS : ['CVP_CRIME', 'CVP_POLLUTION', 'CVP_HOUSING', 'CVP_TAXES', 'CVP_TRAFFIC', 'CVP_UNEMPLOYMENT', 'CVP_FIRE'],
    NUMPROBLEMS : 7,//this.PROBLEMS.length,
    NUM_COMPLAINTS : 4,
    problemData : [],
    EvalProps : ['cityClass', 'cityScore'],

    speedPowerScan : [2, 4, 5, 6],
    speedPollutionTerrainLandValueScan : [2, 7, 17, 30],
    speedCrimeScan : [1, 8, 18, 32],
    speedPopulationDensityScan : [1, 9, 19, 38],
    speedFireAnalysis : [1, 10, 20, 40],
    CENSUS_FREQUENCY_10 : 4,
    CENSUS_FREQUENCY_120 : 4*10,
    TAX_FREQUENCY : 48,

    MAP_WIDTH : 128,
    MAP_HEIGHT : 128,
    
    MAP_DEFAULT_WIDTH : 128*3, //Micro.MAP_WIDTH*3,
    MAP_DEFAULT_HEIGHT : 128*3, //Micro.MAP_HEIGHT*3,
    MAP_BIG_DEFAULT_WIDTH : 128*16, //Micro.MAP_WIDTH*16,
    MAP_BIG_DEFAULT_HEIGHT : 128*16, //Micro.MAP_HEIGHT*16,
    MAP_BIG_DEFAULT_ID : "bigMap",
    MAP_PARENT_ID : "splashContainer",
    MAP_DEFAULT_ID : "SplashCanvas",

    //GameCanvas
    DEFAULT_WIDTH : 400,
    DEFAULT_HEIGHT : 400,
    DEFAULT_ID : "MicropolisCanvas",
    RCI_DEFAULT_ID : "RCICanvas",

    // Simulation
    LEVEL_EASY : 0,
    LEVEL_MED : 1,
    LEVEL_HARD : 2,

    SPEED_PAUSED : 0,
    SPEED_SLOW : 1,
    SPEED_MED : 2,
    SPEED_FAST : 3,
    SPEED_ULTRA : 4,

    // Traffic
    ROUTE_FOUND : 1,
    NO_ROUTE_FOUND : 0,
    NO_ROAD_FOUND : -1,
    MAX_TRAFFIC_DISTANCE : 30,
    perimX : [-1, 0, 1, 2, 2, 2, 1, 0,-1,-2,-2,-2],
    perimY : [-2,-2,-2,-1, 0, 1, 2, 2, 2, 1, 0,-1],

    //SpriteConstants
    SPRITE_TRAIN : 1,
    SPRITE_HELICOPTER : 2,
    SPRITE_AIRPLANE : 3,
    SPRITE_SHIP : 4,
    SPRITE_MONSTER : 5,
    SPRITE_TORNADO : 6,
    SPRITE_EXPLOSION : 7,

    // Evaluation
    CC_VILLAGE : 'VILLAGE',
    CC_TOWN : 'TOWN',
    CC_CITY : 'CITY',
    CC_CAPITAL : 'CAPITAL',
    CC_METROPOLIS : 'METROPOLIS',
    CC_MEGALOPOLIS : 'MEGALOPOLIS',
    CRIME : 0,
    POLLUTION : 1,
    HOUSING : 2,
    TAXES : 3,
    TRAFFIC : 4,
    UNEMPLOYMENT : 5,
    FIRE : 6,

    // Valves
    RES_VALVE_RANGE : 2000,
    COM_VALVE_RANGE : 1500,
    IND_VALVE_RANGE : 1500,
    taxTable : [ 200, 150, 120, 100, 80, 50, 30, 0, -10, -40, -100, -150, -200, -250, -300, -350, -400, -450, -500, -550, -600],
    extMarketParamTable : [1.2, 1.1, 0.98],

    // Budget
    RLevels : [0.7, 0.9, 1.2],
    FLevels : [1.4, 1.2, 0.8],
    MAX_ROAD_EFFECT : 32,
    MAX_POLICESTATION_EFFECT : 1000,
    MAX_FIRESTATION_EFFECT : 1000,

    policeMaintenanceCost : 100,
    fireMaintenanceCost : 100,
    roadMaintenanceCost : 1,
    railMaintenanceCost : 2,

    // PowerManager
    COAL_POWER_STRENGTH : 700,
    NUCLEAR_POWER_STRENGTH : 2000,

    //DisasterWindow
    DISASTER_NONE:'None',
    DISASTER_MONSTER:'Monster',
    DISASTER_FIRE:'Fire',
    DISASTER_FLOOD:'Flood',
    DISASTER_CRASH:'Crash',
    DISASTER_MELTDOWN:'Meltdown',
    DISASTER_TORNADO:'Tornado',

    // storage
    CURRENT_VERSION : 3,
    KEY : 'micropolisJSGame',

    // disasters
    DisChance: [479, 239, 59],

    // map generator
    TERRAIN_CREATE_ISLAND : 0,
    TERRAIN_TREE_LEVEL : -1,//level for tree creation
    TERRAIN_LAKE_LEVEL : -1, //level for river curviness; -1==auto, 0==none, >0==level
    TERRAIN_CURVE_LEVEL : -1,//level for lake creation; -1==auto, 0==none, >0==level
    ISLAND_RADIUS : 18,


    M_ARRAY_TYPE: ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array,

    // census
    arrs: ['res', 'com', 'ind', 'crime', 'money', 'pollution'],

    directionTable : [0, 3, 2, 1, 3, 4, 5, 7, 6, 5, 7, 8, 1],

    SMOOTH_NEIGHBOURS_THEN_BLOCK: 0,
    SMOOTH_ALL_THEN_CLAMP : 1,

    simData:null,
    messageManager:null,

};

class EventEmitter {

    static emitEvent ( event, value ) {

        // ???
        Micro.messageManager.sendMessage( event, value );
        
    }

}
//var M_ARRAY_TYPE;
//if(!M_ARRAY_TYPE) { M_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array; }


class MiscUtils {

    /**/

    //static makeConstantDescriptor = function(value) {
    static mcd (value) {
        return {configurable: false, enumerable: false, writeable: false, value: value};
    }

    static rotate10Arrays () {
        for (var i = 0; i < Micro.arrs.length; i++) {
            var name10 = Micro.arrs[i] + 'Hist10';
            //this[name10] = [0].concat(this[name10].slice(0, -1));
            this[name10].pop();
            this[name10].unshift(0);
        }
    }

    static rotate120Arrays () {
        for (var i = 0; i < Micro.arrs.length; i++) {
            var name120 = Micro.arrs[i] + 'Hist120';
            //this[name120] = [0].concat(this[name120].slice(0, -1));
            this[name120].pop();
            this[name120].unshift(0);
        }
    }

    static isCallable ( f ) {
        return typeof(f) === 'function';
    }

    static copyFrom (data, sourceMap, sourceFn) {
        var mapFn = function(elem) { return sourceFn(elem); };
        var i = sourceMap.data.length; 
        while(i--) data[i] = sourceMap.data[i].map(mapFn);
    }

    static makeArrayOf (length, value) {
        //var result = [];
        //var result = new M_ARRAY_TYPE(length);
        var result = new Array(length);
       //for (var a = 0; a < length; a++) result[a] = value;
        var i = length; while(i--) result[i] = value;
        return result;

    }


}

class math {

    static lerp ( x, y, t ) { return ( 1 - t ) * x + t * y; }
    static rand ( low, high ) { return low + Math.random() * ( high - low ); }
    static randInt ( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }

    static clamp (value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    static getChance (chance) {
        return (math.getRandom16() & chance) === 0;
    }

    static getERandom ( max ) {
        var r1 = math.getRandom(max);
        var r2 = math.getRandom(max);
        return Math.min(r1, r2);
    }

    static getRandom ( max ) {
        return Math.floor(Math.random() * (max + 1));
    }

    static getRandom16 () {
        return math.getRandom(65535);
    }

    static getRandom16Signed () {
        var value = math.getRandom16();
        if (value < 32768)  return value;
        else return -(2 ** 16) + value;
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


class ZoneUtils {

    // TileUtils

    static pixToWorld (p) {
        return p >> 4;
    }

    static worldToPix (w) {
        return w << 4;
    }

    static unwrapTile ( tile ) {

        if ( tile.isTile ) return tile = tile.getValue();
        return tile
    }

    static canBulldoze (tile) { 

        tile = ZoneUtils.unwrapTile( tile );
        return (tile >= Tile.FIRSTRIVEDGE  && tile <= Tile.LASTRUBBLE) ||
               (tile >= Tile.POWERBASE + 2 && tile <= Tile.POWERBASE + 12) ||
               (tile >= Tile.TINYEXP       && tile <= Tile.LASTTINYEXP + 2);
    }

    static isCommercial (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.COMBASE && tile < Tile.INDBASE;
    }

    static isIndustrial (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.INDBASE && tile < Tile.PORTBASE;
    }

    static isResidential (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.RESBASE && tile < Tile.HOSPITALBASE;
    }

    static isDriveable (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return (tile >= Tile.ROADBASE && tile <= Tile.LASTRAIL) || tile === Tile.RAILHPOWERV || tile === Tile.RAILVPOWERH;
    }

    static isFire (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.FIREBASE && tile < Tile.ROADBASE;
    }

    static isFlood (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.FLOOD && tile < Tile.LASTFLOOD;
    }

    static isManualExplosion (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP;
    }

    static isRail (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.RAILBASE && tile < Tile.RESBASE;
    }

    static isRoad (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return tile >= Tile.ROADBASE && tile < Tile.POWERBASE;
    }

    static normalizeRoad (tile) {
        tile = ZoneUtils.unwrapTile( tile );
        return (tile >= Tile.ROADBASE && tile <= Tile.LASTROAD + 1) ? (tile & 15) + 64 : tile;
    }

    ///

    static isCommercialZone (tile) {
        return tile.isZone() && ZoneUtils.isCommercial(tile)
    }

    static isIndustrialZone (tile) {
        return tile.isZone() && ZoneUtils.isIndustrial(tile)
    }

    static isResidentialZone (tile) {
        return tile.isZone() && ZoneUtils.isResidential(tile)
    }

    static randomFire (tile) {
        return new Tiles(Tile.FIRE + (math.getRandom16() & 3), Tile.ANIMBIT);
    }

    static randomRubble ( tile ) {
        return new Tiles(Tile.RUBBLE + (math.getRandom16() & 3), Tile.BULLBIT);
    }

    static HOSPITAL (tile) {
    }

    // ZoneUtils

    static checkBigZone = function(tile) {

        let result;
        switch (tile) {
            case Tile.POWERPLANT:
            case Tile.PORT:
            case Tile.NUCLEAR:
            case Tile.STADIUM:
                result = {zoneSize: 4, deltaX: 0, deltaY: 0};
            break;

            case Tile.POWERPLANT + 1:
            case Tile.COALSMOKE3:
            case Tile.COALSMOKE3 + 1:
            case Tile.COALSMOKE3 + 2:
            case Tile.PORT + 1:
            case Tile.NUCLEAR + 1:
            case Tile.STADIUM + 1:
                result = {zoneSize: 4, deltaX: -1, deltaY: 0};
            break;

            case Tile.POWERPLANT + 4:
            case Tile.PORT + 4:
            case Tile.NUCLEAR + 4:
            case Tile.STADIUM + 4:
                result = {zoneSize: 4, deltaX: 0, deltaY: -1};
            break;

            case Tile.POWERPLANT + 5:
            case Tile.PORT + 5:
            case Tile.NUCLEAR + 5:
            case Tile.STADIUM + 5:
                result = {zoneSize: 4, deltaX: -1, deltaY: -1};
            break;
            case Tile.AIRPORT: result = {zoneSize: 6, deltaX: 0, deltaY: 0}; break;
            case Tile.AIRPORT + 1: result = {zoneSize: 6, deltaX: -1, deltaY: 0}; break;
            case Tile.AIRPORT + 2: result = {zoneSize: 6, deltaX: -2, deltaY: 0}; break;
            case Tile.AIRPORT + 3: result = {zoneSize: 6, deltaX: -3, deltaY: 0}; break;
            case Tile.AIRPORT + 6: result = {zoneSize: 6, deltaX: 0, deltaY: -1}; break;
            case Tile.AIRPORT + 7: result = {zoneSize: 6, deltaX: -1, deltaY: -1}; break;
            case Tile.AIRPORT + 8: result = {zoneSize: 6, deltaX: -2, deltaY: -1}; break;
            case Tile.AIRPORT + 9: result = {zoneSize: 6, deltaX: -3, deltaY: -1}; break;
            case Tile.AIRPORT + 12: result = {zoneSize: 6, deltaX: 0, deltaY: -2}; break;
            case Tile.AIRPORT + 13: result = {zoneSize: 6, deltaX: -1, deltaY: -2}; break;
            case Tile.AIRPORT + 14: result = {zoneSize: 6, deltaX: -2, deltaY: -2}; break;
            case Tile.AIRPORT + 15: result = {zoneSize: 6, deltaX: -3, deltaY: -2}; break;
            case Tile.AIRPORT + 18: result = {zoneSize: 6, deltaX: 0, deltaY: -3}; break;
            case Tile.AIRPORT + 19: result = {zoneSize: 6, deltaX: -1, deltaY: -3}; break;
            case Tile.AIRPORT + 20: result = {zoneSize: 6, deltaX: -2, deltaY: -3}; break;
            case Tile.AIRPORT + 21: result = {zoneSize: 6, deltaX: -3, deltaY: -3}; break;
            default: result = {zoneSize: 0, deltaX: 0, deltaY: 0}; break;
        }
        return result;
    }


    static checkZoneSize (tile) {
        if ((tile >= Tile.RESBASE - 1        && tile <= Tile.PORTBASE - 1) ||
            (tile >= Tile.LASTPOWERPLANT + 1 && tile <= Tile.POLICESTATION + 4) ||
            (tile >= Tile.CHURCH1BASE && tile <= Tile.CHURCH7LAST)) {
            return 3;
        }

        if ((tile >= Tile.PORTBASE    && tile <= Tile.LASTPORT) ||
            (tile >= Tile.COALBASE    && tile <= Tile.LASTPOWERPLANT) ||
            (tile >= Tile.STADIUMBASE && tile <= Tile.LASTZONE)) {
            return 4;
        }
        return 0;
    }

    static fireZone ( map, x, y, blockMaps ) {

        let tileValue = map.getTileValue(x, y);
        let zoneSize = 2;

        // A zone being on fire naturally hurts growth
        let value = blockMaps.rateOfGrowthMap.worldGet(x, y);
        value = math.clamp(value - 20, -200, 200);
        blockMaps.rateOfGrowthMap.worldSet(x, y, value);

        if (tileValue === Tile.AIRPORT) zoneSize = 5;
        else if (tileValue >= Tile.PORTBASE) zoneSize = 3;
        else if (tileValue < Tile.PORTBASE) zoneSize = 2;

        // Make remaining tiles of the zone bulldozable
        let xDelta, yDelta, xTem, yTem;
        for ( xDelta = -1; xDelta < zoneSize; xDelta++) {
            for ( yDelta = -1; yDelta < zoneSize; yDelta++) {
                xTem = x + xDelta;
                yTem = y + yDelta;
                if (!map.testBounds(xTem, yTem)) continue;
                if (map.getTileValue(xTem, yTem >= Tile.ROADBASE)) map.addTileFlags(xTem, yTem, Tile.BULLBIT);
            }
        }

    }

    static getLandPollutionValue ( blockMaps, x, y ) {

        let landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
        if (landValue < 30) return 0;
        if (landValue < 80) return 1;
        if (landValue < 150) return 2;
        return 3;

    }

    static incRateOfGrowth ( blockMaps, x, y, growthDelta ) {

        let currentRate = blockMaps.rateOfGrowthMap.worldGet(x, y);
        // TODO why the scale of 4 here
        let newValue = math.clamp( currentRate + growthDelta * 4, -200, 200 );
        blockMaps.rateOfGrowthMap.worldSet(x, y, newValue);
        
    }

    // Calls map.putZone after first checking for flood, fire and radiation
    static putZone ( map, x, y, centreTile, isPowered ) {

        let dY, dX, tileValue;
        for ( dY = -1; dY < 2; dY++) {
            for ( dX = -1; dX < 2; dX++) {
                tileValue = map.getTileValue(x + dX, y + dY);
                if (tileValue >= Tile.FLOOD && tileValue < Tile.ROADBASE) return;
            }
        }
        map.putZone(x, y, centreTile, 3);
        map.addTileFlags(x, y, Tile.BULLBIT);
        if (isPowered) map.addTileFlags(x, y, Tile.POWERBIT);
        
    }

}

//export const ZoneUtils = ZoneUtils

class Tiles {

    constructor ( tileValue = Tile.DIRT, bitMask ) {

        this.isTile = true;

        /*
        if (!(this.isTile)) return new Tiles();
        if (arguments.length > 0 && typeof(tileValue) !== 'number') throw new Error('Tile constructor called with invalid tileValue ' + tileValue);
        if (arguments.length > 1 && typeof(bitMask) !== 'number') throw new Error('Tile constructor called with invalid bitMask ' + bitMask);
        if (arguments.length > 1 && (tileValue < Tile.TILE_INVALID || tileValue >= Tile.TILE_COUNT)) throw new Error('Tile constructor called with out-of-range tileValue ' + tileValue);
        if (arguments.length > 1 && (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)))  throw new Error('Tile constructor called with out-of-range bitmask ' + bitMask);
        */

        this._value = tileValue;
        if (arguments.length > 1) this._value |= bitMask;

    }

    getValue () {
        return this._value & Tile.BIT_MASK;
    }

    setValue ( tileValue ) {
        if ( arguments.length === 0 || typeof(tileValue) !== 'number' || tileValue < 0) throw new Error('Invalid parameter');

        let existingFlags = 0;
        if ( tileValue < Tile.BIT_START ) existingFlags = this._value & Tile.ALLBITS;//this.getFlags();
        this._value = tileValue | existingFlags;
    }

    isBulldozable () {
        return (this._value & Tile.BULLBIT) > 0;
    }

    isAnimated () {
        return (this._value & Tile.ANIMBIT) > 0;
    }

    isConductive () {
        return (this._value & Tile.CONDBIT) > 0;
    }

    isCombustible () {
        return (this._value & Tile.BURNBIT) > 0;
    }

    isPowered () {
        return (this._value & Tile.POWERBIT) > 0;
    }

    isZone () {
        return (this._value & Tile.ZONEBIT) > 0;
    }

    addFlags (bitMask) {
        if (!arguments.length || typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= Tile.BIT_END << 1) throw new Error('Invalid parameter');
        this._value |= bitMask;
    }

    removeFlags (bitMask) {
        if (!arguments.length || typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= Tile.BIT_END << 1) throw new Error('Invalid parameter');
        this._value &= ~bitMask;
    }

    setFlags (bitMask) {
        //if (typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)) throw new Error('Invalid parameter');
        //if (arguments.length === 0) throw new Error('Tile setFlags called with no arguments');
        //if (typeof(bitMask) !== 'number') throw new Error('Tile setFlags called with invalid bitmask ' + bitMask);
       // if (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)) throw new Error('Tile setFlags called with out-of-range bitmask ' + bitMask);
        let existingValue = this._value & ~Tile.ALLBITS;
        this._value = existingValue | bitMask;
    }

    getFlags () {
        return this._value & Tile.ALLBITS;
    }

    getRawValue () {
        return this._value;
    }

    set ( tileValue, bitMask ) {
        if (arguments.length < 2 || typeof(tileValue) !== 'number' || typeof(bitMask) !== 'number' || tileValue >= Tile.TILE_COUNT) throw new Error('Invalid parameter');
        this.setValue(tileValue);
        this.setFlags(bitMask);
    }

    toString () {
        let value = this.getValue();
        let s = 'Tile# ' + value;
        s += this.isCombustible() ? ' burning' : '';
        s += this.isPowered() ? ' powered' : '';
        s += this.isAnimated() ? ' animated' : '';
        s += this.isConductive() ? ' conductive' : '';
        s += this.isZone() ? ' zone' : '';
        s += this.isBulldozable() ? ' bulldozeable' : '';
        return s;
    }

}



const Tile = {

    // Bit-masks for statusBits
    POWERBIT  : 0x8000, // bit 15, tile has power.
    CONDBIT : 0x4000, // bit 14. tile can conduct electricity.
    BURNBIT : 0x2000, // bit 13, tile can be lit.
    BULLBIT : 0x1000, // bit 12, tile is bulldozable.
    ANIMBIT : 0x0800, // bit 11, tile is animated.
    ZONEBIT : 0x0400, // bit 10, tile is the center tile of the zone.
    BLBNBIT   : 0x1000 | 0x2000, //BULLBIT | BURNBIT,
    BLBNCNBIT : 0x1000 | 0x2000 | 0x4000, //BULLBIT | BURNBIT | CONDBIT,
    BNCNBIT   : 0x2000 | 0x4000, //BURNBIT | CONDBIT,
    ASCBIT   : 0x0800 | 0x4000 | 0x2000, // ANIMBIT | CONDBIT | BURNBIT,
    ALLBITS : 0x8000 | 0x4000 | 0x2000 | 0x1000 | 0x0800 | 0x0400, // POWERBIT | CONDBIT | BURNBIT | BULLBIT | ANIMBIT | ZONEBIT,
    BIT_START : 0x400,
    BIT_END : 0x8000,
    BIT_MASK : 0x400 - 1, // BIT_START - 1,

    // TODO Add comment for each tile
    DIRT           : 0, // Clear tile
    // tile 1 ?

    /* Water */
    RIVER          : 2,
    REDGE          : 3,
    CHANNEL        : 4,
    FIRSTRIVEDGE   : 5,
    // tile 6 -- 19 ?
    LASTRIVEDGE    : 20,
    WATER_LOW      : 2, //RIVER,   // First water tile
    WATER_HIGH     : 20, //LASTRIVEDGE, // Last water tile (inclusive)

    TREEBASE       : 21,
    WOODS_LOW      : 21, //TREEBASE,
    LASTTREE       : 36,
    WOODS          : 37,
    UNUSED_TRASH1  : 38,
    UNUSED_TRASH2  : 39,
    WOODS_HIGH     : 39, //UNUSED_TRASH2, // Why is an 'UNUSED' tile used?
    WOODS2         : 40,
    WOODS3         : 41,
    WOODS4         : 42,
    WOODS5         : 43,

    // Rubble (4 tiles)
    RUBBLE         : 44,
    LASTRUBBLE     : 47,
    // fLOOD 4 tiles
    FLOOD          : 48,
    LASTFLOOD      : 51,
    // Radiation
    RADTILE        : 52, // Radio-active contaminated tile

    UNUSED_TRASH3  : 53,
    UNUSED_TRASH4  : 54,
    UNUSED_TRASH5  : 55,

    /* Fire animation (8 tiles) */
    FIRE           : 56-8,
    FIREBASE       : 56-8, //FIRE,
    LASTFIRE       : 63-8,

    HBRIDGE        : 64, // Horizontal bridge
    ROADBASE       : 64, // HBRIDGE,
    VBRIDGE        : 65, // Vertical bridge
    ROADS          : 66,
    ROADS2         : 67,
    ROADS3         : 68,
    ROADS4         : 69,
    ROADS5         : 70,
    ROADS6         : 71,
    ROADS7         : 72,
    ROADS8         : 73,
    ROADS9         : 74,
    ROADS10        : 75,
    INTERSECTION   : 76,
    HROADPOWER     : 77,
    VROADPOWER     : 78,
    BRWH           : 79,
    LTRFBASE       : 80, // First tile with low traffic
    // tile 81 -- 94 ?
    BRWV           : 95,
    // tile 96 -- 110 ?
    BRWXXX1        : 111,
    // tile 96 -- 110 ?
    BRWXXX2        : 127,
    // tile 96 -- 110 ?
    BRWXXX3        : 143,
    HTRFBASE       : 144, // First tile with high traffic
    // tile 145 -- 158 ?
    BRWXXX4        : 159,
    // tile 160 -- 174 ?
    BRWXXX5        : 175,
    // tile 176 -- 190 ?
    BRWXXX6        : 191,
    // tile 192 -- 205 ?
    LASTROAD       : 206,
    BRWXXX7        : 207,

    /* Power lines */
    HPOWER         : 208,
    VPOWER         : 209,
    LHPOWER        : 210,
    LVPOWER        : 211,
    LVPOWER2       : 212,
    LVPOWER3       : 213,
    LVPOWER4       : 214,
    LVPOWER5       : 215,
    LVPOWER6       : 216,
    LVPOWER7       : 217,
    LVPOWER8       : 218,
    LVPOWER9       : 219,
    LVPOWER10      : 220,
    RAILHPOWERV    : 221, // Horizontal rail, vertical power
    RAILVPOWERH    : 222, // Vertical rail, horizontal power
    POWERBASE      : 208, //HPOWER,
    LASTPOWER      : 222, //RAILVPOWERH,

    UNUSED_TRASH6  : 223,

    /* Rail */
    HRAIL          : 224,
    VRAIL          : 225,
    LHRAIL         : 226,
    LVRAIL         : 227,
    LVRAIL2        : 228,
    LVRAIL3        : 229,
    LVRAIL4        : 230,
    LVRAIL5        : 231,
    LVRAIL6        : 232,
    LVRAIL7        : 233,
    LVRAIL8        : 234,
    LVRAIL9        : 235,
    LVRAIL10       : 236,
    HRAILROAD      : 237,
    VRAILROAD      : 238,
    RAILBASE       : 224, //HRAIL,
    LASTRAIL       : 238,

    ROADVPOWERH    : 239, /* bogus? */

    // Residential zone tiles

    RESBASE        : 240, // Empty residential, tiles 240--248
    FREEZ          : 244, // center-tile of 3x3 empty residential

    HOUSE          : 249, // Single tile houses until 260
    LHTHR          : 249,//HOUSE,
    HHTHR          : 260,

    RZB            : 265, // center tile first 3x3 tile residential

    HOSPITALBASE   : 405, // Center of hospital (tiles 405--413)
    HOSPITAL       : 409, // Center of hospital (tiles 405--413)

    CHURCHBASE     : 414, // Center of church (tiles 414--422)
    CHURCH0BASE    : 414, // numbered alias
    CHURCH         : 418, // Center of church (tiles 414--422)
    CHURCH0        : 418, // numbered alias

    // Commercial zone tiles

    COMBASE        : 423, // Empty commercial, tiles 423--431
    // tile 424 -- 426 ?
    COMCLR         : 427,
    // tile 428 -- 435 ?
    CZB            : 436,
    // tile 437 -- 608 ?
    COMLAST        : 609,
    // tile 610, 611 ?

    // Industrial zone tiles.
    INDBASE        : 612, // Top-left tile of empty industrial zone.
    INDCLR         : 616, // Center tile of empty industrial zone.
    LASTIND        : 620, // Last tile of empty industrial zone.

    // Industrial zone population 0, value 0: 621 -- 629
    IND1           : 621, // Top-left tile of first non-empty industry zone.
    IZB            : 625, // Center tile of first non-empty industry zone.

    // Industrial zone population 1, value 0: 630 -- 638

    // Industrial zone population 2, value 0: 639 -- 647
    IND2           : 641,
    IND3           : 644,

    // Industrial zone population 3, value 0: 648 -- 656
    IND4           : 649,
    IND5           : 650,

    // Industrial zone population 0, value 1: 657 -- 665

    // Industrial zone population 1, value 1: 666 -- 674

    // Industrial zone population 2, value 1: 675 -- 683
    IND6           : 676,
    IND7           : 677,

    // Industrial zone population 3, value 1: 684 -- 692
    IND8           : 686,
    IND9           : 689,

    // Seaport
    PORTBASE       : 693, // Top-left tile of the seaport.
    PORT           : 698, // Center tile of the seaport.
    LASTPORT       : 708, // Last tile of the seaport.

    AIRPORTBASE    : 709,
    // tile 710 ?
    RADAR          : 711,
    // tile 712 -- 715 ?
    AIRPORT        : 716,
    // tile 717 -- 744 ?

    // Coal power plant (4x4).
    COALBASE       : 745, // First tile of coal power plant.
    POWERPLANT     : 750, // 'Center' tile of coal power plant.
    LASTPOWERPLANT : 760, // Last tile of coal power plant.

    // Fire station (3x3).
    FIRESTBASE     : 761, // First tile of fire station.
    FIRESTATION    : 765, // 'Center tile' of fire station.
    // 769 last tile fire station.

    POLICESTBASE   : 770,
    // tile 771 -- 773 ?
    POLICESTATION  : 774,
    // tile 775 -- 778 ?

    // Stadium (4x4).
    STADIUMBASE    : 779, // First tile stadium.
    STADIUM        : 784, // 'Center tile' stadium.
    // Last tile stadium 794.

    // tile 785 -- 799 ?
    FULLSTADIUM    : 800,
    // tile 801 -- 810 ?

    // Nuclear power plant (4x4).
    NUCLEARBASE    : 811, // First tile nuclear power plant.
    NUCLEAR        : 816, // 'Center' tile nuclear power plant.
    LASTZONE       : 826, // Also last tile nuclear power plant.

    LIGHTNINGBOLT  : 827,

     // bridge horisontal open close
    HBRDG0         : 828,
    HBRDG1         : 829,
    HBRDG2         : 830,
    HBRDG3         : 831,
    //HBRDG_END      : 832,

    RADAR0         : 832,
    RADAR1         : 833,
    RADAR2         : 834,
    RADAR3         : 835,
    RADAR4         : 836,
    RADAR5         : 837,
    RADAR6         : 838,
    RADAR7         : 839,
    FOUNTAIN       : 840,
    // tile 841 -- 843: fountain animation.
    INDBASE2       : 844,
    TELEBASE       : 844,
    // tile 845 -- 850 ?
    TELELAST       : 851,
    SMOKEBASE      : 852,
    // tile 853 -- 859 ?
    TINYEXP        : 860,
    // tile 861 -- 863 ?
    SOMETINYEXP    : 864,
    // tile 865 -- 866 ?
    LASTTINYEXP    : 867,
    // tile 868 -- 882 ?
    TINYEXPLAST    : 883,
    // tile 884 -- 915 ?

    COALSMOKE1     : 916, // Chimney animation at coal power plant (2, 0).
    // 919 last animation tile for chimney at coal power plant (2, 0).

    COALSMOKE2     : 920, // Chimney animation at coal power plant (3, 0).
    // 923 last animation tile for chimney at coal power plant (3, 0).

    COALSMOKE3     : 924, // Chimney animation at coal power plant (2, 1).
    // 927 last animation tile for chimney at coal power plant (2, 1).

    COALSMOKE4     : 928, // Chimney animation at coal power plant (3, 1).
    // 931 last animation tile for chimney at coal power plant (3, 1).

    FOOTBALLGAME1  : 932,
    // tile 933 -- 939 ?
    FOOTBALLGAME2  : 940,
    // tile 941 -- 94 bridge open close
    VBRDG0         : 948,
    VBRDG1         : 949,
    VBRDG2         : 950,
    VBRDG3         : 951,
    // nuclear animation // disable
    NUKESWIRL1     : 952,
    NUKESWIRL2     : 953,
    NUKESWIRL3     : 954,
    NUKESWIRL4     : 955,

    // Tiles 956-959 unused (originally)
    // TILE_COUNT     : 960,

    // Extended zones: 956-1019
    CHURCH1BASE    : 956,
    CHURCH1        : 960,
    CHURCH2BASE    : 965,
    CHURCH2        : 969,
    CHURCH3BASE    : 974,
    CHURCH3        : 978,
    CHURCH4BASE    : 983,
    CHURCH4        : 987,
    CHURCH5BASE    : 992,
    CHURCH5        : 996,
    CHURCH6BASE    : 1001,
    CHURCH6        : 1005,
    CHURCH7BASE    : 1010,
    CHURCH7        : 1014,
    CHURCH7LAST    : 1018,

    // Tiles 1020-1023 unused
    TILE_COUNT     : 1024,
    TILE_INVALID   : -1, // Invalid tile (not used in the world map).
    MIN_SIZE : 16, // Minimum size of tile in pixels
};

const RoadTable = [
    Tile.ROADS, Tile.ROADS2, Tile.ROADS, Tile.ROADS3,
    Tile.ROADS2, Tile.ROADS2, Tile.ROADS4, Tile.ROADS8,
    Tile.ROADS, Tile.ROADS6, Tile.ROADS, Tile.ROADS7,
    Tile.ROADS5, Tile.ROADS10, Tile.ROADS9, Tile.INTERSECTION
];

const RailTable = [
    Tile.LHRAIL, Tile.LVRAIL, Tile.LHRAIL, Tile.LVRAIL2,
    Tile.LVRAIL, Tile.LVRAIL, Tile.LVRAIL3, Tile.LVRAIL7,
    Tile.LHRAIL, Tile.LVRAIL5, Tile.LHRAIL, Tile.LVRAIL6,
    Tile.LVRAIL4, Tile.LVRAIL9, Tile.LVRAIL8, Tile.LVRAIL10
];

const WireTable = [
    Tile.LHPOWER, Tile.LVPOWER, Tile.LHPOWER, Tile.LVPOWER2,
    Tile.LVPOWER, Tile.LVPOWER, Tile.LVPOWER3, Tile.LVPOWER7,
    Tile.LHPOWER, Tile.LVPOWER5, Tile.LHPOWER, Tile.LVPOWER6,
    Tile.LVPOWER4, Tile.LVPOWER9, Tile.LVPOWER8, Tile.LVPOWER10
];

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */



class MessageManager {

    constructor () {
        this.data = [];
    }

    sendMessage (message, data) {
        this.data.push({message: message, data: data});
    }
    
    clear () {
        this.data = [];
    }

    getMessages () {
        return this.data.slice();
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

var messageData = {
  AUTOBUDGET_CHANGED: MiscUtils.mcd('Autobudget changed'),
  BUDGET_NEEDED: MiscUtils.mcd('User needs to budget'),
  BUDGET_REQUESTED: MiscUtils.mcd('Budget window requested'),
  BUDGET_WINDOW_CLOSED: MiscUtils.mcd('Budget window closed'),
  BLACKOUTS_REPORTED: MiscUtils.mcd('Blackouts reported'),
  CLASSIFICATION_UPDATED: MiscUtils.mcd('Classification updated'),
  CONGRATS_SHOWING: MiscUtils.mcd('Congratulations showing'),
  CONGRATS_WINDOW_CLOSED: MiscUtils.mcd('Congratulations window closed'),
  DATE_UPDATED: MiscUtils.mcd('Date changed'),
  DEBUG_WINDOW_REQUESTED: MiscUtils.mcd('Debug Window Requested'),
  DEBUG_WINDOW_CLOSED: MiscUtils.mcd('Debug Window Closed'),
  DISASTER_REQUESTED: MiscUtils.mcd('Disaster Requested'),
  DISASTER_WINDOW_CLOSED: MiscUtils.mcd('Disaster window closed'),
  EARTHQUAKE: MiscUtils.mcd('Earthquake'),
  EVAL_REQUESTED: MiscUtils.mcd('Evaluation Requested'),
  EVAL_UPDATED: MiscUtils.mcd('Evaluation Updated'),
  EVAL_WINDOW_CLOSED: MiscUtils.mcd('Eval window closed'),
  EXPLOSION_REPORTED: MiscUtils.mcd('Explosion Reported'),
  FIRE_REPORTED: MiscUtils.mcd('Fire!'),
  FIRE_STATION_NEEDS_FUNDING: MiscUtils.mcd('Fire station needs funding'),
  FLOODING_REPORTED: MiscUtils.mcd('Flooding reported'),
  FRONT_END_MESSAGE: MiscUtils.mcd('Front-end Message'),
  FUNDS_CHANGED: MiscUtils.mcd('Total funds has changed'),
  HEAVY_TRAFFIC: MiscUtils.mcd('Heavy traffic in city'),
  HELICOPTER_CRASHED: MiscUtils.mcd('Helicopter crashed'),
  HIGH_CRIME: MiscUtils.mcd('High crime'),
  HIGH_POLLUTION: MiscUtils.mcd('High pollution'),
  MONSTER_SIGHTED: MiscUtils.mcd('Monster sighted'),
  NAG_WINDOW_CLOSED: MiscUtils.mcd('Nag window closed'),
  NEED_AIRPORT: MiscUtils.mcd('Airport needed'),
  NEED_ELECTRICITY: MiscUtils.mcd('More power needed'),
  NEED_FIRE_STATION: MiscUtils.mcd('Fire station needed'),
  NEED_MORE_COMMERCIAL: MiscUtils.mcd('More commercial zones needed'),
  NEED_MORE_INDUSTRIAL: MiscUtils.mcd('More industrial zones needed'),
  NEED_MORE_RAILS: MiscUtils.mcd('More railways needed'),
  NEED_MORE_RESIDENTIAL: MiscUtils.mcd('More residential needed'),
  NEED_MORE_ROADS: MiscUtils.mcd('More roads needed'),
  NEED_POLICE_STATION: MiscUtils.mcd('Police station needed'),
  NEED_SEAPORT: MiscUtils.mcd('Seaport needed'),
  NEED_STADIUM: MiscUtils.mcd('Stadium needed'),
  NO_MONEY: MiscUtils.mcd('No money'),
  NOT_ENOUGH_POWER: MiscUtils.mcd('Not enough power'),
  NUCLEAR_MELTDOWN: MiscUtils.mcd('Nuclear Meltdown'),
  PLANE_CRASHED: MiscUtils.mcd('Plane crashed'),
  POLICE_NEEDS_FUNDING: MiscUtils.mcd('Police need funding'),
  POPULATION_UPDATED: MiscUtils.mcd('Population updated'),
  QUERY_WINDOW_CLOSED: MiscUtils.mcd('Query window closed'),
  QUERY_WINDOW_NEEDED: MiscUtils.mcd('Query window needed'),
  REACHED_CAPITAL: MiscUtils.mcd('Now a capital'),
  REACHED_CITY: MiscUtils.mcd('Now a city'),
  REACHED_METROPOLIS: MiscUtils.mcd('Now a metropolis'),
  REACHED_MEGALOPOLIS: MiscUtils.mcd('Now a megalopolis'),
  REACHED_TOWN: MiscUtils.mcd('Now a town'),
  REACHED_VILLAGE: MiscUtils.mcd('Now a village'),
  ROAD_NEEDS_FUNDING: MiscUtils.mcd('Roads need funding'),
  SAVE_REQUESTED: MiscUtils.mcd('Save requested'),
  SAVE_WINDOW_CLOSED: MiscUtils.mcd('Save window closed'),
  SCORE_UPDATED: MiscUtils.mcd('Score updated'),
  SCREENSHOT_LINK_CLOSED: MiscUtils.mcd('Screenshot link closed'),
  SCREENSHOT_WINDOW_CLOSED: MiscUtils.mcd('Screenshot window closed'),
  SCREENSHOT_WINDOW_REQUESTED: MiscUtils.mcd('Screenshot window requested'),
  SETTINGS_WINDOW_CLOSED: MiscUtils.mcd('Settings window closed'),
  SETTINGS_WINDOW_REQUESTED: MiscUtils.mcd('Settings window requested'),
  SHIP_CRASHED: MiscUtils.mcd('Shipwrecked'),
  SOUND_EXPLOSIONHIGH: MiscUtils.mcd('Explosion! Bang!'),
  SOUND_EXPLOSIONLOW: MiscUtils.mcd('Explosion! Bang!'),
  SOUND_HEAVY_TRAFFIC: MiscUtils.mcd('Heavy Traffic sound'),
  SOUND_HONKHONK: MiscUtils.mcd('HonkHonk sound'),
  SOUND_MONSTER: MiscUtils.mcd('Monster sound'),
  SPEED_CHANGE: MiscUtils.mcd('Speed change'),
  SPRITE_DYING: MiscUtils.mcd('Sprite dying'),
  SPRITE_MOVED: MiscUtils.mcd('Sprite move'),
  TAX_TOO_HIGH: MiscUtils.mcd('Tax too high'),
  TOOL_CLICKED: MiscUtils.mcd('Tool clicked'),
  TORNADO_SIGHTED: MiscUtils.mcd('Tornado sighted'),
  TOUCH_WINDOW_CLOSED: MiscUtils.mcd('Touch Window closed'),
  TRAFFIC_JAMS: MiscUtils.mcd('Traffic jams reported'),
  TRAIN_CRASHED: MiscUtils.mcd('Train crashed'),
  VALVES_UPDATED: MiscUtils.mcd('Valves updated'),
  WELCOME: MiscUtils.mcd('Welcome to micropolisJS'),
  WELCOMEBACK: MiscUtils.mcd('Welcome back to your 3D city')
};

const Messages = Object.defineProperties({}, messageData);
//var Messages = Object.defineProperties({}, messageData);

var disasterMessages = [Messages.EARTHQUAKE, Messages.EXPLOSION_REPORTED, Messages.FIRE_REPORTED,
                        Messages.FLOODING_REPORTED, Messages.MONSTER_SIGHTED, Messages.NUCLEAR_MELTDOWN,
                        Messages.TORNADO_SIGHTED];
Object.defineProperty(Messages, 'disasterMessages', MiscUtils.mcd(disasterMessages));

var crashes = [Messages.HELICOPTER_CRASHED, Messages.PLANE_CRASHED, Messages.SHIP_CRASHED, Messages.TRAIN_CRASHED];
Object.defineProperty(Messages, 'crashes', MiscUtils.mcd(crashes));


//export { Messages };

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const Text = function(){
    // TODO Some kind of rudimentary L20N based on navigator.language?

    // Query tool strings
    var densityStrings = ['Low', 'Medium', 'High', 'Very High'];
    var landValueStrings = ['Slum', 'Lower Class', 'Middle Class', 'High'];
    var crimeStrings = ['Safe', 'Light', 'Moderate', 'Dangerous'];
    var pollutionStrings = ['None', 'Moderate', 'Heavy', 'Very Heavy'];
    var rateStrings = ['Declining', 'Stable', 'Slow Growth', 'Fast Growth'];
    var zoneTypes = ['Clear', 'Water', 'Trees', 'Rubble', 'Flood', 'Radioactive Waste',
                   'Fire', 'Road', 'Power', 'Rail', 'Residential', 'Commercial',
                   'Industrial', 'Seaport', 'Airport', 'Coal Power', 'Fire Department',
                   'Police Department', 'Stadium', 'Nuclear Power', 'Draw Bridge',
                   'Radar Dish', 'Fountain', 'Industrial', 'Steelers 38  Bears 3',
                   'Draw Bridge', 'Ur 238'];

    // Evaluation window
    var gameLevel = {};
    gameLevel['' + Micro.LEVEL_EASY] = 'Easy';
    gameLevel['' + Micro.LEVEL_MED] = 'Medium';
    gameLevel['' + Micro.LEVEL_HARD] = 'Hard';
 
    var cityClass = {};
    cityClass[Micro.CC_VILLAGE] = 'VILLAGE';
    cityClass[Micro.CC_TOWN] = 'TOWN';
    cityClass[Micro.CC_CITY] = 'CITY';
    cityClass[Micro.CC_CAPITAL] = 'CAPITAL';
    cityClass[Micro.CC_METROPOLIS] = 'METROPOLIS';
    cityClass[Micro.CC_MEGALOPOLIS] = 'MEGALOPOLIS';

    var problems = {};
    problems[Micro.CRIME] = 'Crime';
    problems[Micro.POLLUTION] = 'Pollution';
    problems[Micro.HOUSING] = 'Housing';
    problems[Micro.TAXES] = 'Taxes';
    problems[Micro.TRAFFIC] = 'Traffic';
    problems[Micro.UNEMPLOYMENT] = 'Unemployment';
    problems[Micro.FIRE] = 'Fire';

    // months
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Tool strings
    var toolMessages = {
        noMoney: 'Insufficient funds to build that',
        needsDoze: 'Area must be bulldozed first'
    };

    // Message strings
    var neutralMessages = {};
    neutralMessages[Messages.FIRE_STATION_NEEDS_FUNDING] = 'Fire departments need funding';
    neutralMessages[Messages.NEED_AIRPORT] = 'Commerce requires an Airport';
    neutralMessages[Messages.NEED_FIRE_STATION] = 'Citizens demand a Fire Department';
    neutralMessages[Messages.NEED_ELECTRICITY] = 'Build a Power Plant';
    neutralMessages[Messages.NEED_MORE_INDUSTRIAL] = 'More industrial zones needed';
    neutralMessages[Messages.NEED_MORE_COMMERCIAL] = 'More commercial zones needed';
    neutralMessages[Messages.NEED_MORE_RESIDENTIAL] = 'More residential zones needed';
    neutralMessages[Messages.NEED_MORE_RAILS] = 'Inadequate rail system';
    neutralMessages[Messages.NEED_MORE_ROADS] = 'More roads required';
    neutralMessages[Messages.NEED_POLICE_STATION] = 'Citizens demand a Police Department';
    neutralMessages[Messages.NEED_SEAPORT] = 'Industry requires a Sea Port';
    neutralMessages[Messages.NEED_STADIUM] = 'Residents demand a Stadium';
    neutralMessages[Messages.ROAD_NEEDS_FUNDING] = 'Roads deteriorating, due to lack of funds';
    neutralMessages[Messages.POLICE_NEEDS_FUNDING] = 'Police departments need funding';
    neutralMessages[Messages.WELCOME] = 'Welcome to 3D City';
    neutralMessages[Messages.WELCOMEBACK] = 'Welcome to 3D City';

    var badMessages = {};
    badMessages[Messages.BLACKOUTS_REPORTED] = 'Brownouts, build another Power Plant';
    badMessages[Messages.COPTER_CRASHED] = 'A helicopter crashed ';
    badMessages[Messages.EARTHQUAKE] = 'Major earthquake reported !!';
    badMessages[Messages.EXPLOSION_REPORTED] = 'Explosion detected ';
    badMessages[Messages.FLOODING_REPORTED] = 'Flooding reported !';
    badMessages[Messages.FIRE_REPORTED] = 'Fire reported ';
    badMessages[Messages.HEAVY_TRAFFIC] = 'Heavy Traffic reported';
    badMessages[Messages.HIGH_CRIME] = 'Crime very high';
    badMessages[Messages.HIGH_POLLUTION] = 'Pollution very high';
    badMessages[Messages.MONSTER_SIGHTED] = 'A Monster has been sighted !';
    badMessages[Messages.NO_MONEY] = 'YOUR CITY HAS GONE BROKE';
    badMessages[Messages.NOT_ENOUGH_POWER] = 'Blackouts reported. insufficient power capacity';
    badMessages[Messages.NUCLEAR_MELTDOWN] = 'A Nuclear Meltdown has occurred !!';
    badMessages[Messages.PLANE_CRASHED] = 'A plane has crashed ';
    badMessages[Messages.SHIP_CRASHED] = 'Shipwreck reported ';
    badMessages[Messages.TAX_TOO_HIGH] = 'Citizens upset. The tax rate is too high';
    badMessages[Messages.TORNADO_SIGHTED] = 'Tornado reported !';
    badMessages[Messages.TRAFFIC_JAMS] = 'Frequent traffic jams reported';
    badMessages[Messages.TRAIN_CRASHED] = 'A train crashed ';

    var goodMessages = {};
    goodMessages[Messages.REACHED_CAPITAL] = 'Population has reached 50,000';
    goodMessages[Messages.REACHED_CITY] = 'Population has reached 10,000';
    goodMessages[Messages.REACHED_MEGALOPOLIS] = 'Population has reached 500,000';
    goodMessages[Messages.REACHED_METROPOLIS] = 'Population has reached 100,000';
    goodMessages[Messages.REACHED_TOWN] = 'Population has reached 2,000';

    return {
        badMessages: badMessages,
        cityClass: cityClass,
        crimeStrings: crimeStrings,
        densityStrings: densityStrings,
        gameLevel: gameLevel,
        goodMessages: goodMessages,
        landValueStrings: landValueStrings,
        months: months,
        neutralMessages: neutralMessages,
        problems: problems,
        pollutionStrings: pollutionStrings,
        rateStrings: rateStrings,
        toolMessages: toolMessages,
        zoneTypes: zoneTypes
    }

};

const TXT = new Text();

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


class SpriteUtils {

    static pixToWorld (p) {
        return ZoneUtils.pixToWorld(p);
    }

    static worldToPix (w) {
        return ZoneUtils.worldToPix(w);
    }

    // Attempt to move 45° towards the desired direction, either
    // clockwise or anticlockwise, whichever gets us there quicker
    static turnTo ( presentDir, desiredDir ) {

        if (presentDir === desiredDir) return presentDir;

        if (presentDir < desiredDir) {
            // select clockwise or anticlockwise
            if (desiredDir - presentDir < 4) presentDir++;
            else presentDir--;
        } else {
            if (presentDir - desiredDir < 4) presentDir--;
            else presentDir++;
        }
        if (presentDir > 8) presentDir = 1;
        if (presentDir < 1) presentDir = 8;
        return presentDir;

    }

    static absoluteValue ( x ) {
        return Math.abs(x);
    }

    static getTileValue ( map, x, y ) {

        let wX = ZoneUtils.pixToWorld(x);
        let wY = ZoneUtils.pixToWorld(y);
        if (wX < 0 || wX >= map.width || wY < 0 || wY >= map.height)  return -1;
        return map.getTileValue(wX, wY);

    }


    // Choose the best direction to get from the origin to the destination
    // If the destination is equidistant in both x and y deltas, a diagonal
    // will be chosen, otherwise the most 'dominant' difference will be selected
    // (so if a destination is 4 units north and 2 units east, north will be chosen).
    // This code seems to always choose south if we're already there which seems like
    // a bug

    static getDir ( orgX, orgY, destX, destY ) {

        let deltaX = destX - orgX;
        let deltaY = destY - orgY;
        let i;

        if (deltaX < 0) {
            i = deltaY < 0 ? 11 : 8;
        } else {
            i = deltaY < 0 ? 2 : 5;
        }

        deltaX = Math.abs(deltaX);
        deltaY = Math.abs(deltaY);

        if (deltaX * 2 < deltaY) i++;
        else if (deltaY * 2 < deltaX) i--;
        if (i < 0 || i > 12) i = 0;
        return Micro.directionTable[i];

    }

    static absoluteDistance ( orgX, orgY, destX, destY ) {

        let deltaX = destX - orgX;
        let deltaY = destY - orgY;
        return Math.abs(deltaX) + Math.abs(deltaY);

    }

    static checkWet ( tileValue ) {

        if (tileValue === Tile.HPOWER || tileValue === Tile.VPOWER || tileValue === Tile.HRAIL || tileValue === Tile.VRAIL || tileValue === Tile.BRWH || tileValue === Tile.BRWV) return true;
        else  return false;

    }

    static destroyMapTile ( spriteManager, map, blockMaps, ox, oy ) {

        let x = ZoneUtils.pixToWorld(ox);
        let y = ZoneUtils.pixToWorld(oy);

        if (!map.testBounds(x, y)) return;

        let tile = map.getTile(x, y);
        let tileValue = tile.getValue();

        if (tileValue < Tile.TREEBASE) return;

        if (!tile.isCombustible()) {
            if (tileValue >= Tile.ROADBASE && tileValue <= Tile.LASTROAD) map.setTile(x, y, Tile.RIVER, 0);
            return;
        }

        if (tile.isZone()) {
            ZoneUtils.fireZone( map, x, y, blockMaps );
            if (tileValue > Tile.RZB) spriteManager.makeExplosionAt(ox, oy);
        }
        if (SpriteUtils.checkWet(tileValue)) map.setTile(x, y, Tile.RIVER, 0);
        else map.setTile(x, y, Tile.TINYEXP, Tile.BULLBIT | Tile.ANIMBIT);
        
    }

    static getDistance (x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    static checkSpriteCollision (s1, s2) {
        return s1.frame !== 0 && s2.frame !== 0 && SpriteUtils.getDistance(s1.x, s1.y, s2.x, s2.y) < 30;
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class BaseSprite {

    constructor (  ) {
    }

    init ( type, map, spriteManager, x, y ) {

        this.type = type;
        this.map = map;
        this.spriteManager = spriteManager;
        this.x = x;
        this.y = y;
        this.origX = 0;
        this.origY = 0;
        this.destX = 0;
        this.destY = 0;
        this.count = 0;
        this.soundCount = 0;
        this.dir = 0;
        this.newDir = 0;
        this.step = 0;
        this.flag = 0;
        this.turn = 0;
        this.accel = 0;
        this.speed = 100;
    }

    getFileName () {
        return ['obj', this.type, '-', this.frame - 1].join('');
    }

    spriteNotInBounds () {

        let x = SpriteUtils.pixToWorld(this.x);
        let y = SpriteUtils.pixToWorld(this.y);
        return x < 0 || y < 0 || x >= this.map.width || y >= this.map.height;
        
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class TrainSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init(Micro.SPRITE_TRAIN, map, spriteManager, x, y);
        this.width = 32;
        this.height = 32;
        this.xOffset = -16;
        this.yOffset = -16;
        this.frame = 1;
        this.dir = 4;

        this.tileDeltaX = [  0, 16, 0, -16];
        this.tileDeltaY = [-16, 0, 16, 0 ];
        this.xDelta = [  0, 4, 0, -4, 0];
        this.yDelta = [ -4, 0, 4, 0, 0];

        this.TrainPic2 = [ 1, 2, 1, 2, 5];

        // Frame values
        this.NORTHSOUTH = 1;
        this.EASTWEST = 2;
        this.NWSE = 3;
        this.NESW = 4;
        this.UNDERWATER = 5;

        // Direction values
        this.NORTH = 0;
        this.EAST = 1;
        this.SOUTH = 2;
        this.WEST = 3;
        this.CANTMOVE = 4;

    }

    move (spriteCycle, messageManager, disasterManager, blockMaps) {
        // Trains can only move in the 4 cardinal directions
        // Over the course of 4 frames, we move through a tile, so
        // ever fourth frame, we try to find a direction to move in
        // (excluding the opposite direction from the current direction
        // of travel). If there is no possible direction found, our direction
        // is set to CANTMOVE. (Thus, if we're in a dead end, we can start heading
        // backwards next time round). If we fail to find a destination after 2 attempts,
        // we die.

        if (this.frame === this.NWSE || this.frame === this.NESW) this.frame = this.TrainPic2[this.dir];

        this.x += this.xDelta[this.dir];
        this.y += this.yDelta[this.dir];

        // Find a new direction.
        if ((spriteCycle & 3) === 0) {
          // Choose a random starting point for our search
            let dir = math.getRandom16() & 3;

            for (let i = dir; i < dir + 4; i++) {
                let dir2 = i & 3;

                if (this.dir !== this.CANTMOVE) {
                    // Avoid the opposite direction
                    if (dir2 === ((this.dir + 2) & 3)) continue;
                }

                let tileValue = SpriteUtils.getTileValue(this.map, this.x + this.tileDeltaX[dir2], this.y + this.tileDeltaY[dir2]);

                if ((tileValue >= Tile.RAILBASE && tileValue <= Tile.LASTRAIL) || tileValue === Tile.RAILVPOWERH || tileValue === Tile.RAILHPOWERV) {
                    if (this.dir !== dir2 && this.dir !== this.CANTMOVE) {

                        if (this.dir + dir2 === this.WEST) this.frame = this.NWSE;
                        else this.frame = this.NESW;
                        
                    } else {
                        this.frame = this.TrainPic2[dir2];
                    }

                    if (tileValue === Tile.HRAIL || tileValue === Tile.VRAIL) this.frame = this.UNDERWATER;

                    this.dir = dir2;
                    return;
                }
            }

            // Nowhere to go. Die.
            if (this.dir === this.CANTMOVE) {
                this.frame = 0;
                return;
            }

            // We didn't find a direction this time. We'll try the opposite
            // next time around
            this.dir = this.CANTMOVE;
        }
    }

    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.TRAIN_CRASHED);
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class BoatSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init( Micro.SPRITE_SHIP, map, spriteManager, x, y );
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;

        if (x < SpriteUtils.worldToPix(4)) this.frame = 3;
        else if (x >= SpriteUtils.worldToPix(map.width - 4)) this.frame = 7;
        else if (y < SpriteUtils.worldToPix(4)) this.frame = 5;
        else if (y >= SpriteUtils.worldToPix(map.height - 4)) this.frame = 1;
        else this.frame = 3;

        this.newDir = this.frame;
        this.dir = 10;
        this.count = 1;

        this.tileDeltaX = [0,  0,  1,  1,  1,  0, -1, -1, -1];
        this.tileDeltaY = [0, -1, -1,  0,  1,  1,  1,  0, -1];
        this.xDelta = [0,  0,  2,  2,  2,  0, -2, -2, -2];
        this.yDelta = [0, -2, -2,  0,  2,  2,  2,  0, -2];
        this.tileWhiteList = [Tile.RIVER, Tile.CHANNEL, Tile.POWERBASE, Tile.POWERBASE + 1, Tile.RAILBASE, Tile.RAILBASE + 1, Tile.BRWH, Tile.BRWV];

        this.CANTMOVE = 10;

    }

    move ( spriteCycle, messageManager, disasterManager, blockMaps ) {

        let t = Tile.RIVER;

        let startDir, frame, dir, x, y, tileValue;

        if (this.soundCount > 0) this.soundCount--;

        if (this.soundCount === 0) {
          if ((math.getRandom16() & 3) === 1) {
            // TODO Scenarios
            // TODO Sound
            messageManager.sendMessage(Messages.SOUND_HONKHONK);
          }

          this.soundCount = 200;
        }

        if (this.count > 0) this.count--;

        if (this.count === 0) {

            // Ships turn slowly: only 45° every 9 cycles
            this.count = 9;

            // If already executing a turn, continue to do so
            if (this.frame !== this.newDir) {
                this.frame = SpriteUtils.turnTo(this.frame, this.newDir);
                return;
            }

            // Otherwise pick a new direction
            // Choose a random starting direction to search from
            // 0 = N, 1 = NE, ... 7 = NW
            startDir = math.getRandom16() & 7;
            frame = this.frame;

            for ( dir = startDir; dir < (startDir + 8); dir++) {

                frame = (dir & 7) + 1;

                if (frame === this.dir) continue;

                x = SpriteUtils.pixToWorld(this.x) + this.tileDeltaX[frame];
                y = SpriteUtils.pixToWorld(this.y) + this.tileDeltaY[frame];

                if (this.map.testBounds(x, y)) {
                    tileValue = this.map.getTileValue(x, y);

                    // Test for a suitable water tile
                    if (tileValue === Tile.CHANNEL || tileValue === Tile.BRWH || tileValue === Tile.BRWV || this.oppositeAndUnderwater(tileValue, this.dir, frame)) {
                        this.newDir = frame;
                        this.frame = SpriteUtils.turnTo(this.frame, this.newDir);
                        this.dir = frame + 4;

                        if (this.dir > 8) this.dir -= 8;
                        break;
                    }
                }
            }

            if (dir === (startDir + 8)) {
                this.dir = this.CANTMOVE;
                this.newDir = (math.getRandom16() & 7) + 1;
            }
        } else {
            frame = this.frame;

            if (frame === this.newDir)  {
                this.x += this.xDelta[frame];
                this.y += this.yDelta[frame];
            }
        }

        if (this.spriteNotInBounds()) {
            this.frame = 0;
            return;
        }

        // If we didn't find a new direction, we might explode
        // depending on the last tile we looked at.
        for (let i = 0; i < 8; i++) {

            if (t === this.tileWhiteList[i]) break;
            if (i === 7) {
               this.explodeSprite(messageManager);
               SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
            }
        }
    }


    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.SHIP_CRASHED);
    }

    // This is an odd little function. It returns true if
    // oldDir is 180° from newDir and tileValue is underwater
    // rail or wire, and returns false otherwise
    oppositeAndUnderwater (tileValue, oldDir, newDir) {
        let opposite = oldDir + 4;
        if (opposite > 8) opposite -= 8;
        if (newDir != opposite) return false;
        if (tileValue == Tile.POWERBASE || tileValue == Tile.POWERBASE + 1 || tileValue == Tile.RAILBASE || tileValue == Tile.RAILBASE + 1) return true;
        return false;
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class MonsterSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init(Micro.SPRITE_MONSTER, map, spriteManager, x, y);
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;

        if (x > SpriteUtils.worldToPix(map.width) / 2) {
            if (y > SpriteUtils.worldToPix(map.height) / 2) this.frame = 10;
            else this.frame = 7;
        } else if (y > SpriteUtils.worldToPix(map.height) / 2) { 
            this.frame = 1;
        } else { 
            this.frame = 4;
        }

        this.flag = 0;
        this.count = 1000;
        this.destX = SpriteUtils.worldToPix(map.pollutionMaxX);
        this.destY = SpriteUtils.worldToPix(map.pollutionMaxY);
        this.origX = this.x;
        this.origY = this.y;
        this._seenLand = false;

        this.xDelta = [ 2, 2, -2, -2, 0];
        this.yDelta = [-2, 2, 2, -2, 0];
        this.cardinals1 = [ 0, 1, 2, 3];
        this.cardinals2 = [ 1, 2, 3, 0];
        this.diagonals1 = [ 2, 5, 8, 11];
        this.diagonals2 = [11, 2, 5, 8];
    }


    move (spriteCycle, messageManager, disasterManager, blockMaps) {

        if (this.soundCount > 0) this.soundCount--;

        // Frames 1 - 12 are diagonal sprites, 3 for each direction.
        // 1-3 NE, 2-6 SE, etc. 13-16 represent the cardinal directions.
        let currentDir = Math.floor((this.frame - 1) / 3);
        let frame, dir;

        if (currentDir < 4) { /* turn n s e w */
            // Calculate how far in the 3 step animation we were,
            // move on to the next one
            frame = (this.frame - 1) % 3;

            if (frame === 2) this.step = 0;

            if (frame === 0) this.step = 1;

            if (this.step) frame++;
            else frame--;

            let absDist = SpriteUtils.absoluteDistance(this.x, this.y, this.destX, this.destY);

            if (absDist < 60) {
                if (this.flag === 0) {
                    this.flag = 1;
                    this.destX = this.origX;
                    this.destY = this.origY;
                } else {
                    this.frame = 0;
                    return;
                }
            }

            // Perhaps switch to a cardinal direction
            dir = SpriteUtils.getDir(this.x, this.y, this.destX, this.destY);
            dir = Math.floor((dir - 1) / 2);

            if (dir !== currentDir && math.getChance(10)) {

                if (math.getRandom16() & 1) frame = this.cardinals1[currentDir];
                else frame = this.cardinals2[currentDir];

                currentDir = 4;

                if (!this.soundCount) {
                    messageManager.sendMessage(Messages.SOUND_MONSTER);
                    this.soundCount = 50 + math.getRandom(100);
                }
            }
        } else {
            // Travelling in a cardinal direction. Switch to a diagonal
            currentDir = 4;
            dir = this.frame;
            frame = (dir - 13) & 3;

            if (!(math.getRandom16() & 3)) {
                if (math.getRandom16() & 1) frame = this.diagonals1[frame];
                else frame = this.diagonals2[frame];

                // We mung currentDir and frame here to
                // make the assignment below work
                currentDir = Math.floor((frame - 1) / 3);
                frame = (frame - 1) % 3;
            }
        }

        frame = currentDir * 3 + frame + 1;
        if (frame > 16) frame = 16;

        this.frame = frame;

        this.x += this.xDelta[currentDir];
        this.y += this.yDelta[currentDir];

        if (this.count > 0) this.count--;

        let tileValue = SpriteUtils.getTileValue(this.map, this.x, this.y);

        if (tileValue === -1 || (tileValue === Tile.RIVER && this.count < 500)) this.frame = 0;

        if (tileValue === Tile.DIRT || tileValue > Tile.WATER_HIGH) this._seenLand = true;

        let spriteList = this.spriteManager.getSpriteList();
        for (let i = 0; i < spriteList.length; i++) {
            let s = spriteList[i];

            if (s.frame !== 0 &&
              (s.type === Micro.SPRITE_AIRPLANE || s.type === Micro.SPRITE_HELICOPTER ||
               s.type === Micro.SPRITE_SHIP || s.type === Micro.SPRITE_TRAIN) &&
                SpriteUtils.checkSpriteCollision(this, s))
            s.explodeSprite(messageManager);
        }

        SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class CopterSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init(Micro.SPRITE_HELICOPTER, map, spriteManager, x, y);
        this.width = 32;
        this.height = 32;
        this.xOffset = -16;
        this.yOffset = -16;
        this.frame = 5;
        this.count = 1500;
        this.destX = math.getRandom(SpriteUtils.worldToPix(map.width)) + 8;
        this.destY = math.getRandom(SpriteUtils.worldToPix(map.height)) + 8;
        this.origX = x;
        this.origY = y;

        this.xDelta = [0, 0, 3, 5, 3, 0, -3, -5, -3];
        this.yDelta = [0, -5, -3, 0, 3, 5, 3, 0, -3];

    }

    move ( spriteCycle, messageManager, disasterManager, blockMaps ) {

        if (this.soundCount > 0) this.soundCount--;

        if (this.count > 0) this.count--;

        if (this.count === 0) {
            // Head towards a monster, and certain doom
            let s = this.spriteManager.getSprite(Micro.SPRITE_MONSTER);

            if (s !== null) {
                this.destX = s.x;
                this.destY = s.y;
            } else {
                // No monsters. Hm. I bet flying near that tornado is sensible
                s = this.spriteManager.getSprite(Micro.SPRITE_TORNADO);

                if (s !== null) {
                    this.destX = s.x;
                    this.destY = s.y;
                } else {
                    this.destX = this.origX;
                    this.destY = this.origY;
                }
            }

            // If near destination, let's get her on the ground
            let absDist = SpriteUtils.absoluteDistance(this.x, this.y, this.origX, this.origY);
            if (absDist < 30) {
                this.frame = 0;
                return;
            }
        }

        if (this.soundCount === 0) {
            let x = SpriteUtils.pixToWorld(this.x);
            let y = SpriteUtils.pixToWorld(this.y);

            if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
                if (blockMaps.trafficDensityMap.worldGet(x, y) > 170 && (math.getRandom16() & 7) === 0) {
                    messageManager.sendMessage(Messages.HEAVY_TRAFFIC, {x: x, y: y});
                    messageManager.sendMessage(Messages.SOUND_HEAVY_TRAFFIC);
                    this.soundCount = 200;
                }
            }
        }

        let frame = this.frame;

        if ((spriteCycle & 3) === 0) {
            let dir = SpriteUtils.getDir(this.x, this.y, this.destX, this.destY);
            frame = SpriteUtils.turnTo(frame, dir);
            this.frame = frame;
        }

        this.x += this.xDelta[frame];
        this.y += this.yDelta[frame];
    }

    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.HELICOPTER_CRASHED);
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class AirplaneSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init( Micro.SPRITE_AIRPLANE, map, spriteManager, x, y );
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;
        if (x > SpriteUtils.worldToPix(map.width - 20)) {
            this.destX = this.x - 200;
            this.frame = 7;
        } else {
            this.destX = this.x + 200;
            this.frame = 11;
        }
        this.destY = this.y;

        this.xDelta = [0, 0, 6, 8, 6, 0, -6, -8, -6, 8, 8, 8];
        this.yDelta = [0, -8, -6, 0, 6, 8,  6, 0, -6, 0, 0, 0];

    }

    move ( spriteCycle, messageManager, disasterManager, blockMaps ) {

        let frame = this.frame;

        if ((spriteCycle % 5) === 0) {
          // Frames > 8 mean the plane is taking off
            if (frame > 8) {
                frame--;
                if (frame < 9) { // Planes always take off to the east
                    frame = 3;
                }
                this.frame = frame;
             } else {
                let d = SpriteUtils.getDir(this.x, this.y, this.destX, this.destY);
                frame = SpriteUtils.turnTo(frame, d);
                this.frame = frame;
            }
        }

        let absDist = SpriteUtils.absoluteDistance(this.x, this.y, this.destX, this.destY);
        if (absDist < 50) {
            // We're pretty close to the destination
            this.destX = math.getRandom(SpriteUtils.worldToPix(this.map.width)) + 8;
            this.destY = math.getRandom(SpriteUtils.worldToPix(this.map.height)) + 8;
        }

        if (disasterManager.enableDisasters) {
            let explode = false;

            let spriteList = this.spriteManager.getSpriteList();
            for (let i = 0; i < spriteList.length; i++) {

                let s = spriteList[i];

                //if (s.frame === 0 || s === sprite) continue;
                if (s.frame === 0 ) continue;

                if ((s.type === Micro.SPRITE_HELICOPTER || s.type === Micro.SPRITE_AIRPLANE) && SpriteUtils.checkSpriteCollision(this, s)) {
                    s.explodeSprite(messageManager);
                    explode = true;
                }
            }

            if (explode) this.explodeSprite(messageManager);
        }

        this.x += this.xDelta[frame];
        this.y += this.yDelta[frame];

        if (this.spriteNotInBounds()) this.frame = 0;
    }


    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.PLANE_CRASHED);
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class TornadoSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init(Micro.SPRITE_TORNADO, map, spriteManager, x, y);
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -40;
        this.frame = 1;
        this.count = 200;

        this.xDelta = [2, 3, 2, 0, -2, -3];
        this.yDelta = [-2, 0, 2, 3, 2, 0];
    }

    move (spriteCycle, messageManager, disasterManager, blockMaps) {
        let frame;
        frame = this.frame;

        // If middle frame, move right or left
        // depending on the flag value
        // If frame = 1, perhaps die based on flag
        // value
        if (frame === 2) {
            if (this.flag) frame = 3;
            else  frame = 1;
        } else {
            if (frame === 1) this.flag = 1;
            else  this.flag = 0;

            frame = 2;
        }

        if (this.count > 0) this.count--;

        this.frame = frame;

        let spriteList = this.spriteManager.getSpriteList();

        for (let i = 0; i < spriteList.length; i++) {

            let s = spriteList[i];

          // Explode vulnerable sprites
            if (s.frame !== 0 &&
              (s.type === Micro.SPRITE_AIRPLANE || s.type === Micro.SPRITE_HELICOPTER ||
               s.type === Micro.SPRITE_SHIP || s.type === Micro.SPRITE_TRAIN) &&
              SpriteUtils.checkSpriteCollision(this, s)) {
              s.explodeSprite(messageManager);
            }
        }

        frame = Random.getRandom(5);
        this.x += this.xDelta[frame];
        this.y += this.yDelta[frame];

        if (this.spriteNotInBounds()) this.frame = 0;

        if (this.count !== 0 && Random.getRandom(500) === 0) this.frame = 0;

        SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
    }
}
/*

  // Metadata for image loading
  Object.defineProperties(TornadoSprite,
    {ID: Micro.makeConstantDescriptor(6),
     width: Micro.makeConstantDescriptor(48),
     frames: Micro.makeConstantDescriptor(3)});


  return TornadoSprite;
});
*/

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class ExplosionSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super();

        this.init(Micro.SPRITE_EXPLOSION, map, spriteManager, x, y);
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;
        this.frame = 1;
    }

    startFire (x, y) {
        x = ZoneUtils.pixToWorld(x);
        y = ZoneUtils.pixToWorld(y);

        if (!this.map.testBounds(x, y)) return;

        let tile = this.map.getTile(x, y);
        let tileValue = tile.getValue();

        if (!tile.isCombustible() && tileValue !== Tile.DIRT) return;

        if (tile.isZone()) return;

        this.map.setTo(x, y, ZoneUtils.randomFire());

  }

  move (spriteCycle, messageManager, disasterManager, blockMaps) {

        if ((spriteCycle & 1) === 0) {
            if (this.frame === 1) {
                // Convert sprite coordinates to tile coordinates.
                let explosionX = ZoneUtils.pixToWorld(this.x);
                let explosionY = ZoneUtils.pixToWorld(this.y);
                messageManager.sendMessage(Messages.SOUND_EXPLOSIONHIGH);
                messageManager.sendMessage(Messages.EXPLOSION_REPORTED, {x: explosionX, y: explosionY});
            }

            this.frame++;
        }

        if (this.frame > 6) {
            this.frame = 0;

            this.startFire(this.x, this.y);
            this.startFire(this.x - 16, this.y - 16);
            this.startFire(this.x + 16, this.y + 16);
            this.startFire(this.x - 16, this.y + 16);
            this.startFire(this.x + 16, this.y + 16);
        }
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const constructors = {};
constructors[Micro.SPRITE_TRAIN] = TrainSprite;
constructors[Micro.SPRITE_SHIP] = BoatSprite;
constructors[Micro.SPRITE_MONSTER] = MonsterSprite;
constructors[Micro.SPRITE_HELICOPTER] = CopterSprite;
constructors[Micro.SPRITE_AIRPLANE] = AirplaneSprite;
constructors[Micro.SPRITE_TORNADO] = TornadoSprite;
constructors[Micro.SPRITE_EXPLOSION] = ExplosionSprite;




class SpriteManager {

    constructor ( map ) {

        this.spriteList = [];
        this.map = map;
        this.spriteCycle = 0;
    }
    
    getSprite (type) {

        let filteredList = this.spriteList.filter(function (s) {
            return s.frame !== 0 && s.type === type;
        });
        if (filteredList.length === 0) return null;
        return filteredList[0];
    }

    getSpriteList () {
        return this.spriteList.slice();
    }

    getSpritesInView (startX, startY, lastX, lastY) {
        startX = SpriteUtils.worldToPix(startX);
        startY = SpriteUtils.worldToPix(startY);
        lastX = SpriteUtils.worldToPix(lastX);
        lastY = SpriteUtils.worldToPix(lastY);
        return this.spriteList.filter(function(s) {
          return (s.x + s.xOffset >= startX && s.y + s.yOffset >= startY) &&
                 !(s.x + s.xOffset >= lastX && s.y + s.yOffset >= lastY);
        });
    }

    moveObjects ( simData ) {

        if(!simData) simData = Micro.simData;

        let messageManager = simData.messageManager;
        let disasterManager = simData.disasterManager;
        let blockMaps = simData.blockMaps;

        this.spriteCycle += 1;

        let list = this.spriteList.slice();

        let i = list.length;
        while(i--){
        //for (let i = 0, l = list.length; i < l; i++) {
            let sprite = list[i];
            if (sprite.frame === 0) continue;
            sprite.move(this.spriteCycle, messageManager, disasterManager, blockMaps);
        }

        this.pruneDeadSprites();
    }

    makeSprite (type, x, y) {

        this.spriteList.push(new constructors[type](this.map, this, x, y));

    }

    makeTornado (messageManager) {
        let sprite = this.getSprite( Micro.SPRITE_TORNADO );
        if (sprite !== null) {
            sprite.count = 200;
            return;
        }
        let x = math.getRandom(SpriteUtils.worldToPix(this.map.width) - 800) + 400;
        let y = math.getRandom(SpriteUtils.worldToPix(this.map.height) - 200) + 100;

        this.makeSprite( Micro.SPRITE_TORNADO, x, y );
        messageManager.sendMessage(Messages.TORNADO_SIGHTED, {x: SpriteUtils.pixToWorld(x), y: SpriteUtils.pixToWorld(y)});
    }

    makeExplosion (x, y) {
        if (this.map.testBounds(x, y)) this.makeExplosionAt(SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
    }

    makeExplosionAt(x, y) {
        this.makeSprite(Micro.SPRITE_EXPLOSION, x, y);
    }

    generatePlane (x, y) {
        if (this.getSprite(Micro.SPRITE_AIRPLANE) !== null) return;
        this.makeSprite(Micro.SPRITE_AIRPLANE, SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
    }

    generateTrain (census, x, y) {
        if (census.totalPop > 20 && this.getSprite(Micro.SPRITE_TRAIN) === null && math.getRandom(25) === 0) this.makeSprite(Micro.SPRITE_TRAIN,SpriteUtils.worldToPix(x) + 8, SpriteUtils.worldToPix(y) + 8);
    }

    generateShip () {
        // XXX This code is borked. The map generator will never
        // place a channel tile on the edges of the map
        let x,y;

        if (math.getChance(3)) {
          for (x = 4; x < this.map.width - 2; x++) {
            if (this.map.getTileValue(x, 0) === Tile.CHANNEL)  {
              this.makeShipHere(x, 0);
              return;
            }
          }
        }

        if (math.getChance(3)) {
          for (y = 1; y < this.map.height - 2; y++) {
            if (this.map.getTileValue(0, y) === Tile.CHANNEL)  {
              this.makeShipHere(0, y);
              return;
            }
          }
        }

        if (math.getChance(3)) {
          for (x = 4; x < this.map.width - 2; x++) {
            if (this.map.getTileValue(x, this.map.height - 1) === Tile.CHANNEL)  {
              this.makeShipHere(x, this.map.height - 1);
              return;
            }
          }
        }

        if (math.getChance(3)) {
          for (y = 1; y < this.map.height - 2; y++) {
            if (this.map.getTileValue(this.map.width - 1, y) === Tile.CHANNEL)  {
              this.makeShipHere(this.map.width - 1, y);
              return;
            }
          }
        }
    }

    getBoatDistance (x, y) {
        let dist = 99999;
        let pixelX = SpriteUtils.worldToPix(x) + 8;
        let pixelY = SpriteUtils.worldToPix(y) + 8;
        let sprite;

        for (let i = 0, l = this.spriteList.length; i < l; i++) {
            sprite = this.spriteList[i];
            if (sprite.type === Micro.SPRITE_SHIP && sprite.frame !== 0) {
                //let sprDist = Micro.absoluteValue(sprite.x - pixelX) + Micro.absoluteValue(sprite.y - pixelY);
                let sprDist = Math.abs(sprite.x - pixelX) + Math.abs(sprite.y - pixelY);
                dist = Math.min(dist, sprDist);
            }
        }

        return dist;
    }

    makeShipHere (x, y) {
        this.makeSprite(Micro.SPRITE_SHIP,SpriteUtils.worldToPix(x),SpriteUtils.worldToPix(y));
    }

    generateCopter (x, y) {
        if (this.getSprite(Micro.SPRITE_HELICOPTER) !== null) return;
        this.makeSprite(Micro.SPRITE_HELICOPTER,SpriteUtils.worldToPix(x),SpriteUtils.worldToPix(y));
    }

    makeMonsterAt (messageManager, x, y) {

        this.makeSprite(Micro.SPRITE_MONSTER, SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
        messageManager.sendMessage(Messages.MONSTER_SIGHTED, {x: x, y: y});
    }

    makeMonster (messageManager) {
        let sprite = this.getSprite(Micro.SPRITE_MONSTER);
        if (sprite !== null) {
            sprite.soundCount = 1;
           sprite.count = 1000;
            sprite.destX = SpriteUtils.worldToPix(this.map.pollutionMaxX);
            sprite.destY = SpriteUtils.worldToPix(this.map.pollutionMaxY);
        }

        let done = 0;
        for (let i = 0; i < 300; i++)  {
            let x = math.getRandom(this.map.width - 20) + 10;
            let y = math.getRandom(this.map.height - 10) + 5;
            let tile = this.map.getTile(x, y);
            if (tile.getValue() === Tile.RIVER) {
                this.makeMonsterAt(messageManager, x, y);
                done = 1;
                break;
            }
        }

        if (done === 0) this.makeMonsterAt(messageManager, 60, 50);
    }

    pruneDeadSprites (type) {
        this.spriteList = this.spriteList.filter(function (s) { return s.frame !== 0; });
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class EvaluationUtils {

    static getTrafficAverage ( blockMaps, census ) {

        var trafficDensityMap = blockMaps.trafficDensityMap;
        var landValueMap = blockMaps.landValueMap;
        var trafficTotal = 0;
        var count = 1;

        for (var x = 0; x < landValueMap.gameMapWidth; x += landValueMap.blockSize) {
            for (var y = 0; y < landValueMap.gameMapHeight; y += landValueMap.blockSize) {
                if (landValueMap.worldGet(x, y) > 0) {
                    trafficTotal += trafficDensityMap.worldGet(x, y);
                    count++;
                }
            }
        }

        var trafficAverage = Math.floor(trafficTotal / count) * 2.4;
        //census.trafficAverage = trafficAverage //??
        return trafficAverage;

    }


    static getUnemployment ( census ) {

        var b = (census.comPop + census.indPop) * 8;
        if (b === 0) return 0;
        // Ratio total people / working. At least 1.
        var r = census.resPop / b;
        b = Math.round((r - 1) * 255);
        return Math.min(b, 255);

    }


    static getFireSeverity ( census ) {

        return Math.min(census.firePop * 5, 255);

    }

}


class Evaluation {

    constructor ( gameLevel ) {

        this.problemVotes = [];
        this.problemOrder = [];
        this.evalInit();
        this.gameLevel = '' + gameLevel;
        this.changed = false;

    }

    save (saveData) {
        for (var i = 0, l = Micro.EvalProps.length; i < l; i++)
            saveData[Micro.EvalProps[i]] = this[Micro.EvalProps[i]];
    }

    load (saveData) {
        for (var i = 0, l = Micro.EvalProps.length; i < l; i++)
            this[Micro.EvalProps[i]] = saveData[Micro.EvalProps[i]];
    }

    cityEvaluation ( simData ) {

        if(!simData) simData = Micro.simData;

        var census = simData.census;

        if ( census.totalPop > 0 ) {

            Micro.problemData = [];
            //var problemTable = [];
            for (var i = 0; i < Micro.NUMPROBLEMS; i++) Micro.problemData.push(0);
            this.getAssessedValue( census );
            this.getPopulation( census );
            this.doProblems( simData.census, simData.budget, simData.blockMaps );
            this.getScore( simData );
            this.doVotes();
            this.changeEval();
        } else {
            this.evalInit();
            this.cityYes = 50;
            this.changeEval();
        }
    }
   
    evalInit () {

        let i;
        this.cityYes = 0;
        this.cityPop = 0;
        this.cityPopDelta = 0;
        this.cityAssessedValue = 0;
        this.cityClass = Micro.CC_VILLAGE;
        this.cityClassLast = Micro.CC_VILLAGE;
        this.cityScore = 500;
        this.cityScoreDelta = 0;
        for (i = 0; i < Micro.NUMPROBLEMS; i++) this.problemVotes[i] = { index: i, voteCount: 0 };
        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) this.problemOrder[i] = Micro.NUMPROBLEMS;
        
    }

    getAssessedValue( census ) {

        var value;
        value = census.roadTotal * 5;
        value += census.railTotal * 10;
        value += census.policeStationPop * 1000;
        value += census.fireStationPop * 1000;
        value += census.hospitalPop * 400;
        value += census.stadiumPop * 3000;
        value += census.seaportPop * 5000;
        value += census.airportPop * 10000;
        value += census.coalPowerPop * 3000;
        value += census.nuclearPowerPop * 6000;
        this.cityAssessedValue = value * 1000;

    }

    getPopulation ( census ) {

        let oldPopulation = this.cityPop;
        this.cityPop = (census.resPop + (census.comPop + census.indPop) * 8) * 20;
        this.cityPopDelta = this.cityPop - oldPopulation;
        if (this.cityPopDelta !== 0) EventEmitter.emitEvent(Messages.POPULATION_UPDATED, this.cityPop);
        return this.cityPop;

    }

    getCityClass ( cityPopulation ) {

        this.cityClass = Micro.CC_VILLAGE;
        if (cityPopulation > 2000) this.cityClass = Micro.CC_TOWN;
        if (cityPopulation > 10000) this.cityClass = Micro.CC_CITY;
        if (cityPopulation > 50000) this.cityClass = Micro.CC_CAPITAL;
        if (cityPopulation > 100000) this.cityClass = Micro.CC_METROPOLIS;
        if (cityPopulation > 500000) this.cityClass = Micro.CC_MEGALOPOLIS;
        
        if ( this.cityClass !== this.cityClassLast ) {
            this.cityClassLast = this.cityClass;
            EventEmitter.emitEvent( Messages.CLASSIFICATION_UPDATED, this.cityClass );
        }

        return this.cityClass;

    }

    voteProblems () {

        for (var i = 0; i < Micro.NUMPROBLEMS; i++) {
            this.problemVotes[i].index = i;
            this.problemVotes[i].voteCount = 0;
        }

        var problem = 0;
        var voteCount = 0;
        var loopCount = 0;

        while (voteCount < 100 && loopCount < 600) {
            var voterProblemTolerance = math.getRandom(300);
            if ( Micro.problemData[problem] > voterProblemTolerance ) {
                this.problemVotes[problem].voteCount += 1;
                voteCount++;
            }

            problem = (problem + 1) % Micro.NUMPROBLEMS;
            loopCount++;
        }
    }

    doProblems ( census, budget, blockMaps ) {
        //var problemTaken = [];

        /*for (var i = 0; i < Micro.NUMPROBLEMS; i++) {
            problemTaken[i] = false;
            problemTable[i] = 0;
        }*/

        Micro.problemData[Micro.CRIME]        = census.crimeAverage;
        Micro.problemData[Micro.POLLUTION]    = census.pollutionAverage;
        Micro.problemData[Micro.HOUSING]      = census.landValueAverage * 7 / 10;
        Micro.problemData[Micro.TAXES]        = budget.cityTax * 10;
        Micro.problemData[Micro.TRAFFIC]      = EvaluationUtils.getTrafficAverage( blockMaps, census );
        Micro.problemData[Micro.UNEMPLOYMENT] = EvaluationUtils.getUnemployment( census );
        Micro.problemData[Micro.FIRE]         = EvaluationUtils.getFireSeverity( census );

        this.voteProblems();

        // Rank the problems
        this.problemVotes.sort(function(a, b) {
            return b.voteCount - a.voteCount;
        });

        this.problemOrder = this.problemVotes.map(function(pv, i) {
            if (i >= Micro.NUM_COMPLAINTS || pv.voteCount === 0) return null;
            return pv.index;
        });

        /*for (i = 0; i < Micro.NUM_COMPLAINTS; i++) {
            // Find biggest problem not taken yet
            var maxVotes = 0;
            var bestProblem = Micro.NUMPROBLEMS;
            for (var j = 0; j < Micro.NUMPROBLEMS; j++) {
                if ((this.problemVotes[j] > maxVotes) && (!problemTaken[j])) {
                   bestProblem = j;
                   maxVotes = this.problemVotes[j];
                }
            }
            // bestProblem == NUMPROBLEMS means no problem found
            this.problemOrder[i] = bestProblem;
            if (bestProblem < Micro.NUMPROBLEMS) {
                problemTaken[bestProblem] = true;
            }
        }*/
    }

    getScore ( simData ) {

        var census = simData.census;
        var budget = simData.budget;
        var valves = simData.valves;

        var cityScoreLast;

        cityScoreLast = this.cityScore;
        var score = 0;

        for ( var i = 0; i < Micro.NUMPROBLEMS; i++ ) score += Micro.problemData[i];

        score = Math.floor(score / 3);
        score = (250 - Math.min(score, 250)) * 4;
        //score = Math.min(score, 256);
        //score = math.clamp((256 - score) * 4, 0, 1000);

        // Penalise the player by 15% if demand for any type of zone is capped due
        // to lack of suitable buildings
        let demandPenalty = 0.85;

        if (valves.resCap) score = Math.round(score * demandPenalty);

        if (valves.comCap) score = Math.round(score * demandPenalty);

        if (valves.indCap) score = Math.round(score * demandPenalty);

        // Penalize if roads/rail underfunded

        if (budget.roadEffect < budget.MAX_ROAD_EFFECT) score -= budget.MAX_ROAD_EFFECT - budget.roadEffect;

        // Penalize player by up to 10% for underfunded police and fire services

        if (budget.policeEffect < budget.MAX_POLICE_STATION_EFFECT) {
            score = Math.round(score * (0.9 + (budget.policeEffect / (10 * budget.MAX_POLICE_STATION_EFFECT))));
        }

        if (budget.fireEffect < budget.MAX_FIRE_STATION_EFFECT) {
            score = Math.round(score * (0.9 + (budget.fireEffect / (10 * budget.MAX_FIRE_STATION_EFFECT))));
        }

        // Penalise the player by 15% if demand for any type of zone has collapsed due to overprovision

        if (valves.resValve < -1000) score = Math.round(score * 0.85);
        if (valves.comValve < -1000) score = Math.round(score * 0.85);
        if (valves.indValve < -1000) score = Math.round(score * 0.85);

        var scale = 1.0;
        if ( this.cityPop === 0 || this.cityPopDelta === 0 || this.cityPopDelta === this.cityPop ) {
            // Leave score unchanged if city is empty, if there hasn't been any migration, if the
            // initial settlers have just arrived, or if the city has doubled in size
            scale = 1.0;
        } else if (this.cityPopDelta > 0) {
            // If the city is growing, scale score by percentage growth in population
            scale = (this.cityPopDelta / this.cityPop) + 1.0;
        } else if (this.cityPopDelta < 0) {
            // If the city is shrinking, scale down by up to 5% based on level of outward migration
            scale = 0.95 + Math.floor(this.cityPopDelta / (this.cityPop - this.cityPopDelta));
        }

        score = Math.round( score * scale );

        // Penalize player for having fires and a burdensome tax rate
        score = score - EvaluationUtils.getFireSeverity(census) - budget.cityTax; // dec score for fires and tax

        // Penalize player based on ratio of unpowered zones to total zones
        scale = census.unpoweredZoneCount + census.poweredZoneCount;   // dec score for unpowered zones
        if (scale > 0.0) score = Math.round(score * (census.poweredZoneCount / scale));

        // Force in to range 0-1000. New score is average of last score and new computed value
        score = math.clamp(score, 0, 1000);
        this.cityScore = Math.round((this.cityScore + score) / 2);

        this.cityScoreDelta = this.cityScore - cityScoreLast;

        if (this.cityScoreDelta !== 0) EventEmitter.emitEvent(Messages.SCORE_UPDATED, this.cityScore);

    }

    doVotes () {
        this.cityYes = 0;

        for (let i = 0; i < 100; i++) {
            let voterExpectation = math.getRandom(1000);
            if (this.cityScore > voterExpectation) this.cityYes++;
        }
    }

    changeEval () {
        this.changed = true;
    }

    countProblems () {
        var i;
        for (i = 0; i < Micro.NUM_COMPLAINTS; i++) {
            if (this.problemOrder[i] === Micro.NUMPROBLEMS) break;
        }
        return i;
    }

    getProblemNumber (i) {
        if (i < 0 || i >= Micro.NUM_COMPLAINTS || this.problemOrder[i] === Micro.NUMPROBLEMS) return -1;
        else return this.problemOrder[i];
    }

    getProblemVotes (i) {
        if (i < 0 || i >= Micro.NUM_COMPLAINTS || this.problemOrder[i] == Micro.NUMPROBLEMS) return -1;
        else return this.problemVotes[this.problemOrder[i]].voteCount;
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class Valves {

    constructor () {

        this.resValve = 0;
        this.comValve = 0;
        this.indValve = 0;
        this.resCap = false;
        this.comCap = false;
        this.indCap = false;
    }

    save ( saveData ) {
        saveData.resValve = this.resValve;
        saveData.comValve = this.comValve;
        saveData.indValve = this.indValve;
    }

    load ( saveData ) {

        this.resValve = saveData.resValve;
        this.comValve = saveData.comValve;
        this.indValve = saveData.indValve;

        EventEmitter.emitEvent( Messages.VALVES_UPDATED, {residential: this.resValve, commercial: this.comValve, industrial: this.indValve});
        
    }

    setValves ( gameLevel, census, budget ) {

        var resPopDenom = 8;
        var birthRate = 0.02;
        var labourBaseMax = 1.3;
        var internalMarketDenom = 3.7;
        var projectedIndPopMin = 5.0;
        var resRatioDefault = 1.3;
        var resRatioMax = 2;
        var comRatioMax = 2;
        var indRatioMax = 2;
        var taxMax = 20;
        var taxTableScale = 600;
        var employment, labourBase;

        // Residential zones scale their population index when reporting it to the census
        var normalizedResPop = census.resPop / resPopDenom;
        census.totalPop = Math.round(normalizedResPop + census.comPop + census.indPop);

        // A lack of developed commercial and industrial zones means there are no employment opportunities, which constrain
        // growth. (This might hurt initially if, for example, the player lays out an initial grid, as the residential zones
        // will likely develop first, so the residential valve will immediately crater).
        if (census.resPop > 0) employment = (census.comHist10[1] + census.indHist10[1]) / normalizedResPop;
        else employment = 1;

        // Given the employment rate, calculate expected migration, add in births, and project the new population.
        var migration = normalizedResPop * (employment - 1);
        var births = normalizedResPop * birthRate;
        var projectedResPop = normalizedResPop + migration + births;

        // Examine how many zones require workers
        labourBase = census.comHist10[1] + census.indHist10[1];
        if (labourBase > 0.0) labourBase = census.resHist10[1] / labourBase;
        else labourBase = 1;
        labourBase = math.clamp(labourBase, 0.0, labourBaseMax);

        // Project future industry and commercial needs, taking into account available labour, and competition from
        // other global cities
        var internalMarket = (normalizedResPop + census.comPop + census.indPop) / internalMarketDenom;
        var projectedComPop = internalMarket * labourBase;
        var projectedIndPop = census.indPop * labourBase * Micro.extMarketParamTable[gameLevel];
        projectedIndPop = Math.max(projectedIndPop, projectedIndPopMin);

        // Calculate the expected percentage changes in each population type
        var resRatio;
        if (normalizedResPop > 0) resRatio = projectedResPop / normalizedResPop;
        else resRatio = resRatioDefault;

        var comRatio;
        if (census.comPop > 0) comRatio = projectedComPop / census.comPop;
        else comRatio = projectedComPop;

        var indRatio;
        if (census.indPop > 0) indRatio = projectedIndPop / census.indPop;
        else indRatio = projectedIndPop;

        resRatio = Math.min(resRatio, resRatioMax);
        comRatio = Math.min(comRatio, comRatioMax);
        indRatio = Math.min(indRatio, indRatioMax);

        // Global tax and game level effects.
        var z = Math.min((budget.cityTax + gameLevel), taxMax);
        resRatio = (resRatio - 1) * taxTableScale + Micro.taxTable[z];
        comRatio = (comRatio - 1) * taxTableScale + Micro.taxTable[z];
        indRatio = (indRatio - 1) * taxTableScale + Micro.taxTable[z];

        // Ratios are velocity changes to valves.
        this.resValve = math.clamp(this.resValve + Math.round(resRatio), -Micro.RES_VALVE_RANGE, Micro.RES_VALVE_RANGE);
        this.comValve = math.clamp(this.comValve + Math.round(comRatio), -Micro.COM_VALVE_RANGE, Micro.COM_VALVE_RANGE);
        this.indValve = math.clamp(this.indValve + Math.round(indRatio), -Micro.IND_VALVE_RANGE, Micro.IND_VALVE_RANGE);

        if (this.resCap && this.resValve > 0) this.resValve = 0;
        if (this.comCap && this.comValve > 0) this.comValve = 0;
        if (this.indCap && this.indValve > 0) this.indValve = 0;

        EventEmitter.emitEvent( Messages.VALVES_UPDATED, {residential: this.resValve, commercial: this.comValve, industrial: this.indValve});

    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class Budget {

    constructor () {

        this.roadEffect = Micro.MAX_ROAD_EFFECT;
        this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
        this.fireEffect = Micro.MAX_FIRESTATION_EFFECT;
        this.totalFunds = 0;
        this.cityTax = 7;
        this.cashFlow = 0;
        this.taxFund = 0;

        // These values denote how much money is required to fully maintain the relevant services
        this.roadMaintenanceBudget = 0;
        this.fireMaintenanceBudget = 0;
        this.policeMaintenanceBudget = 0;

        // Percentage of budget used
        this.roadPercent = 1;
        this.firePercent = 1;
        this.policePercent = 1;

        // Cash value of spending. Should equal Math.round(_Fund * _Percent)
        this.roadSpend = 0;
        this.fireSpend = 0;
        this.policeSpend = 0;

        this.awaitingValues = false;
        this.autoBudget = true;

    }

    save (saveData) {
        for (var i = 0, l = Micro.BudgetProps.length; i < l; i++)
            saveData[Micro.BudgetProps[i]] = this[Micro.BudgetProps[i]];
    }

    load (saveData) {
        for (var i = 0, l = Micro.BudgetProps.length; i < l; i++)
            this[Micro.BudgetProps[i]] = saveData[Micro.BudgetProps[i]];

        EventEmitter.emitEvent(Messages.AUTOBUDGET_CHANGED, this.autoBudget);
        EventEmitter.emitEvent(Messages.FUNDS_CHANGED, this.totalFunds);
    } 

    setAutoBudget (value) {
        this.autoBudget = value;
        EventEmitter.emitEvent(Messages.AUTOBUDGET_CHANGED, this.autoBudget);
    }

    // Calculates the best possible outcome in terms of funding the various services
    // given the player's current funds and tax yield. On entry, roadPercent etc. are
    // assumed to contain the desired percentage level, and taxFunds should contain the
    // most recent tax collected. On exit, the *Percent members will be updated with what
    // we can actually afford to spend. Returns an object containing the amount of cash
    // that would be spent on each service.
    _calculateBestPercentages () {

        // How much would we be spending based on current percentages?
        // Note: the *Budget items are updated every January by collectTax
        this.roadSpend = Math.round(this.roadMaintenanceBudget * this.roadPercent);
        this.fireSpend = Math.round(this.fireMaintenanceBudget * this.firePercent);
        this.policeSpend = Math.round(this.policeMaintenanceBudget * this.policePercent);
        var total = this.roadSpend + this.fireSpend + this.policeSpend;

        // If we don't have any services on the map, we can bail early
        if (total === 0) {
            this.roadPercent = 1;
            this.firePercent = 1;
            this.policePercent = 1;
            return {road: 1, fire: 1, police: 1};
        }

        // How much are we actually going to spend?
        var roadCost = 0;
        var fireCost = 0;
        var policeCost = 0;

        var cashRemaining = this.totalFunds + this.taxFund;

        // Spending priorities: road, fire, police
        if (cashRemaining >= this.roadSpend) roadCost = this.roadSpend;
        else roadCost = cashRemaining;
        cashRemaining -= roadCost;

        if (cashRemaining >= this.fireSpend) fireCost = this.fireSpend;
        else fireCost = cashRemaining;
        cashRemaining -= fireCost;

        if (cashRemaining >= this.policeSpend) policeCost = this.policeSpend;
        else policeCost = cashRemaining;
        cashRemaining -= policeCost;

        if (this.roadMaintenanceBudget > 0) this.roadPercent = (roadCost / this.roadMaintenanceBudget).toPrecision(2) - 0;
        else this.roadPercent = 1;

        if (this.fireMaintenanceBudget > 0) this.firePercent = (fireCost / this.fireMaintenanceBudget).toPrecision(2) - 0;
        else this.firePercent = 1;

        if (this.policeMaintenanceBudget > 0) this.policePercent = (policeCost / this.policeMaintenanceBudget).toPrecision(2) - 0;
        else this.policePercent = 1;

        return { road: roadCost, police: policeCost, fire: fireCost };
    }

    // User initiated budget
    doBudgetWindow () { //doBudgetMenu
        return this.doBudgetNow(true);
    }

    doBudgetNow ( fromWindow ) {

        var costs = this._calculateBestPercentages();

        if (!this.autoBudget && !fromWindow) {
            this.autoBudget = false;
            this.awaitingValues = true;
            EventEmitter.emitEvent(Messages.BUDGET_NEEDED);
            return;
        }

        var roadCost = costs.road;
        var policeCost = costs.police;
        var fireCost = costs.fire;
        var totalCost = roadCost + policeCost + fireCost;
        var cashRemaining = this.totalFunds + this.taxFund - totalCost;

        // Autobudget
        if ((cashRemaining > 0 && this.autoBudget) || fromWindow) {
            // Either we were able to fully fund services, or we have just normalised user input. Go ahead and spend.
            this.awaitingValues = false;
            this.doBudgetSpend( roadCost, fireCost, policeCost );
            return;
        }

        // Uh-oh. Not enough money. Make this the user's problem.
        // They don't know it yet, but they're about to get a budget window.
        this.setAutoBudget(false);
        this.awaitingValues = true;
        EventEmitter.emitEvent(Messages.BUDGET_NEEDED);
        EventEmitter.emitEvent(Messages.NO_MONEY);
    }

    doBudgetSpend ( roadValue, fireValue, policeValue  ) {

        this.roadSpend = roadValue;
        this.fireSpend = fireValue;
        this.policeSpend = policeValue;
        var total = this.roadSpend + this.fireSpend + this.policeSpend;

        this.spend(-(this.taxFund - total) );
        this.updateFundEffects();

    }

    updateFundEffects () {
        // The caller is assumed to have correctly set the percentage spend
        this.roadSpend = Math.round(this.roadMaintenanceBudget * this.roadPercent);
        this.fireSpend = Math.round(this.fireMaintenanceBudget * this.firePercent);
        this.policeSpend = Math.round(this.policeMaintenanceBudget * this.policePercent);

        // Update the effect this level of spending will have on infrastructure deterioration
        this.roadEffect = Micro.MAX_ROAD_EFFECT;
        this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
        this.fireEffect = Micro.MAX_FIRESTATION_EFFECT;

        if (this.roadMaintenanceBudget > 0) this.roadEffect = Math.floor(this.roadEffect * this.roadSpend / this.roadMaintenanceBudget);
        if (this.fireMaintenanceBudget > 0) this.fireEffect = Math.floor(this.fireEffect * this.fireSpend / this.fireMaintenanceBudget);
        if (this.policeMaintenanceBudget > 0) this.policeEffect = Math.floor(this.policeEffect * this.policeSpend / this.policeMaintenanceBudget);

    }

    collectTax ( gameLevel, census ) {

        this.cashFlow = 0;
        // How much would it cost to fully fund every service?
        this.policeMaintenanceBudget = census.policeStationPop * Micro.policeMaintenanceCost;
        this.fireMaintenanceBudget = census.fireStationPop * Micro.fireMaintenanceCost;

        var roadCost = census.roadTotal * Micro.roadMaintenanceCost;
        var railCost = census.railTotal * Micro.railMaintenanceCost;
        this.roadMaintenanceBudget = Math.floor((roadCost + railCost) * Micro.RLevels[gameLevel]);

        this.taxFund = Math.floor( Math.floor( census.totalPop * census.landValueAverage / 120) * this.cityTax * Micro.FLevels[gameLevel]);

        if (census.totalPop > 0) {
            this.cashFlow = this.taxFund - (this.policeMaintenanceBudget + this.fireMaintenanceBudget + this.roadMaintenanceBudget);
            this.doBudgetNow( false );
        } else {
            // We don't want roads etc deteriorating when population hasn't yet been established
            // (particularly early game)
            this.roadEffect   = Micro.MAX_ROAD_EFFECT;
            this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
            this.fireEffect   = Micro.MAX_FIRESTATION_EFFECT;
        }
    }

    setTax ( amount ) {
        if (amount === this.cityTax) return;
        this.cityTax = amount;
    }

    setFunds ( amount ) {
        if (amount === this.totalFunds) return;
        this.totalFunds = Math.max(0, amount);
        EventEmitter.emitEvent(Messages.FUNDS_CHANGED, this.totalFunds);
        if (this.totalFunds === 0) EventEmitter.emitEvent(Messages.NO_MONEY);
    }

    spend ( amount ) {
        this.setFunds(this.totalFunds - amount);
    }

    shouldDegradeRoad () {
        return this.roadEffect < Math.floor(15 * this.MAX_ROAD_EFFECT / 16);
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class Census {

    constructor () {

        this.clearCensus();
        this.changed = false;
        this.crimeRamp = 0;
        this.pollutionRamp = 0;

        // Set externally
        this.landValueAverage = 0;
        this.pollutionAverage = 0;
        this.crimeAverage = 0;
        this.totalPop = 0;

        var createArray = function(arrName) {
            //this[arrName] = new M_ARRAY_TYPE(120);
            this[arrName] = [];
            //for (var a = 0; a < 120; a++) this[arrName][a] = 0;
            var a = 120;
            while(a--) this[arrName][a] = 0;
        };

        //for (var i = 0; i < Micro.arrs.length; i++) {

        let i = Micro.arrs.length;
        while(i--){
            var name10 = Micro.arrs[i] + 'Hist10';
            var name120 = Micro.arrs[i] + 'Hist120';
            createArray.call(this, name10);
            createArray.call(this, name120);
        }
    }

    save (saveData) {
        for (var i = 0, l = Micro.CensusProps.length; i < l; i++)
            saveData[Micro.CensusProps[i]] = this[Micro.CensusProps[i]];
    }

    load (saveData) {
        for (var i = 0, l = Micro.CensusProps.length; i < l; i++)
            this[Micro.CensusProps[i]] = saveData[Micro.CensusProps[i]];
    }

    clearCensus () {

        this.poweredZoneCount = 0;
        this.unpoweredZoneCount = 0;
        this.firePop = 0;
        this.roadTotal = 0;
        this.railTotal = 0;
        this.resPop = 0;
        this.comPop = 0;
        this.indPop = 0;
        this.resZonePop = 0;
        this.comZonePop = 0;
        this.indZonePop = 0;
        this.hospitalPop = 0;
        this.churchPop = 0;
        this.policeStationPop = 0;
        this.fireStationPop = 0;
        this.stadiumPop = 0;
        this.coalPowerPop = 0;
        this.nuclearPowerPop = 0;
        this.seaportPop = 0;
        this.airportPop = 0;

    }

    take10Census ( budget ) {

        var resPopDenom = 8;
        MiscUtils.rotate10Arrays.call(this);

        this.resHist10[0] = Math.floor(this.resPop / resPopDenom);
        this.comHist10[0] = this.comPop;
        this.indHist10[0] = this.indPop;

        this.crimeRamp += Math.floor((this.crimeAverage - this.crimeRamp) / 4);
        this.crimeHist10[0] = Math.min(this.crimeRamp, 255);

        this.pollutionRamp += Math.floor((this.pollutionAverage - this.pollutionRamp) / 4);
        this.pollutionHist10[0] = Math.min(this.pollutionRamp, 255);

        var x = Math.floor(budget.cashFlow / 20) + 128;
        this.moneyHist10[0] = math.clamp(x, 0, 255);

        this.resPop >> 8;

        if (this.hospitalPop < this.resPopScaled) this.needHospital = 1;
        else if (this.hospitalPop > this.resPopScaled) this.needHospital = -1;
        else if (this.hospitalPop === this.resPopScaled) this.needHospital = 0;

        this.changed = true;

    }

    take120Census () {

        MiscUtils.rotate120Arrays.call(this);
        var resPopDenom = 8;

        this.resHist120[0] = Math.floor(this.resPop / resPopDenom);
        this.comHist120[0] = this.comPop;
        this.indHist120[0] = this.indPop;
        this.crimeHist120[0] = this.crimeHist10[0];
        this.pollutionHist120[0] = this.pollutionHist10[0];
        this.moneyHist120[0] = this.moneyHist10[0];
        this.changed = true;
        
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class BlockMap {

    constructor ( gameMapWidth, gameMapHeight, blockSize ) {

        if (gameMapWidth === undefined || gameMapHeight === undefined || blockSize === undefined) throw new Error('Invalid dimensions for block map')

        this.isBlockMap = true;

        this.blockSize = blockSize;
        this.gameMapWidth = gameMapWidth;
        this.gameMapHeight = gameMapHeight;

        this.width = Math.floor((gameMapWidth + blockSize - 1) / blockSize);
        this.height = Math.floor((gameMapHeight + blockSize - 1) / blockSize);

        this.data = [];
        this.clear();

    }

    clear () {

        let x, y = this.height;
        while( y-- ){
            x = this.width;
            while( x-- ){
                this.data[ this.width * y + x ] = 0;
            }
        }

    }

    copyFrom ( sourceMap, sourceFn ) {

        if (sourceMap.width !== this.width || sourceMap.height !== this.height || sourceMap.blockSize !== this.blockSize) console.warn('Copying from incompatible blockMap!');
        let x, y, height = sourceMap.height, width = sourceMap.width;
        for ( y = 0; y < height; y++) {
            for ( x = 0; x < width; x++){
                this.data[width * y + x] = sourceFn(sourceMap.data[width * y + x]);
            }
        }
    }

    get ( x, y ) {
        return this.data[ this.width * y + x ];
    }

    set ( x, y, value ) {
        this.data[ this.width * y + x ] = value;
    }

    toBlock ( num ) {
        return Math.floor( num / this.blockSize );
    }

    worldGet ( x, y ) { 
        return this.get( this.toBlock(x), this.toBlock(y) );
    }

    worldSet ( x, y, value ) {
        this.set( this.toBlock(x), this.toBlock(y), value );
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const Direction = {

    INVALID: -1,
    NORTH: 0,
    NORTHEAST: 1,
    EAST: 2,
    SOUTHEAST: 3,
    SOUTH: 4,
    SOUTHWEST: 5,
    WEST: 6,
    NORTHWEST: 7,
    BEGIN: 0,
    END: 8,
    
    // Move direction clockwise by 45 degrees. No bounds checking
    // i.e. result could be >= END. Has no effect on INVALID. Undefined
    // when dir >= END
    increment45: function (dir, count) {
        if (arguments.length < 1) throw new TypeError();
        if (dir == Direction.INVALID) return dir;
        if (!count && count !== 0) count = 1;
        return dir + count;
    },
    // Move direction clockwise by 90 degrees. No bounds checking
    // i.e. result could be >= END. Has no effect on INVALID. Undefined
    // when dir >= END
    increment90: function (dir) {
        if (arguments.length < 1) throw new TypeError();
        return Direction.increment45(dir, 2);
    },
    // Move direction clockwise by 45 degrees, taking the direction modulo 8
    // if necessary to force it into valid bounds. Has no effect on INVALID.
    rotate45: function (dir, count) {
        if (arguments.length < 1) throw new TypeError();
        if (dir == Direction.INVALID) return dir;
        if (!count && count !== 0) count = 1;
        return ((dir - Direction.NORTH + count) & 7) + Direction.NORTH;
    },
    // Move direction clockwise by 90 degrees, taking the direction modulo 8
    // if necessary to force it into valid bounds. Has no effect on INVALID.
    rotate90: function (dir) {
        if (arguments.length < 1) throw new TypeError();
        return Direction.rotate45(dir, 2);
    },
    // Move direction clockwise by 180 degrees, taking the direction modulo 8
    // if necessary to force it into valid bounds. Has no effect on INVALID.
    rotate180: function (dir) {
        if (arguments.length < 1) throw new TypeError();
        return Direction.rotate45(dir, 4);
    },
};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class Position {

    constructor ( pos, deltaX, deltaY ) {

        this.isPosition = true;
        this.width = Micro.MAP_WIDTH;
        this.height = Micro.MAP_HEIGHT;
        this.x = 0;
        this.y = 0;


        this.validDirs = [Direction.NORTH, Direction.NORTHEAST, Direction.EAST, Direction.SOUTHEAST,
                        Direction.SOUTH, Direction.SOUTHWEST, Direction.WEST, Direction.NORTHWEST,
                        Direction.INVALID];


        if (arguments.length === 0) return this;

        if (arguments.length === 1 && !pos.isPosition ) throw new Error('Position constructor called with invalid pos ' + pos);

        if (arguments.length === 3 && !pos.isPosition ) throw new Error('Position constructor called with invalid pos ' + pos);

        if (arguments.length === 3 && !(this.isNumber(deltaX) && this.isNumber(deltaY))) throw new Error('Position constructor called with invalid deltas ' + deltaX + ' ' + deltaY);

        if (arguments.length === 2 && this.isNumber(pos) && !this.isNumber(deltaX)) throw new Error('Position constructor called with invalid y coordinate ' + pos + ' ' + deltaX);

        if (arguments.length === 2 && (pos.isPosition) && !(this.isNumber(deltaX) && this.isDirection(deltaX))) throw new Error('Position constructor called with invalid direction ' + pos + ' ' + deltaX);

        if (arguments.length === 2 && !this.isNumber(pos) && !pos.isPosition) throw new Error('Position constructor called with bad existing position ' + pos + ' ' + deltaX);
        

        // This overloaded constructor accepts the following parameters
        // Position(x, y) - positive integral coordinates
        // Position(Position p) - assign from existing position
        // Position(Position p, Direction d) - assign from existing position and move in Direction d
        // Position(Position p, deltaX, deltaY) - assign from p and then adjust x/y coordinates
        // Check for the possible combinations of arguments, and error out for invalid arguments
        //if ((arguments.length === 1 || arguments.length === 3) && !(pos instanceof Position)) throw new Error('Invalid parameter');
        //if (arguments.length === 3 && (!isNumber(deltaX) || !isNumber(deltaY))) throw new Error('Invalid parameter');
        //if (arguments.length === 2 && ((isNumber(pos) && !isNumber(deltaX)) || (pos instanceof Position && !isNumber(deltaX)) || (pos instanceof Position && isNumber(deltaX) && !isDirection(deltaX)) || (!isNumber(pos) && !(pos instanceof Position)))) throw new Error('Invalid parameter');
        let moveOK = true;

        if (this.isNumber(pos)) {
            // Coordinates
            this.x = pos;
            this.y = deltaX;
        } else {
            this.set( pos );
            if (arguments.length === 2) moveOK = this.move( deltaX );
            else if (arguments.length === 3) {
                this.x += deltaX;
                this.y += deltaY;
            }
        }

        if ( this.x < 0 || this.x >= this.width || this.y < 0 || this.y >= this.height || !moveOK) throw new Error('Invalid parameter');
        
    }

    isNumber ( v ) {
        return !isNaN(v)
        //return typeof(v) === 'number';
    }

    isDirection ( param ) {
         return this.isNumber(param) && this.validDirs.indexOf(param) !== -1;
    }

    
    set ( from ) {
        this.x = from.x;
        this.y = from.y;
    }

    toString () {
        return '(' + this.x + ', ' + this.y + ')';
    }

    toInt () {
        return this.y * this.width + this.x;
    }

    move ( dir ) {

        let up = false;
        switch (dir) {
            case Direction.INVALID: return true;//up = true; break;
            case Direction.NORTH: if (this.y > 0) { this.y--; up = true; } break;
            case Direction.NORTHEAST: if (this.y > 0 && this.x < this.width - 1) { this.y--; this.x++; up = true; } break;
            case Direction.EAST: if (this.x < this.width - 1) { this.x++; up = true; } break;
            case Direction.SOUTHEAST: if (this.y < this.height - 1 && this.x < this.width - 1) { this.x++; this.y++; up = true; } break;
            case Direction.SOUTH: if (this.y < this.height - 1) { this.y++; up = true; } break;
            case Direction.SOUTHWEST: if (this.y < this.height - 1 && this.x > 0) { this.y++; this.x--; up = true; } break;
            case Direction.WEST: if (this.x > 0) { this.x--; up = true; } break;
            case Direction.NORTHWEST: if (this.y > 0 && this.x > 0) { this.y--; this.x--; up = true; } break;
        }
        return up;

    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class PowerManager {

    constructor ( map ) {

        this._map = map;
        this._powerStack = [];
        this.powerGridMap = new BlockMap(this._map.width, this._map.height, 1, 0);

    }

    setTilePower (x, y) {

        var tile = this._map.getTile(x, y);
        var tileValue = tile.getValue();

        if (tileValue === Tile.NUCLEAR || tileValue === Tile.POWERPLANT || this.powerGridMap.worldGet(x, y) > 0) {
            tile.addFlags(Tile.POWERBIT);
            return;
        }

        tile.removeFlags(Tile.POWERBIT);

    }

    clearPowerStack () {
        this._powerStackPointer = 0;
        this._powerStack = [];
    }

    testForConductive ( pos, testDir ) {
        var movedPos = new Position(pos);
        if (movedPos.move(testDir)) {
            if (this._map.getTile(movedPos.x, movedPos.y).isConductive()) {
                if (this.powerGridMap.worldGet(movedPos.x, movedPos.y) === 0)
                    return true;
            }
        }
        return false;
    }

    // Note: the algorithm is buggy: if you have two adjacent power
    // plants, the second will be regarded as drawing power from the first
    // rather than as a power source itself
    doPowerScan ( census ) {
        // Clear power this._map.
        this.powerGridMap.clear();

        // Power that the combined coal and nuclear power plants can deliver.
        let maxPower = census.coalPowerPop * Micro.COAL_POWER_STRENGTH + census.nuclearPowerPop * Micro.NUCLEAR_POWER_STRENGTH;

        let powerConsumption = 0; // Amount of power used.

        while (this._powerStack.length > 0) {
            var pos = this._powerStack.pop();
            var anyDir = Direction.INVALID;
            var conNum;
            do {
                powerConsumption++;
            if (powerConsumption > maxPower) {
                EventEmitter.emitEvent(Messages.NOT_ENOUGH_POWER);
                return;
            }

            if (anyDir !== Direction.INVALID)
                pos.move(anyDir);

            this.powerGridMap.worldSet(pos.x, pos.y, 1);
            conNum = 0;
            var dir = Direction.BEGIN;

            while (dir < Direction.END && conNum < 2) {
                if (this.testForConductive(pos, dir)) {
                    conNum++;
                    anyDir = dir;
                }
                dir = Direction.increment90(dir);
            }
            if (conNum > 1) this._powerStack.push( new Position(pos) );
            } while ( conNum );
        }
    }

    coalPowerFound ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.coalPowerPop += 1;
        this._powerStack.push(new Position(x, y));

        // Ensure animation runs
        var dX = [-1, 2, 1, 2];
        var dY = [-1, -1, 0, 0];

        // Ensure animation bits set no animation for 3d
        if(!simData.is3D) for (var i = 0; i < 4; i++) map.addTileFlags(x + dX[i], y + dY[i], Tile.ANIMBIT); 

    }

    nuclearPowerFound ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        var meltdownTable = [30000, 20000, 10000];
        // TODO With the auto repair system, zone gets repaired before meltdown
        // In original Micropolis code, we bail and don't repair if melting down
        if (simData.disasterManager.disastersEnabled && math.getRandom(meltdownTable[simData.gameLevel]) === 0) {
           // simData.disasterManager.doMeltdown(messageManager, x, y);
            return;
        }
        simData.census.nuclearPowerPop += 1;
        this._powerStack.push(new Position(x, y));
        //console.log(x, y, new map.Position(x, y))

        // Ensure animation bits set   no animation for 3d
        if(!simData.is3D) 
            for (var i = 0; i < 4; i++)  map.addTileFlags(x, y, Tile.ANIMBIT | Tile.CONDBIT | Tile.POWERBIT | Tile.BURNBIT);
    }

    registerHandlers (mapScanner, repairManager) {
        mapScanner.addAction(Tile.POWERPLANT, this.coalPowerFound.bind(this));
        mapScanner.addAction(Tile.NUCLEAR, this.nuclearPowerFound.bind(this));
        repairManager.addAction(Tile.POWERPLANT, 7, 4);
        repairManager.addAction(Tile.NUCLEAR, 7, 4);
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * switch to ES6 by lo-th
 *
 */

class MapScanner {

    constructor ( map ) {

        this._map = map;
        this._actions = [];

    }

    addAction ( criterion, action ) {

        this._actions.push({ criterion: criterion, action: action });

    }

    mapScan ( startX, maxX, simData ) {

        if(!simData) simData = Micro.simData;

        let y = this._map.height, x, i, id, tile, tileValue, current, callable;
        
        while( y-- ){

            for ( x = startX; x < maxX; x++ ) {
                
                id = this._map.getId( x, y ); //x + y * this.mapWidth; 
                tile = this._map.data[id] || new Tiles();
                tileValue = tile.getValue();

                if ( tileValue < Tile.FLOOD ) continue;

                if ( tile.isConductive() ) simData.powerManager.setTilePower(x, y);

                if ( tile.isZone() ) {
                    simData.repairManager.checkTile( x, y, simData.cityTime );
                    if ( tile.isPowered() ){ simData.census.poweredZoneCount += 1; this._map.powered({ v:1, id:id });/*this._map.powerData[id] = 1;*/ }
                    else { simData.census.unpoweredZoneCount += 1; this._map.powered({ v:2, id:id });/*this._map.powerData[id] = 2;*/ }
                }

                i = this._actions.length;
                while(i--){

                    current = this._actions[i];
                    callable = MiscUtils.isCallable(current.criterion);

                    if (callable && current.criterion.call(null, tile)) {
                        current.action.call(null, this._map, x, y, simData);
                        break;
                    } else if (!callable && current.criterion === tileValue) {
                        current.action.call(null, this._map, x, y, simData);
                        break;
                    }
                }
            }
        }
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class RepairManager {

    constructor ( map ) {

        this._map = map;
        this._actions = [];

    }

    addAction ( criterion, period, zoneSize ) {

        this._actions.push({ criterion: criterion, period: period, zoneSize: zoneSize });

    }

    repairZone ( x, y, zoneSize ) {

        let xx, yy, current, currentValue;
        let centre = this._map.getTileValue(x, y);
        let tileValue = centre - zoneSize - 2;

        for ( yy = -1; yy < zoneSize - 1; yy++) {
            for ( xx = -1; xx < zoneSize - 1; xx++) {
                tileValue++;

                current = this._map.getTile(x + xx, y + yy);
                if (current.isZone() || current.isAnimated()) continue;

                currentValue = current.getValue();
                if (currentValue < Tile.RUBBLE || currentValue >= Tile.ROADBASE)
                    this._map.setTile(x + xx, y + yy, tileValue, Tile.CONDBIT | Tile.BURNBIT);
            }
        }

    }

    checkTile ( x, y, cityTime ) {

        let i = this._actions.length, current, period, tile, tileValue, callable;

        while( i-- ){

            current = this._actions[i];
            period = current.period;
          
            if ((cityTime & period) !== 0) continue;

            tile = this._map.getTile(x, y);
            tileValue = tile.getValue();

            callable = MiscUtils.isCallable( current.criterion );
            if (callable && current.criterion.call(null, tile)) this.repairZone( x, y, current.zoneSize );
            else if (!callable && current.criterion === tileValue) this.repairZone( x, y, current.zoneSize );

        }

    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class Traffic {

    constructor ( map, spriteManager ) {

        this._map = map;
        this._stack = [];
        this._spriteManager = spriteManager;

    }

    makeTraffic ( x, y, blockMaps, destFn ) {

        this._stack = [];

        let pos = new Position(x, y);

        if (this.findPerimeterRoad(pos)) {
            if (this.tryDrive(pos, destFn)) {
                this.addToTrafficDensityMap(blockMaps);
                return Micro.ROUTE_FOUND;
            }
            return Micro.NO_ROUTE_FOUND;
        } else {
            return Micro.NO_ROAD_FOUND;
        }

    }

    addToTrafficDensityMap ( blockMaps ) {

        let trafficDensityMap = blockMaps.trafficDensityMap;

        while ( this._stack.length > 0 ) {

            let pos = this._stack.pop();

            // Could this happen?!?
            if (!this._map.testBounds(pos.x, pos.y)) continue;

            let tileValue = this._map.getTileValue( pos.x, pos.y );

            if ( tileValue >= Tile.ROADBASE && tileValue < Tile.POWERBASE ) {
                // Update traffic density.
                let traffic = trafficDensityMap.worldGet(pos.x, pos.y);
                traffic += 50;
                traffic = Math.min(traffic, 240);
                trafficDensityMap.worldSet(pos.x, pos.y, traffic);

                // Attract traffic copter to the traffic
                if (traffic >= 240 && math.getRandom(5) === 0) {
                    let sprite = this._spriteManager.getSprite(Micro.SPRITE_HELICOPTER);
                    if (sprite !== null) {
                        sprite.destX = ZoneUtils.worldToPix(pos.x);
                        sprite.destY = ZoneUtils.worldToPix(pos.y);
                    }
                }
            }
        }

    }

    findPerimeterRoad ( pos ) {

        for ( let i = 0; i < 12; i++ ) {

            let xx = pos.x + Micro.perimX[i];
            let yy = pos.y + Micro.perimY[i];

            if (this._map.testBounds(xx, yy)) {
                if (ZoneUtils.isDriveable(this._map.getTileValue(xx, yy))) {
                    pos.x = xx;
                    pos.y = yy;
                    return true;
                }
            }
        }
        return false;

    }

    tryDrive ( startPos, destFn ) {

        let dirLast = Direction.INVALID;
        let drivePos = new Position(startPos);

        /* Maximum distance to try */
        for (let dist = 0; dist < Micro.MAX_TRAFFIC_DISTANCE; dist++) {
            let dir = this.tryGo(drivePos, dirLast);
            if (dir != Direction.INVALID) {
                drivePos.move(dir);
                dirLast = Direction.rotate180(dir);

                if (dist & 1) this._stack.push( new Position(drivePos) );
                if (this.driveDone(drivePos, destFn)) return true;
            } else {
                if (this._stack.length > 0) {
                    this._stack.pop();
                    dist += 3;
                } else {
                    return false;
                }
            }
        }
        return false;
    }

    tryGo ( pos, dirLast ) {

        let  directions = [];
        // Find connections from current position.
        let dir = Direction.NORTH;
        let i, count = 0;

        for ( i = 0; i < 4; i++ ) {
            if (dir != dirLast && ZoneUtils.isDriveable(this._map.getTileFromMapOrDefault(pos, dir, Tile.DIRT))) {
                // found a road in an allowed direction
                directions[i] = dir;
                count++;
            } else {
                directions[i] = Direction.INVALID;
            }
            dir = Direction.rotate90(dir);
        }
        if (count === 0) return Direction.INVALID;
        if (count === 1) {
            for (i = 0; i < 4; i++) {
                if (directions[i] != Direction.INVALID) return directions[i];
            }
        }
        i = math.getRandom16() & 3;
        while ( directions[i] === Direction.INVALID ) i = (i + 1) & 3;
        return directions[i];
        
    }

    driveDone ( pos, destFn ) {

        if (pos.y > 0) { if (destFn(this._map.getTileValue(pos.x, pos.y - 1))) return true; }
        if (pos.x < (this._map.width - 1)) { if (destFn(this._map.getTileValue(pos.x + 1, pos.y))) return true; }
        if (pos.y < (this._map.height - 1)) { if (destFn(this._map.getTileValue(pos.x, pos.y + 1))) return true; }
        if (pos.x > 0) { if (destFn(this._map.getTileValue(pos.x - 1, pos.y))) return true; }
        return false;

    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const vulnerable = function( tile ) {

    let tileValue = tile.getValue();
    if (tileValue < Tile.RESBASE || tileValue > Tile.LASTZONE || tile.isZone()) return false;
    return true;

};

class DisasterManager {

    constructor ( map, spriteManager, gameLevel ) {

        this._map = map;
        this._spriteManager = spriteManager;
        this._gameLevel = gameLevel;

        this._floodCount = 0;
        this.disastersEnabled = false;

        this.Dx = [ 0, 1, 0, -1];
        this.Dy = [-1, 0, 1, 0];

        // TODO enable disasters
        //Object.defineProperty(this, 'disastersEnabled', MiscUtils.mcd(false));
    }

    doDisasters ( census ) {

        if (this._floodCount) this._floodCount--;

        // TODO Scenarios

        if (!this.disastersEnabled) return;

        if (math.getRandom(Micro.DisChance[this._gameLevel])) {
            switch (math.getRandom(8)) {
                case 0:
                case 1: this.setFire(); break;

                case 2:
                case 3: this.makeFlood(); break;

                case 4:
                  break;

                case 5: this._spriteManager.makeTornado(); break;

                case 6:
                    // TODO Earthquakes
                    //this.makeEarthquake();
                break;

                case 7:
                case 8: if (census.pollutionAverage > 60) this._spriteManager.makeMonster(); break;
            }
        }
    }

    setDifficulty (gameLevel) {
        this._gameLevel = gameLevel;
    }

    scenarioDisaster () {
        // TODO Scenarios
    }
    // User initiated meltdown: need to find the plant first
    makeMeltdown () {
        for (let x = 0; x < (this._map.width - 1); x++) {
            for (let y = 0; y < (this._map.height - 1); y++) {
                if (this._map.getTileValue(x, y) === Tile.NUCLEAR) {
                    this.doMeltdown( x, y );
                    return;
                }
            }
        }
    }

    makeEarthquake () {

        let strength = math.getRandom(700) + 300;
        this.doEarthquake(strength);

        EventEmitter.emitEvent(Messages.EARTHQUAKE, {x: this._map.cityCenterX, y: this._map.cityCenterY});

        let i, x, y;

        for ( i = 0; i < strength; i++)  {
            x = math.getRandom(this._map.width - 1);
            y = math.getRandom(this._map.height - 1);

            if (vulnerable(this._map.getTile(x, y))) {
                if ((i & 0x3) !== 0) this._map.setTo(x, y, ZoneUtils.randomRubble());
                else this._map.setTo(x, y, ZoneUtils.randomFire());
            }
        }

    }

    setFire ( times = 1, zonesOnly = false ) {

        let i, x, y, tile, lowerLimit;

        for ( i = 0; i < times; i++) {
            x = math.getRandom(this._map.width - 1);
            y = math.getRandom(this._map.height - 1);

            if (!this._map.testBounds(x, y)) continue;

            tile = this._map.getTile(x, y);

            if (!tile.isZone()) {
                tile = tile.getValue();
                lowerLimit = zonesOnly ? Tile.LHTHR : Tile.TREEBASE;
                if (tile > lowerLimit && tile < Tile.LASTZONE) {
                    this._map.setTo(x, y, ZoneUtils.randomFire());
                    EventEmitter.emitEvent(Messages.FIRE_REPORTED, {showable: true, x: x, y: y});
                    return;
                }
            }
        }
    }

    makeCrash () {

        let s = this._spriteManager.getSprite(Micro.SPRITE_AIRPLANE);
        if (s !== null) { s.explodeSprite(); return; }

        let x = math.getRandom(this._map.width - 1);
        let y = math.getRandom(this._map.height - 1);
        this._spriteManager.generatePlane(x, y);
        s = this._spriteManager.getSprite(Micro.SPRITE_AIRPLANE);
        s.explodeSprite();

    }

    makeFire () {

        this.setFire( 40, false);

    }

    makeFlood () {

        let i, x, y, tileValue, j, xx, yy, tile;

        for ( i = 0; i < 300; i++) {
            x = math.getRandom(this._map.width - 1);
            y = math.getRandom(this._map.height - 1);
            if (!this._map.testBounds(x, y)) continue;

            tileValue = this._map.getTileValue(x, y);

            if (tileValue > Tile.CHANNEL && tileValue <= Tile.WATER_HIGH) {
                for ( j = 0; j < 4; j++) {
                    xx = x + this.Dx[j];
                    yy = y + this.Dy[j];

                    if (!this._map.testBounds(xx, yy)) continue;

                    tile = this._map.getTile(xx, yy);
                    tileValue = tile.getValue();

                    if (tile === Tile.DIRT || (tile.isBulldozable() && tile.isCombustible)) {
                        this._map.setTo(xx, yy, new Tiles(Tile.FLOOD));
                        this._floodCount = 30;
                        EventEmitter.emitEvent(Messages.FLOODING_REPORTED, {showable: true, x: xx, y: yy});
                        return;
                    }
                }
            }
        }

    }

    doFlood ( x, y, blockMaps ) {

        let i, xx, yy, tile, tileValue;

        if (this._floodCount > 0) {
            // Flood is not over yet
            for ( i = 0; i < 4; i++) {
                if (math.getChance(7)) {
                    xx = x + this.Dx[i];
                    yy = y + this.Dy[i];

                    if (this._map.testBounds(xx, yy)) {
                        tile = this._map.getTile(xx, yy);
                        tileValue = tile.getValue();

                        if (tile.isCombustible() || tileValue === Tile.DIRT || (tileValue >= Tile.WOODS5 && tileValue < Tile.FLOOD)) {
                            if (tile.isZone()) ZoneUtils.fireZone(this.map, xx, yy, blockMaps);

                            this._map.setTile(xx, yy, Tile.FLOOD + math.getRandom(2), 0);
                            //this._map.setTo(xx, yy, new Tiles(Tile.FLOOD + math.getRandom(2)));
                        }
                    }
                }
            }
        } else {
            if (math.getChance(15)) this._map.setTile(x, y, Tile.DIRT, 0);
        }

    }

    doMeltdown ( x, y ) {

        this._spriteManager.makeExplosion(x - 1, y - 1);
        this._spriteManager.makeExplosion(x - 1, y + 2);
        this._spriteManager.makeExplosion(x + 2, y - 1);
        this._spriteManager.makeExplosion(x + 2, y + 2);

        let i, dY, dX, tile;

        // Whole power plant is at fire
        for (dX = x - 1; dX < x + 3; dX++) {
            for (dY = y - 1; dY < y + 3; dY++) {
                this._map.setTo(dX, dY, ZoneUtils.randomFire());
            }
        }

        // Add lots of radiation tiles around the plant
        for ( i = 0; i < 200; i++)  {
            dX = x - 20 + math.getRandom(40);
            dY = y - 15 + math.getRandom(30);

            if (!this._map.testBounds(dX, dY)) continue;

            tile = this._map.getTile(dX, dY);

            if (tile.isZone()) continue;
            if (tile.isCombustible() || tile.getValue() === Tile.DIRT) this._map.setTile(dX, dY, Tile.RADTILE, 0);//this._map.setTo(dX, dY, new Tiles(Tile.RADTILE));
        }

        // Report disaster to the user
        EventEmitter.emitEvent(Messages.NUCLEAR_MELTDOWN, {showable: true, x: x, y: y});
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const freeZone = [0, 3, 6, 1, 4, 7, 2, 5, 8];

const Residential = {

    registerHandlers: function ( mapScanner, repairManager ) {
        mapScanner.addAction(ZoneUtils.isResidentialZone, Residential.residentialFound);
        mapScanner.addAction(ZoneUtils.HOSPITAL, Residential.hospitalFound);
        repairManager.addAction(Tile.HOSPITAL, 15, 3);
    },

    // Residential tiles have 'populations' of 16, 24, 32 or 40
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value
    placeResidential: function ( map, x, y, population, lpValue, zonePower ) {

        let centreTile = ((lpValue * 4) + population) * 9 + Tile.RZB;
        ZoneUtils.putZone( map, x, y, centreTile, zonePower );

    },

    // Look for housing in the adjacent 8 tiles
    getFreeZonePopulation: function( map, x, y, tileValue ) {

        let count = 0, xx, yy;
        for ( xx = x - 1; xx <= x + 1; xx++) {
            for ( yy = y - 1; yy <= y + 1; yy++) {
                if (xx === x && yy === y) continue;
                tileValue = map.getTileValue(xx, yy);
                if (tileValue >= Tile.LHTHR && tileValue <= Tile.HHTHR) count += 1;
            }
        }
        return count;
    },

    getZonePopulation: function ( map, x, y, tileValue ) {
        //if ( tileValue.isTile ) tileValue =  new Tiles().getValue();
        if ( tileValue === Tile.FREEZ) return Residential.getFreeZonePopulation(map, x, y, tileValue);
        let populationIndex = Math.floor((tileValue - Tile.RZB) / 9) % 4 + 1;
        return populationIndex * 8 + 16;
    },

    // Assess a tile for suitability for a house. Prefer tiles near roads
    evalLot: function( map, x, y ) {

        let xDelta = [0, 1, 0, -1];
        let yDelta = [-1, 0, 1, 0];

        if (!map.testBounds(x, y)) return -1;

        let tileValue = map.getTileValue(x, y);
        if (tileValue < Tile.RESBASE || tileValue > Tile.RESBASE + 8) return -1;

        let score = 1, i, edgeX, edgeY;
        for ( i = 0; i < 4; i++) {

            edgeX = x + xDelta[i];
            edgeY = y + yDelta[i];
            if (edgeX < 0 || edgeX >= map.width || edgeY < 0 || edgeY >= map.height) continue;
            tileValue = map.getTileValue(edgeX, edgeY);
            if (tileValue !== Tile.DIRT && tileValue <= Tile.LASTROAD) score += 1;
        }
        return score;

    },

    buildHouse: function ( map, x, y, lpValue ) {

        let best = 0;
        let bestScore = 0;

        //  Deliberately ordered so that the centre tile is at index 0
        let xDelta = [0, -1, 0, 1, -1, 1, -1, 0, 1];
        let yDelta = [0, -1, -1, -1, 0, 0, 1, 1, 1];

        let i, xx, yy, score;

        for ( i = 0; i < 9; i++) {
            xx = x + xDelta[i];
            yy = y + yDelta[i];
            score = Residential.evalLot(map, xx, yy);
            if (score > bestScore) {
                bestScore = score;
                best = i;
            } else if (score === bestScore && math.getChance(7)) {
                // Ensures we don't always select the same position when we
                // have a choice
                best = i;
            }
        }
        if (best > 0 && map.testBounds(x + xDelta[best], y + yDelta[best])) 
            map.setTile(x + xDelta[best], y + yDelta[best], Tile.HOUSE + math.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT);
            //map.setTo(x + xDelta[best], y + yDelta[best], new Tiles(Tile.HOUSE + math.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT));
            //map.setTile(x + xDelta[best], y + yDelta[best], new Tiles(Tile.HOUSE + math.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT));
    },

    growZone: function ( map, x, y, blockMaps, population, lpValue, zonePower ) {

        let pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
        // Cough! Too polluted noone wants to move here!
        if (pollution > 128) return;

        let tileValue = map.getTileValue(x, y);

        if (tileValue === Tile.FREEZ) {
            if (population < 8) {
                // Zone capacity not yet reached: build another house
                Residential.buildHouse(map, x, y, lpValue);
                ZoneUtils.incRateOfGrowth(blockMaps, x, y, 1);
            }
            else if (blockMaps.populationDensityMap.worldGet(x, y) > 64) {
                // There is local demand for higher density housing
                Residential.placeResidential(map, x, y, 0, lpValue, zonePower);
                ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
                
            }

            return;
        }

        if (population < 40) {
            // Zone population not yet maxed out
            Residential.placeResidential(map, x, y, Math.floor(population / 8) - 1, lpValue, zonePower);
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
        }
    },

    degradeZone: function ( map, x, y, blockMaps, population, lpValue, zonePower ) {
        let xx, yy;
        if (population === 0) return;

        if (population > 16) {
            // Degrade to a lower density block
            Residential.placeResidential(map, x, y, Math.floor((population - 24) / 8), lpValue, zonePower);
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        if (population === 16) {
            // Already at lowest density: degrade to 8 individual houses
            map.setTo(x, y, new Tiles(Tile.FREEZ, Tile.BLBNCNBIT | Tile.ZONEBIT));

            for (yy = y - 1; yy <= y + 1; yy++) {
                for (xx = x - 1; xx <= x + 1; xx++) {
                    if (xx === x && yy === y) continue;
                    map.setTile(x, y, Tile.LHTHR + lpValue + math.getRandom(2), Tile.BLBNCNBIT);
                    //map.setTo(x, y, new Tiles(Tile.LHTHR + lpValue + math.getRandom(2), Tile.BLBNCNBIT));
                } 
            }
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        // Already down to individual houses. Remove one
        let i = 0;
        ZoneUtils.incRateOfGrowth(blockMaps, x, y, -1);

        for (xx = x - 1; xx <= x + 1; xx++) {
            for (yy = y - 1; yy <= y + 1; yy++) {
                let currentValue = map.getTileValue(xx, yy);
                if (currentValue >= Tile.LHTHR && currentValue <= Tile.HHTHR) {
                    // We've found a house. Replace it with the normal free zone tile
                    map.setTile(xx, yy, freeZone[i] + Tile.RESBASE, Tile.BLBNCNBIT);
                    //map.setTo(xx, yy, new Tiles(freeZone[i] + Tile.RESBASE, Tile.BLBNCNBIT));
                    return;
                } 
                i += 1;
            } 
        } 
    },

    // Returns a score for the zone in the range -3000 - 3000
    evalResidential: function ( blockMaps, x, y, traffic ) {

        if (traffic === Micro.NO_ROAD_FOUND) return -3000;
        let landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
        if (landValue < 0)  landValue = 0;
        else landValue = Math.min(landValue * 32, 6000);
        return landValue - 3000;

    },

    residentialFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;
        // If we choose to grow this zone, we will fill it with an index in the range 0-3 reflecting the land value and
        // pollution scores (higher is better). This is then used to select the variant to build
        let lpValue;
        // Notify the census
        simData.census.resZonePop += 1;

        // Also, notify the census of our population
        let tileValue = map.getTileValue(x, y);
        let population = Residential.getZonePopulation(map, x, y, tileValue);
        simData.census.resPop += population;

        let zonePower = map.getTile(x, y).isPowered();

        let trafficOK = Micro.ROUTE_FOUND;

        // Occasionally check to see if the zone is connected to the road network. The chance of this happening increases
        // as the zone's population increases. Note: we will never execute this conditional if the zone is empty, as zero
        // will never be be bigger than any of the values Random will generate
        if (population > math.getRandom(35)) {
            // Is there a route from this zone to a commercial zone?
            trafficOK = simData.traffic.makeTraffic(x, y, simData.blockMaps, ZoneUtils.isCommercial);

            // If we're not connected to the road network, then going shopping will be a pain. Move out.
            if (trafficOK ===  Micro.NO_ROAD_FOUND) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Residential.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }
        }

        // Sometimes we will randomly choose to assess this block. However, always assess it if it's empty or contains only single houses.
        if (tileValue === Tile.FREEZ || math.getChance(7)) {
            // First, score the individual zone. This is a value in the range -3000 to 3000
            // Then take into account global demand for housing.
            let locationScore = Residential.evalResidential(simData.blockMaps, x, y, trafficOK);
            let zoneScore = simData.valves.resValve + locationScore;

            // Naturally unpowered zones should be penalized
            if (!zonePower) zoneScore = -500;
            // The residential demand valve has range -2000 to 2000, so taking into account the "no traffic" and
            // "no power" modifiers above, zoneScore must lie in the range -5500 - 5000.

            // Now, observe that if there are no roads we will never take this branch, as zoneScore will equal -3000.
            // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -20880.
            // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
            // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
            // 81.8% of them are above -20880, so nearly 82% of the time, we will never take this branch.
            // Thus, there's approximately a 9% chance that the value will be in the range, and we *might* grow.
            //if (trafficOK && (zoneScore > -350) && ((zoneScore - 26380) > math.getRandom16Signed())) {
            if (zoneScore > -350 && (zoneScore - 26380) > math.getRandom16Signed()) {
                // If this zone is empty, and residential demand is strong, we might make a hospital
                //if (population === 0 && ((math.getRandom16() & 3) === 0)) {
                if (population === 0 && math.getChance(3)) {
                    Residential.makeHospital(map, x, y, simData, zonePower);
                    return;
                }
                // Get an index in the range 0-3 scoring the land desirability and pollution, and grow the zone to the next
                // population rank
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Residential.growZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }
            // Again, given the above, zoneScore + 26380 must lie in the range 20880 - 26030.
            // There is a 10.2% chance of getRandom16() always yielding a number > 27994 which would take this branch.
            // There is a 89.7% chance of the number being below 20880 thus never triggering this branch, which leaves a
            // 0.1% chance of this branch being conditional on zoneScore.
            if (zoneScore < 350 && ((zoneScore + 26380) < math.getRandom16Signed())) {
                // Get an index in the range 0-3 scoring the land desirability and pollution, and degrade to the next
                // lower ranked zone
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Residential.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
            }
        }
    },

    makeHospital: function ( map, x, y, simData, zonePower ) {
        if(!simData) simData = Micro.simData;
        // We only build a hospital if the population requires it
        if (simData.census.needHospital > 0) {
            ZoneUtils.putZone(map, x, y, Tile.HOSPITAL, zonePower);
            simData.census.needHospital = 0;
            return;
        } 
    },

    hospitalFound: function ( map, x, y, simData ) {
        if(!simData) simData = Micro.simData;
            
        simData.census.hospitalPop += 1;
        // Degrade to an empty zone if a hospital is no longer sustainable
        if (simData.census.needHospital === -1) {
            if (math.getRandom(20) === 0) ZoneUtils.putZone(map, x, y, Tile.FREEZ, map.getTile(x, y).isPowered());
        }
    }

};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


const Commercial = {

    registerHandlers: function( mapScanner, repairManager ) {
        mapScanner.addAction(ZoneUtils.isCommercialZone, Commercial.commercialFound );
    },

    // Commercial tiles have 'populations' from 1 to 5,
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value
    getZonePopulation: function(map, x, y, tileValue) {
        //if (tileValue.isTile ) tileValue = new Tiles().getValue(); //COMCLEAR)
        if (tileValue === Tile.COMCLR) return 0;
        return Math.floor((tileValue - Tile.CZB) / 9) % 5 + 1;
        
    },

    // Takes a map and coordinates, a population category in the range 1-5, a value category in the range 0-3, and places
    // the appropriate industrial zone on the map
    placeCommercial: function ( map, x, y, population, lpValue, zonePower ) {
        var centreTile = ((lpValue * 5) + population) * 9 + Tile.CZB;
        ZoneUtils.putZone(map, x, y, centreTile, zonePower);
    },

    growZone: function ( map, x, y, blockMaps, population, lpValue, zonePower ) {
        // landValueMap contains values in the range 0-250, representing the desirability of the land.
        // Thus, after shifting, landValue will be in the range 0-7.
        var landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue = landValue >> 5;

        if (population > landValue) return;

        // This zone is desirable, and seemingly not to crowded. Switch to the next category of zone.
        if (population < 5) {
           Commercial.placeCommercial(map, x, y, population, lpValue, zonePower);
           ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
        }
    },

    degradeZone: function (map, x, y, blockMaps, populationCategory, lpCategory, zonePower) {
        // Note that we special case empty zones here, rather than having to check population value on every
        // call to placeIndustrial (which we anticipate will be called more often)
        if (populationCategory > 1) {
            Commercial.placeCommercial(map, x, y, populationCategory - 2, lpCategory, zonePower);
        } else {
           ZoneUtils.putZone(map, x, y, Tile.COMCLR, zonePower);
        }

        ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    },

    // Called by the map scanner when it finds the centre of an commercial zone
    commercialFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;
        // lpValue will be filled if we actually decide to trigger growth/decay. It will be an index of the land/pollution
        // value in the range 0-3
        var lpValue;

        // Notify the census
        simData.census.comZonePop += 1;

        // Calculate the population level for this tile, and add to census
        var tileValue = map.getTileValue(x, y);
        var population = Commercial.getZonePopulation(map, x, y, tileValue);
        simData.census.comPop += population;

        var zonePower = map.getTile(x, y).isPowered();

        // Occasionally check to see if the zone is connected to the transport network (the chance of this happening
        // increases as the population increases). Growth naturally stalls if consumers cannot reach the shops.
        // Note in particular, we will never take this branch if the zone is empty.
        var trafficOK = Micro.ROUTE_FOUND;
        if (population > math.getRandom(5)) {
            // Try to find a route from here to an industrial zone
            trafficOK = simData.traffic.makeTraffic(x, y, simData.blockMaps, ZoneUtils.isIndustrial);

            // Trigger outward migration if not connected to road network
            if (trafficOK === Micro.NO_ROAD_FOUND) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Commercial.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }
        }

        // Occasionally assess and perhaps modify the tile
        if (math.getChance(7)) {

            var locationScore = trafficOK === Micro.NO_ROAD_FOUND ? -3000 : simData.blockMaps.cityCentreDistScoreMap.worldGet(x, y);
            var zoneScore = simData.valves.comValve + locationScore;

            // Unpowered zones should of course be penalized
            if (!zonePower) zoneScore = -500;

            // The commercial demand valve has range -1500 to 1500, so taking into account the "no traffic" and
            // "no power" modifiers above, zoneScore must lie in the range -5064 - 1564. (The comRateMap, which scores
            // commercial neighbourhoods based on their distance from the city centre, has range -64 to 64).

            // First: observe that if there are no roads we will never take this branch, as zoneScore will be <= -3000.
            // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -24816.
            // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
            // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
            // 87.8% of them are above -24816, so nearly 88% of the time, we will never take this branch.
            // Thus, there's approximately a 3% chance that the value will be in the range, and we *might* grow.
            // This has the nice effect of not preventing an individual unit from growing even if overall demand has collapsed
            // (the business itself might still be growing.
            if (zonePower && zoneScore > -350 && (zoneScore - 26380) > math.getRandom16Signed()) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Commercial.growZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }

            // Again, given the  above, zoneScore + 26380 must lie in the range 21316 - 27944.
            // There is a 7.3% chance of getRandom16() always yielding a number > 27994 which would take this branch.
            // There is a 82.5% chance of the number being below 21316 thus never triggering this branch, which leaves a
            // 10.1% chance of this branch being conditional on zoneScore.
            if (zoneScore < 350 && (zoneScore + 26380) < math.getRandom16Signed()) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Commercial.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
            }
        }
    }
};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const animated = [true, false, true, true, false, false, true, true];
const xDelta = [-1, 0, 1, 0, 0, 0, 0, 1];
const yDelta = [-1, 0, -1, -1, 0, 0, -1, -1];

const Industrial = {

    registerHandlers: function(mapScanner, repairManager) {
        mapScanner.addAction( ZoneUtils.isIndustrialZone, Industrial.industrialFound );
    },

    // Industrial tiles have 'populations' from 1 to 4,
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value

    getZonePopulation: function( map, x, y, tileValue ) {

        if (tileValue === Tile.INDCLR) return 0;
        return Math.floor((tileValue - Tile.IZB) / 9) % 4 + 1;

    },

    placeIndustrial: function(map, x, y, populationCategory, valueCategory, zonePower) {
        var centreTile = ((valueCategory * 4) + populationCategory) * 9 + Tile.IZB;
        ZoneUtils.putZone(map, x, y, centreTile, zonePower);
    },

    growZone: function(map, x, y, blockMaps, population, valueCategory, zonePower) {
        // Switch to the next category of zone
        if (population < 4) {
            Industrial.placeIndustrial(map, x, y, population, valueCategory, zonePower);
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
        }
    },

    degradeZone: function(map, x, y, blockMaps, populationCategory, valueCategory, zonePower) {
        // Note that we special case empty zones here, rather than having to check population value on every
        // call to placeIndustrial (which we anticipate will be called more often)
        if (populationCategory > 1) Industrial.placeIndustrial( map, x, y, populationCategory - 2, valueCategory, zonePower );
        else ZoneUtils.putZone(map, x, y, Tile.INDCLR, zonePower);

        ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    },



    // Takes a map and coordinates, the tile value of the centre of the zone, and a boolean indicating whether
    // the zone has power, and sets or unsets the animation bit in the appropriate part of the zone
    setAnimation: function(map, x, y, tileValue, isPowered) {

        if (tileValue < Tile.IZB) return;
        // There are only 7 different types of populated industrial zones.
        // As tileValue - IZB will never be 8x9 or more away from IZB, we
        // can shift right by 3, and get the same effect as dividing by 9
        var i = (tileValue - Tile.IZB) >> 3;

        if (animated[i] && isPowered) {
            map.addTileFlags(x + xDelta[i], y + yDelta[i], Tile.ASCBIT);
        } else {
            map.addTileFlags(x + xDelta[i], y + yDelta[i], Tile.BNCNBIT);
            map.removeTileFlags(x + xDelta[i], y + yDelta[i], Tile.ANIMBIT);
        }
    },

    industrialFound: function(map, x, y, simData) {
        
        if(!simData) simData = Micro.simData;

        simData.census.indZonePop += 1;

        // Calculate the population level for this tile, and add to census
        var tileValue = map.getTileValue(x, y);
        var population = Industrial.getZonePopulation( map, x, y, tileValue );
        simData.census.indPop += population;

        // Set animation bit if appropriate
        var zonePower = map.getTile(x, y).isPowered();
        if(!simData.is3D) Industrial.setAnimation( map, x, y, tileValue, zonePower );

        // Occasionally check to see if the zone is connected to the transport network (the chance of this happening
        // increases as the population increases). Growth naturally stalls if workers cannot reach the factories.
        // Note in particular, we will never take this branch if the zone is empty.
        var trafficOK = Micro.ROUTE_FOUND;
        if (population > math.getRandom(5)) {
            // Try to find a route from here to a residential zone
            trafficOK = simData.traffic.makeTraffic( x, y, simData.blockMaps, ZoneUtils.isResidential );

            // Trigger outward migration if not connected to road network (unless the zone is already empty)
            if (trafficOK === Micro.NO_ROAD_FOUND) {
                var newValue = math.getRandom16() & 1;
                Industrial.degradeZone(map, x, y, simData.blockMaps, population, newValue, zonePower);
                return;
            }
        }

        // Occasionally assess and perhaps modify the tile
        if (math.getChance(7)) {
        var zoneScore = simData.valves.indValve + (trafficOK === Micro.NO_ROAD_FOUND ? -1000 : 0);

        // Unpowered zones should of course be penalized
        if (!zonePower) zoneScore = -500;

        // The industrial demand valve has range -1500 to 1500, so taking into account the "no traffic" and
        // "no power" modifiers above, zoneScore must lie in the range -3000 - 1500

        // First: observe that if there are no roads we will never take this branch, as zoneScore will be <= -1000.
        // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -24880.
        // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
        // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
        // 87.9% of them are above -24880, so nearly 88% of the time, we will never take this branch.
        // Thus, there's approximately a 2.9% chance that the value will be in the range, and we *might* grow.
        // This has the nice effect of not preventing an individual unit from growing even if overall demand has collapsed
        // (the business itself might still be growing.
        if (zoneScore > -350 && (zoneScore - 26380) > math.getRandom16Signed()) {
            Industrial.growZone(map, x, y, simData.blockMaps, population, math.getRandom16() & 1, zonePower);
            return;
        }

        // Again, given the  above, zoneScore + 26380 must lie in the range 23380 - 27880.
        // There is a 7.4% chance of getRandom16() always yielding a number > 27880 which would take this branch.
        // There is a 85.6% chance of the number being below 23380 thus never triggering this branch, which leaves a
        // 9% chance of this branch being conditional on zoneScore.
        if (zoneScore < 350 && (zoneScore + 26380) < math.getRandom16Signed())
            Industrial.degradeZone(map, x, y, simData.blockMaps, population, math.getRandom16() & 1, zonePower);
        }

    }

};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const verticalDeltaX = [0,  1,  0,  0,  0,  0,  1];
const verticalDeltaY = [-2, -2, -1,  0,  1,  2,  2];
const horizontalDeltaX = [-2,  2, -2, -1,  0,  1,  2];
const horizontalDeltaY = [ -1, -1,  0,  0,  0,  0,  0];

const openVertical = [ Tile.VBRDG0, Tile.VBRDG1, Tile.RIVER, Tile.BRWV, Tile.RIVER, Tile.VBRDG2, Tile.VBRDG3 ];
const closeVertical = [ Tile.VBRIDGE, Tile.RIVER, Tile.VBRIDGE, Tile.VBRIDGE, Tile.VBRIDGE, Tile.VBRIDGE, Tile.RIVER ];

const openHorizontal = [ Tile.HBRDG1, Tile.HBRDG3, Tile.HBRDG0, Tile.RIVER, Tile.BRWH, Tile.RIVER, Tile.HBRDG2 ];
const closeHorizontal = [ Tile.RIVER, Tile.RIVER, Tile.HBRIDGE, Tile.HBRIDGE, Tile.HBRIDGE, Tile.HBRIDGE, Tile.HBRIDGE ];
/*
const openVertical = [
    Tile.VBRDG0 | Tile.BULLBIT, Tile.VBRDG1 | Tile.BULLBIT,
    Tile.RIVER, Tile.BRWV | Tile.BULLBIT,
    Tile.RIVER, Tile.VBRDG2 | Tile.BULLBIT, Tile.VBRDG3 | Tile.BULLBIT
];
const closeVertical = [
    Tile.VBRIDGE | Tile.BULLBIT, Tile.RIVER, Tile.VBRIDGE | Tile.BULLBIT,
    Tile.VBRIDGE | Tile.BULLBIT, Tile.VBRIDGE | Tile.BULLBIT,
    Tile.VBRIDGE | Tile.BULLBIT, Tile.RIVER
];
const openHorizontal = [
    Tile.HBRDG1 | Tile.BULLBIT, Tile.HBRDG3 | Tile.BULLBIT,
    Tile.HBRDG0 | Tile.BULLBIT, Tile.RIVER, Tile.BRWH | Tile.BULLBIT,
    Tile.RIVER, Tile.HBRDG2 | Tile.BULLBIT
];
const closeHorizontal = [
    Tile.RIVER, Tile.RIVER, Tile.HBRIDGE | Tile.BULLBIT,
    Tile.HBRIDGE | Tile.BULLBIT, Tile.HBRIDGE | Tile.BULLBIT,
    Tile.HBRIDGE | Tile.BULLBIT, Tile.HBRIDGE | Tile.BULLBIT
];*/

const densityTable = [Tile.ROADBASE, Tile.LTRFBASE, Tile.HTRFBASE];

const Road = {

    registerHandlers: function ( mapScanner, repairManager ) {

        mapScanner.addAction( ZoneUtils.isRoad, Road.roadFound );

    },

    openBridge: function ( map, origX, origY, xDelta, yDelta, oldTiles, newTiles ) {

        let i, x, y;

        for ( i = 0; i < 7; i++) {
            x = origX + xDelta[i];
            y = origY + yDelta[i];
            if (map.testBounds(x, y)) {
                if (map.getTileValue(x, y) === (oldTiles[i] & Tile.BIT_MASK)) map.setTileValue(x, y, newTiles[i]);
            }
        }
    },

    closeBridge: function ( map, origX, origY, xDelta, yDelta, oldTiles, newTiles ) {

        let i, x, y, tileValue;

        for ( i = 0; i < 7; i++) {
            x = origX + xDelta[i];
            y = origY + yDelta[i];
            if (map.testBounds(x, y)) {
                tileValue = map.getTileValue(x, y);
                if (tileValue === Tile.CHANNEL || (tileValue & 15) === (oldTiles[i] & 15)) map.setTileValue(x, y, newTiles[i]);
            }
        }
    },

    doBridge: function ( map, x, y, currentTile, simData ) {

        //console.log( 'make bridge !!' )

        if(!simData) simData = Micro.simData;

        if (currentTile === Tile.BRWV) {
            // We have an open vertical bridge. Possibly close it.
            if (math.getChance(3) && simData.spriteManager.getBoatDistance(x, y) > 340)
                Road.closeBridge(map, x, y, verticalDeltaX, verticalDeltaY, openVertical, closeVertical);
            return true;
        }
        if (currentTile == Tile.BRWH) {
            // We have an open horizontal bridge. Possibly close it.
            if (math.getChance(3) && simData.spriteManager.getBoatDistance(x, y) > 340)
                Road.closeBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, openHorizontal, closeHorizontal);
            return true;
        }
        if (simData.spriteManager.getBoatDistance(x, y) < 300 || math.getChance(7)) {
            if (currentTile & 1) {
                if (x < map.width - 1) {
                    if (map.getTileValue(x + 1, y) === Tile.CHANNEL) {
                             // We have a closed vertical bridge. Open it.
                            Road.openBridge(map, x, y, verticalDeltaX, verticalDeltaY, closeVertical, openVertical);
                        return true;
                    }
                }
                return false;
            } else {
                if (y > 0) {
                    if (map.getTileValue(x, y - 1) === Tile.CHANNEL) {
                            // We have a closed horizontal bridge. Open it.
                            Road.openBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, closeHorizontal, openHorizontal);
                        return true;
                    }
                }
            }
        }
        return false;
    },

    roadFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.roadTotal += 1;
        let currentTile = map.getTile(x, y);
        let tileValue = currentTile.getValue();

        if (simData.budget.shouldDegradeRoad()) {
            if (math.getChance(511)) {
                //currentTile = map.getTile(x, y);

                // Don't degrade tiles with power lines
                if (!currentTile.isConductive()) {
                    if (simData.budget.roadEffect < (math.getRandom16() & 31)) {
                        //let mapValue = currentTile.getValue();

                        // Replace bridge tiles with water, otherwise rubble
                        if ((tileValue & 15) < 2 || (tileValue & 15) === 15) map.setTile(x, y, Tile.RIVER);
                        else map.setTo(x, y, ZoneUtils.randomRubble());
                        return;
                    }
                }
            }
        }

        // Bridges are not combustible
        if (!currentTile.isCombustible()) {
            // The comment in the original Micropolis code states bridges count for 4
            // However, with the increment above, it's actually 5. Bug?
            simData.census.roadTotal += 4;
            //if ( Road.doBridge(map, x, y, tileValue, simData)) return;
        }

        // Examine traffic density, and modify tile to represent last scanned traffic
        // density
        let density = 0;
        if (tileValue < Tile.LTRFBASE) {
            density = 0;
        } else if (tileValue < Tile.HTRFBASE) {
            density = 1;
        } else {
            // Heavy traffic counts as two tiles with regards to upkeep cost
            // Note, if this is heavy traffic on a bridge, and it wasn't handled above,
            // it actually counts for 7 road tiles
            simData.census.roadTotal += 1;
            density = 2;
        }

        // Force currentDensity in range 0-3 (trafficDensityMap values are capped at 240)
        let currentDensity = simData.blockMaps.trafficDensityMap.worldGet(x, y) >> 6;
        // Force currentDensity in range 0-3 (trafficDensityMap values are capped at 240)
        if (currentDensity > 1) currentDensity -= 1;
        if (currentDensity === density) return;

        let newValue = ((tileValue - Tile.ROADBASE) & 15) + densityTable[currentDensity];
        // Preserve all bits except animation
        let newFlags = currentTile.getFlags() & ~Tile.ANIMBIT;
        if (currentDensity > 0) newFlags |= Tile.ANIMBIT;

        map.setTo(x, y, new Tiles(newValue, newFlags));
        
    }
};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


    

const Transport = {

    registerHandlers: function ( mapScanner, repairManager ) {

        mapScanner.addAction(ZoneUtils.isRail, Transport.railFound );
        mapScanner.addAction(Tile.PORT, Transport.portFound );
        mapScanner.addAction(Tile.AIRPORT, Transport.airportFound );

        repairManager.addAction(Tile.PORT, 15, 4);
        repairManager.addAction(Tile.AIRPORT, 7, 6);

    },

    railFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.railTotal += 1;
        simData.spriteManager.generateTrain(simData.census, x, y);

        if (simData.budget.shouldDegradeRoad()) {
            if (math.getChance(511)) {
                let currentTile = map.getTile(x, y);

                // Don't degrade tiles with power lines
                if (currentTile.isConductive()) return;

                if (simData.budget.roadEffect < (math.getRandom16() & 31)) {
                    let mapValue = currentTile.getValue();

                    // Replace bridge tiles with water, otherwise rubble
                    if ( mapValue < Tile.RAILBASE + 2 ) map.setTile( x, y, Tile.RIVER, 0 );
                    else map.setTo( x, y, ZoneUtils.randomRubble() );
                }
            }
        }
    },

    airportFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.airportPop += 1;

        let tile = map.getTile(x, y);
        if (tile.isPowered()) {
            if (map.getTileValue(x + 1, y - 1) === Tile.RADAR) map.setTile(x + 1, y - 1, Tile.RADAR0, Tile.CONDBIT | Tile.ANIMBIT | Tile.BURNBIT);
            if (math.getRandom(5) === 0) {
                simData.spriteManager.generatePlane(x, y);
                return;
            }
            if (math.getRandom(12) === 0) simData.spriteManager.generateCopter(x, y);
        } else {
            map.setTile(x + 1, y - 1, Tile.RADAR, Tile.CONDBIT | Tile.BURNBIT);
        }
    },

    portFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;
            
        simData.census.seaportPop += 1;
        let tile = map.getTile(x, y);
        if (tile.isPowered() && simData.spriteManager.getSprite( Micro.SPRITE_SHIP ) === null) simData.spriteManager.generateShip();

    }
};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


const handleService = function( censusStat, budgetEffect, blockMap ) {

    return function( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census[censusStat] += 1;
        var effect = simData.budget[budgetEffect];
        var isPowered = map.getTile(x, y).isPowered();
        // Unpowered buildings are half as effective
        if (!isPowered) effect = Math.floor(effect / 2);

        var pos = new Position(x, y);
        var connectedToRoads = simData.traffic.findPerimeterRoad( pos );
        if (!connectedToRoads) effect = Math.floor(effect / 2);

        var currentEffect = simData.blockMaps[blockMap].worldGet(x, y);
        currentEffect += effect;
        simData.blockMaps[blockMap].worldSet(x, y, currentEffect);
    }

};

const EmergencyServices = {

    registerHandlers: function(mapScanner, repairManager) {
        mapScanner.addAction(Tile.POLICESTATION, EmergencyServices.policeStationFound);
        mapScanner.addAction(Tile.FIRESTATION, EmergencyServices.fireStationFound);
    },

    policeStationFound: handleService('policeStationPop', 'policeEffect', 'policeStationMap'),
    fireStationFound: handleService('fireStationPop', 'fireEffect', 'fireStationMap')

};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
*
* This code is released under the GNU GPL v3, with some additional terms.
* Please see the files LICENSE and COPYING for details. Alternatively,
* consult http://micropolisjs.graememcc.co.uk/LICENSE and
* http://micropolisjs.graememcc.co.uk/COPYING
*
*/

const xDelta$1 = [-1,  0,  1,  0 ];
const yDelta$1 = [ 0, -1,  0,  1 ];



const MiscTiles = {

    registerHandlers: function( mapScanner, repairManager ) {
        mapScanner.addAction(ZoneUtils.isFire, MiscTiles.fireFound, true);
        mapScanner.addAction(Tile.RADTILE, MiscTiles.radiationFound, true);
        mapScanner.addAction(ZoneUtils.isFlood, MiscTiles.floodFound, true);
        //mapScanner.addAction(ZoneUtils.isManualExplosion, MiscTiles.explosionFound, true);
    },

    fireFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.firePop += 1;

        if ((math.getRandom16() & 3) !== 0) return;

        let i, xTem, yTem, tile;

        // Try to set neighbouring tiles on fire as well
        for ( i = 0; i < 4; i++) {
            if (math.getChance(7)) {
                xTem = x + xDelta$1[i];
                yTem = y + yDelta$1[i];
                if (map.testBounds(xTem, yTem)) {
                    tile = map.getTile(x, y);
                    if (!tile.isCombustible()) continue;
                    if (tile.isZone()) {
                        // Neighbour is a ione and burnable
                        ZoneUtils.fireZone(map, x, y, simData.blockMaps);
                        // Industrial zones etc really go boom
                        if (tile.getValue() > Tile.IZB) simData.spriteManager.makeExplosionAt(x, y);
                    }
                    map.setTo( ZoneUtils.randomFire() );
                }
            }
        }

        // Compute likelyhood of fire running out of fuel
        let rate = 10; // Likelyhood of extinguishing (bigger means less chance)
        i = simData.blockMaps.fireStationEffectMap.worldGet(x, y);

        if (i > 100) rate = 1;
        else if (i > 20) rate = 2;
        else if (i > 0) rate = 3;

        // Decide whether to put out the fire.
        if ( math.getRandom(rate) === 0 ) map.setTo( x, y, ZoneUtils.randomRubble() );
    },

    radiationFound: function ( map, x, y, simData ) {
        if (math.getChance(4095)) map.setTile( x, y, Tile.DIRT, 0 );
    },

    floodFound: function ( map, x, y, simData ) { 
        if(!simData) simData = Micro.simData;
        simData.disasterManager.doFlood( x, y, simData.blockMaps );
    },

    /*explosionFound: function ( map, x, y, simData ) {
        if(!simData) simData = Micro.simData
        let tileValue = map.getTileValue(x, y);
        map.setTo(x, y, ZoneUtils.randomRubble());
        return;
    }*/
};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

const Stadia =  {

    registerHandlers: function( mapScanner, repairManager ) {

        mapScanner.addAction( Tile.STADIUM, Stadia.emptyStadiumFound );
        mapScanner.addAction( Tile.FULLSTADIUM, Stadia.fullStadiumFound );
        repairManager.addAction( Tile.STADIUM, 15, 4 );

    },

    emptyStadiumFound: function( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.stadiumPop += 1;

        if (map.getTile(x, y).isPowered()) {
            // Occasionally start the big game
            if (((simData.cityTime + x + y) & 31) === 0) {
                map.putZone(x, y, Tile.FULLSTADIUM, 4);
                map.addTileFlags(x, y, Tile.POWERBIT);
                map.setTo(x + 1, y, new Tiles(Tile.FOOTBALLGAME1, Tile.ANIMBIT));
                map.setTo(x + 1, y + 1, new Tiles(Tile.FOOTBALLGAME2, Tile.ANIMBIT));
            }
        }
    },

    fullStadiumFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData;

        simData.census.stadiumPop += 1;
        let isPowered = map.getTile(x, y).isPowered();

        if (((simData.cityTime + x + y) & 7) === 0) {
            map.putZone(x, y, Tile.STADIUM, 4);
            if ( isPowered ) map.addTileFlags( x, y, Tile.POWERBIT );
        }

    }

};

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * switch to ES6 by lo-th
 *
 */

class MapUtils {

    // Smooth the map src into dest. The way in which the map is smoothed depends on the value of smoothStyle.
    // The meanings are as follows:
    //
    // SMOOTH_NEIGHBOURS_THEN_BLOCK
    // ============================
    // For each square in src, sum the values of its immediate neighbours, and take the average, then take the average of
    // that result and the square's value. This result is the new value of the square in dest.
    //
    // SMOOTH_ALL_THEN_CLAMP
    // =====================
    // For each square in src, sum the values of that square and it's four immediate neighbours, and take an average
    // rounding down. Clamp the resulting value in the range 0-255. This clamped value is the square's new value in dest.
    static smoothMap ( src, dest, smoothStyle ) {

        let x = src.width, y, edges;

        while( x-- ){
            y = src.height;
            while( y-- ){
                
                edges = 0;
                if (x > 0) edges += src.get(x - 1, y);
                if (x < src.width - 1) edges += src.get(x + 1, y);
                if (y > 0) edges += src.get(x, y - 1);
                if (y < src.height - 1) edges += src.get(x, y + 1);

                if (smoothStyle === Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK) {
                    edges = src.get(x, y) + Math.floor(edges / 4);
                    dest.set(x, y, Math.floor(edges/2));
                } else {
                    edges = (edges + src.get(x, y)) >> 2;
                    if (edges > 255) edges = 255;
                    dest.set(x, y, edges);
                }
            }
        }

    }

    // Over time, the rate of growth of a neighbourhood should trend towards zero (stable)
    static neutraliseRateOfGrowthMap ( blockMaps ) {

        let bm = blockMaps.rateOfGrowthMap;
        let x = bm.width, y, value;

        while( x-- ){
            y = bm.height;
            while( y-- ){

                value = bm.get( x, y );

                if (value !== 0){
                    if (value > 0) value--;
                    else value++;

                    value = math.clamp( value, -200, 200 );
                    bm.set( x, y, value );
                }
            }
        }
    }

    // Over time, traffic density should ease.
    static neutraliseTrafficMap ( blockMaps ) {

        let bm = blockMaps.trafficDensityMap;
        let x = bm.width, y, value;

        while( x-- ){
            y = bm.height;
            while( y-- ){

                value = bm.get(x, y);

                if (value !== 0){
                    if (value <= 24) value = 0;
                    else if (value > 200) value = value - 34;
                    else value = value - 24;
                    bm.set(x, y, value);
                }
            }
        }
         
    }

    // Given a tileValue, score it on the pollution it generates, in the range 0-255
    static getPollutionValue ( tileValue ) {

        if (tileValue < Tile.POWERBASE) {
            // Roads, fires and radiation lie below POWERBASE

            // Heavy traffic is bad
            if (tileValue >= Tile.HTRFBASE) return 75;
            // Low traffic not so much
            if (tileValue >= Tile.LTRFBASE) return 50;

            if (tileValue < Tile.ROADBASE) {
                // Fire = carbon monoxide = a bad score for you
                if (tileValue > Tile.FIREBASE) return 90;
                // Radiation. Top of the charts.
                if (tileValue >= Tile.RADTILE) return 255;
            }

            // All other types of ground are pure.
            return 0;
        }

        // If we've reached this point, we're classifying some form of zone tile

        // Residential and commercial zones don't pollute
        if (tileValue <= Tile.LASTIND) return 0;
        // Industrial zones, however...
        if (tileValue < Tile.PORTBASE) return 50;
        // Coal power plants are bad
        if (tileValue <= Tile.LASTPOWERPLANT) return 100;

        return 0;

    }

    // Compute the Manhattan distance of the given point from the city centre, and force into the range 0-64
    static getCityCentreDistance ( map, x, y ) {

        let xDis, yDis;
        if ( x > map.cityCentreX ) xDis = x - map.cityCentreX;
        else xDis = map.cityCentreX - x;
        if ( y > map.cityCentreY ) yDis = y - map.cityCentreY;
        else yDis = map.cityCentreY - y;
        return Math.min(xDis + yDis, 64);

    }

    // This monster function fills up the landValueMap, the terrainDensityMap and the pollutionDensityMap based
    // on values found by iterating over the map.
    //
    // Factors that affect land value:
    //   * Distance from the city centre
    //   * High crime
    //   * High pollution
    //   * Proximity to undeveloped terrain (who doesn't love a good view?)
    //
    // Pollution is completely determined by the tile types in the block
    static pollutionTerrainLandValueScan ( map, census, blockMaps ) {

        // We record raw pollution readings for each tile into tempMap1, and then use tempMap2 and tempMap1 to smooth
        // out the pollution in order to construct the new values for the populationDensityMap
        let tempMap1 = blockMaps.tempMap1;
        let tempMap2 = blockMaps.tempMap2;
        // tempMap3 will be used to record raw terrain information, i.e. if the the land is developed. This will be
        // smoothed in to terrainDensityMap later
        let tempMap3 = blockMaps.tempMap3;
        tempMap3.clear();

        let landValueMap = blockMaps.landValueMap;
        let terrainDensityMap = blockMaps.terrainDensityMap;
        let pollutionDensityMap = blockMaps.pollutionDensityMap;
        let crimeRateMap = blockMaps.crimeRateMap;

        let totalLandValue = 0;
        let developedTileCount = 0;

        let x = landValueMap.width, y, pollutionLevel, developed, worldX, worldY, mapX, mapY, tileValue, terrainValue, landValue;

        while( x-- ){
            y = landValueMap.height;
            while( y-- ){

                pollutionLevel = 0;
                developed = false;

                // The land value map has a chunk size of 2
                worldX = x * 2;
                worldY = y * 2;

                for ( mapX = worldX; mapX <= worldX + 1; mapX++) {
                    for ( mapY = worldY; mapY <= worldY + 1; mapY++) {

                        
                        tileValue = map.getTileValue( mapX, mapY );
                        if (tileValue === Tile.DIRT) continue;

                        if (tileValue < Tile.RUBBLE) {
                            // Undeveloped land: record in tempMap3. Each undeveloped piece of land scores 15.
                            // tempMap3 has a chunk size of 4, so each square in tempMap3 will ultimately contain a
                            // maximum value of 240
                            terrainValue = tempMap3.worldGet(mapX, mapY);
                            tempMap3.worldSet(mapX, mapY, terrainValue + 15);
                            continue;
                        }

                        pollutionLevel += MapUtils.getPollutionValue(tileValue);
                        if (tileValue >= Tile.ROADBASE) {
                           developed = true;
                        }
                        
                    }
                }

                pollutionLevel = Math.min(pollutionLevel, 255);
                tempMap1.set(x, y, pollutionLevel);

                if (developed) {
                    landValue = 34 - Math.floor(MapUtils.getCityCentreDistance(map, worldX, worldY) / 2);
                    landValue = landValue << 2;
                    // Land in the same neighbourhood as unspoiled land is more valuable...
                    landValue += terrainDensityMap.get(x >> 1, y >> 1);
                    // ... and polluted land obviously is less valuable
                    landValue -= pollutionDensityMap.get(x, y);
                     // ... getting mugged won't help either
                    if (crimeRateMap.get(x, y) > 190) { landValue -= 20; }
                    // Clamp in range 1-250 (0 represents undeveloped land)
                    landValue = math.clamp(landValue, 1, 250);
                    landValueMap.set(x, y, landValue);

                    totalLandValue += landValue;
                    developedTileCount++;
                } else {
                    landValueMap.set(x, y, 0);
                }
            }
        }

        if (developedTileCount > 0) census.landValueAverage = Math.floor(totalLandValue / developedTileCount);
        else census.landValueAverage = 0;

        // Smooth the pollution map twice
        MapUtils.smoothMap(tempMap1, tempMap2, Micro.SMOOTH_ALL_THEN_CLAMP);
        MapUtils.smoothMap(tempMap2, tempMap1, Micro.SMOOTH_ALL_THEN_CLAMP);

        let maxPollution = 0;
        let pollutedTileCount = 0;
        let totalPollution = 0;
        let pollution;

        // We iterate over the now-smoothed pollution map rather than using the block map's copy routines
        // so that we can compute the average and total pollution en-route
        for (x = 0; x < map.width; x += pollutionDensityMap.blockSize) {
            for (y = 0; y < map.height; y += pollutionDensityMap.blockSize)  {
                // Copy the values into pollutionDensityMap
                pollution = tempMap1.worldGet(x, y);
                pollutionDensityMap.worldSet(x, y, pollution);

                if (pollution !== 0) {
                    pollutedTileCount++;
                    totalPollution += pollution;

                    // Note the most polluted location: any monsters will be drawn there (randomly choosing one
                    // if we have multiple competitors for most polluted)
                    if (pollution > maxPollution || (pollution === maxPollution && math.getChance(3))) {
                        maxPollution = pollution;
                        map.pollutionMaxX = x;
                        map.pollutionMaxY = y;
                    }
                }
            }
        }

        if (pollutedTileCount) census.pollutionAverage = Math.floor(totalPollution / pollutedTileCount);
        else census.pollutionAverage = 0;

        MapUtils.smoothMap(tempMap3, terrainDensityMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);

    }

    // Computes the coverage radius of police stations, and scores each neighbourhood in the map on its crime rate.
    // Factors that attract crime are:
    //    * The zone has a low value
    //    * The zone is a slum
    //    * The zone is far away from those pesky police
    static crimeScan ( census, blockMaps ) {

        let policeStationMap = blockMaps.policeStationMap;
        let policeStationEffectMap = blockMaps.policeStationEffectMap;
        let crimeRateMap = blockMaps.crimeRateMap;
        let landValueMap = blockMaps.landValueMap;
        let populationDensityMap = blockMaps.populationDensityMap;

        MapUtils.smoothMap(policeStationMap, policeStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
        MapUtils.smoothMap(policeStationEffectMap, policeStationMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
        MapUtils.smoothMap(policeStationMap, policeStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);

        let totalCrime = 0;
        let crimeZoneCount = 0;

        let x, y, width = crimeRateMap.mapWidth, height = crimeRateMap.mapHeight, value;

        // Scan the map, looking for developed land, as it can attract crime.
        for ( x = 0; x < width; x += blockSize ) {
            for ( y = 0; y < height; y += blockSize ) {
                // Remember: landValueMap values are in the range 0-250
                value = landValueMap.worldGet(x, y);

                if (value > 0) {

                    crimeZoneCount += 1;
                    // Force value in the range -122 to 128. Lower valued pieces of land attract more crime.
                    value = 128 - value;
                    // Add population density (a value between 0 and 510). value now lies in range -260 - 382.
                    // Denser areas attract more crime.
                    value += populationDensityMap.worldGet(x, y);
                    // Clamp in range -260 to 300
                    value = Math.min(value, 300);
                    // If the police are nearby, there's no point committing the crime of the century
                    value -= policeStationMap.worldGet(x, y);
                    // Force in to range 0-250
                    value = math.clamp(value, 0, 250);

                    crimeRateMap.worldSet(x, y, value);
                    totalCrime += value;

                } else {

                    crimeRateMap.worldSet(x, y, 0);

                }
            }
        }

        if ( crimeZoneCount > 0 ) census.crimeAverage = Math.floor(totalCrime / crimeZoneCount);
        else census.crimeAverage = 0;

    }

    // Iterate over the map, and score each neighbourhood on its distance from the city centre. Scores are in the range
    // -64 to 64. This affects the growth of commercial zones within that neighbourhood.
    static fillCityCentreDistScoreMap ( map, blockMaps ) {

        let bm = blockMaps.cityCentreDistScoreMap;
        let x = bm.width, y, value;

        while( x-- ){
            y = bm.height;
            while( y-- ){
                // First, we compute the Manhattan distance of the top-left hand corner of the neighbourhood to the city centre
                // and half that value. This leaves us a value in the range 0 - 32
                value = Math.floor(MapUtils.getCityCentreDistance(map, x * 8, y * 8) / 2);
                // Now, we scale up by a factor of 4. We're in the range 0 - 128
                value = value * 4;
                // And finally, subtract from 64, leaving us a score in the range -64 to 64
                value = 64 - value;
                bm.set(x, y, value);
            }
        }
    };

    // Dispatch to the correct zone type to get the population value for that zone
    static getPopulationDensity ( map, x, y, tile ) {

        if (tile < Tile.COMBASE) return Residential.getZonePopulation(map, x, y, tile);
        if (tile < Tile.INDBASE) return Commercial.getZonePopulation(map, x, y, tile) * 8;
        if (tile < Tile.PORTBASE) return Industrial.getZonePopulation(map, x, y, tile) * 8;
        return 0;

    }

    // Iterate over the map, examining each zone for population. We then smooth the results into a population density
    // map, which is used when deciding to grow residential zones. At the same time, we also note the most populous area
    // (in terms of zones) to calculate our city centre. Finally, we score each area of the map on its distance from the
    // city centre.
    static populationDensityScan ( map, blockMaps ) {

        // We will build the initial unsmoothed map in tempMap1, and smooth it in to tempMap2
        let tempMap1 = blockMaps.tempMap1;
        let tempMap2 = blockMaps.tempMap2;
        blockMaps.populationDensityMap;

        // We will sum all the coordinates that contain zones into xTot and yTot. They are used in our city centre heuristic.
        let Xtot = 0;
        let Ytot = 0;
        let zoneTotal = 0;

        tempMap1.clear();

        let x = map.width, y, tile, tileValue, population;

        while( x-- ){
            y = map.height;
            while( y-- ){

                tile = map.getTile(x, y);
                if (tile.isZone()) {

                    tileValue = tile.getValue();

                    // Ask the zone to calculate its population, scale it up, then clamp in the range 0-254
                    population = MapUtils.getPopulationDensity(map, x, y, tileValue) * 8;
                    population = Math.min(population, 254);

                    // The block size of population density is 2x2, so there can only be 1 zone per block
                    tempMap1.worldSet(x, y, population);
                    Xtot += x;
                    Ytot += y;
                    zoneTotal++;

                }
            }
        }

        MapUtils.smoothMap(tempMap1, tempMap2, Micro.SMOOTH_ALL_THEN_CLAMP);
        MapUtils.smoothMap(tempMap2, tempMap1, Micro.SMOOTH_ALL_THEN_CLAMP);
        MapUtils.smoothMap(tempMap1, tempMap2, Micro.SMOOTH_ALL_THEN_CLAMP);

        blockMaps.populationDensityMap.copyFrom(tempMap2, function(x) {return x * 2;});

        // XXX This follows the original Micropolis source, but it feels weird to me that we score the entire map
        // based on city centre proximity, and then potentially move the city centre. I think these should be
        // swapped.
        MapUtils.fillCityCentreDistScoreMap( map, blockMaps );

        // Compute new city center
        if (zoneTotal > 0) {
            map.cityCentreX = Math.floor(Xtot / zoneTotal);
            map.cityCentreY = Math.floor(Ytot / zoneTotal);
        } else {
            map.cityCentreX = Math.floor(map.width * 0.5);
            map.cityCentreY = Math.floor(map.height * 0.5);
        }
    }

    // Compute the radius of coverage for the firestations found during the map scan
    static fireAnalysis ( blockMaps ) {

        let fireStationMap = blockMaps.fireStationMap;
        let fireStationEffectMap = blockMaps.fireStationEffectMap;

        MapUtils.smoothMap(fireStationMap, fireStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
        MapUtils.smoothMap(fireStationEffectMap, fireStationMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
        MapUtils.smoothMap(fireStationMap, fireStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);

    }

}

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

class Simulation {

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

        this.infos = [];

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
                if (this.cityTime % Micro.TAX_FREQUENCY === 0) { this.budget.collectTax( this.gameLevel, this.census ); this.evaluation.cityEvaluation(); }            break;
            case 10: if ((this.simCycle % 5) === 0){ MapUtils.neutraliseRateOfGrowthMap(this.blockMaps);}  MapUtils.neutraliseTrafficMap(this.blockMaps); this.sendMessages(); break;
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
            case 26: if (this.census.resPop > 500 && this.census.stadiumPop === 0) { this.messageManager.sendMessage(Messages.NEED_STADIUM); this.valves.resCap = true; } else { this.valves.resCap = false;} break;
            case 28: if (this.census.indPop > 70 && this.census.seaportPop === 0) { this.messageManager.sendMessage(Messages.NEED_SEAPORT); this.valves.indCap = true; } else { this.valves.indCap = false; } break;
            case 30: if (this.census.comPop > 100 && this.census.airportPop === 0) { this.messageManager.sendMessage(Messages._NEED_AIRPORT); this.valves.comCap = true; } else { this.valves.comCap = false; } break;
            case 32: let zoneCount = this.census.unpoweredZoneCount + this.census.poweredZoneCount; if (zoneCount > 0) { if (this.census.poweredZoneCount / zoneCount < 0.7) this.messageManager.sendMessage(Messages.BLACKOUTS_REPORTED);} break;
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

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class TileHistory {

    constructor () {

        this.clear();

    }

    clear () {

        this.data = {};

    }

    toKey ( x, y ) {

        return [x, y].join(',');

    }

    getTile ( x, y ) {

        let key = this.toKey( x, y );
        return this.data[key];

    }

    setTile ( x, y, value ) {

        let key = this.toKey( x, y );
        this.data[key] = value;

    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
//import { TileUtils } from './tileUtils';

class AnimationManager {

    constructor ( map, animationPeriod, blinkPeriod ) {

        animationPeriod = animationPeriod || 5;
        blinkPeriod = blinkPeriod || 30;

        this._map = map;
        this.animationPeriod = animationPeriod;
        this.blinkPeriod = blinkPeriod;
        this.shouldBlink = false;
        this.count = 1;

        // When painting we keep track of what frames
        // have been painted at which map coordinates so we can
        // consistently display the correct frame even as the
        // canvas moves
        this._lastPainted = null;

        this._data = [];
        this.initArray();
        this.registerAnimations();

    }

    initArray () {
        // Map all tiles to their own value in case we ever
        // look up a tile that is not animated
        for (let i = 0; i < Tile.TILE_COUNT; i++) this._data[i] = i;
    }

    inSequence(tileValue, lastValue) {
        // It is important that we use the base value as the starting point
        // rather than the last painted value: base values often don't recur
        // in their sequences
        let seen = [tileValue];
        let current = this._data[tileValue];

        while (seen.indexOf(current) === -1) {
            if (current === lastValue) return true;

            seen.push(current);
            current = this._data[current];
        }
        return false;
    }

    getTiles( startX, startY, boundX, boundY, isPaused = false ) {

        let shouldChangeAnimation = false;

        if (!isPaused) this.count += 1;

        if ((this.count % this.blinkPeriod) === 0) this.shouldBlink = !this.shouldBlink;

        if ((this.count % this.animationPeriod) === 0 && !isPaused) shouldChangeAnimation = true;

        let newPainted = new TileHistory();
        let tilesToPaint = [];

        for (let x = startX; x < boundX; x++) {
            for (let y = startY; y < boundY; y++) {
                if (x < 0 || x >= this._map.width || y < 0 || y >= this._map.height) continue;

                let tile = this._map.getTile(x, y);
                /*if (tile.isZone() && !tile.isPowered() && this.shouldBlink) {
                    tilesToPaint.push({x: x, y: y, tileValue: Tile.LIGHTNINGBOLT});
                    continue;
                }*/

                if (!tile.isAnimated()) continue;

                let tileValue = tile.getValue();
                let newTile = Tile.TILE_INVALID;
                let last;

                if (this._lastPainted) last = this._lastPainted.getTile(x, y);

                if (shouldChangeAnimation) {
                    // Have we painted any of this sequence before? If so, paint the next tile
                    if (last && this.inSequence(tileValue, last)) { 


                        newTile = this._data[last];

                        if (last === Tile.LASTTINYEXP) {
                            this._map.setTo( x, y, ZoneUtils.randomRubble() );
                            newTile = this._map.getTileValue(x, y);
                        } else {
                            newTile = this._data[last];
                        }


                    } else {
                        // Either we haven't painted anything here before, or the last tile painted
                        // there belongs to a different tile's animation sequence
                        newTile = this._data[tileValue];
                    }
                } else {
                    // Have we painted any of this sequence before? If so, paint the same tile
                    if (last && this.inSequence(tileValue, last)) newTile = last;
                }

                if (newTile === Tile.TILE_INVALID) continue;

                tilesToPaint.push({x: x, y: y, tileValue: newTile});
                newPainted.setTile(x, y, newTile);

                this._map.setPaintValue(x, y, newTile); /// DIRECT SET TEXTURES
            }
        }
        this._lastPainted = newPainted;
        return tilesToPaint;
    }

    registerSingleAnimation (arr) {
        for (let i = 1; i < arr.length; i++) this._data[arr[i - 1]] = arr[i];
    }

    registerAnimations () {

        this.registerSingleAnimation([56, 57, 58, 59, 60, 61, 62, 63, 56]);// fire
        this.registerSingleAnimation([860, 861, 862, 863, 864, 865, 866, 867]);// explosion

        

        // traffic

        this.registerSingleAnimation([80, 128, 112, 96, 80]);
        this.registerSingleAnimation([81, 129, 113, 97, 81]);
        this.registerSingleAnimation([82, 130, 114, 98, 82]);
        this.registerSingleAnimation([83, 131, 115, 99, 83]);
        this.registerSingleAnimation([84, 132, 116, 100, 84]);
        this.registerSingleAnimation([85, 133, 117, 101, 85]);
        this.registerSingleAnimation([86, 134, 118, 102, 86]);
        this.registerSingleAnimation([87, 135, 119, 103, 87]);
        this.registerSingleAnimation([88, 136, 120, 104, 88]);
        this.registerSingleAnimation([89, 137, 121, 105, 89]);
        this.registerSingleAnimation([90, 138, 122, 106, 90]);
        this.registerSingleAnimation([91, 139, 123, 107, 91]);
        this.registerSingleAnimation([92, 140, 124, 108, 92]);
        this.registerSingleAnimation([93, 141, 125, 109, 93]);
        this.registerSingleAnimation([94, 142, 126, 110, 94]);
        this.registerSingleAnimation([95, 143, 127, 111, 95]);

        this.registerSingleAnimation([144, 192, 176, 160, 144]);
        this.registerSingleAnimation([145, 193, 177, 161, 145]);
        this.registerSingleAnimation([146, 194, 178, 162, 146]);
        this.registerSingleAnimation([147, 195, 179, 163, 147]);
        this.registerSingleAnimation([148, 196, 180, 164, 148]);
        this.registerSingleAnimation([149, 197, 181, 165, 149]);
        this.registerSingleAnimation([150, 198, 182, 166, 150]);
        this.registerSingleAnimation([151, 199, 183, 167, 151]);
        this.registerSingleAnimation([152, 200, 184, 168, 152]);
        this.registerSingleAnimation([153, 201, 185, 169, 153]);
        this.registerSingleAnimation([154, 202, 186, 170, 154]);
        this.registerSingleAnimation([155, 203, 187, 171, 155]);
        this.registerSingleAnimation([156, 204, 188, 172, 156]);
        this.registerSingleAnimation([157, 205, 189, 173, 157]);
        this.registerSingleAnimation([158, 206, 190, 174, 158]);
        this.registerSingleAnimation([159, 207, 191, 175, 159]);
/*
        // NOT NEED  
        this.registerSingleAnimation([621, 852, 853, 854, 855, 856, 857, 858, 859, 852]);// industrial polution 
        this.registerSingleAnimation([641, 884, 885, 886, 887, 884]);
        this.registerSingleAnimation([644, 888, 889, 890, 891, 888]);
        this.registerSingleAnimation([649, 892, 893, 894, 895, 892]);
        this.registerSingleAnimation([650, 896, 897, 898, 899, 896]);
        this.registerSingleAnimation([676, 900, 901, 902, 903, 900]);
        this.registerSingleAnimation([677, 904, 905, 906, 907, 904]);
        this.registerSingleAnimation([686, 908, 909, 910, 911, 908]);
        this.registerSingleAnimation([689, 912, 913, 914, 915, 912]);
        this.registerSingleAnimation([747, 916, 917, 918, 919, 916]);
        this.registerSingleAnimation([748, 920, 921, 922, 923, 920]);
        this.registerSingleAnimation([751, 924, 925, 926, 927, 924]);
        this.registerSingleAnimation([752, 928, 929, 930, 931, 928]);
        this.registerSingleAnimation([820, 952, 953, 954, 955, 952]);
        this.registerSingleAnimation([832, 833, 834, 835, 836, 837, 838, 839, 832]);
        this.registerSingleAnimation([840, 841, 842, 843, 840]);
        this.registerSingleAnimation([844, 845, 846, 847, 848, 849, 850, 851, 844]);
        this.registerSingleAnimation([932, 933, 934, 935, 936, 937, 938, 939, 932]);// football
        this.registerSingleAnimation([940, 941, 942, 943, 944, 945, 946, 947, 940]);// football
        */
    }

}

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
//import { PositionMaker } from '../math/PositionMaker.js';

class GameMap {

    constructor ( width = 128, height = 128, defaultValue ) {

        this.isIsland = false;
        this.pp = [];

        //this.Position = new PositionMaker( width, height ); // !! find better way

        this.width = width;
        this.height = height;
        
        this.fsize = this.width * this.height;

        this.defaultValue = new Tiles().getValue();

        this.data = [];//new Array(this.fsize);
        this.tilesData = new Micro.M_ARRAY_TYPE(this.fsize);
        this.powerData = new Micro.M_ARRAY_TYPE(this.fsize);

        let i = this.fsize;
        while(i--){
            this.data[i] = new Tiles( this.defaultValue );
            this.tilesData[i] = this.defaultValue;
        }
        /*console.log(this.data.length)*/

        // Generally set externally
        this.cityCentreX = Math.floor(this.width * 0.5);
        this.cityCentreY = Math.floor(this.height * 0.5);
        this.pollutionMaxX = this.cityCentreX;
        this.pollutionMaxY = this.cityCentreY;

        this.powerChange = false;

        this.layer = [];
        this.resetLayer();


        this.makePP();

    }

    // 3D LAYER

    upLayer ( id, value, x, y ){

        if(value>=Tile.TINYEXP && value<=Tile.TINYEXPLAST) value -= (860-35);// explosion decal

        //if(value>=Tile.HBRDG0 && value<=Tile.HBRDG3) value -= 832+32
        //if(value>=Tile.VBRDG0 && value<=Tile.VBRDG3) value -= 832+32

        this.tilesData[ id ] = value;

        //if( this.goodValue(value) ){
        this.layer[this.findLayer(x,y)] = 1;

    }

    resetLayer () {

        let i = 64;
        while( i-- ) this.layer[i] = 0;
        
    }

    findLayer ( x, y ){
        let cx = Math.floor(x/16);
        let cy = Math.floor(y/16);
        return cx+(cy*8)
    }

    goodValue ( v ){

        if( v === 0 )  return true //  dirt
        else if( v > 1 && v < 240 )  return true // water edge tree
        //else if( v > 1 && v < 44 )  return true // water edge tree
        //if( v > 43 && v < 48 )  return true // rubble
       // else if( v > 43 && v < 240 ) return true // road wire rail
        return false

    }

    //  

    makePP () {

        let x = this.width, y, n=0;

        let pp = [];

        while( x-- ){
            y = this.height;
            while( y-- ){
                pp[n] = [x,y]; 
                n++;
            }
        }

        this.pp = pp;

    }

    // change power statue for 3d
    powered ( o ) {

        let id = o.id || this.getId( o.x, o.y );
        this.powerData[id] = o.v;
        this.powerChange = true; 

    }

    /*makePos (){
 
        return new PositionMaker( this.width, this.height );

    }*/

    save ( saveData ) {

        let i=0, lng;

        // GAME PROPS
        lng = Micro.GameMapProps.length;
        while( i < lng ){
            saveData[Micro.GameMapProps[i]] = this[Micro.GameMapProps[i]];
            i++;
        }

        // MAP DATA
        //saveData.map = this.data.map(function(t) { return {value: t.getRawValue()}; });

        
        saveData.map = [];
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            saveData.map[i] = this.data[i].getRawValue();
            i++;
        }

        // TILES VALUES
        saveData.tileValue = [];
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            saveData.tileValue[i] = this.tilesData[i];
            i++;
        }

    }

    load ( saveData ) {

        let x, y, lng, i = 0, map = saveData.map, tiles = saveData.tileValue;

        // GAME PROPS
        lng = Micro.GameMapProps.length;
        while( i < lng ){
            this[Micro.GameMapProps[i]] = saveData[Micro.GameMapProps[i]];
            i++;
        }

        // MAP DATA

        let isOld = map[0].value !== undefined ? true : false;
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            x = i % this.width;
            y = Math.floor(i / this.width);
            if( isOld ) this.setTileValue( x, y, map[i].value );
            else this.setTileValue( x, y, map[i] );
            i++;
        }

        // TILES VALUES
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            this.tilesData[i] = tiles[i];
            i++;
        }

    }

    testBounds (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    getId ( x, y ){
        return x + y * this.width
    }

    getTile ( x, y, newTile ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') { y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let width = this.width;
        let height = this.height;

        if (x < 0 || y < 0 || x >= width || y >= height) {
            console.warn('getTile called with bad bounds', x, y);
            return new Tiles(Tile.TILE_INVALID);
        }
        let tileIndex = this.getId( x, y );
        let tile = this.data[tileIndex];

        //var tileIndex = this._calculateIndex(x, y);
        // Return the original tile if we're not given a tile to fill
        if (!newTile) return tile;

        newTile.set(tile);
        return tile;

        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        //return this.data[tileIndex];
    }

    getTileValue( x, y ) {
        let e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let tileIndex = this.getId(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        return this.data[tileIndex].getValue();
    }

    getTileFlags( x, y ) {
        let e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y))  throw e;

        let tileIndex = this.getId(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        return this.data[tileIndex].getFlags();
    }

    getTiles( x, y, w, h ) {

        let e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let res = [];
        for (let a = y, ylim = y + h; a < ylim; a++) {
            res[a - y] = [];
            for (let b = x, xlim = x + w; b < xlim; b++) {
                let tileIndex = this.getId(b, a);
                //if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
                res[a-y].push(this.data[tileIndex]);
            }
        }
        return res;

    }

    getTileValues( x, y, w, h, result ) {

        result = result || [];
        let e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y;  y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;
        let width = this.width;
        let height = this.height;

        // Result is stored in row-major order
        for (let a = y, ylim = y + h; a < ylim; a++) {
            for (let b = x, xlim = x + w; b < xlim; b++) {
                if (a < 0 || b < 0 || a >= height || b >= width) {
                    result[(a - y) * w + (b - x)] = Tile.TILE_INVALID;
                    continue;
                }
                let tileIndex =  b + a * width;
                //result[(a - y) * w + (b - x)] = this._data[tileIndex].getRawValue();
                result[(a - y) * w + (b - x)] = this.data[tileIndex].getRawValue();
            }
        }

        return result;

    }

    getTileFromMapOrDefault( pos, dir, defaultTile ) {

        switch (dir) {
            case Direction.NORTH: 
                if (pos.y > 0) return this.getTileValue(pos.x, pos.y - 1);
                return defaultTile;
            case Direction.EAST:
                if (pos.x < this.width - 1) return this.getTileValue(pos.x + 1, pos.y);
                return defaultTile;
            case Direction.SOUTH:
                if (pos.y < this.height - 1) return this.getTileValue(pos.x, pos.y + 1);
                return defaultTile;
            case Direction.WEST:
                if (pos.x > 0) return this.getTileValue(pos.x - 1, pos.y);
                return defaultTile;
            default:
                return defaultTile;
        }

    }

    //----------------------

    testOld ( id, value ){

        if( this.data[ id ].getValue() !== value ) return true
        return false

    }

    setTile( x, y, value, flags ) {

        //var e = new Error('Invalid parameter');
        //if (arguments.length < 3) throw e;
        // Argument-shuffling
        if ( arguments.length === 3 ) { flags = value; value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        let isNew = this.testOld( id, value );

        this.data[ id ].set( value, flags );

        if( isNew ) this.upLayer( id, value, x, y );

    }

    setTo( x, y, tile ) {

        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if ( tile === undefined ) { tile = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        let value = tile.getValue();
        let isNew = this.testOld( id, value );

        this.data[ id ] = tile;
       // this.data[ id ].setValue(value);

        if( isNew ) this.upLayer( id, value, x, y );

    }

    setTileValue( x, y, value ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        let isNew = this.testOld( id, value );
        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        
        this.data[ id ].setValue( value );
        
        if( isNew ) this.upLayer( id, value, x, y );

    }

    setPaintValue( x, y, value ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        this.upLayer( id, value, x, y );

    }

    setTileFlags( x, y, flags ) {

        let e = new Error('Invalid flag parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let id = this.getId(x, y);
        this.data[id].setFlags(flags);

    }

    addTileFlags( x, y, flags ) {

        let e = new Error('Invalid flag parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let id = this.getId(x, y);
        this.data[id].addFlags(flags);

    }

    removeTileFlags( x, y, flags ) {

        if (arguments.length < 2) throw new Error('GameMap removeTileFlags called with too few arguments');        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw new Error('GameMap removeTileFlags called with invalid bounds'+ x + ', ' + y);

        let id = this.getId( x, y );
        this.data[id].removeFlags(flags);

        ///this.upLayer( id, this.data[id].getValue(), x, y )

    }

    putZone( centreX, centreY, centreTile, size ) {

        if (!this.testBounds(centreX, centreY) || !this.testBounds(centreX - 1 + size, centreY - 1 + size)) throw new Error('GameMap putZone called with invalid bounds');

        let tile = centreTile - 1 - size;
        let startX = centreX - 1;
        let startY = centreY - 1;
        let x, y;

        for ( y = startY; y < startY + size; y++) {
            for ( x = startX; x < startX + size; x++) {
                if (x === centreX && y === centreY) this.setTo(x, y, new Tiles(tile, Tile.BNCNBIT | Tile.ZONEBIT));
                else this.setTo(x, y, new Tiles(tile, Tile.BNCNBIT));
                tile += 1;
            }
        } 
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * switch to ES6 by lo-th
 *
 */

class MapGenerator {

    constructor () {

        this.SRMatrix = [
            [ 0, 0, 3, 3, 0, 0 ],
            [ 0, 3, 2, 2, 3, 0 ],
            [ 3, 2, 2, 2, 2, 3 ],
            [ 3, 2, 2, 2, 2, 3 ],
            [ 0, 3, 2, 2, 3, 0 ],
            [ 0, 0, 3, 3, 0, 0 ]
        ];
        this.BRMatrix = [
            [ 0, 0, 0, 3, 3, 3, 0, 0, 0 ],
            [ 0, 0, 3, 2, 2, 2, 3, 0, 0 ],
            [ 0, 3, 2, 2, 2, 2, 2, 3, 0 ],
            [ 3, 2, 2, 2, 2, 2, 2, 2, 3 ],
            [ 3, 2, 2, 2, 4, 2, 2, 2, 3 ],
            [ 3, 2, 2, 2, 2, 2, 2, 2, 3 ],
            [ 0, 3, 2, 2, 2, 2, 2, 3, 0 ],
            [ 0, 0, 3, 2, 2, 2, 3, 0, 0 ],
            [ 0, 0, 0, 3, 3, 3, 0, 0, 0 ]
        ];

        this.riverEdge = [
            13, 13, 17, 15,
            5 , 2 , 19, 17,
            9 , 11, 2 , 13,
            7 , 9 , 5 , 2
        ];

        this.treeTable = [
            0,  0,  0,  34,
            0,  0,  36, 35,
            0,  32, 0,  33,
            30, 31, 29, 37
        ];

    }

    construct( w, h, debug = false ) {

        Micro.TERRAIN_TREE_LEVEL = -1;
        Micro.TERRAIN_LAKE_LEVEL = -1;
        Micro.TERRAIN_CURVE_LEVEL = -1;
        Micro.ISLAND_RADIUS = 18;

        if(debug) console.time("start newmap");

        this.map = new GameMap( w || Micro.MAP_WIDTH, h || Micro.MAP_HEIGHT );
        //this.map.makePP()

        Micro.TERRAIN_CREATE_ISLAND = math.getRandom(2) - 1;

        if ( Micro.TERRAIN_CREATE_ISLAND < 0 ) {
            if (math.getRandom(100) < 10) {
                this.makeIsland();
                return this.map;
            }
        }

        if ( Micro.TERRAIN_CREATE_ISLAND === 1 ) this.makeNakedIsland();
        else this.clearMap();


        // Lay a river.
        if ( Micro.TERRAIN_CURVE_LEVEL !== 0 ) {
            let terrainXStart = 40 + math.getRandom( this.map.width - 79 );
            let terrainYStart = 33 + math.getRandom( this.map.height - 66 );
            let terrainPos = new Position( terrainXStart, terrainYStart );
            this.doRivers( terrainPos );
        }

        // Lay a few lakes.
        if ( Micro.TERRAIN_LAKE_LEVEL !== 0 ) this.makeLakes();

        this.smoothRiver();
        this.cleanBorder();

        // And add trees.
        if ( Micro.TERRAIN_TREE_LEVEL !== 0 ) this.doTrees();

        if( debug ) console.timeEnd("start newmap");

        return this.map;

    }

    cleanBorder() {

        let map = this.map;
        if( map.isIsland ) return
        let x, y, l, r, s;

        for ( x = 0; x < map.width; x ++) {

            l = x + 1; if(l>map.width-1) l = map.width-1;
            r = x - 1; if(r<0) r = 0;
            s = 1; 
            if( map.getTileValue( x, s ) + map.getTileValue( l, s ) + map.getTileValue( r, s ) === 6 ) map.setTile( x, 0, Tile.RIVER, 0);
            s = map.height-2; 
            if( map.getTileValue( x, s ) + map.getTileValue( l, s ) + map.getTileValue( r, s ) === 6 ) map.setTile( x, map.height-1, Tile.RIVER, 0);

        }

        for ( y = 0; y < map.height; y ++) {

            l = y + 1; if(l>map.height-1) l = map.height-1;
            r = y - 1; if(r<0) r = 0;
            s = 1; 
            if( map.getTileValue( s, y ) + map.getTileValue( s, l ) + map.getTileValue( s, r ) === 6 ) map.setTile( 0, y, Tile.RIVER, 0);
            s = map.width-2; 
            if( map.getTileValue( s, y ) + map.getTileValue( s, l ) + map.getTileValue( s, r ) === 6 ) map.setTile( map.width-1, y, Tile.RIVER, 0);

        }

    }

    clearMap() {

        let map = this.map;

        map.pp.forEach( v => {//function ( v ) {

            map.setTile( v[0], v[1], Tile.DIRT, 0);

        });

    }

    clearUnnatural() {

        let map = this.map, value;

        map.pp.forEach( v => {

            value = map.getTileValue( v[0], v[1] );
            if ( value > Tile.WOODS ) map.setTile( v[0], v[1], Tile.DIRT, 0);

        });

    }

    makeNakedIsland() {

        let map = this.map;
        let terrainIslandRadius = Micro.ISLAND_RADIUS;
        let x, y, mapX, mapY;

        map.isIsland = true;

        map.pp.forEach( v => {

            x = v[0];
            y = v[1];

            if ((x < 5) || (x >= map.width - 5) || (y < 5) || (y >= map.height - 5)) map.setTile(x, y, Tile.RIVER, 0);
            else map.setTile( x, y, Tile.DIRT, 0 );

        });

        for ( x = 0; x < map.width - 5; x += 2) {
            mapY = math.getERandom(terrainIslandRadius);
            this.plopBRiver({ x:x, y:mapY });

            mapY = (map.height - 10) - math.getERandom(terrainIslandRadius);
            this.plopBRiver({ x:x, y:mapY });
            this.plopSRiver({ x:x, y:0 });
            this.plopSRiver({ x:x, y:map.height - 6 });
        }
        for ( y = 0; y < map.height - 5; y += 2 ) {
            mapX = math.getERandom( terrainIslandRadius );
            this.plopBRiver({ x:mapX, y:y });

            mapX = map.width - 10 - math.getERandom(terrainIslandRadius);
            this.plopBRiver({ x:mapX, y:y });
            this.plopSRiver({ x:0, y:y });
            this.plopSRiver({ x:map.width - 6, y:y });
        }
        
    }

    makeIsland() {

        this.makeNakedIsland();
        this.smoothRiver();
        this.doTrees();
        
    }

    makeLakes() {

        let x, y;
        let numLakes = Micro.TERRAIN_LAKE_LEVEL < 0 ? math.getRandom(10) : Micro.TERRAIN_LAKE_LEVEL * 0.5;

        while (numLakes > 0) {
            x = math.getRandom( this.map.width - 21) + 10;
            y = math.getRandom( this.map.height - 20) + 10;
            this.makeSingleLake( new Position(x, y) );
            numLakes--;
        }

    }

    makeSingleLake( pos ) {

        let numPlops = math.getRandom(12) + 2, plopPos;
        while ( numPlops > 0 ) {
            plopPos = new Position(pos, math.getRandom(12) - 6, math.getRandom(12) - 6);
            if ( math.getRandom(4) ) this.plopSRiver(plopPos);
            else this.plopBRiver( plopPos );
            numPlops--;
        }

    }

    treeSplash( x, y ) {

        let numTrees = Micro.TERRAIN_TREE_LEVEL < 0 ? math.getRandom(150) + 50 : math.getRandom(100 + (Micro.TERRAIN_TREE_LEVEL * 2)) + 50;
        let treePos = new Position(x, y), dir;

        while (numTrees > 0) {

            dir = Direction.NORTH + math.getRandom(7);
            treePos.move( dir );

            // XXX Should use the fact that positions return success/failure for moves
            if (!this.map.testBounds(treePos.x, treePos.y)) return;
            if ( this.map.getTileValue(treePos) === Tile.DIRT ) this.map.setTile(treePos, Tile.WOODS, Tile.BLBNBIT);
            
            numTrees--;
        }
    }

    doTrees() {

        let i = Micro.TERRAIN_TREE_LEVEL < 0 ? math.getRandom(100) + 50 : Micro.TERRAIN_TREE_LEVEL + 3;

        while(i--){
            this.treeSplash( math.getRandom( this.map.width - 1), math.getRandom( this.map.height - 1) );
        }

        /*for (var x = 0; x < i; x++) {
            var xloc = math.getRandom(this.map.width - 1);
            var yloc = math.getRandom(this.map.height - 1);
            this.treeSplash( xloc, yloc );
        }*/

        this.smoothTrees();
        this.smoothTrees();

    }

    smoothRiver() {

        let map = this.map;
        let riverEdge = this.riverEdge;
        let x, y, z, xt, yt, tt, bitIndex, temp;
        let dx = [-1,  0,  1,  0];
        let dy = [0,  1,  0, -1];

        map.pp.forEach( v => {

            x = v[0];
            y = v[1];

            if ( map.getTileValue(x, y) === Tile.REDGE ) {

                bitIndex = 0;

                for ( z = 0; z < 4; z++) {
                    bitIndex = bitIndex << 1;
                    xt = x + dx[z];
                    yt = y + dy[z];
                    if( map.testBounds( xt, yt ) ){
                        tt = map.getTileValue( xt, yt );
                        if( tt !== Tile.DIRT && ( tt < Tile.WOODS_LOW || tt > Tile.WOODS_HIGH )  ) bitIndex++;
                    }
                }

                temp = riverEdge[bitIndex & 15];
                if ( temp !== Tile.RIVER && math.getRandom(1) ) temp++;

                //map.setTileValue(x, y, temp, 0);

                map.setTile( x, y, temp, Tile.BULLBIT ); // or we can't make bridge !!!  
           
            }
        });
    }

    isTree( value ) {

        return value >= Tile.WOODS_LOW && value <= Tile.WOODS_HIGH;

    }

    smoothTrees() {

        let map = this.map;
        let x, y;

        map.pp.forEach( v => {

            x = v[0];
            y = v[1];
            if (this.isTree(map.getTileValue(x, y)))  this.smoothTreesAt( x, y, false );

        });

    }

    smoothTreesAt( x, y, preserve ) {

        let map = this.map;
        let dx = [-1,  0,  1,  0 ];
        let dy = [ 0,  1,  0, -1 ];
        
        if (!this.isTree(this.map.getTileValue(x, y))) return;

        let i, xTemp, yTemp, temp, bitIndex = 0;

        for ( i = 0; i < 4; i++) {
            bitIndex = bitIndex << 1;
            xTemp = x + dx[i];
            yTemp = y + dy[i];
            if (map.testBounds(xTemp, yTemp) && this.isTree(map.getTileValue(xTemp, yTemp))) bitIndex++;
        }
        
        temp = this.treeTable[ bitIndex & 15 ];
        if (temp) {
            if (temp !== Tile.WOODS) {
                if ((x + y) & 1) temp -= 8;
            }
            if(temp>28 && temp<38) temp-=8;
            map.setTile(x, y, temp, Tile.BLBNBIT);
        } else {
            if (!preserve){ 
                if(temp>28 && temp<38) temp-=8;
                map.setTileValue(x, y, temp, 0);
            }        }

    }

    doRivers( terrainPos ) {

        let riverDir = Direction.NORTH + math.getRandom(3) * 2;
        this.doBRiver( terrainPos, riverDir, riverDir );

        riverDir = Direction.rotate180(riverDir);
        let terrainDir = this.doBRiver( terrainPos, riverDir, riverDir );

        riverDir = Direction.NORTH + math.getRandom(3) * 2;
        this.doSRiver( terrainPos, riverDir, terrainDir );

    }

    doBRiver( riverPos, riverDir, terrainDir) {

        let rate1, rate2;

        if (Micro.TERRAIN_CURVE_LEVEL < 0) {
            rate1 = 100;
            rate2 = 200;
        } else {
            rate1 = Micro.TERRAIN_CURVE_LEVEL + 10;
            rate2 = Micro.TERRAIN_CURVE_LEVEL + 100;
        }
        let pos = new Position(riverPos);
        while ( this.map.testBounds( pos.x + 4, pos.y + 4 ) ) {
            this.plopBRiver(pos);
            if (math.getRandom(rate1+1) < 10) {
                terrainDir = riverDir;
            } else {
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir);
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir, 7);
            }
            pos.move(terrainDir);
        }
        return terrainDir;

    }

    doSRiver(riverPos, riverDir, terrainDir) {

        let rate1, rate2;
        if (Micro.TERRAIN_CURVE_LEVEL < 0) {
            rate1 = 100;
            rate2 = 200;
        } else {
            rate1 = Micro.TERRAIN_CURVE_LEVEL + 10;
            rate2 = Micro.TERRAIN_CURVE_LEVEL + 100;
        }
        let pos = new Position(riverPos);
        while ( this.map.testBounds(pos.x + 3, pos.y + 3) ) {
            this.plopSRiver(pos);
            if (math.getRandom(rate1+1) < 10) {
                terrainDir = riverDir;
            } else {
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir);
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir, 7);
            }
            pos.move(terrainDir);
        }
        return terrainDir;

    }

    putOnMap( newVal, x, y ) {

        if (newVal === 0) return;
        if (!this.map.testBounds(x, y)) return;

        let tmp = this.map.getTileValue(x, y);

        if (tmp !== Tile.DIRT) {
            if (tmp === Tile.RIVER && newVal !== Tile.CHANNEL) return;
            if (tmp === Tile.CHANNEL) return;
        }

        this.map.setTile(x, y, newVal, 0);

    }

    plopBRiver( pos ) {

        let x = 9, y;

        while(x--){
            y = 9;
            while(y--){
                this.putOnMap( this.BRMatrix[y][x], pos.x + x, pos.y + y );
            }
        }

    }

    plopSRiver( pos ) {

        let x = 6, y;

        while(x--){
            y = 6;
            while(y--){
                this.putOnMap( this.SRMatrix[y][x], pos.x + x, pos.y + y );
            }
        }

    }

    smoothWater() {

        let map = this.map, tile, pos, dir, x, y, makeRiver;

        map.pp.forEach( v => {

            x = v[0];
            y = v[1];

            tile = map.getTileValue(x, y);

            if (tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
                pos = new Position(x, y);
                for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                    tile = map.getTileFromMap(pos, dir, Tile.WATER_LOW);

                    // If nearest object is not water:
                    if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
                        // set river edge
                        map.setTileValue(x, y, Tile.REDGE, 0);
                        break; // Continue with next tile
                    }
                }
            }
        });

        map.pp.forEach( v => {

            x = v[0];
            y = v[1];

            tile = map.getTileValue(x, y);
            if (tile !== Tile.CHANNEL && tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
                makeRiver = true;
                pos = new Position(x, y);
                for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                    tile = map.getTileFromMap(pos, dir, Tile.WATER_LOW);
                    if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
                        makeRiver = false;
                        break;
                    }
                }
                if (makeRiver) map.setTileValue(x, y, Tile.RIVER, 0);
            }
        });

        map.pp.forEach( v => {

            x = v[0];
            y = v[1];

            tile = map.getTileValue(x, y);
            if (tile >= Tile.WOODS_LOW && tile <= Tile.WOODS_HIGH) {
                pos = new Position(x, y);
                for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                    tile = map.getTileFromMap(pos, dir, TILE_INVALID);
                    if (tile === Tile.RIVER || tile === Tile.CHANNEL) {
                        map.setTileValue(x, y, Tile.REDGE, 0);
                        break;
                    }
                }
            }
        });
    }


}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


class WorldEffects {

    constructor ( map ) {

        this._map = map;
        this._data = {};
    }

    toKey (x, y) {
        return [x, y].join(',');
    }

    fromKey (k) {
        k = k.split(',');
        return {x: k[0] - 0, y: k[1] - 0};
    }

    clear () {
        this._data = [];
    }

    getTile (x, y) {
        let key = this.toKey(x, y);
        let tile = this._data[key];
        if ( tile === undefined ) tile = this._map.getTile(x, y);
        return tile;
    }

    getTileValue (x, y) {
        return this.getTile(x, y).getValue();
    }

    setTile ( x, y, value, flags ) {

        if (flags !== undefined && value.isTile ) throw new Error('Flags supplied with already defined tile');
        if (flags === undefined && !value.isTile ) value = new Tiles(value);
        else if (flags !== undefined) value = new Tiles(value, flags);
        let key = this.toKey( x, y );
        this._data[key] = value;
    }

    apply () {
        let keys = Object.keys(this._data);
        for ( let i = 0, l = keys.length; i < l; i++ ) {
            let coords = this.fromKey(keys[i]);
            this._map.setTo( coords, this._data[keys[i]] );
        }
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */


class BaseTool {

    constructor () {

        this.TOOLRESULT_OK = 0;
        this.TOOLRESULT_FAILED = 1;
        this.TOOLRESULT_NO_MONEY = 2;
        this.TOOLRESULT_NEEDS_BULLDOZE = 3;
        this.autoBulldoze = true;
        this.bulldozerCost = 1;

    }

    init ( cost, map, shouldAutoBulldoze, IsDraggable = false ) {

        //Object.defineProperty(this, 'toolCost', MiscUtils.mcd(cost));
        this.toolCost = cost;
        this.result = null;
        this.isDraggable = IsDraggable;
        this._shouldAutoBulldoze = shouldAutoBulldoze;
        this._map = map;
        this._worldEffects = new WorldEffects( map );
        this._applicationCost = 0;

    }

    clear () {

        this._applicationCost = 0;
        this._worldEffects.clear();

    }

    addCost ( cost ) {

        this._applicationCost += cost;

    }

    doAutoBulldoze ( x, y ) {

        //if ( !this._shouldAutoBulldoze ) return;
        let tile = this._worldEffects.getTile(x, y);
        if ( tile.isBulldozable() ) {
            tile = ZoneUtils.normalizeRoad( tile );
            if ((tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP) || (tile < Tile.HBRIDGE && tile !== Tile.DIRT)) {
              this.addCost(1);
              this._worldEffects.setTile(x, y, Tile.DIRT);
            }
        }

    }

    apply ( budget ) {

        this._worldEffects.apply();
        budget.spend(this._applicationCost);
        this.clear();

    }

    modifyIfEnoughFunding ( budget ) {

        if (this.result !== this.TOOLRESULT_OK) { this.clear(); return false; }
        if (budget.totalFunds < this._applicationCost) { this.result = this.TOOLRESULT_NO_MONEY; this.clear(); return false; }
        this.apply.call(this, budget);
        this.clear();
        return true;

    }

    setAutoBulldoze ( value ) {

        this.autoBulldoze = value;

    }

    getAutoBulldoze () {

        return this.autoBulldoze;

    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class BaseToolConnector extends BaseTool {

    constructor () {

        super();

    }

    fixSingle ( x, y ) {

        let adjTile = 0;
        let tile = this._worldEffects.getTile(x, y);

        tile = ZoneUtils.normalizeRoad(tile);

        if (tile >= Tile.ROADS && tile <= Tile.INTERSECTION) {
            if (y > 0) {
                tile = this._worldEffects.getTile(x, y - 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.HRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.HROADPOWER && tile !== Tile.VRAILROAD && tile !== Tile.ROADBASE) adjTile |= 1;
            }
            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTile(x + 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.VRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.VROADPOWER && tile !== Tile.HRAILROAD && tile !== Tile.VBRIDGE) adjTile |= 2;
            }
            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTile(x, y + 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.HRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.HROADPOWER && tile !== Tile.VRAILROAD && tile !== Tile.ROADBASE) adjTile |= 4;
            }
            if (x > 0) {
                tile = this._worldEffects.getTile(x - 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.VRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.VROADPOWER && tile !== Tile.HRAILROAD && tile !== Tile.VBRIDGE) adjTile |= 8;
            }

            this._worldEffects.setTile(x, y, RoadTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
            return;
        }

        if (tile >= Tile.LHRAIL && tile <= Tile.LVRAIL10) {
            if (y > 0) {
                tile = this._worldEffects.getTile(x, y - 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILHPOWERV && tile !== Tile.HRAILROAD && tile !== Tile.HRAIL) adjTile |= 1;
            }

            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTile(x + 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILVPOWERH && tile !== Tile.VRAILROAD && tile !== Tile.VRAIL) adjTile |= 2;
            }

            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTile(x, y + 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILHPOWERV && tile !== Tile.HRAILROAD && tile !== Tile.HRAIL) adjTile |= 4;
            }

            if (x > 0) {
                tile = this._worldEffects.getTile(x - 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILVPOWERH && tile !== Tile.VRAILROAD && tile !== Tile.VRAIL) adjTile |= 8;
            }
            this._worldEffects.setTile(x, y, RailTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
            return;
        }

        if (tile >= Tile.LHPOWER && tile <= Tile.LVPOWER10) {
            if (y > 0) {
                tile = this._worldEffects.getTile(x, y - 1);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.VPOWER && tile !== Tile.VROADPOWER && tile !== Tile.RAILVPOWERH) adjTile |= 1;
                }
            }
            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTile(x + 1, y);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.HPOWER && tile !== Tile.HROADPOWER && tile !== Tile.RAILHPOWERV) adjTile |= 2;
                }
            }
            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTile(x, y + 1);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.VPOWER && tile !== Tile.VROADPOWER && tile !== Tile.RAILVPOWERH) adjTile |= 4;
                }
            }
            if (x > 0) {
                tile = this._worldEffects.getTile(x - 1, y);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.HPOWER && tile !== Tile.HROADPOWER && tile !== Tile.RAILHPOWERV) adjTile |= 8;
                }
            }
            this._worldEffects.setTile(x, y, WireTable[adjTile] | Tile.BLBNCNBIT);
            return;
        }
    }

    checkZoneConnections ( x, y ) {

        this.fixSingle(x, y);
        if (y > 0) this.fixSingle(x, y - 1);
        if (x < this._map.width - 1) this.fixSingle(x + 1, y);
        if (y < this._map.height - 1) this.fixSingle(x, y + 1);
        if (x > 0) this.fixSingle(x - 1, y);

    }

    checkBorder ( x, y, size ) {

        // Adjust to top left tile
        x = x - 1;
        y = y - 1;
        let i;
        for (i = 0; i < size; i++) this.fixZone(x + i, y - 1);
        for (i = 0; i < size; i++) this.fixZone(x - 1, y + i);
        for (i = 0; i < size; i++) this.fixZone(x + i, y + size);
        for (i = 0; i < size; i++) this.fixZone(x + size, y + i);
            
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class BuildingTool extends BaseToolConnector {

    constructor ( cost, centreTile, map, size, animated ) {

        super();
        this.init( cost, map, false );
        this.centreTile = centreTile;
        this.size = size;
        this.animated = animated;

    }

    putBuilding ( leftX, topY ) {
        let posX, posY, tileValue, tileFlags;
        let baseTile = this.centreTile - this.size - 1;

        for (let dy = 0; dy < this.size; dy++) {
            posY = topY + dy;

            for ( let dx = 0; dx < this.size; dx++ ) {
                posX = leftX + dx;
                tileValue = baseTile;
                tileFlags = Tile.BNCNBIT;

                if (dx === 1) {
                    if (dy === 1) tileFlags |= Tile.ZONEBIT;
                    else if (dy === 2 && this.animated) tileFlags |= Tile.ANIMBIT;
                }
                this._worldEffects.setTile(posX, posY, tileValue, tileFlags);
                baseTile++;
            }
        }
    }

    prepareBuildingSite ( leftX, topY ) {
        // Check that the entire site is on the map
        if (leftX < 0 || leftX + this.size > this._map.width) return this.TOOLRESULT_FAILED;
        if (topY < 0 || topY + this.size > this._map.height) return this.TOOLRESULT_FAILED;

        let posX, posY, tileValue;

        // Check whether the tiles are clear
        for (let dy = 0; dy < this.size; dy++) {
            posY = topY + dy;
            for (let dx = 0; dx < this.size; dx++) {
                posX = leftX + dx;
                tileValue = this._worldEffects.getTileValue(posX, posY);

                if (tileValue === Tile.DIRT) continue;
                if (!this.autoBulldoze) {
                    // No Tile.DIRT and no bull-dozer => not buildable
                    return this.TOOLRESULT_NEEDS_BULLDOZE;
                }

                if (!ZoneUtils.canBulldoze(tileValue)) {
                    // tilevalue cannot be auto-bulldozed
                    return this.TOOLRESULT_NEEDS_BULLDOZE;
                }
            this._worldEffects.setTile(posX, posY, Tile.DIRT);
            this.addCost(this.bulldozerCost);
            }
        }
        return this.TOOLRESULT_OK;
    }

    buildBuilding ( x, y ) {
        // Correct to top left
        x--;
        y--;

        let prepareResult = this.prepareBuildingSite(x, y);
        if (prepareResult !== this.TOOLRESULT_OK) return prepareResult;

        this.addCost(this.toolCost);
        this.putBuilding(x, y);
        this.checkBorder(x, y);

        return this.TOOLRESULT_OK;
    }

    doTool ( x, y, blockMaps ) {
        this.result = this.buildBuilding(x, y);
    }

}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class BulldozerTool extends BaseToolConnector {

    constructor( map ) {

        super();
        this.init(10, map, true);
        
    }


    putRubble( x, y, size ) {

        for (let xx = x; xx < x + size; xx++) {
            for (let yy = y; yy < y + size; yy++)  {
                if (this._map.testBounds(xx, yy)) {
                    let tile = this._worldEffects.getTile(xx, yy);
                    if (tile !== Tile.RADTILE && tile !== Tile.DIRT) {
                        this._worldEffects.setTile(xx, yy, Tile.TINYEXP + math.getRandom(2), Tile.ANIMBIT | Tile.BULLBIT );
                    }
                }
            }
        }

    }

    layDoze( x, y ) {

        let tile = this._worldEffects.getTile(x, y);

        if (!tile.isBulldozable()) return this.TOOLRESULT_FAILED;

        tile = tile.getValue();
        tile = ZoneUtils.normalizeRoad(tile);

        switch (tile) {
            case Tile.HBRIDGE:
            case Tile.VBRIDGE:
            case Tile.BRWV:
            case Tile.BRWH:
            case Tile.HBRDG0:
            case Tile.HBRDG1:
            case Tile.HBRDG2:
            case Tile.HBRDG3:
            case Tile.VBRDG0:
            case Tile.VBRDG1:
            case Tile.VBRDG2:
            case Tile.VBRDG3:
            case Tile.HPOWER:
            case Tile.VPOWER:
            case Tile.HRAIL:
            case Tile.VRAIL:
                this._worldEffects.setTile(x, y, Tile.RIVER);
            break;

            default: this._worldEffects.setTile(x, y, Tile.DIRT); break;
        }

        this.addCost(1);
        return this.TOOLRESULT_OK;

    }

    doTool( x, y, blockMaps, messageManager ) {

        if (!this._map.testBounds(x, y)) this.result = this.TOOLRESULT_FAILED;

        let tile = this._worldEffects.getTile(x, y);
        let tileValue = tile.getValue();

        let zoneSize = 0;
        let deltaX;
        let deltaY;

        if (tile.isZone()) {
            zoneSize = ZoneUtils.checkZoneSize(tileValue);
            deltaX = 0;
            deltaY = 0;
        } else {
            let result = ZoneUtils.checkBigZone(tileValue);
            zoneSize = result.zoneSize;
            deltaX = result.deltaX;
            deltaY = result.deltaY;
        }

        //console.log( zoneSize, deltaX, deltaY )

        if (zoneSize > 0) {

            this.addCost(this.bulldozerCost);

            //this._map.powerData[ this._map.getId( x, y ) ] = 0;

            this._map.powered({ v:1, x:x, y:y });
            let centerX = x + deltaX;
            let centerY = y + deltaY;

            switch (zoneSize) {
                case 3:
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONHIGH);
                    this.putRubble(centerX - 1, centerY - 1, 3);
                break;
                case 4:
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONLOW);
                    this.putRubble(centerX - 1, centerY - 1, 4);
                break;
                case 6:
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONHIGH);
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONLOW);
                    this.putRubble(centerX - 1, centerY - 1, 6);
                break;
            }

            this.result = this.TOOLRESULT_OK;
        }

        let toolResult;
        if (tileValue === Tile.RIVER || tileValue === Tile.REDGE || tileValue === Tile.CHANNEL) {
            toolResult = this.layDoze(x, y);
            if (tileValue !== this._worldEffects.getTileValue(x, y)) this.addCost(5);
        } else {
            toolResult = this.layDoze(x, y);
            this.checkZoneConnections(x, y);
        }

        this.result = toolResult;
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class ParkTool extends BaseTool {

    constructor ( map ) {

        super();
        this.init( 10, map, true );

    }

    doTool ( x, y, blockMaps ) {

        if (this._worldEffects.getTileValue(x, y) !== Tile.DIRT) {
            this.result = this.TOOLRESULT_NEEDS_BULLDOZE;
            return;
        }
        let value = math.getRandom(4);
        let tileFlags = Tile.BURNBIT | Tile.BULLBIT;
        let tileValue;

        if (value === 4) {
            tileValue = Tile.FOUNTAIN;
            tileFlags |= Tile.ANIMBIT;
        } else {
            tileValue = value + Tile.WOODS2;
        }

        this._worldEffects.setTile(x, y, tileValue, tileFlags);
        this.addCost(10);
        this.result = this.TOOLRESULT_OK;

    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class RailTool extends BaseToolConnector {

    constructor ( map ) {

        super();
        this.init(20, map, true, true);

    }

    layRail ( x, y ) {
        
        this.doAutoBulldoze(x, y);
        let cost = this.toolCost;
        let tile = this._worldEffects.getTileValue(x, y);
        tile = ZoneUtils.normalizeRoad(tile);

        switch (tile) {
            case Tile.DIRT: this._worldEffects.setTile(x, y, Tile.LHRAIL | Tile.BULLBIT | Tile.BURNBIT); break;

            case Tile.RIVER:
            case Tile.REDGE:
            case Tile.CHANNEL:
                cost = 100;
                if (x < this._map.width - 1) {
                    tile = this._worldEffects.getTileValue(x + 1, y);
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile == Tile.RAILHPOWERV || tile == Tile.HRAIL || (tile >= Tile.LHRAIL && tile <= Tile.HRAILROAD)) {
                        this._worldEffects.setTile(x, y, Tile.HRAIL, Tile.BULLBIT);
                        break;
                    }
                }
                if (x > 0) {
                    tile = this._worldEffects.getTileValue(x - 1, y);
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile == Tile.RAILHPOWERV || tile == Tile.HRAIL || (tile > Tile.VRAIL && tile < Tile.VRAILROAD)) {
                        this._worldEffects.setTile(x, y, Tile.HRAIL, Tile.BULLBIT);
                        break;
                    }
                }
                if (y < this._map.height - 1) {
                    tile = this._worldEffects.getTileValue(x, y + 1);
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile == Tile.RAILVPOWERH || tile == Tile.VRAILROAD || (tile > Tile.HRAIL && tile < Tile.HRAILROAD)) {
                        this._worldEffects.setTile(x, y, Tile.VRAIL, Tile.BULLBIT);
                        break;
                    }
                }
                if (y > 0) {
                    tile = this._worldEffects.getTileValue(x, y - 1);
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile == Tile.RAILVPOWERH || tile == Tile.VRAILROAD || (tile > Tile.HRAIL && tile < Tile.HRAILROAD)) {
                        this._worldEffects.setTile(x, y, Tile.VRAIL, Tile.BULLBIT);
                        break;
                    }
                }
                return this.TOOLRESULT_FAILED;

            case Tile.LHPOWER: this._worldEffects.setTile(x, y, Tile.RAILVPOWERH, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.LVPOWER: this._worldEffects.setTile(x, y, Tile.RAILHPOWERV, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.ROADS: this._worldEffects.setTile(x, y, Tile.VRAILROAD, Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.ROADS2: this._worldEffects.setTile(x, y, Tile.HRAILROAD, Tile.BURNBIT | Tile.BULLBIT); break;
            default: return this.TOOLRESULT_FAILED;
        }

        this.addCost(cost);
        this.checkZoneConnections(x, y);
        return this.TOOLRESULT_OK;
    };

    doTool (x, y, blockMaps) {
        this.result = this.layRail(x, y);
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class RoadTool extends BaseToolConnector {

    constructor ( map ) {

        super();
        this.init(10, map, true, true);

    }

    layRoad ( x, y ) {

        this.doAutoBulldoze(x, y);
        let tile = this._worldEffects.getTileValue(x, y);
        let cost = this.toolCost;

        switch (tile) {
            case Tile.DIRT: this._worldEffects.setTile(x, y, Tile.ROADS, Tile.BULLBIT | Tile.BURNBIT); break;
            case Tile.RIVER:
            case Tile.REDGE:
            case Tile.CHANNEL:
                
                //console.log('is water')
                cost = 50;
                if (x < this._map.width - 1) {
                    tile = this._worldEffects.getTileValue(x + 1, y);
                    tile = ZoneUtils.normalizeRoad(tile);

                    if (tile === Tile.VRAILROAD || tile === Tile.HBRIDGE || (tile >= Tile.ROADS && tile <= Tile.HROADPOWER)) {
                        this._worldEffects.setTile(x, y, Tile.HBRIDGE, Tile.BULLBIT);
                        break;
                    }
                }
                if (x > 0) {
                    tile = this._worldEffects.getTileValue(x - 1, y);
                    tile = ZoneUtils.normalizeRoad(tile);

                    if (tile === Tile.VRAILROAD || tile === Tile.HBRIDGE || (tile >= Tile.ROADS && tile <= Tile.INTERSECTION)) {
                        this._worldEffects.setTile(x, y, Tile.HBRIDGE, Tile.BULLBIT);
                        break;
                    }
                }
                if (y < this._map.height - 1) {
                    tile = this._worldEffects.getTileValue(x, y + 1);
                    tile = ZoneUtils.normalizeRoad(tile);

                    if (tile === Tile.HRAILROAD || tile === Tile.VROADPOWER || (tile >= Tile.VBRIDGE && tile <= Tile.INTERSECTION)) {
                        this._worldEffects.setTile(x, y, Tile.VBRIDGE, Tile.BULLBIT);
                        break;
                    }
                }
                if (y > 0) {
                    tile = this._worldEffects.getTileValue(x, y - 1);
                    tile = ZoneUtils.normalizeRoad(tile);

                    if (tile === Tile.HRAILROAD || tile === Tile.VROADPOWER || (tile >= Tile.VBRIDGE && tile <= Tile.INTERSECTION)) {
                        this._worldEffects.setTile(x, y, Tile.VBRIDGE, Tile.BULLBIT);
                        break;
                    }
                }
                return this.TOOLRESULT_FAILED;

            case Tile.LHPOWER: this._worldEffects.setTile(x, y, Tile.VROADPOWER | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.LVPOWER: this._worldEffects.setTile(x, y, Tile.HROADPOWER | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.LHRAIL: this._worldEffects.setTile(x, y, Tile.HRAILROAD | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.LVRAIL: this._worldEffects.setTile(x, y, Tile.VRAILROAD | Tile.BURNBIT | Tile.BULLBIT); break;
            default: return this.TOOLRESULT_FAILED;
        }

        this.addCost(cost);
        this.checkZoneConnections(x, y);
        return this.TOOLRESULT_OK;
    }

    doTool = function(x, y, blockMaps) {
        this.result = this.layRoad(x, y);
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class QueryTool extends BaseTool {

    constructor ( map ) {

        super();
        this.init(0, map, false, false);
        this.txt = "";

    }

    classifyPopulationDensity (x, y, blockMaps) {
        var density = blockMaps.populationDensityMap.worldGet(x, y);
        //if (debug) document.getElementById("queryDensityRaw").innerHTML=density;
        density = density >> 6;
        density = density & 3;

        this.txt+='Density: '+TXT.densityStrings[density]+'<br>';
        //document.getElementById("queryDensity").innerHTML=TXT.densityStrings[density];
    }

    classifyLandValue (x, y, blockMaps) {
        var landValue = blockMaps.landValueMap.worldGet(x, y);
        //if (debug) document.getElementById("queryLandValueRaw").innerHTML=landValue;

        var i = 0;
        if (landValue >= 150) i = 3;
        else if (landValue >= 80) i = 2;
        else if (landValue >= 30) i = 1;

        //var text = TXT.landValueStrings[i];
        this.txt+='Value: '+TXT.landValueStrings[i]+'<br>';
        //document.getElementById("queryLandValue").innerHTML=text;
    }

    classifyCrime (x, y, blockMaps) {
        var crime = blockMaps.crimeRateMap.worldGet(x, y);
        //if (debug) document.getElementById("queryCrimeRaw").innerHTML=crime;

        crime = crime >> 6;
        crime = crime & 3;

        this.txt+='Crime: '+TXT.crimeStrings[crime]+'<br>';
        //document.getElementById("queryCrime").innerHTML=TXT.crimeStrings[crime];
    }

    classifyPollution (x, y, blockMaps) {
        var pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
        //if (debug) document.getElementById("queryPollutionRaw").innerHTML=pollution;
        pollution = pollution >> 6;
        pollution = pollution & 3;

        this.txt+='Pollution: '+TXT.pollutionStrings[pollution]+'<br>';
        //document.getElementById("queryPollution").innerHTML=TXT.pollutionStrings[pollution];
    }

    classifyRateOfGrowth (x, y, blockMaps) {
        var rate = blockMaps.rateOfGrowthMap.worldGet(x, y);
        //if (debug) document.getElementById("queryRateRaw").innerHTML=rate;
        rate = rate >> 6;
        rate = rate & 3;

        this.txt+='Growth: '+TXT.rateStrings[rate];
        //document.getElementById("queryRate").innerHTML=TXT.rateStrings[rate];
    }

    classifyDebug (x, y, blockMaps) {
        /*document.getElementById("queryFireStationRaw").innerHTML=blockMaps.fireStationMap.worldGet(x, y);
        document.getElementById("queryFireStationEffectRaw").innerHTML=blockMaps.fireStationEffectMap.worldGet(x, y);
        document.getElementById("queryPoliceStationRaw").innerHTML=blockMaps.policeStationMap.worldGet(x, y);
        document.getElementById("queryPoliceStationEffectRaw").innerHTML=blockMaps.policeStationEffectMap.worldGet(x, y);
        document.getElementById("queryTerrainDensityRaw").innerHTML=blockMaps.terrainDensityMap.worldGet(x, y);
        document.getElementById("queryTrafficDensityRaw").innerHTML=blockMaps.trafficDensityMap.worldGet(x, y);
        document.getElementById("queryComRateRaw").innerHTML=blockMaps.comRateMap.worldGet(x, y);*/
    }

    classifyZone (x, y) {
        var baseTiles = [
            Tile.DIRT, Tile.RIVER, Tile.TREEBASE, Tile.RUBBLE,
            Tile.FLOOD, Tile.RADTILE, Tile.FIRE, Tile.ROADBASE,
            Tile.POWERBASE, Tile.RAILBASE, Tile.RESBASE, Tile.COMBASE,
            Tile.INDBASE, Tile.PORTBASE, Tile.AIRPORTBASE, Tile.COALBASE,
            Tile.FIRESTBASE, Tile.POLICESTBASE, Tile.STADIUMBASE, Tile.NUCLEARBASE,
            Tile.HBRDG0, Tile.RADAR0, Tile.FOUNTAIN, Tile.INDBASE2,
            Tile.FOOTBALLGAME1, Tile.VBRDG0, 952];

        var tileValue = this._map.getTileValue(x, y);
        if (tileValue >= Tile.COALSMOKE1 && tileValue < Tile.FOOTBALLGAME1) tileValue = Tile.COALBASE;

        var index = 0, l;
        for (index = 0, l = baseTiles.length - 1; index < l; index++) {
            if (tileValue < baseTiles[index + 1])
            break;
        }

        this.txt='Zone: '+TXT.zoneTypes[index]+'<br>';

        //document.getElementById("queryZoneType").innerHTML=TXT.zoneTypes[index];
    }

    getInfo () {
        return this.txt;
    }

    doTool (x, y, blockMaps, messageManager) {

        var text = 'Position (' + x + ', ' + y + ')';
        text += ' TileValue: ' + this._map.getTileValue(x, y);

        {
          this._map.getTile(x, y);
          /*document.getElementById("queryTile").innerHTML=[x,y].join(', ');
          document.getElementById("queryTileValue").innerHTML=tile.getValue();
          document.getElementById("queryTileBurnable").innerHTML=tile.isCombustible();
          document.getElementById("queryTileBulldozable").innerHTML=tile.isBulldozable();
          document.getElementById("queryTileCond").innerHTML=tile.isConductive();
          document.getElementById("queryTileAnim").innerHTML=tile.isAnimated();
          document.getElementById("queryTilePowered").innerHTML=tile.isPowered();*/
        }

        this.classifyZone(x, y);
        this.classifyPopulationDensity(x, y, blockMaps);
        this.classifyLandValue(x, y, blockMaps);
        this.classifyCrime(x, y, blockMaps);
        this.classifyPollution(x, y, blockMaps);
        this.classifyRateOfGrowth(x, y, blockMaps);
        this.classifyDebug(x, y, blockMaps);

        messageManager.sendMessage(Messages.QUERY_WINDOW_NEEDED);

        this.result = this.TOOLRESULT_OK;
    }
}

/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

class WireTool extends BaseToolConnector {

    constructor ( map ) {

        super();
        this.init( 5, map, true, true );
        
    }

    layWire ( x, y ) {

        this.doAutoBulldoze( x, y );
        let cost = 5;
        let tile = this._worldEffects.getTileValue( x, y );
        tile = ZoneUtils.normalizeRoad( tile );

        switch (tile) {
            case Tile.DIRT: this._worldEffects.setTile(x, y, Tile.LHPOWER, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.RIVER: case Tile.REDGE: case Tile.CHANNEL:
                cost = 25;
                if (x < this._map.width - 1) {
                    tile = this._worldEffects.getTile(x + 1, y);
                    if (tile.isConductive()) {
                        tile = tile.getValue();
                        tile = ZoneUtils.normalizeRoad(tile);
                        if (tile != Tile.HROADPOWER && tile != Tile.RAILHPOWERV && tile != Tile.HPOWER) {
                            this._worldEffects.setTile(x, y, Tile.VPOWER, Tile.CONDBIT | Tile.BULLBIT);
                            break;
                        }
                    }
                }
                if (x > 0) {
                    tile = this._worldEffects.getTile(x - 1, y);
                    if (tile.isConductive()) {
                        tile = tile.getValue();
                        tile = ZoneUtils.normalizeRoad(tile);
                        if (tile != Tile.HROADPOWER && tile != Tile.RAILHPOWERV && tile != Tile.HPOWER) {
                            this._worldEffects.setTile(x, y, Tile.VPOWER, Tile.CONDBIT | Tile.BULLBIT);
                            break;
                        }
                    }
                }
                if (y < this._map.height - 1) {
                    tile = this._worldEffects.getTile(x, y + 1);
                    if (tile.isConductive()) {
                        tile = tile.getValue();
                        tile = ZoneUtils.normalizeRoad(tile);
                        if (tile != Tile.VROADPOWER && tile != Tile.RAILVPOWERH && tile != Tile.VPOWER) {
                            this._worldEffects.setTile(x, y, Tile.HPOWER, Tile.CONDBIT | Tile.BULLBIT);
                            break;
                        }
                    }
                }
                if (y > 0) {
                    tile = this._worldEffects.getTile(x, y - 1);
                    if (tile.isConductive()) {
                        tile = tile.getValue();
                        tile = ZoneUtils.normalizeRoad(tile);
                        if (tile != Tile.VROADPOWER && tile != Tile.RAILVPOWERH && tile != Tile.VPOWER) {
                            this._worldEffects.setTile(x, y, Tile.HPOWER, Tile.CONDBIT | Tile.BULLBIT);
                            break;
                        }
                    }
                }
                return this.TOOLRESULT_FAILED;

            case Tile.ROADS: this._worldEffects.setTile(x, y, Tile.HROADPOWER, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.ROADS2: this._worldEffects.setTile(x, y, Tile.VROADPOWER, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.LHRAIL: this._worldEffects.setTile(x, y, Tile.RAILHPOWERV, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            case Tile.LVRAIL: this._worldEffects.setTile(x, y, Tile.RAILVPOWERH, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
            default: return this.TOOLRESULT_FAILED;
        }

        this.addCost( cost );
        this.checkZoneConnections( x, y );
        return this.TOOLRESULT_OK;

    }

    doTool ( x, y, blockMaps ) {

        this.result = this.layWire( x, y ); 

    }
}

const postMessage = self.webkitPostMessage || self.postMessage;
//var timestep = 1000/30;
var Game;
var isWorker = true;
var returnMessage;

//var ab = new ArrayBuffer( 1 );
//CityGame.post( ab, [ab] );
var trans = false;// ( ab.byteLength === 0 );


self.onmessage = function ( e ) { CityGame.message( e ); };


class CityGame {

    static message ( e ) {

        var p = e.data.tell;

        if( p == "INIT" ) {

            if( e.data.returnMessage ){

                returnMessage = e.data.returnMessage;
                isWorker = false;

            }

            Game = new MainGame( e.data.timestep );

        }


        if( p == "NEWMAP" ) Game.newMap(); 
        if( p == "PLAYMAP" ) Game.playMap();
        if( p == "TOOL" ) Game.tool(e.data.name);
        if( p == "MAPCLICK" ) Game.mapClick(e.data.x, e.data.y, e.data.single || false);

        //if( p == "DESTROY" ) Game.destroy(e.data.x, e.data.y);

        //if( p == "RUN" && trans) updateTrans(e.data);

        if( p == "DIFFICULTY" ) Game.changeDifficulty(e.data.n);
        if( p == "SPEED" ) Game.changeSpeed(e.data.n);

        if( p == "BUDGET") Game.handleBudgetRequest();
        if( p == "NEWBUDGET") Game.setBudget(e.data.budgetData);

        if( p == "DISASTER") Game.setDisaster(e.data.disaster);

        if( p == "EVAL") Game.getEvaluation();

        if( p == "SAVEGAME") Game.saveGame(e.data.saveCity);
        if( p == "LOADGAME") Game.loadGame(e.data.isStart);
        if( p == "MAKELOADGAME") Game.makeLoadGame(e.data.savegame, e.data.isStart);

    }

    static post ( e, buffer ){

        if( isWorker ) postMessage( e, buffer );
        else returnMessage( { data : e } );

    }



}


var update = function(){

    Game.tick();

};


class MainGame {

    constructor ( timestep ) {

        this.timestep = timestep;

        this.mapSize = [128,128];
        this.difficulty = 1;
        this.speed = 2;
        this.oldSpeed = 0;
        this.mapGen = new MapGenerator();

        this.simulation = null;
        this.gameTools = null;
        this.animationManager = null;
        this.map = null;

        this.isPaused = false;
        this.simNeededBudget = false;
        this.currentTool = null;
        this.timer = null;
        this.infos = [];
        this.sprites = [];

        this.spritesData = null;
        this.animsData = null;
        //this.tilesData = null;

        this.spritesData  = [];

        this.power = null;

        CityGame.post({ tell:"READY" });

    }

    next ( delay = 0 ) {

        this.timer = setTimeout( update, delay );

    }

    stop (){

        if( this.timer === null ) return;
        clearInterval( this.timer );
        this.timer = null;

    }

    tick () {

        //if ( this.isPaused ) return

        let up = this.simulation.simTick();

        if( up ) { 

            this.infos = this.simulation.infos;

            this.processMessages( Game.simulation.messageManager.getMessages() );

            this.animatedTiles();

            this.simulation.spriteManager.moveObjects();
            this.calculateSprites();

            CityGame.post({ tell:"RUN", infos:this.infos, tilesData:this.map.tilesData, powerData:this.map.powerData, sprites:this.spritesData, layer:this.map.layer });

            this.map.resetLayer();

        }

        this.next();

    }

    newMap () {

        this.map = this.mapGen.construct( this.mapSize[0], this.mapSize[1] );
        CityGame.post({ tell:"NEWMAP", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, trans:trans });

    }

    playMap ( loading ) {

        var messageMgr = new MessageManager();
        var money = 20000;
        if(this.difficulty == 1) money = 10000;
        if(this.difficulty == 2) money = 5000;

        this.gameTools = {
            airport: new BuildingTool(10000, Tile.AIRPORT, this.map, 6, false),
            bulldozer: new BulldozerTool(this.map),
            coal: new BuildingTool(3000, Tile.POWERPLANT, this.map, 4, false),
            commercial: new BuildingTool(100, Tile.COMCLR, this.map, 3, false),
            fire: new BuildingTool(500, Tile.FIRESTATION, this.map, 3, false),
            industrial: new BuildingTool(100, Tile.INDCLR, this.map, 3, false),
            nuclear: new BuildingTool(5000, Tile.NUCLEAR, this.map, 4, true),
            park: new ParkTool(this.map),
            police: new BuildingTool(500, Tile.POLICESTATION, this.map, 3, false),
            port: new BuildingTool(3000, Tile.PORT, this.map, 4, false),
            rail: new RailTool(this.map),
            residential: new BuildingTool(100, Tile.FREEZ, this.map, 3, false),
            road: new RoadTool(this.map),
            query: new QueryTool(this.map),
            stadium: new BuildingTool(5000, Tile.STADIUM, this.map, 4, false),
            wire: new WireTool(this.map),
        };

        this.animationManager = new AnimationManager( this.map );

        if(loading){
            money = this.savedGame.totalFunds;
            //this.infos[3] = this.savedGame.totalPop;
            this.speed = this.savedGame.speed;
            this.difficulty = this.savedGame.difficulty;
            this.simulation = new Simulation( this.map, this.difficulty, this.speed, true, this.savedGame);
            //this.processMessages(Messages.EVAL_UPDATED);
            messageMgr.sendMessage(Messages.WELCOMEBACK);

        }else {
            this.simulation = new Simulation( this.map, this.difficulty, this.speed, true);
            messageMgr.sendMessage(Messages.WELCOME);

        }

        this.simulation.budget.setFunds(money);
        //messageMgr.sendMessage(Messages.FUNDS_CHANGED, money);
        this.processMessages( messageMgr.getMessages() );

        // update simulation time
        this.isPaused = false;
        //if(!trans) 
        //this.timer = setInterval(update, 1000/this.timestep);
        //this.timer = setInterval(update, 0);
        //else update();

        this.tick();

        //this.next()
    }

    

    /*changeTimeStep (n){

        clearInterval(this.timer);
        this.next()
        //this.timestep = n;
        //this.timer = setInterval(update, 1000/this.timestep)
        //this.timer = setInterval(update, 0);

    }*/

    changeSpeed (n){
        // 0:pause  1:slow  2:medium  3:fast
        this.speed = n;
        this.simulation.setSpeed(this.speed);

        if(this.speed === 0) { 
            this.isPaused = true;
            this.stop();
        } else {
            if( this.isPaused ){
                this.isPaused = false;
                this.stop();
                this.tick();
            }

        }

        

        /*if(this.speed === 4){
            
            this.simulation.setSpeed(this.speed-1);
        } else {
            
            this.simulation.setSpeed(this.speed);
        }*/
    }

    changeDifficulty(n){
        // 0: easy  1: medium  2: hard
        this.difficulty = n;
        if(this.simulation) this.simulation.setDifficulty ( this.difficulty );
    }

    animatedTiles () {

        var animTiles = this.animationManager.getTiles(0, 0, this.mapSize[0] + 1, this.mapSize[1] + 1, this.isPaused );
        var i = animTiles.length;
        this.animsData = new Micro.M_ARRAY_TYPE(i); 
        while(i--){
            var tile = animTiles[i];
            this.animsData[i] = [ tile.tileValue, tile.x, tile.y ];
        }
    }

    calculateSprites () {
        this.sprites = this.simulation.spriteManager.getSpritesInView(0, 0, this.mapSize[0] + 1, this.mapSize[1] + 1);
        var i = this.sprites.length;
        //this.spritesData = new M_ARRAY_TYPE(i);
        while(i--){
            var sprite = this.sprites[i];
            this.spritesData[i] = [sprite.type, sprite.frame, sprite.x || 0, sprite.y || 0];
        }
    }

    processMessages ( messages ) {

        var messageOutput = false;

        for (var i = 0, l = messages.length; i < l; i++) {
            var m = messages[i];
            switch (m.message) {
                case Messages.BUDGET_NEEDED: this.simNeededBudget = true; this.handleBudgetRequest(); break;
                case Messages.QUERY_WINDOW_NEEDED: CityGame.post({tell:"QUERY", queryTxt:this.currentTool.getInfo() }); break;
                //case Messages.DATE_UPDATED: this.infos[0] = [TXT.months[ m.data.month ], m.data.year].join(' '); break;
               // case Messages.EVAL_UPDATED: this.infos[1] = TXT.cityClass[m.data.classification]; this.infos[2] = m.data.score; this.infos[3] = m.data.population; break;
                //case Messages.FUNDS_CHANGED: this.infos[4] = m.data; break;
                //case Messages.VALVES_UPDATED: this.infos[5] = m.data.residential; this.infos[6] = m.data.commercial; this.infos[7] = m.data.industrial; break;
                default: 
                    if (!messageOutput && TXT.goodMessages[m.message] !== undefined) { 
                        this.infos[8] = TXT.goodMessages[m.message]; 
                        break;
                    }
                    if (!messageOutput && TXT.badMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.infos[8] = TXT.badMessages[m.message];
                        break;
                    }
                    if (!messageOutput && TXT.neutralMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.infos[8] = TXT.neutralMessages[m.message] ;
                        break;
                    }
            }
        }
    }

    tool (name){

        if(this.currentTool!==null) this.currentTool.clear();
        if(name !== "none") this.currentTool = this.gameTools[name];
        else this.currentTool = null;
        
    }

    destroy (x,y){

        console.log('isDestroy');

        //console.log( 'destuct ', x, y )

       //this.mapClick(x,y);
        //this.map.powerData[this.findId(x,y)] = 1;

       // this.simulation.powerManager.setTilePower(x,y);
      //  var messageMgr = new Micro.MessageManager();
       // this.gameTools["bulldozer"].doTool(x, y, messageMgr, this.simulation.blockMaps );
    }

    findId (x, y){
        var id = x+(y*this.mapSize[1]);
        return id;
    }

    mapClick (x,y, single){
        if( this.currentTool !== null ){
            //console.log(this.currentTool[0])
            var budget = this.simulation.budget;
            this.simulation.evaluation;
            var messageMgr = new MessageManager();
            this.currentTool.doTool(x, y, this.simulation.blockMaps, messageMgr );
            this.currentTool.modifyIfEnoughFunding(budget, messageMgr);

            switch (this.currentTool.result) {
                case this.currentTool.TOOLRESULT_NEEDS_BULLDOZE: TXT.toolMessages.needsDoze; break;
                case this.currentTool.TOOLRESULT_NO_MONEY: TXT.toolMessages.noMoney; break; 
                default: 
                    //if( id >= 11  && id != 15 ) this.needMapUpdate = true;
                    if(!single) CityGame.post({tell:"BUILD", x:x, y:y });  
                break;
            }
            
            this.processMessages(messageMgr.getMessages());
        }
    }

    setDisaster (disaster){
        if (disaster === Micro.DISASTER_NONE) return;
        var m = new MessageManager();
        switch (disaster) {
            case Micro.DISASTER_MONSTER: this.simulation.spriteManager.makeMonster(m); break;
            case Micro.DISASTER_FIRE: this.simulation.disasterManager.makeFire(m); break;
            case Micro.DISASTER_FLOOD: this.simulation.disasterManager.makeFlood(m); break;
            case Micro.DISASTER_CRASH: this.simulation.disasterManager.makeCrash(m); break;
            case Micro.DISASTER_MELTDOWN: this.simulation.disasterManager.makeMeltdown(m); break;
            case Micro.DISASTER_TORNADO: this.simulation.spriteManager.makeTornado(m); break;
        }
        this.processMessages(m.getMessages());
    }

    setBudget (budgetData){
        this.simulation.budget.cityTax = budgetData[0];
        this.simulation.budget.roadPercent = budgetData[1]/100;
        this.simulation.budget.firePercent = budgetData[2]/100;
        this.simulation.budget.policePercent = budgetData[3]/100;
    }

    handleBudgetRequest () {

        this.budgetShowing = true;

        let budgetData = {
            roadFund: this.simulation.budget.roadFund,
            roadRate: Math.floor(this.simulation.budget.roadPercent * 100),
            fireFund: this.simulation.budget.fireFund,
            fireRate: Math.floor(this.simulation.budget.firePercent * 100),
            policeFund: this.simulation.budget.policeFund,
            policeRate: Math.floor(this.simulation.budget.policePercent * 100),
            taxRate: this.simulation.budget.cityTax,
            totalFunds: this.simulation.budget.totalFunds,
            taxesCollected: this.simulation.budget.taxFund
        };

        CityGame.post({ tell:"BUDGET", budgetData:budgetData});

        if (this.simNeededBudget) {
            this.simulation.budget.doBudgetWindow();
            this.simNeededBudget = false;
        } else {
            this.simulation.budget.updateFundEffects();
        }



        
        //this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
        // Let the input know we handled this request
        //this.inputStatus.budgetHandled();
    }

    getEvaluation (){
        let evaluation = this.simulation.evaluation;
        let problemes = "";
        for (var i = 0; i < 4; i++) {
            let problemNo = evaluation.getProblemNumber(i);
            let text = '';
            if (problemNo !== -1) text =TXT.problems[problemNo];
            problemes += text+"<br>";
        }

        let evalData = [ evaluation.cityYes, problemes];

        CityGame.post({ tell:"EVAL", evalData:evalData});

    }


    //______________________________________ SAVE


    saveGame (cityData){
        //this.oldSpeed = this.speed;
        //this.changeSpeed(0);

        let gameData = {name:"Yoooooo", everClicked: true};
        gameData.speed = this.speed;
        gameData.difficulty = this.difficulty;
        gameData.version = Micro.CURRENT_VERSION;
        gameData.city = cityData;
        this.simulation.save(gameData);

        gameData = JSON.stringify(gameData);
        
        CityGame.post({ tell:"SAVEGAME", gameData:gameData, key:Micro.KEY });

        //this.changeSpeed(this.oldSpeed);
    }
    /*makeSaveGame : function(gameData){
        gameData.version = Micro.CURRENT_VERSION;
        gameData = JSON.stringify(gameData);
    }*/

    //______________________________________ LOAD

    loadGame (atStart){
        var isStart = atStart || false;
        CityGame.post({ tell:"LOADGAME", key:Micro.KEY, isStart:isStart }); 
    }

    makeLoadGame( gameData, atStart ) {



        let isStart = atStart || false;
        clearInterval(this.timer);
        this.savedGame = JSON.parse(gameData);



        //this.simulation.load(this.savedGame);
        //this.map = this.simulation.map;
       // this.everClicked = savedGame.everClicked;
        //if (savedGame.version !== Micro.CURRENT_VERSION) this.transitionOldSave(savedGame);
        //savedGame.isSavedGame = true;
        /*if(this.map){
            this.map.load(this.savedGame);
        }else{*/
        this.map = new GameMap(Micro.MAP_WIDTH, Micro.MAP_HEIGHT);
        this.map.load(this.savedGame);
        //}
        
        //

        //this.playMap(true);
        //this.simulation.map = this.map;//return
        //
        //this.map = this.simulation.map;

        CityGame.post({ tell:"FULLREBUILD", tilesData:this.map.tilesData, mapSize:this.mapSize, island:this.map.isIsland, cityData:this.savedGame.city, isStart:isStart });
    }

    transitionOldSave  (savedGame) {
        switch (savedGame.version) {
            case 1: savedGame.everClicked = false;
            /* falls through */
            case 2:
                savedGame.pollutionMaxX = Math.floor(savedGame.width / 2);
                savedGame.pollutionMaxY = Math.floor(savedGame.height / 2);
                savedGame.cityCentreX = Math.floor(savedGame.width / 2);
                savedGame.cityCentreY = Math.floor(savedGame.height / 2);
            break;
            //default: throw new Error('Unknown save version!');
        }
    }

}

export { CityGame, MainGame };
