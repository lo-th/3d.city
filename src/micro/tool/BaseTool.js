/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { MiscUtils } from '../Micro.js';
import { Tile, Tiles, ZoneUtils } from '../Tile.js';
import { WorldEffects } from './WorldEffects.js';


export class BaseTool {

    constructor () {

        this.TOOLRESULT_OK = 0;
        this.TOOLRESULT_FAILED = 1;
        this.TOOLRESULT_NO_MONEY = 2;
        this.TOOLRESULT_NEEDS_BULLDOZE = 3;
        this.autoBulldoze = true;
        this.bulldozerCost = 1;

    }

    init ( cost, map, shouldAutoBulldoze, IsDraggable = false ) {

        //Object.defineProperty(this, 'toolCost', MiscUtils.mcd(cost));
        this.toolCost = cost;
        this.result = null;
        this.isDraggable = IsDraggable;
        this._shouldAutoBulldoze = shouldAutoBulldoze;
        this._map = map;
        this._worldEffects = new WorldEffects( map );
        this._applicationCost = 0;

    }

    clear () {

        this._applicationCost = 0;
        this._worldEffects.clear();

    }

    addCost ( cost ) {

        this._applicationCost += cost;

    }

    doAutoBulldoze ( x, y ) {

        //if ( !this._shouldAutoBulldoze ) return;
        let tile = this._worldEffects.getTile(x, y);
        if ( tile.isBulldozable() ) {
            tile = ZoneUtils.normalizeRoad( tile );
            if ((tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP) || (tile < Tile.HBRIDGE && tile !== Tile.DIRT)) {
              this.addCost(1);
              this._worldEffects.setTile(x, y, Tile.DIRT);
            }
        }

    }

    apply ( budget ) {

        this._worldEffects.apply();
        budget.spend(this._applicationCost);
        this.clear();

    }

    modifyIfEnoughFunding ( budget ) {

        if (this.result !== this.TOOLRESULT_OK) { this.clear(); return false; }
        if (budget.totalFunds < this._applicationCost) { this.result = this.TOOLRESULT_NO_MONEY; this.clear(); return false; }
        this.apply.call(this, budget);
        this.clear();
        return true;

    }

    setAutoBulldoze ( value ) {

        this.autoBulldoze = value;

    }

    getAutoBulldoze () {

        return this.autoBulldoze;

    }

}
