 
export { TrafficWorld } from './core/TrafficWorld.js';

const ctor = function(){};
const breaker = {};

// Save bytes in the minified (but not gzipped) version:
const ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

// Create quick reference variables for speed access to core prototypes.
const
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;
const
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;



export const Traffic = {

    idCounter : 0,

    TMP: new Map(),

    STATE : [ { RED: 0, GREEN: 1 } ],

    TYPE_OF_CARS : [

       { w:1.8, l:4.8, h:1.4, m:'car001', name:'fordM'  , wPos:[0.76,0,1.46], wRadius:0.36, nWheels:4, maxSpeed:40 },
       { w:1.8, l:4.5, h:1.8, m:'car002', name:'vaz'    , wPos:[0.72,0,1.31], wRadius:0.36, nWheels:4 },
       { w:2.2, l:5.0, h:1.5, m:'car003', name:'coupe'  , wPos:[0.96,0,1.49], wRadius:0.36, nWheels:4 },
       { w:2.2, l:5.2, h:1.9, m:'car004', name:'c4'     , wPos:[0.93,0,1.65], wRadius:0.40, nWheels:4 },
       { w:2.2, l:5.2, h:1.8, m:'car005', name:'ben'    , wPos:[0.88,0,1.58], wRadius:0.40, nWheels:4 },
       { w:2.1, l:5.4, h:1.7, m:'car006', name:'taxi'   , wPos:[0.90,0,1.49], wRadius:0.40, nWheels:4 },
       { w:2.2, l:5.4, h:1.9, m:'car007', name:'207'    , wPos:[0.94,0,1.60], wRadius:0.40, nWheels:4 },
       { w:2.3, l:5.9, h:1.7, m:'car008', name:'police' , wPos:[0.96,0,1.67], wRadius:0.40, nWheels:4 },
       { w:2.7, l:6.2, h:2.6, m:'car009', name:'van1'   , wPos:[1.14,0,1.95], wRadius:0.46, nWheels:4 },
       { w:2.2, l:6.6, h:2.8, m:'car010', name:'van2'   , wPos:[0.89,0,2.10], wRadius:0.40, nWheels:4 },
       { w:2.8, l:7.0, h:3.2, m:'car011', name:'van3'   , wPos:[0.90,0,1.83], wRadius:0.46, nWheels:4 },
       { w:2.8, l:8.9, h:3.9, m:'car012', name:'truck1' , wPos:[1.00,0,2.58], wRadius:0.57, nWheels:6, maxSpeed:20 },
       { w:3.0, l:10.6, h:3.4, m:'car013', name:'truck1', wPos:[1.17,0,3.64], wRadius:0.57, nWheels:6, maxSpeed:20 },
       { w:3.0, l:12.7, h:3.4, m:'car014', name:'bus'   , wPos:[1.25,0,2.49], wRadius:0.64, nWheels:4, maxSpeed:10 },

    ],

    settings : {
        lightsFlipInterval: 160,
        gridSize: 1,
        carScale: 0.05,
        carSpeed: 0.05,
        defaultTimeFactor: 5,
    },

    abs : Math.abs,
    sqrt : Math.sqrt,
    atan2 : Math.atan2,
    random : Math.random,
    max : Math.max,
    min : Math.min,
    pow : Math.pow,

    rand : function( min, max ){

        if ( !max ) { max = min; min = 0; }
        return min + Math.floor(Math.random() * (max - min + 1));

    },

    clamp : function( value, min, max ) {

        if (value < min) return min;
        if (value > max) return max;
        return value;

    },

    //

    binding : function( fn, me ){ 

    	return function(){ return fn.apply(me, arguments); }; 

    },

    bind : function( func, context ) {

        let args, bound;
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        //if (!_.isFunction(func)) throw new TypeError;
        args = slice.call(arguments, 2);
        return bound = function() {
          if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
          ctor.prototype = func.prototype;
          let self = new ctor;
          ctor.prototype = null;
          let result = func.apply(self, args.concat(slice.call(arguments)));
          if (Object(result) === result) return result;
          return self;
        }

    },

    indexOf : [].indexOf || function( item ) { for (let i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },

    sample : function( obj, n, guard ){

        if( n == null || guard ) {
            if( obj.length !== +obj.length ) obj = Traffic.values(obj);
            //if( obj.length !== obj.length+1 ) obj = Traffic.values(obj);
            return obj[Traffic.rand(obj.length - 1)];
        }
        return Traffic.shuffle(obj).slice(0, Math.max(0, n));

    },

    shuffle: function( obj ) {

        let rand, index = 0, shuffled = [];
        Traffic.each(obj, function(value) {
            rand = Traffic.rand(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;

    },
    
    uniqueId: function( prefix ) {

        let id = ++Traffic.idCounter + '';
        return prefix ? prefix + id : id;

    },

    extend: function( obj ) {

        Traffic.each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (let prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;

    },

    reduce: function( obj, iterator, memo, context ) {

        let initial = arguments.length > 2;
        if (obj == null) obj = [];
        if (nativeReduce && obj.reduce === nativeReduce) {
          if (context) iterator = Traffic.bind(iterator, context);
          return initial ? obj.reduce( iterator, memo ) : obj.reduce( iterator );
        }
        Traffic.each( obj, function( value, index, list ) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        //if (!initial) throw new TypeError(reduceError);
        return memo;

    },

    each : function( obj, iterator, context ) {

        let i, length, keys

        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            i = obj.length
            while(i--){
               if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            keys = Traffic.keys(obj);
            i = keys.length
            while(i--){
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;

    },

    keys: function( obj ) {

        if (!Traffic.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        let keys = [];
        for (let key in obj) if (Traffic.has(obj, key)) keys.push(key);
        return keys;

    },

    isObject: function( obj ) {
        return obj === Object(obj);
    },

    has: function( obj, key ) {

        return hasOwnProperty.call(obj, key);

    },

    values: function( obj ) {

        let keys = Traffic.keys(obj);
        let values = [];
        let i = keys.length;
        while(i--){
            values[i] = obj[keys[i]];
        }
        return values;

    },

    map: function( obj, iterator, context ){

    	let results = [];
        if ( obj == null ) return results;
        if ( nativeMap && obj.map === nativeMap ) return obj.map( iterator, context );
        Traffic.each(obj, function(value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;

    }

}

