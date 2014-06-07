Micro.SpriteLoader = function(src){
    this.src = src;
    this._loadCallback = null;
    this._errorCallback = null;
}

Micro.SpriteLoader.prototype = {

    constructor: Micro.SpriteLoader,

    _loadCB : function() {
        var callback = this._loadCallback;
        this._loadCallback = null;
        this._errorCallback = null;
        callback(this._spriteSheet);
    },
    _errorCB : function() {
        var callback = this._errorCallback;
        this._loadCallback = null;
        this._errorCallback = null;
        this._spriteSheet = null;
        callback();
    },
    load : function(loadCallback, errorCallback) {
        this._loadCallback = loadCallback;
        this._errorCallback = errorCallback;

        this._spriteSheet = new Image();
        this._spriteSheet.onerror = this._errorCB.bind(this);
        this._spriteSheet.onload = this._loadCB.bind(this);
        this._spriteSheet.src = this.src;
    }
}
