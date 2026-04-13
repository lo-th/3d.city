/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseToolConnector } from './BaseToolConnector.js';
import { Tile, ZoneUtils } from '../Tile.js';

export class BuildingTool extends BaseToolConnector {

    constructor ( cost, centreTile, map, size, animated ) {

        super()
        this.init( cost, map, false );
        this.centreTile = centreTile;
        this.size = size;
        this.animated = animated;

    }

    putBuilding ( leftX, topY ) {
        let posX, posY, tileValue, tileFlags;
        let baseTile = this.centreTile - this.size - 1;

        for (let dy = 0; dy < this.size; dy++) {
            posY = topY + dy;

            for ( let dx = 0; dx < this.size; dx++ ) {
                posX = leftX + dx;
                tileValue = baseTile;
                tileFlags = Tile.BNCNBIT;

                if (dx === 1) {
                    if (dy === 1) tileFlags |= Tile.ZONEBIT;
                    else if (dy === 2 && this.animated) tileFlags |= Tile.ANIMBIT;
                }
                this._worldEffects.setTile(posX, posY, tileValue, tileFlags);
                baseTile++;
            }
        }
    }

    prepareBuildingSite ( leftX, topY ) {
        // Check that the entire site is on the map
        if (leftX < 0 || leftX + this.size > this._map.width) return this.TOOLRESULT_FAILED;
        if (topY < 0 || topY + this.size > this._map.height) return this.TOOLRESULT_FAILED;

        let posX, posY, tileValue;

        // Check whether the tiles are clear
        for (let dy = 0; dy < this.size; dy++) {
            posY = topY + dy;
            for (let dx = 0; dx < this.size; dx++) {
                posX = leftX + dx;
                tileValue = this._worldEffects.getTileValue(posX, posY);

                if (tileValue === Tile.DIRT) continue;
                if (!this.autoBulldoze) {
                    // No Tile.DIRT and no bull-dozer => not buildable
                    return this.TOOLRESULT_NEEDS_BULLDOZE;
                }

                if (!ZoneUtils.canBulldoze(tileValue)) {
                    // tilevalue cannot be auto-bulldozed
                    return this.TOOLRESULT_NEEDS_BULLDOZE;
                }
            this._worldEffects.setTile(posX, posY, Tile.DIRT);
            this.addCost(this.bulldozerCost);
            }
        }
        return this.TOOLRESULT_OK;
    }

    buildBuilding ( x, y ) {
        // Correct to top left
        x--;
        y--;

        let prepareResult = this.prepareBuildingSite(x, y);
        if (prepareResult !== this.TOOLRESULT_OK) return prepareResult;

        this.addCost(this.toolCost);
        this.putBuilding(x, y);
        this.checkBorder(x, y);

        return this.TOOLRESULT_OK;
    }

    doTool ( x, y, blockMaps ) {
        this.result = this.buildBuilding(x, y);
    }

}