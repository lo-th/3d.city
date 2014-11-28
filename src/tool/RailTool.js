/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.RailTool = function (map) {
    Micro.BaseToolConnector.call( this );
    this.init(20, map, true, true);
}

Micro.RailTool.prototype = Object.create( Micro.BaseToolConnector.prototype );

Micro.RailTool.prototype.layRail = function(x, y) {
    this.doAutoBulldoze(x, y);
    var cost = 20;

    var tile = this._worldEffects.getTileValue(x, y);
    tile = Micro.normalizeRoad(tile);

    switch (tile) {
        case Tile.DIRT: this._worldEffects.setTile(x, y, Tile.LHRAIL | Tile.BULLBIT | Tile.BURNBIT); break;

        case Tile.RIVER:
        case Tile.REDGE:
        case Tile.CHANNEL:
            cost = 100;
            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTileValue(x + 1, y);
                tile = Micro.normalizeRoad(tile);
                if (tile == Tile.RAILHPOWERV || tile == Tile.HRAIL || (tile >= Tile.LHRAIL && tile <= Tile.HRAILROAD)) {
                    this._worldEffects.setTile(x, y, Tile.HRAIL, Tile.BULLBIT);
                    break;
                }
            }
            if (x > 0) {
                tile = this._worldEffects.getTileValue(x - 1, y);
                tile = Micro.normalizeRoad(tile);
                if (tile == Tile.RAILHPOWERV || tile == Tile.HRAIL || (tile > Tile.VRAIL && tile < Tile.VRAILROAD)) {
                    this._worldEffects.setTile(x, y, Tile.HRAIL, Tile.BULLBIT);
                    break;
                }
            }
            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTileValue(x, y + 1);
                tile = Micro.normalizeRoad(tile);
                if (tile == Tile.RAILVPOWERH || tile == Tile.VRAILROAD || (tile > Tile.HRAIL && tile < Tile.HRAILROAD)) {
                    this._worldEffects.setTile(x, y, Tile.VRAIL, Tile.BULLBIT);
                    break;
                }
            }
            if (y > 0) {
                tile = this._worldEffects.getTileValue(x, y - 1);
                tile = Micro.normalizeRoad(tile);
                if (tile == Tile.RAILVPOWERH || tile == Tile.VRAILROAD || (tile > Tile.HRAIL && tile < Tile.HRAILROAD)) {
                    this._worldEffects.setTile(x, y, Tile.VRAIL, Tile.BULLBIT);
                    break;
                }
            }
            return this.TOOLRESULT_FAILED;

        case Tile.LHPOWER: this._worldEffects.setTile(x, y, Tile.RAILVPOWERH, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
        case Tile.LVPOWER: this._worldEffects.setTile(x, y, Tile.RAILHPOWERV, Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
        case Tile.ROADS: this._worldEffects.setTile(x, y, Tile.VRAILROAD, Tile.BURNBIT | Tile.BULLBIT); break;
        case Tile.ROADS2: this._worldEffects.setTile(x, y, Tile.HRAILROAD, Tile.BURNBIT | Tile.BULLBIT); break;
        default: return this.TOOLRESULT_FAILED;
    }

    this.addCost(cost);
    this.checkZoneConnections(x, y);
    return this.TOOLRESULT_OK;
};

Micro.RailTool.prototype.doTool = function(x, y, messageManager, blockMaps) {
    this.result = this.layRail(x, y);
};
