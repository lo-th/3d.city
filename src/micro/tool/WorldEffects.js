/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Tiles } from '../Tile.js';


export class WorldEffects {

    constructor ( map ) {

        this._map = map;
        this._data = {};
    }

    toKey (x, y) {
        return [x, y].join(',');
    }

    fromKey (k) {
        k = k.split(',');
        return {x: k[0] - 0, y: k[1] - 0};
    }

    clear () {
        this._data = [];
    }

    getTile (x, y) {
        let key = this.toKey(x, y);
        let tile = this._data[key];
        if ( tile === undefined ) tile = this._map.getTile(x, y);
        return tile;
    }

    getTileValue (x, y) {
        return this.getTile(x, y).getValue();
    }

    setTile ( x, y, value, flags ) {

        if (flags !== undefined && value.isTile ) throw new Error('Flags supplied with already defined tile');
        if (flags === undefined && !value.isTile ) value = new Tiles(value);
        else if (flags !== undefined) value = new Tiles(value, flags);
        let key = this.toKey( x, y );
        this._data[key] = value;
    }

    apply () {
        let keys = Object.keys(this._data);
        for ( let i = 0, l = keys.length; i < l; i++ ) {
            let coords = this.fromKey(keys[i]);
            this._map.setTo( coords, this._data[keys[i]] );
        }
    }

};