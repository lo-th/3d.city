import { Traffic } from '../Traffic.js';
import { Lane } from './Lane.js'

export class Road {

    constructor ( source, target ) {

        this.source = source;
        this.target = target;
        this.id = Traffic.uniqueId('road');
        this.lanes = [];
        this.lanesNumber = null;
        this.update();

    }

    get length() {

        return this.targetSide.target.subtract(this.sourceSide.source).length;

    }

    get leftmostLane() {

        return this.lanes[this.lanesNumber - 1];

    }

    get rightmostLane() {

        return this.lanes[0];

    }

    copy( road ) {

        let result;
        result = Object.create(Road.prototype);
        Traffic.extend.extend(result, road);
        if (result.lanes == null) result.lanes = [];
        return result;

    }

    toJSON() {

        return { id: this.id, source: this.source.id, target: this.target.id };

    }

    getTurnDirection( other ) {

        let side1, side2, turnNumber;
        if (this.target !== other.source) throw Error('invalid roads');
        side1 = this.targetSideId;
        side2 = other.sourceSideId;
        return turnNumber = (side2 - side1 - 1 + 8) % 4;
        
    }

    update() {

        let i, sourceSplits, targetSplits, _base, _i, _j, _ref, _ref1, _results;
        if (!(this.source && this.target)) throw Error('incomplete road');
        this.sourceSideId = this.source.rect.getSectorId(this.target.rect.center());
        this.sourceSide = this.source.rect.getSide(this.sourceSideId).subsegment(0.5, 1.0);
        this.targetSideId = this.target.rect.getSectorId(this.source.rect.center());
        this.targetSide = this.target.rect.getSide(this.targetSideId).subsegment(0, 0.5);
        this.lanesNumber = Traffic.min(this.sourceSide.length, this.targetSide.length) | 0;
        this.lanesNumber = Traffic.max(2, this.lanesNumber / Traffic.settings.gridSize | 0);
        sourceSplits = this.sourceSide.split(this.lanesNumber, true);
        targetSplits = this.targetSide.split(this.lanesNumber);
        if ((this.lanes == null) || this.lanes.length < this.lanesNumber) {
            if (this.lanes == null) this.lanes = [];
            for (i = _i = 0, _ref = this.lanesNumber - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                if ((_base = this.lanes)[i] == null) _base[i] = new Lane(sourceSplits[i], targetSplits[i], this);
            }
        }
        _results = [];
        for (i = _j = 0, _ref1 = this.lanesNumber - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            this.lanes[i].sourceSegment = sourceSplits[i];
            this.lanes[i].targetSegment = targetSplits[i];
            this.lanes[i].leftAdjacent = this.lanes[i + 1];
            this.lanes[i].rightAdjacent = this.lanes[i - 1];
            this.lanes[i].leftmostAdjacent = this.lanes[this.lanesNumber - 1];
            this.lanes[i].rightmostAdjacent = this.lanes[0];
            _results.push(this.lanes[i].update());
        }

        //this.source.update();
        //this.target.update();
        //return _results;

        //console.log( 'update road', _results.length )

    }

}