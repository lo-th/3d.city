/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

Micro.toKey = function(x, y) {
    return [x, y].join(',');
}

Micro.TileHistory = function(){
    this.clear();
}

Micro.TileHistory.prototype = {
    constructor: Micro.TileHistory,
    clear : function() {
        this.data = {};
    },
    getTile : function(x, y) {
        var key = Micro.toKey(x, y);
        return this.data[key];
    },
    setTile : function(x, y, value) {
        var key = Micro.toKey(x, y);
        this.data[key] = value;
    }
}