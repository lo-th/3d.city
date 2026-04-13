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

const verticalDeltaX = [0,  1,  0,  0,  0,  0,  1];
const verticalDeltaY = [-2, -2, -1,  0,  1,  2,  2];
const horizontalDeltaX = [-2,  2, -2, -1,  0,  1,  2];
const horizontalDeltaY = [ -1, -1,  0,  0,  0,  0,  0];

const openVertical = [ Tile.VBRDG0, Tile.VBRDG1, Tile.RIVER, Tile.BRWV, Tile.RIVER, Tile.VBRDG2, Tile.VBRDG3 ];
const closeVertical = [ Tile.VBRIDGE, Tile.RIVER, Tile.VBRIDGE, Tile.VBRIDGE, Tile.VBRIDGE, Tile.VBRIDGE, Tile.RIVER ];

const openHorizontal = [ Tile.HBRDG1, Tile.HBRDG3, Tile.HBRDG0, Tile.RIVER, Tile.BRWH, Tile.RIVER, Tile.HBRDG2 ];
const closeHorizontal = [ Tile.RIVER, Tile.RIVER, Tile.HBRIDGE, Tile.HBRIDGE, Tile.HBRIDGE, Tile.HBRIDGE, Tile.HBRIDGE ];
/*
const openVertical = [
    Tile.VBRDG0 | Tile.BULLBIT, Tile.VBRDG1 | Tile.BULLBIT,
    Tile.RIVER, Tile.BRWV | Tile.BULLBIT,
    Tile.RIVER, Tile.VBRDG2 | Tile.BULLBIT, Tile.VBRDG3 | Tile.BULLBIT
];
const closeVertical = [
    Tile.VBRIDGE | Tile.BULLBIT, Tile.RIVER, Tile.VBRIDGE | Tile.BULLBIT,
    Tile.VBRIDGE | Tile.BULLBIT, Tile.VBRIDGE | Tile.BULLBIT,
    Tile.VBRIDGE | Tile.BULLBIT, Tile.RIVER
];
const openHorizontal = [
    Tile.HBRDG1 | Tile.BULLBIT, Tile.HBRDG3 | Tile.BULLBIT,
    Tile.HBRDG0 | Tile.BULLBIT, Tile.RIVER, Tile.BRWH | Tile.BULLBIT,
    Tile.RIVER, Tile.HBRDG2 | Tile.BULLBIT
];
const closeHorizontal = [
    Tile.RIVER, Tile.RIVER, Tile.HBRIDGE | Tile.BULLBIT,
    Tile.HBRIDGE | Tile.BULLBIT, Tile.HBRIDGE | Tile.BULLBIT,
    Tile.HBRIDGE | Tile.BULLBIT, Tile.HBRIDGE | Tile.BULLBIT
];*/

const densityTable = [Tile.ROADBASE, Tile.LTRFBASE, Tile.HTRFBASE];

export const Road = {

    registerHandlers: function ( mapScanner, repairManager ) {

        mapScanner.addAction( ZoneUtils.isRoad, Road.roadFound );

    },

    openBridge: function ( map, origX, origY, xDelta, yDelta, oldTiles, newTiles ) {

        let i, x, y;

        for ( i = 0; i < 7; i++) {
            x = origX + xDelta[i];
            y = origY + yDelta[i];
            if (map.testBounds(x, y)) {
                if (map.getTileValue(x, y) === (oldTiles[i] & Tile.BIT_MASK)) map.setTileValue(x, y, newTiles[i]);
            }
        }
    },

    closeBridge: function ( map, origX, origY, xDelta, yDelta, oldTiles, newTiles ) {

        let i, x, y, tileValue;

        for ( i = 0; i < 7; i++) {
            x = origX + xDelta[i];
            y = origY + yDelta[i];
            if (map.testBounds(x, y)) {
                tileValue = map.getTileValue(x, y);
                if (tileValue === Tile.CHANNEL || (tileValue & 15) === (oldTiles[i] & 15)) map.setTileValue(x, y, newTiles[i]);
            }
        }
    },

    doBridge: function ( map, x, y, currentTile, simData ) {

        //console.log( 'make bridge !!' )

        if(!simData) simData = Micro.simData

        if (currentTile === Tile.BRWV) {
            // We have an open vertical bridge. Possibly close it.
            if (math.getChance(3) && simData.spriteManager.getBoatDistance(x, y) > 340)
                Road.closeBridge(map, x, y, verticalDeltaX, verticalDeltaY, openVertical, closeVertical);
            return true;
        }
        if (currentTile == Tile.BRWH) {
            // We have an open horizontal bridge. Possibly close it.
            if (math.getChance(3) && simData.spriteManager.getBoatDistance(x, y) > 340)
                Road.closeBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, openHorizontal, closeHorizontal);
            return true;
        }
        if (simData.spriteManager.getBoatDistance(x, y) < 300 || math.getChance(7)) {
            if (currentTile & 1) {
                if (x < map.width - 1) {
                    if (map.getTileValue(x + 1, y) === Tile.CHANNEL) {
                             // We have a closed vertical bridge. Open it.
                            Road.openBridge(map, x, y, verticalDeltaX, verticalDeltaY, closeVertical, openVertical);
                        return true;
                    }
                }
                return false;
            } else {
                if (y > 0) {
                    if (map.getTileValue(x, y - 1) === Tile.CHANNEL) {
                            // We have a closed horizontal bridge. Open it.
                            Road.openBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, closeHorizontal, openHorizontal);
                        return true;
                    }
                }
            }
        }
        return false;
    },

    roadFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.roadTotal += 1;
        let currentTile = map.getTile(x, y);
        let tileValue = currentTile.getValue();

        if (simData.budget.shouldDegradeRoad()) {
            if (math.getChance(511)) {
                //currentTile = map.getTile(x, y);

                // Don't degrade tiles with power lines
                if (!currentTile.isConductive()) {
                    if (simData.budget.roadEffect < (math.getRandom16() & 31)) {
                        //let mapValue = currentTile.getValue();

                        // Replace bridge tiles with water, otherwise rubble
                        if ((tileValue & 15) < 2 || (tileValue & 15) === 15) map.setTile(x, y, Tile.RIVER);
                        else map.setTo(x, y, ZoneUtils.randomRubble());
                        return;
                    }
                }
            }
        }

        // Bridges are not combustible
        if (!currentTile.isCombustible()) {
            // The comment in the original Micropolis code states bridges count for 4
            // However, with the increment above, it's actually 5. Bug?
            simData.census.roadTotal += 4;
            //if ( Road.doBridge(map, x, y, tileValue, simData)) return;
        }

        // Examine traffic density, and modify tile to represent last scanned traffic
        // density
        let density = 0;
        if (tileValue < Tile.LTRFBASE) {
            density = 0;
        } else if (tileValue < Tile.HTRFBASE) {
            density = 1;
        } else {
            // Heavy traffic counts as two tiles with regards to upkeep cost
            // Note, if this is heavy traffic on a bridge, and it wasn't handled above,
            // it actually counts for 7 road tiles
            simData.census.roadTotal += 1;
            density = 2;
        }

        // Force currentDensity in range 0-3 (trafficDensityMap values are capped at 240)
        let currentDensity = simData.blockMaps.trafficDensityMap.worldGet(x, y) >> 6;
        // Force currentDensity in range 0-3 (trafficDensityMap values are capped at 240)
        if (currentDensity > 1) currentDensity -= 1;
        if (currentDensity === density) return;

        let newValue = ((tileValue - Tile.ROADBASE) & 15) + densityTable[currentDensity];
        // Preserve all bits except animation
        let newFlags = currentTile.getFlags() & ~Tile.ANIMBIT;
        if (currentDensity > 0) newFlags |= Tile.ANIMBIT;

        map.setTo(x, y, new Tiles(newValue, newFlags));
        
    }
}
