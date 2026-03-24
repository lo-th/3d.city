/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * switch to ES6 & 3D by lo-th
 *
 */
import { Micro } from '../Micro.js';
import { Tiles, Tile } from '../Tile.js'; 

import { Direction } from '../math/Direction.js';
//import { PositionMaker } from '../math/PositionMaker.js';

export class GameMap {

    constructor ( width = 128, height = 128, defaultValue ) {

        this.isIsland = false;
        this.pp = []

        //this.Position = new PositionMaker( width, height ); // !! find better way

        this.width = width;
        this.height = height;
        
        this.fsize = this.width * this.height;

        this.defaultValue = new Tiles().getValue();

        this.data = [];//new Array(this.fsize);
        this.tilesData = new Micro.M_ARRAY_TYPE(this.fsize);
        this.powerData = new Micro.M_ARRAY_TYPE(this.fsize);

        let i = this.fsize;
        while(i--){
            this.data[i] = new Tiles( this.defaultValue );
            this.tilesData[i] = this.defaultValue;
        }
        /*console.log(this.data.length)*/

        // Generally set externally
        this.cityCentreX = Math.floor(this.width * 0.5);
        this.cityCentreY = Math.floor(this.height * 0.5);
        this.pollutionMaxX = this.cityCentreX;
        this.pollutionMaxY = this.cityCentreY;

        this.powerChange = false;

        this.layer = [];
        this.resetLayer();


        this.makePP()

    }

    // 3D LAYER

    upLayer ( id, value, x, y ){

        if(value>=Tile.TINYEXP && value<=Tile.TINYEXPLAST) value -= (860-35)// explosion decal

        //if(value>=Tile.HBRDG0 && value<=Tile.HBRDG3) value -= 832+32
        //if(value>=Tile.VBRDG0 && value<=Tile.VBRDG3) value -= 832+32

        this.tilesData[ id ] = value;

        //if( this.goodValue(value) ){
        this.layer[this.findLayer(x,y)] = 1;

    }

    resetLayer () {

        let i = 64;
        while( i-- ) this.layer[i] = 0;
        
    }

    findLayer ( x, y ){
        let cx = Math.floor(x/16)
        let cy = Math.floor(y/16)
        return cx+(cy*8)
    }

    goodValue ( v ){

        if( v === 0 )  return true //  dirt
        else if( v > 1 && v < 240 )  return true // water edge tree
        //else if( v > 1 && v < 44 )  return true // water edge tree
        //if( v > 43 && v < 48 )  return true // rubble
       // else if( v > 43 && v < 240 ) return true // road wire rail
        return false

    }

    //  

    makePP () {

        let x = this.width, y, n=0;

        let pp = []

        while( x-- ){
            y = this.height
            while( y-- ){
                pp[n] = [x,y] 
                n++
            }
        }

        this.pp = pp;

    }

    // change power statue for 3d
    powered ( o ) {

        let id = o.id || this.getId( o.x, o.y )
        this.powerData[id] = o.v;
        this.powerChange = true; 

    }

    /*makePos (){
 
        return new PositionMaker( this.width, this.height );

    }*/

    save ( saveData ) {

        let i=0, lng;

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

    }

    load ( saveData ) {

        let x, y, lng, i = 0, map = saveData.map, tiles = saveData.tileValue;

        // GAME PROPS
        lng = Micro.GameMapProps.length;
        while( i < lng ){
            this[Micro.GameMapProps[i]] = saveData[Micro.GameMapProps[i]];
            i++;
        }

        // MAP DATA

        let isOld = map[0].value !== undefined ? true : false
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

    }

    testBounds (x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    getId ( x, y ){
        return x + y * this.width
    }

    getTile ( x, y, newTile ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') { y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let width = this.width;
        let height = this.height;

        if (x < 0 || y < 0 || x >= width || y >= height) {
            console.warn('getTile called with bad bounds', x, y);
            return new Tiles(Tile.TILE_INVALID);
        }
        let tileIndex = this.getId( x, y );
        let tile = this.data[tileIndex];

        //var tileIndex = this._calculateIndex(x, y);
        // Return the original tile if we're not given a tile to fill
        if (!newTile) return tile;

        newTile.set(tile);
        return tile;

        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        //return this.data[tileIndex];
    }

    getTileValue( x, y ) {
        let e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let tileIndex = this.getId(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        return this.data[tileIndex].getValue();
    }

    getTileFlags( x, y ) {
        let e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        // Argument-shuffling
        if (typeof(x) === 'object') {  y = x.y; x = x.x; }
        if (!this.testBounds(x, y))  throw e;

        let tileIndex = this.getId(x, y);

        if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        return this.data[tileIndex].getFlags();
    }

    getTiles( x, y, w, h ) {

        let e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let res = [];
        for (let a = y, ylim = y + h; a < ylim; a++) {
            res[a - y] = [];
            for (let b = x, xlim = x + w; b < xlim; b++) {
                let tileIndex = this.getId(b, a);
                //if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
                res[a-y].push(this.data[tileIndex]);
            }
        }
        return res;

    }

    getTileValues( x, y, w, h, result ) {

        result = result || [];
        let e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        // Argument-shuffling
        if (arguments.length === 3) { h = w; w = y;  y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;
        let width = this.width;
        let height = this.height;

        // Result is stored in row-major order
        for (let a = y, ylim = y + h; a < ylim; a++) {
            for (let b = x, xlim = x + w; b < xlim; b++) {
                if (a < 0 || b < 0 || a >= height || b >= width) {
                    result[(a - y) * w + (b - x)] = Tile.TILE_INVALID;
                    continue;
                }
                let tileIndex =  b + a * width;
                //result[(a - y) * w + (b - x)] = this._data[tileIndex].getRawValue();
                result[(a - y) * w + (b - x)] = this.data[tileIndex].getRawValue();
            }
        }

        return result;

    }

    getTileFromMapOrDefault( pos, dir, defaultTile ) {

        switch (dir) {
            case Direction.NORTH: 
                if (pos.y > 0) return this.getTileValue(pos.x, pos.y - 1);
                return defaultTile;
            case Direction.EAST:
                if (pos.x < this.width - 1) return this.getTileValue(pos.x + 1, pos.y);
                return defaultTile;
            case Direction.SOUTH:
                if (pos.y < this.height - 1) return this.getTileValue(pos.x, pos.y + 1);
                return defaultTile;
            case Direction.WEST:
                if (pos.x > 0) return this.getTileValue(pos.x - 1, pos.y);
                return defaultTile;
            default:
                return defaultTile;
        }

    }

    //----------------------

    testOld ( id, value ){

        if( this.data[ id ].getValue() !== value ) return true
        return false

    }

    setTile( x, y, value, flags ) {

        //var e = new Error('Invalid parameter');
        //if (arguments.length < 3) throw e;
        // Argument-shuffling
        if ( arguments.length === 3 ) { flags = value; value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        let isNew = this.testOld( id, value )

        this.data[ id ].set( value, flags );

        if( isNew ) this.upLayer( id, value, x, y )

    }

    setTo( x, y, tile ) {

        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if ( tile === undefined ) { tile = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        let value = tile.getValue()
        let isNew = this.testOld( id, value )

        this.data[ id ] = tile;
       // this.data[ id ].setValue(value);

        if( isNew ) this.upLayer( id, value, x, y )

    }

    setTileValue( x, y, value ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        let isNew = this.testOld( id, value )
        //if (!(tileIndex in this.data)) this.data[tileIndex] = new Tiles(this.defaultValue);
        
        this.data[ id ].setValue( value );
        
        if( isNew ) this.upLayer( id, value, x, y )

    }

    setPaintValue( x, y, value ) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { value = y; y = x.y; x = x.x; }
        //if (!this.testBounds(x, y)) throw e;

        let id = this.getId( x, y );
        this.upLayer( id, value, x, y )

    }

    setTileFlags( x, y, flags ) {

        let e = new Error('Invalid flag parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let id = this.getId(x, y);
        this.data[id].setFlags(flags);

    }

    addTileFlags( x, y, flags ) {

        let e = new Error('Invalid flag parameter');
        if (arguments.length < 2) throw e;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw e;

        let id = this.getId(x, y);
        this.data[id].addFlags(flags);

    }

    removeTileFlags( x, y, flags ) {

        if (arguments.length < 2) throw new Error('GameMap removeTileFlags called with too few arguments');;
        // Argument-shuffling
        if (arguments.length === 2) { flags = y; y = x.y; x = x.x; }
        if (!this.testBounds(x, y)) throw new Error('GameMap removeTileFlags called with invalid bounds'+ x + ', ' + y);

        let id = this.getId( x, y );
        this.data[id].removeFlags(flags);

        ///this.upLayer( id, this.data[id].getValue(), x, y )

    }

    putZone( centreX, centreY, centreTile, size ) {

        if (!this.testBounds(centreX, centreY) || !this.testBounds(centreX - 1 + size, centreY - 1 + size)) throw new Error('GameMap putZone called with invalid bounds');

        let tile = centreTile - 1 - size;
        let startX = centreX - 1;
        let startY = centreY - 1;
        let x, y;

        for ( y = startY; y < startY + size; y++) {
            for ( x = startX; x < startX + size; x++) {
                if (x === centreX && y === centreY) this.setTo(x, y, new Tiles(tile, Tile.BNCNBIT | Tile.ZONEBIT));
                else this.setTo(x, y, new Tiles(tile, Tile.BNCNBIT));
                tile += 1;
            }
        } 
    }
}
