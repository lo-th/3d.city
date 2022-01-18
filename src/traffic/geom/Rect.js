
import { Traffic } from '../Traffic.js';
import { Point } from './Point.js';
import { Segment } from './Segment.js';

export class Rect {

    constructor( x = 0, y = 0, width = 0, height = 0 ) {

        this.x = x;
        this.y = y;
        this._width = width;
        this._height = height;

    }

    copy( v ) {

        this.x = v.x;
        this.y = v.y;
        this._width = v._width;
        this._height = v._height;
        return this;

    }

    clone() {

        return new this.constructor( this.x, this.y, this._width, this._height );

    }

    toJSON() {

        return Traffic.extend({}, this);

    }

    key(){

        return [this.x, this.y].join(',');

    }

    area() {

        return this.width() * this.height();

    }

    left( left ) {

        if( left != null ) this.x = left;
        return this.x;

    }

    right( right ) {

        if( right != null ) this.x = right - this.width();
        return this.x + this.width();

    }

    width( width ) {

        if( width != null ) this._width = width;
        return this._width;

    }

    top( top ) {

        if (top != null) this.y = top;
        return this.y;

    }

    bottom( bottom ) {

        if( bottom != null ) this.y = bottom - this.height();
        return this.y + this.height();

    }

    height( height ) {

        if (height != null)  this._height = height;
        return this._height;

    }

    pos() {

        return new Point( this.x, this.y );
        
    }

    center( center ) {

        if (center != null) {
            this.x = center.x - this.width() * 0.5;
            this.y = center.y - this.height() * 0.5;
        }
        return new Point( this.x + this.width() * 0.5, this.y + this.height() * 0.5 );

    }

    containsPoint( point ) {

        return  (this.left() <= point.x && point.x <= this.right()) && (this.top() <= point.y && point.y <= this.bottom())

    }

    containsRect( rect ) {

        return this.left() <= rect.left() && rect.right() <= this.right() && this.top() <= rect.top() && rect.bottom() <= this.bottom();

    }

    getVertices() {

        return [
            new Point(this.left(), this.top()), 
            new Point(this.right(), this.top()), 
            new Point(this.right(), this.bottom()), 
            new Point(this.left(), this.bottom())
        ];

    }

    getSide( i ) {

        let vertices = this.getVertices();
        return new Segment(vertices[i], vertices[(i + 1) % 4]);

    }

    getSectorId( point ) {

        let offset = point.subtract( this.center() );
        if (offset.y <= 0 && Traffic.abs(offset.x) <= Traffic.abs(offset.y)) return 0;
        if (offset.x >= 0 && Traffic.abs(offset.x) >= Traffic.abs(offset.y)) return 1;
        if (offset.y >= 0 && Traffic.abs(offset.x) <= Traffic.abs(offset.y)) return 2;
        if (offset.x <= 0 && Traffic.abs(offset.x) >= Traffic.abs(offset.y)) return 3;

       /* if (offset.y <= 0 && (offset.x) <= (offset.y)) return 0;
        if (offset.x >= 0 && (offset.x) >= (offset.y)) return 1;
        if (offset.y >= 0 && (offset.x) <= (offset.y)) return 2;
        if (offset.x <= 0 && (offset.x) >= (offset.y)) return 3;*/
        throw Error('algorithm error');

    }

    getSector( point ) {

        return this.getSide(this.getSectorId(point));

    }

}