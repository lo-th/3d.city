
var TERRAIN_CREATE_ISLAND;
var TERRAIN_TREE_LEVEL = -1;
var TERRAIN_LAKE_LEVEL = -1;
var TERRAIN_CURVE_LEVEL = 0;
var ISLAND_RADIUS = 18;

var generateMap = function(w, h) {
    w = w || Micro.MAP_WIDTH;
    h = h || Micro.MAP_HEIGHT;

    TERRAIN_CREATE_ISLAND = Random.getRandom(2) - 1;

    var map = new Micro.GameMap(w, h);
    // Construct land.
    if (TERRAIN_CREATE_ISLAND < 0) {
        if (Random.getRandom(100) < 10) {
            makeIsland(map);
            return map;
        }
    }

    if (TERRAIN_CREATE_ISLAND === 1) makeNakedIsland(map);
    else clearMap(map);

    // Lay a river.
    if (TERRAIN_CURVE_LEVEL !== 0) {
        var terrainXStart = 40 + Random.getRandom(map.width - 80);
        var terrainYStart = 33 + Random.getRandom(map.height - 67);
        var terrainPos = new map.Position(terrainXStart, terrainYStart);
        doRivers(map, terrainPos);
    }

    // Lay a few lakes.
    if (TERRAIN_LAKE_LEVEL !== 0) makeLakes(map);

    smoothRiver(map);

    // And add trees.
    if (TERRAIN_TREE_LEVEL !== 0) doTrees(map);

    return map;
};


  var clearMap = function(map) {
    for (var x = 0; x < map.width; x++) {
      for (var y = 0; y < map.height; y++) {
        map.setTo(x, y, new Micro.Tile(Tile.DIRT));
      }
    }
  };


  var clearUnnatural = function(map) {
    for (var x = 0; x < map.width; x++) {
      for (var y = 0; y < map.height; y++) {
        var tileValue = map.getTileValue(x, y);
        if (tileValue > Tile.WOODS)
          map.setTo(x, y, new Micro.Tile(Tile.DIRT));
      }
    }
  };


  var makeNakedIsland = function(map) {
    var terrainIslandRadius = ISLAND_RADIUS;
    var x, y;

    for (x = 0; x < map.width; x++) {
      for (y = 0; y < map.height; y++) {
        if ((x < 5) || (x >= map.width - 5) ||
            (y < 5) || (y >= map.height - 5)) {
          map.setTo(x, y, new Micro.Tile(Tile.RIVER));
        } else {
          map.setTo(x, y, new Micro.Tile(Tile.DIRT));
        }
      }
    }

    for (x = 0; x < map.width - 5; x += 2) {
      var mapY = Random.getERandom(terrainIslandRadius);
      plopBRiver(map, new map.Position(x, mapY));

      mapY = (map.height - 10) - Random.getERandom(terrainIslandRadius);
      plopBRiver(map, new map.Position(x, mapY));

      plopSRiver(map, new map.Position(x, 0));
      plopSRiver(map, new map.Position(x, map.height - 6));
    }

    for (y = 0; y < map.height - 5; y += 2) {
      var mapX = Random.getERandom(terrainIslandRadius);
      plopBRiver(map, new map.Position(mapX, y));

      mapX = map.width - 10 - Random.getERandom(terrainIslandRadius);
      plopBRiver(map, new map.Position(mapX, y));

      plopSRiver(map, new map.Position(0, y));
      plopSRiver(map, new map.Position(map.width - 6, y));
    }
  };


  var makeIsland = function(map) {
    makeNakedIsland(map);
    smoothRiver(map);
    doTrees(map);
  };


  var makeLakes = function(map) {
    var numLakes;
    if (TERRAIN_LAKE_LEVEL < 0)
        numLakes = Random.getRandom(10);
    else
        numLakes = TERRAIN_LAKE_LEVEL / 2;

    while (numLakes > 0) {
      var x = Random.getRandom(map.width - 21) + 10;
      var y = Random.getRandom(map.height - 20) + 10;

      makeSingleLake(map, new map.Position(x, y));
      numLakes--;
    }
  };

  var makeSingleLake = function(map, pos) {
    var numPlops = Random.getRandom(12) + 2;

    while (numPlops > 0) {
      var plopPos = new map.Position(pos, Random.getRandom(12) - 6, Random.getRandom(12) - 6);

      if (Random.getRandom(4))
          plopSRiver(map, plopPos);
      else
          plopBRiver(map, plopPos);

      numPlops--;
    }
  };


  var treeSplash = function(map, x, y) {
    var numTrees;

    if (TERRAIN_TREE_LEVEL < 0)
      numTrees = Random.getRandom(150) + 50;
    else
      numTrees = Random.getRandom(100 + (TERRAIN_TREE_LEVEL * 2)) + 50;

    var treePos = new map.Position(x, y);

    while (numTrees > 0) {
      var dir = Direction.NORTH + Random.getRandom(7);
      treePos.move(dir);

      // XXX Should use the fact that positions return success/failure for moves
      if (!map.testBounds(treePos.x, treePos.y)) return;

      if (map.getTileValue(treePos) === Tile.DIRT){
        //console.log('tree')
        map.setTo(treePos, new Micro.Tile(Tile.WOODS, Tile.BLBNBIT));
      }

      numTrees--;
    }
  };


  var doTrees = function(map) {
    var amount;

    if (TERRAIN_TREE_LEVEL < 0)
      amount = Random.getRandom(100) + 50;
    else
      amount = TERRAIN_TREE_LEVEL + 3;

    for (var x = 0; x < amount; x++) {
        var xloc = Random.getRandom(map.width - 1);
        var yloc = Random.getRandom(map.height - 1);
        treeSplash(map, xloc, yloc);
    }

    smoothTrees(map);
    smoothTrees(map);
  };


  var smoothRiver = function(map) {
    var dx = [-1,  0,  1,  0];
    var dy = [0,  1,  0, -1];
    var riverEdges = [
      13 | Tile.BULLBIT, 13 | Tile.BULLBIT, 17 | Tile.BULLBIT, 15 | Tile.BULLBIT,
      5 | Tile.BULLBIT, 2, 19 | Tile.BULLBIT, 17 | Tile.BULLBIT,
      9 | Tile.BULLBIT, 11 | Tile.BULLBIT, 2, 13 | Tile.BULLBIT,
      7 | Tile.BULLBIT, 9 | Tile.BULLBIT, 5 | Tile.BULLBIT, 2];

    for (var x = 0; x < map.width; x++) {
      for (var y = 0; y < map.height; y++) {
        if (map.getTileValue(x, y) === Tile.REDGE) {
          var bitIndex = 0;

          for (var z = 0; z < 4; z++) {
            bitIndex = bitIndex << 1;
            var xTemp = x + dx[z];
            var yTemp = y + dy[z];
            if (map.testBounds(xTemp, yTemp) &&
                map.getTileValue(xTemp, yTemp) !== Tile.DIRT &&
                (map.getTileValue(xTemp, yTemp) < Tile.WOODS_LOW ||
                 map.getTileValue(xTemp, yTemp) > Tile.WOODS_HIGH)) {
              bitIndex++;
            }
          }

          var temp = riverEdges[bitIndex & 15];
          if (temp !== Tile.RIVER && Random.getRandom(1))
            temp++;

          map.setTo(x, y, new Micro.Tile(temp));
        }
      }
    }
  };


  var isTree = function(tileValue) {
    return tileValue >= Tile.WOODS_LOW && tileValue <= Tile.WOODS_HIGH;
  };


  var smoothTrees = function(map) {
    for (var x = 0; x < map.width; x++) {
      for (var y = 0; y < map.height; y++) {
        if (isTree(map.getTileValue(x, y)))
          smoothTreesAt(map, x, y, false);
      }
    }
  };


  var smoothTreesAt = function(map, x, y, preserve) {
    var dx = [-1,  0,  1,  0 ];
    var dy = [ 0,  1,  0, -1 ];
    var treeTable = [
      0,  0,  0,  34,
      0,  0,  36, 35,
      0,  32, 0,  33,
      30, 31, 29, 37];

    if (!isTree(map.getTileValue(x, y)))
        return;

    var bitIndex = 0;
    for (var i = 0; i < 4; i++) {
      bitIndex = bitIndex << 1;
      var xTemp = x + dx[i];
      var yTemp = y + dy[i];
      if (map.testBounds(xTemp, yTemp) &&
          isTree(map.getTileValue(xTemp, yTemp)))
        bitIndex++;
    }

    var temp = treeTable[bitIndex & 15];
    if (temp) {
      if (temp !== Tile.WOODS) {
        if ((x + y) & 1)
            temp = temp - 8;
      }
      map.setTo(x, y, new Micro.Tile(temp, Tile.BLBNBIT));
    } else {
      if (!preserve)
        map.setTo(x, y, new Micro.Tile(temp));
    }
  };



  var doRivers = function(map, terrainPos) {
    var riverDir = Direction.NORTH + Random.getRandom(3) * 2;
    doBRiver(map, terrainPos, riverDir, riverDir);

    riverDir = Direction.rotate180(riverDir);
    var terrainDir = doBRiver(map, terrainPos, riverDir, riverDir);

    riverDir = Direction.NORTH + Random.getRandom(3) * 2;
    doSRiver(map, terrainPos, riverDir, terrainDir);
  };


  var doBRiver = function(map, riverPos, riverDir, terrainDir) {
    var rate1, rate2;

    if (TERRAIN_CURVE_LEVEL < 0) {
      rate1 = 100;
      rate2 = 200;
    } else {
      rate1 = TERRAIN_CURVE_LEVEL + 10;
      rate2 = TERRAIN_CURVE_LEVEL + 100;
    }

    var pos = new map.Position(riverPos);

    while (map.testBounds(pos.x + 4, pos.y + 4)) {
      plopBRiver(map, pos);
      if (Random.getRandom(rate1) < 10) {
        terrainDir = riverDir;
      } else {
        if (Random.getRandom(rate2) > 90)
          terrainDir = Direction.rotate45(terrainDir);
        if (Random.getRandom(rate2) > 90)
          terrainDir = Direction.rotate45(terrainDir, 7);
      }
      pos.move(terrainDir);
    }

    return terrainDir;
  };


  var doSRiver = function(map, riverPos, riverDir, terrainDir) {
    var rate1, rate2;

    if (TERRAIN_CURVE_LEVEL < 0) {
      rate1 = 100;
      rate2 = 200;
    } else {
      rate1 = TERRAIN_CURVE_LEVEL + 10;
      rate2 = TERRAIN_CURVE_LEVEL + 100;
    }

    var pos = new map.Position(riverPos);

    while (map.testBounds(pos.x + 3, pos.y + 3)) {
      plopSRiver(map, pos);
      if (Random.getRandom(rate1) < 10) {
        terrainDir = riverDir;
      } else {
        if (Random.getRandom(rate2) > 90)
          terrainDir = Direction.rotate45(terrainDir);
        if (Random.getRandom(rate2) > 90)
          terrainDir = Direction.rotate45(terrainDir, 7);
      }
      pos.move(terrainDir);
    }

    return terrainDir;
  };


  var putOnMap = function(map, newVal, x, y) {
    if (newVal === 0)
      return;

    if (!map.testBounds(x, y))
      return;

    var tileValue = map.getTileValue(x, y);

    if (tileValue !== Tile.DIRT) {
      if (tileValue === Tile.RIVER) {
        if (newVal !== Tile.CHANNEL)
            return;
      }
      if (tileValue === Tile.CHANNEL)
        return;
    }
    map.setTo(x, y, new Micro.Tile(newVal));
  };


  var plopBRiver = function(map, pos) {
    var BRMatrix = [
     [0, 0, 0, Tile.REDGE, Tile.REDGE, Tile.REDGE, 0, 0, 0],
     [0, 0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0, 0],
     [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
     [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
     [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.CHANNEL, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
     [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
     [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
     [0, 0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0, 0],
     [0, 0, 0, Tile.REDGE, Tile.REDGE, Tile.REDGE, 0, 0, 0]];

    for (var x = 0; x < 9; x++) {
      for (var y = 0; y < 9; y++) {
        putOnMap(map, BRMatrix[y][x], pos.x + x, pos.y + y);
      }
    }
  };


  var plopSRiver = function(map, pos) {
    var SRMatrix = [
      [0, 0, Tile.REDGE, Tile.REDGE, 0, 0],
      [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
      [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
      [Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.RIVER, Tile.REDGE],
      [0, Tile.REDGE, Tile.RIVER, Tile.RIVER, Tile.REDGE, 0],
      [0, 0, Tile.REDGE, Tile.REDGE, 0, 0]];

    for (var x = 0; x < 6; x++) {
      for (var y = 0; y < 6; y++) {
        putOnMap(map, SRMatrix[y][x], pos.x + x, pos.y + y);
      }
    }
  };


  var smoothWater = function(map) {
    var x, y, tile, pos, dir;

    for (x = 0; x < map.width; x++) {
      for (y = 0; y < map.height; y++) {
        tile = map.getTileValue(x, y);

       // if (tile >= Tile.WATER_Tile.LOW && tile <= Tile.WATER_Tile.HIGH) {
        if (tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
          pos = new map.Position(x, y);

          for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
            tile = map.getTileFromMap(pos, dir, Tile.WATER_LOW);

            /* If nearest object is not water: */
            if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
              map.setTo(x, y, new Micro.Tile(Tile.REDGE)); /* set river edge */
              break; // Continue with next tile
            }
          }
        }
      }
    }

    for (x = 0; x < map.width; x++) {
      for (y = 0; y < map.height; y++) {
        tile = map.getTileValue(x, y);

        if (tile !== Tile.CHANNEL && tile >= Tile.WATER_LOW && tile <= Tile.WATER_HIGH) {
          var makeRiver = true;

          pos = new map.Position(x, y);
          for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
            tile = map.getTileFromMap(pos, dir, Tile.WATER_LOW);

            if (tile < Tile.WATER_LOW || tile > Tile.WATER_HIGH) {
              makeRiver = false;
              break;
            }
          }

          if (makeRiver)
            map.setTo(x, y, new Micro.Tile(Tile.RIVER));
        }
      }
    }

    for (x = 0; x < map.width; x++) {
      for (y = 0; y < map.height; y++) {
        tile = map.getTileValue(x, y);

        if (tile >= Tile.WOODS_LOW && tile <= Tile.WOODS_HIGH) {
           pos = new map.Position(x, y);
           for (dir = Direction.BEGIN; dir < Direction.END; dir = Direction.increment90(dir)) {
             tile = map.getTileFromMap(pos, dir, Tile.TILE_INVALID);

             if (tile === Tile.RIVER || tile === Tile.CHANNEL) {
               map.setTo(x, y, new Micro.Tile(Tile.REDGE)); /* make it water's edge */
               break;
             }
           }
        }
      }
    }
  };
