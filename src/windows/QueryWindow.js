/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.QueryWindow = function(opacityLayerID, queryWindowID){
  
    this._opacityLayer =  opacityLayerID;
    this._queryWindowID = queryWindowID;
    this._debugToggled = false;

    this.debug = false;

    var _this = this;

    document.getElementById('queryForm').addEventListener( 'submit', function(e) { _this.submit(e); }, false );
    document.getElementById('queryOK').addEventListener( 'click', function(e) { _this.submit(e); }, false );
  }

  // Keep in sync with QueryTool
//  var debug = false;

 

Micro.QueryWindow.prototype = {
    constructor: Micro.QueryWindow,
    _toggleDisplay : function() {
    var opacityLayer = document.getElementById(this._opacityLayer);//$(this._opacityLayer);
    /*opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    if (opacityLayer === null)
      throw new Error('Node ' + orig + ' not found');*/

    var queryWindow = document.getElementById(this._queryWindowID);//$(this._queryWindowID);
   /* queryWindow = queryWindow.length === 0 ? null : queryWindow;
    if (queryWindow === null)
      throw new Error('Node ' + orig + ' not found');*/

    //opacityLayer.toggle();
    //queryWindow.toggle();
    if(opacityLayer.style.display !== "block")opacityLayer.style.display = "block";
    else opacityLayer.style.display = "none";
    if(queryWindow.style.display !== "block")queryWindow.style.display = "block";
    else{ queryWindow.style.display = "none"; }

    if (this.debug && !this.debugToggled) {
      //$('#queryDebug').removeClass('hidden');
      this.debugToggled = true;
    }
  },
  open : function(callback) {
    this._callback = callback;
    this._toggleDisplay();
  },
  submit : function(e) {
    e.preventDefault();
    this._callback();
    this._toggleDisplay();
  }


}
