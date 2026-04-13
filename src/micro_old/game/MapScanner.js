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

import { Micro, MiscUtils } from '../Micro.js';
import { Tiles, Tile } from '../Tile.js';

export class MapScanner {

    constructor ( map ) {

        this._map = map;
        this._actions = [];

    }

    addAction ( criterion, action ) {

        this._actions.push({ criterion: criterion, action: action });

    }

    mapScan ( startX, maxX, simData ) {

        if(!simData) simData = Micro.simData

        let y = this._map.height, x, i, id, tile, tileValue, current, callable;
        
        while( y-- ){

            for ( x = startX; x < maxX; x++ ) {
                
                id = this._map.getId( x, y ); //x + y * this.mapWidth; 
                tile = this._map.data[id] || new Tiles();
                tileValue = tile.getValue();

                if ( tileValue < Tile.FLOOD ) continue;

                if ( tile.isConductive() ) simData.powerManager.setTilePower(x, y);

                if ( tile.isZone() ) {
                    simData.repairManager.checkTile( x, y, simData.cityTime );
                    if ( tile.isPowered() ){ simData.census.poweredZoneCount += 1; this._map.powered({ v:1, id:id })/*this._map.powerData[id] = 1;*/ }
                    else { simData.census.unpoweredZoneCount += 1; this._map.powered({ v:2, id:id })/*this._map.powerData[id] = 2;*/ }
                }

                i = this._actions.length;
                while(i--){

                    current = this._actions[i];
                    callable = MiscUtils.isCallable(current.criterion);

                    if (callable && current.criterion.call(null, tile)) {
                        current.action.call(null, this._map, x, y, simData);
                        break;
                    } else if (!callable && current.criterion === tileValue) {
                        current.action.call(null, this._map, x, y, simData);
                        break;
                    }
                }
            }
        }
    }

}
