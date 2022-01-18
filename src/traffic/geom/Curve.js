
import { Segment } from './Segment.js';

export class Curve {

    constructor ( _at_A, _at_B, _at_O, _at_Q ) {

        this.A = _at_A;
        this.B = _at_B;
        this.O = _at_O;
        this.Q = _at_Q;
        this.AB = new Segment(this.A, this.B);
        this.AO = new Segment(this.A, this.O);
        this.OQ = new Segment(this.O, this.Q);
        this.QB = new Segment(this.Q, this.B);
        this._length = null;
        
    }

    get length (){

        let i, point, pointsNumber, prevPoint, _i;
        if( this._length == null ) {
            pointsNumber = 10;
            prevPoint = null;
            this._length = 0;
            for (i = _i = 0; 0 <= pointsNumber ? _i <= pointsNumber : _i >= pointsNumber; i = 0 <= pointsNumber ? ++_i : --_i) {
                point = this.getPoint(i / pointsNumber);
                if( prevPoint ) this._length += point.subtract( prevPoint ).length; 
                prevPoint = point;
            }
        }
        return this._length;

    }

    getPoint ( a ) {
        let p0, p1, p2, r0, r1;
        p0 = this.AO.getPoint(a);
        p1 = this.OQ.getPoint(a);
        p2 = this.QB.getPoint(a);
        r0 = (new Segment(p0, p1)).getPoint(a);
        r1 = (new Segment(p1, p2)).getPoint(a);
        return (new Segment(r0, r1)).getPoint(a);
    }

    getDirection ( a ) {
        let p0, p1, p2, r0, r1;
        p0 = this.AO.getPoint(a);
        p1 = this.OQ.getPoint(a);
        p2 = this.QB.getPoint(a);
        r0 = (new Segment(p0, p1)).getPoint(a);
        r1 = (new Segment(p1, p2)).getPoint(a);
        return (new Segment(r0, r1)).direction;
    }
    
}