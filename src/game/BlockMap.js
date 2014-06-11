


Micro.copyFrom = function(sourceMap, sourceFn) {
    var mapFn = function(elem) { return sourceFn(elem); };
    //for (var y = 0, l = sourceMap.data.length; y < l; y++) this.data[y] = sourceMap.data[y].map(mapFn);
    var i = sourceMap.data.length; while(i--) this.data[i] = sourceMap.data[i].map(mapFn);
}

Micro.makeArrayOf = function(length, value) {
    //var result = [];
    //var result = new M_ARRAY_TYPE(length);
    var result = new Array(length);
   //for (var a = 0; a < length; a++) result[a] = value;
    var i = length; while(i--) result[i] = value;
    return result;
}

Micro.BlockMap = function(mapWidth, mapHeight, blockSize, defaultValue) {
    var sourceMap;
    var sourceFunction;
    var id = function(x) {return x;};

    var e = new Error('Invalid parameters');
    if (arguments.length < 3) { 
        if (!(mapWidth instanceof Micro.BlockMap) || (arguments.length === 2 && typeof(mapHeight) !== 'function')) throw e;
        sourceMap = mapWidth;
        sourceFunction = mapHeight === undefined ? id : mapHeight;
    }

    if (sourceMap !== undefined) {
        mapWidth = sourceMap.width;
        mapHeight = sourceMap.height;
        blockSize = sourceMap.blockSize;
        defaultValue = sourceMap.defaultValue;
    }

    Object.defineProperties(this,
        {mapWidth: Micro.makeConstantDescriptor(mapWidth),
        mapHeight: Micro.makeConstantDescriptor(mapHeight),
        width: Micro.makeConstantDescriptor(Math.floor((mapWidth  + 1) / blockSize)),
        height: Micro.makeConstantDescriptor(Math.floor((mapHeight + 1)/ blockSize)),
        blockSize: Micro.makeConstantDescriptor(blockSize),
        defaultValue: Micro.makeConstantDescriptor(defaultValue)}
    );

    this.data = [];

    if (sourceMap) Micro.copyFrom.call(this, sourceMap, sourceFunction);
    else this.clear();
}

Micro.BlockMap.prototype = {

    constructor: Micro.BlockMap,

    clear : function() {
        var maxY = Math.floor(this.mapHeight / this.blockSize) + 1;
        var maxX = Math.floor(this.mapWidth / this.blockSize) + 1;
        //for (var y = 0; y < maxY; y++) this.data[y] = Micro.makeArrayOf(maxX, this.defaultValue);
        var y = maxY;
        while(y--) this.data[y] = Micro.makeArrayOf(maxX, this.defaultValue);
    },
    get : function(x, y) {
        return this.data[y][x];
    },
    set : function(x, y, value) {
        this.data[y][x] = value;
    },
    toBlock : function(num) {
        return Math.floor(num / this.blockSize);
    },
    worldGet : function(x, y) { 
        return this.get(this.toBlock(x), this.toBlock(y));
    },
    worldSet : function(x, y, value) {
        this.set(this.toBlock(x), this.toBlock(y), value);
    }
}
