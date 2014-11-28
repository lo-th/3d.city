/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

Micro.PowerManager = function (map, SIM) {
    this.sim = SIM;
    this._map = map;
    this._powerStack = [];
    this.powerGridMap = new Micro.BlockMap(this._map.width, this._map.height, 1, 0);
}

Micro.PowerManager.prototype = {
    constructor: Micro.PowerManager,
    setTilePower : function(x, y) {
        var tile = this._map.getTile(x, y);
        var tileValue = tile.getValue();

        if (tileValue === Tile.NUCLEAR || tileValue === Tile.POWERPLANT || this.powerGridMap.worldGet(x, y) > 0) {
            tile.addFlags(Tile.POWERBIT);
            return;
        }

        tile.removeFlags(Tile.POWERBIT);
    },
    clearPowerStack : function() {
        this._powerStackPointer = 0;
        this._powerStack = [];
    },
    testForConductive : function(pos, testDir) {
        var movedPos = new this._map.Position(pos);
        if (movedPos.move(testDir)) {
            if (this._map.getTile(movedPos.x, movedPos.y).isConductive()) {
                if (this.powerGridMap.worldGet(movedPos.x, movedPos.y) === 0)
                    return true;
            }
        }
        return false;
    },
    // Note: the algorithm is buggy: if you have two adjacent power
    // plants, the second will be regarded as drawing power from the first
    // rather than as a power source itself
    doPowerScan : function(census, messageManager) {
        // Clear power this._map.
        this.powerGridMap.clear();

        // Power that the combined coal and nuclear power plants can deliver.
        var maxPower = census.coalPowerPop * Micro.COAL_POWER_STRENGTH + census.nuclearPowerPop * Micro.NUCLEAR_POWER_STRENGTH;

        var powerConsumption = 0; // Amount of power used.

        while (this._powerStack.length > 0) {
            var pos = this._powerStack.pop();
            var anyDir = Direction.INVALID;
            var conNum;
            do {
                powerConsumption++;
            if (powerConsumption > maxPower) {
                messageManager.sendMessage(Messages.NOT_ENOUGH_POWER);
                return;
            }

            if (anyDir !== Direction.INVALID)
                pos.move(anyDir);

            this.powerGridMap.worldSet(pos.x, pos.y, 1);
            conNum = 0;
            var dir = Direction.BEGIN;

            while (dir < Direction.END && conNum < 2) {
                if (this.testForConductive(pos, dir)) {
                    conNum++;
                    anyDir = dir;
                }
                dir = Direction.increment90(dir);
            }
            if (conNum > 1) this._powerStack.push(new this._map.Position(pos));
            } while (conNum);
        }
    },
    coalPowerFound : function(map, x, y, simData) {
        this.sim.census.coalPowerPop += 1;
        this._powerStack.push(new map.Position(x, y));

        // Ensure animation runs
        var dX = [-1, 2, 1, 2];
        var dY = [-1, -1, 0, 0];

        // Ensure animation bits set   no animation for 3d
        if(!this.sim.is3D) 
            for (var i = 0; i < 4; i++) map.addTileFlags(x + dX[i], y + dY[i], Tile.ANIMBIT); 
    },
    nuclearPowerFound : function(map, x, y, simData) {
        var meltdownTable = [30000, 20000, 10000];
        // TODO With the auto repair system, zone gets repaired before meltdown
        // In original Micropolis code, we bail and don't repair if melting down
        if (this.sim.disasterManager.disastersEnabled && Random.getRandom(meltdownTable[this.sim.gameLevel]) === 0) {
           // simData.disasterManager.doMeltdown(messageManager, x, y);
            return;
        }
        this.sim.census.nuclearPowerPop += 1;
        this._powerStack.push(new map.Position(x, y));
        //console.log(x, y, new map.Position(x, y))

        // Ensure animation bits set   no animation for 3d
        if(!this.sim.is3D) 
            for (var i = 0; i < 4; i++)  map.addTileFlags(x, y, Tile.ANIMBIT | Tile.CONDBIT | Tile.POWERBIT | Tile.BURNBIT);
    },
    registerHandlers : function(mapScanner, repairManager) {
        mapScanner.addAction(Tile.POWERPLANT, this.coalPowerFound.bind(this));
        mapScanner.addAction(Tile.NUCLEAR, this.nuclearPowerFound.bind(this));
        repairManager.addAction(Tile.POWERPLANT, 7, 4);
        repairManager.addAction(Tile.NUCLEAR, 7, 4);
    }
}

// var dX = [1, 2, 1, 2];
//  var dY = [-1, -1, 0, 0];
