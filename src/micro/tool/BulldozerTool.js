/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseToolConnector } from './BaseToolConnector.js';
import { Micro } from '../Micro.js';
import { Tile, ZoneUtils } from '../Tile.js';
import { Messages } from '../Messages.js';

import { math } from '../math/math.js';

export class BulldozerTool extends BaseToolConnector {

    constructor( map ) {

        super()
        this.init(10, map, true);
        
    }


    putRubble( x, y, size ) {

        for (let xx = x; xx < x + size; xx++) {
            for (let yy = y; yy < y + size; yy++)  {
                if (this._map.testBounds(xx, yy)) {
                    let tile = this._worldEffects.getTile(xx, yy);
                    if (tile !== Tile.RADTILE && tile !== Tile.DIRT) {
                        if( Micro.haveMapAnimation ) this._worldEffects.setTile(xx, yy, Tile.TINYEXP + math.getRandom(2), Tile.ANIMBIT | Tile.BULLBIT );
                        else this._map.setTo( xx, yy, ZoneUtils.randomRubble() );
                    }
                }
            }
        }

    }

    layDoze( x, y ) {

        let tile = this._worldEffects.getTile(x, y);

        if (!tile.isBulldozable()) return this.TOOLRESULT_FAILED;

        tile = tile.getValue();
        tile = ZoneUtils.normalizeRoad(tile);

        switch (tile) {
            case Tile.HBRIDGE:
            case Tile.VBRIDGE:
            case Tile.BRWV:
            case Tile.BRWH:
            case Tile.HBRDG0:
            case Tile.HBRDG1:
            case Tile.HBRDG2:
            case Tile.HBRDG3:
            case Tile.VBRDG0:
            case Tile.VBRDG1:
            case Tile.VBRDG2:
            case Tile.VBRDG3:
            case Tile.HPOWER:
            case Tile.VPOWER:
            case Tile.HRAIL:
            case Tile.VRAIL:
                this._worldEffects.setTile(x, y, Tile.RIVER);
            break;

            default: this._worldEffects.setTile(x, y, Tile.DIRT); break;
        }

        this.addCost(1);
        return this.TOOLRESULT_OK;

    }

    doTool( x, y, blockMaps, messageManager ) {

        if (!this._map.testBounds(x, y)) this.result = this.TOOLRESULT_FAILED;

        let tile = this._worldEffects.getTile(x, y);
        let tileValue = tile.getValue();

        let zoneSize = 0;
        let deltaX;
        let deltaY;

        if (tile.isZone()) {
            zoneSize = ZoneUtils.checkZoneSize(tileValue);
            deltaX = 0;
            deltaY = 0;
        } else {
            let result = ZoneUtils.checkBigZone(tileValue);
            zoneSize = result.zoneSize;
            deltaX = result.deltaX;
            deltaY = result.deltaY;
        }

        //console.log( zoneSize, deltaX, deltaY )

        if (zoneSize > 0) {

            this.addCost(this.bulldozerCost);

            //this._map.powerData[ this._map.getId( x, y ) ] = 0;

            this._map.powered({ v:1, x:x, y:y })

            let dozeX = x;
            let dozeY = y;
            let centerX = x + deltaX;
            let centerY = y + deltaY;

            switch (zoneSize) {
                case 3:
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONHIGH);
                    this.putRubble(centerX - 1, centerY - 1, 3);
                break;
                case 4:
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONLOW);
                    this.putRubble(centerX - 1, centerY - 1, 4);
                break;
                case 6:
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONHIGH);
                    //messageManager.sendMessage(Messages.SOUND_EXPLOSIONLOW);
                    this.putRubble(centerX - 1, centerY - 1, 6);
                break;
            }

            this.result = this.TOOLRESULT_OK;
        }

        let toolResult;
        if (tileValue === Tile.RIVER || tileValue === Tile.REDGE || tileValue === Tile.CHANNEL) {
            toolResult = this.layDoze(x, y);
            if (tileValue !== this._worldEffects.getTileValue(x, y)) this.addCost(5);
        } else {
            toolResult = this.layDoze(x, y);
            this.checkZoneConnections(x, y);
        }

        this.result = toolResult;
    }
}