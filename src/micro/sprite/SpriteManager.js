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
import { TrainSprite } from './TrainSprite.js';
import { BoatSprite } from './BoatSprite.js';
import { MonsterSprite } from './MonsterSprite.js';
import { CopterSprite } from './CopterSprite.js';
import { AirplaneSprite } from './AirplaneSprite.js';
import { TornadoSprite } from './TornadoSprite.js';
import { ExplosionSprite } from './ExplosionSprite.js';

import { math } from '../math/math.js';

const constructors = {};
constructors[Micro.SPRITE_TRAIN] = TrainSprite;
constructors[Micro.SPRITE_SHIP] = BoatSprite;
constructors[Micro.SPRITE_MONSTER] = MonsterSprite;
constructors[Micro.SPRITE_HELICOPTER] = CopterSprite;
constructors[Micro.SPRITE_AIRPLANE] = AirplaneSprite;
constructors[Micro.SPRITE_TORNADO] = TornadoSprite;
constructors[Micro.SPRITE_EXPLOSION] = ExplosionSprite;




export class SpriteManager {

    constructor ( map ) {

        this.spriteList = [];
        this.map = map;
        this.spriteCycle = 0;
    }
    
    getSprite (type) {

        let filteredList = this.spriteList.filter(function (s) {
            return s.frame !== 0 && s.type === type;
        });
        if (filteredList.length === 0) return null;
        return filteredList[0];
    }

    getSpriteList () {
        return this.spriteList.slice();
    }

    getSpritesInView (startX, startY, lastX, lastY) {
        let sprites = [];
        startX = SpriteUtils.worldToPix(startX);
        startY = SpriteUtils.worldToPix(startY);
        lastX = SpriteUtils.worldToPix(lastX);
        lastY = SpriteUtils.worldToPix(lastY);
        return this.spriteList.filter(function(s) {
          return (s.x + s.xOffset >= startX && s.y + s.yOffset >= startY) &&
                 !(s.x + s.xOffset >= lastX && s.y + s.yOffset >= lastY);
        });
    }

    moveObjects ( simData ) {

        if(!simData) simData = Micro.simData

        let messageManager = simData.messageManager;
        let disasterManager = simData.disasterManager;
        let blockMaps = simData.blockMaps;

        this.spriteCycle += 1;

        let list = this.spriteList.slice();

        let i = list.length;
        while(i--){
        //for (let i = 0, l = list.length; i < l; i++) {
            let sprite = list[i];
            if (sprite.frame === 0) continue;
            sprite.move(this.spriteCycle, messageManager, disasterManager, blockMaps);
        }

        this.pruneDeadSprites();
    }

    makeSprite (type, x, y) {

        this.spriteList.push(new constructors[type](this.map, this, x, y));

    }

    makeTornado (messageManager) {
        let sprite = this.getSprite( Micro.SPRITE_TORNADO );
        if (sprite !== null) {
            sprite.count = 200;
            return;
        }
        let x = math.getRandom(SpriteUtils.worldToPix(this.map.width) - 800) + 400;
        let y = math.getRandom(SpriteUtils.worldToPix(this.map.height) - 200) + 100;

        this.makeSprite( Micro.SPRITE_TORNADO, x, y );
        messageManager.sendMessage(Messages.TORNADO_SIGHTED, {x: SpriteUtils.pixToWorld(x), y: SpriteUtils.pixToWorld(y)});
    }

    makeExplosion (x, y) {
        if (this.map.testBounds(x, y)) this.makeExplosionAt(SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
    }

    makeExplosionAt(x, y) {
        this.makeSprite(Micro.SPRITE_EXPLOSION, x, y);
    }

    generatePlane (x, y) {
        if (this.getSprite(Micro.SPRITE_AIRPLANE) !== null) return;
        this.makeSprite(Micro.SPRITE_AIRPLANE, SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
    }

    generateTrain (census, x, y) {
        if (census.totalPop > 20 && this.getSprite(Micro.SPRITE_TRAIN) === null && math.getRandom(25) === 0) this.makeSprite(Micro.SPRITE_TRAIN,SpriteUtils.worldToPix(x) + 8, SpriteUtils.worldToPix(y) + 8);
    }

    generateShip () {
        // XXX This code is borked. The map generator will never
        // place a channel tile on the edges of the map
        let x,y;

        if (math.getChance(3)) {
          for (x = 4; x < this.map.width - 2; x++) {
            if (this.map.getTileValue(x, 0) === Tile.CHANNEL)  {
              this.makeShipHere(x, 0);
              return;
            }
          }
        }

        if (math.getChance(3)) {
          for (y = 1; y < this.map.height - 2; y++) {
            if (this.map.getTileValue(0, y) === Tile.CHANNEL)  {
              this.makeShipHere(0, y);
              return;
            }
          }
        }

        if (math.getChance(3)) {
          for (x = 4; x < this.map.width - 2; x++) {
            if (this.map.getTileValue(x, this.map.height - 1) === Tile.CHANNEL)  {
              this.makeShipHere(x, this.map.height - 1);
              return;
            }
          }
        }

        if (math.getChance(3)) {
          for (y = 1; y < this.map.height - 2; y++) {
            if (this.map.getTileValue(this.map.width - 1, y) === Tile.CHANNEL)  {
              this.makeShipHere(this.map.width - 1, y);
              return;
            }
          }
        }
    }

    getBoatDistance (x, y) {
        let dist = 99999;
        let pixelX = SpriteUtils.worldToPix(x) + 8;
        let pixelY = SpriteUtils.worldToPix(y) + 8;
        let sprite;

        for (let i = 0, l = this.spriteList.length; i < l; i++) {
            sprite = this.spriteList[i];
            if (sprite.type === Micro.SPRITE_SHIP && sprite.frame !== 0) {
                //let sprDist = Micro.absoluteValue(sprite.x - pixelX) + Micro.absoluteValue(sprite.y - pixelY);
                let sprDist = Math.abs(sprite.x - pixelX) + Math.abs(sprite.y - pixelY);
                dist = Math.min(dist, sprDist);
            }
        }

        return dist;
    }

    makeShipHere (x, y) {
        this.makeSprite(Micro.SPRITE_SHIP,SpriteUtils.worldToPix(x),SpriteUtils.worldToPix(y));
    }

    generateCopter (x, y) {
        if (this.getSprite(Micro.SPRITE_HELICOPTER) !== null) return;
        this.makeSprite(Micro.SPRITE_HELICOPTER,SpriteUtils.worldToPix(x),SpriteUtils.worldToPix(y));
    }

    makeMonsterAt (messageManager, x, y) {

        this.makeSprite(Micro.SPRITE_MONSTER, SpriteUtils.worldToPix(x), SpriteUtils.worldToPix(y));
        messageManager.sendMessage(Messages.MONSTER_SIGHTED, {x: x, y: y});
    }

    makeMonster (messageManager) {
        let sprite = this.getSprite(Micro.SPRITE_MONSTER);
        if (sprite !== null) {
            sprite.soundCount = 1;
           sprite.count = 1000;
            sprite.destX = SpriteUtils.worldToPix(this.map.pollutionMaxX);
            sprite.destY = SpriteUtils.worldToPix(this.map.pollutionMaxY);
        }

        let done = 0;
        for (let i = 0; i < 300; i++)  {
            let x = math.getRandom(this.map.width - 20) + 10;
            let y = math.getRandom(this.map.height - 10) + 5;
            let tile = this.map.getTile(x, y);
            if (tile.getValue() === Tile.RIVER) {
                this.makeMonsterAt(messageManager, x, y);
                done = 1;
                break;
            }
        }

        if (done === 0) this.makeMonsterAt(messageManager, 60, 50);
    }

    pruneDeadSprites (type) {
        this.spriteList = this.spriteList.filter(function (s) { return s.frame !== 0; });
    }

}




