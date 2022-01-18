import { Traffic } from '../Traffic.js';
import { ControlSignals } from './ControlSignals.js'
import { Rect } from '../geom/Rect.js'

export class Intersection {

    constructor( rect ) {

        this.rect = rect;
        this.key = this.rect.key()
        this.id = Traffic.uniqueId('intersection');
        this.roads = [];
        this.inRoads = [];
        this.controlSignals = new ControlSignals( this );
        
    }

    copy( intersection ) {

        this.rect = intersection.rect.clone();
        return this;

        /*var result;
        intersection.rect = intersection.rect.clone()
        result = Object.create( Intersection.prototype );
        Traffic.extend( result, intersection );
        result.roads = [];
        result.inRoads = [];
        result.controlSignals = new ControlSignals( result );
        return result;*/

    }

    toJSON() {

        return { id: this.id, rect: this.rect };

    }

    update() {

        let i, n =0;
        for( i in this.roads ){ this.roads[i].update(); n++ }
        for( i in this.inRoads ){ this.inRoads[i].update(); n++ }
        console.log( 'update', n )

    }
}