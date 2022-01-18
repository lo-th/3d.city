import { Traffic } from '../Traffic.js';
import { Trajectory } from './Trajectory.js';


export class Car {

    constructor( lane, position ) {

		this.type = Traffic.rand(Traffic.TYPE_OF_CARS.length-1);

	    this.id = Traffic.uniqueId('car');
	    this.color = (300 + 240 * Traffic.random() | 0) % 360;
	    this._speed = 0;
	    
	    this.width = Traffic.TYPE_OF_CARS[this.type].w*Traffic.settings.carScale;
	    this.length = Traffic.TYPE_OF_CARS[this.type].l*Traffic.settings.carScale;
	    this.maxSpeed = 30*Traffic.settings.carSpeed;
	    if( Traffic.TYPE_OF_CARS[this.type].maxSpeed ) this.maxSpeed = Traffic.TYPE_OF_CARS[this.type].maxSpeed*Traffic.settings.carSpeed;
	    // minimal space between two car !!
	    this.s0 = 2 * Traffic.settings.carScale;
	    // minimal space before intersection
	    this.s1 = 1 * Traffic.settings.carScale;

	    this.timeHeadway = 1.5*Traffic.settings.carSpeed;
	    this.maxAcceleration = 1*Traffic.settings.carSpeed;
	    this.maxDeceleration = 3*Traffic.settings.carSpeed;

	    this.mid = Traffic.settings.gridSize*0.5;

	    this.trajectory = new Trajectory( this, lane, position );
	    this.alive = true;
	    this.preferedLane = null;

	    this.toLongStop = 0;

	}

	get pos() {

		let p = this.coords
		return { x:p.x-this.mid, y:p.y-this.mid };

	}

	get coords() {

		return this.trajectory.coords;

	}

	get speed() {

		return this._speed;

	}

	set speed( value ) {

		this._speed = Traffic.clamp( value, 0, this.maxSpeed );

	}

	get direction() {

		return this.trajectory.direction;

	}

    release() {

    	return this.trajectory.release();

    }

    getAcceleration() {

	    let a, b, breakGap, busyRoadCoeff, coeff, deltaSpeed, distanceGap, distanceToNextCar, freeRoadCoeff, intersectionCoeff, nextCarDistance, safeDistance, safeIntersectionDistance, timeGap, _ref;
	    nextCarDistance = this.trajectory.nextCarDistance;
	    distanceToNextCar = Traffic.max(nextCarDistance.distance, 0);
	    a = this.maxAcceleration;
	    b = this.maxDeceleration;
	    deltaSpeed = (this.speed - ((_ref = nextCarDistance.car) != null ? _ref.speed : void 0)) || 0;
	    freeRoadCoeff = Traffic.pow(this.speed / this.maxSpeed, 4);
	    distanceGap = this.s0;
	    timeGap = this.speed * this.timeHeadway;
	    breakGap = this.speed * deltaSpeed / (2 * Traffic.sqrt(a * b));
	    safeDistance = (distanceGap + timeGap + breakGap);
	    busyRoadCoeff = Traffic.pow(safeDistance / distanceToNextCar, 2);
	    safeIntersectionDistance = this.s1 + timeGap + Traffic.pow(this.speed, 2) / (2 * b);
	    intersectionCoeff = Traffic.pow(safeIntersectionDistance / this.trajectory.distanceToStopLine, 2);
	    coeff = 1 - freeRoadCoeff - busyRoadCoeff - intersectionCoeff;
	    return this.maxAcceleration * coeff;

	}

	move( delta ) {

	    let acceleration, currentLane, preferedLane, step, turnNumber;
	    acceleration = this.getAcceleration();
	    this.speed += acceleration * delta;
	    if ( !this.trajectory.isChangingLanes && this.nextLane ) {
	        currentLane = this.trajectory.current.lane;
	        turnNumber = currentLane.getTurnDirection(this.nextLane);

	        switch (turnNumber) {
	            case 0: preferedLane = currentLane.leftmostAdjacent; break;
	            case 2: preferedLane = currentLane.rightmostAdjacent; break;
	            default: preferedLane = currentLane;
	        }

	        if ( preferedLane !== currentLane ) {
	            this.trajectory.changeLane(preferedLane);
	        }
	    }
	    step = this.speed * delta + 0.5 * acceleration * Traffic.pow(delta, 2);
	    // TODO: hacks, should have changed speed
	    if (this.trajectory.nextCarDistance.distance < step) { /*this.alive = false;*/ console.log('bad IDM');}
	    if (this.trajectory.timeToMakeTurn(step)) {
	        if (this.nextLane == null) return this.alive = false;
	    }


	    // bug with two car collision
	    if( this.trajectory.isChangingLanes ){
	    	if( step <= 0 ) this.toLongStop ++
	    	else this.toLongStop = 0;
	    	if ( this.toLongStop > 1000 ){ console.log('car is locked !!'); this.alive = false; }
	    }
	    
	    //
	    
	    this.trajectory.moveForward( step );

    }

    pickNextRoad() {

	    let currentLane, intersection, possibleRoads;
	    intersection = this.trajectory.nextIntersection;
	    currentLane = this.trajectory.current.lane;
	    possibleRoads = intersection.roads.filter(function(x) {
	      return x.target !== currentLane.road.source;
	    });
	    /*possibleRoads = Traffic.filter(function(x) {
	      return x.target !== currentLane.road.source;
	    }, intersection.roads);*/
	    if (possibleRoads.length === 0) return null;
	    return Traffic.sample(possibleRoads);

    }

    pickNextLane() {

	    let laneNumber, nextRoad, turnNumber;
	    if (this.nextLane) throw Error('next lane is already chosen');
	    this.nextLane = null;
	    nextRoad = this.pickNextRoad();
	    if (!nextRoad) return null;
	    turnNumber = this.trajectory.current.lane.road.getTurnDirection(nextRoad);
	    laneNumber = (function() {
	      switch (turnNumber) {
	        case 0: return nextRoad.lanesNumber - 1; break;
	        case 1: return Traffic.rand(0, nextRoad.lanesNumber - 1); break;
	        case 2: return 0; break;
	      }
	    })();
	    this.nextLane = nextRoad.lanes[laneNumber];
	    if (!this.nextLane) throw Error('can not pick next lane');
	    return this.nextLane;

    }

    popNextLane() {

	    let nextLane = this.nextLane;
	    this.nextLane = null;
	    this.preferedLane = null;
	    return nextLane;

    }

}