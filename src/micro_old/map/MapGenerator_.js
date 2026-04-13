/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 * switch to ES6 by lo-th
 *
 */

import { Micro } from '../Micro.js';
import { Tile, Tiles } from '../Tile.js';

import { Direction } from '../math/Direction.js';
import { Position } from '../math/Position.js';
import { math } from '../math/math.js';

import { GameMap } from './GameMap.js';

export class MapGenerator {

    constructor () {

        this.SRMatrix = [
            [ 0, 0, 3, 3, 0, 0 ],
            [ 0, 3, 2, 2, 3, 0 ],
            [ 3, 2, 2, 2, 2, 3 ],
            [ 3, 2, 2, 2, 2, 3 ],
            [ 0, 3, 2, 2, 3, 0 ],
            [ 0, 0, 3, 3, 0, 0 ]
        ];
        this.BRMatrix = [
            [ 0, 0, 0, 3, 3, 3, 0, 0, 0 ],
            [ 0, 0, 3, 2, 2, 2, 3, 0, 0 ],
            [ 0, 3, 2, 2, 2, 2, 2, 3, 0 ],
            [ 3, 2, 2, 2, 2, 2, 2, 2, 3 ],
            [ 3, 2, 2, 2, 4, 2, 2, 2, 3 ],
            [ 3, 2, 2, 2, 2, 2, 2, 2, 3 ],
            [ 0, 3, 2, 2, 2, 2, 2, 3, 0 ],
            [ 0, 0, 3, 2, 2, 2, 3, 0, 0 ],
            [ 0, 0, 0, 3, 3, 3, 0, 0, 0 ]
        ];

        this.riverEdge = [
            13, 13, 17, 15,
            5 , 2 , 19, 17,
            9 , 11, 2 , 13,
            7 , 9 , 5 , 2
        ];

        this.treeTable = [
            0,  0,  0,  34,
            0,  0,  36, 35,
            0,  32, 0,  33,
            30, 31, 29, 37
        ];

    }

    construct( w, h, debug = false ) {

        Micro.TERRAIN_TREE_LEVEL = -1;
        Micro.TERRAIN_LAKE_LEVEL = -1;
        Micro.TERRAIN_CURVE_LEVEL = -1;
        Micro.ISLAND_RADIUS = 18;

        if(debug) console.time("start newmap");

        this.map = new GameMap( w || Micro.MAP_WIDTH, h || Micro.MAP_HEIGHT );
        //this.map.makePP()

        Micro.TERRAIN_CREATE_ISLAND = math.getRandom(2) - 1;

        if ( Micro.TERRAIN_CREATE_ISLAND < 0 ) {
            if (math.getRandom(100) < 10) {
                this.makeIsland();
                return this.map;
            }
        }

        if ( Micro.TERRAIN_CREATE_ISLAND === 1 ) this.makeNakedIsland();
        else this.clearMap();


        // Lay a river.
        if ( Micro.TERRAIN_CURVE_LEVEL !== 0 ) {
            let terrainXStart = 40 + math.getRandom( this.map.width - 79 );
            let terrainYStart = 33 + math.getRandom( this.map.height - 66 );
            let terrainPos = new Position( terrainXStart, terrainYStart );
            this.doRivers( terrainPos );
        }

        // Lay a few lakes.
        if ( Micro.TERRAIN_LAKE_LEVEL !== 0 ) this.makeLakes();

        this.smoothRiver();
        this.cleanBorder();

        // And add trees.
        if ( Micro.TERRAIN_TREE_LEVEL !== 0 ) this.doTrees();

        if( debug ) console.timeEnd("start newmap");

        return this.map;

    }

    cleanBorder() {

        let map = this.map;
        if( map.isIsland ) return
        let x, y, l, r, s;

        for ( x = 0; x < map.width; x ++) {

            l = x + 1; if(l>map.width-1) l = map.width-1;
            r = x - 1; if(r<0) r = 0;
            s = 1 
            if( map.getTileValue( x, s ) + map.getTileValue( l, s ) + map.getTileValue( r, s ) === 6 ) map.setTile( x, 0, Tile.RIVER, 0);
            s = map.height-2 
            if( map.getTileValue( x, s ) + map.getTileValue( l, s ) + map.getTileValue( r, s ) === 6 ) map.setTile( x, map.height-1, Tile.RIVER, 0);

        }

        for ( y = 0; y < map.height; y ++) {

            l = y + 1; if(l>map.height-1) l = map.height-1;
            r = y - 1; if(r<0) r = 0;
            s = 1 
            if( map.getTileValue( s, y ) + map.getTileValue( s, l ) + map.getTileValue( s, r ) === 6 ) map.setTile( 0, y, Tile.RIVER, 0);
            s = map.width-2 
            if( map.getTileValue( s, y ) + map.getTileValue( s, l ) + map.getTileValue( s, r ) === 6 ) map.setTile( map.width-1, y, Tile.RIVER, 0);

        }

    }

    clearMap() {

        let map = this.map

        map.pp.forEach( v => {//function ( v ) {

            map.setTile( v[0], v[1], Tile.DIRT, 0);

        })

    }

    clearUnnatural() {

        let map = this.map, value

        map.pp.forEach( v => {

            value = map.getTileValue( v[0], v[1] );
            if ( value > Tile.WOODS ) map.setTile( v[0], v[1], Tile.DIRT, 0);

        })

    }

    makeNakedIsland() {

        let map = this.map;
        let terrainIslandRadius = Micro.ISLAND_RADIUS;
        let x, y, mapX, mapY;

        map.isIsland = true;

        map.pp.forEach( v => {

            x = v[0]
            y = v[1]

            if ((x < 5) || (x >= map.width - 5) || (y < 5) || (y >= map.height - 5)) map.setTile(x, y, Tile.RIVER, 0);
            else map.setTile( x, y, Tile.DIRT, 0 );

        })

        for ( x = 0; x < map.width - 5; x += 2) {
            mapY = math.getERandom(terrainIslandRadius);
            this.plopBRiver({ x:x, y:mapY });

            mapY = (map.height - 10) - math.getERandom(terrainIslandRadius);
            this.plopBRiver({ x:x, y:mapY })
            this.plopSRiver({ x:x, y:0 });
            this.plopSRiver({ x:x, y:map.height - 6 });
        }
        for ( y = 0; y < map.height - 5; y += 2 ) {
            mapX = math.getERandom( terrainIslandRadius );
            this.plopBRiver({ x:mapX, y:y });

            mapX = map.width - 10 - math.getERandom(terrainIslandRadius);
            this.plopBRiver({ x:mapX, y:y });
            this.plopSRiver({ x:0, y:y });
            this.plopSRiver({ x:map.width - 6, y:y });
        }
        
    }

    makeIsland() {

        this.makeNakedIsland();
        this.smoothRiver();
        this.doTrees();
        
    }

    makeLakes() {

        let x, y;
        let numLakes = Micro.TERRAIN_LAKE_LEVEL < 0 ? math.getRandom(10) : Micro.TERRAIN_LAKE_LEVEL * 0.5;

        while (numLakes > 0) {
            x = math.getRandom( this.map.width - 21) + 10;
            y = math.getRandom( this.map.height - 20) + 10;
            this.makeSingleLake( new Position(x, y) );
            numLakes--;
        }

    }

    makeSingleLake( pos ) {

        let numPlops = math.getRandom(12) + 2, plopPos;
        while ( numPlops > 0 ) {
            plopPos = new Position(pos, math.getRandom(12) - 6, math.getRandom(12) - 6);
            if ( math.getRandom(4) ) this.plopSRiver(plopPos);
            else this.plopBRiver( plopPos );
            numPlops--;
        }

    }

    treeSplash( x, y ) {

        let numTrees = Micro.TERRAIN_TREE_LEVEL < 0 ? math.getRandom(150) + 50 : math.getRandom(100 + (Micro.TERRAIN_TREE_LEVEL * 2)) + 50;
        let treePos = new Position(x, y), dir;

        while (numTrees > 0) {

            dir = Direction.NORTH + math.getRandom(7);
            treePos.move( dir );

            // XXX Should use the fact that positions return success/failure for moves
            if (!this.map.testBounds(treePos.x, treePos.y)) return;
            if ( this.map.getTileValue(treePos) === Tile.DIRT ) this.map.setTile(treePos, Tile.WOODS, Tile.BLBNBIT);
            
            numTrees--;
        }
    }

    doTrees() {

        let i = Micro.TERRAIN_TREE_LEVEL < 0 ? math.getRandom(100) + 50 : Micro.TERRAIN_TREE_LEVEL + 3;

        while(i--){
            this.treeSplash( math.getRandom( this.map.width - 1), math.getRandom( this.map.height - 1) );
        }

        /*for (var x = 0; x < i; x++) {
            var xloc = math.getRandom(this.map.width - 1);
            var yloc = math.getRandom(this.map.height - 1);
            this.treeSplash( xloc, yloc );
        }*/

        this.smoothTrees();
        this.smoothTrees();

    }

    smoothRiver() {

        let map = this.map;
        let riverEdge = this.riverEdge;
        let x, y, z, xt, yt, tt, bitIndex, temp;
        let dx = [-1,  0,  1,  0];
        let dy = [0,  1,  0, -1];

        map.pp.forEach( v => {

            x = v[0]
            y = v[1]

            if ( map.getTileValue(x, y) === Tile.REDGE ) {

                bitIndex = 0;

                for ( z = 0; z < 4; z++) {
                    bitIndex = bitIndex << 1;
                    xt = x + dx[z];
                    yt = y + dy[z];
                    if( map.testBounds( xt, yt ) ){
                        tt = map.getTileValue( xt, yt );
                        if( tt !== Tile.DIRT && ( tt < Tile.WOODS_LOW || tt > Tile.WOODS_HIGH )  ) bitIndex++;
                    }
                }

                temp = riverEdge[bitIndex & 15];
                if ( temp !== Tile.RIVER && math.getRandom(1) ) temp++;

                //map.setTileValue(x, y, temp, 0);

                map.setTile( x, y, temp, Tile.BULLBIT ) // or we can't make bridge !!!  
           
            }
        })
    }

    isTree( value ) {

        return value >= Tile.WOODS_LOW && value <= Tile.WOODS_HIGH;

    }

    smoothTrees() {

        let map = this.map;
        let x, y;

        map.pp.forEach( v => {

            x = v[0]
            y = v[1]
            if (this.isTree(map.getTileValue(x, y)))  this.smoothTreesAt( x, y, false );

        })

    }

    smoothTreesAt( x, y, preserve ) {

        let map = this.map;
        let dx = [-1,  0,  1,  0 ];
        let dy = [ 0,  1,  0, -1 ];
        
        if (!this.isTree(this.map.getTileValue(x, y))) return;

        let i, xTemp, yTemp, temp, bitIndex = 0;

        for ( i = 0; i < 4; i++) {
            bitIndex = bitIndex << 1;
            xTemp = x + dx[i];
            yTemp = y + dy[i];
            if (map.testBounds(xTemp, yTemp) && this.isTree(map.getTileValue(xTemp, yTemp))) bitIndex++;
        }
        
        temp = this.treeTable[ bitIndex & 15 ];
        if (temp) {
            if (temp !== Tile.WOODS) {
                if ((x + y) & 1) temp -= 8;
            }
            if(temp>28 && temp<38) temp-=8
            map.setTile(x, y, temp, Tile.BLBNBIT);
        } else {
            if (!preserve){ 
                if(temp>28 && temp<38) temp-=8
                map.setTileValue(x, y, temp, 0)
            };
        }

    }

    doRivers( terrainPos ) {

        let riverDir = Direction.NORTH + math.getRandom(3) * 2;
        this.doBRiver( terrainPos, riverDir, riverDir );

        riverDir = Direction.rotate180(riverDir);
        let terrainDir = this.doBRiver( terrainPos, riverDir, riverDir );

        riverDir = Direction.NORTH + math.getRandom(3) * 2;
        this.doSRiver( terrainPos, riverDir, terrainDir );

    }

    doBRiver( riverPos, riverDir, terrainDir) {

        let rate1, rate2;

        if (Micro.TERRAIN_CURVE_LEVEL < 0) {
            rate1 = 100;
            rate2 = 200;
        } else {
            rate1 = Micro.TERRAIN_CURVE_LEVEL + 10;
            rate2 = Micro.TERRAIN_CURVE_LEVEL + 100;
        }
        let pos = new Position(riverPos);
        while ( this.map.testBounds( pos.x + 4, pos.y + 4 ) ) {
            this.plopBRiver(pos);
            if (math.getRandom(rate1+1) < 10) {
                terrainDir = riverDir;
            } else {
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir);
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir, 7);
            }
            pos.move(terrainDir);
        }
        return terrainDir;

    }

    doSRiver(riverPos, riverDir, terrainDir) {

        let rate1, rate2;
        if (Micro.TERRAIN_CURVE_LEVEL < 0) {
            rate1 = 100;
            rate2 = 200;
        } else {
            rate1 = Micro.TERRAIN_CURVE_LEVEL + 10;
            rate2 = Micro.TERRAIN_CURVE_LEVEL + 100;
        }
        let pos = new Position(riverPos);
        while ( this.map.testBounds(pos.x + 3, pos.y + 3) ) {
            this.plopSRiver(pos);
            if (math.getRandom(rate1+1) < 10) {
                terrainDir = riverDir;
            } else {
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir);
                if (math.getRandom(rate2+1) > 90) terrainDir = Direction.rotate45(terrainDir, 7);
            }
            pos.move(terrainDir);
        }
        return terrainDir;

    }

    putOnMap( newVal, x, y ) {

        if (newVal === 0) return;
        if (!this.map.testBounds(x, y)) return;

        let tmp = this.map.getTileValue(x, y);

        if (tmp !== Tile.DIRT) {
            if (tmp === Tile.RIVER && newVal !== Tile.CHANNEL) return;
            if (tmp === Tile.CHANNEL) return;
        }

        this.map.setTile(x, y, newVal, 0);

    }

    plopBRiver( pos ) {

        let x = 9, y

        while(x--){
            y = 9;
            while(y--){
                this.putOnMap( this.BRMatrix[y][x], pos.x + x, pos.y + y );
            }
        }

    }

    plopSRiver( pos ) {

        let x = 6, y

        while(x--){
            y = 6;
            while(y--){
                this.putOnMap( this.SRMatrix[y][x], pos.x + x, pos.y + y );
            }
        }

    }

    smoothWater() {

        let map = this.map, tile, pos, dir, x, y, makeRiver;

        map.pp.forEach( v => {

            x = v[0]
            y = v[1]

            tile = map.getTileValue(x, y);

            if (tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
                pos = new Position(x, y);
                for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                    tile = map.getTileFromMap(pos, dir, Tile.WATER_LOW);

                    // If nearest object is not water:
                    if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
                        // set river edge
                        map.setTileValue(x, y, Tile.REDGE, 0);
                        break; // Continue with next tile
                    }
                }
            }
        })

        map.pp.forEach( v => {

            x = v[0]
            y = v[1]

            tile = map.getTileValue(x, y);
            if (tile !== Tile.CHANNEL && tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
                makeRiver = true;
                pos = new Position(x, y);
                for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                    tile = map.getTileFromMap(pos, dir, Tile.WATER_LOW);
                    if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
                        makeRiver = false;
                        break;
                    }
                }
                if (makeRiver) map.setTileValue(x, y, Tile.RIVER, 0);
            }
        })

        map.pp.forEach( v => {

            x = v[0]
            y = v[1]

            tile = map.getTileValue(x, y);
            if (tile >= Tile.WOODS_LOW && tile <= Tile.WOODS_HIGH) {
                pos = new Position(x, y);
                for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                    tile = map.getTileFromMap(pos, dir, TILE_INVALID);
                    if (tile === Tile.RIVER || tile === Tile.CHANNEL) {
                        map.setTileValue(x, y, Tile.REDGE, 0);
                        break;
                    }
                }
            }
        })
    }


}