/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Residential = function (SIM) {
    var sim = SIM;
    // Residential tiles have 'populations' of 16, 24, 32 or 40
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value
    var placeResidential = function(map, x, y, population, lpValue, zonePower) {
        var centreTile = ((lpValue * 4) + population) * 9 + Tile.RZB;
        Micro.putZone(map, x, y, centreTile, zonePower);
    };

    // Look for housing in the adjacent 8 tiles
    var getFreeZonePopulation = function(map, x, y, tileValue) {
        var count = 0;
        for (var xx = x - 1; xx <= x + 1; xx++) {
            for (var yy = y - 1; yy <= y + 1; yy++) {
                if (xx === x && yy === y) continue;
                tileValue = map.getTileValue(xx, yy);
                if (tileValue >= Tile.LHTHR && tileValue <= Tile.HHTHR) count += 1;
            }
        }
        return count;
    };

    var getZonePopulation = function(map, x, y, tileValue) {
        if (tileValue instanceof Micro.Tile) tileValue =  new Micro.Tile().getValue();
        if (tileValue === Tile.FREEZ) return getFreeZonePopulation(map, x, y, tileValue);
        var populationIndex = Math.floor((tileValue - Tile.RZB) / 9) % 4 + 1;
        return populationIndex * 8 + 16;
    };

    // Assess a tile for suitability for a house. Prefer tiles
    // near roads
    var evalLot = function(map, x, y) {
        var xDelta = [0, 1, 0, -1];
        var yDelta = [-1, 0, 1, 0];

        var tileValue = map.getTileValue(x, y);
        if (tileValue < Tile.RESBASE || tileValue > Tile.RESBASE + 8) return -1;

        var score = 1;
        for (var i = 0; i < 4; i++) {
            //tileValue = map.getTileValue(x + xDelta[i], y + yDelta[i]);
            var edgeX = x + xDelta[i];
            var edgeY = y + yDelta[i];
            if (edgeX < 0 || edgeX >= map.width || edgeY < 0 || edgeY >= map.height) continue;
            tileValue = map.getTileValue(edgeX, edgeY);
            if (tileValue !== Tile.DIRT && tileValue <= Tile.LASTROAD) score += 1;
        }
        return score;
    };

    var buildHouse = function(map, x, y, lpValue) {
        var best = 0;
        var bestScore = 0;

        //  Deliberately ordered so that the centre tile is at index 0
        var xDelta = [0, -1, 0, 1, -1, 1, -1, 0, 1];
        var yDelta = [0, -1, -1, -1, 0, 0, 1, 1, 1];

        for (var i = 0; i < 9; i++) {
            var xx = x + xDelta[i];
            var yy = y + yDelta[i];
            var score = evalLot(map, xx, yy);
            if (score > bestScore) {
                bestScore = score;
                best = i;
            } else if (score === bestScore && Random.getChance(7)) {
                // Ensures we don't always select the same position when we
                // have a choice
                best = i;
            }
        }
        if (best > 0 && map.testBounds(x + xDelta[best], y + yDelta[best])) 
            map.setTo(x + xDelta[best], y + yDelta[best], new Micro.Tile(Tile.HOUSE + Random.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT));
            //map.setTile(x + xDelta[best], y + yDelta[best], new Micro.Tile(Tile.HOUSE + Random.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT));
    };
//var growZone
    var growZone = function(map, x, y, blockMaps, population, lpValue, zonePower) {
        var pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
        // Cough! Too polluted noone wants to move here!
        if (pollution > 128) return;

        var tileValue = map.getTileValue(x, y);

        if (tileValue === Tile.FREEZ) {
            if (population < 8) {
                // Zone capacity not yet reached: build another house
                buildHouse(map, x, y, lpValue);
                Micro.incRateOfGrowth(blockMaps, x, y, 1);
                return;
            }
            if (blockMaps.populationDensityMap.worldGet(x, y) > 64) {
                // There is local demand for higher density housing
                placeResidential(map, x, y, 0, lpValue, zonePower);
                Micro.incRateOfGrowth(blockMaps, x, y, 8);
                return;
            }
        }

        if (population < 40) {
            // Zone population not yet maxed out
            placeResidential(map, x, y, Math.floor(population / 8) - 1, lpValue, zonePower);
            Micro.incRateOfGrowth(blockMaps, x, y, 8);
        }
    };

    var freeZone = [0, 3, 6, 1, 4, 7, 2, 5, 8];

    var degradeZone = function(map, x, y, blockMaps, population, lpValue, zonePower) {
        var xx, yy;
        if (population === 0) return;

        if (population > 16) {
            // Degrade to a lower density block
            placeResidential(map, x, y, Math.floor((population - 24) / 8), lpValue, zonePower);
            Micro.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        if (population === 16) {
            // Already at lowest density: degrade to 8 individual houses
            map.setTo(x, y, new Micro.Tile(Tile.FREEZ, Tile.BLBNCNBIT | Tile.ZONEBIT));

            for (yy = y - 1; yy <= y + 1; yy++) {
                for (xx = x - 1; xx <= x + 1; xx++) {
                    if (xx === x && yy === y) continue;
                    map.setTo(x, y, new Micro.Tile(Tile.LHTHR + lpValue + Random.getRandom(2), Tile.BLBNCNBIT));
                } 
            }
            Micro.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        // Already down to individual houses. Remove one
        var i = 0;
        Micro.incRateOfGrowth(blockMaps, x, y, -1);

        for (xx = x - 1; xx <= x + 1; xx++) {
            for (yy = y - 1; yy <= y + 1; yy++) {
                var currentValue = map.getTileValue(xx, yy);
                if (currentValue >= Tile.LHTHR && currentValue <= Tile.HHTHR) {
                    // We've found a house. Replace it with the normal free zone tile
                    map.setTo(xx, yy, new Micro.Tile(freeZone[i] + Tile.RESBASE, Tile.BLBNCNBIT));
                    return;
                } 
                i += 1;
            } 
        } 
    };

    // Returns a score for the zone in the range -3000 - 3000
    var evalResidential = function(blockMaps, x, y, traffic) {
        if (traffic === Micro.NO_ROAD_FOUND) return -3000;
        var landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
        if (landValue < 0)  landValue = 0;
        else landValue = Math.min(landValue * 32, 6000);
        return landValue - 3000;
    };


    var residentialFound = function(map, x, y, simData) {
        // If we choose to grow this zone, we will fill it with an index in the range 0-3 reflecting the land value and
        // pollution scores (higher is better). This is then used to select the variant to build
        var lpValue;
        // Notify the census
        sim.census.resZonePop += 1;
        // Also, notify the census of our population
        var tileValue = map.getTileValue(x, y);
        var population = getZonePopulation(map, x, y, tileValue);
        sim.census.resPop += population;
        var zonePower = map.getTile(x, y).isPowered();

        var trafficOK = Micro.ROUTE_FOUND;
        // Occasionally check to see if the zone is connected to the road network. The chance of this happening increases
        // as the zone's population increases. Note: we will never execute this conditional if the zone is empty, as zero
        // will never be be bigger than any of the values Random will generate
        if (population > Random.getRandom(35)) {
            // Is there a route from this zone to a commercial zone?
            trafficOK = sim.traffic.makeTraffic(x, y, sim.blockMaps, Micro.isCommercial);

            // If we're not connected to the road network, then going shopping will be a pain. Move out.
            if (trafficOK ===  Micro.NO_ROAD_FOUND) {
                lpValue = Micro.getLandPollutionValue(sim.blockMaps, x, y);
                degradeZone(map, x, y, sim.blockMaps, population, lpValue, zonePower);
                return;
            }
        }

        // Sometimes we will randomly choose to assess this block. However, always assess it if it's empty or contains only single houses.
        if (tileValue === Tile.FREEZ || Random.getChance(7)) {
            // First, score the individual zone. This is a value in the range -3000 to 3000
            // Then take into account global demand for housing.
            var locationScore = evalResidential(sim.blockMaps, x, y, trafficOK);
            var zoneScore = sim.valves.resValve + locationScore;
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
            //if (trafficOK && (zoneScore > -350) && ((zoneScore - 26380) > Random.getRandom16Signed())) {
            if (zoneScore > -350 && (zoneScore - 26380) > Random.getRandom16Signed()) {
                // If this zone is empty, and residential demand is strong, we might make a hospital
                //if (population === 0 && ((Random.getRandom16() & 3) === 0)) {
                if (population === 0 && Random.getChance(3)) {
                    makeHospital(map, x, y, simData, zonePower);
                    return;
                }
                // Get an index in the range 0-3 scoring the land desirability and pollution, and grow the zone to the next
                // population rank
                lpValue = Micro.getLandPollutionValue(sim.blockMaps, x, y);
                growZone(map, x, y, sim.blockMaps, population, lpValue, zonePower);
                return;
            }
            // Again, given the above, zoneScore + 26380 must lie in the range 20880 - 26030.
            // There is a 10.2% chance of getRandom16() always yielding a number > 27994 which would take this branch.
            // There is a 89.7% chance of the number being below 20880 thus never triggering this branch, which leaves a
            // 0.1% chance of this branch being conditional on zoneScore.
            if (zoneScore < 350 && ((zoneScore + 26380) < Random.getRandom16Signed())) {
                // Get an index in the range 0-3 scoring the land desirability and pollution, and degrade to the next
                // lower ranked zone
                lpValue = Micro.getLandPollutionValue(sim.blockMaps, x, y);
                degradeZone(map, x, y, sim.blockMaps, population, lpValue, zonePower);
            }
        }
    };

    var makeHospital = function(map, x, y, simData, zonePower) {
        // We only build a hospital if the population requires it
        if (sim.census.needHospital > 0) {
            Micro.putZone(map, x, y, Tile.HOSPITAL, zonePower);
            sim.census.needHospital = 0;
            return;
        } 
    };

    var hospitalFound = function(map, x, y, simData) {
        sim.census.hospitalPop += 1;
        // Degrade to an empty zone if a hospital is no longer sustainable
        if (sim.census.needHospital === -1) {
            if (Random.getRandom(20) === 0) //Micro.putZone(map, x, y, Tile.FREEZ);
                Micro.putZone(map, x, y, Tile.FREEZ, map.getTile(x, y).isPowered());
        }
    };

    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Micro.isResidentialZone, residentialFound);
            mapScanner.addAction(Micro.HOSPITAL, hospitalFound);
            repairManager.addAction(Tile.HOSPITAL, 15, 3);
        },
        getZonePopulation:getZonePopulation
    };
};