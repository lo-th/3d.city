/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Transport = function (SIM) {
    var sim = SIM;

    var railFound = function(map, x, y, simData) {
        sim.census.railTotal += 1;
        sim.spriteManager.generateTrain(sim.census, x, y);

        if (sim.budget.shouldDegradeRoad()) {
            if (Random.getChance(511)) {
                var currentTile = map.getTile(x, y);

                // Don't degrade tiles with power lines
                if (currentTile.isConductive()) return;

                if (sim.budget.roadEffect < (Random.getRandom16() & 31)) {
                    var mapValue = currentTile.getValue();

                    // Replace bridge tiles with water, otherwise rubble
                    var tile = map.getTile(x, y);
                    if (tile < Tile.RAILBASE + 2) map.setTo(x, y, Tile.RIVER);
                    else map.setTo(x, y, Micro.randomRubble());
                }
            }
        }
    };

    var airportFound = function(map, x, y, simData) {
        sim.census.airportPop += 1;

        var tile = map.getTile(x, y);
        if (tile.isPowered()) {
            if (map.getTileValue(x + 1, y - 1) === Tile.RADAR) map.setTo(x + 1, y - 1, new Micro.Tile(Tile.RADAR0, Tile.CONDBIT | Tile.ANIMBIT | Tile.BURNBIT));
            if (Random.getRandom(5) === 0) {
                sim.spriteManager.generatePlane(x, y);
                return;
            }
            if (Random.getRandom(12) === 0) sim.spriteManager.generateCopter(x, y);
        } else {
            map.setTo(x + 1, y - 1, new Micro.Tile(Tile.RADAR, Tile.CONDBIT | Tile.BURNBIT));
        }
    };

    var portFound = function(map, x, y, simData) {
        sim.census.seaportPop += 1;
        var tile = map.getTile(x, y);
        if (tile.isPowered() && sim.spriteManager.getSprite(Micro.SPRITE_SHIP) === null) sim.spriteManager.generateShip();
    };

    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Micro.isRail, railFound);
            mapScanner.addAction(Tile.PORT, portFound);
            mapScanner.addAction(Tile.AIRPORT, airportFound);

            repairManager.addAction(Tile.PORT, 15, 4);
            repairManager.addAction(Tile.AIRPORT, 7, 6);
        }
    }
};