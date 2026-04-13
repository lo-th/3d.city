/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { EventEmitter, Micro, MiscUtils } from '../Micro.js';
import { Tiles, Tile, ZoneUtils } from '../Tile.js';
import { Messages } from '../Messages.js';

import { math } from '../math/math.js';

export const vulnerable = function( tile ) {

    let tileValue = tile.getValue();
    if (tileValue < Tile.RESBASE || tileValue > Tile.LASTZONE || tile.isZone()) return false;
    return true;

}

export class DisasterManager {

    constructor ( map, spriteManager, gameLevel ) {

        this._map = map;
        this._spriteManager = spriteManager;
        this._gameLevel = gameLevel;

        this._floodCount = 0;
        this.disastersEnabled = false;

        this.Dx = [ 0, 1, 0, -1];
        this.Dy = [-1, 0, 1, 0];

        // TODO enable disasters
        //Object.defineProperty(this, 'disastersEnabled', MiscUtils.mcd(false));
    }

    doDisasters ( census ) {

        if (this._floodCount) this._floodCount--;

        // TODO Scenarios

        if (!this.disastersEnabled) return;

        if (math.getRandom(Micro.DisChance[this._gameLevel])) {
            switch (math.getRandom(8)) {
                case 0:
                case 1: this.setFire(); break;

                case 2:
                case 3: this.makeFlood(); break;

                case 4:
                  break;

                case 5: this._spriteManager.makeTornado(); break;

                case 6:
                    // TODO Earthquakes
                    //this.makeEarthquake();
                break;

                case 7:
                case 8: if (census.pollutionAverage > 60) this._spriteManager.makeMonster(); break;
            }
        }
    }

    setDifficulty (gameLevel) {
        this._gameLevel = gameLevel;
    }

    scenarioDisaster () {
        // TODO Scenarios
    }
    // User initiated meltdown: need to find the plant first
    makeMeltdown () {
        for (let x = 0; x < (this._map.width - 1); x++) {
            for (let y = 0; y < (this._map.height - 1); y++) {
                if (this._map.getTileValue(x, y) === Tile.NUCLEAR) {
                    this.doMeltdown( x, y );
                    return;
                }
            }
        }
    }

    makeEarthquake () {

        let strength = math.getRandom(700) + 300;
        this.doEarthquake(strength);

        EventEmitter.emitEvent(Messages.EARTHQUAKE, {x: this._map.cityCenterX, y: this._map.cityCenterY});

        let i, x, y;

        for ( i = 0; i < strength; i++)  {
            x = math.getRandom(this._map.width - 1);
            y = math.getRandom(this._map.height - 1);

            if (vulnerable(this._map.getTile(x, y))) {
                if ((i & 0x3) !== 0) this._map.setTo(x, y, ZoneUtils.randomRubble());
                else this._map.setTo(x, y, ZoneUtils.randomFire());
            }
        }

    }

    setFire ( times = 1, zonesOnly = false ) {

        let i, x, y, tile, lowerLimit;

        for ( i = 0; i < times; i++) {
            x = math.getRandom(this._map.width - 1);
            y = math.getRandom(this._map.height - 1);

            if (!this._map.testBounds(x, y)) continue;

            tile = this._map.getTile(x, y);

            if (!tile.isZone()) {
                tile = tile.getValue();
                lowerLimit = zonesOnly ? Tile.LHTHR : Tile.TREEBASE;
                if (tile > lowerLimit && tile < Tile.LASTZONE) {
                    this._map.setTo(x, y, ZoneUtils.randomFire());
                    EventEmitter.emitEvent(Messages.FIRE_REPORTED, {showable: true, x: x, y: y});
                    return;
                }
            }
        }
    }

    makeCrash () {

        let s = this._spriteManager.getSprite(Micro.SPRITE_AIRPLANE);
        if (s !== null) { s.explodeSprite(); return; }

        let x = math.getRandom(this._map.width - 1);
        let y = math.getRandom(this._map.height - 1);
        this._spriteManager.generatePlane(x, y);
        s = this._spriteManager.getSprite(Micro.SPRITE_AIRPLANE);
        s.explodeSprite();

    }

    makeFire () {

        this.setFire( 40, false);

    }

    makeFlood () {

        let i, x, y, tileValue, j, xx, yy, tile;

        for ( i = 0; i < 300; i++) {
            x = math.getRandom(this._map.width - 1);
            y = math.getRandom(this._map.height - 1);
            if (!this._map.testBounds(x, y)) continue;

            tileValue = this._map.getTileValue(x, y);

            if (tileValue > Tile.CHANNEL && tileValue <= Tile.WATER_HIGH) {
                for ( j = 0; j < 4; j++) {
                    xx = x + this.Dx[j];
                    yy = y + this.Dy[j];

                    if (!this._map.testBounds(xx, yy)) continue;

                    tile = this._map.getTile(xx, yy);
                    tileValue = tile.getValue();

                    if (tile === Tile.DIRT || (tile.isBulldozable() && tile.isCombustible)) {
                        this._map.setTo(xx, yy, new Tiles(Tile.FLOOD));
                        this._floodCount = 30;
                        EventEmitter.emitEvent(Messages.FLOODING_REPORTED, {showable: true, x: xx, y: yy});
                        return;
                    }
                }
            }
        }

    }

    doFlood ( x, y, blockMaps ) {

        let i, xx, yy, tile, tileValue;

        if (this._floodCount > 0) {
            // Flood is not over yet
            for ( i = 0; i < 4; i++) {
                if (math.getChance(7)) {
                    xx = x + this.Dx[i];
                    yy = y + this.Dy[i];

                    if (this._map.testBounds(xx, yy)) {
                        tile = this._map.getTile(xx, yy);
                        tileValue = tile.getValue();

                        if (tile.isCombustible() || tileValue === Tile.DIRT || (tileValue >= Tile.WOODS5 && tileValue < Tile.FLOOD)) {
                            if (tile.isZone()) ZoneUtils.fireZone(this.map, xx, yy, blockMaps);

                            this._map.setTile(xx, yy, Tile.FLOOD + math.getRandom(2), 0);
                            //this._map.setTo(xx, yy, new Tiles(Tile.FLOOD + math.getRandom(2)));
                        }
                    }
                }
            }
        } else {
            if (math.getChance(15)) this._map.setTile(x, y, Tile.DIRT, 0);
        }

    }

    doMeltdown ( x, y ) {

        this._spriteManager.makeExplosion(x - 1, y - 1);
        this._spriteManager.makeExplosion(x - 1, y + 2);
        this._spriteManager.makeExplosion(x + 2, y - 1);
        this._spriteManager.makeExplosion(x + 2, y + 2);

        let i, dY, dX, tile;

        // Whole power plant is at fire
        for (dX = x - 1; dX < x + 3; dX++) {
            for (dY = y - 1; dY < y + 3; dY++) {
                this._map.setTo(dX, dY, ZoneUtils.randomFire());
            }
        }

        // Add lots of radiation tiles around the plant
        for ( i = 0; i < 200; i++)  {
            dX = x - 20 + math.getRandom(40);
            dY = y - 15 + math.getRandom(30);

            if (!this._map.testBounds(dX, dY)) continue;

            tile = this._map.getTile(dX, dY);

            if (tile.isZone()) continue;
            if (tile.isCombustible() || tile.getValue() === Tile.DIRT) this._map.setTile(dX, dY, Tile.RADTILE, 0);//this._map.setTo(dX, dY, new Tiles(Tile.RADTILE));
        }

        // Report disaster to the user
        EventEmitter.emitEvent(Messages.NUCLEAR_MELTDOWN, {showable: true, x: x, y: y});
    }
}
