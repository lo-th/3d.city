
Micro.TERRAIN_CREATE_ISLAND = 0;
Micro.TERRAIN_TREE_LEVEL = -1;
Micro.TERRAIN_LAKE_LEVEL = -1;
Micro.TERRAIN_CURVE_LEVEL = -1;
Micro.ISLAND_RADIUS = 18;

Micro.generateMap = function() {
   // w = w || Micro.MAP_WIDTH;
   // h = h || Micro.MAP_HEIGHT;

    

    this.SRMatrix = [
        [0, 0, Tile.REDGE, Tile.REDGE, 0, 0],
        [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
        [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
        [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
        [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
        [0, 0, Tile.REDGE, Tile.REDGE, 0, 0]
    ];
    this.BRMatrix = [
        [0, 0, 0, Tile.REDGE, Tile.REDGE, Tile.REDGE, 0, 0, 0],
        [0, 0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0, 0],
        [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
        [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
        [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.CHANNEL, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
        [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
        [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
        [0, 0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0, 0],
        [0, 0, 0, Tile.REDGE, Tile.REDGE, Tile.REDGE, 0, 0, 0]
    ];

    

    //this.map = new Micro.GameMap(w, h);
    // Construct land.
    /*if (Micro.TERRAIN_CREATE_ISLAND < 0) {
        if (Random.getRandom(100) < 10) {
            this.makeIsland();
            return this.map;
        }
    }

    if (Micro.TERRAIN_CREATE_ISLAND === 1) this.makeNakedIsland();
    else this.clearMap();

    // Lay a river.
    if (Micro.TERRAIN_CURVE_LEVEL !== 0) {
        var terrainXStart = 40 + Random.getRandom(this.map.width - 80);
        var terrainYStart = 33 + Random.getRandom(this.map.height - 67);
        var terrainPos = new this.map.Position(terrainXStart, terrainYStart);
        this.doRivers(terrainPos);
    }

    // Lay a few lakes.
    if (Micro.TERRAIN_LAKE_LEVEL !== 0) this.makeLakes();

    this.smoothRiver();

    // And add trees.
    if (Micro.TERRAIN_TREE_LEVEL !== 0) this.doTrees();

    return this.map;*/
};

Micro.generateMap.prototype = {

    constructor: Micro.generateMap,

    construct : function(w, h){
        this.map = new Micro.GameMap(w || Micro.MAP_WIDTH, h || Micro.MAP_HEIGHT);

        Micro.TERRAIN_CREATE_ISLAND = Random.getRandom(2) - 1;

        if (Micro.TERRAIN_CREATE_ISLAND < 0) {
        if (Random.getRandom(100) < 10) {
                this.makeIsland();
                return this.map;
            }
        }

        if (Micro.TERRAIN_CREATE_ISLAND === 1) this.makeNakedIsland();
        else this.clearMap();

        // Lay a river.
        if (Micro.TERRAIN_CURVE_LEVEL !== 0) {
            var terrainXStart = 40 + Random.getRandom(this.map.width - 80);
            var terrainYStart = 33 + Random.getRandom(this.map.height - 67);
            var terrainPos = new this.map.Position(terrainXStart, terrainYStart);
            this.doRivers(terrainPos);
        }

        // Lay a few lakes.
        if (Micro.TERRAIN_LAKE_LEVEL !== 0) this.makeLakes();

        this.smoothRiver();

        // And add trees.
        if (Micro.TERRAIN_TREE_LEVEL !== 0) this.doTrees();

        return this.map;
    },
    clearMap : function() {
        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                this.map.setTo(x, y, new Micro.Tile(Tile.DIRT));
            }
        }
    },
    clearUnnatural : function() {
        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                var tileValue = this.map.getTileValue(x, y);
                if (tileValue > Tile.WOODS)// this.map.setTile(x, y, Tile.DIRT, 0);//
                this.map.setTo(x, y, new Micro.Tile(Tile.DIRT));
            }
        }
    },
    makeNakedIsland : function() {
        this.map.isIsland = true;
        var terrainIslandRadius = Micro.ISLAND_RADIUS;
        var x, y, mapX, mapY;
        for (x = 0; x < this.map.width; x++) {
            for (y = 0; y < this.map.height; y++) {
                if ((x < 5) || (x >= this.map.width - 5) || (y < 5) || (y >= this.map.height - 5)) {
                    //this.map.setTile(x, y, Tile.RIVER, 0);//
                    this.map.setTo(x, y, new Micro.Tile(Tile.RIVER));
                } else {
                    //this.map.setTile(x, y, Tile.DIRT, 0);///
                    this.map.setTo(x, y, new Micro.Tile(Tile.DIRT));
                }
            }
        }
        for (x = 0; x < this.map.width - 5; x += 2) {
            mapY = Random.getERandom(terrainIslandRadius);
            this.plopBRiver(new this.map.Position(x, mapY));

            mapY = (this.map.height - 10) - Random.getERandom(terrainIslandRadius);
            this.plopBRiver( new this.map.Position(x, mapY))

            this.plopSRiver( new this.map.Position(x, 0));
            this.plopSRiver( new this.map.Position(x, this.map.height - 6));
        }
        for (y = 0; y < this.map.height - 5; y += 2) {
            mapX = Random.getERandom(terrainIslandRadius);
            this.plopBRiver( new this.map.Position(mapX, y));

            mapX = this.map.width - 10 - Random.getERandom(terrainIslandRadius);
            this.plopBRiver( new this.map.Position(mapX, y));

            this.plopSRiver( new this.map.Position(0, y));
            this.plopSRiver( new this.map.Position(this.map.width - 6, y));
        }
        
    },
    makeIsland : function() {
        this.makeNakedIsland();
        //this.smoothWater();
        this.smoothRiver();
        this.doTrees();
        
    },
    makeLakes : function() {
        var numLakes;
        if (Micro.TERRAIN_LAKE_LEVEL < 0) numLakes = Random.getRandom(10);
        else numLakes = Micro.TERRAIN_LAKE_LEVEL / 2;

        while (numLakes > 0) {
            var x = Random.getRandom(this.map.width - 21) + 10;
            var y = Random.getRandom(this.map.height - 20) + 10;
            this.makeSingleLake(new this.map.Position(x, y));
            numLakes--;
        }
    },
    makeSingleLake : function(pos) {
        var numPlops = Random.getRandom(12) + 2;
        while (numPlops > 0) {
            var plopPos = new this.map.Position(pos, Random.getRandom(12) - 6, Random.getRandom(12) - 6);
            if (Random.getRandom(4)) this.plopSRiver(plopPos);
            else this.plopBRiver(plopPos);
            numPlops--;
        }
    },
    treeSplash : function(x, y) {
        var numTrees;
        if (Micro.TERRAIN_TREE_LEVEL < 0) numTrees = Random.getRandom(150) + 50;
        else numTrees = Random.getRandom(100 + (Micro.TERRAIN_TREE_LEVEL * 2)) + 50;
        var treePos = new this.map.Position(x, y);
        while (numTrees > 0) {
            var dir = Direction.NORTH + Random.getRandom(7);
            treePos.move(dir);
            // XXX Should use the fact that positions return success/failure for moves
            if (!this.map.testBounds(treePos.x, treePos.y)) return;
            if (this.map.getTileValue(treePos) === Tile.DIRT){
                this.map.setTo(treePos, new Micro.Tile(Tile.WOODS, Tile.BLBNBIT));
                //this.map.setTile(treePos, Tile.WOODS, Tile.BLBNBIT);
            }
            numTrees--;
        }
    },
    doTrees : function() {
        var amount;
        if (Micro.TERRAIN_TREE_LEVEL < 0) amount = Random.getRandom(100) + 50;
        else amount = Micro.TERRAIN_TREE_LEVEL + 3;
        for (var x = 0; x < amount; x++) {
            var xloc = Random.getRandom(this.map.width - 1);
            var yloc = Random.getRandom(this.map.height - 1);
            this.treeSplash(xloc, yloc);
        }
        this.smoothTrees();
        this.smoothTrees();
    },
    smoothRiver : function() {
        var dx = [-1,  0,  1,  0];
        var dy = [0,  1,  0, -1];
        var riverEdges = [
            13 | Tile.BULLBIT, 13 | Tile.BULLBIT, 17 | Tile.BULLBIT, 15 | Tile.BULLBIT,
            5 | Tile.BULLBIT, 2, 19 | Tile.BULLBIT, 17 | Tile.BULLBIT,
            9 | Tile.BULLBIT, 11 | Tile.BULLBIT, 2, 13 | Tile.BULLBIT,
            7 | Tile.BULLBIT, 9 | Tile.BULLBIT, 5 | Tile.BULLBIT, 2
        ];
        
        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                if (this.map.getTileValue(x, y) === Tile.REDGE) {
                    var bitIndex = 0;
                    for (var z = 0; z < 4; z++) {
                        bitIndex = bitIndex << 1;
                        var xTemp = x + dx[z];
                        var yTemp = y + dy[z];
                        if (this.map.testBounds(xTemp, yTemp) && this.map.getTileValue(xTemp, yTemp) !== Tile.DIRT && (this.map.getTileValue(xTemp, yTemp) < Tile.WOODS_LOW || this.map.getTileValue(xTemp, yTemp) > Tile.WOODS_HIGH)) {
                            bitIndex++;
                        }
                    }
                    var temp = riverEdges[bitIndex & 15];
                    if (temp !== Tile.RIVER && Random.getRandom(1)) temp++;
                    this.map.setTo(x, y, new Micro.Tile(temp));
                }
            }
        }
    },
    isTree : function(tileValue) {
        return tileValue >= Tile.WOODS_LOW && tileValue <= Tile.WOODS_HIGH;
    },
    smoothTrees : function() {
        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                if (this.isTree(this.map.getTileValue(x, y)))
                    this.smoothTreesAt( x, y, false);
            }
        }
    },
    smoothTreesAt : function(x, y, preserve) {
        var dx = [-1,  0,  1,  0 ];
        var dy = [ 0,  1,  0, -1 ];
        var treeTable = [
            0,  0,  0,  34,
            0,  0,  36, 35,
            0,  32, 0,  33,
            30, 31, 29, 37
        ];
        if (!this.isTree(this.map.getTileValue(x, y))) return;
        var bitIndex = 0;
        for (var i = 0; i < 4; i++) {
            bitIndex = bitIndex << 1;
            var xTemp = x + dx[i];
            var yTemp = y + dy[i];
            if (this.map.testBounds(xTemp, yTemp) && this.isTree(this.map.getTileValue(xTemp, yTemp))) bitIndex++;
        }
        var temp = treeTable[bitIndex & 15];
        if (temp) {
            if (temp !== Tile.WOODS) {
                if ((x + y) & 1) temp = temp - 8;
            }
            this.map.setTo(x, y, new Micro.Tile(temp, Tile.BLBNBIT));
        } else {
            if (!preserve) this.map.setTo(x, y, new Micro.Tile(temp));
        }
    },
    doRivers : function(terrainPos) {
        var riverDir = Direction.NORTH + Random.getRandom(3) * 2;
        this.doBRiver(terrainPos, riverDir, riverDir);

        riverDir = Direction.rotate180(riverDir);
        var terrainDir = this.doBRiver(terrainPos, riverDir, riverDir);

        riverDir = Direction.NORTH + Random.getRandom(3) * 2;
        this.doSRiver( terrainPos, riverDir, terrainDir);
    },
    doBRiver : function( riverPos, riverDir, terrainDir) {
        var rate1, rate2;
        if (Micro.TERRAIN_CURVE_LEVEL < 0) {
            rate1 = 100;
            rate2 = 200;
        } else {
            rate1 = Micro.TERRAIN_CURVE_LEVEL + 10;
            rate2 = Micro.TERRAIN_CURVE_LEVEL + 100;
        }
        var pos = new this.map.Position(riverPos);
        while (this.map.testBounds(pos.x + 4, pos.y + 4)) {
            this.plopBRiver(pos);
            if (Random.getRandom(rate1) < 10) {
                terrainDir = riverDir;
            } else {
                if (Random.getRandom(rate2) > 90) terrainDir = Direction.rotate45(terrainDir);
                if (Random.getRandom(rate2) > 90) terrainDir = Direction.rotate45(terrainDir, 7);
            }
            pos.move(terrainDir);
        }
        return terrainDir;
    },
    doSRiver : function(riverPos, riverDir, terrainDir) {
        var rate1, rate2;
        if (Micro.TERRAIN_CURVE_LEVEL < 0) {
            rate1 = 100;
            rate2 = 200;
        } else {
            rate1 = Micro.TERRAIN_CURVE_LEVEL + 10;
            rate2 = Micro.TERRAIN_CURVE_LEVEL + 100;
        }
        var pos = new this.map.Position(riverPos);
        while (this.map.testBounds(pos.x + 3, pos.y + 3)) {
            this.plopSRiver(pos);
            if (Random.getRandom(rate1) < 10) {
                terrainDir = riverDir;
            } else {
                if (Random.getRandom(rate2) > 90) terrainDir = Direction.rotate45(terrainDir);
                if (Random.getRandom(rate2) > 90) terrainDir = Direction.rotate45(terrainDir, 7);
            }
            pos.move(terrainDir);
        }
    return terrainDir;
    },
    putOnMap : function(newVal, x, y) {
        if (newVal === 0) return;
        if (!this.map.testBounds(x, y)) return;
        var tileValue = this.map.getTileValue(x, y);

        if (tileValue !== Tile.DIRT) {
            if (tileValue === Tile.RIVER) {
                if (newVal !== Tile.CHANNEL) return;
            }
            if (tileValue === Tile.CHANNEL) return;
        }
        this.map.setTo(x, y, new Micro.Tile(newVal));
    },
    plopBRiver : function(pos) {
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                this.putOnMap(this.BRMatrix[y][x], pos.x + x, pos.y + y);
            }
        }
    },
    plopSRiver : function(pos) {
        for (var x = 0; x < 6; x++) {
            for (var y = 0; y < 6; y++) {
                this.putOnMap(this.SRMatrix[y][x], pos.x + x, pos.y + y);
            }
        }
    },
    smoothWater : function() {
        var x, y, tile, pos, dir;
        for (x = 0; x < this.map.width; x++) {
            for (y = 0; y < this.map.height; y++) {
                tile = this.map.getTileValue(x, y);
                // if (tile >= Tile.WATER_Tile.LOW && tile <= Tile.WATER_Tile.HIGH) {
                if (tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
                    pos = new this.map.Position(x, y);
                    for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                        tile = this.map.getTileFromMapOrDefault(pos, dir, Tile.WATER_LOW);
                        /* If nearest object is not water: */
                        if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
                            this.map.setTo(x, y, new Micro.Tile(Tile.REDGE)); /* set river edge */
                            break; // Continue with next tile
                        }
                    }
                }
            }
        }

        for (x = 0; x < this.map.width; x++) {
            for (y = 0; y < this.map.height; y++) {
                tile = this.map.getTileValue(x, y);
                if (tile !== Tile.CHANNEL && tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
                    var makeRiver = true;
                    pos = new this.map.Position(x, y);
                    for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                        tile = this.map.getTileFromMapOrDefault(pos, dir, Tile.WATER_LOW);
                        if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
                            makeRiver = false;
                            break;
                        }
                    }
                    if (makeRiver) this.map.setTo(x, y, new Micro.Tile(Tile.RIVER));
                }
            }
        }
        for (x = 0; x < this.map.width; x++) {
            for (y = 0; y < this.map.height; y++) {
                tile = this.map.getTileValue(x, y);
                if (tile >= Tile.WOODS_LOW && tile <= Tile.WOODS_HIGH) {
                    pos = new this.map.Position(x, y);
                    for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
                        tile = this.map.getTileFromMapOrDefault(pos, dir, Tile.TILE_INVALID);
                        if (tile === Tile.RIVER || tile === Tile.CHANNEL) {
                            this.map.setTo(x, y, new Micro.Tile(Tile.REDGE)); /* make it water's edge */
                            break;
                        }
                    }
                }
            }
        }
    }
}