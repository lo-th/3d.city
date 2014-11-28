/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.EvaluationWindow = function(opacityLayerID, evaluationWindowID){
    //this._opacityLayer =  '#' + opacityLayerID;
    //this._evaluationWindowID = '#' + evaluationWindowID;
    this._opacityLayer =  opacityLayerID;
    this._evaluationWindowID = evaluationWindowID;

    var _this = this;
    
    document.getElementById('evalForm').addEventListener( 'submit', function(e) { _this.submit(e); }, false );
    document.getElementById('evalOK').addEventListener( 'click', function(e) { _this.submit(e); }, false );
  }

Micro.EvaluationWindow.prototype = {
    constructor: Micro.EvaluationWindow,
    _toggleDisplay : function() {
    var opacityLayer = document.getElementById(this._opacityLayer);// $(this._opacityLayer);
    /*opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    if (opacityLayer === null)
      throw new Error('Node ' + orig + ' not found');*/

    var evaluationWindow = document.getElementById(this._evaluationWindowID);//$(this._evaluationWindowID);
    /*evaluationWindow = evaluationWindow.length === 0 ? null : evaluationWindow;
    if (evaluationWindow === null)
      throw new Error('Node ' + orig + ' not found');*/

    //opacityLayer.toggle();
    //evaluationWindow.toggle();

    if(opacityLayer.style.display !== "block")opacityLayer.style.display = "block";
    else opacityLayer.style.display = "none";
    if(evaluationWindow.style.display !== "block")evaluationWindow.style.display = "block";
    else evaluationWindow.style.display = "none";
    //evaluationWindow.style.display = "block";
  },
  _populateWindow : function(evaluation) {
    document.getElementById("evalYes").innerHTML=(evaluation.cityYes);
    document.getElementById("evalNo").innerHTML=(100-evaluation.cityYes);
    //$('#evalYes').text(evaluation.cityYes);
   // $('#evalNo').text(100 - evaluation.cityYes);
    for (var i = 0; i < 4; i++) {
      var problemNo = evaluation.getProblemNumber(i);
      var text = '';
      if (problemNo !== -1)
        text = Text.problems[problemNo];
      //$('#evalProb' + (i + 1)).text(text);
      document.getElementById("evalProb"+ (i + 1)).innerHTML=text;
    }

    document.getElementById("evalPopulation").innerHTML=evaluation.cityPop;
    document.getElementById("evalMigration").innerHTML=evaluation.cityPopDelta;
    document.getElementById("evalValue").innerHTML=evaluation.cityAssessedValue;
    document.getElementById("evalLevel").innerHTML=TXT.gameLevel[evaluation.gameLevel]
    document.getElementById("evalClass").innerHTML=TXT.cityClass[evaluation.cityClass]
    document.getElementById("evalScore").innerHTML=evaluation.cityScore
    document.getElementById("evalScoreDelta").innerHTML=evaluation.cityScoreDelta

   /* $('#evalPopulation').text(evaluation.cityPop);
    $('#evalMigration').text(evaluation.cityPopDelta);
    $('#evalValue').text(evaluation.cityAssessedValue);
    $('#evalLevel').text(Text.gameLevel[evaluation.gameLevel]);
    $('#evalClass').text(Text.cityClass[evaluation.cityClass]);
    $('#evalScore').text(evaluation.cityScore);
    $('#evalScoreDelta').text(evaluation.cityScoreDelta);*/
  },
  open : function(callback, evaluation) {
    this._callback = callback;
    this._populateWindow(evaluation);
    this._toggleDisplay();
  },
  submit : function(e) {
    e.preventDefault();

    // TODO Fix for enter keypress: submit isn't fired on FF due to form
    // only containing the submit button
    this._callback();

    this._toggleDisplay();
  }

}