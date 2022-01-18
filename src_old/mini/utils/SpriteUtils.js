/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.pixToWorld = function(p) {
    return p >> 4;
};

Micro.worldToPix = function(w) {
    return w << 4;
};

// Attempt to move 45° towards the desired direction, either
// clockwise or anticlockwise, whichever gets us there quicker
Micro.turnTo = function(presentDir, desiredDir) {
    if (presentDir === desiredDir)
        return presentDir;

    if (presentDir < desiredDir) {
        // select clockwise or anticlockwise
        if (desiredDir - presentDir < 4) presentDir++;
        else presentDir--;
    } else {
        if (presentDir - desiredDir < 4) presentDir--;
        else presentDir++;
    }
    if (presentDir > 8) presentDir = 1;
    if (presentDir < 1) presentDir = 8;
    return presentDir;
};

Micro.absoluteValue = function(x) {
    return Math.abs(x);
};

Micro.getTileValue = function(map, x, y) {
    var wX = Micro.pixToWorld(x);
    var wY = Micro.pixToWorld(y);
    if (wX < 0 || wX >= map.width || wY < 0 || wY >= map.height)  return -1;
    return map.getTileValue(wX, wY);
};


// Choose the best direction to get from the origin to the destination
// If the destination is equidistant in both x and y deltas, a diagonal
// will be chosen, otherwise the most 'dominant' difference will be selected
// (so if a destination is 4 units north and 2 units east, north will be chosen).
// This code seems to always choose south if we're already there which seems like
// a bug
Micro.directionTable = [0, 3, 2, 1, 3, 4, 5, 7, 6, 5, 7, 8, 1];

Micro.getDir = function(orgX, orgY, destX, destY) {
    var deltaX = destX - orgX;
    var deltaY = destY - orgY;
    var i;
    if (deltaX < 0) {
        if (deltaY < 0) { i = 11; } else { i = 8; }
    } else {
        if (deltaY < 0) { i = 2; } else { i = 5; }
    }
    deltaX = Math.abs(deltaX);
    deltaY = Math.abs(deltaY);

    if (deltaX * 2 < deltaY) i++;
    else if (deltaY * 2 < deltaX) i--;
    if (i < 0 || i > 12) i = 0;
    return Micro.directionTable[i];
};

Micro.absoluteDistance = function(orgX, orgY, destX, destY) {
    var deltaX = destX - orgX;
    var deltaY = destY - orgY;
    return Math.abs(deltaX) + Math.abs(deltaY);
};

Micro.checkWet = function(tileValue) {
    if (tileValue === Tile.HPOWER || tileValue === Tile.VPOWER || tileValue === Tile.HRAIL || tileValue === Tile.VRAIL || tileValue === Tile.BRWH || tileValue === Tile.BRWV) return true;
    else  return false;
};

Micro.destroyMapTile = function(spriteManager, map, blockMaps, ox, oy) {
    var x = Micro.pixToWorld(ox);
    var y = Micro.pixToWorld(oy);
    if (!map.testBounds(x, y)) return;
    var tile = map.getTile(x, y);
    var tileValue = tile.getValue();
    if (tileValue < Tile.TREEBASE) return;
    if (!tile.isCombustible()) {
        if (tileValue >= Tile.ROADBASE && tileValue <= Tile.LASTROAD) map.setTo(x, y, new Micro.Tile(Tile.RIVER));
        return;
    }
    if (tile.isZone()) {
        Micro.fireZone(map, x, y, blockMaps);
        if (tileValue > Tile.RZB) spriteManager.makeExplosionAt(ox, oy);
    }
    if (Micro.checkWet(tileValue)) map.setTo(x, y, new Micro.Tile(Tile.RIVER));
    else map.setTo(x, y, new Micro.Tile(Tile.TINYEXP, Tile.BULLBIT | Tile.ANIMBIT));
};

Micro.getDistance = function(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

Micro.checkSpriteCollision = function(s1, s2) {
    return s1.frame !== 0 && s2.frame !== 0 && Micro.getDistance(s1.x, s1.y, s2.x, s2.y) < 30;
};