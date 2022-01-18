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


export class SpriteUtils {

    static pixToWorld (p) {
        return ZoneUtils.pixToWorld(p);
    }

    static worldToPix (w) {
        return ZoneUtils.worldToPix(w);
    }

    // Attempt to move 45° towards the desired direction, either
    // clockwise or anticlockwise, whichever gets us there quicker
    static turnTo ( presentDir, desiredDir ) {

        if (presentDir === desiredDir) return presentDir;

        if (presentDir < desiredDir) {
            // select clockwise or anticlockwise
            if (desiredDir - presentDir < 4) presentDir++;
            else presentDir--;
        } else {
            if (presentDir - desiredDir < 4) presentDir--;
            else presentDir++;
        }
        if (presentDir > 8) presentDir = 1;
        if (presentDir < 1) presentDir = 8;
        return presentDir;

    }

    static absoluteValue ( x ) {
        return Math.abs(x);
    }

    static getTileValue ( map, x, y ) {

        let wX = ZoneUtils.pixToWorld(x);
        let wY = ZoneUtils.pixToWorld(y);
        if (wX < 0 || wX >= map.width || wY < 0 || wY >= map.height)  return -1;
        return map.getTileValue(wX, wY);

    }


    // Choose the best direction to get from the origin to the destination
    // If the destination is equidistant in both x and y deltas, a diagonal
    // will be chosen, otherwise the most 'dominant' difference will be selected
    // (so if a destination is 4 units north and 2 units east, north will be chosen).
    // This code seems to always choose south if we're already there which seems like
    // a bug

    static getDir ( orgX, orgY, destX, destY ) {

        let deltaX = destX - orgX;
        let deltaY = destY - orgY;
        let i;

        if (deltaX < 0) {
            i = deltaY < 0 ? 11 : 8;
        } else {
            i = deltaY < 0 ? 2 : 5;
        }

        deltaX = Math.abs(deltaX);
        deltaY = Math.abs(deltaY);

        if (deltaX * 2 < deltaY) i++;
        else if (deltaY * 2 < deltaX) i--;
        if (i < 0 || i > 12) i = 0;
        return Micro.directionTable[i];

    }

    static absoluteDistance ( orgX, orgY, destX, destY ) {

        let deltaX = destX - orgX;
        let deltaY = destY - orgY;
        return Math.abs(deltaX) + Math.abs(deltaY);

    }

    static checkWet ( tileValue ) {

        if (tileValue === Tile.HPOWER || tileValue === Tile.VPOWER || tileValue === Tile.HRAIL || tileValue === Tile.VRAIL || tileValue === Tile.BRWH || tileValue === Tile.BRWV) return true;
        else  return false;

    }

    static destroyMapTile ( spriteManager, map, blockMaps, ox, oy ) {

        let x = ZoneUtils.pixToWorld(ox);
        let y = ZoneUtils.pixToWorld(oy);

        if (!map.testBounds(x, y)) return;

        let tile = map.getTile(x, y);
        let tileValue = tile.getValue();

        if (tileValue < Tile.TREEBASE) return;

        if (!tile.isCombustible()) {
            if (tileValue >= Tile.ROADBASE && tileValue <= Tile.LASTROAD) map.setTile(x, y, Tile.RIVER, 0);
            return;
        }

        if (tile.isZone()) {
            ZoneUtils.fireZone( map, x, y, blockMaps );
            if (tileValue > Tile.RZB) spriteManager.makeExplosionAt(ox, oy);
        }
        if (SpriteUtils.checkWet(tileValue)) map.setTile(x, y, Tile.RIVER, 0);
        else map.setTile(x, y, Tile.TINYEXP, Tile.BULLBIT | Tile.ANIMBIT);
        
    }

    static getDistance (x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    static checkSpriteCollision (s1, s2) {
        return s1.frame !== 0 && s2.frame !== 0 && SpriteUtils.getDistance(s1.x, s1.y, s2.x, s2.y) < 30;
    }
}