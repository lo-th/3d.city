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
import { Tile, ZoneUtils } from '../Tile.js';
import { Messages } from '../Messages.js';

import { math } from '../math/math.js';

export class ExplosionSprite extends BaseSprite {

    constructor ( map, spriteManager, x, y ) {

        super()

        this.init(Micro.SPRITE_EXPLOSION, map, spriteManager, x, y);
        this.width = 48;
        this.height = 48;
        this.xOffset = -24;
        this.yOffset = -24;
        this.frame = 1;
    }

    startFire (x, y) {
        x = ZoneUtils.pixToWorld(x);
        y = ZoneUtils.pixToWorld(y);

        if (!this.map.testBounds(x, y)) return;

        let tile = this.map.getTile(x, y);
        let tileValue = tile.getValue();

        if (!tile.isCombustible() && tileValue !== Tile.DIRT) return;

        if (tile.isZone()) return;

        this.map.setTo(x, y, ZoneUtils.randomFire());

  }

  move (spriteCycle, messageManager, disasterManager, blockMaps) {

        if ((spriteCycle & 1) === 0) {
            if (this.frame === 1) {
                // Convert sprite coordinates to tile coordinates.
                let explosionX = ZoneUtils.pixToWorld(this.x);
                let explosionY = ZoneUtils.pixToWorld(this.y);
                messageManager.sendMessage(Messages.SOUND_EXPLOSIONHIGH);
                messageManager.sendMessage(Messages.EXPLOSION_REPORTED, {x: explosionX, y: explosionY});
            }

            this.frame++;
        }

        if (this.frame > 6) {
            this.frame = 0;

            this.startFire(this.x, this.y);
            this.startFire(this.x - 16, this.y - 16);
            this.startFire(this.x + 16, this.y + 16);
            this.startFire(this.x - 16, this.y + 16);
            this.startFire(this.x + 16, this.y + 16);
        }
    }
}