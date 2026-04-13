/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { EventEmitter, Micro } from '../Micro.js';
import { Tile } from '../Tile.js';
import { Messages } from '../Messages.js'
import { BlockMap } from './BlockMap.js';

import { Direction } from '../math/Direction.js'
import { Position } from '../math/Position.js'
import { math } from '../math/math.js';

export class PowerManager {

    constructor ( map ) {

        this._map = map;
        this._powerStack = [];
        this.powerGridMap = new BlockMap(this._map.width, this._map.height, 1, 0);

    }

    setTilePower (x, y) {

        var tile = this._map.getTile(x, y);
        var tileValue = tile.getValue();

        if (tileValue === Tile.NUCLEAR || tileValue === Tile.POWERPLANT || this.powerGridMap.worldGet(x, y) > 0) {
            tile.addFlags(Tile.POWERBIT);
            return;
        }

        tile.removeFlags(Tile.POWERBIT);

    }

    clearPowerStack () {
        this._powerStackPointer = 0;
        this._powerStack = [];
    }

    testForConductive ( pos, testDir ) {
        var movedPos = new Position(pos);
        if (movedPos.move(testDir)) {
            if (this._map.getTile(movedPos.x, movedPos.y).isConductive()) {
                if (this.powerGridMap.worldGet(movedPos.x, movedPos.y) === 0)
                    return true;
            }
        }
        return false;
    }

    // Note: the algorithm is buggy: if you have two adjacent power
    // plants, the second will be regarded as drawing power from the first
    // rather than as a power source itself
    doPowerScan ( census ) {
        // Clear power this._map.
        this.powerGridMap.clear();

        // Power that the combined coal and nuclear power plants can deliver.
        let maxPower = census.coalPowerPop * Micro.COAL_POWER_STRENGTH + census.nuclearPowerPop * Micro.NUCLEAR_POWER_STRENGTH;

        let powerConsumption = 0; // Amount of power used.

        while (this._powerStack.length > 0) {
            var pos = this._powerStack.pop();
            var anyDir = Direction.INVALID;
            var conNum;
            do {
                powerConsumption++;
            if (powerConsumption > maxPower) {
                EventEmitter.emitEvent(Messages.NOT_ENOUGH_POWER);
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
            if (conNum > 1) this._powerStack.push( new Position(pos) );
            } while ( conNum );
        }
    }

    coalPowerFound ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        simData.census.coalPowerPop += 1;
        this._powerStack.push(new Position(x, y));

        // Ensure animation runs
        var dX = [-1, 2, 1, 2];
        var dY = [-1, -1, 0, 0];

        // Ensure animation bits set no animation for 3d
        if(!simData.is3D) for (var i = 0; i < 4; i++) map.addTileFlags(x + dX[i], y + dY[i], Tile.ANIMBIT); 

    }

    nuclearPowerFound ( map, x, y, simData ) {

        if(!simData) simData = Micro.simData

        var meltdownTable = [30000, 20000, 10000];
        // TODO With the auto repair system, zone gets repaired before meltdown
        // In original Micropolis code, we bail and don't repair if melting down
        if (simData.disasterManager.disastersEnabled && math.getRandom(meltdownTable[simData.gameLevel]) === 0) {
           // simData.disasterManager.doMeltdown(messageManager, x, y);
            return;
        }
        simData.census.nuclearPowerPop += 1;
        this._powerStack.push(new Position(x, y));
        //console.log(x, y, new map.Position(x, y))

        // Ensure animation bits set   no animation for 3d
        if(!simData.is3D) 
            for (var i = 0; i < 4; i++)  map.addTileFlags(x, y, Tile.ANIMBIT | Tile.CONDBIT | Tile.POWERBIT | Tile.BURNBIT);
    }

    registerHandlers (mapScanner, repairManager) {
        mapScanner.addAction(Tile.POWERPLANT, this.coalPowerFound.bind(this));
        mapScanner.addAction(Tile.NUCLEAR, this.nuclearPowerFound.bind(this));
        repairManager.addAction(Tile.POWERPLANT, 7, 4);
        repairManager.addAction(Tile.NUCLEAR, 7, 4);
    }
}
