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

export class TornadoSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super()

        this.init(Micro.SPRITE_TORNADO, map, spriteManager, x, y);
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -40;
        this.frame = 1;
        this.count = 200;

        this.xDelta = [2, 3, 2, 0, -2, -3];
        this.yDelta = [-2, 0, 2, 3, 2, 0];
    }

    move (spriteCycle, messageManager, disasterManager, blockMaps) {
        let frame;
        frame = this.frame;

        // If middle frame, move right or left
        // depending on the flag value
        // If frame = 1, perhaps die based on flag
        // value
        if (frame === 2) {
            if (this.flag) frame = 3;
            else  frame = 1;
        } else {
            if (frame === 1) this.flag = 1;
            else  this.flag = 0;

            frame = 2;
        }

        if (this.count > 0) this.count--;

        this.frame = frame;

        let spriteList = this.spriteManager.getSpriteList();

        for (let i = 0; i < spriteList.length; i++) {

            let s = spriteList[i];

          // Explode vulnerable sprites
            if (s.frame !== 0 &&
              (s.type === Micro.SPRITE_AIRPLANE || s.type === Micro.SPRITE_HELICOPTER ||
               s.type === Micro.SPRITE_SHIP || s.type === Micro.SPRITE_TRAIN) &&
              SpriteUtils.checkSpriteCollision(this, s)) {
              s.explodeSprite(messageManager);
            }
        }

        frame = Random.getRandom(5);
        this.x += this.xDelta[frame];
        this.y += this.yDelta[frame];

        if (this.spriteNotInBounds()) this.frame = 0;

        if (this.count !== 0 && Random.getRandom(500) === 0) this.frame = 0;

        SpriteUtils.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
    }
}
/*

  // Metadata for image loading
  Object.defineProperties(TornadoSprite,
    {ID: Micro.makeConstantDescriptor(6),
     width: Micro.makeConstantDescriptor(48),
     frames: Micro.makeConstantDescriptor(3)});


  return TornadoSprite;
});
*/