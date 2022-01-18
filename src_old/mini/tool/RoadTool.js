/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.RoadTool = function (map) {
    Micro.BaseToolConnector.call( this );
    this.init(10, map, true, true);
}

Micro.RoadTool.prototype = Object.create( Micro.BaseToolConnector.prototype );

Micro.RoadTool.prototype.layRoad = function(x, y) {
    this.doAutoBulldoze(x, y);
    var tile = this._worldEffects.getTileValue(x, y);
    var cost = 10;

    switch (tile) {
        case Tile.DIRT: this._worldEffects.setTile(x, y, Tile.ROADS, Tile.BULLBIT | Tile.BURNBIT); break;
        case Tile.RIVER:
        case Tile.REDGE:
        case Tile.CHANNEL:
            cost = 50;
            if (x < this._map.width - 1) {
                tile = this._worldEffects.getTileValue(x + 1, y);
                tile = Micro.normalizeRoad(tile);

                if (tile === Tile.VRAILROAD || tile === Tile.HBRIDGE || (tile >= Tile.ROADS && tile <= Tile.HROADPOWER)) {
                    this._worldEffects.setTile(x, y, Tile.HBRIDGE, Tile.BULLBIT);
                    break;
                }
            }
            if (x > 0) {
                tile = this._worldEffects.getTileValue(x - 1, y);
                tile = Micro.normalizeRoad(tile);

                if (tile === Tile.VRAILROAD || tile === Tile.HBRIDGE || (tile >= Tile.ROADS && tile <= Tile.INTERSECTION)) {
                    this._worldEffects.setTile(x, y, Tile.HBRIDGE, Tile.BULLBIT);
                    break;
                }
            }
            if (y < this._map.height - 1) {
                tile = this._worldEffects.getTileValue(x, y + 1);
                tile = Micro.normalizeRoad(tile);

                if (tile === Tile.HRAILROAD || tile === Tile.VROADPOWER || (tile >= Tile.VBRIDGE && tile <= Tile.INTERSECTION)) {
                    this._worldEffects.setTile(x, y, Tile.VBRIDGE, Tile.BULLBIT);
                    break;
                }
            }
            if (y > 0) {
                tile = this._worldEffects.getTileValue(x, y - 1);
                tile = Micro.normalizeRoad(tile);

                if (tile === Tile.HRAILROAD || tile === Tile.VROADPOWER || (tile >= Tile.VBRIDGE && tile <= Tile.INTERSECTION)) {
                    this._worldEffects.setTile(x, y, Tile.VBRIDGE, Tile.BULLBIT);
                    break;
                }
            }
            return this.TOOLRESULT_FAILED;

        case Tile.LHPOWER: this._worldEffects.setTile(x, y, Tile.VROADPOWER | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
        case Tile.LVPOWER: this._worldEffects.setTile(x, y, Tile.HROADPOWER | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT); break;
        case Tile.LHRAIL: this._worldEffects.setTile(x, y, Tile.HRAILROAD | Tile.BURNBIT | Tile.BULLBIT); break;
        case Tile.LVRAIL: this._worldEffects.setTile(x, y, Tile.VRAILROAD | Tile.BURNBIT | Tile.BULLBIT); break;
        default: return this.TOOLRESULT_FAILED;
    }

    this.addCost(cost);
    this.checkZoneConnections(x, y);
    return this.TOOLRESULT_OK;
};

Micro.RoadTool.prototype.doTool = function(x, y, messageManager, blockMaps) {
    this.result = this.layRoad(x, y);
};