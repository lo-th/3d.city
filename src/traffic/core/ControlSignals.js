import { Traffic } from '../Traffic.js';

export class ControlSignals {

    constructor ( intersection ) {

        this.intersection = intersection;
        this.onTick = Traffic.binding(this.onTick, this);
        this.flipMultiplier = Traffic.random();
        this.phaseOffset = 100 * Traffic.random();
        this.time = this.phaseOffset;
        this.stateNum = 0;
        this.states = [['L', '', 'L', ''], ['FR', '', 'FR', ''], ['', 'L', '', 'L'], ['', 'FR', '', 'FR']];

    }

    get flipInterval() {

        return (0.1 + 0.05 * this.flipMultiplier) * Traffic.settings.lightsFlipInterval;

    }

    get state() {

        let i, len, results;
        let stringState = this.states[this.stateNum % this.states.length];
        if (this.intersection.roads.length <= 2) { stringState = ['LFR', 'LFR', 'LFR', 'LFR']; }
        results = [];
        for (i = 0, len = stringState.length; i < len; i++) {
            results.push( this._decode( stringState[i] ) );
        }
        return results;
        
    }

    copy( controlSignals, intersection ) {

        var result;
        if (controlSignals == null) {
          return new ControlSignals(intersection);
        }
        result = Object.create(ControlSignals.prototype);
        result.flipMultiplier = controlSignals.flipMultiplier;
        result.time = result.phaseOffset = controlSignals.phaseOffset;
        result.stateNum = 0;
        result.intersection = intersection;
        return result;

    }

    toJSON() {

        return {
            flipMultiplier: this.flipMultiplier,
            phaseOffset: this.phaseOffset
        }

    }

    _decode(str) {

        let state = [0, 0, 0];
        if (Traffic.indexOf.call(str, 'L') >= 0) state[0] = 1;
        if (Traffic.indexOf.call(str, 'F') >= 0) state[1] = 1;
        if (Traffic.indexOf.call(str, 'R') >= 0) state[2] = 1;
        return state;

    }

    flip() {

        this.stateNum += 1;

    }

    onTick( delta ) {

        this.time += delta;
        if ( this.time > this.flipInterval ) {
            this.flip();
            this.time -= this.flipInterval;
        }

    }

}
