/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import { Micro } from '../Micro.js';
import { Tile, Tiles } from '../Tile.js';

export const Stadia =  {

    registerHandlers: function( mapScanner, repairManager ) {

        mapScanner.addAction( Tile.STADIUM, Stadia.emptyStadiumFound );
        mapScanner.addAction( Tile.FULLSTADIUM, Stadia.fullStadiumFound );
        repairManager.addAction( Tile.STADIUM, 15, 4 );

    },

    emptyStadiumFound: function( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.stadiumPop += 1;

        if (map.getTile(x, y).isPowered()) {
            // Occasionally start the big game
            if (((simData.cityTime + x + y) & 31) === 0) {
                map.putZone(x, y, Tile.FULLSTADIUM, 4);
                map.addTileFlags(x, y, Tile.POWERBIT);
                map.setTo(x + 1, y, new Tiles(Tile.FOOTBALLGAME1, Tile.ANIMBIT));
                map.setTo(x + 1, y + 1, new Tiles(Tile.FOOTBALLGAME2, Tile.ANIMBIT));
            }
        }
    },

    fullStadiumFound: function ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.stadiumPop += 1;
        let isPowered = map.getTile(x, y).isPowered();

        if (((simData.cityTime + x + y) & 7) === 0) {
            map.putZone(x, y, Tile.STADIUM, 4);
            if ( isPowered ) map.addTileFlags( x, y, Tile.POWERBIT );
        }

    }

}