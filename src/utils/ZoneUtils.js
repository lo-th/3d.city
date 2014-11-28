/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.checkBigZone = function(tileValue) {
    var result;

    switch (tileValue) {

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
};

Micro.checkZoneSize = function(tileValue) {
    if ((tileValue >= Tile.RESBASE - 1        && tileValue <= Tile.PORTBASE - 1) ||
        (tileValue >= Tile.LASTPOWERPLANT + 1 && tileValue <= Tile.POLICESTATION + 4) ||
        (tileValue >= Tile.CHURCH1BASE && tileValue <= Tile.CHURCH7LAST)) {
        return 3;
    }

    if ((tileValue >= Tile.PORTBASE    && tileValue <= Tile.LASTPORT) ||
        (tileValue >= Tile.COALBASE    && tileValue <= Tile.LASTPOWERPLANT) ||
        (tileValue >= Tile.STADIUMBASE && tileValue <= Tile.LASTZONE)) {
        return 4;
    }
    return 0;
};

Micro.fireZone = function(map, x, y, blockMaps) {
    var tileValue = map.getTileValue(x, y);
    var zoneSize = 2;

    // A zone being on fire naturally hurts growth
    var value = blockMaps.rateOfGrowthMap.worldGet(x, y);
    value = Micro.clamp(value - 20, -200, 200);
    blockMaps.rateOfGrowthMap.worldSet(x, y, value);

    if (tileValue === Tile.AIRPORT) zoneSize = 5;
    else if (tileValue >= Tile.PORTBASE) zoneSize = 3;
    else if (tileValue < Tile.PORTBASE) zoneSize = 2;

    // Make remaining tiles of the zone bulldozable
    for (var xDelta = -1; xDelta < zoneSize; xDelta++) {
        for (var yDelta = -1; yDelta < zoneSize; yDelta++) {
            var xTem = x + xDelta;
            var yTem = y + yDelta;
            if (!map.testBounds(xTem, yTem)) continue;
            if (map.getTileValue(xTem, yTem >= Tile.ROADBASE)) map.addTileFlags(xTem, yTem, Tile.BULLBIT);
        }
    }
};

Micro.getLandPollutionValue = function(blockMaps, x, y) {
    var landValue = blockMaps.landValueMap.worldGet(x, y);
    landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
    if (landValue < 30) return 0;
    if (landValue < 80) return 1;
    if (landValue < 150) return 2;
    return 3;
};

Micro.incRateOfGrowth = function(blockMaps, x, y, growthDelta) {
    var currentRate = blockMaps.rateOfGrowthMap.worldGet(x, y);
    // TODO why the scale of 4 here
    var newValue = Micro.clamp(currentRate + growthDelta * 4, -200, 200);
    blockMaps.rateOfGrowthMap.worldSet(x, y, newValue);
};

// Calls map.putZone after first checking for flood, fire
// and radiation
Micro.putZone = function(map, x, y, centreTile, isPowered) {
    for (var dY = 0; dY < 3; dY++) {
        for (var dX = 0; dX < 3; dX++) {
            var tileValue = map.getTileValue(x + dX, y + dY);
            if (tileValue >= Tile.FLOOD && tileValue < Tile.ROADBASE) return;
        }
    }
    map.putZone(x, y, centreTile, 3);
    map.addTileFlags(x, y, Tile.BULLBIT);
    if (isPowered) map.addTileFlags(x, y, Tile.POWERBIT);
};