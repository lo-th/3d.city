/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Road = function (SIM) {
    var sim = SIM;

    var openBridge = function(map, origX, origY, xDelta, yDelta, oldTiles, newTiles) {
        for (var i = 0; i < 7; i++) {
            var x = origX + xDelta[i];
            var y = origY + yDelta[i];
            if (map.testBounds(x, y)) {
                if (map.getTileValue(x, y) === (oldTiles[i] & Tile.BIT_MASK)) map.setTileValue(x, y, newTiles[i]);//map.setTileValue(newTiles[i]);
            }
        }
    }

    var closeBridge = function(map, origX, origY, xDelta, yDelta, oldTiles, newTiles) {
        for (var i = 0; i < 7; i++) {
            var x = origX + xDelta[i];
            var y = origY + yDelta[i];
            if (map.testBounds(x, y)) {
                var tileValue = map.getTileValue(x, y);
                if (tileValue === Tile.CHANNEL || (tileValue & 15) === (oldTiles[i] & 15)) map.setTileValue(x, y, newTiles[i]);//map.setTileValue(newTiles[i]);
            }
       }
    }

    var verticalDeltaX = [0,  1,  0,  0,  0,  0,  1];
    var verticalDeltaY = [-2, -2, -1,  0,  1,  2,  2];
    var openVertical = [
        Tile.VBRDG0 | Tile.BULLBIT, Tile.VBRDG1 | Tile.BULLBIT,
        Tile.RIVER, Tile.BRWV | Tile.BULLBIT,
        Tile.RIVER, Tile.VBRDG2 | Tile.BULLBIT, Tile.VBRDG3 | Tile.BULLBIT];
    var closeVertical = [
        Tile.VBRIDGE | Tile.BULLBIT, Tile.RIVER, Tile.VBRIDGE | Tile.BULLBIT,
        Tile.VBRIDGE | Tile.BULLBIT, Tile.VBRIDGE | Tile.BULLBIT,
        Tile.VBRIDGE | Tile.BULLBIT, Tile.RIVER];
    var horizontalDeltaX = [-2,  2, -2, -1,  0,  1,  2];
    var horizontalDeltaY = [ -1, -1,  0,  0,  0,  0,  0];
     var openHorizontal = [
        Tile.HBRDG1 | Tile.BULLBIT, Tile.HBRDG3 | Tile.BULLBIT,
        Tile.HBRDG0 | Tile.BULLBIT, Tile.RIVER, Tile.BRWH | Tile.BULLBIT,
        Tile.RIVER, Tile.HBRDG2 | Tile.BULLBIT ];
    var closeHorizontal = [
        Tile.RIVER, Tile.RIVER, Tile.HBRIDGE | Tile.BULLBIT,
        Tile.HBRIDGE | Tile.BULLBIT, Tile.HBRIDGE | Tile.BULLBIT,
        Tile.HBRIDGE | Tile.BULLBIT, Tile.HBRIDGE | Tile.BULLBIT];

    var doBridge = function(map, x, y, currentTile, simData) {
        if (currentTile === Tile.BRWV) {
            // We have an open vertical bridge. Possibly close it.
            if (Random.getChance(3) && sim.spriteManager.getBoatDistance(x, y) > 340)
                closeBridge(map, x, y, verticalDeltaX, verticalDeltaY, openVertical, closeVertical);
            return true;
        }
        if (currentTile == Tile.BRWH) {
            // We have an open horizontal bridge. Possibly close it.
            if (Random.getChance(3) && sim.spriteManager.getBoatDistance(x, y) > 340)
                closeBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, openHorizontal, closeHorizontal);
            return true;
        }
        if (sim.spriteManager.getBoatDistance(x, y) < 300 || Random.getChance(7)) {
            if (currentTile & 1) {
                if (x < map.width - 1) {
                    if (map.getTileValue(x + 1, y) === Tile.CHANNEL) {
                             // We have a closed vertical bridge. Open it.
                            openBridge(map, x, y, verticalDeltaX, verticalDeltaY, closeVertical, openVertical);
                        return true;
                    }
                }
                return false;
            } else {
                if (y > 0) {
                    if (map.getTileValue(x, y - 1) === Tile.CHANNEL) {
                            // We have a closed horizontal bridge. Open it.
                            //openBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, openVertical, closeVertical);
                            openBridge(map, x, y, horizontalDeltaX, horizontalDeltaY, closeHorizontal, openHorizontal);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    var densityTable = [Tile.ROADBASE, Tile.LTRFBASE, Tile.HTRFBASE];

    var roadFound = function(map, x, y, simData) {
        sim.census.roadTotal += 1;
        var currentTile = map.getTile(x, y);
        var tileValue = currentTile.getValue();
        if (sim.budget.shouldDegradeRoad()) {
            if (Random.getChance(511)) {
                currentTile = map.getTile(x, y);

                // Don't degrade tiles with power lines
                if (!currentTile.isConductive()) {
                    if (sim.budget.roadEffect < (Random.getRandom16() & 31)) {
                        var mapValue = currentTile.getValue();

                        // Replace bridge tiles with water, otherwise rubble
                        if ((tileValue & 15) < 2 || (tileValue & 15) === 15) map.setTo(x, y, Tile.RIVER);
                        else map.setTo(x, y, Micro.randomRubble());
                        return;
                    }
                }
            }
        }

        // Bridges are not combustible
        if (!currentTile.isCombustible()) {
            // The comment in the original Micropolis code states bridges count for 4
            // However, with the increment above, it's actually 5. Bug?
            sim.census.roadTotal += 4;
            //if (doBridge(map, x, y, tileValue, null)) return;
            if (doBridge(map, x, y, tileValue, simData)) return;
        }

        // Examine traffic density, and modify tile to represent last scanned traffic
        // density
        var density = 0;
        if (tileValue < Tile.LTRFBASE) {
            density = 0;
        } else if (tileValue < Tile.HTRFBASE) {
            density = 1;
        } else {
            // Heavy traffic counts as two tiles with regards to upkeep cost
            // Note, if this is heavy traffic on a bridge, and it wasn't handled above,
            // it actually counts for 7 road tiles
            sim.census.roadTotal += 1;
            density = 2;
        }

        var currentDensity = sim.blockMaps.trafficDensityMap.worldGet(x, y) >> 6;
        // Force currentDensity in range 0-3 (trafficDensityMap values are capped at 240)
        if (currentDensity > 1) currentDensity -= 1;
        if (currentDensity === density) return;

        var newValue = ((tileValue - Tile.ROADBASE) & 15) + densityTable[currentDensity];
        // Preserve all bits except animation
        var newFlags = currentTile.getFlags() & ~Tile.ANIMBIT;
        if (currentDensity > 0) newFlags |= Tile.ANIMBIT;

        map.setTo(x, y, new Micro.Tile(newValue, newFlags));
    }

    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Micro.isRoad, roadFound);
        }
    }
};