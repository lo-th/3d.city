
Micro.ParkTool = function (map) {
    Micro.BaseTool.call( this );
    this.init(10, map, true);
}

Micro.ParkTool.prototype = Object.create( Micro.BaseTool.prototype );

Micro.ParkTool.prototype.doTool = function(x, y, messageManager, blockMaps) {
    var value = Random.getRandom(4);
    var tileFlags = Tile.BURNBIT | Tile.BULLBIT;
    var tileValue;

    if (value === 4) {
        tileValue = Tile.FOUNTAIN;
        tileFlags |= Tile.ANIMBIT;
    } else {
        tileValue = value + Tile.WOODS2;
    }

    this._worldEffects.setTile(x, y, tileValue, tileFlags);
    this.addCost(10);
    this.result = this.TOOLRESULT_OK;
}


//  return ParkTool;
//});
