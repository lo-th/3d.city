/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { MiscUtils } from '../Micro.js';

export class BlockMap {

    constructor ( gameMapWidth, gameMapHeight, blockSize ) {

        if (gameMapWidth === undefined || gameMapHeight === undefined || blockSize === undefined) throw new Error('Invalid dimensions for block map')

        this.isBlockMap = true

        this.blockSize = blockSize;
        this.gameMapWidth = gameMapWidth;
        this.gameMapHeight = gameMapHeight;

        this.width = Math.floor((gameMapWidth + blockSize - 1) / blockSize)
        this.height = Math.floor((gameMapHeight + blockSize - 1) / blockSize)

        this.data = [];
        this.clear();

    }

    clear () {

        let x, y = this.height;
        while( y-- ){
            x = this.width;
            while( x-- ){
                this.data[ this.width * y + x ] = 0;
            }
        }

    }

    copyFrom ( sourceMap, sourceFn ) {

        if (sourceMap.width !== this.width || sourceMap.height !== this.height || sourceMap.blockSize !== this.blockSize) console.warn('Copying from incompatible blockMap!');
        let x, y, height = sourceMap.height, width = sourceMap.width
        for ( y = 0; y < height; y++) {
            for ( x = 0; x < width; x++){
                this.data[width * y + x] = sourceFn(sourceMap.data[width * y + x]);
            }
        }
    }

    get ( x, y ) {
        return this.data[ this.width * y + x ];
    }

    set ( x, y, value ) {
        this.data[ this.width * y + x ] = value;
    }

    toBlock ( num ) {
        return Math.floor( num / this.blockSize );
    }

    worldGet ( x, y ) { 
        return this.get( this.toBlock(x), this.toBlock(y) );
    }

    worldSet ( x, y, value ) {
        this.set( this.toBlock(x), this.toBlock(y), value );
    }
}
