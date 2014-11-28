/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Stadia = function (SIM) {
    var sim = SIM;
    var emptyStadiumFound = function(map, x, y, simData) {
        sim.census.stadiumPop += 1;

        if (map.getTile(x, y).isPowered()) {
            // Occasionally start the big game
            if (((sim.cityTime + x + y) & 31) === 0) {
                map.putZone(x, y, Tile.FULLSTADIUM, 4);
                map.addTileFlags(x, y, Tile.POWERBIT);
                map.setTo(x + 1, y, new Micro.Tile(Tile.FOOTBALLGAME1, Tile.ANIMBIT));
                map.setTo(x + 1, y + 1, new Micro.Tile(Tile.FOOTBALLGAME2, Tile.ANIMBIT));
            }
        }
    }

    var fullStadiumFound = function(map, x, y, simData) {
        sim.census.stadiumPop += 1;
        var isPowered = map.getTile(x, y).isPowered();

        if (((sim.cityTime + x + y) & 7) === 0) {
            map.putZone(x, y, Tile.STADIUM, 4);
            if (isPowered) map.addTileFlags(x, y, Tile.POWERBIT);
        }
    }

    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Tile.STADIUM, emptyStadiumFound);
            mapScanner.addAction(Tile.FULLSTADIUM, fullStadiumFound);
            repairManager.addAction(Tile.STADIUM, 15, 4);
        }
    }
};