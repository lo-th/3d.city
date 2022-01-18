import { Traffic } from '../Traffic.js';
import { Pool } from './Pool.js';
import { Intersection } from './Intersection.js';
import { Road } from './Road.js';
import { Car } from './Car.js';
import { Rect } from '../geom/Rect.js';
import { Point } from '../geom/Point.js';

export class TrafficWorld {

    constructor () {

        this.toRemove = [];
        this.onTick = Traffic.bind(this.onTick, this);
        this.minDistance = Traffic.settings.gridSize/5
        this.set();

    }

    get instantSpeed() {

        let speeds = Traffic.map( this.cars.all(), function(car) { return car.speed; });
        if (speeds.length === 0) return 0;
        return (Traffic.reduce(speeds, function(a, b) { return a + b; })) / speeds.length;
        
    }

    set( obj = {} ) {

        if (obj == null) obj = {};
        this.intersections = new Pool( Intersection, obj.intersections);
        this.roads = new Pool( Road, obj.roads );
        this.cars = new Pool( Car, obj.cars );
        return this.carsNumber = 0;

    }

    save() {

        let data;
        data = Traffic.extend({}, this);
        delete data.cars;
        return window.localStorage.world = JSON.stringify(data);

    }

    load() {

        let data, id, intersection, road, _ref, _ref1, _results;
        data = window.localStorage.world;
        data = data && JSON.parse(data);
        if (data == null) return;
        this.clear();
        this.carsNumber = data.carsNumber || 0;
        _ref = data.intersections;
        for (id in _ref) {
            intersection = _ref[id];
            this.addIntersection( new Intersection().copy(intersection) );
        }
        _ref1 = data.roads;
        _results = [];
        for (id in _ref1) {
            road = _ref1[id];
            road = new Road().copy(road);
            road.source = this.getIntersection(road.source);
            road.target = this.getIntersection(road.target);
            _results.push(this.addRoad(road));
        }
        return _results;

    }

    generateMap( X = 2, Y = 2, linemax = 5 , mult = 0.8, nCars = 100, decal = {x:1, y:1} ) {

        let minX = 0;
        let maxX = X*2;
        let minY = 0;
        let maxY = Y*2;

        /*let minX = -X;
        let maxX = X;
        let minY = -Y;
        let maxY = Y;*/
        let gridSize, intersection, intersectionsNumber, map, previous, rect, step, x, y, _i, _j, _k, _l;
     
        this.clear();
        intersectionsNumber = (mult * (maxX - minX + 1) * (maxY - minY + 1)) | 0;
        map = {};
        gridSize = Traffic.settings.gridSize;
        step = linemax * gridSize;
        this.carsNumber = nCars;
        while ( intersectionsNumber > 0 ) {
            x = Traffic.rand( minX, maxX );
            y = Traffic.rand( minY, maxY );
            if ( map[[x, y]] == null ) {

                intersection = this.addPoint( decal.x + (step * x), decal.y + (step * y) )
                //rect = new Rect( decal.x + (step * x), decal.y + (step * y), gridSize, gridSize );
                //intersection = new Intersection( rect );
                this.addIntersection( map[[x, y]] = intersection );
                intersectionsNumber -= 1;
            }
        }
        for (x = _i = minX; minX <= maxX ? _i <= maxX : _i >= maxX; x = minX <= maxX ? ++_i : --_i) {
            previous = null;
            for (y = _j = minY; minY <= maxY ? _j <= maxY : _j >= maxY; y = minY <= maxY ? ++_j : --_j) {
                intersection = map[[x, y]];
                if (intersection != null) {
                    if (Traffic.random() < 0.9) {
                       if (previous != null)  this.addRoad( new Road(intersection, previous) );
                       if (previous != null)  this.addRoad( new Road(previous, intersection) );
                   }
                   previous = intersection;
               }
            }
        }
        for (y = _k = minY; minY <= maxY ? _k <= maxY : _k >= maxY; y = minY <= maxY ? ++_k : --_k) {
            previous = null;
            for (x = _l = minX; minX <= maxX ? _l <= maxX : _l >= maxX; x = minX <= maxX ? ++_l : --_l) {
                intersection = map[[x, y]];
                if (intersection != null) {
                    if (Traffic.random() < 0.9) {
                        if (previous != null) this.addRoad( new Road(intersection, previous) );
                        if (previous != null) this.addRoad( new Road(previous, intersection) );
                    }
                    previous = intersection;
                }
            }
        }
        return null;
    }

    clear() {

        return this.set({});

    }

    onTick( delta ) {


        let p = []

        let car, id, intersection, v, _ref, _ref1, _results, k, d, n=0;
        if (delta > 1) throw Error('delta > 1');
        this.refreshCars();
        v = this.intersections.all();
        for ( id in v ) {
            intersection = v[id];
            intersection.controlSignals.onTick(delta);
        }
        v = this.cars.all();
        //_results = [];

        for ( id in v ) {
            car = v[id];
            car.move( delta );
            if ( !car.alive ) this.removeCar( car )
        }



    }

    // ________________TEST


    roadFromTo( p1, p2 ) {

        let from = this.addPoint( p1.x, p1.y )
        let to = this.addPoint( p2.x, p2.y )
        this.addRoad( new Road(from, to) );

        from.update();
        to.update();

    }

    addPoint( x,y ) {

        let tmp = Traffic.TMP;
        let key = [ x, y ].join(',')

        if( tmp.has( key ) ) return tmp.get( key );

        let gridSize = Traffic.settings.gridSize;
        let rect = new Rect( x, y, gridSize, gridSize );
        let intersection = new Intersection( rect );

        tmp.set( key, intersection )
        this.intersections.put( intersection );

        return intersection;

    }

    removePoint( intersection ) {

        let tmp = Traffic.TMP;
        if( tmp.has( intersection.key ) ) return tmp.delete( intersection.key );
        return this.intersections.pop( intersection );

    }





    refreshCars() {

        if (this.cars.length < this.carsNumber) this.addRandomCar();
        if (this.cars.length > this.carsNumber) return this.removeRandomCar();

    }

    addRoad( road ) {

        this.roads.put(road);
        road.source.roads.push(road);
        road.target.inRoads.push(road);
        return road.update();

    }

    getRoad( id ) {

        return this.roads.get(id);

    }

    addCar( car ) {

        return this.cars.put(car);

    }

    getCar( id ) {

       return this.cars.get(id);

    }

    removeCar( car ) {

        this.toRemove.push(car.id);
        this.cars.pop(car);

    }

    clearTmpRemove() {

        this.toRemove = [];

    }

    addIntersection( intersection ) {

        return this.intersections.put(intersection);

    }

    

    getIntersection( id ) {

        return this.intersections.get(id);

    }

    addRandomCar() {

        let lane, road;
        road = Traffic.sample(this.roads.all());
        if (road != null) {
            lane = Traffic.sample(road.lanes);
            if (lane != null){
                //console.log('car add');
                return this.addCar( new Car(lane) );
            }
        }

    }

    removeRandomCar() {

        let car;
        car = Traffic.sample( this.cars.all() );
        if (car != null) return this.removeCar(car);

    }

}