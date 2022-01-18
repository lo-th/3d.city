/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.MiscTiles = function (SIM) {
    var sim = SIM;
    var xDelta = [-1,  0,  1,  0 ];
    var yDelta = [ 0, -1,  0,  1 ];

    var fireFound = function(map, x, y, simData) {
        sim.census.firePop += 1;

        if ((Random.getRandom16() & 3) !== 0) return;

        // Try to set neighbouring tiles on fire as well
        for (var i = 0; i < 4; i++) {
            if (Random.getChance(7)) {
                var xTem = x + xDelta[i];
                var yTem = y + yDelta[i];
                if (map.testBounds(xTem, yTem)) {
                    var tile = map.getTile(x, y);
                    if (!tile.isCombustible()) continue;
                    if (tile.isZone()) {
                        // Neighbour is a ione and burnable
                        Micro.fireZone(map, x, y, sim.blockMaps);
                        // Industrial zones etc really go boom
                        if (tile.getValue() > Tile.IZB) sim.spriteManager.makeExplosionAt(x, y);
                    }
                    map.setTo(Micro.randomFire());
                }
            }
        }

        // Compute likelyhood of fire running out of fuel
        var rate = 10; // Likelyhood of extinguishing (bigger means less chance)
        i = sim.blockMaps.fireStationEffectMap.worldGet(x, y);

        if (i > 100) rate = 1;
        else if (i > 20) rate = 2;
        else if (i > 0) rate = 3;

        // Decide whether to put out the fire.
        if (Random.getRandom(rate) === 0) map.setTo(x, y, Micro.randomRubble());
    };

    var radiationFound = function(map, x, y, simData) {
        if (Random.getChance(4095)) map.setTo(x, y, new Micro.Tile(Tile.DIRT));
    };

    var floodFound = function(map, x, y, simData) { 
        sim.disasterManager.doFlood(x, y, sim.blockMaps);
    };

    var explosionFound = function(map, x, y, simData) {
        var tileValue = map.getTileValue(x, y);
        map.setTo(x, y, Micro.randomRubble());
        return;
    };

    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Micro.isFire, fireFound, true);
            mapScanner.addAction(Tile.RADTILE, radiationFound, true);
            mapScanner.addAction(Micro.isFlood, floodFound, true);
            mapScanner.addAction(Micro.isManualExplosion, explosionFound, true);
        }
    };
};