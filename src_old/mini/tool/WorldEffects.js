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
};

Micro.fromKey = function(k) {
    k = k.split(',');
    return {x: k[0] - 0, y: k[1] - 0};
};

Micro.WorldEffects = function (map) {
    this._map = map;
    this._data = {};
};

Micro.WorldEffects.prototype = {
    constructor: Micro.WorldEffects,
    clear : function() {
        this._data = [];
    },
    getTile : function(x, y) {
        var key = Micro.toKey(x, y);
        var tile = this._data[key];
        if (tile === undefined) tile = this._map.getTile(x, y);
        return tile;
    },
    getTileValue : function(x, y) {
        return this.getTile(x, y).getValue();
    },
    setTile : function(x, y, value, flags) {
        if (flags !== undefined && value instanceof Micro.Tile) throw new Error('Flags supplied with already defined tile');
        if (flags === undefined && !(value instanceof Micro.Tile)) value = new Micro.Tile(value);
        else if (flags !== undefined) value = new Micro.Tile(value, flags);
        var key = Micro.toKey(x, y);
        this._data[key] = value;
    },
    apply : function() {
        var keys = Object.keys(this._data);
        for (var i = 0, l = keys.length; i < l; i++) {
            var coords = Micro.fromKey(keys[i]);
            this._map.setTo(coords, this._data[keys[i]]);
        }
    }
};