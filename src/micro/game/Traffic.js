/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Micro, MiscUtils } from '../Micro.js';
import { Tiles, Tile, ZoneUtils } from '../Tile.js';

import { Direction } from '../math/Direction.js';
import { Position } from '../math/Position.js';
import { math } from '../math/math.js';

export class Traffic {

    constructor ( map, spriteManager ) {

        this._map = map;
        this._stack = [];
        this._spriteManager = spriteManager;

    }

    makeTraffic ( x, y, blockMaps, destFn ) {

        this._stack = [];

        let pos = new Position(x, y);

        if (this.findPerimeterRoad(pos)) {
            if (this.tryDrive(pos, destFn)) {
                this.addToTrafficDensityMap(blockMaps);
                return Micro.ROUTE_FOUND;
            }
            return Micro.NO_ROUTE_FOUND;
        } else {
            return Micro.NO_ROAD_FOUND;
        }

    }

    addToTrafficDensityMap ( blockMaps ) {

        let trafficDensityMap = blockMaps.trafficDensityMap;

        while ( this._stack.length > 0 ) {

            let pos = this._stack.pop();

            // Could this happen?!?
            if (!this._map.testBounds(pos.x, pos.y)) continue;

            let tileValue = this._map.getTileValue( pos.x, pos.y );

            if ( tileValue >= Tile.ROADBASE && tileValue < Tile.POWERBASE ) {
                // Update traffic density.
                let traffic = trafficDensityMap.worldGet(pos.x, pos.y);
                traffic += 50;
                traffic = Math.min(traffic, 240);
                trafficDensityMap.worldSet(pos.x, pos.y, traffic);

                // Attract traffic copter to the traffic
                if (traffic >= 240 && math.getRandom(5) === 0) {
                    let sprite = this._spriteManager.getSprite(Micro.SPRITE_HELICOPTER);
                    if (sprite !== null) {
                        sprite.destX = ZoneUtils.worldToPix(pos.x);
                        sprite.destY = ZoneUtils.worldToPix(pos.y);
                    }
                }
            }
        }

    }

    findPerimeterRoad ( pos ) {

        for ( let i = 0; i < 12; i++ ) {

            let xx = pos.x + Micro.perimX[i];
            let yy = pos.y + Micro.perimY[i];

            if (this._map.testBounds(xx, yy)) {
                if (ZoneUtils.isDriveable(this._map.getTileValue(xx, yy))) {
                    pos.x = xx;
                    pos.y = yy;
                    return true;
                }
            }
        }
        return false;

    }

    tryDrive ( startPos, destFn ) {

        let dirLast = Direction.INVALID;
        let drivePos = new Position(startPos);

        /* Maximum distance to try */
        for (let dist = 0; dist < Micro.MAX_TRAFFIC_DISTANCE; dist++) {
            let dir = this.tryGo(drivePos, dirLast);
            if (dir != Direction.INVALID) {
                drivePos.move(dir);
                dirLast = Direction.rotate180(dir);

                if (dist & 1) this._stack.push( new Position(drivePos) );
                if (this.driveDone(drivePos, destFn)) return true;
            } else {
                if (this._stack.length > 0) {
                    this._stack.pop();
                    dist += 3;
                } else {
                    return false;
                }
            }
        }
        return false;
    }

    tryGo ( pos, dirLast ) {

        let  directions = [];
        // Find connections from current position.
        let dir = Direction.NORTH;
        let i, count = 0;

        for ( i = 0; i < 4; i++ ) {
            if (dir != dirLast && ZoneUtils.isDriveable(this._map.getTileFromMapOrDefault(pos, dir, Tile.DIRT))) {
                // found a road in an allowed direction
                directions[i] = dir;
                count++;
            } else {
                directions[i] = Direction.INVALID;
            }
            dir = Direction.rotate90(dir);
        }
        if (count === 0) return Direction.INVALID;
        if (count === 1) {
            for (i = 0; i < 4; i++) {
                if (directions[i] != Direction.INVALID) return directions[i];
            }
        }
        i = math.getRandom16() & 3;
        while ( directions[i] === Direction.INVALID ) i = (i + 1) & 3;
        return directions[i];
        
    }

    driveDone ( pos, destFn ) {

        if (pos.y > 0) { if (destFn(this._map.getTileValue(pos.x, pos.y - 1))) return true; }
        if (pos.x < (this._map.width - 1)) { if (destFn(this._map.getTileValue(pos.x + 1, pos.y))) return true; }
        if (pos.y < (this._map.height - 1)) { if (destFn(this._map.getTileValue(pos.x, pos.y + 1))) return true; }
        if (pos.x > 0) { if (destFn(this._map.getTileValue(pos.x - 1, pos.y))) return true; }
        return false;

    }

}
