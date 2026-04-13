/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 
import { BaseTool } from './BaseTool.js';
import { Tile, ZoneUtils, RoadTable, RailTable, WireTable } from '../Tile.js';

export class BaseToolConnector extends BaseTool {

    constructor () {

        super()

    }

    fixSingle ( x, y ) {

        let adjTile = 0;
        let tile = this._worldEffects.getTile(x, y);

        tile = ZoneUtils.normalizeRoad(tile);

        if (tile >= Tile.ROADS && tile <= Tile.INTERSECTION) {
            if (y > 0) {
                tile = this._worldEffects.getTile(x, y - 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.HRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.HROADPOWER && tile !== Tile.VRAILROAD && tile !== Tile.ROADBASE) adjTile |= 1;
            }
            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTile(x + 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.VRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.VROADPOWER && tile !== Tile.HRAILROAD && tile !== Tile.VBRIDGE) adjTile |= 2;
            }
            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTile(x, y + 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.HRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.HROADPOWER && tile !== Tile.VRAILROAD && tile !== Tile.ROADBASE) adjTile |= 4;
            }
            if (x > 0) {
                tile = this._worldEffects.getTile(x - 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if ((tile === Tile.VRAILROAD || (tile >= Tile.ROADBASE && tile <= Tile.VROADPOWER)) && tile !== Tile.VROADPOWER && tile !== Tile.HRAILROAD && tile !== Tile.VBRIDGE) adjTile |= 8;
            }

            this._worldEffects.setTile(x, y, RoadTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
            return;
        }

        if (tile >= Tile.LHRAIL && tile <= Tile.LVRAIL10) {
            if (y > 0) {
                tile = this._worldEffects.getTile(x, y - 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILHPOWERV && tile !== Tile.HRAILROAD && tile !== Tile.HRAIL) adjTile |= 1;
            }

            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTile(x + 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILVPOWERH && tile !== Tile.VRAILROAD && tile !== Tile.VRAIL) adjTile |= 2;
            }

            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTile(x, y + 1);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILHPOWERV && tile !== Tile.HRAILROAD && tile !== Tile.HRAIL) adjTile |= 4;
            }

            if (x > 0) {
                tile = this._worldEffects.getTile(x - 1, y);
                tile = ZoneUtils.normalizeRoad(tile);
                if (tile >= Tile.RAILHPOWERV && tile <= Tile.VRAILROAD && tile !== Tile.RAILVPOWERH && tile !== Tile.VRAILROAD && tile !== Tile.VRAIL) adjTile |= 8;
            }
            this._worldEffects.setTile(x, y, RailTable[adjTile] | Tile.BULLBIT | Tile.BURNBIT);
            return;
        }

        if (tile >= Tile.LHPOWER && tile <= Tile.LVPOWER10) {
            if (y > 0) {
                tile = this._worldEffects.getTile(x, y - 1);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.VPOWER && tile !== Tile.VROADPOWER && tile !== Tile.RAILVPOWERH) adjTile |= 1;
                }
            }
            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTile(x + 1, y);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.HPOWER && tile !== Tile.HROADPOWER && tile !== Tile.RAILHPOWERV) adjTile |= 2;
                }
            }
            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTile(x, y + 1);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.VPOWER && tile !== Tile.VROADPOWER && tile !== Tile.RAILVPOWERH) adjTile |= 4;
                }
            }
            if (x > 0) {
                tile = this._worldEffects.getTile(x - 1, y);
                if (tile.isConductive()) {
                    tile = tile.getValue();
                    tile = ZoneUtils.normalizeRoad(tile);
                    if (tile !== Tile.HPOWER && tile !== Tile.HROADPOWER && tile !== Tile.RAILHPOWERV) adjTile |= 8;
                }
            }
            this._worldEffects.setTile(x, y, WireTable[adjTile] | Tile.BLBNCNBIT);
            return;
        }
    }

    checkZoneConnections ( x, y ) {

        this.fixSingle(x, y);
        if (y > 0) this.fixSingle(x, y - 1);
        if (x < this._map.width - 1) this.fixSingle(x + 1, y);
        if (y < this._map.height - 1) this.fixSingle(x, y + 1);
        if (x > 0) this.fixSingle(x - 1, y);

    }

    checkBorder ( x, y, size ) {

        // Adjust to top left tile
        x = x - 1;
        y = y - 1;
        let i;
        for (i = 0; i < size; i++) this.fixZone(x + i, y - 1);
        for (i = 0; i < size; i++) this.fixZone(x - 1, y + i);
        for (i = 0; i < size; i++) this.fixZone(x + i, y + size);
        for (i = 0; i < size; i++) this.fixZone(x + size, y + i);
            
    }

}
