/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK = 0;
Micro.SMOOTH_ALL_THEN_CLAMP = 1;

Micro.smoothMap = function(src, dest, smoothStyle) {
    for (var x = 0, width = src.width; x < width; x++) {
        for (var y = 0, height = src.height; y < height; y++) {
            var edges = 0;
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
};

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

// Over time, the rate of growth of a neighbourhood should trend towards zero (stable)
Micro.neutraliseRateOfGrowthMap = function(blockMaps) {
    var rateOfGrowthMap = blockMaps.rateOfGrowthMap;
    for (var x = 0, width = rateOfGrowthMap.width; x < width; x++) {
        for (var y = 0, height = rateOfGrowthMap.height; y < height; y++) {
            var rate = rateOfGrowthMap.get(x, y);
            if (rate === 0) continue;
            if (rate > 0) rate--;
            else rate++;
            rate = Micro.clamp(rate, -200, 200);
            rateOfGrowthMap.set(x, y, rate);
        }
    }
};

Micro.decTrafficMap = function(blockMaps) {
    var trafficDensityMap = blockMaps.trafficDensityMap;
    for (var x = 0; x < trafficDensityMap.gameMapWidth; x += trafficDensityMap.blockSize) {
        for (var y = 0; y < trafficDensityMap.gameMapHeight; y += trafficDensityMap.blockSize) {
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

// Over time, traffic density should ease.
Micro.neutraliseTrafficMap = function(blockMaps) {
    var trafficDensityMap = blockMaps.trafficDensityMap;

    for (var x = 0, width = trafficDensityMap.width; x < width; x++) {
        for (var y = 0, height = trafficDensityMap.height; y < height; y++) {
            var trafficDensity = trafficDensityMap.get(x, y);
            if (trafficDensity === 0) continue;
            if (trafficDensity <= 24) trafficDensity = 0;
            else if (trafficDensity > 200) trafficDensity = trafficDensity - 34;
            else trafficDensity = trafficDensity - 24;
            trafficDensityMap.set(x, y, trafficDensity);
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
/*Micro.smoothDitherMap = function(srcMap, destMap) {
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
};*/

/*Micro.smoothTemp1ToTemp2 = function(blockMaps) {
    Micro.smoothDitherMap(blockMaps.tempMap1, blockMaps.tempMap2);
};

Micro.smoothTemp2ToTemp1 = function(blockMaps) {
    Micro.smoothDitherMap(blockMaps.tempMap2, blockMaps.tempMap1);
};*/

// Again, the original version of this function in the Micropolis code
// reads donDither, which is always zero. The dead code has been culled
/*Micro.smoothTerrain = function(blockMaps) {
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
};*/

Micro.pollutionTerrainLandValueScan = function(map, census, blockMaps) {
    var tempMap1 = blockMaps.tempMap1;
    var tempMap2 = blockMaps.tempMap2;
    var tempMap3 = blockMaps.tempMap3;
    // tempMap3 is a map of development density, smoothed into terrainMap.
    tempMap3.clear();

    var landValueMap = blockMaps.landValueMap;
    var terrainDensityMap = blockMaps.terrainDensityMap;
    var pollutionDensityMap = blockMaps.pollutionDensityMap;
    var crimeRateMap = blockMaps.crimeRateMap;
    var x, y, width, height;

    

    var totalLandValue = 0;
    var developedTileCount = 0;

    //for (x = 0; x < landValueMap.width; x++) {
    //    for (y = 0; y < landValueMap.height; y++) {
    for (x = 0, width = landValueMap.width; x < width; x++) {
        for (y = 0, height = landValueMap.height; y < height; y++) {
            var pollutionLevel = 0;
            var developed = false;
            var worldX = x * 2;
            var worldY = y * 2;

            for (var mapX = worldX; mapX <= worldX + 1; mapX++) {
                for (var mapY = worldY; mapY <= worldY + 1; mapY++) {
                    var tileValue = map.getTileValue(mapX, mapY);
                    //if (tileValue === Tile.DIRT) continue;
                    if (tileValue > Tile.DIRT) {
                        if (tileValue < Tile.RUBBLE) {
                            // Undeveloped land: record in tempMap3
                            var terrainValue = tempMap3.worldGet(mapX, mapY);
                            tempMap3.worldSet(mapX, mapY, terrainValue + 15);
                            //var value = tempMap3.get(x >> 1, y >> 1);
                            //tempMap3.set(x >> 1, y >> 1, value + 15);
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
                var landValue = 34 - Math.floor(Micro.getCityCentreDistance(map, worldX, worldY) / 2);
                landValue = landValue << 2;
                landValue += terrainDensityMap.get(x >> 1, y >> 1);
                landValue -= pollutionDensityMap.get(x, y);
                if (crimeRateMap.get(x, y) > 190) { landValue -= 20; }
                landValue = Micro.clamp(landValue, 1, 250);
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

    //Micro.smoothTemp1ToTemp2(blockMaps);
    //Micro.smoothTemp2ToTemp1(blockMaps);
    Micro.smoothMap(tempMap1, tempMap2, Micro.SMOOTH_ALL_THEN_CLAMP);
    Micro.smoothMap(tempMap2, tempMap1, Micro.SMOOTH_ALL_THEN_CLAMP);

    var maxPollution = 0;
    var pollutedTileCount = 0;
    var totalPollution = 0;

    //for (x = 0; x < pollutionDensityMap.gameMapWidth; x += pollutionDensityMap.blockSize) {
    //    for (y = 0; y < pollutionDensityMap.gameMapHeight; y += pollutionDensityMap.blockSize)  {
    for (x = 0, width = map.width; x < width; x += pollutionDensityMap.blockSize) {
        for (y = 0, height = map.height; y < height; y += pollutionDensityMap.blockSize)  {
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
    //Micro.smoothTerrain(blockMaps);
    Micro.smoothMap(tempMap3, terrainDensityMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
};

/*Micro.smoothStationMap = function(map) {
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
};*/


Micro.crimeScan = function(census, blockMaps) {
    var policeStationMap = blockMaps.policeStationMap;
    var policeStationEffectMap = blockMaps.policeStationEffectMap;
    var crimeRateMap = blockMaps.crimeRateMap;
    var landValueMap = blockMaps.landValueMap;
    var populationDensityMap = blockMaps.populationDensityMap;

    //Micro.smoothStationMap(policeStationMap);
    //Micro.smoothStationMap(policeStationMap);
    //Micro.smoothStationMap(policeStationMap);

    Micro.smoothMap(policeStationMap, policeStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
    Micro.smoothMap(policeStationEffectMap, policeStationMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
    Micro.smoothMap(policeStationMap, policeStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);


    var totalCrime = 0;
    var crimeZoneCount = 0;

    //for (var x = 0; x < crimeRateMap.gameMapWidth; x += crimeRateMap.blockSize) {
    //    for (var y = 0; y < crimeRateMap.gameMapHeight; y += crimeRateMap.blockSize) {
    for (var x = 0, width = crimeRateMap.mapWidth, blockSize = crimeRateMap.blockSize; x < width; x += blockSize) {
        for (var y = 0, height = crimeRateMap.mapHeight, b; y < height; y += blockSize) {

            var value = landValueMap.worldGet(x, y);
            if (value > 0) {
                crimeZoneCount += 1;
                value = 128 - value;
                value += populationDensityMap.worldGet(x, y);
                value = Math.min(value, 300);
                //value -= policeStationMap.worldGet(x, y);
                //value -= policeStationMap.worldGet( Math.floor(x*0.25),  Math.floor(y*0.25) );
                value -= policeStationMap.worldGet(x, y);
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

// Iterate over the map, and score each neighbourhood on its distance from the city centre. Scores are in the range
// -64 to 64. This affects the growth of commercial zones within that neighbourhood.
Micro.fillCityCentreDistScoreMap = function(map, blockMaps) {
    var cityCentreDistScoreMap = blockMaps.cityCentreDistScoreMap;

    for (var x = 0, width = cityCentreDistScoreMap.width; x < width; x++) {
        for (var y = 0, height = cityCentreDistScoreMap.height; y < height; y++) {
            // First, we compute the Manhattan distance of the top-left hand corner of the neighbourhood to the city centre
            // and half that value. This leaves us a value in the range 0 - 32
            var value = Math.floor(Micro.getCityCentreDistance(map, x * 8, y * 8) / 2);
            // Now, we scale up by a factor of 4. We're in the range 0 - 128
            value = value * 4;
            // And finally, subtract from 64, leaving us a score in the range -64 to 64
            value = 64 - value;
            cityCentreDistScoreMap.set(x, y, value);
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
    //tempMap1.clear();

    var Xtot = 0;
    var Ytot = 0;
    var zoneTotal = 0;

    //for (var x = 0; x < map.width; x++) {
    //    for (var y = 0; y < map.height; y++) {
    for (var x = 0, width = map.width; x < width; x++) {
        for (var y = 0, height = map.height; y < height; y++) {
            var tile = map.getTile(x, y);
            if (tile.isZone()) {
                var tileValue = tile.getValue();

                var population = Micro.getPopulationDensity(map, x, y, tileValue) * 8;
                population = Math.min(population, 254);

                tempMap1.worldSet(x, y, population);
                Xtot += x;
                Ytot += y;
                zoneTotal++;
            } else {
                tempMap1.worldSet(x, y, 0);
            }
        }
    }

    //Micro.smoothTemp1ToTemp2(blockMaps);
    //Micro.smoothTemp2ToTemp1(blockMaps);
    //Micro.smoothTemp1ToTemp2(blockMaps);

    Micro.smoothMap(tempMap1, tempMap2, Micro.SMOOTH_ALL_THEN_CLAMP);
    Micro.smoothMap(tempMap2, tempMap1, Micro.SMOOTH_ALL_THEN_CLAMP);
    Micro.smoothMap(tempMap1, tempMap2, Micro.SMOOTH_ALL_THEN_CLAMP);

    blockMaps.populationDensityMap.copyFrom(tempMap2, function(x) {return x * 2;});
    //Micro.fillCityCentreDistScoreMap(map, blockMaps);
    // Copy tempMap2 to populationDensityMap, multiplying by 2
    //blockMaps.populationDensityMap = new Micro.BlockMap(tempMap2, function(x) {return 2 * x;});
    //Micro.computeComRateMap(map, blockMaps);

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

    //Micro.smoothStationMap(fireStationMap);
    //Micro.smoothStationMap(fireStationMap);
    //Micro.smoothStationMap(fireStationMap);

    Micro.smoothMap(fireStationMap, fireStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
    Micro.smoothMap(fireStationEffectMap, fireStationMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);
    Micro.smoothMap(fireStationMap, fireStationEffectMap, Micro.SMOOTH_NEIGHBOURS_THEN_BLOCK);

    blockMaps.fireStationEffectMap = new Micro.BlockMap(fireStationMap);
};