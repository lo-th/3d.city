/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */



export const Micro = {

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

}

export class EventEmitter {

    static emitEvent ( event, value ) {

        // ???
        Micro.messageManager.sendMessage( event, value );
        
    }

}
//var M_ARRAY_TYPE;
//if(!M_ARRAY_TYPE) { M_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array; }


export class MiscUtils {

    /**/

    //static makeConstantDescriptor = function(value) {
    static mcd (value) {
        return {configurable: false, enumerable: false, writeable: false, value: value};
    }

    static rotate10Arrays () {
        for (var i = 0; i < Micro.arrs.length; i++) {
            var name10 = Micro.arrs[i] + 'Hist10';
            //this[name10] = [0].concat(this[name10].slice(0, -1));
            this[name10].pop()
            this[name10].unshift(0)
        }
    }

    static rotate120Arrays () {
        for (var i = 0; i < Micro.arrs.length; i++) {
            var name120 = Micro.arrs[i] + 'Hist120';
            //this[name120] = [0].concat(this[name120].slice(0, -1));
            this[name120].pop()
            this[name120].unshift(0)
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