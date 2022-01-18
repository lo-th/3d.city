import { Traffic } from '../Traffic.js';
import { Segment } from '../geom/Segment.js'

export class Lane {

    constructor ( sourceSegment, targetSegment, road ) {

        this.sourceSegment = sourceSegment;
        this.targetSegment = targetSegment;
        this.road = road;
        this.leftAdjacent = null;
        this.rightAdjacent = null;
        this.leftmostAdjacent = null;
        this.rightmostAdjacent = null;
        this.carsPositions = {};
        this.update();

    }

    get sourceSideId() {

        return this.road.sourceSideId;

    }

    get targetSideId() {

        return this.road.targetSideId;

    }

    get isRightmost() {

        return this === this.rightmostAdjacent;

    }

    get isLeftmost() {

        return this === this.leftmostAdjacent;

    }

    get leftBorder() {

        return new Segment(this.sourceSegment.source, this.targetSegment.target);

    }

    get rightBorder() {

        return new Segment(this.sourceSegment.target, this.targetSegment.source);

    }

    toJSON( lane ) {

        var obj = Traffic.extend({}, this);
        delete obj.carsPositions;
        return obj;

    }

    update() {

        this.middleLine = new Segment( this.sourceSegment.center, this.targetSegment.center );
        this.length = this.middleLine.length;
        this.direction = this.middleLine.direction;

    }

    getTurnDirection( other ) {

        return this.road.getTurnDirection(other.road);

    }

    getDirection() {

       return this.direction;

    }

    getPoint( a ) {

        return this.middleLine.getPoint( a );

    }

    addCarPosition( carPosition ) {

        if (carPosition.id in this.carsPositions) throw Error('car is already here');
        this.carsPositions[carPosition.id] = carPosition;

    }

    removeCar( carPosition ) {

        if (!(carPosition.id in this.carsPositions)) throw Error('removing unknown car');
        delete this.carsPositions[carPosition.id];

    }

    getNext( carPosition ) {

        let bestDistance, distance, id, next, o;
        if (carPosition.lane !== this) throw Error('car is on other lane');
        next = null;
        bestDistance = Infinity;

        for ( id in this.carsPositions ) {
            o = this.carsPositions[id];
            distance = o.position - carPosition.position;
            if (!o.free && (0 < distance && distance < bestDistance)) {
                bestDistance = distance;
                next = o;
            }
        }
        return next;
        
    }

}
