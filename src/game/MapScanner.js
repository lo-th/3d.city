/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.MapScanner = function (map, Sim) {
    this._map = map;
    this.mapHeight = this._map.height;
    this.mapWidth = this._map.width;
    this._actions = [];
    this.sim = Sim;
}

Micro.MapScanner.prototype = {
    constructor: Micro.MapScanner,
    addAction : function(criterion, action) {
        this._actions.push({criterion: criterion, action: action});
    },
    mapScan : function(startX, maxX, simData) {
        var y, x, i, id, tile, tileValue;
        y = this.mapHeight;
        while(y--){
           // x = maxX;
            //while(x==startX){
        //for (var y = 0; y < this._map.height; y++) {
            for (x = startX; x < maxX; x++) {
                
                id = x + y * this.mapWidth; //this._map._calculateIndex(x, y);
               // if (!(id in this._map.data)) this._map.data[id] = new Micro.Tile(this._map.defaultValue);
                tile = this._map.data[id] || new Micro.Tile();
                tileValue = tile.getValue();

                //tile = this._map.getTile(x, y);
                //tileValue = tile.getValue();

                //var tile = this._map.getTile(x, y);
                //var tileValue = tile.getValue();

                if (tileValue < Tile.FLOOD) continue;
                if (tile.isConductive()) this.sim.powerManager.setTilePower(x, y);
                if (tile.isZone()) {
                    this.sim.repairManager.checkTile(x, y, this.sim._cityTime);
                    //var powered = tile.isPowered();
                    if (tile.isPowered()){ this.sim.census.poweredZoneCount += 1; this._map.powerData[id] = 1; }
                    else {this.sim.census.unpoweredZoneCount += 1; this._map.powerData[id] = 2;// this.sim.needPower.push(id);
                     }
                }
                i = this._actions.length;
                while(i--){
                //for (var i = 0, l = this._actions.length; i < l; i++) {
                    var current = this._actions[i];
                    var callable = Micro.isCallable(current.criterion);
                    if (callable && current.criterion.call(null, tile)) {
                        current.action.call(null, this._map, x, y, null);
                        break;
                    } else if (!callable && current.criterion === tileValue) {
                        current.action.call(null, this._map, x, y, null);
                        break;
                    }
                }
            }
        }
    }
}
