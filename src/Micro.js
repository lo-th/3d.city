/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
var Micro = {};
//Game
/*Micro.nextFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    null;*/
//Simulation
Micro.speedPowerScan = [2, 4, 5];
Micro.speedPollutionTerrainLandValueScan = [2, 7, 17];
Micro.speedCrimeScan = [1, 8, 18];
Micro.speedPopulationDensityScan = [1, 9, 19];
Micro.speedFireAnalysis = [1, 10, 20];
Micro.CENSUS_FREQUENCY_10 = 4;
Micro.CENSUS_FREQUENCY_120 = Micro.CENSUS_FREQUENCY_10 * 10;
Micro.TAX_FREQUENCY = 48;
//MapCanvas
Micro.MAP_WIDTH = 128;//128;//120;
Micro.MAP_HEIGHT = 128;//128;//100;
Micro.MAP_DEFAULT_WIDTH = Micro.MAP_WIDTH*3;
Micro.MAP_DEFAULT_HEIGHT = Micro.MAP_HEIGHT*3;
Micro.MAP_BIG_DEFAULT_WIDTH = Micro.MAP_WIDTH*16;
Micro.MAP_BIG_DEFAULT_HEIGHT = Micro.MAP_HEIGHT*16;
Micro.MAP_BIG_DEFAULT_ID = "bigMap";
Micro.MAP_PARENT_ID = "splashContainer";
Micro.MAP_DEFAULT_ID = "SplashCanvas";

//GameCanvas
Micro.DEFAULT_WIDTH = 400;
Micro.DEFAULT_HEIGHT = 400;
Micro.DEFAULT_ID = "MicropolisCanvas";

Micro.RCI_DEFAULT_ID = "RCICanvas";

//Census
Micro.arrs = ['res', 'com', 'ind', 'crime', 'money', 'pollution'];

var M_ARRAY_TYPE;
if(!M_ARRAY_TYPE) { M_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array; }

/*Micro.MouseBox = {

    draw: function( c, pos, width, height, options ) {
        var lineWidth = options.lineWidth || 3.0;
        var strokeStyle = options.colour || 'yellow';
        var shouldOutline = (('outline' in options) && options.outline === true) || false;

        var startModifier = -1;
        var endModifier = 1;
        if (!shouldOutline) {
            startModifier = 1;
            endModifier = -1;
        }

        var startX = pos.x + startModifier * lineWidth * 0.5;
        width = width + endModifier * lineWidth;
        var startY = pos.y + startModifier * lineWidth * 0.5;
        height = height + endModifier * lineWidth;
 
        var ctx = c.getContext('2d');
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.strokeRect(startX, startY, width, height); 
    }
}*/

// MiscUtils,
Micro.clamp = function(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

Micro.makeConstantDescriptor = function(value) {
    return {configurable: false, enumerable: false, writeable: false, value: value};
}

Micro.rotate10Arrays = function() {
    for (var i = 0; i < Micro.arrs.length; i++) {
        var name10 = Micro.arrs[i] + 'Hist10';
        //this[name10] = [0].concat(this[name10].slice(0, -1));
        this[name10].pop();
        this[name10].unshift(0);
    }
}

Micro.rotate120Arrays = function() {
    for (var i = 0; i < Micro.arrs.length; i++) {
        var name120 = Micro.arrs[i] + 'Hist120';
        //this[name120] = [0].concat(this[name120].slice(0, -1));
        this[name120].pop();
        this[name120].unshift(0)  
    }
}

Micro.isCallable = function( f ) {
    return typeof(f) === 'function';
};

// Simulation
Micro.LEVEL_EASY = 0;
Micro.LEVEL_MED = 1;
Micro.LEVEL_HARD = 2;

Micro.SPEED_PAUSED = 0;
Micro.SPEED_SLOW = 1;
Micro.SPEED_MED = 2;
Micro.SPEED_FAST = 3;

// Traffic
Micro.ROUTE_FOUND = 1;
Micro.NO_ROUTE_FOUND = 0;
Micro.NO_ROAD_FOUND = -1;
Micro.MAX_TRAFFIC_DISTANCE = 30;
Micro.perimX = [-1, 0, 1, 2, 2, 2, 1, 0,-1,-2,-2,-2];
Micro.perimY = [-2,-2,-2,-1, 0, 1, 2, 2, 2, 1, 0,-1];

//SpriteConstants
Micro.SPRITE_TRAIN = 1;
Micro.SPRITE_HELICOPTER = 2;
Micro.SPRITE_AIRPLANE = 3;
Micro.SPRITE_SHIP = 4;
Micro.SPRITE_MONSTER = 5;
Micro.SPRITE_TORNADO = 6;
Micro.SPRITE_EXPLOSION = 7;

// Evaluation
Micro.CC_VILLAGE = 'VILLAGE';
Micro.CC_TOWN = 'TOWN';
Micro.CC_CITY = 'CITY';
Micro.CC_CAPITAL = 'CAPITAL';
Micro.CC_METROPOLIS = 'METROPOLIS';
Micro.CC_MEGALOPOLIS = 'MEGALOPOLIS';
Micro.CRIME = 0;
Micro.POLLUTION = 1
Micro.HOUSING = 2;
Micro.TAXES = 3;
Micro.TRAFFIC = 4;
Micro.UNEMPLOYMENT = 5;
Micro.FIRE = 6;
// Valves
Micro.RES_VALVE_RANGE = 2000;
Micro.COM_VALVE_RANGE = 1500;
Micro.IND_VALVE_RANGE = 1500;
Micro.taxTable = [ 200, 150, 120, 100, 80, 50, 30, 0, -10, -40, -100, -150, -200, -250, -300, -350, -400, -450, -500, -550, -600];
Micro.extMarketParamTable = [1.2, 1.1, 0.98];
// Budget
Micro.RLevels = [0.7, 0.9, 1.2];
Micro.FLevels = [1.4, 1.2, 0.8];
Micro.MAX_ROAD_EFFECT = 32;
Micro.MAX_POLICESTATION_EFFECT = 1000;
Micro.MAX_FIRESTATION_EFFECT = 1000;
// PowerManager
Micro.COAL_POWER_STRENGTH = 700;
Micro.NUCLEAR_POWER_STRENGTH = 2000;

//DisasterWindow
Micro.DISASTER_NONE='None';
Micro.DISASTER_MONSTER='Monster';
Micro.DISASTER_FIRE='Fire';
Micro.DISASTER_FLOOD='Flood';
Micro.DISASTER_CRASH='Crash';
Micro.DISASTER_MELTDOWN='Meltdown';
Micro.DISASTER_TORNADO='Tornado';

// storage
Micro.CURRENT_VERSION = 3;
Micro.KEY = 'micropolisJSGame';
///Micro.canStore = window.localStorage;

//Micro.localStorage = null;