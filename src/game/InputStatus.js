/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.InputStatus = function(map){
    this.gameTools = new Micro.GameTools(map);
    this.canvas = document.getElementById(Micro.DEFAULT_ID);

    // Tool clicks
    this.clickX = -1;
    this.clickY = -1;

    // Keyboard Movement
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;

    // Mouse movement
    this.mouseX = -1;
    this.mouseY = -1;

    // Tool buttons
    this.toolName = null;
    this.currentTool = null;
    this.toolWidth = 0;
    this.toolColour = '';

    // Other buttons
    this.budgetRequested = false;
    this.evalRequested = false;
    this.disasterRequested = false;

    // Speed
    this.speedChangeRequested = false;
    this.requestedSpeed = null;

    this.bindKeys();

    var _this = this;
    this.canvas.addEventListener( 'mouseenter', function(e) { _this.mouseEnterHandler(e); }, false );
    this.canvas.addEventListener( 'mouseleave', function(e) { _this.mouseLeaveHandler(e); }, false );

    var bb = document.getElementsByClassName('toolButton');
    for(var i=0; i<bb.length; i++){
        bb[i].addEventListener( 'click', function(e) { _this.toolButtonHandler(e); }, false );
        bb[i].addEventListener( 'mouseover', function(e) { _this.toolButtonOver(e); }, false );
    }

    document.getElementById('evalRequest').addEventListener( 'click', function(e) { _this.evalHandler(e); } , false );
    document.getElementById('budgetRequest').addEventListener( 'click', function(e) { _this.budgetHandler(e); } , false );
    document.getElementById('disasterRequest').addEventListener( 'click', function(e) { _this.disasterHandler(e); } , false );
    document.getElementById('pauseRequest').addEventListener( 'click', function(e) { _this.speedChangeHandler(e); } , false );
}

Micro.InputStatus.prototype = {

    constructor: Micro.InputStatus,

    bindKeys : function() {
        var _this = this;
        document.onkeydown = function(e) {
            e = e || window.event;
            var handled = false;
            if (e.keyCode == 38) { _this.up = true; handled = true; }
            else if (e.keyCode == 40) { _this.down = true; handled = true; } 
            else if (e.keyCode == 39) { _this.right = true; handled = true; } 
            else if (e.keyCode == 37) { _this.left = true; handled = true; }
            if (handled) e.preventDefault();
        };
        document.onkeyup = function(e) {
            e = e || window.event;
            if (e.keyCode == 38) _this.up = false;
            if (e.keyCode == 40) _this.down = false;
            if (e.keyCode == 39) _this.right = false;
            if (e.keyCode == 37) _this.left = false;
        };
        // self.focus()
    },
    clickHandled : function() {
        this.clickX = -1;
        this.clickY = -1;
        this.currentTool.clear();
    },
    getRelativeCoordinates : function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var dx = window.innerWidth-200;
        var x;
        var y;
        if (e.x !== undefined && e.y !== undefined) {
            x = e.x- rect.left;
            y = e.y- rect.top;
        } else {
            x = e.clientX -  rect.left;//+ 0;
            y = e.clientY - rect.top;
        }
        return {x: x, y: y};
    },
    speedChangeHandled : function() {
        this.speedChangeRequested = false;
        this.requestedSpeed = null;
    },
    speedChangeHandler : function(e) {
        this.speedChangeRequested = true;
        var requestedSpeed = document.getElementById('pauseRequest').innerHTML;
        var newRequest = requestedSpeed === 'Pause' ? 'Play' : 'Pause';
        document.getElementById('pauseRequest').innerHTML=newRequest;
    },
    mouseEnterHandler : function(e) {
        var _this = this;
        this.canvas.addEventListener( 'mousemove', function(e) { _this.mouseMoveHandler(e); }, false );
        this.canvas.addEventListener( 'click', function(e) { _this.canvasClickHandler(e); }, false );
    },
    mouseLeaveHandler : function(e) {
        var _this = this;
        this.canvas.removeEventListener( 'mousemove', function(e) { _this.mouseMoveHandler(e); }, false );
        this.canvas.removeEventListener( 'click', function(e) { _this.canvasClickHandler(e); }, false );
        this.mouseX = -1;
        this.mouseY = -1;
    },
    mouseMoveHandler : function(e) {
        var coords = this.getRelativeCoordinates(e);
        this.mouseX = coords.x;
        this.mouseY = coords.y;
    },
    canvasClickHandler : function(e) {
        this.clickX = this.mouseX;
        this.clickY = this.mouseY;
        e.preventDefault();
    },
    toolButtonOver : function(e) {
        var name = e.target.getAttribute("data-tool");
        var price = e.target.getAttribute("data-price");
        if(price == 0){ price = ""; name = "info"}
        else price += "$";
        document.getElementById('buttonsInfos').innerHTML = name +" "+ price;
    },
    toolButtonHandler : function(e) {
        var bb = document.getElementsByClassName('selected');
        for(var i=0; i<bb.length; i++){
            bb[i].className = bb[i].className.replace("selected", "unselected");
        }
        e.target.className = e.target.className.replace("unselected", "selected");
        this.toolName = e.target.getAttribute("data-tool");
        this.toolWidth = e.target.getAttribute("data-size");
        this.currentTool = this.gameTools[this.toolName];
        this.toolColour = e.target.getAttribute("data-colour");
        e.preventDefault();
    },
    disasterHandler : function(e) {
        this.disasterRequested = true;
    },
    evalHandler : function(e) {
        this.evalRequested = true;
    },
    budgetHandler : function(e) {
        this.budgetRequested = true;
    },
    evalHandled : function(e) {
        this.evalRequested = false;
    },
    disasterHandled : function(e) {
        this.disasterRequested = false;
    },
    budgetHandled : function(e) {
        this.budgetRequested = false;
    }
}