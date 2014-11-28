/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.QueryTool = function (map) {
    Micro.BaseTool.call( this );
    this.init(0, map, false, false);
    this.txt = "";
}


// Keep in sync with QueryWindow
var debug = true;

Micro.QueryTool.prototype = Object.create( Micro.BaseTool.prototype );

Micro.QueryTool.prototype.classifyPopulationDensity = function(x, y, blockMaps) {
    var density = blockMaps.populationDensityMap.worldGet(x, y);
    //if (debug) document.getElementById("queryDensityRaw").innerHTML=density;
    density = density >> 6;
    density = density & 3;

    this.txt+='Density: '+TXT.densityStrings[density]+'<br>';
    //document.getElementById("queryDensity").innerHTML=TXT.densityStrings[density];
};

Micro.QueryTool.prototype.classifyLandValue = function(x, y, blockMaps) {
    var landValue = blockMaps.landValueMap.worldGet(x, y);
    //if (debug) document.getElementById("queryLandValueRaw").innerHTML=landValue;

    var i = 0;
    if (landValue >= 150) i = 3;
    else if (landValue >= 80) i = 2;
    else if (landValue >= 30) i = 1;

    //var text = TXT.landValueStrings[i];
    this.txt+='Value: '+TXT.landValueStrings[i]+'<br>';
    //document.getElementById("queryLandValue").innerHTML=text;
};


Micro.QueryTool.prototype.classifyCrime = function(x, y, blockMaps) {
    var crime = blockMaps.crimeRateMap.worldGet(x, y);
    //if (debug) document.getElementById("queryCrimeRaw").innerHTML=crime;

    crime = crime >> 6;
    crime = crime & 3;

    this.txt+='Crime: '+TXT.crimeStrings[crime]+'<br>';
    //document.getElementById("queryCrime").innerHTML=TXT.crimeStrings[crime];
};

Micro.QueryTool.prototype.classifyPollution = function(x, y, blockMaps) {
    var pollution = blockMaps.pollutionDensityMap.worldGet(x, y);
    //if (debug) document.getElementById("queryPollutionRaw").innerHTML=pollution;
    pollution = pollution >> 6;
    pollution = pollution & 3;

    this.txt+='Pollution: '+TXT.pollutionStrings[pollution]+'<br>';
    //document.getElementById("queryPollution").innerHTML=TXT.pollutionStrings[pollution];
};

Micro.QueryTool.prototype.classifyRateOfGrowth = function(x, y, blockMaps) {
    var rate = blockMaps.rateOfGrowthMap.worldGet(x, y);
    //if (debug) document.getElementById("queryRateRaw").innerHTML=rate;
    rate = rate >> 6;
    rate = rate & 3;

    this.txt+='Growth: '+TXT.rateStrings[rate];
    //document.getElementById("queryRate").innerHTML=TXT.rateStrings[rate];
};


Micro.QueryTool.prototype.classifyDebug = function(x, y, blockMaps) {
    if (!debug) return;
    /*document.getElementById("queryFireStationRaw").innerHTML=blockMaps.fireStationMap.worldGet(x, y);
    document.getElementById("queryFireStationEffectRaw").innerHTML=blockMaps.fireStationEffectMap.worldGet(x, y);
    document.getElementById("queryPoliceStationRaw").innerHTML=blockMaps.policeStationMap.worldGet(x, y);
    document.getElementById("queryPoliceStationEffectRaw").innerHTML=blockMaps.policeStationEffectMap.worldGet(x, y);
    document.getElementById("queryTerrainDensityRaw").innerHTML=blockMaps.terrainDensityMap.worldGet(x, y);
    document.getElementById("queryTrafficDensityRaw").innerHTML=blockMaps.trafficDensityMap.worldGet(x, y);
    document.getElementById("queryComRateRaw").innerHTML=blockMaps.comRateMap.worldGet(x, y);*/
};

Micro.QueryTool.prototype.classifyZone = function(x, y) {
    var baseTiles = [
        Tile.DIRT, Tile.RIVER, Tile.TREEBASE, Tile.RUBBLE,
        Tile.FLOOD, Tile.RADTILE, Tile.FIRE, Tile.ROADBASE,
        Tile.POWERBASE, Tile.RAILBASE, Tile.RESBASE, Tile.COMBASE,
        Tile.INDBASE, Tile.PORTBASE, Tile.AIRPORTBASE, Tile.COALBASE,
        Tile.FIRESTBASE, Tile.POLICESTBASE, Tile.STADIUMBASE, Tile.NUCLEARBASE,
        Tile.HBRDG0, Tile.RADAR0, Tile.FOUNTAIN, Tile.INDBASE2,
        Tile.FOOTBALLGAME1, Tile.VBRDG0, 952];

    var tileValue = this._map.getTileValue(x, y);
    if (tileValue >= Tile.COALSMOKE1 && tileValue < Tile.FOOTBALLGAME1) tileValue = Tile.COALBASE;

    var index = 0, l;
    for (index = 0, l = baseTiles.length - 1; index < l; index++) {
        if (tileValue < baseTiles[index + 1])
        break;
    }

    this.txt='Zone: '+TXT.zoneTypes[index]+'<br>';

    //document.getElementById("queryZoneType").innerHTML=TXT.zoneTypes[index];
};

Micro.QueryTool.prototype.getInfo = function() {
    return this.txt;
};

Micro.QueryTool.prototype.doTool = function(x, y, messageManager, blockMaps) {
    var text = 'Position (' + x + ', ' + y + ')';
    text += ' TileValue: ' + this._map.getTileValue(x, y);

    if (debug) {
      var tile = this._map.getTile(x, y);
      /*document.getElementById("queryTile").innerHTML=[x,y].join(', ');
      document.getElementById("queryTileValue").innerHTML=tile.getValue();
      document.getElementById("queryTileBurnable").innerHTML=tile.isCombustible();
      document.getElementById("queryTileBulldozable").innerHTML=tile.isBulldozable();
      document.getElementById("queryTileCond").innerHTML=tile.isConductive();
      document.getElementById("queryTileAnim").innerHTML=tile.isAnimated();
      document.getElementById("queryTilePowered").innerHTML=tile.isPowered();*/
    }

    this.classifyZone(x, y);
    this.classifyPopulationDensity(x, y, blockMaps);
    this.classifyLandValue(x, y, blockMaps);
    this.classifyCrime(x, y, blockMaps);
    this.classifyPollution(x, y, blockMaps);
    this.classifyRateOfGrowth(x, y, blockMaps);
    this.classifyDebug(x, y, blockMaps);

    messageManager.sendMessage(Messages.QUERY_WINDOW_NEEDED);

    this.result = this.TOOLRESULT_OK;
};