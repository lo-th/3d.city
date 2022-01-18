/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Tile = function(tileValue, bitMask){
    if (!(this instanceof Micro.Tile)) return new Micro.Tile();
    //if (arguments.length && (typeof(tileValue) !== 'number' || (arguments.length > 1 && typeof(bitMask) !== 'number') || tileValue < 0)) throw new Error('Invalid parameter');
    //if (arguments.length > 1 && (tileValue >= Tile.TILE_COUNT || bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1))) throw new Error('Invalid parameter');
    this._value = tileValue;
    // If no value supplied, default to Tile.DIRT
    if (this._value === undefined) this._value = Tile.DIRT;
    if (arguments.length > 1) this._value |= bitMask;
}

Micro.Tile.prototype = {
    constructor: Micro.Tile,
    getValue : function() {
        return this._value & Tile.BIT_MASK;
    },
    setValue : function( tileValue ) {
        if ( arguments.length === 0 || typeof(tileValue) !== 'number' || tileValue < 0) throw new Error('Invalid parameter');

        var existingFlags = 0;
        if ( tileValue < Tile.BIT_START ) existingFlags = this._value & Tile.ALLBITS;//this.getFlags();
        this._value = tileValue | existingFlags;
    },
    isBulldozable : function() {
        return (this._value & Tile.BULLBIT) > 0;
    },
    isAnimated : function() {
        return (this._value & Tile.ANIMBIT) > 0;
    },
    isConductive : function() {
        return (this._value & Tile.CONDBIT) > 0;
    },
    isCombustible : function() {
        return (this._value & Tile.BURNBIT) > 0;
    },
    isPowered : function() {
        return (this._value & Tile.POWERBIT) > 0;
    },
    isZone : function() {
        return (this._value & Tile.ZONEBIT) > 0;
    },
    addFlags : function(bitMask) {
        if (!arguments.length || typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= Tile.BIT_END << 1) throw new Error('Invalid parameter');
        this._value |= bitMask;
    },
    removeFlags : function(bitMask) {
        if (!arguments.length || typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= Tile.BIT_END << 1) throw new Error('Invalid parameter');
        this._value &= ~bitMask;
    },
    setFlags : function(bitMask) {
        //if (typeof(bitMask) !== 'number' || bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)) throw new Error('Invalid parameter');
        //if (arguments.length === 0) throw new Error('Tile setFlags called with no arguments');
        //if (typeof(bitMask) !== 'number') throw new Error('Tile setFlags called with invalid bitmask ' + bitMask);
       // if (bitMask < Tile.BIT_START || bitMask >= (Tile.BIT_END << 1)) throw new Error('Tile setFlags called with out-of-range bitmask ' + bitMask);
        var existingValue = this._value & ~Tile.ALLBITS;
        this._value = existingValue | bitMask;
    },
    getFlags : function() {
        return this._value & Tile.ALLBITS;
    },
    getRawValue : function() {
        return this._value;
    },
    set : function(tileValue, bitMask) {
        if (arguments.length < 2 || typeof(tileValue) !== 'number' || typeof(bitMask) !== 'number' || tileValue >= Tile.TILE_COUNT) throw new Error('Invalid parameter');
        this.setValue(tileValue);
        this.setFlags(bitMask);
    },
    toString : function() {
        var value = this.getValue();
        var s = 'Tile# ' + value;
        s += this.isCombustible() ? ' burning' : '';
        s += this.isPowered() ? ' powered' : '';
        s += this.isAnimated() ? ' animated' : '';
        s += this.isConductive() ? ' conductive' : '';
        s += this.isZone() ? ' zone' : '';
        s += this.isBulldozable() ? ' bulldozeable' : '';
        return s;
    }
}

var Tile = {};

// Bit-masks for statusBits
Tile.POWERBIT  = 0x8000; // bit 15, tile has power.
Tile.CONDBIT = 0x4000; // bit 14. tile can conduct electricity.
Tile.BURNBIT = 0x2000; // bit 13, tile can be lit.
Tile.BULLBIT = 0x1000; // bit 12, tile is bulldozable.
Tile.ANIMBIT = 0x0800; // bit 11, tile is animated.
Tile.ZONEBIT = 0x0400; // bit 10, tile is the center tile of the zone.
Tile.BLBNBIT   = Tile.BULLBIT | Tile.BURNBIT;
Tile.BLBNCNBIT = Tile.BULLBIT | Tile.BURNBIT | Tile.CONDBIT;
Tile.BNCNBIT   = Tile.BURNBIT | Tile.CONDBIT;
Tile.ASCBIT   = Tile.ANIMBIT | Tile.CONDBIT | Tile.BURNBIT;
Tile.ALLBITS = Tile.POWERBIT | Tile.CONDBIT | Tile.BURNBIT | Tile.BULLBIT | Tile.ANIMBIT | Tile.ZONEBIT;
Tile.BIT_START = 0x400;
Tile.BIT_END = 0x8000;
Tile.BIT_MASK = Tile.BIT_START - 1;

// TODO Add comment for each tile
Tile.DIRT           = 0; // Clear tile
// tile 1 ?

/* Water */
Tile.RIVER          = 2;
Tile.REDGE          = 3;
Tile.CHANNEL        = 4;
Tile.FIRSTRIVEDGE   = 5;
// tile 6 -- 19 ?
Tile.LASTRIVEDGE    = 20;
Tile.WATER_LOW      = Tile.RIVER;   // First water tile
Tile.WATER_HIGH     = Tile.LASTRIVEDGE; // Last water tile (inclusive)

Tile.TREEBASE       = 21;
Tile.WOODS_LOW      = Tile.TREEBASE;
Tile.LASTTREE       = 36;
Tile.WOODS          = 37;
Tile.UNUSED_TRASH1  = 38;
Tile.UNUSED_TRASH2  = 39;
Tile.WOODS_HIGH     = Tile.UNUSED_TRASH2; // Why is an 'UNUSED' tile used?
Tile.WOODS2         = 40;
Tile.WOODS3         = 41;
Tile.WOODS4         = 42;
Tile.WOODS5         = 43;

/* Rubble (4 tiles) */
Tile.RUBBLE         = 44;
Tile.LASTRUBBLE     = 47;

Tile.FLOOD          = 48;
// tile 49, 50 ?
Tile.LASTFLOOD      = 51;

Tile.RADTILE        = 52; // Radio-active contaminated tile

Tile.UNUSED_TRASH3  = 53;
Tile.UNUSED_TRASH4  = 54;
Tile.UNUSED_TRASH5  = 55;

/* Fire animation (8 tiles) */
Tile.FIRE           = 56;
Tile.FIREBASE       = Tile.FIRE;
Tile.LASTFIRE       = 63;

Tile.HBRIDGE        = 64; // Horizontal bridge
Tile.ROADBASE       = Tile.HBRIDGE;
Tile.VBRIDGE        = 65; // Vertical bridge
Tile.ROADS          = 66;
Tile.ROADS2         = 67;
Tile.ROADS3         = 68;
Tile.ROADS4         = 69;
Tile.ROADS5         = 70;
Tile.ROADS6         = 71;
Tile.ROADS7         = 72;
Tile.ROADS8         = 73;
Tile.ROADS9         = 74;
Tile.ROADS10        = 75;
Tile.INTERSECTION   = 76;
Tile.HROADPOWER     = 77;
Tile.VROADPOWER     = 78;
Tile.BRWH           = 79;
Tile.LTRFBASE       = 80; // First tile with low traffic
// tile 81 -- 94 ?
Tile.BRWV           = 95;
// tile 96 -- 110 ?
Tile.BRWXXX1        = 111;
// tile 96 -- 110 ?
Tile.BRWXXX2        = 127;
// tile 96 -- 110 ?
Tile.BRWXXX3        = 143;
Tile.HTRFBASE       = 144; // First tile with high traffic
// tile 145 -- 158 ?
Tile.BRWXXX4        = 159;
// tile 160 -- 174 ?
Tile.BRWXXX5        = 175;
// tile 176 -- 190 ?
Tile.BRWXXX6        = 191;
// tile 192 -- 205 ?
Tile.LASTROAD       = 206;
Tile.BRWXXX7        = 207;

/* Power lines */
Tile.HPOWER         = 208;
Tile.VPOWER         = 209;
Tile.LHPOWER        = 210;
Tile.LVPOWER        = 211;
Tile.LVPOWER2       = 212;
Tile.LVPOWER3       = 213;
Tile.LVPOWER4       = 214;
Tile.LVPOWER5       = 215;
Tile.LVPOWER6       = 216;
Tile.LVPOWER7       = 217;
Tile.LVPOWER8       = 218;
Tile.LVPOWER9       = 219;
Tile.LVPOWER10      = 220;
Tile.RAILHPOWERV    = 221; // Horizontal rail, vertical power
Tile.RAILVPOWERH    = 222; // Vertical rail, horizontal power
Tile.POWERBASE      = Tile.HPOWER;
Tile.LASTPOWER      = Tile.RAILVPOWERH;

Tile.UNUSED_TRASH6  = 223;

/* Rail */
Tile.HRAIL          = 224;
Tile.VRAIL          = 225;
Tile.LHRAIL         = 226;
Tile.LVRAIL         = 227;
Tile.LVRAIL2        = 228;
Tile.LVRAIL3        = 229;
Tile.LVRAIL4        = 230;
Tile.LVRAIL5        = 231;
Tile.LVRAIL6        = 232;
Tile.LVRAIL7        = 233;
Tile.LVRAIL8        = 234;
Tile.LVRAIL9        = 235;
Tile.LVRAIL10       = 236;
Tile.HRAILROAD      = 237;
Tile.VRAILROAD      = 238;
Tile.RAILBASE       = Tile.HRAIL;
Tile.LASTRAIL       = 238;

Tile.ROADVPOWERH    = 239; /* bogus? */

// Residential zone tiles

Tile.RESBASE        = 240; // Empty residential, tiles 240--248
Tile.FREEZ          = 244; // center-tile of 3x3 empty residential

Tile.HOUSE          = 249; // Single tile houses until 260
Tile.LHTHR          = Tile.HOUSE;
Tile.HHTHR          = 260;

Tile.RZB            = 265; // center tile first 3x3 tile residential

Tile.HOSPITALBASE   = 405; // Center of hospital (tiles 405--413)
Tile.HOSPITAL       = 409; // Center of hospital (tiles 405--413)

Tile.CHURCHBASE     = 414; // Center of church (tiles 414--422)
Tile.CHURCH0BASE    = 414; // numbered alias
Tile.CHURCH         = 418; // Center of church (tiles 414--422)
Tile.CHURCH0        = 418; // numbered alias

// Commercial zone tiles

Tile.COMBASE        = 423; // Empty commercial, tiles 423--431
// tile 424 -- 426 ?
Tile.COMCLR         = 427;
// tile 428 -- 435 ?
Tile.CZB            = 436;
// tile 437 -- 608 ?
Tile.COMLAST        = 609;
// tile 610, 611 ?

// Industrial zone tiles.
Tile.INDBASE        = 612; // Top-left tile of empty industrial zone.
Tile.INDCLR         = 616; // Center tile of empty industrial zone.
Tile.LASTIND        = 620; // Last tile of empty industrial zone.

// Industrial zone population 0, value 0: 621 -- 629
Tile.IND1           = 621; // Top-left tile of first non-empty industry zone.
Tile.IZB            = 625; // Center tile of first non-empty industry zone.

// Industrial zone population 1, value 0: 630 -- 638

// Industrial zone population 2, value 0: 639 -- 647
Tile.IND2           = 641;
Tile.IND3           = 644;

// Industrial zone population 3, value 0: 648 -- 656
Tile.IND4           = 649;
Tile.IND5           = 650;

// Industrial zone population 0, value 1: 657 -- 665

// Industrial zone population 1, value 1: 666 -- 674

// Industrial zone population 2, value 1: 675 -- 683
Tile.IND6           = 676;
Tile.IND7           = 677;

// Industrial zone population 3, value 1: 684 -- 692
Tile.IND8           = 686;
Tile.IND9           = 689;

// Seaport
Tile.PORTBASE       = 693; // Top-left tile of the seaport.
Tile.PORT           = 698; // Center tile of the seaport.
Tile.LASTPORT       = 708; // Last tile of the seaport.

Tile.AIRPORTBASE    = 709;
// tile 710 ?
Tile.RADAR          = 711;
// tile 712 -- 715 ?
Tile.AIRPORT        = 716;
// tile 717 -- 744 ?

// Coal power plant (4x4).
Tile.COALBASE       = 745; // First tile of coal power plant.
Tile.POWERPLANT     = 750; // 'Center' tile of coal power plant.
Tile.LASTPOWERPLANT = 760; // Last tile of coal power plant.

// Fire station (3x3).
Tile.FIRESTBASE     = 761; // First tile of fire station.
Tile.FIRESTATION    = 765; // 'Center tile' of fire station.
// 769 last tile fire station.

Tile.POLICESTBASE   = 770;
// tile 771 -- 773 ?
Tile.POLICESTATION  = 774;
// tile 775 -- 778 ?

// Stadium (4x4).
Tile.STADIUMBASE    = 779; // First tile stadium.
Tile.STADIUM        = 784; // 'Center tile' stadium.
// Last tile stadium 794.

// tile 785 -- 799 ?
Tile.FULLSTADIUM    = 800;
// tile 801 -- 810 ?

// Nuclear power plant (4x4).
Tile.NUCLEARBASE    = 811; // First tile nuclear power plant.
Tile.NUCLEAR        = 816; // 'Center' tile nuclear power plant.
Tile.LASTZONE       = 826; // Also last tile nuclear power plant.

Tile.LIGHTNINGBOLT  = 827;
Tile.HBRDG0         = 828;
Tile.HBRDG1         = 829;
Tile.HBRDG2         = 830;
Tile.HBRDG3         = 831;
Tile.HBRDG_END      = 832;
Tile.RADAR0         = 832;
Tile.RADAR1         = 833;
Tile.RADAR2         = 834;
Tile.RADAR3         = 835;
Tile.RADAR4         = 836;
Tile.RADAR5         = 837;
Tile.RADAR6         = 838;
Tile.RADAR7         = 839;
Tile.FOUNTAIN       = 840;
// tile 841 -- 843: fountain animation.
Tile.INDBASE2       = 844;
Tile.TELEBASE       = 844;
// tile 845 -- 850 ?
Tile.TELELAST       = 851;
Tile.SMOKEBASE      = 852;
// tile 853 -- 859 ?
Tile.TINYEXP        = 860;
// tile 861 -- 863 ?
Tile.SOMETINYEXP    = 864;
// tile 865 -- 866 ?
Tile.LASTTINYEXP    = 867;
// tile 868 -- 882 ?
Tile.TINYEXPLAST    = 883;
// tile 884 -- 915 ?

Tile.COALSMOKE1     = 916; // Chimney animation at coal power plant (2, 0).
// 919 last animation tile for chimney at coal power plant (2, 0).

Tile.COALSMOKE2     = 920; // Chimney animation at coal power plant (3, 0).
// 923 last animation tile for chimney at coal power plant (3, 0).

Tile.COALSMOKE3     = 924; // Chimney animation at coal power plant (2, 1).
// 927 last animation tile for chimney at coal power plant (2, 1).

Tile.COALSMOKE4     = 928; // Chimney animation at coal power plant (3, 1).
// 931 last animation tile for chimney at coal power plant (3, 1).

Tile.FOOTBALLGAME1  = 932;
// tile 933 -- 939 ?
Tile.FOOTBALLGAME2  = 940;
// tile 941 -- 947 ?
Tile.VBRDG0         = 948;
Tile.VBRDG1         = 949;
Tile.VBRDG2         = 950;
Tile.VBRDG3         = 951;

Tile.NUKESWIRL1     = 952;
Tile.NUKESWIRL2     = 953;
Tile.NUKESWIRL3     = 954;
Tile.NUKESWIRL4     = 955;

// Tiles 956-959 unused (originally)
// TILE_COUNT     = 960;

// Extended zones: 956-1019
Tile.CHURCH1BASE    = 956;
Tile.CHURCH1        = 960;
Tile.CHURCH2BASE    = 965;
Tile.CHURCH2        = 969;
Tile.CHURCH3BASE    = 974;
Tile.CHURCH3        = 978;
Tile.CHURCH4BASE    = 983;
Tile.CHURCH4        = 987;
Tile.CHURCH5BASE    = 992;
Tile.CHURCH5        = 996;
Tile.CHURCH6BASE    = 1001;
Tile.CHURCH6        = 1005;
Tile.CHURCH7BASE    = 1010;
Tile.CHURCH7        = 1014;
Tile.CHURCH7LAST    = 1018;

// Tiles 1020-1023 unused
Tile.TILE_COUNT     = 1024;
Tile.TILE_INVALID   = -1; // Invalid tile (not used in the world map).
Tile.MIN_SIZE = 16; // Minimum size of tile in pixels