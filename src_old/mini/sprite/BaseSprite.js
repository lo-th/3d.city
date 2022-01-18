/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.BaseSprite = function(){}

Micro.BaseSprite.prototype = {
    constructor: Micro.BaseSprite,
    init : function(type, map, spriteManager, x, y) {
        this.type = type;
        this.map = map;
        this.spriteManager = spriteManager;
        this.x = x;
        this.y = y;
        this.origX = 0;
        this.origY = 0;
        this.destX = 0;
        this.destY = 0;
        this.count = 0;
        this.soundCount = 0;
        this.dir = 0;
        this.newDir = 0;
        this.step = 0;
        this.flag = 0;
        this.turn = 0;
        this.accel = 0;
        this.speed = 100;
    },
    getFileName : function() {
        return ['obj', this.type, '-', this.frame - 1].join('');
    },
    spriteNotInBounds : function() {
        var x = Micro.pixToWorld(this.x);
        var y = Micro.pixToWorld(this.y);

        return x < 0 || y < 0 || x >= this.map.width || y >= this.map.height;
    }
}