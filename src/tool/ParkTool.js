/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 
Micro.ParkTool = function (map) {
    Micro.BaseTool.call( this );
    this.init(10, map, true);
};

Micro.ParkTool.prototype = Object.create( Micro.BaseTool.prototype );

Micro.ParkTool.prototype.doTool = function(x, y, messageManager, blockMaps) {
    var tileValue = this._worldEffects.getTileValue(x, y);

    if (tileValue !== Tile.DIRT && !this.autoBulldoze) {
        // No Tile.DIRT and no bull-dozer => not buildable
        return this.TOOLRESULT_NEEDS_BULLDOZE;
    }

    if (tileValue !== Tile.TREEBASE) {
        // tilevalue cannot be auto-bulldozed
        return this.TOOLRESULT_NEEDS_BULLDOZE;
    }

    var value = Random.getRandom(4);
    var tileFlags = Tile.BURNBIT | Tile.BULLBIT;

    if (value === 4) {
        tileValue = Tile.FOUNTAIN;
        tileFlags |= Tile.ANIMBIT;
    } else {
        tileValue = value + Tile.WOODS2;
    }

    this._worldEffects.setTile(x, y, tileValue, tileFlags);
    this.addCost(10);
    this.result = this.TOOLRESULT_OK;
};