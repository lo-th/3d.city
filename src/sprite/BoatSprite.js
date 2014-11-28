/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.BoatSprite = function(map, spriteManager, x, y) {
  Micro.BaseSprite.call( this );
    this.init(Micro.SPRITE_SHIP, map, spriteManager, x, y);
    this.width = 48;
    this.height = 48;
    this.xOffset = -24;
    this.yOffset = -24;

    if (x < Micro.worldToPix(4)) this.frame = 3;
    else if (x >= Micro.worldToPix(map.width - 4)) this.frame = 7;
    else if (y < Micro.worldToPix(4)) this.frame = 5;
    else if (y >= Micro.worldToPix(map.height - 4)) this.frame = 1;
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


Micro.BoatSprite.prototype = Object.create( Micro.BaseSprite.prototype );

Micro.BoatSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    var t = Tile.RIVER;
    //var tile = Tile.RIVER;

    if (this.soundCount > 0) this.soundCount--;

    if (this.soundCount === 0) {
      if ((Random.getRandom16() & 3) === 1) {
        // TODO Scenarios
        // TODO Sound
        messageManager.sendMessage(Messages.SOUND_HONKHONK);
      }

      this.soundCount = 200;
    }

    if (this.count > 0)
        this.count--;

    if (this.count === 0) {
      // Ships turn slowly: only 45° every 9 cycles
      this.count = 9;

      // If already executing a turn, continue to do so
      if (this.frame !== this.newDir) {
        this.frame = Micro.turnTo(this.frame, this.newDir);
        return;
      }

      // Otherwise pick a new direction
      // Choose a random starting direction to search from
      // 0 = N, 1 = NE, ... 7 = NW
      var startDir = Random.getRandom16() & 7;
      var frame = this.frame;
      for (var dir = startDir; dir < (startDir + 8); dir++) {
        frame = (dir & 7) + 1;

        if (frame === this.dir)
          continue;

        var x = Micro.pixToWorld(this.x) + this.tileDeltaX[frame];
        var y = Micro.pixToWorld(this.y) + this.tileDeltaY[frame];

        if (this.map.testBounds(x, y)) {
          var tileValue = this.map.getTileValue(x, y);

          // Test for a suitable water tile
          if (tileValue === Tile.CHANNEL || tileValue === Tile.BRWH ||
             tileValue === Tile.BRWV || this.oppositeAndUnderwater(tileValue, this.dir, frame)) {
            this.newDir = frame;
            this.frame = Micro.turnTo(this.frame, this.newDir);
            this.dir = frame + 4;

            if (this.dir > 8)
              this.dir -= 8;
            break;
          }
        }
      }

      if (dir === (startDir + 8)) {
        this.dir = this.CANTMOVE;
        this.newDir = (Random.getRandom16() & 7) + 1;
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
    for (var i = 0; i < 8; i++) {
      if (t === this.tileWhiteList[i]) {
        break;
      }

      if (i === 7) {
        this.explodeSprite(messageManager);
        Micro.destroyMapTile(this.spriteManager, this.map, blockMaps, this.x, this.y);
      }
    }
};


Micro.BoatSprite.prototype.explodeSprite = function(messageManager) {
    this.frame = 0;
    this.spriteManager.makeExplosionAt(this.x, this.y);
    messageManager.sendMessage(Messages.SHIP_CRASHED);
};

  // This is an odd little function. It returns true if
  // oldDir is 180° from newDir and tileValue is underwater
  // rail or wire, and returns false otherwise
Micro.BoatSprite.prototype.oppositeAndUnderwater = function(tileValue, oldDir, newDir) {
    var opposite = oldDir + 4;
    if (opposite > 8) opposite -= 8;
    if (newDir != opposite) return false;
    if (tileValue == Tile.POWERBASE || tileValue == Tile.POWERBASE + 1 || tileValue == Tile.RAILBASE || tileValue == Tile.RAILBASE + 1) return true;
    return false;
};

  // Metadata for image loading
/*  Object.defineProperties(BoatSprite,
    {ID: Micro.makeConstantDescriptor(4),
     width: Micro.makeConstantDescriptor(48),
     frames: Micro.makeConstantDescriptor(8)});


  return BoatSprite;
});*/
