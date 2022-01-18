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

export class CopterSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super()

        this.init(Micro.SPRITE_HELICOPTER, map, spriteManager, x, y);
        this.width = 32;
        this.height = 32;
        this.xOffset = -16;
        this.yOffset = -16;
        this.frame = 5;
        this.count = 1500;
        this.destX = math.getRandom(SpriteUtils.worldToPix(map.width)) + 8;
        this.destY = math.getRandom(SpriteUtils.worldToPix(map.height)) + 8;
        this.origX = x;
        this.origY = y;

        this.xDelta = [0, 0, 3, 5, 3, 0, -3, -5, -3];
        this.yDelta = [0, -5, -3, 0, 3, 5, 3, 0, -3];

    }

    move ( spriteCycle, messageManager, disasterManager, blockMaps ) {

        if (this.soundCount > 0) this.soundCount--;

        if (this.count > 0) this.count--;

        if (this.count === 0) {
            // Head towards a monster, and certain doom
            let s = this.spriteManager.getSprite(Micro.SPRITE_MONSTER);

            if (s !== null) {
                this.destX = s.x;
                this.destY = s.y;
            } else {
                // No monsters. Hm. I bet flying near that tornado is sensible
                s = this.spriteManager.getSprite(Micro.SPRITE_TORNADO);

                if (s !== null) {
                    this.destX = s.x;
                    this.destY = s.y;
                } else {
                    this.destX = this.origX;
                    this.destY = this.origY;
                }
            }

            // If near destination, let's get her on the ground
            let absDist = SpriteUtils.absoluteDistance(this.x, this.y, this.origX, this.origY);
            if (absDist < 30) {
                this.frame = 0;
                return;
            }
        }

        if (this.soundCount === 0) {
            let x = SpriteUtils.pixToWorld(this.x);
            let y = SpriteUtils.pixToWorld(this.y);

            if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
                if (blockMaps.trafficDensityMap.worldGet(x, y) > 170 && (math.getRandom16() & 7) === 0) {
                    messageManager.sendMessage(Messages.HEAVY_TRAFFIC, {x: x, y: y});
                    messageManager.sendMessage(Messages.SOUND_HEAVY_TRAFFIC);
                    this.soundCount = 200;
                }
            }
        }

        let frame = this.frame;

        if ((spriteCycle & 3) === 0) {
            let dir = SpriteUtils.getDir(this.x, this.y, this.destX, this.destY);
            frame = SpriteUtils.turnTo(frame, dir);
            this.frame = frame;
        }

        this.x += this.xDelta[frame];
        this.y += this.yDelta[frame];
    }

    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.HELICOPTER_CRASHED);
    }

}
