/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.RepairManager = function (map) {
    this._map = map;
    this._actions = [];
}

Micro.RepairManager.prototype = {
    constructor: Micro.RepairManager,
    addAction : function(criterion, period, zoneSize) {
        this._actions.push({criterion: criterion, period: period, zoneSize: zoneSize});
    },
    repairZone : function(x, y, zoneSize) {
        var centre = this._map.getTileValue(x, y);
        var tileValue = centre - zoneSize - 2;
        for (var yy = -1; yy < zoneSize - 1; yy++) {
            for (var xx = -1; xx < zoneSize - 1; xx++) {
                tileValue++;

                var current = this._map.getTile(x + xx, y + yy);
                if (current.isZone() || current.isAnimated())
                  continue;

                var currentValue = current.getValue();
                if (currentValue < Tile.RUBBLE || currentValue >= Tile.ROADBASE)
                  this._map.setTo(x + xx, y + yy, new Micro.Tile(tileValue, Tile.CONDBIT | Tile.BURNBIT));
            }
        }
    },
    checkTile : function(x, y, cityTime) {
        for (var i = 0, l = this._actions.length; i < l; i++) {
            var current = this._actions[i];
            var period = current.period;
          
            if ((cityTime & period) !== 0) continue;

            var tile = this._map.getTile(x, y);
            var tileValue = tile.getValue();

            var callable = Micro.isCallable(current.criterion);
            if (callable && current.criterion.call(null, tile)) this.repairZone(x, y, current.zoneSize);
            else if (!callable && current.criterion === tileValue) this.repairZone(x, y, current.zoneSize);
        }
    }
}
