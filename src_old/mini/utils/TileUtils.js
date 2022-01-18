/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.unwrapTile = function(f) {
    return function(tile) {
        if (tile instanceof Micro.Tile) tile = tile.getValue();
        return f.call(null, tile);
    }
};

Micro.canBulldoze = Micro.unwrapTile(function(tileValue) {
    return (tileValue >= Tile.FIRSTRIVEDGE  && tileValue <= Tile.LASTRUBBLE) ||
           (tileValue >= Tile.POWERBASE + 2 && tileValue <= Tile.POWERBASE + 12) ||
           (tileValue >= Tile.TINYEXP       && tileValue <= Tile.LASTTINYEXP + 2);
});

Micro.isCommercial = Micro.unwrapTile(function(tile) { return tile >= Tile.COMBASE && tile < Tile.INDBASE; });
//Micro.isDriveable = Micro.unwrapTile(function(tile) { return (tile >= Tile.ROADBASE && tile <= Tile.LASTRAIL) ||  tile === Tile.RAILPOWERV || tile === Tile.RAILPOWERH; });
Micro.isDriveable = Micro.unwrapTile(function(tile) { return (tile >= Tile.ROADBASE && tile <= Tile.LASTRAIL) ||  tile === Tile.RAILHPOWERV || tile === Tile.RAILVPOWERH; });
Micro.isFire = Micro.unwrapTile(function(tile) { return tile >= Tile.FIREBASE && tile < Tile.ROADBASE;});
Micro.isFlood = Micro.unwrapTile(function(tile) { return tile >= Tile.FLOOD && tile < Tile.LASTFLOOD;});
Micro.isIndustrial = Micro.unwrapTile(function(tile) { return tile >= Tile.INDBASE && tile < Tile.PORTBASE; });
Micro.isManualExplosion = Micro.unwrapTile(function(tile) { return tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP; });
Micro.isRail = Micro.unwrapTile(function(tile) { return tile >= Tile.RAILBASE && tile < Tile.RESBASE; });
Micro.isResidential = Micro.unwrapTile(function(tile) { return tile >= Tile.RESBASE && tile < Tile.HOSPITALBASE; });
Micro.isRoad = Micro.unwrapTile(function(tile) { return tile >= Tile.ROADBASE && tile < Tile.POWERBASE; });
Micro.normalizeRoad = Micro.unwrapTile(function(tile) { return (tile >= Tile.ROADBASE && tile <= Tile.LASTROAD + 1) ? (tile & 15) + 64 : tile; });

Micro.isCommercialZone = function(tile) { return tile.isZone() && Micro.isCommercial(tile); };
Micro.isIndustrialZone = function(tile) { return tile.isZone() && Micro.isIndustrial(tile); };
Micro.isResidentialZone = function(tile) { return tile.isZone() && Micro.isResidential(tile);};
Micro.randomFire = function() { return new Micro.Tile(Tile.FIRE + (Random.getRandom16() & 3), Tile.ANIMBIT); };
Micro.randomRubble = function() {  return new Micro.Tile(Tile.RUBBLE + (Random.getRandom16() & 3), Tile.BULLBIT); };
Micro.HOSPITAL = function() { };