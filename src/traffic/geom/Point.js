import { Traffic } from '../Traffic.js';


export class Point {

    constructor( x = 0, y = 0 ) {

        this.x = x;
        this.y = y;
        
    }

    get length() {

        return Traffic.sqrt(this.x * this.x + this.y * this.y);

    }

    get direction() {

        return Traffic.atan2(this.y, this.x);

    }

    get normalized() {

        return new this.constructor(this.x / this.length, this.y / this.length);

    }

    toKey(){

        return [this.x, this.y].join(',');

    }

    add( o ) {

        return new this.constructor(this.x + o.x, this.y + o.y);

    }

    subtract( o ) {

        return new this.constructor(this.x - o.x, this.y - o.y);

    }

    mult( k ) {

        return new this.constructor(this.x * k, this.y * k);

    }

    divide( k ) {

        return new this.constructor(this.x / k, this.y / k);

    }

    distanceTo( v ) {

        return Traffic.sqrt( this.distanceToSquared( v ) );

    }

    distanceToSquared( v ) {

        const dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;

    }


}