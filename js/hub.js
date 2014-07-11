
//------------------------------------------------------//
//                   HUB INTERFACE                      //
//------------------------------------------------------//

var HUB = { REVISION: '0.1a' };


HUB.round = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="27" stroke="none" stroke-width="0" fill="black" fill-opacity="0.1"/>',
'</svg>'
].join("\n");

HUB.roundSelected = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="27" stroke="white" stroke-width="1" fill="black" fill-opacity="0"/>',
'</svg>'
].join("\n");

HUB.roundSelect = [
'<svg height="66" width="66">',
'<circle cx="33" cy="33" r="30" stroke="white" stroke-width="6" fill="black" fill-opacity="0.3"/>',
'</svg>'
].join("\n");


HUB.Base = function(){
	this.hub = document.getElementById('hub');
	this.full = null;
	this.title = null;

    this.isIntro = true;

	this.intro();
	this.timer = null;
	this.bg = 1;

    this.R=null;
    this.C=null;
    this.I=null;

    this.colors = ['#ffffff', '#338099'];//#377BA7

    this.radius = "-moz-border-radius: 20px; -webkit-border-radius: 20px; border-radius: 20px;";

    this.budgetWindow = null;
    this.evaluationWindow  = null;

    this.selector = null;
    this.select = null;

    this.currentToolName = 0;
}

HUB.Base.prototype = {
    constructor: HUB.Base,
    init:function() {
    },
    intro:function(){
    	this.full = document.createElement('div'); 
    	this.full.style.cssText ='position:absolute; background:rgba(102,102,230,1); top:0px; left:0px; width:100%; height:100%; pointer-events:none; display:block;';
        this.title = document.createElement('div');
        this.title.innerHTML = "3D.CITY";
    	this.title.style.cssText = 'position:absolute; font-size:40px; top:50%; left:50%; margin-top:-40px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';
        this.subtitle = document.createElement('div');
        this.subtitle.style.cssText = 'position:absolute; top:50%; left:50%; margin-top:20px; margin-left:-100px; width:200px; height:80px; pointer-events:none;';
        this.subtitle.innerHTML = "Generating world...";

    	this.full.appendChild( this.title );
        this.full.appendChild( this.subtitle );
    	this.hub.appendChild( this.full );
    },
    start:function(){
    	if(this.isIntro){
    		this.timer = setInterval(this.fadding, 100, this);
    	}
    },
    fadding:function(t){
    	t.bg -= 0.1;
    	t.full.style.background = 'rgba(102,102,230,'+t.bg+')';
       // background-image:linear-gradient(60deg, white, black);
    	if(t.bg<=0){
    		clearInterval(t.timer);
    		t.full.removeChild(t.title);
    		t.hub.removeChild(t.full);
    		t.initStartHub();

            t.isIntro = false;
    		//t.full = null;
    	}
    },

    //--------------------------------------start hub

    initStartHub : function(){
        this.full = document.createElement('div'); 
        this.full.style.cssText ='position:absolute; top:30px; left:50%; margin-left:-154px; width:316px; pointer-events:none;';
        this.full.id = 'fullStart';

        this.hub.appendChild( this.full );
        var b1 = this.addButton(this.full, 'Play Game', [300,50, 40]);
    	var b2 = this.addButton(this.full, 'New Map');
        var b3 = this.addButton(this.full, 'Height Map');

        b1.addEventListener('click',  function ( e ) { e.preventDefault(); playMap(); }, false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); newMap(); }, false);
        b3.addEventListener('click',  function ( e ) { e.preventDefault(); newHeightMap(); }, false);
        
        this.addSelector("Difficulty", ['LOW', 'MEDIUM', 'HARD'], setDifficulty, 0);
    },

    //--------------------------------------game hub

    initGameHub : function(){
        this.removeSelector("Difficulty");
        this.clearElement('fullStart');

        this.toolSet = document.createElement('div');
        this.toolSet.style.cssText ='position:absolute; margin:0px; padding:0px; top:60px; right:12px; width:198px; height:456px; pointer-events:none;';
        this.hub.appendChild( this.toolSet );
        this.toolInfo = document.createElement('div');
        this.toolInfo.style.cssText ='position:absolute; top:15px; right:12px; width:198px; height:50px; pointer-events:none; font-size:16px;';
        this.hub.appendChild( this.toolInfo );
        this.toolInfo.innerHTML = "Selecte<br>Tool";

        var bname = ['MOVE', 'residential','commercial','industrial','Police', 'park', 'Fire','road','bulldozer','rail','coal','wire','nuclear', 'Port','stadium','airport','query', 'DRAG'];
        var b;
        for(var i = 0; i<bname.length; i++){
            if(i==0 || i == 17){ b = this.addButton(this.hub, bname[i], [60, 16, 14] ); b.addEventListener('click',  function(e){ e.preventDefault(); selectTool(this.name); }, false); }
            else if(i<4) b = this.addSVGButton(this.toolSet);//this.addButton(this.toolSet, bname[i], [50,70, 14], true, this.showToolInfo );
            else b = this.addSVGButton(this.toolSet);//this.addButton(this.toolSet, bname[i], [50,50, 14], true, this.showToolInfo );

            b.name = i;
            //b.addEventListener('click',  function(e){ e.preventDefault(); selectTool(this.name); }, false);
        }

        var testic = document.getElementById("interface"); //document.createElement('div');
        testic.style.cssText = "position:absolute; top:60px; right:12px; width:198px; height:396px; pointer-events:none;";
       // testic.innerHTML = HUB.police; //HUB.round;
        this.hub.appendChild( testic );

        this.selector = document.createElement('div');
        this.selector .style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none;"
        this.selector.innerHTML = HUB.roundSelected;
        this.toolSet.appendChild( this.selector );

        this.select = document.createElement('div');
        this.select .style.cssText = "position:absolute; top:0px; left:0px; pointer-events:none; display:none;"
        this.select.innerHTML = HUB.roundSelect;
        this.toolSet.appendChild( this.select );

        this.addSelector("Speed", ['PAUSE', '1', '2', '3', '4'], setSpeed, 2);

        var b1 = this.addButton(this.hub, 'BUDGET', [70,16,14], false);
        b1.addEventListener('click',  function ( e ) { e.preventDefault(); getBudjet(); }, false);

        var b2 = this.addButton(this.hub, 'EVAL', [70,16,14], false);
        b2.addEventListener('click',  function ( e ) { e.preventDefault(); getEval(); }, false);

        //this.addButton('Disasters', [70,16,14], false);//20
        //this.buttons[18].addEventListener('click',  function ( e ) { e.preventDefault(); getBudjet(); }, false);



        this.initCITYinfo();
        
    },

    //-----------------------------------CITY INFO

    initCITYinfo : function(){

        this.date = document.createElement('div');
        this.date.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:20px; text-align:left;';

        this.money = document.createElement('div');
        this.money.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:140px; text-align:left;';

        this.population = document.createElement('div');
        this.population.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:260px; text-align:left;';

        this.score = document.createElement('div');
        this.score.style.cssText = 'font-size:16px; position:absolute; width:100px; height:70px; top:20px; left:360px; text-align:left;';

        this.msg = document.createElement('div');
        this.msg.style.cssText = 'font-size:14px; position:absolute; width:400px; height:70px; top:50px; left:20px; text-align:left;';

        this.hub.appendChild( this.date );
        this.hub.appendChild( this.money );
        this.hub.appendChild( this.population );
        this.hub.appendChild( this.score );
        this.hub.appendChild( this.msg );

        this.initRCI();
    },

    updateCITYinfo : function(infos){
        this.date.innerHTML = infos[0];
        this.money.innerHTML = infos[4]+' $';
        this.population.innerHTML = infos[3]+' people';
        this.score.innerHTML =  'score:' + infos[2];

        this.msg.innerHTML = infos[8];

        this.updateRCI( infos[5], infos[6], infos[7] );
    },

    //-----------------------------------QUERY

    //-----------------------------------ALL WINDOW

    testOpen : function(){
        var t = "";
        if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget();
            t='budget';
        }
        if(this.evaluationWindow !== null && this.evaluationWindow.className == "open"){
            this.closeEval();
            t='evaluation';
        }

        return t;

    },

    //-----------------------------------BUDGET WINDOW

    openEval : function(data){
        _this = this;

        var test = this.testOpen();
        if(test == 'evaluation') return;

        if(this.evaluationWindow == null){
            this.evaluationWindow = document.createElement('div');
            this.evaluationWindow.style.cssText =this.radius+ 'position:absolute; top:100px; left:140px; width:200px; height:300px; pointer-events:none; display:block; background:#eeeeee; ';
            this.hub.appendChild( this.evaluationWindow );

            this.evaltOpinion = document.createElement('div');
            this.evaltOpinion.style.cssText ='position:absolute; top:10px; left:10px; width:180px; height:100px; pointer-events:none; color:black; ';
            this.evaluationWindow.appendChild( this.evaltOpinion );

            this.evaltYes = document.createElement('div');
            this.evaltYes.style.cssText ='position:absolute; top:46px; left:26px; width:60px; height:20px; pointer-events:none; color:green; font-size:16px; ';
            this.evaluationWindow.appendChild( this.evaltYes );

            this.evaltNo = document.createElement('div');
            this.evaltNo.style.cssText ='position:absolute; top:46px; right:26px; width:60px; height:20px; pointer-events:none; color:red;  font-size:16px; ';
            this.evaluationWindow.appendChild( this.evaltNo );

            this.evaltProb = document.createElement('div');
            this.evaltProb.style.cssText ='position:absolute; top:90px; left:10px; width:180px; height:60px; pointer-events:none; color:black;  font-size:16px; ';
            this.evaluationWindow.appendChild( this.evaltProb );

            this.evaltOpinion.innerHTML = "<b>Public opinion</b><br>Is the mayor doing a good job ?<br> <br> <br>What are the worst problems ?<br>"

        } else {
            this.evaluationWindow.style.display = 'block';
        }

        this.evaltYes.innerHTML = 'YES:' + data[0] + '%';
        this.evaltNo.innerHTML = 'NO:' +(100-data[0] )+ '%';

        this.evaltProb.innerHTML = data[1];

        this.evaluationWindow.className = "open";
    },

    closeEval :function(){
        this.evaluationWindow.style.display = 'none';
        this.evaluationWindow.className = "close";
    },

    //-----------------------------------BUDGET WINDOW

    openBudget : function(data){
        _this = this;

        var test = this.testOpen();
        if(test == 'budget') return;

        /*if(this.budgetWindow !== null && this.budgetWindow.className == "open"){
            this.closeBudget(); 
            return;
        }*/

        this.dataKeys = ['roadFund', 'roadRate', 'fireFund', 'fireRate','policeFund', 'policeRate', 'taxRate', 'totalFunds', 'taxesCollected'];

        var i = this.dataKeys.length;

        var elem;
        while(i--){
            this[this.dataKeys[i]] = data[this.dataKeys[i]];
        }

        var previousFunds = data.totalFunds;
        var taxesCollected = data.taxesCollected;
        var cashFlow = taxesCollected - this.roadFund - this.fireFund - this.policeFund;
        var currentFunds = previousFunds + cashFlow;

        if(this.budgetWindow == null){
            this.budgetWindow = document.createElement('div');
            this.budgetWindow.style.cssText =this.radius+ 'position:absolute; top:100px; left:140px; width:200px; height:300px; pointer-events:none; display:block; background:#eeeeee; ';
            this.hub.appendChild( this.budgetWindow );

            this.addSlider(this.budgetWindow, 10, 'Taxe', this.taxRate, null, 'green', 20);
            this.addSlider(this.budgetWindow, 70, 'Roads', this.roadRate, this.roadFund, 'red', 100);
            this.addSlider(this.budgetWindow, 110, 'Fire', this.fireRate, this.fireFund, 'red', 100);
            this.addSlider(this.budgetWindow, 150, 'Police', this.policeRate, this.policeFund, 'red', 100);

            this.budgetResult = document.createElement('div');
            this.budgetResult.style.cssText ='position:absolute; top:200px; left:10px; width:180px; height:300px; pointer-events:none; color:black; ';
            
            this.budgetWindow.appendChild( this.budgetResult );

            var bg1 = this.addButton(this.budgetWindow, 'CLOSE', [70,16,14], false);
            var bg2 = this.addButton(this.budgetWindow, 'APPLY', [70,16,14], false);

            bg1.addEventListener('click',  function(e){ e.preventDefault(); _this.closeBudget(); }, false);
            bg2.addEventListener('click',  function(e){ e.preventDefault(); _this.applyBudget(); }, false);

        } else {
            this.budgetWindow.style.display = 'block';
            this.setBudgetValue();
        }

        this.budgetResult.innerHTML = "Annual receipts:" + cashFlow+"$"+"<br>Taxe collected:" + taxesCollected+"$";

        this.budgetWindow.className = "open";

    },

    applyBudget :function(){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";

        setBudjet([this.taxRate, this.roadRate, this.fireRate, this.policeRate ]);
    },

    closeBudget :function(){
        this.budgetWindow.style.display = 'none';
        this.budgetWindow.className = "close";
    },

    setBudgetValue:function(){
        this.setSliderValue('Taxe', this.taxRate, 20, null);
        this.setSliderValue('Roads', this.roadRate, 100, this.roadFund);
        this.setSliderValue('Fire', this.fireRate, 100, this.fireFund);
        this.setSliderValue('Police', this.policeRate, 100, this.policeFund);
    },

    //-----------------------------------SLIDER

    addSlider : function(target, py, name, value, v2, color, max){
        var _this = this;
        var txt = document.createElement( 'div' );
        var bg = document.createElement( 'div' );
        var sel = document.createElement( 'div' );
        txt.style.cssText ='position:absolute; left:10px; top:-20px; pointer-events:none; width:180px; height:20px; font-size:12px; color:black; ';
        bg.style.cssText =this.radius+'position:absolute; left:10px; top:'+(py+20)+'px; padding:0; cursor:w-resize; pointer-events:auto; width:180px; height:20px; background-color:#cccccc; ';
        sel.style.cssText =this.radius+'position:absolute; pointer-events:none; margin:5px; width:100px; height:10px; background-color:'+color+';';
        target.appendChild( bg );
        bg.appendChild( sel );
        bg.appendChild( txt );
        bg.name = name;
        bg.id = name;

        if(v2!==null){
            txt.innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            txt.innerHTML = name+" "+value+'%';
        }

        sel.style.width = 170*(value/max)+'px';
        bg.className = "up";

        bg.addEventListener( 'mouseout', function(e){ e.preventDefault();this.className = "up"; this.style.backgroundColor = '#cccccc'; }, false );
        bg.addEventListener( 'mouseover', function(e){ e.preventDefault(); this.style.backgroundColor = '#dedede'; }, false );
        bg.addEventListener( 'mouseup', function(e){ e.preventDefault(); this.className = "up"; }, false );
        bg.addEventListener( 'mousedown', function(e){ e.preventDefault(); this.className = "down"; _this.dragSlider(this, e.clientX, max); }, false );
        bg.addEventListener( 'mousemove', function(e){ e.preventDefault(); _this.dragSlider(this, e.clientX, max); } , false );
    },

    setSliderValue:function(name, value, max, v2){
        var slide = document.getElementById(name);
        var children = slide.childNodes;
        children[0].style.width = 170*(value/max)+'px';
        if(v2!==null){
            children[1].innerHTML = name+" "+value+'% of '+v2+"$ = " + Math.floor(v2 * (value / 100))+"$";
        } else {
            children[1].innerHTML = name+" "+value+'%';
        }
    },

    dragSlider : function(t, x, max){
        if(t.className == "down"){
            var children = t.childNodes;
            var rect = t.getBoundingClientRect();
            var value = Math.round(((x-rect.left)/170)*max);
            if(value<0) value = 0;
            if(value>max) value = max;
            children[0].style.width = 170*(value/max)+'px';

            switch(t.name){
                case 'Taxe': children[1].innerHTML = t.name+" "+value+'%'; this.taxRate = value; break;
                case 'Roads': children[1].innerHTML = t.name+" "+value+'% of '+this.roadFund+"$ = " + Math.floor(this.roadFund * (value / 100))+"$"; this.roadRate = value; break;
                case 'Fire': children[1].innerHTML = t.name+" "+value+'% of '+this.fireFund+"$ = " + Math.floor(this.fireFund * (value / 100))+"$"; this.fireRate = value; break;
                case 'Police': children[1].innerHTML = t.name+" "+value+'% of '+this.policeFund+"$ = " + Math.floor(this.policeFund * (value / 100))+"$"; this.policeRate = value; break;
            }
        }
    },


    //-----------------------------------RCI

    initRCI : function(){
        var cont = document.createElement('div');
        cont.id = 'RCI';
        cont.style.cssText = 'font-size:10px; position:absolute; width:70px; height:70px; bottom:20px; right:20px;';

        var txt = document.createElement('div');
        txt.style.cssText = 'font-size:10px; position:absolute; width:46px; height:14px; bottom:28px; left:10px; background:#cccccc; padding:0px 2px;  letter-spacing:12px; text-align:center; color:#000000;';
        txt.innerHTML = "RCI";

        this.R = document.createElement('div');
        this.R.id = 'R';
        this.R.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:10px; background:#30ff30;';
        cont.appendChild( this.R );

        this.C = document.createElement('div');
        this.C.id = 'C';
        this.C.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:30px; background:#3030ff;';
        cont.appendChild( this.C );

        this.I = document.createElement('div');
        this.I.id = 'I';
        this.I.style.cssText = 'position:absolute; width:10px; height:20px; bottom:42px; left:50px; background:#ffff30;';
        cont.appendChild( this.I );



        cont.appendChild( txt );
        this.hub.appendChild( cont );
    },

    updateRCI : function(r,c,i){
        this.R.style.height = r/100+'px'; 
        this.C.style.height = c/100+'px';
        this.I.style.height = i/100+'px';
        //console.log(r/100)
        if(r>0){ this.R.style.bottom ='42px';}
        else { this.R.style.bottom =28+(r/100)+'px';}

        if(c>0){ this.C.style.bottom ='42px';}
        else { this.C.style.bottom =28+(c/100)+'px'; }

        if(i>0){ this.I.style.bottom ='42px';;}
        else { this.I.style.bottom =28+(i/100)+'px'; }
    },

    //---------------------------------- SELECTOR 

    addSelector : function( type, names, fun, current){
        _this = this;
        var cont = document.createElement('div');
        //cont.style.cssText = 'position:absolute; width:300px; height:50px; font-size:16px; top:0; left:webkit-clac(50% -150px);';
        cont.style.cssText = 'font-size:20px; margin-top:20px;';
        if(type=='Speed') cont.style.cssText = 'font-size:20px; position:absolute; bottom:20px; left:10px; ';
        else cont.innerHTML = type+"<br>";
        cont.id = type;
        var t = [];
        for(var i=0; i!==names.length; i++){
            t[i] = document.createElement( 'div' );
            t[i].style.cssText = 'font-size:14px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+'; width:70px; height:16px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
            if(type=='Speed'){ if(i>0) t[i].style.width = '16px'; else t[i].style.width = '60px'; }
            t[i].className = "none";
            t[i].textContent = names[i];
            if(i==current){
                t[i].style.border = '4px solid '+this.colors[0];
                t[i].style.backgroundColor = this.colors[0];
                t[i].style.color = this.colors[1];
                t[i].className = "select";
            }
            t[i].name = i;
            t[i].id = type+i;
            cont.appendChild( t[i] );
            t[i].addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  }, false );
            t[i].addEventListener( 'mouseout', function ( e ) { e.preventDefault();  if(this.className == 'none')this.style.border = '4px solid '+_this.colors[1];  }, false );
            t[i].addEventListener( 'click', function ( e ) { e.preventDefault(); fun( this.name ); _this.setActiveSelector(this.name, type); }, false );
        }
        //this.hub.appendChild( cont );
        if(type=='Difficulty')this.full.appendChild( cont );
        else this.hub.appendChild( cont );
    },

    setActiveSelector : function (n, type) {
        var h = 10, def;
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                def.style.color = this.colors[0];
                def.style.border = '4px solid '+_this.colors[1]; 
                def.style.backgroundColor = this.colors[1];
                def.className = "none";
            }
        }
        var select = document.getElementById(type+n);
        select.style.border = '4px solid '+_this.colors[0]; 
        select.style.backgroundColor = this.colors[0];
        select.style.color = this.colors[1];
        select.className = "select";
    },

    removeSelector : function(type){
        var h = 10, def;
        target = document.getElementById(type);
        while(h--){
            if(document.getElementById(type+h)){
                def = document.getElementById(type+h);
                target.removeChild(def);
            }
        }
        this.full.removeChild(target);
    },

    //------------------------------------------

    showToolSelect : function(id){
        if(id.name !==  this.currentToolName){
            this.currentToolName = id.name; ///view3d.toolSet[id.name].tool;
            var px = (id.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            var py= (id.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top );
            this.select.style.left =    px+ 'px'; 
            this.select.style.top = py+ 'px';
            this.select.style.display = 'block';
        } else {
            this.select.style.display = 'none';
            this.currentToolName = 0;
        }

        selectTool(this.currentToolName);
    },

    showToolInfo : function(id, t){
        var name = view3d.toolSet[id.name].tool;
        name = name.charAt(0).toUpperCase() + name.substring(1).toLowerCase();
        t.toolInfo.innerHTML = name+'<br>'+view3d.toolSet[id.name].price+"$";
    },

    addSVGButton : function(target){
        var _this = this;
        var b = document.createElement( 'div' );
        b.style.cssText =" margin:0px; padding:0px; width:66px; height:66px; pointer-events:auto; cursor:pointer; display:inline-block; line-height:0px; vertical-align: top;";
        b.innerHTML = HUB.round;

        //b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  this.style.backgroundColor = _this.colors[0]; this.style.color = _this.colors[1]; _this.showToolInfo(this.name, _this) }, false );
        //b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[1]; this.style.backgroundColor = _this.colors[1]; this.style.color = _this.colors[0];  }, false );

        //b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.innerHTML = HUB.roundSelected;  _this.showToolInfo(this.name, _this) }, false );
        //b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.innerHTML = HUB.round;   }, false );

        b.addEventListener( 'mouseover', function ( e ) { e.preventDefault();
            var px = (this.getBoundingClientRect().left - _this.toolSet.getBoundingClientRect().left );
            var py= (this.getBoundingClientRect().top - _this.toolSet.getBoundingClientRect().top )
         _this.selector.style.left =    px+ 'px'; 
         _this.selector.style.top = py+ 'px';
         _this.selector.style.display = 'block';
         
          _this.showToolInfo(this, _this) }, false );
        b.addEventListener( 'mouseout', function ( e ) { e.preventDefault();   _this.selector.style.display = 'none';}, false );

        b.addEventListener('click',  function(e){ e.preventDefault();  _this.showToolSelect(this); }, false);
       
        target.appendChild( b );

        return b;
    },

    addButton : function(target, name, size, tool, extra){
        _this = this;
        if(!size) size = [134, 30, 22];
    	//var b = this.createLabel(name, size, true);
        var b = document.createElement( 'div' );
        var defStyle = 'font-size:'+size[2]+'px; border:4px solid '+this.colors[1]+'; background:'+this.colors[1]+'; width:'+size[0]+'px; height:'+size[1]+'px; margin:4px; padding:4px; pointer-events:auto;  cursor:pointer; display:inline-block; font-weight:bold;' + this.radius;
        b.textContent = name;
    	if(!tool){
            if(name == 'MOVE') b.style.cssText = defStyle+'position:absolute; left:270px; bottom:20px; ';
            else if(name == 'DRAG') b.style.cssText = defStyle+'position:absolute; left:358px; bottom:20px;';
            else if(name == 'BUDGET') b.style.cssText = defStyle+'position:absolute; left:20px; top:100px;';
            else if(name == 'EVAL') b.style.cssText = defStyle+'position:absolute; left:20px; top:140px;';
            else if(name == 'CLOSE') b.style.cssText = defStyle+'position:absolute; left:10px; bottom:10px; ';
            else if(name == 'APPLY') b.style.cssText = defStyle+'position:absolute; rigth:10px; bottom:10px; ';
            else b.style.cssText =defStyle+ 'margin-top:20px;';
        } else {
            b.style.cssText = defStyle+'margin:2px; padding:0px; overflow:hidden;';
        }

        var _this = this;
    	b.addEventListener( 'mouseover', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[0];  this.style.backgroundColor = _this.colors[0]; this.style.color = _this.colors[1];if(extra) extra(this.name  , _this) }, false );
	    b.addEventListener( 'mouseout', function ( e ) { e.preventDefault(); this.style.border = '4px solid '+_this.colors[1]; this.style.backgroundColor = _this.colors[1]; this.style.color = _this.colors[0];  }, false );

        target.appendChild( b );

        return b;
    },

    clearElement : function(id){
        var el = document.getElementById(id);
        var children = el.childNodes;
        var i = children.length;
        while(i--) el.removeChild( children[i] );

        this.hub.removeChild( el );
    }
}
