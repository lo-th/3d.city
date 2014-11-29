/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

Micro.SpriteManager = function (map, SIM) {
    this.sim = SIM;
    this.spriteList = [];
    this.map = map;
    this.spriteCycle = 0;
}

Micro.SpriteManager.prototype = {

    constructor: Micro.SpriteManager,
    
    getSprite : function(type) {
        var filteredList = this.spriteList.filter(function (s) {
            return s.frame !== 0 && s.type === type;
        });
        if (filteredList.length === 0) return null;
        return filteredList[0];
    },
    getSpriteList : function() {
        return this.spriteList.slice();
    },
    getSpritesInView : function(startX, startY, lastX, lastY) {
        var sprites = [];
        startX = Micro.worldToPix(startX);
        startY = Micro.worldToPix(startY);
        lastX = Micro.worldToPix(lastX);
        lastY = Micro.worldToPix(lastY);
        return this.spriteList.filter(function(s) {
          return (s.x + s.xOffset >= startX && s.y + s.yOffset >= startY) &&
                 !(s.x + s.xOffset >= lastX && s.y + s.yOffset >= lastY);
        });
    },
    moveObjects : function() {
        var messageManager = this.sim.messageManager;
        var disasterManager = this.sim.disasterManager;
        var blockMaps = this.sim.blockMaps;

        this.spriteCycle += 1;

        var list = this.spriteList.slice();

        var i = list.length;
        while(i--){
        //for (var i = 0, l = list.length; i < l; i++) {
            var sprite = list[i];
            if (sprite.frame === 0) continue;
            sprite.move(this.spriteCycle, messageManager, disasterManager, blockMaps);
        }

        this.pruneDeadSprites();
    },
    /*moveObjects : function(simData) {
        var messageManager = simData.messageManager;
        var disasterManager = simData.disasterManager;
        var blockMaps = simData.blockMaps;

        this.spriteCycle += 1;

        var list = this.spriteList.slice();

        for (var i = 0, l = list.length; i < l; i++) {
          var sprite = list[i];

          if (sprite.frame === 0)
            continue;

          sprite.move(this.spriteCycle, messageManager, disasterManager, blockMaps);
        }

        this.pruneDeadSprites();
    },*/
    makeSprite : function(type, x, y) {
      this.spriteList.push(new constructors[type](this.map, this, x, y));
    },
    makeTornado : function(messageManager) {
        var sprite = this.getSprite(Micro.SPRITE_TORNADO);
        if (sprite !== null) {
            sprite.count = 200;
            return;
        }
        var x = Random.getRandom(Micro.worldToPix(this.map.width) - 800) + 400;
        var y = Random.getRandom(Micro.worldToPix(this.map.height) - 200) + 100;

        this.makeSprite(Micro.SPRITE_TORNADO, x, y);
        messageManager.sendMessage(Messages.TORNADO_SIGHTED, {x: Micro.pixToWorld(x), y: Micro.pixToWorld(y)});
    },
    makeExplosion : function(x, y) {
        if (this.map.testBounds(x, y)) this.makeExplosionAt(Micro.worldToPix(x), Micro.worldToPix(y));
    },
    makeExplosionAt : function(x, y) {
        this.makeSprite(Micro.SPRITE_EXPLOSION, x, y);
    },
    generatePlane : function(x, y) {
        if (this.getSprite(Micro.SPRITE_AIRPLANE) !== null) return;
        this.makeSprite(Micro.SPRITE_AIRPLANE, Micro.worldToPix(x), Micro.worldToPix(y));
    },
    generateTrain : function(census, x, y) {
        if (census.totalPop > 20 && this.getSprite(Micro.SPRITE_TRAIN) === null && Random.getRandom(25) === 0) this.makeSprite(Micro.SPRITE_TRAIN,Micro.worldToPix(x) + 8, Micro.worldToPix(y) + 8);
    },
    generateShip : function() {
    // XXX This code is borked. The map generator will never
    // place a channel tile on the edges of the map
    var x,y;

    if (Random.getChance(3)) {
      for (x = 4; x < this.map.width - 2; x++) {
        if (this.map.getTileValue(x, 0) === Tile.CHANNEL)  {
          this.makeShipHere(x, 0);
          return;
        }
      }
    }

    if (Random.getChance(3)) {
      for (y = 1; y < this.map.height - 2; y++) {
        if (this.map.getTileValue(0, y) === Tile.CHANNEL)  {
          this.makeShipHere(0, y);
          return;
        }
      }
    }

    if (Random.getChance(3)) {
      for (x = 4; x < this.map.width - 2; x++) {
        if (this.map.getTileValue(x, this.map.height - 1) === Tile.CHANNEL)  {
          this.makeShipHere(x, this.map.height - 1);
          return;
        }
      }
    }

    if (Random.getChance(3)) {
      for (y = 1; y < this.map.height - 2; y++) {
        if (this.map.getTileValue(this.map.width - 1, y) === Tile.CHANNEL)  {
          this.makeShipHere(this.map.width - 1, y);
          return;
        }
      }
    }
    },
    getBoatDistance : function(x, y) {
        var dist = 99999;
        var pixelX = Micro.worldToPix(x) + 8;
        var pixelY = Micro.worldToPix(y) + 8;
        var sprite;

        for (var i = 0, l = this.spriteList.length; i < l; i++) {
          sprite = this.spriteList[i];
          if (sprite.type === Micro.SPRITE_SHIP && sprite.frame !== 0) {
            //var sprDist = Micro.absoluteValue(sprite.x - pixelX) + Micro.absoluteValue(sprite.y - pixelY);
            var sprDist = Math.abs(sprite.x - pixelX) + Math.abs(sprite.y - pixelY);
            dist = Math.min(dist, sprDist);
          }
        }

        return dist;
    },
    makeShipHere : function(x, y) {
        this.makeSprite(Micro.SPRITE_SHIP,Micro.worldToPix(x),Micro.worldToPix(y));
    },
    generateCopter : function(x, y) {
        if (this.getSprite(Micro.SPRITE_HELICOPTER) !== null) return;
        this.makeSprite(Micro.SPRITE_HELICOPTER,Micro.worldToPix(x),Micro.worldToPix(y));
    },
    makeMonsterAt : function(messageManager, x, y) {
    this.makeSprite(Micro.SPRITE_MONSTER,
                    Micro.worldToPix(x),
                    Micro.worldToPix(y));
    messageManager.sendMessage(Messages.MONSTER_SIGHTED, {x: x, y: y});
    },
    makeMonster : function(messageManager) {
        var sprite = this.getSprite(Micro.SPRITE_MONSTER);
        if (sprite !== null) {
            sprite.soundCount = 1;
           sprite.count = 1000;
            sprite.destX = Micro.worldToPix(this.map.pollutionMaxX);
            sprite.destY = Micro.worldToPix(this.map.pollutionMaxY);
        }

        var done = 0;
        for (var i = 0; i < 300; i++)  {
            var x = Random.getRandom(this.map.width - 20) + 10;
            var y = Random.getRandom(this.map.height - 10) + 5;
            var tile = this.map.getTile(x, y);
            if (tile.getValue() === Tile.RIVER) {
                this.makeMonsterAt(messageManager, x, y);
                done = 1;
                break;
            }
        }

        if (done === 0) this.makeMonsterAt(messageManager, 60, 50);
    },
    pruneDeadSprites : function(type) {
        this.spriteList = this.spriteList.filter(function (s) { return s.frame !== 0; });
    }
}


var constructors = {};
constructors[Micro.SPRITE_TRAIN] = Micro.TrainSprite;
constructors[Micro.SPRITE_SHIP] = Micro.BoatSprite;
constructors[Micro.SPRITE_MONSTER] = Micro.MonsterSprite;
constructors[Micro.SPRITE_HELICOPTER] = Micro.CopterSprite;
constructors[Micro.SPRITE_AIRPLANE] = Micro.AirplaneSprite;
constructors[Micro.SPRITE_TORNADO] = Micro.TornadoSprite;
constructors[Micro.SPRITE_EXPLOSION] = Micro.ExplosionSprite;


//  return SpriteManager;
//});
