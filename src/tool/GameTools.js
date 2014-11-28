/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.GameTools = function (map) {
    return {
        airport: new Micro.BuildingTool(10000, Tile.AIRPORT, map, 6, false),
        bulldozer: new Micro.BulldozerTool(map),
        coal: new Micro.BuildingTool(3000, Tile.POWERPLANT, map, 4, false),
        commercial: new Micro.BuildingTool(100, Tile.COMCLR, map, 3, false),
        fire: new Micro.BuildingTool(500, Tile.FIRESTATION, map, 3, false),
        industrial: new Micro.BuildingTool(100, Tile.INDCLR, map, 3, false),
        nuclear: new Micro.BuildingTool(5000, Tile.NUCLEAR, map, 4, true),
        park: new Micro.ParkTool(map),
        police: new Micro.BuildingTool(500, Tile.POLICESTATION, map, 3, false),
        port: new Micro.BuildingTool(3000, Tile.PORT, map, 4, false),
        rail: new Micro.RailTool(map),
        residential: new Micro.BuildingTool(100, Tile.FREEZ, map, 3, false),
        road: new Micro.RoadTool(map),
        query: new Micro.QueryTool(map),
        stadium: new Micro.BuildingTool(5000, Tile.STADIUM, map, 4, false),
        wire: new Micro.WireTool(map),
    };
};