/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
import { math } from './math/math.js';


export class ZoneUtils {

    // TileUtils

    static pixToWorld (p) {
        return p >> 4;
    }

    static worldToPix (w) {
        return w << 4;
    }

    static unwrapTile ( tile ) {

        if ( tile.isTile ) return tile = tile.getValue();
        return tile
    }

    static canBulldoze (tile) { 

        tile = ZoneUtils.unwrapTile( tile )
        return (tile >= Tile.FIRSTRIVEDGE  && tile <= Tile.LASTRUBBLE) ||
               (tile >= Tile.POWERBASE + 2 && tile <= Tile.POWERBASE + 12) ||
               (tile >= Tile.TINYEXP       && tile <= Tile.LASTTINYEXP + 2);
    }

    static isCommercial (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.COMBASE && tile < Tile.INDBASE;
    }

    static isIndustrial (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.INDBASE && tile < Tile.PORTBASE;
    }

    static isResidential (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.RESBASE && tile < Tile.HOSPITALBASE;
    }

    static isDriveable (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return (tile >= Tile.ROADBASE && tile <= Tile.LASTRAIL) || tile === Tile.RAILHPOWERV || tile === Tile.RAILVPOWERH;
    }

    static isFire (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.FIREBASE && tile < Tile.ROADBASE;
    }

    static isFlood (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.FLOOD && tile < Tile.LASTFLOOD;
    }

    static isManualExplosion (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP;
    }

    static isRail (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.RAILBASE && tile < Tile.RESBASE;
    }

    static isRoad (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return tile >= Tile.ROADBASE && tile < Tile.POWERBASE;
    }

    static normalizeRoad (tile) {
        tile = ZoneUtils.unwrapTile( tile )
        return (tile >= Tile.ROADBASE && tile <= Tile.LASTROAD + 1) ? (tile & 15) + 64 : tile;
    }

    ///

    static isCommercialZone (tile) {
        return tile.isZone() && ZoneUtils.isCommercial(tile)
    }

    static isIndustrialZone (tile) {
        return tile.isZone() && ZoneUtils.isIndustrial(tile)
    }

    static isResidentialZone (tile) {
        return tile.isZone() && ZoneUtils.isResidential(tile)
    }

    static randomFire (tile) {
        return new Tiles(Tile.FIRE + (math.getRandom16() & 3), Tile.ANIMBIT);
    }

    static randomRubble ( tile ) {
        return new Tiles(Tile.RUBBLE + (math.getRandom16() & 3), Tile.BULLBIT);
    }

    static HOSPITAL (tile) {
    }

    // ZoneUtils

    static checkBigZone = function(tile) {

        let result
        switch (tile) {
            case Tile.POWERPLANT:
            case Tile.PORT:
            case Tile.NUCLEAR:
            case Tile.STADIUM:
                result = {zoneSize: 4, deltaX: 0, deltaY: 0};
            break;

            case Tile.POWERPLANT + 1:
            case Tile.COALSMOKE3:
            case Tile.COALSMOKE3 + 1:
            case Tile.COALSMOKE3 + 2:
            case Tile.PORT + 1:
            case Tile.NUCLEAR + 1:
            case Tile.STADIUM + 1:
                result = {zoneSize: 4, deltaX: -1, deltaY: 0};
            break;

            case Tile.POWERPLANT + 4:
            case Tile.PORT + 4:
            case Tile.NUCLEAR + 4:
            case Tile.STADIUM + 4:
                result = {zoneSize: 4, deltaX: 0, deltaY: -1};
            break;

            case Tile.POWERPLANT + 5:
            case Tile.PORT + 5:
            case Tile.NUCLEAR + 5:
            case Tile.STADIUM + 5:
                result = {zoneSize: 4, deltaX: -1, deltaY: -1};
            break;
            case Tile.AIRPORT: result = {zoneSize: 6, deltaX: 0, deltaY: 0}; break;
            case Tile.AIRPORT + 1: result = {zoneSize: 6, deltaX: -1, deltaY: 0}; break;
            case Tile.AIRPORT + 2: result = {zoneSize: 6, deltaX: -2, deltaY: 0}; break;
            case Tile.AIRPORT + 3: result = {zoneSize: 6, deltaX: -3, deltaY: 0}; break;
            case Tile.AIRPORT + 6: result = {zoneSize: 6, deltaX: 0, deltaY: -1}; break;
            case Tile.AIRPORT + 7: result = {zoneSize: 6, deltaX: -1, deltaY: -1}; break;
            case Tile.AIRPORT + 8: result = {zoneSize: 6, deltaX: -2, deltaY: -1}; break;
            case Tile.AIRPORT + 9: result = {zoneSize: 6, deltaX: -3, deltaY: -1}; break;
            case Tile.AIRPORT + 12: result = {zoneSize: 6, deltaX: 0, deltaY: -2}; break;
            case Tile.AIRPORT + 13: result = {zoneSize: 6, deltaX: -1, deltaY: -2}; break;
            case Tile.AIRPORT + 14: result = {zoneSize: 6, deltaX: -2, deltaY: -2}; break;
            case Tile.AIRPORT + 15: result = {zoneSize: 6, deltaX: -3, deltaY: -2}; break;
            case Tile.AIRPORT + 18: result = {zoneSize: 6, deltaX: 0, deltaY: -3}; break;
            case Tile.AIRPORT + 19: result = {zoneSize: 6, deltaX: -1, deltaY: -3}; break;
            case Tile.AIRPORT + 20: result = {zoneSize: 6, deltaX: -2, deltaY: -3}; break;
            case Tile.AIRPORT + 21: result = {zoneSize: 6, deltaX: -3, deltaY: -3}; break;
            default: result = {zoneSize: 0, deltaX: 0, deltaY: 0}; break;
        }
        return result;
    }


    static checkZoneSize (tile) {
        if ((tile >= Tile.RESBASE - 1        && tile <= Tile.PORTBASE - 1) ||
            (tile >= Tile.LASTPOWERPLANT + 1 && tile <= Tile.POLICESTATION + 4) ||
            (tile >= Tile.CHURCH1BASE && tile <= Tile.CHURCH7LAST)) {
            return 3;
        }

        if ((tile >= Tile.PORTBASE    && tile <= Tile.LASTPORT) ||
            (tile >= Tile.COALBASE    && tile <= Tile.LASTPOWERPLANT) ||
            (tile >= Tile.STADIUMBASE && tile <= Tile.LASTZONE)) {
            return 4;
        }
        return 0;
    }

    static fireZone ( map, x, y, blockMaps ) {

        let tileValue = map.getTileValue(x, y);
        let zoneSize = 2;

        // A zone being on fire naturally hurts growth
        let value = blockMaps.rateOfGrowthMap.worldGet(x, y);
        value = math.clamp(value - 20, -200, 200);
        blockMaps.rateOfGrowthMap.worldSet(x, y, value);

        if (tileValue === Tile.AIRPORT) zoneSize = 5;
        else if (tileValue >= Tile.PORTBASE) zoneSize = 3;
        else if (tileValue < Tile.PORTBASE) zoneSize = 2;

        // Make remaining tiles of the zone bulldozable
        let xDelta, yDelta, xTem, yTem;
        for ( xDelta = -1; xDelta < zoneSize; xDelta++) {
            for ( yDelta = -1; yDelta < zoneSize; yDelta++) {
                xTem = x + xDelta;
                yTem = y + yDelta;
                if (!map.testBounds(xTem, yTem)) continue;
                if (map.getTileValue(xTem, yTem >= Tile.ROADBASE)) map.addTileFlags(xTem, yTem, Tile.BULLBIT);
            }
        }

    }

    static getLandPollutionValue ( blockMaps, x, y ) {

        let landValue = blockMaps.landValueMap.worldGet(x, y);
        landValue -= blockMaps.pollutionDensityMap.worldGet(x, y);
        if (landValue < 30) return 0;
        if (landValue < 80) return 1;
        if (landValue < 150) return 2;
        return 3;

    }

    static incRateOfGrowth ( blockMaps, x, y, growthDelta ) {

        let currentRate = blockMaps.rateOfGrowthMap.worldGet(x, y);
        // TODO why the scale of 4 here
        let newValue = math.clamp( currentRate + growthDelta * 4, -200, 200 );
        blockMaps.rateOfGrowthMap.worldSet(x, y, newValue);
        
    }

    // Calls map.putZone after first checking for flood, fire and radiation
    static putZone ( map, x, y, centreTile, isPowered ) {

        let dY, dX, tileValue;
        for ( dY = -1; dY < 2; dY++) {
            for ( dX = -1; dX < 2; dX++) {
                tileValue = map.getTileValue(x + dX, y + dY);
                if (tileValue >= Tile.FLOOD && tileValue < Tile.ROADBASE) return;
            }
        }
        map.putZone(x, y, centreTile, 3);
        map.addTileFlags(x, y, Tile.BULLBIT);
        if (isPowered) map.addTileFlags(x, y, Tile.POWERBIT);
        
    }

}

//export const ZoneUtils = ZoneUtils

export class Tiles {

    constructor ( tileValue = Tile.DIRT, bitMask ) {

        this.isTile = true;

        /*
        if (!(this.isTile)) return new Tiles();
        if (arguments.length > 0 && typeof(tileValue) !== 'number') throw new Error('Tile constructor called with invalid tileValue ' + tileValue);
        if (arguments.length > 1 && typeof(bitMask) !== 'number') throw new Error('Tile constructor called with invalid bitMask ' + bitMask);
        if (arguments.length > 1 && (tileValue < Tile.TILE_INVALID || tileValue >= Tile.TILE_COUNT)) throw new Error('Tile constructor called with out-of-range tileValue ' + tileValue);
        if (arguments.length > 1 && (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)))  throw new Error('Tile constructor called with out-of-range bitmask ' + bitMask);
        */

        this._value = tileValue;
        if (arguments.length > 1) this._value |= bitMask;

    }

    getValue () {
        return this._value & Tile.BIT_MASK;
    }

    setValue ( tileValue ) {
        if ( arguments.length === 0 || typeof(tileValue) !== 'number' || tileValue < 0) throw new Error('Invalid parameter');

        let existingFlags = 0;
        if ( tileValue < Tile.BIT_START ) existingFlags = this._value & Tile.ALLBITS;//this.getFlags();
        this._value = tileValue | existingFlags;
    }

    isBulldozable () {
        return (this._value & Tile.BULLBIT) > 0;
    }

    isAnimated () {
        return (this._value & Tile.ANIMBIT) > 0;
    }

    isConductive () {
        return (this._value & Tile.CONDBIT) > 0;
    }

    isCombustible () {
        return (this._value & Tile.BURNBIT) > 0;
    }

    isPowered () {
        return (this._value & Tile.POWERBIT) > 0;
    }

    isZone () {
        return (this._value & Tile.ZONEBIT) > 0;
    }

    addFlags (bitMask) {
        if (!arguments.length || typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= Tile.BIT_END << 1) throw new Error('Invalid parameter');
        this._value |= bitMask;
    }

    removeFlags (bitMask) {
        if (!arguments.length || typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= Tile.BIT_END << 1) throw new Error('Invalid parameter');
        this._value &= ~bitMask;
    }

    setFlags (bitMask) {
        //if (typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)) throw new Error('Invalid parameter');
        //if (arguments.length === 0) throw new Error('Tile setFlags called with no arguments');
        //if (typeof(bitMask) !== 'number') throw new Error('Tile setFlags called with invalid bitmask ' + bitMask);
       // if (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)) throw new Error('Tile setFlags called with out-of-range bitmask ' + bitMask);
        let existingValue = this._value & ~Tile.ALLBITS;
        this._value = existingValue | bitMask;
    }

    getFlags () {
        return this._value & Tile.ALLBITS;
    }

    getRawValue () {
        return this._value;
    }

    set ( tileValue, bitMask ) {
        if (arguments.length < 2 || typeof(tileValue) !== 'number' || typeof(bitMask) !== 'number' || tileValue >= Tile.TILE_COUNT) throw new Error('Invalid parameter');
        this.setValue(tileValue);
        this.setFlags(bitMask);
    }

    toString () {
        let value = this.getValue();
        let s = 'Tile# ' + value;
        s += this.isCombustible() ? ' burning' : '';
        s += this.isPowered() ? ' powered' : '';
        s += this.isAnimated() ? ' animated' : '';
        s += this.isConductive() ? ' conductive' : '';
        s += this.isZone() ? ' zone' : '';
        s += this.isBulldozable() ? ' bulldozeable' : '';
        return s;
    }

}



export const Tile = {

    // Bit-masks for statusBits
    POWERBIT  : 0x8000, // bit 15, tile has power.
    CONDBIT : 0x4000, // bit 14. tile can conduct electricity.
    BURNBIT : 0x2000, // bit 13, tile can be lit.
    BULLBIT : 0x1000, // bit 12, tile is bulldozable.
    ANIMBIT : 0x0800, // bit 11, tile is animated.
    ZONEBIT : 0x0400, // bit 10, tile is the center tile of the zone.
    BLBNBIT   : 0x1000 | 0x2000, //BULLBIT | BURNBIT,
    BLBNCNBIT : 0x1000 | 0x2000 | 0x4000, //BULLBIT | BURNBIT | CONDBIT,
    BNCNBIT   : 0x2000 | 0x4000, //BURNBIT | CONDBIT,
    ASCBIT   : 0x0800 | 0x4000 | 0x2000, // ANIMBIT | CONDBIT | BURNBIT,
    ALLBITS : 0x8000 | 0x4000 | 0x2000 | 0x1000 | 0x0800 | 0x0400, // POWERBIT | CONDBIT | BURNBIT | BULLBIT | ANIMBIT | ZONEBIT,
    BIT_START : 0x400,
    BIT_END : 0x8000,
    BIT_MASK : 0x400 - 1, // BIT_START - 1,

    // TODO Add comment for each tile
    DIRT           : 0, // Clear tile
    // tile 1 ?

    /* Water */
    RIVER          : 2,
    REDGE          : 3,
    CHANNEL        : 4,
    FIRSTRIVEDGE   : 5,
    // tile 6 -- 19 ?
    LASTRIVEDGE    : 20,
    WATER_LOW      : 2, //RIVER,   // First water tile
    WATER_HIGH     : 20, //LASTRIVEDGE, // Last water tile (inclusive)

    TREEBASE       : 21,
    WOODS_LOW      : 21, //TREEBASE,
    LASTTREE       : 36,
    WOODS          : 37,
    UNUSED_TRASH1  : 38,
    UNUSED_TRASH2  : 39,
    WOODS_HIGH     : 39, //UNUSED_TRASH2, // Why is an 'UNUSED' tile used?
    WOODS2         : 40,
    WOODS3         : 41,
    WOODS4         : 42,
    WOODS5         : 43,

    // Rubble (4 tiles)
    RUBBLE         : 44,
    LASTRUBBLE     : 47,
    // fLOOD 4 tiles
    FLOOD          : 48,
    LASTFLOOD      : 51,
    // Radiation
    RADTILE        : 52, // Radio-active contaminated tile

    UNUSED_TRASH3  : 53,
    UNUSED_TRASH4  : 54,
    UNUSED_TRASH5  : 55,

    /* Fire animation (8 tiles) */
    FIRE           : 56-8,
    FIREBASE       : 56-8, //FIRE,
    LASTFIRE       : 63-8,

    HBRIDGE        : 64, // Horizontal bridge
    ROADBASE       : 64, // HBRIDGE,
    VBRIDGE        : 65, // Vertical bridge
    ROADS          : 66,
    ROADS2         : 67,
    ROADS3         : 68,
    ROADS4         : 69,
    ROADS5         : 70,
    ROADS6         : 71,
    ROADS7         : 72,
    ROADS8         : 73,
    ROADS9         : 74,
    ROADS10        : 75,
    INTERSECTION   : 76,
    HROADPOWER     : 77,
    VROADPOWER     : 78,
    BRWH           : 79,
    LTRFBASE       : 80, // First tile with low traffic
    // tile 81 -- 94 ?
    BRWV           : 95,
    // tile 96 -- 110 ?
    BRWXXX1        : 111,
    // tile 96 -- 110 ?
    BRWXXX2        : 127,
    // tile 96 -- 110 ?
    BRWXXX3        : 143,
    HTRFBASE       : 144, // First tile with high traffic
    // tile 145 -- 158 ?
    BRWXXX4        : 159,
    // tile 160 -- 174 ?
    BRWXXX5        : 175,
    // tile 176 -- 190 ?
    BRWXXX6        : 191,
    // tile 192 -- 205 ?
    LASTROAD       : 206,
    BRWXXX7        : 207,

    /* Power lines */
    HPOWER         : 208,
    VPOWER         : 209,
    LHPOWER        : 210,
    LVPOWER        : 211,
    LVPOWER2       : 212,
    LVPOWER3       : 213,
    LVPOWER4       : 214,
    LVPOWER5       : 215,
    LVPOWER6       : 216,
    LVPOWER7       : 217,
    LVPOWER8       : 218,
    LVPOWER9       : 219,
    LVPOWER10      : 220,
    RAILHPOWERV    : 221, // Horizontal rail, vertical power
    RAILVPOWERH    : 222, // Vertical rail, horizontal power
    POWERBASE      : 208, //HPOWER,
    LASTPOWER      : 222, //RAILVPOWERH,

    UNUSED_TRASH6  : 223,

    /* Rail */
    HRAIL          : 224,
    VRAIL          : 225,
    LHRAIL         : 226,
    LVRAIL         : 227,
    LVRAIL2        : 228,
    LVRAIL3        : 229,
    LVRAIL4        : 230,
    LVRAIL5        : 231,
    LVRAIL6        : 232,
    LVRAIL7        : 233,
    LVRAIL8        : 234,
    LVRAIL9        : 235,
    LVRAIL10       : 236,
    HRAILROAD      : 237,
    VRAILROAD      : 238,
    RAILBASE       : 224, //HRAIL,
    LASTRAIL       : 238,

    ROADVPOWERH    : 239, /* bogus? */

    // Residential zone tiles

    RESBASE        : 240, // Empty residential, tiles 240--248
    FREEZ          : 244, // center-tile of 3x3 empty residential

    HOUSE          : 249, // Single tile houses until 260
    LHTHR          : 249,//HOUSE,
    HHTHR          : 260,

    RZB            : 265, // center tile first 3x3 tile residential

    HOSPITALBASE   : 405, // Center of hospital (tiles 405--413)
    HOSPITAL       : 409, // Center of hospital (tiles 405--413)

    CHURCHBASE     : 414, // Center of church (tiles 414--422)
    CHURCH0BASE    : 414, // numbered alias
    CHURCH         : 418, // Center of church (tiles 414--422)
    CHURCH0        : 418, // numbered alias

    // Commercial zone tiles

    COMBASE        : 423, // Empty commercial, tiles 423--431
    // tile 424 -- 426 ?
    COMCLR         : 427,
    // tile 428 -- 435 ?
    CZB            : 436,
    // tile 437 -- 608 ?
    COMLAST        : 609,
    // tile 610, 611 ?

    // Industrial zone tiles.
    INDBASE        : 612, // Top-left tile of empty industrial zone.
    INDCLR         : 616, // Center tile of empty industrial zone.
    LASTIND        : 620, // Last tile of empty industrial zone.

    // Industrial zone population 0, value 0: 621 -- 629
    IND1           : 621, // Top-left tile of first non-empty industry zone.
    IZB            : 625, // Center tile of first non-empty industry zone.

    // Industrial zone population 1, value 0: 630 -- 638

    // Industrial zone population 2, value 0: 639 -- 647
    IND2           : 641,
    IND3           : 644,

    // Industrial zone population 3, value 0: 648 -- 656
    IND4           : 649,
    IND5           : 650,

    // Industrial zone population 0, value 1: 657 -- 665

    // Industrial zone population 1, value 1: 666 -- 674

    // Industrial zone population 2, value 1: 675 -- 683
    IND6           : 676,
    IND7           : 677,

    // Industrial zone population 3, value 1: 684 -- 692
    IND8           : 686,
    IND9           : 689,

    // Seaport
    PORTBASE       : 693, // Top-left tile of the seaport.
    PORT           : 698, // Center tile of the seaport.
    LASTPORT       : 708, // Last tile of the seaport.

    AIRPORTBASE    : 709,
    // tile 710 ?
    RADAR          : 711,
    // tile 712 -- 715 ?
    AIRPORT        : 716,
    // tile 717 -- 744 ?

    // Coal power plant (4x4).
    COALBASE       : 745, // First tile of coal power plant.
    POWERPLANT     : 750, // 'Center' tile of coal power plant.
    LASTPOWERPLANT : 760, // Last tile of coal power plant.

    // Fire station (3x3).
    FIRESTBASE     : 761, // First tile of fire station.
    FIRESTATION    : 765, // 'Center tile' of fire station.
    // 769 last tile fire station.

    POLICESTBASE   : 770,
    // tile 771 -- 773 ?
    POLICESTATION  : 774,
    // tile 775 -- 778 ?

    // Stadium (4x4).
    STADIUMBASE    : 779, // First tile stadium.
    STADIUM        : 784, // 'Center tile' stadium.
    // Last tile stadium 794.

    // tile 785 -- 799 ?
    FULLSTADIUM    : 800,
    // tile 801 -- 810 ?

    // Nuclear power plant (4x4).
    NUCLEARBASE    : 811, // First tile nuclear power plant.
    NUCLEAR        : 816, // 'Center' tile nuclear power plant.
    LASTZONE       : 826, // Also last tile nuclear power plant.

    LIGHTNINGBOLT  : 827,

     // bridge horisontal open close
    HBRDG0         : 828,
    HBRDG1         : 829,
    HBRDG2         : 830,
    HBRDG3         : 831,
    //HBRDG_END      : 832,

    RADAR0         : 832,
    RADAR1         : 833,
    RADAR2         : 834,
    RADAR3         : 835,
    RADAR4         : 836,
    RADAR5         : 837,
    RADAR6         : 838,
    RADAR7         : 839,
    FOUNTAIN       : 840,
    // tile 841 -- 843: fountain animation.
    INDBASE2       : 844,
    TELEBASE       : 844,
    // tile 845 -- 850 ?
    TELELAST       : 851,
    SMOKEBASE      : 852,
    // tile 853 -- 859 ?
    TINYEXP        : 860,
    // tile 861 -- 863 ?
    SOMETINYEXP    : 864,
    // tile 865 -- 866 ?
    LASTTINYEXP    : 867,
    // tile 868 -- 882 ?
    TINYEXPLAST    : 883,
    // tile 884 -- 915 ?

    COALSMOKE1     : 916, // Chimney animation at coal power plant (2, 0).
    // 919 last animation tile for chimney at coal power plant (2, 0).

    COALSMOKE2     : 920, // Chimney animation at coal power plant (3, 0).
    // 923 last animation tile for chimney at coal power plant (3, 0).

    COALSMOKE3     : 924, // Chimney animation at coal power plant (2, 1).
    // 927 last animation tile for chimney at coal power plant (2, 1).

    COALSMOKE4     : 928, // Chimney animation at coal power plant (3, 1).
    // 931 last animation tile for chimney at coal power plant (3, 1).

    FOOTBALLGAME1  : 932,
    // tile 933 -- 939 ?
    FOOTBALLGAME2  : 940,
    // tile 941 -- 94 bridge open close
    VBRDG0         : 948,
    VBRDG1         : 949,
    VBRDG2         : 950,
    VBRDG3         : 951,
    // nuclear animation // disable
    NUKESWIRL1     : 952,
    NUKESWIRL2     : 953,
    NUKESWIRL3     : 954,
    NUKESWIRL4     : 955,

    // Tiles 956-959 unused (originally)
    // TILE_COUNT     : 960,

    // Extended zones: 956-1019
    CHURCH1BASE    : 956,
    CHURCH1        : 960,
    CHURCH2BASE    : 965,
    CHURCH2        : 969,
    CHURCH3BASE    : 974,
    CHURCH3        : 978,
    CHURCH4BASE    : 983,
    CHURCH4        : 987,
    CHURCH5BASE    : 992,
    CHURCH5        : 996,
    CHURCH6BASE    : 1001,
    CHURCH6        : 1005,
    CHURCH7BASE    : 1010,
    CHURCH7        : 1014,
    CHURCH7LAST    : 1018,

    // Tiles 1020-1023 unused
    TILE_COUNT     : 1024,
    TILE_INVALID   : -1, // Invalid tile (not used in the world map).
    MIN_SIZE : 16, // Minimum size of tile in pixels
};

export const RoadTable = [
    Tile.ROADS, Tile.ROADS2, Tile.ROADS, Tile.ROADS3,
    Tile.ROADS2, Tile.ROADS2, Tile.ROADS4, Tile.ROADS8,
    Tile.ROADS, Tile.ROADS6, Tile.ROADS, Tile.ROADS7,
    Tile.ROADS5, Tile.ROADS10, Tile.ROADS9, Tile.INTERSECTION
]

export const RailTable = [
    Tile.LHRAIL, Tile.LVRAIL, Tile.LHRAIL, Tile.LVRAIL2,
    Tile.LVRAIL, Tile.LVRAIL, Tile.LVRAIL3, Tile.LVRAIL7,
    Tile.LHRAIL, Tile.LVRAIL5, Tile.LHRAIL, Tile.LVRAIL6,
    Tile.LVRAIL4, Tile.LVRAIL9, Tile.LVRAIL8, Tile.LVRAIL10
]

export const WireTable = [
    Tile.LHPOWER, Tile.LVPOWER, Tile.LHPOWER, Tile.LVPOWER2,
    Tile.LVPOWER, Tile.LVPOWER, Tile.LVPOWER3, Tile.LVPOWER7,
    Tile.LHPOWER, Tile.LVPOWER5, Tile.LHPOWER, Tile.LVPOWER6,
    Tile.LVPOWER4, Tile.LVPOWER9, Tile.LVPOWER8, Tile.LVPOWER10
]