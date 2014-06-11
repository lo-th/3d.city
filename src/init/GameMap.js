
Micro.GameMap = function(width, height, defaultValue){

    /*if (!(this instanceof Micro.GameMap)) return new Micro.GameMap(width, height, defaultValue);
    var e = new Error('Invalid parameter');
    if (arguments.length > 1 && typeof(width) === 'number' && (width < 1 || height < 1)) throw e;

    // Argument shuffling
    if (arguments.length === 0) {
      width = 120;
      height = 100;
      defaultValue = new Micro.Tile().getValue();
    } else if (arguments.length === 1) {
      if (typeof(width) === 'number') {
        // Default value
        defaultValue = width;
      } else {
        // Tile
        defaultValue = width.getValue();
      }
      width = 120;
      height = 100;
    } else if (arguments.length === 2) {
      defaultValue = new Micro.Tile().getValue();
    } else if (arguments.length === 3) {
      if (typeof(defaultValue) === 'object')
        defaultValue = defaultValue.getValue();
    }*/
    this.isIsland = false;
    this.Direction = new Micro.Direction();
    this.Position = new Micro.PositionMaker(width, height);
    this.width = width;
    this.height = height;
    /*Object.defineProperties(this,
      {width: new Micro.makeConstantDescriptor(width),
       height: new Micro.makeConstantDescriptor(height)});*/

    this.defaultValue = 0;//new Micro.Tile().getValue();//defaultValue;


    this.data = new Array(this.width*this.height);//[];

    this.tilesData = new M_ARRAY_TYPE(this.width*this.height);
    this.powerData = new M_ARRAY_TYPE(this.width*this.height);

    var i = this.width*this.height;
    while(i--){this.tilesData[i] = 0;}
    /*console.log(this.data.length)*/

    // Generally set externally
    this.cityCentreX = Math.floor(this.width * 0.5);
    this.cityCentreY = Math.floor(this.height * 0.5);
    this.pollutionMaxX = this.cityCentreX;
    this.pollutionMaxY = this.cityCentreY;
}

Micro.GameMap.prototype = {

    constructor: Micro.GameMap,
    /*genFull : function(){
        var i = this.data.length;
        while(i--){
            this.tilesData[i] = this.data[i].getValue();
        }
        return this.tilesData;
    },*/

    _calculateIndex : function(x, y) {
        return x + y * this.width;
    },
    testBounds : function(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    },
    getTile : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') { y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        return this.data[tileIndex];
    },
    getTileValue : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        return this.data[tileIndex].getValue();
    },
    getTileFlags : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y))  throw e;

        var tileIndex = this._calculateIndex(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        return this.data[tileIndex].getFlags();
    },
    getTiles : function(x, y, w, h) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var res = [];
        for (var a = y, ylim = y + h; a < ylim; a++) {
            res[a - y] = [];
            for (var b = x, xlim = x + w; b < xlim; b++) {
                var tileIndex = this._calculateIndex(b, a);
                if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
                res[a-y].push(this.data[tileIndex]);
            }
        }
        return res;
    },
    getTileValues : function(x, y, w, h) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y;  y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var res = [];
        for (var a = y, ylim = y + h; a < ylim; a++) {
            res[a - y] = [];
            for (var b = x, xlim = x + w; b < xlim; b++) {
                var tileIndex = this._calculateIndex(b, a);
                if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
                res[a-y].push(this.data[tileIndex].getValue());
            }
        }
        return res;
    },
    getTileFromMapOrDefault : function(pos, dir, defaultTile) {
        switch (dir) {
            case this.Direction.NORTH: 
                if (pos.y > 0) return this.getTileValue(pos.x, pos.y - 1);
                return defaultTile;
            case this.Direction.EAST:
                if (pos.x < this.width - 1) return this.getTileValue(pos.x + 1, pos.y);
                return defaultTile;
            case this.Direction.SOUTH:
                if (pos.y < this.height - 1) return this.getTileValue(pos.x, pos.y + 1);
                return defaultTile;
            case this.Direction.WEST:
                if (pos.x > 0) return this.getTileValue(pos.x - 1, pos.y);
                return defaultTile;
            default:
                return defaultTile;
        }
    },
    setTile : function(x, y, value, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { flags = value; value = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].set(value, flags);
        this.tilesData[tileIndex] = value;
    },
    setTo : function(x, y, tile) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (tile === undefined) { tile = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        this.data[tileIndex] = tile;
        this.tilesData[tileIndex] = tile.getValue();
    },
    setTileValue : function(x, y, value) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { value = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].setValue(value);
        this.tilesData[tileIndex] = value;
    },
    setTileFlags : function(x, y, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].setFlags(flags);
    },
    addTileFlags : function(x, y, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].addFlags(flags);
    },
    removeTileFlags : function(x, y, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].removeFlags(flags);
    },
    putZone : function(centreX, centreY, centreTile, size) {
        var e = new Error('Invalid parameter');

        if (!this.testBounds(centreX, centreY) || !this.testBounds(centreX - 1 + size, centreY - 1 + size)) throw e;

        var tile = centreTile - 1 - size;
        var startX = centreX - 1;
        var startY = centreY - 1;

        for (var y = startY; y < startY + size; y++) {
            for (var x = startX; x < startX + size; x++) {
                if (x === centreX && y === centreY) this.setTo(x, y, new Micro.Tile(tile, Tile.BNCNBIT | Tile.ZONEBIT));
                else this.setTo(x, y, new Micro.Tile(tile, Tile.BNCNBIT));
                tile += 1;
            }
        } 
    }
}
