
//define([], function() {  "use strict";
Micro.BudgetWindow = function(opacityLayerID, budgetWindowID){
 // function BudgetWindow(opacityLayerID, budgetWindowID) {
    this._opacityLayer =  opacityLayerID;
    this._budgetWindowID = budgetWindowID;

    this.dataKeys = ['roadFund', 'fireFund', 'policeFund'];
    this.spendKeys = ['roadRate', 'fireRate', 'policeRate'];


    var _this = this;

    document.getElementById('budgetReset').addEventListener( 'click', function(e) { _this.resetItems(e); }, false );
    document.getElementById('budgetCancel').addEventListener( 'click', function(e) { _this.cancel(e); }, false );
    document.getElementById('budgetForm').addEventListener( 'submit', function(e) { _this.submit(e); }, false );

    //this._opacityLayer =  '#' + opacityLayerID;
    //this._budgetWindowID = '#' + budgetWindowID;
}


Micro.BudgetWindow.prototype = {
    constructor: Micro.BudgetWindow,

    setSpendRangeText : function(element, percentage, totalSpend) {
        var labelID = element + 'Label';
        var cash = Math.floor(totalSpend * (percentage / 100));
        var text = [percentage, '% of $', totalSpend, ' = $', cash].join('');
        document.getElementById(labelID).innerHTML = text;
        //$('#' + labelID).text(text);
    },
    onFundingUpdate : function(elementID, e) {
    var element = document.getElementById(elementID);//$('#' + elementID)[0];
    var percentage = element.value - 0;
    var dataSource = element.getAttribute('data-source');
    this.setSpendRangeText(elementID, percentage, this[dataSource]);
    },
    onTaxUpdate : function(e) {
    //var elem = $('#taxRateLabel')[0];
    //var sourceElem = $('#taxRate')[0];
    //var elem = $('#taxRateLabel')[0];
    //var sourceElem = $('#taxRate')[0];
    //$(elem).text(['Tax rate: ', sourceElem.value, '%'].join(''));

    //document.getElementById('taxRateLabel')[0].innerHTML = ['Tax rate: ', document.getElementById('taxRate')[0].value, '%'].join('');
    document.getElementById('taxRateLabel').innerHTML = ['Tax rate: ', document.getElementById('taxRate').value, '%'].join('');
    },
    resetItems : function(e) {
    for (var i = 0; i < this.spendKeys.length; i++) {
      var original = this['original' + this.spendKeys[i]];
     // $('#' + spendKeys[i])[0].value = original;
      document.getElementById(this.spendKeys[i]).value = original;
      this.setSpendRangeText(this.spendKeys[i], original, this[this.dataKeys[i]]);
    }
    //$('#taxRate')[0].value = this.originaltaxRate;
    document.getElementById('taxRate').value = this.originaltaxRate;
    this.onTaxUpdate();

    e.preventDefault();
    },
    cancel : function(e) {
    e.preventDefault();
    this._callback(true, null);

   // var toRemove = [budgetResetID, budgetOKID, 'taxRate',
     //               'roadRate', 'fireRate', 'policeRate'];

   // for (var i = 0, l = toRemove.length; i < l; i++)
   //   $('#' + toRemove[i]).off();

    this._toggleDisplay();
    },
    submit : function(e) {
    e.preventDefault();

    // Get element values
    var roadPercent =  document.getElementById('roadRate').value;//$('#roadRate')[0].value;
    var firePercent = document.getElementById('fireRate').value;//$('#fireRate')[0].value;
    var policePercent = document.getElementById('policeRate').value;//$('#policeRate')[0].value;
    var taxPercent = document.getElementById('taxRate').value;//$('#taxRate')[0].value;

    this._callback(false, {roadPercent: roadPercent, firePercent: firePercent,
                          policePercent: policePercent, taxPercent: taxPercent});

    //var toRemove = [budgetResetID, budgetCancelID, 'taxRate',
                 //   'roadRate', 'fireRate', 'policeRate'];



   // for (var i = 0, l = toRemove.length; i < l; i++)
    //  $('#' + toRemove[i]).off();

    this._toggleDisplay();
    },
    _toggleDisplay : function() {
    var opacityLayer = document.getElementById(this._opacityLayer);
    var budgetWindow = document.getElementById(this._budgetWindowID);
    //var opacityLayer = document.getElementById(this._opacityLayer);//$(this._opacityLayer);
    //opacityLayer = opacityLayer.length === 0 ? null : opacityLayer;
    //if (opacityLayer === null)
    //  throw new Error('Node ' + orig + ' not found');

   // var budgetWindow = document.getElementById(this._budgetWindowID);//$(this._budgetWindowID);
    //budgetWindow = budgetWindow.length === 0 ? null : budgetWindow;
   // if (budgetWindow === null)
     // throw new Error('Node ' + orig + ' not found');

  //  opacityLayer.toggle();
  //  budgetWindow.toggle();
    if(opacityLayer.style.display !== "block")opacityLayer.style.display = "block";
    else opacityLayer.style.display = "none";
    if(budgetWindow.style.display !== "block")budgetWindow.style.display = "block";
    else{ budgetWindow.style.display = "none"; }
    },
    open : function(callback, budgetData) {
       var _this = this;
    var i, elem;
    this._callback = callback;

    // Store max funding levels
    for (i = 0; i < this.dataKeys.length; i++) {
      if (budgetData[this.dataKeys[i]] === undefined)
        throw new Error('Missing budget data');
      this[this.dataKeys[i]] = budgetData[this.dataKeys[i]];
    }

    // Update form elements with percentages, and set up listeners
    for (i = 0; i < this.spendKeys.length; i++) {
      if (budgetData[this.spendKeys[i]] === undefined)
        throw new Error('Missing budget data');

      elem = this.spendKeys[i];
      this['original' + elem] = budgetData[elem];
      this.setSpendRangeText(elem, budgetData[this.spendKeys[i]], this[this.dataKeys[i]]);
      //elem = $('#' + elem);
      elem = document.getElementById(elem)
      elem.addEventListener( 'input', function(e) { _this.onFundingUpdate(_this, _this.spendKeys[i]); }, false );
      //elem.on('input', onFundingUpdate.bind(this, spendKeys[i]));
      //elem = elem[0];
      elem.value = budgetData[this.spendKeys[i]];
    }

    if (budgetData.taxRate === undefined)
      throw new Error('Missing budget data');

    this.originalTaxRate = budgetData.taxRate;
    //elem = $('#taxRate');
    elem = document.getElementById('taxRate')
    //elem.on('input', onTaxUpdate);

    elem.addEventListener( 'input', function(e) { _this.onTaxUpdate(e); }, false );
    //elem = elem[0];
    elem.value = budgetData.taxRate;
    this.onTaxUpdate();

    // Update static parts
    var previousFunds = budgetData.totalFunds;
    if (previousFunds === undefined)
      throw new Error('Missing budget data');

    var taxesCollected = budgetData.taxesCollected;
    if (taxesCollected === undefined)
      throw new Error('Missing budget data');

    var cashFlow = taxesCollected - this.roadFund - this.fireFund - this.policeFund;
    var currentFunds = previousFunds + cashFlow;
    /*$('#taxesCollected').text('$' + taxesCollected);
    $('#cashFlow').text((cashFlow < 0 ? '-$' : '$') + cashFlow);
    $('#previousFunds').text((previousFunds < 0 ? '-$' : '$') + previousFunds);
    $('#currentFunds').text('$' + currentFunds);*/

    document.getElementById('taxesCollected').innerHTML = '$' + taxesCollected;
    document.getElementById('cashFlow').innerHTML = (cashFlow < 0 ? '-$' : '$') + cashFlow;
    document.getElementById('previousFunds').innerHTML = (previousFunds < 0 ? '-$' : '$') + previousFunds;
    document.getElementById('currentFunds').innerHTML = '$' + currentFunds;

   // this._registerButtonListeners();
    this._toggleDisplay();
  }
}


//  return BudgetWindow;
//});
