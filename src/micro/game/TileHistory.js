/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

export class TileHistory {

    constructor () {

        this.clear();

    }

    clear () {

        this.data = {};

    }

    toKey ( x, y ) {

        return [x, y].join(',');

    }

    getTile ( x, y ) {

        let key = this.toKey( x, y );
        return this.data[key];

    }

    setTile ( x, y, value ) {

        let key = this.toKey( x, y );
        this.data[key] = value

    }

}