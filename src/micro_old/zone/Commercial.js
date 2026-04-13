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


export const Commercial = {

    registerHandlers: function( mapScanner, repairManager ) {
        mapScanner.addAction(ZoneUtils.isCommercialZone, Commercial.commercialFound );
    },

    // Commercial tiles have 'populations' from 1 to 5,
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value
    getZonePopulation: function(map, x, y, tileValue) {
        //if (tileValue.isTile ) tileValue = new Tiles().getValue(); //COMCLEAR)
        if (tileValue === Tile.COMCLR) return 0;
        return Math.floor((tileValue - Tile.CZB) / 9) % 5 + 1;
        
    },

    // Takes a map and coordinates, a population category in the range 1-5, a value category in the range 0-3, and places
    // the appropriate industrial zone on the map
    placeCommercial: function ( map, x, y, population, lpValue, zonePower ) {
        var centreTile = ((lpValue * 5) + population) * 9 + Tile.CZB;
        ZoneUtils.putZone(map, x, y, centreTile, zonePower);
    },

    growZone: function ( map, x, y, blockMaps, population, lpValue, zonePower ) {
        // landValueMap contains values in the range 0-250, representing the desirability of the land.
        // Thus, after shifting, landValue will be in the range 0-7.
        var landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue = landValue >> 5;

        if (population > landValue) return;

        // This zone is desirable, and seemingly not to crowded. Switch to the next category of zone.
        if (population < 5) {
           Commercial.placeCommercial(map, x, y, population, lpValue, zonePower);
           ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
        }
    },

    degradeZone: function (map, x, y, blockMaps, populationCategory, lpCategory, zonePower) {
        // Note that we special case empty zones here, rather than having to check population value on every
        // call to placeIndustrial (which we anticipate will be called more often)
        if (populationCategory > 1) {
            Commercial.placeCommercial(map, x, y, populationCategory - 2, lpCategory, zonePower);
        } else {
           ZoneUtils.putZone(map, x, y, Tile.COMCLR, zonePower);
        }

        ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    },

    // Called by the map scanner when it finds the centre of an commercial zone
    commercialFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData
        // lpValue will be filled if we actually decide to trigger growth/decay. It will be an index of the land/pollution
        // value in the range 0-3
        var lpValue;

        // Notify the census
        simData.census.comZonePop += 1;

        // Calculate the population level for this tile, and add to census
        var tileValue = map.getTileValue(x, y);
        var population = Commercial.getZonePopulation(map, x, y, tileValue);
        simData.census.comPop += population;

        var zonePower = map.getTile(x, y).isPowered();

        // Occasionally check to see if the zone is connected to the transport network (the chance of this happening
        // increases as the population increases). Growth naturally stalls if consumers cannot reach the shops.
        // Note in particular, we will never take this branch if the zone is empty.
        var trafficOK = Micro.ROUTE_FOUND;
        if (population > math.getRandom(5)) {
            // Try to find a route from here to an industrial zone
            trafficOK = simData.traffic.makeTraffic(x, y, simData.blockMaps, ZoneUtils.isIndustrial);

            // Trigger outward migration if not connected to road network
            if (trafficOK === Micro.NO_ROAD_FOUND) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Commercial.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }
        }

        // Occasionally assess and perhaps modify the tile
        if (math.getChance(7)) {

            var locationScore = trafficOK === Micro.NO_ROAD_FOUND ? -3000 : simData.blockMaps.cityCentreDistScoreMap.worldGet(x, y);
            var zoneScore = simData.valves.comValve + locationScore;

            // Unpowered zones should of course be penalized
            if (!zonePower) zoneScore = -500;

            // The commercial demand valve has range -1500 to 1500, so taking into account the "no traffic" and
            // "no power" modifiers above, zoneScore must lie in the range -5064 - 1564. (The comRateMap, which scores
            // commercial neighbourhoods based on their distance from the city centre, has range -64 to 64).

            // First: observe that if there are no roads we will never take this branch, as zoneScore will be <= -3000.
            // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -24816.
            // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
            // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
            // 87.8% of them are above -24816, so nearly 88% of the time, we will never take this branch.
            // Thus, there's approximately a 3% chance that the value will be in the range, and we *might* grow.
            // This has the nice effect of not preventing an individual unit from growing even if overall demand has collapsed
            // (the business itself might still be growing.
            if (zonePower && zoneScore > -350 && (zoneScore - 26380) > math.getRandom16Signed()) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Commercial.growZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
                return;
            }

            // Again, given the  above, zoneScore + 26380 must lie in the range 21316 - 27944.
            // There is a 7.3% chance of getRandom16() always yielding a number > 27994 which would take this branch.
            // There is a 82.5% chance of the number being below 21316 thus never triggering this branch, which leaves a
            // 10.1% chance of this branch being conditional on zoneScore.
            if (zoneScore < 350 && (zoneScore + 26380) < math.getRandom16Signed()) {
                lpValue = ZoneUtils.getLandPollutionValue(simData.blockMaps, x, y);
                Commercial.degradeZone(map, x, y, simData.blockMaps, population, lpValue, zonePower);
            }
        }
    }
}