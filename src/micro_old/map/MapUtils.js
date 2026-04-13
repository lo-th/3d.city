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

import { Micro } from '../Micro.js';
import { Tile } from '../Tile.js';

import { Residential } from '../zone/Residential.js';
import { Commercial } from '../zone/Commercial.js';
import { Industrial } from '../zone/Industrial.js';

import { math } from '../math/math.js';

export class MapUtils {

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

        let x = src.width, y, edges

        while( x-- ){
            y = src.height
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
            y = bm.height
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
            y = bm.height
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
            y = landValueMap.height
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
            y = bm.height
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
        let populationDensityMap = blockMaps.populationDensityMap;

        // We will sum all the coordinates that contain zones into xTot and yTot. They are used in our city centre heuristic.
        let Xtot = 0;
        let Ytot = 0;
        let zoneTotal = 0;

        tempMap1.clear();

        let x = map.width, y, tile, tileValue, population

        while( x-- ){
            y = map.height
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
        MapUtils.fillCityCentreDistScoreMap( map, blockMaps )

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