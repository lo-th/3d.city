/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.EmergencyServices = function (SIM) {
    var sim = SIM;

    var handleService = function(censusStat, budgetEffect, blockMap) {
        return function(map, x, y, simData) {
            sim.census[censusStat] += 1;
            var effect = sim.budget[budgetEffect];
            var isPowered = map.getTile(x, y).isPowered();
            // Unpowered buildings are half as effective
            if (!isPowered) effect = Math.floor(effect / 2);

            var pos = new map.Position(x, y);
            var connectedToRoads = sim.traffic.findPerimeterRoad(pos);
            if (!connectedToRoads) effect = Math.floor(effect / 2);

            var currentEffect = sim.blockMaps[blockMap].worldGet(x, y);
            currentEffect += effect;
            sim.blockMaps[blockMap].worldSet(x, y, currentEffect);
        }
    };

    var policeStationFound = handleService('policeStationPop', 'policeEffect', 'policeStationMap');
    var fireStationFound = handleService('fireStationPop', 'fireEffect', 'fireStationMap');

    return {
        registerHandlers: function(mapScanner, repairManager) {
            mapScanner.addAction(Tile.POLICESTATION, policeStationFound);
            mapScanner.addAction(Tile.FIRESTATION, fireStationFound);
        }
    }
};