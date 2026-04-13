export class math {

    static lerp ( x, y, t ) { return ( 1 - t ) * x + t * y; }
    static rand ( low, high ) { return low + Math.random() * ( high - low ); }
    static randInt ( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); }

    static clamp (value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    static getChance (chance) {
        return (math.getRandom16() & chance) === 0;
    }

    static getERandom ( max ) {
        var r1 = math.getRandom(max);
        var r2 = math.getRandom(max);
        return Math.min(r1, r2);
    }

    static getRandom ( max ) {
        return Math.floor(Math.random() * (max + 1));
    }

    static getRandom16 () {
        return math.getRandom(65535);
    }

    static getRandom16Signed () {
        var value = math.getRandom16();
        if (value < 32768)  return value;
        else return -(2 ** 16) + value;
    }

}