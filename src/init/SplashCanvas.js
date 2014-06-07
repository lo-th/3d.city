
Micro.SplashCanvas = function(){

    /*this._canvas = document.createElement('canvas');
    this._canvas.id = Micro.MAP_DEFAULT_ID;
    this._canvas.width = Micro.MAP_DEFAULT_WIDTH;
    this._canvas.height = Micro.MAP_DEFAULT_HEIGHT;*/

    this.canvas = document.createElement('canvas');
    this.canvas.id = Micro.MAP_BIG_DEFAULT_ID;
    this.canvas.width = Micro.MAP_DEFAULT_WIDTH;
    this.canvas.height = Micro.MAP_DEFAULT_HEIGHT;

    

    var parentNode=document.getElementById('SplashCanvas');
    parentNode.removeChild(parentNode.firstChild);
    parentNode.appendChild(this.canvas);
}

Micro.SplashCanvas.prototype = {

    constructor: Micro.SplashCanvas,

    init : function(map, tileSet) {
        //if (!tileSet.loaded) throw new Error('TileSet not ready!');

        this._tileSet = tileSet;
        this.paint(map);
    },
    paintTile : function(tileVal, x, y, canvas) {
        //canvas = canvas || this._canvas;
        var src = this._tileSet[tileVal];
        var ctx = this.canvas.getContext('2d');
        ctx.drawImage(src, x * 3, y * 3, 3, 3);
    },
    /*paintTile : function(tileVal, x, y) {
        var src = this._tileSet[tileVal];
        var ctx = this.canvas.getContext('2d');
        ctx.drawImage(src, x * 16, y * 16, 16, 16);
    },*/
    clearMap : function() {
        var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    paint : function(map) {
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        var y = map.height;
        var x;
        while(y--){
            x=map.width;
            while(x--){
        //for (var y = 0; y < map.height; y++) {
           // for (var x = 0; x < map.width; x++) {
               // this.paintTile(map.getTileValue(x, y), x, y);
                this.paintTile(map.getTileValue(x, y), x, y);
            }
        }
    }

}
