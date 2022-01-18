/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.GameMapProps = ['cityCentreX', 'cityCentreY', 'pollutionMaxX', 'pollutionMaxY', 'width', 'height'];

Micro.GameMap = function( width, height, defaultValue ){

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
    }
*/

    this.isIsland = false;
    this.Direction = new Micro.Direction();
    this.Position = new Micro.PositionMaker( width, height );
    this.width = width;
    this.height = height;
    this.fsize = this.width * this.height;
    /*Object.defineProperties(this,
      {width: new Micro.makeConstantDescriptor(width),
       height: new Micro.makeConstantDescriptor(height)});*/

    this.defaultValue = new Micro.Tile().getValue();


    this.data = [];//new Array(this.fsize);
    this.tilesData = new M_ARRAY_TYPE(this.fsize);
    this.powerData = new M_ARRAY_TYPE(this.fsize);

    var i = this.fsize;
    while(i--){
        this.data[i] = new Micro.Tile( this.defaultValue );
        this.tilesData[i] = this.defaultValue;
    }
    /*console.log(this.data.length)*/

    // Generally set externally
    this.cityCentreX = Math.floor(this.width * 0.5);
    this.cityCentreY = Math.floor(this.height * 0.5);
    this.pollutionMaxX = this.cityCentreX;
    this.pollutionMaxY = this.cityCentreY;

}

Micro.GameMap.prototype = {

    constructor: Micro.GameMap,

    save: function( saveData ) {

        var i=0, lng;

        // GAME PROPS
        lng = Micro.GameMapProps.length;
        while( i < lng ){
            saveData[Micro.GameMapProps[i]] = this[Micro.GameMapProps[i]];
            i++;
        }

        // MAP DATA
        //saveData.map = this.data.map(function(t) { return {value: t.getRawValue()}; });

        
        saveData.map = [];
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            saveData.map[i] = this.data[i].getRawValue();
            i++;
        }

        // TILES VALUES
        saveData.tileValue = [];
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            saveData.tileValue[i] = this.tilesData[i];
            i++;
        }


        //saveData.map = this.data.map(function(t) { return {value: t.getRawValue()};});
        //saveData.map = this.data.map(function(t) { return {value: t.getRawValue()}; });
        //saveData.map = [];//this.tilesData.map(function(t) { return {value: t };});
        /*saveData.tileValue = [];
        var j = this.fsize;
        while( j-- ) saveData.tileValue[j] = this.tilesData[j];
        */
        /*saveData.power = [];
        var j = this.fsize;
        while(j--){
           // saveData.map[j] = this.tilesData[j];
            saveData.power[j] = this.powerData[j];
        }*/
    },

    load: function( saveData ) {



        var x, y, lng, i = 0, map = saveData.map, tiles = saveData.tileValue;

        // GAME PROPS
        lng = Micro.GameMapProps.length;
        while( i < lng ){
            this[Micro.GameMapProps[i]] = saveData[Micro.GameMapProps[i]];
            i++;
        }

        // MAP DATA

        var isOld = map[0].value !== undefined ? true : false
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            x = i % this.width;
            y = Math.floor(i / this.width);
            if( isOld ) this.setTileValue( x, y, map[i].value );
            else this.setTileValue( x, y, map[i] );
            i++;
        }

        // TILES VALUES
        i = 0;
        lng = this.fsize;
        while( i < lng ){
            this.tilesData[i] = tiles[i];
            i++;
        }


        /*for (var i = 0, l = Micro.GameMapProps.length; i < l; i++) this[Micro.GameMapProps[i]] = saveData[Micro.GameMapProps[i]];
        var map = saveData.map, value;
        for (i = 0, l = map.length; i < l; i++){
            this.setTileValue(i % this.width, Math.floor(i / this.width), map[i].value);
            //value = map[i] || 0;
            //this.setTileValue(i % this.width, Math.floor(i / this.width), map[i]);
            //this.data[i].setValue(value);
            //this.tilesData[i] = value;
        }

        for (i = 0, l = saveData.tileValue.length; i < l; i++) this.tilesData[i] = saveData.tileValue[i];*/
        /*
        var power = saveData.power;
        for (i = 0, l = power.length; i < l; i++) this.powerData[i] = power[i];
        */

    },

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

    getTile : function(x, y, newTile) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') { y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        var width = this.width;
        var height = this.height;

        if (x < 0 || y < 0 || x >= width || y >= height) {
            console.warn('getTile called with bad bounds', x, y);
            return new Tile(Tile.TILE_INVALID);
        }
        var tileIndex = x + y * width;
        var tile = this.data[tileIndex];

        //var tileIndex = this._calculateIndex(x, y);
        // Return the original tile if we're not given a tile to fill
        if (!newTile) return tile;

        newTile.set(tile);
        return tile;

        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        //return this.data[tileIndex];
    },

    getTileValue: function( x, y ) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        return this.data[tileIndex].getValue();
    },

    getTileFlags: function( x, y ) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y))  throw e;

        var tileIndex = this._calculateIndex(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        return this.data[tileIndex].getFlags();
    },

    getTiles: function( x, y, w, h ) {
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
                //if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
                res[a-y].push(this.data[tileIndex]);
            }
        }
        return res;
    },

    getTileValues: function(x, y, w, h, result) {
        result = result || [];
        var e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y;  y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;
        var width = this.width;
        var height = this.height;

        // Result is stored in row-major order
        for (var a = y, ylim = y + h; a < ylim; a++) {
            for (var b = x, xlim = x + w; b < xlim; b++) {
                if (a < 0 || b < 0 || a >= height || b >= width) {
                    result[(a - y) * w + (b - x)] = Tile.TILE_INVALID;
                    continue;
                }
                var tileIndex =  b + a * width;
                //result[(a - y) * w + (b - x)] = this._data[tileIndex].getRawValue();
                result[(a - y) * w + (b - x)] = this.data[tileIndex].getRawValue();
            }
        }

        //var res = [];
        /*for (var a = y, ylim = y + h; a < ylim; a++) {
            res[a - y] = [];
            for (var b = x, xlim = x + w; b < xlim; b++) {
                var tileIndex = this._calculateIndex(b, a);
                if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
                res[a-y].push(this.data[tileIndex].getValue());
            }
        }*/
        return result;
    },

    getTileFromMapOrDefault: function(pos, dir, defaultTile) {
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

    setTile: function(x, y, value, flags) {

        //var e = new Error('Invalid parameter');
        //if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { flags = value; value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        var id = this._calculateIndex( x, y );

        this.data[ id ].set( value, flags );
        this.tilesData[ id ] = value;

    },

    setTo: function( x, y, tile ) {

        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (tile === undefined) { tile = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        var id = this._calculateIndex( x, y );

        this.data[ id ] = tile;
        this.tilesData[ id ] = tile.getValue();

    },

    setTileValue: function( x, y, value ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        var id = this._calculateIndex( x, y );
        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        
        this.data[ id ].setValue( value );
        this.tilesData[ id ] = value;
    },

    setTileFlags: function(x, y, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].setFlags(flags);
    },

    addTileFlags: function(x, y, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].addFlags(flags);
    },

    removeTileFlags: function(x, y, flags) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        var tileIndex = this._calculateIndex(x, y);
        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Micro.Tile(this.defaultValue);
        this.data[tileIndex].removeFlags(flags);
    },

    putZone: function(centreX, centreY, centreTile, size) {

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
