/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

Micro.lerp = function (a, b, percent) { return a + (b - a) * percent; };
Micro.rand = function (a, b) { return Micro.lerp(a, b, Math.random()); };
Micro.randInt = function (a, b, p) { return Micro.lerp(a, b, Math.random()).toFixed(p || 0)*1; }
 
Micro.Random = function(){}

Micro.Random.prototype = {

    constructor: Micro.Random,

    getChance : function(chance) {
        return (this.getRandom16() & chance) === 0;
    },

    getERandom : function( max ) {
        var r1 = this.getRandom(max);
        var r2 = this.getRandom(max);
        return Math.min(r1, r2);
    },

    getRandom : function( max ) {
        //return Micro.randInt( 0, max );
        return Math.floor(Math.random() * (max + 1));
    },

    getRandom16 : function() {
        return this.getRandom(65535);
    },

    getRandom16Signed : function() {
        var value = this.getRandom16();
        if (value >= 32768) value = 32768 - value;
        return value;
    }

}

var Random = new Micro.Random();