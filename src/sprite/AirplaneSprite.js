/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.AirplaneSprite = function(map, spriteManager, x, y) {
  Micro.BaseSprite.call( this );
    this.init(Micro.SPRITE_AIRPLANE, map, spriteManager, x, y);
    this.width = 48;
    this.height = 48;
    this.xOffset = -24;
    this.yOffset = -24;
    if (x > Micro.worldToPix(map.width - 20)) {
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


Micro.AirplaneSprite.prototype = Object.create( Micro.BaseSprite.prototype );


 
Micro.AirplaneSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    var frame = this.frame;

    if ((spriteCycle % 5) === 0) {
      // Frames > 8 mean the plane is taking off
      if (frame > 8) {
        frame--;
        if (frame < 9) {
          // Planes always take off to the east
          frame = 3;
        }
        this.frame = frame;
      } else {
        var d = Micro.getDir(this.x, this.y, this.destX, this.destY);
        frame = Micro.turnTo(frame, d);
        this.frame = frame;
      }
    }

    var absDist = Micro.absoluteDistance(this.x, this.y, this.destX, this.destY);
    if (absDist < 50) {
      // We're pretty close to the destination
      this.destX = Random.getRandom(Micro.worldToPix(this.map.width)) + 8;
      this.destY = Random.getRandom(Micro.worldToPix(this.map.height)) + 8;
    }

    if (disasterManager.enableDisasters) {
      var explode = false;

      var spriteList = this.spriteManager.getSpriteList();
      for (var i = 0; i < spriteList.length; i++) {
        var s = spriteList[i];

        //if (s.frame === 0 || s === sprite) continue;
        if (s.frame === 0 ) continue;

        if ((s.type === Micro.SPRITE_HELICOPTER ||
             s.type === Micro.SPRITE_AIRPLANE) &&
              Micro.checkSpriteCollision(this, s)) {
          s.explodeSprite(messageManager);
          explode = true;
        }
      }

      if (explode)
        this.explodeSprite(messageManager);
    }

    this.x += this.xDelta[frame];
    this.y += this.yDelta[frame];

    if (this.spriteNotInBounds()) this.frame = 0;
  };


Micro.AirplaneSprite.prototype.explodeSprite = function(messageManager) {
    this.frame = 0;
    this.spriteManager.makeExplosionAt(this.x, this.y);
    messageManager.sendMessage(Messages.PLANE_CRASHED);
};


  // Metadata for image loading
  /*Object.defineProperties(AirplaneSprite,
    {ID: Micro.makeConstantDescriptor(3),
     width: Micro.makeConstantDescriptor(48),
     frames: Micro.makeConstantDescriptor(11)});

*/
