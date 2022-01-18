/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
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

Micro.BlockMap = function(gameMapWidth, gameMapHeight, blockSize, defaultValue) {
    var sourceMap;
    var sourceFunction;
    var id = function(x) {return x;};

    var e = new Error('Invalid parameters');
    if (arguments.length < 3) { 
        if (!(gameMapWidth instanceof Micro.BlockMap) || (arguments.length === 2 && typeof(gameMapHeight) !== 'function')) throw e;
        sourceMap = gameMapWidth;
        sourceFunction = gameMapHeight === undefined ? id : gameMapHeight;
    }

    if (sourceMap !== undefined) {
        gameMapWidth = sourceMap.gameMapWidth;
        gameMapHeight = sourceMap.gameMapHeight;
        blockSize = sourceMap.blockSize;
        defaultValue = sourceMap.defaultValue;
    }

    Object.defineProperties(this,
        {gameMapWidth: Micro.makeConstantDescriptor(gameMapWidth),
        gameMapHeight: Micro.makeConstantDescriptor(gameMapHeight),
        width: Micro.makeConstantDescriptor(Math.floor((gameMapWidth  + 1) / blockSize)),
        height: Micro.makeConstantDescriptor(Math.floor((gameMapHeight + 1)/ blockSize)),
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
        var maxY = Math.floor(this.gameMapHeight / this.blockSize) + 1;
        var maxX = Math.floor(this.gameMapWidth / this.blockSize) + 1;
        //for (var y = 0; y < maxY; y++) this.data[y] = Micro.makeArrayOf(maxX, this.defaultValue);
        var y = maxY;
        while(y--) this.data[y] = Micro.makeArrayOf(maxX, this.defaultValue);
    },
    copyFrom : function(sourceMap, sourceFn) {
        if (sourceMap.width !== this.width || sourceMap.height !== this.height || sourceMap.blockSize !== this.blockSize)
            console.warn('Copying from incompatible blockMap!');
        for (var y = 0, height = sourceMap.height; y < height; y++) {
            for (var x = 0, width = sourceMap.width; x < width; x++)
                this.data[width * y + x] = sourceFn(sourceMap.data[width * y + x]);
        }
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
