export class Segment {

    constructor( source, target ) {

        this.source = source;
        this.target = target;

    }

    get vector() {

        return this.target.subtract( this.source );

    }

    get length() {

        return this.vector.length;

    }

    get direction() {

        return this.vector.direction;

    }

    get center() {

        return this.getPoint(0.5);

    }

    split( n, reverse ) {

        let result = [], order = [], i = n;
        while( i-- ) order.push(i)
        if( !reverse ) order = order.reverse();
        for( let k in order ) result.push( this.subsegment(order[k] / n, (order[k] + 1) / n) )
        return result

    }

    getPoint( a ) {

        return this.source.add( this.vector.mult(a) );

    }

    subsegment( a, b ) {

        let offset = this.vector;
        let start = this.source.add( offset.mult(a) );
        let end = this.source.add( offset.mult(b) );
        return new Segment(start, end);

    }

}