/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
*
* This code is released under the GNU GPL v3, with some additional terms.
* Please see the files LICENSE and COPYING for details. Alternatively,
* consult http://micropolisjs.graememcc.co.uk/LICENSE and
* http://micropolisjs.graememcc.co.uk/COPYING
*
*/

import {  Micro } from '../Micro.js';
import { Tiles, Tile, ZoneUtils } from '../Tile.js';
import { math } from '../math/math.js';

const xDelta = [-1,  0,  1,  0 ];
const yDelta = [ 0, -1,  0,  1 ];



export const MiscTiles = {

    registerHandlers: function( mapScanner, repairManager ) {
        mapScanner.addAction(ZoneUtils.isFire, MiscTiles.fireFound, true);
        mapScanner.addAction(Tile.RADTILE, MiscTiles.radiationFound, true);
        mapScanner.addAction(ZoneUtils.isFlood, MiscTiles.floodFound, true);
        //mapScanner.addAction(ZoneUtils.isManualExplosion, MiscTiles.explosionFound, true);
    },

    fireFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.firePop += 1;

        if ((math.getRandom16() & 3) !== 0) return;

        let i, xTem, yTem, tile

        // Try to set neighbouring tiles on fire as well
        for ( i = 0; i < 4; i++) {
            if (math.getChance(7)) {
                xTem = x + xDelta[i];
                yTem = y + yDelta[i];
                if (map.testBounds(xTem, yTem)) {
                    tile = map.getTile(x, y);
                    if (!tile.isCombustible()) continue;
                    if (tile.isZone()) {
                        // Neighbour is a ione and burnable
                        ZoneUtils.fireZone(map, x, y, simData.blockMaps);
                        // Industrial zones etc really go boom
                        if (tile.getValue() > Tile.IZB) simData.spriteManager.makeExplosionAt(x, y);
                    }
                    map.setTo( ZoneUtils.randomFire() );
                }
            }
        }

        // Compute likelyhood of fire running out of fuel
        let rate = 10; // Likelyhood of extinguishing (bigger means less chance)
        i = simData.blockMaps.fireStationEffectMap.worldGet(x, y);

        if (i > 100) rate = 1;
        else if (i > 20) rate = 2;
        else if (i > 0) rate = 3;

        // Decide whether to put out the fire.
        if ( math.getRandom(rate) === 0 ) map.setTo( x, y, ZoneUtils.randomRubble() );
    },

    radiationFound: function ( map, x, y, simData ) {
        if(!simData) simData = Micro.simData
        if (math.getChance(4095)) map.setTile( x, y, Tile.DIRT, 0 );
    },

    floodFound: function ( map, x, y, simData ) { 
        if(!simData) simData = Micro.simData
        simData.disasterManager.doFlood( x, y, simData.blockMaps );
    },

    /*explosionFound: function ( map, x, y, simData ) {
        if(!simData) simData = Micro.simData
        let tileValue = map.getTileValue(x, y);
        map.setTo(x, y, ZoneUtils.randomRubble());
        return;
    }*/
};
