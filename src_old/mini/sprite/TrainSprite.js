/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 Micro.TrainSprite = function(map, spriteManager, x, y) {
    Micro.BaseSprite.call( this );
    this.init(Micro.SPRITE_TRAIN, map, spriteManager, x, y);
    this.width = 32;
    this.height = 32;
    this.xOffset = -16;
    this.yOffset = -16;
    this.frame = 1;
    this.dir = 4;

    this.tileDeltaX = [  0, 16, 0, -16];
    this.tileDeltaY = [-16, 0, 16, 0 ];
    this.xDelta = [  0, 4, 0, -4, 0];
    this.yDelta = [ -4, 0, 4, 0, 0];

    this.TrainPic2 = [ 1, 2, 1, 2, 5];

    // Frame values
    this.NORTHSOUTH = 1;
    this.EASTWEST = 2;
    this.NWSE = 3;
    this.NESW = 4;
    this.UNDERWATER = 5;

    // Direction values
    this.NORTH = 0;
    this.EAST = 1;
    this.SOUTH = 2;
    this.WEST = 3;
    this.CANTMOVE = 4;
  }

Micro.TrainSprite.prototype = Object.create( Micro.BaseSprite.prototype );
 // BaseSprite(TrainSprite);


  /*var tileDeltaX = [  0, 16, 0, -16];
  var tileDeltaY = [-16, 0, 16, 0 ];
  var xDelta = [  0, 4, 0, -4, 0];
  var yDelta = [ -4, 0, 4, 0, 0];

  var TrainPic2 = [ 1, 2, 1, 2, 5];

  // Frame values
  var NORTHSOUTH = 1;
  var EASTWEST = 2;
  var NWSE = 3;
  var NESW = 4;
  var UNDERWATER = 5;

  // Direction values
  var NORTH = 0;
  var EAST = 1;
  var SOUTH = 2;
  var WEST = 3;
  var CANTMOVE = 4;*/

  Micro.TrainSprite.prototype.move = function(spriteCycle, messageManager, disasterManager, blockMaps) {
    // Trains can only move in the 4 cardinal directions
    // Over the course of 4 frames, we move through a tile, so
    // ever fourth frame, we try to find a direction to move in
    // (excluding the opposite direction from the current direction
    // of travel). If there is no possible direction found, our direction
    // is set to CANTMOVE. (Thus, if we're in a dead end, we can start heading
    // backwards next time round). If we fail to find a destination after 2 attempts,
    // we die.

    if (this.frame === this.NWSE || this.frame === this.NESW)
      this.frame = this.TrainPic2[this.dir];

    this.x += this.xDelta[this.dir];
    this.y += this.yDelta[this.dir];

    // Find a new direction.
    if ((spriteCycle & 3) === 0) {
      // Choose a random starting point for our search
      var dir = Random.getRandom16() & 3;

      for (var i = dir; i < dir + 4; i++) {
        var dir2 = i & 3;

        if (this.dir !== this.CANTMOVE) {
          // Avoid the opposite direction
          if (dir2 === ((this.dir + 2) & 3))
              continue;
        }

        var tileValue = Micro.getTileValue(this.map, this.x + this.tileDeltaX[dir2], this.y + this.tileDeltaY[dir2]);

        if ((tileValue >= Tile.RAILBASE && tileValue <= Tile.LASTRAIL) ||
            tileValue === Tile.RAILVPOWERH || tileValue === Tile.RAILHPOWERV) {
          if (this.dir !== dir2 && this.dir !== this.CANTMOVE) {
            if (this.dir + dir2 === this.WEST)
              this.frame = this.NWSE;
            else
              this.frame = this.NESW;
          } else {
            this.frame = this.TrainPic2[dir2];
          }

          if (tileValue === Tile.HRAIL || tileValue === Tile.VRAIL)
            this.frame = this.UNDERWATER;

          this.dir = dir2;
          return;
        }
      }

      // Nowhere to go. Die.
      if (this.dir === this.CANTMOVE) {
        this.frame = 0;
        return;
      }

      // We didn't find a direction this time. We'll try the opposite
      // next time around
      this.dir = this.CANTMOVE;
    }
  };


  Micro.TrainSprite.prototype.explodeSprite = function(messageManager) {
    this.frame = 0;
    this.spriteManager.makeExplosionAt(this.x, this.y);
    messageManager.sendMessage(Messages.TRAIN_CRASHED);
  };


  // Metadata for image loading
 /* Object.defineProperties(Micro.TrainSprite,
    {ID: Micro.makeConstantDescriptor(1),
     width: Micro.makeConstantDescriptor(32),
     frames: Micro.makeConstantDescriptor(5)});*/


//return TrainSprite;
//});
