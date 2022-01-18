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

const animated = [true, false, true, true, false, false, true, true];
const xDelta = [-1, 0, 1, 0, 0, 0, 0, 1];
const yDelta = [-1, 0, -1, -1, 0, 0, -1, -1];

export const Industrial = {

    registerHandlers: function(mapScanner, repairManager) {
        mapScanner.addAction( ZoneUtils.isIndustrialZone, Industrial.industrialFound );
    },

    // Industrial tiles have 'populations' from 1 to 4,
    // and value from 0 to 3. The tiles are laid out in
    // increasing order of land value, cycling through
    // each population value

    getZonePopulation: function( map, x, y, tileValue ) {

        if (tileValue === Tile.INDCLR) return 0;
        return Math.floor((tileValue - Tile.IZB) / 9) % 4 + 1;

    },

    placeIndustrial: function(map, x, y, populationCategory, valueCategory, zonePower) {
        var centreTile = ((valueCategory * 4) + populationCategory) * 9 + Tile.IZB;
        ZoneUtils.putZone(map, x, y, centreTile, zonePower);
    },

    growZone: function(map, x, y, blockMaps, population, valueCategory, zonePower) {
        // Switch to the next category of zone
        if (population < 4) {
            Industrial.placeIndustrial(map, x, y, population, valueCategory, zonePower);
            ZoneUtils.incRateOfGrowth(blockMaps, x, y, 8);
        }
    },

    degradeZone: function(map, x, y, blockMaps, populationCategory, valueCategory, zonePower) {
        // Note that we special case empty zones here, rather than having to check population value on every
        // call to placeIndustrial (which we anticipate will be called more often)
        if (populationCategory > 1) Industrial.placeIndustrial( map, x, y, populationCategory - 2, valueCategory, zonePower );
        else ZoneUtils.putZone(map, x, y, Tile.INDCLR, zonePower);

        ZoneUtils.incRateOfGrowth(blockMaps, x, y, -8);
    },



    // Takes a map and coordinates, the tile value of the centre of the zone, and a boolean indicating whether
    // the zone has power, and sets or unsets the animation bit in the appropriate part of the zone
    setAnimation: function(map, x, y, tileValue, isPowered) {

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
    },

    industrialFound: function(map, x, y, simData) {
        
        if(!simData) simData = Micro.simData

        simData.census.indZonePop += 1;

        // Calculate the population level for this tile, and add to census
        var tileValue = map.getTileValue(x, y);
        var population = Industrial.getZonePopulation( map, x, y, tileValue );
        simData.census.indPop += population;

        // Set animation bit if appropriate
        var zonePower = map.getTile(x, y).isPowered();
        if(!simData.is3D) Industrial.setAnimation( map, x, y, tileValue, zonePower );

        // Occasionally check to see if the zone is connected to the transport network (the chance of this happening
        // increases as the population increases). Growth naturally stalls if workers cannot reach the factories.
        // Note in particular, we will never take this branch if the zone is empty.
        var trafficOK = Micro.ROUTE_FOUND;
        if (population > math.getRandom(5)) {
            // Try to find a route from here to a residential zone
            trafficOK = simData.traffic.makeTraffic( x, y, simData.blockMaps, ZoneUtils.isResidential );

            // Trigger outward migration if not connected to road network (unless the zone is already empty)
            if (trafficOK === Micro.NO_ROAD_FOUND) {
                var newValue = math.getRandom16() & 1;
                Industrial.degradeZone(map, x, y, simData.blockMaps, population, newValue, zonePower);
                return;
            }
        }

        // Occasionally assess and perhaps modify the tile
        if (math.getChance(7)) {
        var zoneScore = simData.valves.indValve + (trafficOK === Micro.NO_ROAD_FOUND ? -1000 : 0);

        // Unpowered zones should of course be penalized
        if (!zonePower) zoneScore = -500;

        // The industrial demand valve has range -1500 to 1500, so taking into account the "no traffic" and
        // "no power" modifiers above, zoneScore must lie in the range -3000 - 1500

        // First: observe that if there are no roads we will never take this branch, as zoneScore will be <= -1000.
        // Given the comment above about ranges for zoneScore, zoneScore - 26380, will be in the range -26729 to -24880.
        // getRandom16() has a range of 65536 possible numbers, in the range -32768 to 32767.
        // Of those, 9.2% will always be below zoneScore and hence will always take this branch and trigger zone growth.
        // 87.9% of them are above -24880, so nearly 88% of the time, we will never take this branch.
        // Thus, there's approximately a 2.9% chance that the value will be in the range, and we *might* grow.
        // This has the nice effect of not preventing an individual unit from growing even if overall demand has collapsed
        // (the business itself might still be growing.
        if (zoneScore > -350 && (zoneScore - 26380) > math.getRandom16Signed()) {
            Industrial.growZone(map, x, y, simData.blockMaps, population, math.getRandom16() & 1, zonePower);
            return;
        }

        // Again, given the  above, zoneScore + 26380 must lie in the range 23380 - 27880.
        // There is a 7.4% chance of getRandom16() always yielding a number > 27880 which would take this branch.
        // There is a 85.6% chance of the number being below 23380 thus never triggering this branch, which leaves a
        // 9% chance of this branch being conditional on zoneScore.
        if (zoneScore < 350 && (zoneScore + 26380) < math.getRandom16Signed())
            Industrial.degradeZone(map, x, y, simData.blockMaps, population, math.getRandom16() & 1, zonePower);
        }

    }

}
