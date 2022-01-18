/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { Direction } from './Direction.js';
import { Micro } from '../Micro.js';

export class Position {

    constructor ( pos, deltaX, deltaY ) {

        this.isPosition = true;
        this.width = Micro.MAP_WIDTH;
        this.height = Micro.MAP_HEIGHT;
        this.x = 0;
        this.y = 0;


        this.validDirs = [Direction.NORTH, Direction.NORTHEAST, Direction.EAST, Direction.SOUTHEAST,
                        Direction.SOUTH, Direction.SOUTHWEST, Direction.WEST, Direction.NORTHWEST,
                        Direction.INVALID];


        if (arguments.length === 0) return this;

        if (arguments.length === 1 && !pos.isPosition ) throw new Error('Position constructor called with invalid pos ' + pos);

        if (arguments.length === 3 && !pos.isPosition ) throw new Error('Position constructor called with invalid pos ' + pos);

        if (arguments.length === 3 && !(this.isNumber(deltaX) && this.isNumber(deltaY))) throw new Error('Position constructor called with invalid deltas ' + deltaX + ' ' + deltaY);

        if (arguments.length === 2 && this.isNumber(pos) && !this.isNumber(deltaX)) throw new Error('Position constructor called with invalid y coordinate ' + pos + ' ' + deltaX);

        if (arguments.length === 2 && (pos.isPosition) && !(this.isNumber(deltaX) && this.isDirection(deltaX))) throw new Error('Position constructor called with invalid direction ' + pos + ' ' + deltaX);

        if (arguments.length === 2 && !this.isNumber(pos) && !pos.isPosition) throw new Error('Position constructor called with bad existing position ' + pos + ' ' + deltaX);
        

        // This overloaded constructor accepts the following parameters
        // Position(x, y) - positive integral coordinates
        // Position(Position p) - assign from existing position
        // Position(Position p, Direction d) - assign from existing position and move in Direction d
        // Position(Position p, deltaX, deltaY) - assign from p and then adjust x/y coordinates
        // Check for the possible combinations of arguments, and error out for invalid arguments
        //if ((arguments.length === 1 || arguments.length === 3) && !(pos instanceof Position)) throw new Error('Invalid parameter');
        //if (arguments.length === 3 && (!isNumber(deltaX) || !isNumber(deltaY))) throw new Error('Invalid parameter');
        //if (arguments.length === 2 && ((isNumber(pos) && !isNumber(deltaX)) || (pos instanceof Position && !isNumber(deltaX)) || (pos instanceof Position && isNumber(deltaX) && !isDirection(deltaX)) || (!isNumber(pos) && !(pos instanceof Position)))) throw new Error('Invalid parameter');
        let moveOK = true;

        if (this.isNumber(pos)) {
            // Coordinates
            this.x = pos;
            this.y = deltaX;
        } else {
            this.set( pos );
            if (arguments.length === 2) moveOK = this.move( deltaX );
            else if (arguments.length === 3) {
                this.x += deltaX;
                this.y += deltaY;
            }
        }

        if ( this.x < 0 || this.x >= this.width || this.y < 0 || this.y >= this.height || !moveOK) throw new Error('Invalid parameter');
        
    }

    isNumber ( v ) {
        return !isNaN(v)
        //return typeof(v) === 'number';
    }

    isDirection ( param ) {
         return this.isNumber(param) && this.validDirs.indexOf(param) !== -1;
    }

    
    set ( from ) {
        this.x = from.x;
        this.y = from.y;
    }

    toString () {
        return '(' + this.x + ', ' + this.y + ')';
    }

    toInt () {
        return this.y * this.width + this.x;
    }

    move ( dir ) {

        let up = false;
        switch (dir) {
            case Direction.INVALID: return true;//up = true; break;
            case Direction.NORTH: if (this.y > 0) { this.y--; up = true; } break;
            case Direction.NORTHEAST: if (this.y > 0 && this.x < this.width - 1) { this.y--; this.x++; up = true; } break;
            case Direction.EAST: if (this.x < this.width - 1) { this.x++; up = true; } break;
            case Direction.SOUTHEAST: if (this.y < this.height - 1 && this.x < this.width - 1) { this.x++; this.y++; up = true; } break;
            case Direction.SOUTH: if (this.y < this.height - 1) { this.y++; up = true; } break;
            case Direction.SOUTHWEST: if (this.y < this.height - 1 && this.x > 0) { this.y++; this.x--; up = true; } break;
            case Direction.WEST: if (this.x > 0) { this.x--; up = true; } break;
            case Direction.NORTHWEST: if (this.y > 0 && this.x > 0) { this.y--; this.x--; up = true; } break;
        }
        return up;

    }
};