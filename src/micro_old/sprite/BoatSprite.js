/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { BaseSprite } from './BaseSprite.js';
import { Micro } from '../Micro.js';
import { Tile } from '../Tile.js';
import { Messages } from '../Messages.js';
import { SpriteUtils } from './SpriteUtils.js';

import { math } from '../math/math.js';

export class BoatSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super()

        this.init( Micro.SPRITE_SHIP, map, spriteManager, x, y );
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;

        if (x < SpriteUtils.worldToPix(4)) this.frame = 3;
        else if (x >= SpriteUtils.worldToPix(map.width - 4)) this.frame = 7;
        else if (y < SpriteUtils.worldToPix(4)) this.frame = 5;
        else if (y >= SpriteUtils.worldToPix(map.height - 4)) this.frame = 1;
        else this.frame = 3;

        this.newDir = this.frame;
        this.dir = 10;
        this.count = 1;

        this.tileDeltaX = [0,  0,  1,  1,  1,  0, -1, -1, -1];
        this.tileDeltaY = [0, -1, -1,  0,  1,  1,  1,  0, -1];
        this.xDelta = [0,  0,  2,  2,  2,  0, -2, -2, -2];
        this.yDelta = [0, -2, -2,  0,  2,  2,  2,  0, -2];
        this.tileWhiteList = [Tile.RIVER, Tile.CHANNEL, Tile.POWERBASE, Tile.POWERBASE + 1, Tile.RAILBASE, Tile.RAILBASE + 1, Tile.BRWH, Tile.BRWV];

        this.CANTMOVE = 10;

    }

    move ( spriteCycle, messageManager, disasterManager, blockMaps ) {

        let t = Tile.RIVER;

        let startDir, frame, dir, x, y, tileValue;

        if (this.soundCount > 0) this.soundCount--;

        if (this.soundCount === 0) {
          if ((math.getRandom16() & 3) === 1) {
            // TODO Scenarios
            // TODO Sound
            messageManager.sendMessage(Messages.SOUND_HONKHONK);
          }

          this.soundCount = 200;
        }

        if (this.count > 0) this.count--;

        if (this.count === 0) {

            // Ships turn slowly: only 45° every 9 cycles
            this.count = 9;

            // If already executing a turn, continue to do so
            if (this.frame !== this.newDir) {
                this.frame = SpriteUtils.turnTo(this.frame, this.newDir);
                return;
            }

            // Otherwise pick a new direction
            // Choose a random starting direction to search from
            // 0 = N, 1 = NE, ... 7 = NW
            startDir = math.getRandom16() & 7;
            frame = this.frame;

            for ( dir = startDir; dir < (startDir + 8); dir++) {

                frame = (dir & 7) + 1;

                if (frame === this.dir) continue;

                x = SpriteUtils.pixToWorld(this.x) + this.tileDeltaX[frame];
                y = SpriteUtils.pixToWorld(this.y) + this.tileDeltaY[frame];

                if (this.map.testBounds(x, y)) {
                    tileValue = this.map.getTileValue(x, y);

                    // Test for a suitable water tile
                    if (tileValue === Tile.CHANNEL || tileValue === Tile.BRWH || tileValue === Tile.BRWV || this.oppositeAndUnderwater(tileValue, this.dir, frame)) {
                        this.newDir = frame;
                        this.frame = SpriteUtils.turnTo(this.frame, this.newDir);
                        this.dir = frame + 4;

                        if (this.dir > 8) this.dir -= 8;
                        break;
                    }
                }
            }

            if (dir === (startDir + 8)) {
                this.dir = this.CANTMOVE;
                this.newDir = (math.getRandom16() & 7) + 1;
            }
        } else {
            frame = this.frame;

            if (frame === this.newDir)  {
                this.x += this.xDelta[frame];
                this.y += this.yDelta[frame];
            }
        }

        if (this.spriteNotInBounds()) {
            this.frame = 0;
            return;
        }

        // If we didn't find a new direction, we might explode
        // depending on the last tile we looked at.
        for (let i = 0; i < 8; i++) {

            if (t === this.tileWhiteList[i]) break;
            if (i === 7) {
               this.explodeSprite(messageManager);
               SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
            }
        }
    }


    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.SHIP_CRASHED);
    }

    // This is an odd little function. It returns true if
    // oldDir is 180° from newDir and tileValue is underwater
    // rail or wire, and returns false otherwise
    oppositeAndUnderwater (tileValue, oldDir, newDir) {
        let opposite = oldDir + 4;
        if (opposite > 8) opposite -= 8;
        if (newDir != opposite) return false;
        if (tileValue == Tile.POWERBASE || tileValue == Tile.POWERBASE + 1 || tileValue == Tile.RAILBASE || tileValue == Tile.RAILBASE + 1) return true;
        return false;
    }

}

