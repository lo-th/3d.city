/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseTool } from './BaseTool.js';
import { Tile } from '../Tile.js';
import { math } from '../math/math.js';

export class ParkTool extends BaseTool {

    constructor ( map ) {

        super()
        this.init( 10, map, true );

    }

    doTool ( x, y, blockMaps ) {

        if (this._worldEffects.getTileValue(x, y) !== Tile.DIRT) {
            this.result = this.TOOLRESULT_NEEDS_BULLDOZE;
            return;
        }
        let value = math.getRandom(4);
        let tileFlags = Tile.BURNBIT | Tile.BULLBIT;
        let tileValue;

        if (value === 4) {
            tileValue = Tile.FOUNTAIN;
            tileFlags |= Tile.ANIMBIT;
        } else {
            tileValue = value + Tile.WOODS2;
        }

        this._worldEffects.setTile(x, y, tileValue, tileFlags);
        this.addCost(10);
        this.result = this.TOOLRESULT_OK;

    }
}