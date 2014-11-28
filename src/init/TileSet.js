/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.TileSet = function(src, loadCallback, errorCallback){
    //if (!(this instanceof TileSet)) return new TileSet(src, loadCallback, errorCallback);

    //var e = new Error('Invalid parameter');
    //if (arguments.length < 3) throw e;

    this.loaded = false;
    this._successCallback = loadCallback;
    this._errorCallback = errorCallback;
    var self = this;

    if (src instanceof Image) {
        // we need to spin event loop here for sake of callers
        // to ensure constructor returns before callback called
        setTimeout(function() {self._verifyImage(src);}, 0);
    } else {
        var img = new Image();
        img.onload = function() { self._verifyImage(img); };
        img.onerror = function() { self._triggerCallback(false); };
        img.src = src;
    }
};

Micro.TileSet.prototype = {

    constructor: Micro.TileSet,

    load : function(src, loadCallback, errorCallback) {
        //var e = new Error('Invalid parameter');
        //if (arguments.length < 3) throw e;

        // Don't allow overwriting an already loaded tileset
        if (this.loaded) throw new Error("TileSet already loaded");

        this._successCallback = loadCallback;
        this._errorCallback = errorCallback;
        if (src instanceof Image) {
          this._verifyImage(src);
        } else {
            var img = new Image();
            var self = this;

            img.onload = function() { self._verifyImage(img); };
            img.onerror = function() { self._triggerCallback(false); };
            img.src = src;
        }
    },

    _triggerCallback : function (successful) {
        if (!this._successCallback) // image supplied, no callbacks
          return;

        var cb = this._successCallback;
        if (!successful) cb = this._errorCallback;

        delete this._successCallback;
        delete this._errorCallback;

        cb();
    },
    _verifyImage : function (img) {
        var w = img.width, h = img.height;
        var tilesPerRow = Math.sqrt(Tile.TILE_COUNT);

        if (w !== h) {
            this._triggerCallback(false);
            return;
        }
        if ((w % tilesPerRow) !== 0) {
            this._triggerCallback(false);
            return;
        }

        this.tileWidth = w / tilesPerRow;
        var tileWidth = this.tileWidth;

        if (tileWidth < Tile.MIN_SIZE) {
            this._triggerCallback(false);
            return;
        }

        var notifications = 0;
        var self = this;

        // Paint the image onto a canvas so we can split it up
        var c = document.createElement('canvas');
        c.width = this.tileWidth;
        c.height = this.tileWidth;

        var cx = c.getContext('2d');

        var imageLoad = function() {
            notifications++;
            if (notifications == Tile.TILE_COUNT) {
                self.loaded = true;
                self._triggerCallback(true);
            }
        };

        for (var i = 0; i < Tile.TILE_COUNT; i++) {
            cx.clearRect(0, 0, this.tileWidth, this.tileWidth);

            var sourceX = i % tilesPerRow * tileWidth;
            var sourceY = Math.floor(i / tilesPerRow) * tileWidth;
            cx.drawImage(img, sourceX, sourceY, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);

            this[i] = new Image();
            this[i].onload = imageLoad;
            this[i].src = c.toDataURL();
        }
    }
};