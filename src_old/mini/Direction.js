/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Direction = function(){};

Micro.Direction.prototype = {
    constructor: Micro.Direction,
    "INVALID": -1,
    "NORTH": 0,
    "NORTHEAST": 1,
    "EAST": 2,
    "SOUTHEAST": 3,
    "SOUTH": 4,
    "SOUTHWEST": 5,
    "WEST": 6,
    "NORTHWEST": 7,
    "BEGIN": 0,
    "END": 8,
    // Move direction clockwise by 45 degrees. No bounds checking
    // i.e. result could be >= END. Has no effect on INVALID. Undefined
    // when dir >= END
    increment45: function(dir, count) {
        if (arguments.length < 1) throw new TypeError();
        if (dir == this.INVALID) return dir;
        if (!count && count !== 0) count = 1;
        return dir + count;
    },
    // Move direction clockwise by 90 degrees. No bounds checking
    // i.e. result could be >= END. Has no effect on INVALID. Undefined
    // when dir >= END
    increment90: function(dir) {
        if (arguments.length < 1) throw new TypeError();
        return this.increment45(dir, 2);
    },
    // Move direction clockwise by 45 degrees, taking the direction modulo 8
    // if necessary to force it into valid bounds. Has no effect on INVALID.
    rotate45: function(dir, count) {
        if (arguments.length < 1) throw new TypeError();
        if (dir == this.INVALID) return dir;
        if (!count && count !== 0) count = 1;
        return ((dir - this.NORTH + count) & 7) + this.NORTH;
    },
    // Move direction clockwise by 90 degrees, taking the direction modulo 8
    // if necessary to force it into valid bounds. Has no effect on INVALID.
    rotate90: function(dir) {
        if (arguments.length < 1) throw new TypeError();
        return this.rotate45(dir, 2);
    },
    // Move direction clockwise by 180 degrees, taking the direction modulo 8
    // if necessary to force it into valid bounds. Has no effect on INVALID.
    rotate180: function(dir) {
        if (arguments.length < 1) throw new TypeError();
        return this.rotate45(dir, 4);
    }
}

var Direction = new Micro.Direction();
