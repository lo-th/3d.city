/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Industrial = function (SIM) {
    var sim = SIM;
    // Industrial tiles have 'populations' from 1 to 4,
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value
    var getZonePopulation = function(map, x, y, tileValue) {
        if (tileValue instanceof Micro.Tile) tileValue =  new Micro.Tile().getValue();
        if (tileValue === Tile.INDCLR) return 0;
        return Math.floor((tileValue - Tile.IZB) / 9) % 4 + 1;
    };

    var placeIndustrial = function(map, x, y, population, lpValue, zonePower) {
        var centreTile = ((lpValue * 4) + population) * 9 + Tile.IZB;
        Micro.putZone(map, x, y, centreTile, zonePower);
    };

    var doMigrationIn = function(map, x, y, blockMaps, population, lpValue, zonePower) {
        if (population < 4) {
            placeIndustrial(map, x, y, population, lpValue, zonePower);
            Micro.incRateOfGrowth(blockMaps, x, y, 8);
        }
    };

    var doMigrationOut = function(map, x, y, blockMaps, population, lpValue, zonePower) {
        if (population > 1) {
            placeIndustrial(map, x, y, population - 2, lpValue, zonePower);
            Micro.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        if (population === 1) {
            Micro.putZone(map, x, y, Tile.INDCLR, zonePower);
            Micro.incRateOfGrowth(blockMaps, x, y, -8);
        }
    };

    var evalIndustrial = function(blockMaps, x, y, traffic) {
        if (traffic === Micro.NO_ROAD_FOUND) return -1000;
        return 0;
    };

    var animated = [true, false, true, true, false, false, true, true];
    var xDelta = [-1, 0, 1, 0, 0, 0, 0, 1];
    var yDelta = [-1, 0, -1, -1, 0, 0, -1, -1];

    var setSmoke = function(map, x, y, tileValue, isPowered) {
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
    }

    var industrialFound = function(map, x, y, simData) {
        sim.census.indZonePop += 1;
        var tileValue = map.getTileValue(x, y);
        var tilePop = getZonePopulation(map, x, y, tileValue);
        sim.census.indPop += tilePop;

        // Set animation bit if appropriate
        var zonePower = map.getTile(x, y).isPowered();
        setSmoke(map, x, y, tileValue, zonePower);

        var trafficOK = Micro.ROUTE_FOUND;
        if (tilePop > Random.getRandom(5)) {
            // Try driving from industrial to residential
            trafficOK = sim.traffic.makeTraffic(x, y, sim.blockMaps, Micro.isResidential);

            // Trigger outward migration if not connected to road network
            if (trafficOK ===  Micro.NO_ROAD_FOUND) {
                doMigrationOut(map, x, y, sim.blockMaps, tilePop, Random.getRandom16() & 1, zonePower);
                return;
            }
        }

        // Occasionally assess and perhaps modify the tile
        if (Random.getChance(7)) {
            var locationScore = evalIndustrial(sim.blockMaps, x, y, trafficOK);
            var zoneScore = sim.valves.indValve + locationScore;

            if (!zonePower) zoneScore = -500;
            if (trafficOK && (zoneScore > -350) && ((zoneScore - 26380) > Random.getRandom16Signed())) {
                doMigrationIn(map, x, y, sim.blockMaps, tilePop, Random.getRandom16() & 1, zonePower);
                return;
            }
            if (zoneScore < 350 && ((zoneScore + 26380) < Random.getRandom16Signed())) {
                doMigrationOut(map, x, y, sim.blockMaps, tilePop, Random.getRandom16() & 1, zonePower);
            }
        }
    };


    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Micro.isIndustrialZone, industrialFound);
        },
        getZonePopulation: getZonePopulation
    };
};