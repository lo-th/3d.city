Micro.toKey = function(x, y) {
    return [x, y].join(',');
}

Micro.TileHistory = function(){
    this.data = {};
}

Micro.TileHistory.prototype = {

    constructor: Micro.TileHistory,
    
    getTile : function(x, y) {
        var key = Micro.toKey(x, y);
        return this.data[key];
    },
    setTile : function(x, y, value) {
        var key = Micro.toKey(x, y);
        this.data[key] = value;
    }
}
