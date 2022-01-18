/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.MonsterSprite = function (map, spriteManager, x, y) {
  Micro.BaseSprite.call( this );
    this.init(Micro.SPRITE_MONSTER, map, spriteManager, x, y);
    this.width = 48;
    this.height = 48;
    this.xOffset = -24;
    this.yOffset = -24;

    if (x > Micro.worldToPix(map.width) / 2) {
      if (y > Micro.worldToPix(map.height) / 2) this.frame = 10;
      else this.frame = 7;
    } else if (y > Micro.worldToPix(map.height) / 2) { this.frame = 1;
    } else { this.frame = 4;
    }

    this.flag = 0;
    this.count = 1000;
    this.destX = Micro.worldToPix(map.pollutionMaxX);
    this.destY = Micro.worldToPix(map.pollutionMaxY);
    this.origX = this.x;
    this.origY = this.y;
    this._seenLand = false;

    this.xDelta = [ 2, 2, -2, -2, 0];
    this.yDelta = [-2, 2, 2, -2, 0];
    this.cardinals1 = [ 0, 1, 2, 3];
    this.cardinals2 = [ 1, 2, 3, 0];
    this.diagonals1 = [ 2, 5, 8, 11];
    this.diagonals2 = [11, 2, 5, 8];
}

Micro.MonsterSprite.prototype = Object.create( Micro.BaseSprite.prototype );

Micro.MonsterSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    if (this.soundCount > 0)
      this.soundCount--;

    // Frames 1 - 12 are diagonal sprites, 3 for each direction.
    // 1-3 NE, 2-6 SE, etc. 13-16 represent the cardinal directions.
    var currentDir = Math.floor((this.frame - 1) / 3);
    var frame, dir;

    if (currentDir < 4) { /* turn n s e w */
      // Calculate how far in the 3 step animation we were,
      // move on to the next one
      frame = (this.frame - 1) % 3;

      if (frame === 2)
        this.step = 0;

      if (frame === 0)
        this.step = 1;

      if (this.step)
        frame++;
      else
        frame--;

      var absDist = Micro.absoluteDistance(this.x, this.y, this.destX, this.destY);

      if (absDist < 60) {
        if (this.flag === 0) {
          this.flag = 1;
          this.destX = this.origX;
          this.destY = this.origY;
        } else {
          this.frame = 0;
          return;
        }
      }

      // Perhaps switch to a cardinal direction
      dir = Micro.getDir(this.x, this.y, this.destX, this.destY);
      dir = Math.floor((dir - 1) / 2);

      if (dir !== currentDir && Random.getChance(10)) {
        if (Random.getRandom16() & 1)
          frame = this.cardinals1[currentDir];
        else
          frame = this.cardinals2[currentDir];

        currentDir = 4;

        if (!this.soundCount) {
          messageManager.sendMessage(Messages.SOUND_MONSTER);
          this.soundCount = 50 + Random.getRandom(100);
        }
      }
    } else {
      // Travelling in a cardinal direction. Switch to a diagonal
      currentDir = 4;
      dir = this.frame;
      frame = (dir - 13) & 3;

      if (!(Random.getRandom16() & 3)) {
        if (Random.getRandom16() & 1)
          frame = this.diagonals1[frame];
        else
          frame = this.diagonals2[frame];

        // We mung currentDir and frame here to
        // make the assignment below work
        currentDir = Math.floor((frame - 1) / 3);
        frame = (frame - 1) % 3;
      }
    }

    frame = currentDir * 3 + frame + 1;
    if (frame > 16)
      frame = 16;

    this.frame = frame;

    this.x += this.xDelta[currentDir];
    this.y += this.yDelta[currentDir];

    if (this.count > 0)
      this.count--;

    var tileValue = Micro.getTileValue(this.map, this.x, this.y);

    if (tileValue === -1 || (tileValue === Tile.RIVER && this.count < 500))
      this.frame = 0;

    if (tileValue === Tile.DIRT || tileValue > Tile.WATER_HIGH)
      this._seenLand = true;

    var spriteList = this.spriteManager.getSpriteList();
    for (var i = 0; i < spriteList.length; i++) {
      var s = spriteList[i];

      if (s.frame !== 0 &&
          (s.type === Micro.SPRITE_AIRPLANE || s.type === Micro.SPRITE_HELICOPTER ||
           s.type === Micro.SPRITE_SHIP || s.type === Micro.SPRITE_TRAIN) &&
            Micro.checkSpriteCollision(this, s))
        s.explodeSprite(messageManager);
    }

    Micro.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
  };

/*
  // Metadata for image loading
  Object.defineProperties(MonsterSprite,
    {ID: Micro.makeConstantDescriptor(5),
     width: Micro.makeConstantDescriptor(48),
     frames: Micro.makeConstantDescriptor(16)});


  return MonsterSprite;
});
*/