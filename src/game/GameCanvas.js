
Micro.GameCanvas = function(id, parentNode, width, height) {

    this._canvas = document.createElement('canvas');
    this._canvas.id = Micro.DEFAULT_ID;
    this._canvas.width = Micro.DEFAULT_WIDTH;
    this._canvas.height = Micro.DEFAULT_HEIGHT;

    // We will set this for real after a successful init
    this._justConstructed = false;
    this._moved = false;
    this._pendingTileSet = null;

    parentNode = document.getElementById("canvasContainer");
    parentNode.appendChild(this._canvas);

    this.ready = false;
}

Micro.GameCanvas.prototype = {

    constructor: Micro.GameCanvas,

    init : function(map, tileSet, spriteSheet) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 3) throw e;
        if (!tileSet.loaded) throw new Error('TileSet not ready!');

        this._spriteSheet = spriteSheet;
        this._tileSet = tileSet;
        var w = this._tileSet.tileWidth;
        this._map = map;
        this._animationManager = new Micro.AnimationManager(map);

        if (this._canvas.width < w || this._canvas.height < w) throw new Error('Canvas too small!');

        this._calculateMaximaAndMinima();

        // Order is important here. ready must be set before the call to centreOn below
        this.ready = true;
        this.centreOn(Math.floor(this._map.width / 2), Math.floor(this._map.height / 2));

        this._justConstructed = true;
        this.paint(null, null);
    },
    _calculateMaximaAndMinima : function() {
        var w = this._tileSet.tileWidth;
        this.minX = 0 - Math.ceil(Math.floor(this._canvas.width/w) / 2);
        this.maxX = (this._map.width - 1) - Math.ceil(Math.floor(this._canvas.width/w) / 2);
        this.minY = 0 - Math.ceil(Math.floor(this._canvas.height/w) / 2);
        this.maxY = (this._map.height - 1) - Math.ceil(Math.floor(this._canvas.height/w) / 2);
        this._wholeTilesInViewX = Math.floor(this._canvas.width / w);
        this._wholeTilesInViewY = Math.floor(this._canvas.height / w);
        this._totalTilesInViewX = Math.ceil(this._canvas.width / w);
        this._totalTilesInViewY = Math.ceil(this._canvas.height / w);
    },
    moveNorth : function() {
        if (!this.ready) throw new Error("Not ready!");
        if (this._originY > this.minY) {
            this._moved = true;
            this._originY--;
        }
    },
    moveEast : function() {
        if (!this.ready) throw new Error("Not ready!");
        if (this._originX < this.maxX) {
            this._moved = true;
            this._originX++;
        }
    },
    moveSouth : function() {
        if (!this.ready) throw new Error("Not ready!");
        if (this._originY < this.maxY) {
            this._moved = true;
            this._originY++;
        }
    },
    moveWest : function() {
        if (!this.ready) throw new Error("Not ready!");
        if (this._originX > this.minX) {
            this._moved = true;
            this._originX--;
        }
    },
    moveTo : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        if (!this.ready) throw new Error("Not ready!");
        if (x < this.minX || x > this.maxX || y < this.minY || y > this.maxY) throw new Error('Coordinates out of bounds');

        this._originX = x;
        this._originY = y;
        this._moved = true;
    },
    centreOn : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        if (!this.ready) throw new Error("Not ready!");

        if (y === undefined) {
            y = x.y;
            x = x.x;
        }
        this._originX = Math.floor(x) - Math.ceil(this._wholeTilesInViewX / 2);
        this._originY = Math.floor(y) - Math.ceil(this._wholeTilesInViewY / 2);
        this._moved = true;
    },
    getTileOrigin : function() {
        var e = new Error('Not ready!');
        if (!this.ready) throw e;
        return {x: this._originX, y: this._originY};
    },
    getMaxTile : function() {
        var e = new Error('Not ready!');
        if (!this.ready) throw e;
        return {x: this._originX + this._totalTilesInViewX - 1, y: this._originY + this._totalTilesInViewY - 1};
    },
    canvasCoordinateToTileOffset : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        if (!this.ready) throw new Error("Not ready!");
        return {x: Math.floor(x / this._tileSet.tileWidth), y: Math.floor(y / this._tileSet.tileWidth)};
    },
    canvasCoordinateToTileCoordinate : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        if (!this.ready) throw new Error("Not ready!");
        if (x >= this._canvas.width || y >= this._canvas.height) return null;
        return {x: this._originX + Math.floor(x/this._tileSet.tileWidth), y: this._originY + Math.floor(y/this._tileSet.tileWidth)};
    },
    canvasCoordinateToPosition : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2) throw e;
        if (!this.ready) throw new Error("Not ready!");
        if (x >= this._canvas.width || y >= this._canvas.height) return null;
        x = this._originX + Math.floor(x / this._tileSet.tileWidth);
        y = this._originY + Math.floor(y / this._tileSet.tileWidth);
        if (x < 0 || x >= this._map.width || y < 0 || y >= this._map.height) return null;
        return new this._map.Position(x, y);
    },
    positionToCanvasCoordinate : function(p) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        return this.tileToCanvasCoordinate(p);
    },
    tileToCanvasCoordinate : function(x, y) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        if (!this.ready) throw new Error("Not ready!");
        if (y === undefined) {
            y = x.y;
            x = x.x;
        }

        if (x === undefined || y === undefined || x < this.minX || y < this.minY || x > (this.maxX + this._totalTilesInViewX - 1) || y > (this.maxY + this._totalTilesInViewY - 1)) throw e;
        if (x < this._originX || x >= this._originX + this._totalTilesInViewX || y < this._originY || y >= this._originY + this._totalTilesInViewY) return null;

        return {x: (x - this._originX) * this._tileSet.tileWidth, y: (y - this._originY) * this._tileSet.tileWidth};
    },
    changeTileSet : function(tileSet) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        if (!this.ready) throw new Error("Not ready!");
        if (!tileSet.loaded) throw new Error('new tileset not loaded');
        if (this._pendingTileSet && (this._pendingHeight || this._pendingWidth)) throw new Error('dimensions have changed');

        var w = tileSet.tileWidth;
        var canvasWidth = this._pendingWidth === null ? this._canvas.width : this._pendingWidth;
        var canvasHeight = this._pendingHeight === null ? this._canvas.height : this._pendingHeight;

        if (canvasWidth < w || canvasHeight < w) throw new Error('canvas too small');

        this._pendingTileSet = tileSet;
    },
    takeScreenshot : function(onlyVisible) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 1) throw e;
        if (!this.ready) throw new Error("Not ready!");
        if (onlyVisible) return this._canvas.toDataURL();

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = this._map.width * this._tileSet.tileWidth;
        tempCanvas.height = this._map.height * this._tileSet.tileWidth;

        for (var x = 0; x < this._map.width; x++) {
            for (var y = 0; y < this._map.height; y++) {
                this._paintTile(this._map.getTileValue(x, y), x * this._tileSet.tileWidth, y * this._tileSet.tileWidth, tempCanvas);
            }
        }
        return tempCanvas.toDataURL();
    },
    shoogle : function() {
        // TODO
    },
    _paintTile : function(tileVal, x, y, canvas) {
        canvas = canvas || this._canvas;
        var src = this._tileSet[tileVal];

        var ctx = canvas.getContext('2d');
        ctx.drawImage(src, x, y);
    },
    _paintVoid : function(x, y, w, h, col) {
        col = col || 'black';
        var ctx = this._canvas.getContext('2d');
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w, h);
    },
    _getDataForPainting : function() {
        // Calculate bounds of tiles we're going to paint
        var xStart = this._originX;
        var yStart = this._originY;
        var xEnd = this._totalTilesInViewX;
        var yEnd = this._totalTilesInViewY;

        if (xStart < 0) {
          // Chop off number of tiles in void
          xEnd = xEnd + xStart;
          xStart = 0;
        }

        if (yStart < 0) {
          // Chop off number of tiles in void
          yEnd = yEnd + yStart;
          yStart = 0;
        }

        if (xStart + xEnd > this._map.width)
          xEnd = this._map.width - xStart;

        if (yStart + yEnd > this._map.height)
          yEnd = this._map.height - yStart;

        return {offsetX: xStart - this._originX,
                offsetY: yStart - this._originY,
                tileData: this._map.getTiles(xStart, yStart, xEnd, yEnd)};
    },
    _fullRepaint : function(paintData) {
        var ctx = this._canvas.getContext('2d');
        var start, end;

        // First, clear canvas
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Paint any black voids
        if (this._originX < 0) this._paintVoid(0, 0, this._tileSet.tileWidth * (0 - this._originX), this._canvas.height);
        

        if (this._originX + this._totalTilesInViewX > this._map.width) {
           start = this.tileToCanvasCoordinate(this._map.width, this._originY).x;
            end = this._canvas.width - start;
            this._paintVoid(start, 0, end, this._canvas.height);
        }

        if (this._originY < 0) {
            this._paintVoid(0, 0, this._canvas.width, this._tileSet.tileWidth * (0 - this._originY));
        }

        if (this._originY + this._totalTilesInViewY > this._map.height) {
            start = this.tileToCanvasCoordinate(this._originX, this._map.height).x;
            end = this._canvas.height - start;
            this._paintVoid(0, start, this._canvas.width, end);
        }

        var xOffset = paintData.offsetX;
        var yOffset = paintData.offsetY;
        var tilesToPaint = paintData.tileData;

        for (var y = 0; y < tilesToPaint.length; y++) {
            var xs = tilesToPaint[y];
            for (var x = 0, l2 = xs.length; x < l2; x++) {
                this._paintTile(xs[x].getValue(), (x + xOffset) * this._tileSet.tileWidth, (y + yOffset) * this._tileSet.tileWidth);
            }
        }
    },
    _paintAnimatedTiles : function(isPaused) {
        var xMin = this._originX, xMax = xMin + this._totalTilesInViewX + 1;
        var yMin = this._originY, yMax = yMin + this._totalTilesInViewY + 1;

        var animatedTiles = this._animationManager.getTiles(xMin, yMin, xMax, yMax, isPaused);
        for (var i = 0, l = animatedTiles.length; i < l; i++) {
            var tile = animatedTiles[i];
            this._paintTile(tile.tileValue, (tile.x - xMin) * this._tileSet.tileWidth, (tile.y - yMin) * this._tileSet.tileWidth);
        }
    },


    _processSprites : function(spriteList) {
        var ctx = this._canvas.getContext('2d');
        for (var i = 0, l = spriteList.length; i < l; i++) {
            var sprite = spriteList[i];
            ctx.drawImage(this._spriteSheet,
                        (sprite.frame - 1) * 48,
                        (sprite.type - 1) * 48,
                        sprite.width,
                        sprite.width,
                        sprite.x + sprite.xOffset - this._originX * 16,
                        sprite.y + sprite.yOffset - this._originY * 16,
                        sprite.width,
                        sprite.width);
        }
    },


    _processMouse : function(mouse) {
        if (mouse.width === 0 || mouse.height === 0) return;

        // For outlines bigger than 2x2 (in either dimension) assume the mouse is offset by
        // one tile
        var mouseX = mouse.x;
        var mouseY = mouse.y;
        var mouseWidth = mouse.width;
        var mouseHeight = mouse.height;
        var options = {colour: mouse.colour, outline: true};

        if (mouseWidth > 2) mouseX -= 1;
        if (mouseHeight > 2) mouseY -= 1;

        var offMap = (this._originX + mouseX < 0 && this._originX + mouseX + mouseWidth <= 0) ||
                     (this._originY + mouseY < 0 && this._originY + mouseY + mouseHeight <= 0) ||
                     this._originX + mouseX >= this._map.width || this._originY + mouseY >= this._map.height;

        if (offMap) return;

        var pos = {x: mouseX * this._tileSet.tileWidth, y: mouseY * this._tileSet.tileWidth};
        var width = mouseWidth * this._tileSet.tileWidth;
        var height = mouseHeight * this._tileSet.tileWidth;
        Micro.MouseBox.draw(this._canvas, pos, width, height, options);
    },

    paint : function(mouse, sprites, isPaused) {
        var e = new Error('Invalid parameter');
        if (arguments.length < 2)  throw e;
        if (!this.ready) throw new Error("Not ready!");

        // Change tileSet if necessary
        var tileSetChanged = false;
        if (this._pendingTileSet !== null) {
            this._tileSet = this._pendingTileSet;
            this._pendingTileSet = null;
            tileSetChanged = true;
        }

        // Make any pending dimension changes to the canvas
        var dimensionsChanged = false;

        if (tileSetChanged || dimensionsChanged) this._calculateMaximaAndMinima();

        // TODO Selective repainting
        var needsFullPaint = true;
        if (this._justConstructed || this._moved || tileSetChanged) {
            this._justConstructed = false;
            this._moved = false;
            needsFullPaint = true;
        }

        var mapData = this._getDataForPainting();

        if (needsFullPaint) this._fullRepaint(mapData);
        this._paintAnimatedTiles(isPaused);
        if (mouse) this._processMouse(mouse);
        if (sprites) this._processSprites(sprites);
    }
}