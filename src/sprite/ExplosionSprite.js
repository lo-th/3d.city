/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 Micro.ExplosionSprite = function (map, spriteManager, x, y) {
  Micro.BaseSprite.call( this );
    this.init(Micro.SPRITE_EXPLOSION, map, spriteManager, x, y);
    this.width = 48;
    this.height = 48;
    this.xOffset = -24;
    this.yOffset = -24;
    this.frame = 1;
  }


Micro.ExplosionSprite.prototype = Object.create( Micro.BaseSprite.prototype );


  Micro.ExplosionSprite.prototype.startFire = function(x, y) {
    x = Micro.pixToWorld(x);
    y = Micro.pixToWorld(y);

    if (!this.map.testBounds(x, y))
      return;

    var tile = this.map.getTile(x, y);
    var tileValue = tile.getValue();

    if (!tile.isCombustible() && tileValue !== Tile.DIRT)
      return;

    if (tile.isZone())
      return;

    this.map.setTo(x, y, Micro.randomFire());
  };


  Micro.ExplosionSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    if ((spriteCycle & 1) === 0) {
      if (this.frame === 1) {
        // Convert sprite coordinates to tile coordinates.
        var explosionX = Micro.pixToWorld(this.x);
        var explosionY = Micro.pixToWorld(this.y);
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
  };
/*
  // Metadata for image loading
  Object.defineProperties(ExplosionSprite,
    {ID: Micro.makeConstantDescriptor(7),
     width: Micro.makeConstantDescriptor(48),
     frames: Micro.makeConstantDescriptor(6)});


  return ExplosionSprite;
});
*/