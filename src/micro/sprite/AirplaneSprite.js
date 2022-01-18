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
import { Messages } from '../Messages.js';
import { SpriteUtils } from './SpriteUtils.js';

import { math } from '../math/math.js';

export class AirplaneSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super()

        this.init( Micro.SPRITE_AIRPLANE, map, spriteManager, x, y );
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;
        if (x > SpriteUtils.worldToPix(map.width - 20)) {
            this.destX = this.x - 200;
            this.frame = 7;
        } else {
            this.destX = this.x + 200;
            this.frame = 11;
        }
        this.destY = this.y;

        this.xDelta = [0, 0, 6, 8, 6, 0, -6, -8, -6, 8, 8, 8];
        this.yDelta = [0, -8, -6, 0, 6, 8,  6, 0, -6, 0, 0, 0];

    }

    move ( spriteCycle, messageManager, disasterManager, blockMaps ) {

        let frame = this.frame;

        if ((spriteCycle % 5) === 0) {
          // Frames > 8 mean the plane is taking off
            if (frame > 8) {
                frame--;
                if (frame < 9) { // Planes always take off to the east
                    frame = 3;
                }
                this.frame = frame;
             } else {
                let d = SpriteUtils.getDir(this.x, this.y, this.destX, this.destY);
                frame = SpriteUtils.turnTo(frame, d);
                this.frame = frame;
            }
        }

        let absDist = SpriteUtils.absoluteDistance(this.x, this.y, this.destX, this.destY);
        if (absDist < 50) {
            // We're pretty close to the destination
            this.destX = math.getRandom(SpriteUtils.worldToPix(this.map.width)) + 8;
            this.destY = math.getRandom(SpriteUtils.worldToPix(this.map.height)) + 8;
        }

        if (disasterManager.enableDisasters) {
            let explode = false;

            let spriteList = this.spriteManager.getSpriteList();
            for (let i = 0; i < spriteList.length; i++) {

                let s = spriteList[i];

                //if (s.frame === 0 || s === sprite) continue;
                if (s.frame === 0 ) continue;

                if ((s.type === Micro.SPRITE_HELICOPTER || s.type === Micro.SPRITE_AIRPLANE) && SpriteUtils.checkSpriteCollision(this, s)) {
                    s.explodeSprite(messageManager);
                    explode = true;
                }
            }

            if (explode) this.explodeSprite(messageManager);
        }

        this.x += this.xDelta[frame];
        this.y += this.yDelta[frame];

        if (this.spriteNotInBounds()) this.frame = 0;
    }


    explodeSprite (messageManager) {
        this.frame = 0;
        this.spriteManager.makeExplosionAt(this.x, this.y);
        messageManager.sendMessage(Messages.PLANE_CRASHED);
    }

}