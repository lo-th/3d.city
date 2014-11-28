/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.DisasterWindow = function(opacityLayerID, disasterWindowID){
    this._opacityLayer =  opacityLayerID;
    this._disasterWindowID = disasterWindowID;
    //this._opacityLayer =  '#' + opacityLayerID;
    //this._disasterWindowID = '#' + disasterWindowID;
    this._requestedDisaster = Micro.DISASTER_NONE;
    
    var _this = this;

    document.getElementById('disasterCancel').addEventListener( 'click', function(e) { _this.cancel(e); }, false );
    document.getElementById('disasterForm').addEventListener( 'submit', function(e) { _this.submit(e); }, false );
}

Micro.DisasterWindow.prototype = {

    constructor: Micro.DisasterWindow,

    _toggleDisplay : function() {
    var opacityLayer = document.getElementById(this._opacityLayer);
    var disasterWindow = document.getElementById(this._disasterWindowID);
    if(opacityLayer.style.display !== "block")opacityLayer.style.display = "block";
    else opacityLayer.style.display = "none";
    if(disasterWindow.style.display !== "block")disasterWindow.style.display = "block";
    else{ disasterWindow.style.display = "none"; }
  },
  _registerButtonListeners : function() {
    //$('#' + disasterCancelID).one('click', cancel.bind(this));
    //$('#' + disasterFormID).one('submit', submit.bind(this));
  },
  open : function(callback) {
    //var i;
    this._callback = callback;

    // Ensure options have right values
    /*$('#disasterNone').attr('value', DisasterWindow.DISASTER_NONE);
    $('#disasterMonster').attr('value', DisasterWindow.DISASTER_MONSTER);
    $('#disasterFire').attr('value', DisasterWindow.DISASTER_FIRE);
    $('#disasterFlood').attr('value', DisasterWindow.DISASTER_FLOOD);
    $('#disasterCrash').attr('value', DisasterWindow.DISASTER_CRASH);
    $('#disasterMeltdown').attr('value', DisasterWindow.DISASTER_MELTDOWN);
    $('#disasterTornado').attr('value', DisasterWindow.DISASTER_TORNADO);*/

    //document.getElementById("disasterNone").getAttribute()

   // this._registerButtonListeners();
    this._toggleDisplay();
  },
  cancel : function(e) {
    e.preventDefault();
    /*$('#' + disasterFormID).off();*/
    this._toggleDisplay();
    this._callback(Micro.DISASTER_NONE);
  },
  submit : function(e) {
    e.preventDefault();

    var requestedDisaster = document.getElementById('disasterSelect').value;

    console.log(requestedDisaster);

    // Get element values
    /*var requestedDisaster = $('#' + disasterSelectID)[0].value;
    $('#' + disasterFormID).off();*/
    this._toggleDisplay();
    this._callback(requestedDisaster);
  }

}