/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Micro } from '../Micro.js';
import { Tiles, Tile, ZoneUtils } from '../Tile.js';
import { math } from '../math/math.js';

const freeZone = [0, 3, 6, 1, 4, 7, 2, 5, 8];

export const Residential = {

    registerHandlers: function ( mapScanner, repairManager ) {
        mapScanner.addAction(ZoneUtils.isResidentialZone, Residential.residentialFound);
        mapScanner.addAction(ZoneUtils.HOSPITAL, Residential.hospitalFound);
        repairManager.addAction(Tile.HOSPITAL, 15, 3);
    },

    // Residential tiles have 'populations' of 16, 24, 32 or 40
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value
    placeResidential: function ( map, x, y, population, lpValue, zonePower ) {

        let centreTile = ((lpValue * 4) + population) * 9 + Tile.RZB;
        ZoneUtils.putZone( map, x, y, centreTile, zonePower );

    },

    // Look for housing in the adjacent 8 tiles
    getFreeZonePopulation: function( map, x, y, tileValue ) {

        let count = 0, xx, yy;
        for ( xx = x - 1; xx <= x + 1; xx++) {
            for ( yy = y - 1; yy <= y + 1; yy++) {
                if (xx === x && yy === y) continue;
                tileValue = map.getTileValue(xx, yy);
                if (tileValue >= Tile.LHTHR && tileValue <= Tile.HHTHR) count += 1;
            }
        }
        return count;
    },

    getZonePopulation: function ( map, x, y, tileValue ) {
        //if ( tileValue.isTile ) tileValue =  new Tiles().getValue();
        if ( tileValue === Tile.FREEZ) return Residential.getFreeZonePopulation(map, x, y, tileValue);
        let populationIndex = Math.floor((tileValue - Tile.RZB) / 9) % 4 + 1;
        return populationIndex * 8 + 16;
    },

    // Assess a tile for suitability for a house. Prefer tiles near roads
    evalLot: function( map, x, y ) {

        let xDelta = [0, 1, 0, -1];
        let yDelta = [-1, 0, 1, 0];

        if (!map.testBounds(x, y)) return -1;

        let tileValue = map.getTileValue(x, y);
        if (tileValue < Tile.RESBASE || tileValue > Tile.RESBASE + 8) return -1;

        let score = 1, i, edgeX, edgeY;
        for ( i = 0; i < 4; i++) {

            edgeX = x + xDelta[i];
            edgeY = y + yDelta[i];
            if (edgeX < 0 || edgeX >= map.width || edgeY < 0 || edgeY >= map.height) continue;
            tileValue = map.getTileValue(edgeX, edgeY);
            if (tileValue !== Tile.DIRT && tileValue <= Tile.LASTROAD) score += 1;
        }
        return score;

    },

    buildHouse: function ( map, x, y, lpValue ) {

        let best = 0;
        let bestScore = 0;

        //  Deliberately ordered so that the centre tile is at index 0
        let xDelta = [0, -1, 0, 1, -1, 1, -1, 0, 1];
        let yDelta = [0, -1, -1, -1, 0, 0, 1, 1, 1];

        let i, xx, yy, score;

        for ( i = 0; i < 9; i++) {
            xx = x + xDelta[i];
            yy = y + yDelta[i];
            score = Residential.evalLot(map, xx, yy);
            if (score > bestScore) {
                bestScore = score;
                best = i;
            } else if (score === bestScore && math.getChance(7)) {
                // Ensures we don't always select the same position when we
                // have a choice
                best = i;
            }
        }
        if (best > 0 && map.testBounds(x + xDelta[best], y + yDelta[best])) 
            map.setTile(x + xDelta[best], y + yDelta[best], Tile.HOUSE + math.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT);
            //map.setTo(x + xDelta[best], y + yDelta[best], new Tiles(Tile.HOUSE + math.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT));
            //map.setTile(x + xDelta[best], y + yDelta[best], new Tiles(Tile.HOUSE + math.getRandom(2) + lpValue * 3, Tile.BLBNCNBIT));
    },

    growZone: function ( map, x, y, blockMaps, population, lpValue, zonePower ) {

        let pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
        // Cough! Too polluted noone wants to move here!
        if (pollution > 128) return;

        let tileValue = map.getTileValue(x, y);

        if (tileValue === Tile.FREEZ) {
            if (population < 8) {
                // Zone capacity not yet reached: build another house
                Residential.buildHouse(map, x, y, lpValue);
                ZoneUtils.incRateOfGrowth(blockMaps, x, y, 1);
            }
            else if (blockMaps.populationDensityMap.worldGet(x, y) > 64) {
                // There is local demand for higher density housing
                Residential.placeResidential(map, x, y, 0, lpValue, zonePower);
                ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
                
            }

            return;
        }

        if (population < 40) {
            // Zone population not yet maxed out
            Residential.placeResidential(map, x, y, Math.floor(population / 8) - 1, lpValue, zonePower);
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
        }
    },

    degradeZone: function ( map, x, y, blockMaps, population, lpValue, zonePower ) {
        let xx, yy;
        if (population === 0) return;

        if (population > 16) {
            // Degrade to a lower density block
            Residential.placeResidential(map, x, y, Math.floor((population - 24) / 8), lpValue, zonePower);
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        if (population === 16) {
            // Already at lowest density: degrade to 8 individual houses
            map.setTo(x, y, new Tiles(Tile.FREEZ, Tile.BLBNCNBIT | Tile.ZONEBIT));

            for (yy = y - 1; yy <= y + 1; yy++) {
                for (xx = x - 1; xx <= x + 1; xx++) {
                    if (xx === x && yy === y) continue;
                    map.setTile(x, y, Tile.LHTHR + lpValue + math.getRandom(2), Tile.BLBNCNBIT);
                    //map.setTo(x, y, new Tiles(Tile.LHTHR + lpValue + math.getRandom(2), Tile.BLBNCNBIT));
                } 
            }
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
            return;
        }

        // Already down to individual houses. Remove one
        let i = 0;
        ZoneUtils.incRateOfGrowth(blockMaps, x, y, -1);

        for (xx = x - 1; xx <= x + 1; xx++) {
            for (yy = y - 1; yy <= y + 1; yy++) {
                let currentValue = map.getTileValue(xx, yy);
                if (currentValue >= Tile.LHTHR && currentValue <= Tile.HHTHR) {
                    // We've found a house. Replace it with the normal free zone tile
                    map.setTile(xx, yy, freeZone[i] + Tile.RESBASE, Tile.BLBNCNBIT);
                    //map.setTo(xx, yy, new Tiles(freeZone[i] + Tile.RESBASE, Tile.BLBNCNBIT));
                    return;
                } 
                i += 1;
            } 
        } 
    },

    // Returns a score for the zone in the range -3000 - 3000
    evalResidential: function ( blockMaps, x, y, traffic ) {

        if (traffic === Micro.NO_ROAD_FOUND) return -3000;
        let landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
        if (landValue < 0)  landValue = 0;
        else landValue = Math.min(landValue * 32, 6000);
        return landValue - 3000;

    },

    residentialFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData
        // If we choose to grow this zone, we will fill it with an index in the range 0-3 reflecting the land value and
        // pollution scores (higher is better). This is then used to select the variant to build
        let lpValue;
        // Notify the census
        simData.census.resZonePop += 1;

        // Also, notify the census of our population
        let tileValue = map.getTileValue(x, y);
        let population = Residential.getZonePopulation(map, x, y, tileValue);
        simData.census.resPop += population;

        let zonePower = map.getTile(x, y).isPowered();

        let trafficOK = Micro.ROUTE_FOUND;

        // Occasionally check to see if the zone is connected to the road network. The chance of this happening increases
        // as the zone's population increases. Note: we will never execute this conditional if the zone is empty, as zero
        // will never be be bigger than any of the values Random will generate
        if (population > math.getRandom(35)) {
            // Is there a route from this zone to a commercial zone?
            trafficOK = simData.traffic.makeTraffic(x, y, simData.blockMaps, ZoneUtils.isCommercial);

            // If we're not connected to the road network, then going shopping will be a pain. Move out.
            if (trafficOK ===  Micro.NO_ROAD_FOUND) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Residential.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }
        }

        // Sometimes we will randomly choose to assess this block. However, always assess it if it's empty or contains only single houses.
        if (tileValue === Tile.FREEZ || math.getChance(7)) {
            // First, score the individual zone. This is a value in the range -3000 to 3000
            // Then take into account global demand for housing.
            let locationScore = Residential.evalResidential(simData.blockMaps, x, y, trafficOK);
            let zoneScore = simData.valves.resValve + locationScore;

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
            //if (trafficOK && (zoneScore > -350) && ((zoneScore - 26380) > math.getRandom16Signed())) {
            if (zoneScore > -350 && (zoneScore - 26380) > math.getRandom16Signed()) {
                // If this zone is empty, and residential demand is strong, we might make a hospital
                //if (population === 0 && ((math.getRandom16() & 3) === 0)) {
                if (population === 0 && math.getChance(3)) {
                    Residential.makeHospital(map, x, y, simData, zonePower);
                    return;
                }
                // Get an index in the range 0-3 scoring the land desirability and pollution, and grow the zone to the next
                // population rank
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Residential.growZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }
            // Again, given the above, zoneScore + 26380 must lie in the range 20880 - 26030.
            // There is a 10.2% chance of getRandom16() always yielding a number > 27994 which would take this branch.
            // There is a 89.7% chance of the number being below 20880 thus never triggering this branch, which leaves a
            // 0.1% chance of this branch being conditional on zoneScore.
            if (zoneScore < 350 && ((zoneScore + 26380) < math.getRandom16Signed())) {
                // Get an index in the range 0-3 scoring the land desirability and pollution, and degrade to the next
                // lower ranked zone
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Residential.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
            }
        }
    },

    makeHospital: function ( map, x, y, simData, zonePower ) {
        if(!simData) simData = Micro.simData
        // We only build a hospital if the population requires it
        if (simData.census.needHospital > 0) {
            ZoneUtils.putZone(map, x, y, Tile.HOSPITAL, zonePower);
            simData.census.needHospital = 0;
            return;
        } 
    },

    hospitalFound: function ( map, x, y, simData ) {
        if(!simData) simData = Micro.simData
            
        simData.census.hospitalPop += 1;
        // Degrade to an empty zone if a hospital is no longer sustainable
        if (simData.census.needHospital === -1) {
            if (math.getRandom(20) === 0) ZoneUtils.putZone(map, x, y, Tile.FREEZ, map.getTile(x, y).isPowered());
        }
    }

}
