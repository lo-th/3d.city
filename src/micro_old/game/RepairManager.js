/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 
import { MiscUtils } from '../Micro.js';
import { Tiles, Tile } from '../Tile.js';

export class RepairManager {

    constructor ( map ) {

        this._map = map;
        this._actions = [];

    }

    addAction ( criterion, period, zoneSize ) {

        this._actions.push({ criterion: criterion, period: period, zoneSize: zoneSize });

    }

    repairZone ( x, y, zoneSize ) {

        let xx, yy, current, currentValue;
        let centre = this._map.getTileValue(x, y);
        let tileValue = centre - zoneSize - 2;

        for ( yy = -1; yy < zoneSize - 1; yy++) {
            for ( xx = -1; xx < zoneSize - 1; xx++) {
                tileValue++;

                current = this._map.getTile(x + xx, y + yy);
                if (current.isZone() || current.isAnimated()) continue;

                currentValue = current.getValue();
                if (currentValue < Tile.RUBBLE || currentValue >= Tile.ROADBASE)
                    this._map.setTile(x + xx, y + yy, tileValue, Tile.CONDBIT | Tile.BURNBIT);
            }
        }

    }

    checkTile ( x, y, cityTime ) {

        let i = this._actions.length, current, period, tile, tileValue, callable;

        while( i-- ){

            current = this._actions[i];
            period = current.period;
          
            if ((cityTime & period) !== 0) continue;

            tile = this._map.getTile(x, y);
            tileValue = tile.getValue();

            callable = MiscUtils.isCallable( current.criterion );
            if (callable && current.criterion.call(null, tile)) this.repairZone( x, y, current.zoneSize );
            else if (!callable && current.criterion === tileValue) this.repairZone( x, y, current.zoneSize );

        }

    }

}
