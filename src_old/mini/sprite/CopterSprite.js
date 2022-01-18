/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.CopterSprite = function (map, spriteManager, x, y) {
  Micro.BaseSprite.call( this );
    this.init(Micro.SPRITE_HELICOPTER, map, spriteManager, x, y);
    this.width = 32;
    this.height = 32;
    this.xOffset = -16;
    this.yOffset = -16;
    this.frame = 5;
    this.count = 1500;
    this.destX = Random.getRandom(Micro.worldToPix(map.width)) + 8;
    this.destY = Random.getRandom(Micro.worldToPix(map.height)) + 8;
    this.origX = x;
    this.origY = y;

    this.xDelta = [0, 0, 3, 5, 3, 0, -3, -5, -3];
    this.yDelta = [0, -5, -3, 0, 3, 5, 3, 0, -3];
}


Micro.CopterSprite.prototype = Object.create( Micro.BaseSprite.prototype );

Micro.CopterSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    if (this.soundCount > 0)
      this.soundCount--;

    if (this.count > 0)
      this.count--;

    if (this.count === 0) {
      // Head towards a monster, and certain doom
      var s = this.spriteManager.getSprite(Micro.SPRITE_MONSTER);

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
      var absDist = Micro.absoluteDistance(this.x, this.y, this.origX, this.origY);
      if (absDist < 30) {
        this.frame = 0;
        return;
      }
    }

    if (this.soundCount === 0) {
        var x = Micro.pixToWorld(this.x);
        var y = Micro.pixToWorld(this.y);

        if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
          if (blockMaps.trafficDensityMap.worldGet(x, y) > 170 && (Random.getRandom16() & 7) === 0) {
            messageManager.sendMessage(Messages.HEAVY_TRAFFIC, {x: x, y: y});
            messageManager.sendMessage(Messages.SOUND_HEAVY_TRAFFIC);
            this.soundCount = 200;
        }
      }
    }

    var frame = this.frame;

    if ((spriteCycle & 3) === 0) {
      var dir = Micro.getDir(this.x, this.y, this.destX, this.destY);
      frame = Micro.turnTo(frame, dir);
      this.frame = frame;
    }

    this.x += this.xDelta[frame];
    this.y += this.yDelta[frame];
  };


Micro.CopterSprite.prototype.explodeSprite = function(messageManager) {
    this.frame = 0;
    this.spriteManager.makeExplosionAt(this.x, this.y);
    messageManager.sendMessage(Messages.HELICOPTER_CRASHED);
  };

/*
  // Metadata for image loading
  Object.defineProperties(CopterSprite,
    {ID: Micro.makeConstantDescriptor(2),
     width: Micro.makeConstantDescriptor(32),
     frames: Micro.makeConstantDescriptor(8)});


  return CopterSprite;
});
*/