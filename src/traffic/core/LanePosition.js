import { Traffic } from '../Traffic.js';

export class LanePosition {

    constructor ( car, lane, position ) {

        this.car = car;
        this.position = position;
        this.id = Traffic.uniqueId('laneposition');
        this.free = true;
        this._lane = lane;

    }

    get lane() {

        return this._lane;

    }

    set lane( value ) {

        this.release();
        this._lane = value;

    }

    get relativePosition() {

        return this.position / this.lane.length;

    }

    get nextCarDistance() {

        let frontPosition, next, rearPosition, result;
        next = this.getNext();
        if( next ) {
            rearPosition = next.position - next.car.length * 0.5;
            frontPosition = this.position + this.car.length * 0.5;
            return result = { car: next.car, distance: (rearPosition - frontPosition) };
        }
        return result = { car: null, distance: Infinity };

    }

    acquire() {

        let _ref;
        if (((_ref = this.lane) != null ? _ref.addCarPosition : void 0) != null) {
            this.free = false;
            return this.lane.addCarPosition(this);
        }

    }

    release() {

        let _ref;
        if (!this.free && ((_ref = this.lane) != null ? _ref.removeCar : void 0)) {
            this.free = true;
            return this.lane.removeCar(this);
        }

    }

    getNext() {

        if (this.lane && !this.free) return this.lane.getNext(this); 

    }

}