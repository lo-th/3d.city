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


    

export const Transport = {

    registerHandlers: function ( mapScanner, repairManager ) {

        mapScanner.addAction(ZoneUtils.isRail, Transport.railFound );
        mapScanner.addAction(Tile.PORT, Transport.portFound );
        mapScanner.addAction(Tile.AIRPORT, Transport.airportFound );

        repairManager.addAction(Tile.PORT, 15, 4);
        repairManager.addAction(Tile.AIRPORT, 7, 6);

    },

    railFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.railTotal += 1;
        simData.spriteManager.generateTrain(simData.census, x, y);

        if (simData.budget.shouldDegradeRoad()) {
            if (math.getChance(511)) {
                let currentTile = map.getTile(x, y);

                // Don't degrade tiles with power lines
                if (currentTile.isConductive()) return;

                if (simData.budget.roadEffect < (math.getRandom16() & 31)) {
                    let mapValue = currentTile.getValue();

                    // Replace bridge tiles with water, otherwise rubble
                    if ( mapValue < Tile.RAILBASE + 2 ) map.setTile( x, y, Tile.RIVER, 0 );
                    else map.setTo( x, y, ZoneUtils.randomRubble() );
                }
            }
        }
    },

    airportFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.airportPop += 1;

        let tile = map.getTile(x, y);
        if (tile.isPowered()) {
            if (map.getTileValue(x + 1, y - 1) === Tile.RADAR) map.setTile(x + 1, y - 1, Tile.RADAR0, Tile.CONDBIT | Tile.ANIMBIT | Tile.BURNBIT);
            if (math.getRandom(5) === 0) {
                simData.spriteManager.generatePlane(x, y);
                return;
            }
            if (math.getRandom(12) === 0) simData.spriteManager.generateCopter(x, y);
        } else {
            map.setTile(x + 1, y - 1, Tile.RADAR, Tile.CONDBIT | Tile.BURNBIT);
        }
    },

    portFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData
            
        simData.census.seaportPop += 1;
        let tile = map.getTile(x, y);
        if (tile.isPowered() && simData.spriteManager.getSprite( Micro.SPRITE_SHIP ) === null) simData.spriteManager.generateShip();

    }
}
