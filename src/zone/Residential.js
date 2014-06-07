
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
            tileValue = map.getTileValue(x + xDelta[i], y + yDelta[i]);
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
        if (best > 0) map.setTo(x + xDelta[best], y + yDelta[best], new Micro.Tile(Tile.HOUSE + Random.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT)); 
    };

    var doMigrationIn = function(map, x, y, blockMaps, population, lpValue, zonePower) {
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

    var doMigrationOut = function(map, x, y, blockMaps, population, lpValue, zonePower) {
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

    var evalResidential = function(blockMaps, x, y, traffic) {
        if (traffic === Micro.NO_ROAD_FOUND) return -3000;
        var landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
        if (landValue < 0)  landValue = 0;
        else landValue = Math.min(landValue * 32, 6000);
        return landValue - 3000;
    };


    var residentialFound = function(map, x, y, simData) {
        var lpValue;

        sim.census.resZonePop += 1;
        var tileValue = map.getTileValue(x, y);
        var tilePop = getZonePopulation(map, x, y, tileValue);
        sim.census.resPop += tilePop;
        var zonePower = map.getTile(x, y).isPowered();

        var trafficOK = Micro.ROUTE_FOUND;
        if (tilePop > Random.getRandom(35)) {
            // Try driving from residential to commercial
            trafficOK = sim.traffic.makeTraffic(x, y, sim.blockMaps, Micro.isCommercial);

            // Trigger outward migration if not connected to road network
            if (trafficOK ===  Micro.NO_ROAD_FOUND) {
                lpValue = Micro.getLandPollutionValue(sim.blockMaps, x, y);
                doMigrationOut(map, x, y, sim.blockMaps, tilePop, lpValue, zonePower);
                return;
            }
        }

        // Occasionally assess and perhaps modify the tile (or always in the
        // case of an empty zone)
        if (tileValue === Tile.FREEZ || Random.getChance(7)) {
            var locationScore = evalResidential(sim.blockMaps, x, y, trafficOK);
            var zoneScore = sim.valves.resValve + locationScore;

            if (!zonePower) zoneScore = -500;

            if (trafficOK && (zoneScore > -350) && ((zoneScore - 26380) > Random.getRandom16Signed())) {
                // If we have a reasonable population and this zone is empty, make a
                // hospital
                if (tilePop === 0 && ((Random.getRandom16() & 3) === 0)) {
                    makeHospital(map, x, y, simData, zonePower);
                    return;
                }

                lpValue = Micro.getLandPollutionValue(sim.blockMaps, x, y);
                doMigrationIn(map, x, y, sim.blockMaps, tilePop, lpValue, zonePower);
                return;
            }

            if (zoneScore < 350 && ((zoneScore + 26380) < Random.getRandom16Signed())) {
                lpValue = Micro.getLandPollutionValue(sim.blockMaps, x, y);
                doMigrationOut(map, x, y, sim.blockMaps, tilePop, lpValue, zonePower);
            }
        }
    };

    var makeHospital = function(map, x, y, simData, zonePower) {
        if (sim.census.needHospital > 0) {
            Micro.putZone(map, x, y, Tile.HOSPITAL, zonePower);
            sim.census.needHospital = 0;
            return;
        } 
    };

    var hospitalFound = function(map, x, y, simData) {
        sim.census.hospitalPop += 1;
        if (sim.census.needHospital === -1) {
            if (Random.getRandom(20) === 0) Micro.putZone(map, x, y, Tile.FREEZ);
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