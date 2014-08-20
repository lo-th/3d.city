
Micro.decRateOfGrowthMap = function(blockMaps) {
    var rateOfGrowthMap = blockMaps.rateOfGrowthMap;
    for (var x = 0; x < rateOfGrowthMap.width; x++) {
        for (var y = 0; y < rateOfGrowthMap.height; y++) {
            var rate = rateOfGrowthMap.get(x, y);
            if (rate === 0) continue;
            if (rate > 0) {
                rate--;
                rate = Micro.clamp(rate, -200, 200);
                rateOfGrowthMap.set(x, y, rate);
                continue;
            }
            if (rate < 0)  {
                rate++;
                rate = Micro.clamp(rate, -200, 200);
                rateOfGrowthMap.set(x, y, rate);
            }
        }
    }
};

Micro.decTrafficMap = function(blockMaps) {
    var trafficDensityMap = blockMaps.trafficDensityMap;
    for (var x = 0; x < trafficDensityMap.mapWidth; x += trafficDensityMap.blockSize) {
        for (var y = 0; y < trafficDensityMap.mapHeight; y += trafficDensityMap.blockSize) {
            var trafficDensity = trafficDensityMap.worldGet(x, y);
            if (trafficDensity === 0) continue;
            if (trafficDensity <= 24) {
                trafficDensityMap.worldSet(x, y, 0);
                continue;
            }
            if (trafficDensity > 200) trafficDensityMap.worldSet(x, y, trafficDensity - 34);
            else trafficDensityMap.worldSet(x, y, trafficDensity - 24);
        }
    }
};

Micro.getPollutionValue = function(tileValue) {
    if (tileValue < Tile.POWERBASE) {
        if (tileValue >= Tile.HTRFBASE) return 75;
        if (tileValue >= Tile.LTRFBASE) return 50;
        if (tileValue <  Tile.ROADBASE) {
            if (tileValue > Tile.FIREBASE) return 90;
            if (tileValue >= Tile.RADTILE) return 255;
        }
        return 0;
    }
    if (tileValue <= Tile.LASTIND) return 0;
    if (tileValue < Tile.PORTBASE) return 50;
    if (tileValue <= Tile.LASTPOWERPLANT) return 100;
    return 0;
};

Micro.getCityCentreDistance = function(map, x, y) {
    var xDis, yDis;
    if (x > map.cityCentreX) xDis = x - map.cityCentreX;
    else xDis = map.cityCentreX - x;
    if (y > map.cityCentreY) yDis = y - map.cityCentreY;
    else yDis = map.cityCentreY - y;
    return Math.min(xDis + yDis, 64);
};

// The original version of this function in the Micropolis code
// takes a ditherFlag. However, as far as I can tell, it was
// never called with a truthy value for the ditherFlag.
Micro.smoothDitherMap = function(srcMap, destMap) {
    for (var x = 0; x < srcMap.width; x++) {
        for (var y = 0; y < srcMap.height; y++) {
            var value = 0;
            if (x > 0) value += srcMap.get(x - 1, y);
            if (x < srcMap.width - 1) value += srcMap.get(x + 1, y);
            if (y > 0) value += srcMap.get(x, y - 1);
            if (y < (srcMap.height - 1)) value += srcMap.get(x, y + 1);
            value = (value + srcMap.get(x, y)) >> 2;
            if (value > 255) value = 255;
            destMap.set(x, y, value);
        }
    }
};

Micro.smoothTemp1ToTemp2 = function(blockMaps) {
    Micro.smoothDitherMap(blockMaps.tempMap1, blockMaps.tempMap2);
};

Micro.smoothTemp2ToTemp1 = function(blockMaps) {
    Micro.smoothDitherMap(blockMaps.tempMap2, blockMaps.tempMap1);
};

// Again, the original version of this function in the Micropolis code
// reads donDither, which is always zero. The dead code has been culled
Micro.smoothTerrain = function(blockMaps) {
    // Sets each tile to the average of itself and the average of the
    // 4 surrounding tiles
    var tempMap3 = blockMaps.tempMap3;
    var terrainDensityMap = blockMaps.terrainDensityMap;

    for (var x = 0; x < terrainDensityMap.width; x++) {
        for (var y = 0; y < terrainDensityMap.height; y++) {
            var value = 0;
            if (x > 0) value += tempMap3.get(x - 1, y);
            if (x < (terrainDensityMap.width - 1)) value += tempMap3.get(x + 1, y);
            if (y > 0) value += tempMap3.get(x, y - 1);
            if (y < (terrainDensityMap.height - 1)) value += tempMap3.get(x, y + 1);
            value = Math.floor(Math.floor(value / 4) + tempMap3.get(x, y) / 2);
            terrainDensityMap.set(x, y, value);
        }
    }
};

Micro.pollutionTerrainLandValueScan = function(map, census, blockMaps) {
    var tempMap1 = blockMaps.tempMap1;
    var tempMap3 = blockMaps.tempMap3;
    var landValueMap = blockMaps.landValueMap;
    var terrainDensityMap = blockMaps.terrainDensityMap;
    var pollutionDensityMap = blockMaps.pollutionDensityMap;
    var crimeRateMap = blockMaps.crimeRateMap;
    var x, y;

    // tempMap3 is a map of development density, smoothed into terrainMap.
    tempMap3.clear();

    var totalLandValue = 0;
    var numLandValueTiles = 0;

    for (x = 0; x < landValueMap.width; x++) {
        for (y = 0; y < landValueMap.height; y++) {
            var pollutionLevel = 0;
            var developed = false;
            var worldX = x * 2;
            var worldY = y * 2;

            for (var mapX = worldX; mapX <= worldX + 1; mapX++) {
                for (var mapY = worldY; mapY <= worldY + 1; mapY++) {
                    var tileValue = map.getTileValue(mapX, mapY);
                    if (tileValue > Tile.DIRT) {
                        if (tileValue < Tile.RUBBLE) {
                            // Undeveloped land: record in tempMap3
                            var value = tempMap3.get(x >> 1, y >> 1);
                            tempMap3.set(x >> 1, y >> 1, value + 15);
                            continue;
                        }
                        pollutionLevel += Micro.getPollutionValue(tileValue);
                        if (tileValue >= Tile.ROADBASE) {
                           developed = true;
                        }
                    }
                }
            }

            pollutionLevel = Math.min(pollutionLevel, 255);
            tempMap1.set(x, y, pollutionLevel);

            if (developed) {
                var dis = 34 - Math.floor(Micro.getCityCentreDistance(map, worldX, worldY) / 2);
                dis = dis << 2;
                dis += terrainDensityMap.get(x >> 1, y >> 1);
                dis -= pollutionDensityMap.get(x, y);
                if (crimeRateMap.get(x, y) > 190) { dis -= 20; }
                dis = Micro.clamp(dis, 1, 250);
                landValueMap.set(x, y, dis);
                totalLandValue += dis;
                numLandValueTiles++;
            } else {
                landValueMap.set(x, y, 0);
            }
        }
    }

    if (numLandValueTiles > 0) census.landValueAverage = Math.floor(totalLandValue / numLandValueTiles);
    else census.landValueAverage = 0;

    Micro.smoothTemp1ToTemp2(blockMaps);
    Micro.smoothTemp2ToTemp1(blockMaps);

    var maxPollution = 0;
    var pollutedTileCount = 0;
    var totalPollution = 0;

    for (x = 0; x < pollutionDensityMap.mapWidth; x += pollutionDensityMap.blockSize) {
        for (y = 0; y < pollutionDensityMap.mapHeight; y += pollutionDensityMap.blockSize)  {
            var pollution = tempMap1.worldGet(x, y);
            pollutionDensityMap.worldSet(x, y, pollution);

            if (pollution !== 0) {
                pollutedTileCount++;
                totalPollution += pollution;

                // note location of max pollution for monster
                if (pollution > maxPollution || (pollution === maxPollution && Random.getChance(3))) {
                    maxPollution = pollution;
                    map.pollutionMaxX = x;
                    map.pollutionMaxY = y;
                }
            }
        }
    }

    if (pollutedTileCount) census.pollutionAverage = Math.floor(totalPollution / pollutedTileCount);
    else census.pollutionAverage = 0;
    Micro.smoothTerrain(blockMaps);
};

Micro.smoothStationMap = function(map) {
    var tempMap = new Micro.BlockMap(map);
    var lw = tempMap.width;
    var lh = tempMap.height
    for (var x = 0; x < lw; x++) {
        for (var y = 0; y < lh; y++) {
            var edge = 0;
            if (x > 0) edge += tempMap.get(x - 1, y);
            //if (x < lw - 1) edge += tempMap.get(x + 1, y);
            if ((x+1) < lw ) edge += tempMap.get(x + 1, y);
            if (y > 0) edge += tempMap.get(x, y - 1);
            //if (y < lh - 1) edge += tempMap.get(x, y + 1);
            if ((y+1) < lh ) edge += tempMap.get(x, y + 1);
            //edge = tempMap.get(x, y) + Math.floor(edge / 4);
            //map.set(x, y, Math.floor(edge / 2));
            edge = tempMap.get(x, y) + Math.floor(edge * 0.25);
            map.set(x, y, Math.floor(edge * 0.5));
        }
    }
};

Micro.crimeScan = function(census, blockMaps) {
    var policeStationMap = blockMaps.policeStationMap;
    var policeStationEffectMap = blockMaps.policeStationEffectMap;
    var crimeRateMap = blockMaps.crimeRateMap;
    var landValueMap = blockMaps.landValueMap;
    var populationDensityMap = blockMaps.populationDensityMap;

    Micro.smoothStationMap(policeStationMap);
    Micro.smoothStationMap(policeStationMap);
    Micro.smoothStationMap(policeStationMap);

    var totalCrime = 0;
    var crimeZoneCount = 0;

    for (var x = 0; x < crimeRateMap.mapWidth; x += crimeRateMap.blockSize) {
        for (var y = 0; y < crimeRateMap.mapHeight; y += crimeRateMap.blockSize) {
            var value = landValueMap.worldGet(x, y);
            if (value > 0) {
                ++crimeZoneCount;
                value = 128 - value;
                value += populationDensityMap.worldGet(x, y);
                value = Math.min(value, 300);
                //value -= policeStationMap.worldGet(x, y);
                value -= policeStationMap.worldGet( Math.floor(x*0.25),  Math.floor(y*0.25) );
                //value -= policeStationEffectMap.worldGet(x, y)
                value = Micro.clamp(value, 0, 250);
                crimeRateMap.worldSet(x, y, value);
                totalCrime += value;
            } else {
                crimeRateMap.worldSet(x, y, 0);
            }
        }
    }
    if (crimeZoneCount > 0) census.crimeAverage = Math.floor(totalCrime / crimeZoneCount);
    else census.crimeAverage = 0;
    blockMaps.policeStationEffectMap = new Micro.BlockMap(policeStationMap);
};

Micro.computeComRateMap = function(map, blockMaps) {
    var comRateMap = blockMaps.comRateMap;
    for (var x = 0; x < comRateMap.width; x++) {
        for (var y = 0; y < comRateMap.height; y++) {
            var value = Math.floor(Micro.getCityCentreDistance(map, x * 8, y * 8) / 2);
            value = value * 4;
            value = 64 - value;
            comRateMap.set(x, y, value);
        }
    }
};

Micro.getPopulationDensity = function(map, x, y, tile) {
    if (tile < Tile.COMBASE) return Residential.getZonePopulation(map, x, y, tile);
    if (tile < Tile.INDBASE) return Commercial.getZonePopulation(map, x, y, tile) * 8;
    if (tile < Tile.PORTBASE) return Industrial.getZonePopulation(map, x, y, tile) * 8;
    return 0;
};

Micro.populationDensityScan = function(map, blockMaps) {
    var tempMap1 = blockMaps.tempMap1;
    var tempMap2 = blockMaps.tempMap2;
    var populationDensityMap = blockMaps.populationDensityMap;
    tempMap1.clear();

    var Xtot = 0;
    var Ytot = 0;
    var zoneTotal = 0;

    for (var x = 0; x < map.width; x++) {
        for (var y = 0; y < map.height; y++) {
            var tile = map.getTile(x, y);
            if (tile.isZone()) {
                var tileValue = tile.getValue();

                var population = Micro.getPopulationDensity(map, x, y, tileValue) * 8;
                population = Math.min(population, 254);

                tempMap1.worldSet(x, y, population);
                Xtot += x;
                Ytot += y;
                zoneTotal++;
            }
        }
    }

    Micro.smoothTemp1ToTemp2(blockMaps);
    Micro.smoothTemp2ToTemp1(blockMaps);
    Micro.smoothTemp1ToTemp2(blockMaps);

    // Copy tempMap2 to populationDensityMap, multiplying by 2
    blockMaps.populationDensityMap = new Micro.BlockMap(tempMap2, function(x) {return 2 * x;});
    Micro.computeComRateMap(map, blockMaps);

    // Compute new city center
    if (zoneTotal > 0) {
        map.cityCentreX = Math.floor(Xtot / zoneTotal);
        map.cityCentreY = Math.floor(Ytot / zoneTotal);
    } else {
        map.cityCentreX = Math.floor(map.width * 0.5);
        map.cityCentreY = Math.floor(map.height * 0.5);
    }
};

Micro.fireAnalysis = function(blockMaps) {
    var fireStationMap = blockMaps.fireStationMap;
    var fireStationEffectMap = blockMaps.fireStationEffectMap;

    Micro.smoothStationMap(fireStationMap);
    Micro.smoothStationMap(fireStationMap);
    Micro.smoothStationMap(fireStationMap);

    blockMaps.fireStationEffectMap = new Micro.BlockMap(fireStationMap);
};