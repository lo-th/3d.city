/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
Micro.Game = function(gameMap, tileSet, spriteSheet, difficulty) {
    this.debug = document.getElementById("debug");
    difficulty = difficulty || 0;

    this.gameMap = gameMap;
    this.tileSet = tileSet || null;
    this.notification = new Micro.Notification();
    this.simulation = new Micro.Simulation(this.gameMap, difficulty, 3);
    this.rci = new Micro.RCI('RCIContainer');
    this.budgetWindow = new Micro.BudgetWindow('opaque', 'budget');
    this.queryWindow = new Micro.QueryWindow('opaque', 'queryWindow');
    this.evalWindow = new Micro.EvaluationWindow('opaque', 'evalWindow');
    this.disasterWindow = new Micro.DisasterWindow('opaque', 'disasterWindow');

    this.gameCanvas = null;
    if(this.tileSet !== null){
        this.gameCanvas = new Micro.GameCanvas('canvasContainer');
        this.gameCanvas.init(this.gameMap, this.tileSet, spriteSheet);
    }

    this.inputStatus = new Micro.InputStatus(this.gameMap);
    this.mouse = null;
    this.sprites = null;
    this.lastCoord = null;

    // Unhide controls
    this.revealControls();

    this.budgetShowing = false;
    this.queryShowing = false;
    this.evalShowing = false;
    this.simNeedsBudget = false;
    this.isPaused = false;

    //this.tick();
    //this.animate();

    var _this = this;

    this.timer = setInterval(_this.update, 1000/30, _this); //null;

    /*this.timer = null;
    this.delay = 0;
    this.timeStart = 0;
    this.timerStep = 1000/60;
    this.update(this);*/
}

Micro.Game.prototype = {
    constructor: Micro.Game,

    revealControls : function() {
        var h = document.getElementsByClassName("initialHidden");
        for(var i=0; i<h.length; i++){
            h[i].className = h[i].className.replace("initialHidden", "");
            if(h[i])if(h[i].id == "buttons")h[i].style.display = "table";
        }
        document.getElementById("buttonsInfos").style.display = "block";
        document.getElementById("miscControls").style.display = "block";
        this.notification.news(TXT.neutralMessages[Messages.WELCOME]);
        this.rci.update(0, 0, 0);
    },
    handleDisasterClosed : function(request) {
        this.disasterShowing = false;
        if (request === Micro.DISASTER_NONE) return;
        var m = new Micro.MessageManager();
        switch (request) {
            case Micro.DISASTER_MONSTER: this.simulation.spriteManager.makeMonster(m); break;
            case Micro.DISASTER_FIRE: this.simulation.disasterManager.makeFire(m); break;
            case Micro.DISASTER_FLOOD: this.simulation.disasterManager.makeFlood(m); break;
            case Micro.DISASTER_CRASH: this.simulation.disasterManager.makeCrash(m); break;
            case Micro.DISASTER_MELTDOWN: this.simulation.disasterManager.makeMeltdown(m); break;
            case Micro.DISASTER_TORNADO: this.simulation.spriteManager.makeTornado(m); break;
        }
        this.processMessages(m.getMessages());
    },
    handleEvalClosed : function() {
        this.evalShowing = false;
    },
    handleQueryClosed : function() {
        this.queryShowing = false;
    },
    handleBudgetClosed : function(cancelled, data) {
        this.budgetShowing = false;
        if (!cancelled) {
            this.simulation.budget.roadPercent = data.roadPercent / 100;
            this.simulation.budget.firePercent = data.firePercent / 100;
            this.simulation.budget.policePercent = data.policePercent / 100;
            this.simulation.budget.setTax(data.taxPercent - 0);
            if (this.simNeededBudget) {
                this.simulation.budget.doBudget(new Micro.MessageManager());
                this.simNeededBudget = false;
            } else {
                this.simulation.budget.updateFundEffects();
            }
        }
    },
    handleDisasterRequest : function() {
        this.disasterShowing = true;
        this.disasterWindow.open(this.handleDisasterClosed.bind(this));

        // Let the input know we handled this request
        this.inputStatus.disasterHandled();
        //nextFrame(this.tick.bind(this));
        // this.nextFrame(this.tick);
    },
    handleEvalRequest : function() {
        this.evalShowing = true;
        this.evalWindow.open(this.handleEvalClosed.bind(this), this.simulation.evaluation);

        // Let the input know we handled this request
        this.inputStatus.evalHandled();
       // nextFrame(this.tick.bind(this));
        //this.nextFrame(this.tick);
    },
    handleBudgetRequest : function() {
        this.budgetShowing = true;

        var budgetData = {
            roadFund: this.simulation.budget.roadFund,
            roadRate: Math.floor(this.simulation.budget.roadPercent * 100),
            fireFund: this.simulation.budget.fireFund,
            fireRate: Math.floor(this.simulation.budget.firePercent * 100),
            policeFund: this.simulation.budget.policeFund,
            policeRate: Math.floor(this.simulation.budget.policePercent * 100),
            taxRate: this.simulation.budget.cityTax,
            totalFunds: this.simulation.budget.totalFunds,
            taxesCollected: this.simulation.budget.taxFund
        };
        this.budgetWindow.open(this.handleBudgetClosed.bind(this), budgetData);
        // Let the input know we handled this request
        this.inputStatus.budgetHandled();
       // nextFrame(this.tick.bind(this));
        //this.nextFrame(this.tick);
    },
    handleTool : function(x, y) {
        // Were was the tool clicked?
        var tileCoords = this.gameCanvas.canvasCoordinateToTileCoordinate(x, y);

        if (tileCoords === null) {
            this.inputStatus.clickHandled();
            return;
        }

        var tool = this.inputStatus.currentTool;

        var budget = this.simulation.budget;
        var evaluation = this.simulation.evaluation;
        var messageMgr = new Micro.MessageManager();

        // do it!
        tool.doTool(tileCoords.x, tileCoords.y, messageMgr, this.simulation.blockMaps);

        tool.modifyIfEnoughFunding(budget, messageMgr);
        switch (tool.result) {
            case tool.TOOLRESULT_NEEDS_BULLDOZE: document.getElementById("toolOutput").innerHTML = TXT.toolMessages.needsDoze; break;
            case tool.TOOLRESULT_NO_MONEY: document.getElementById("toolOutput").innerHTML = TXT.toolMessages.noMoney; break; 
            default: document.getElementById("toolOutput").innerHTML = '&nbsp;';
        }
        this.processMessages(messageMgr.getMessages());
        this.inputStatus.clickHandled();
    },
    handleSpeedChange : function() {
        // XXX Currently only offer pause and run to the user
        // No real difference among the speeds until we optimise the sim
        this.isPaused = !this.isPaused;

        if (this.isPaused) this.simulation.setSpeed(Micro.SPEED_PAUSED);
        else this.simulation.setSpeed(Micro.SPEED_SLOW);
        this.inputStatus.speedChangeHandled();
    },
    handleInput : function() {
        if (this.inputStatus.budgetRequested) { this.handleBudgetRequest(); return; }
        if (this.inputStatus.evalRequested) { this.handleEvalRequest(); return; }
        if (this.inputStatus.disasterRequested) { this.handleDisasterRequest(); return; }
        if (this.inputStatus.speedChangeRequested) { this.handleSpeedChange(); return; }

        // Handle keyboard movement
        if (this.inputStatus.left) this.gameCanvas.moveWest();
        else if (this.inputStatus.up) this.gameCanvas.moveNorth();
        else if (this.inputStatus.right) this.gameCanvas.moveEast();
        else if (this.inputStatus.down) this.gameCanvas.moveSouth();

        // Was a tool clicked?
        if (this.inputStatus.currentTool !== null && this.inputStatus.clickX !== -1 && this.inputStatus.clickY !== -1)
            this.handleTool(this.inputStatus.clickX, this.inputStatus.clickY);
    },
    processMessages : function(messages) {
        // Don't want to output more than one user message
        var messageOutput = false;

        for (var i = 0, l = messages.length; i < l; i++) {
            var m = messages[i];
            switch (m.message) {
                case Messages.BUDGET_NEEDED: this.simNeededBudget = true; this.handleBudgetRequest(); break;
                case Messages.QUERY_WINDOW_NEEDED: this.queryWindow.open(this.handleQueryClosed.bind(this)); break;
                case Messages.DATE_UPDATED: InfoBar.setDate(m.data.month, m.data.year); break;
                case Messages.EVAL_UPDATED: InfoBar.setClass(TXT.cityClass[m.data.classification]); InfoBar.setScore(m.data.score); InfoBar.setPopulation(m.data.population); break;
                case Messages.FUNDS_CHANGED: InfoBar.setFunds(m.data); break;
                case Messages.VALVES_UPDATED: this.rci.update(m.data.residential, m.data.commercial, m.data.industrial); break;
                default: 
                    if (!messageOutput && TXT.goodMessages[m.message] !== undefined) { 
                        messageOutput = true; this.notification.goodNews(TXT.goodMessages[m.message]); 
                        break;
                    }
                    if (!messageOutput && TXT.badMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.notification.badNews(TXT.badMessages[m.message]);
                        break;
                    }
                    if (!messageOutput && TXT.neutralMessages[m.message] !== undefined) {
                        messageOutput = true;
                        this.notification.news(TXT.neutralMessages[m.message]);
                        break;
                    }
            }
        }
    },
    calculateMouseForPaint : function() {
        // Determine whether we need to draw a tool outline in the canvas
        var mouse = null;

        if (this.inputStatus.mouseX !== -1 && this.inputStatus.toolWidth > 0) {
            var tileCoords = this.gameCanvas.canvasCoordinateToTileOffset(this.inputStatus.mouseX, this.inputStatus.mouseY);
            if (tileCoords !== null) {
                mouse = {};

                mouse.x = tileCoords.x;
                mouse.y = tileCoords.y;

                // The inputStatus fields came from DOM attributes, so will be strings.
                // Coerce back to numbers.
                mouse.width = this.inputStatus.toolWidth - 0;
                mouse.height = this.inputStatus.toolWidth - 0;
                mouse.colour = this.inputStatus.toolColour || 'yellow';
            }
        }
        return mouse;
    },
    calculateSpritesForPaint : function() {
        var origin = this.gameCanvas.getTileOrigin();
        var end = this.gameCanvas.getMaxTile();
        var spriteList = this.simulation.spriteManager.getSpritesInView(origin.x, origin.y, end.x + 1, end.y + 1);

        if (spriteList.length === 0) return null;
        return spriteList;
    },
   /* tick : function() {

        this.handleInput();

        if (this.budgetShowing || this.queryShowing || this.disasterShowing || this.evalShowing) {
            window.setTimeout(this.tick.bind(this), 0);
            return;
        }

        if (!this.simulation.isPaused()) {
            // Run the sim
            var messages = this.simulation.simTick();
            this.processMessages(messages);
        }

        // Run this even when paused: you can still build when paused
        this.mouse = this.calculateMouseForPaint();

        window.setTimeout(this.tick.bind(this), 0);
    },
    animate : function() {
        // Don't run on blur - bad things seem to happen
        // when switching back to our tab in Fx
        if (this.budgetShowing || this.queryShowing || this.disasterShowing || this.evalShowing) {
           nextFrame(this.animate.bind(this));
           return;
        }

        // TEMP
        this.frameCount++;

        var date = new Date();
        var elapsed = Math.floor((date - this.animStart) / 1000);

        // TEMP
        if (elapsed > 0) this.d.textContent = Math.floor(this.frameCount/elapsed) + ' fps';

        //if (!this.isPaused) this.simulation.spriteManager.moveObjects(this.simulation._constructSimData());
        if (!this.isPaused) this.simulation.spriteManager.moveObjects();

        this.sprite = this.calculateSpritesForPaint();
        this.gameCanvas.paint(this.mouse, this.sprite, this.isPaused);

        nextFrame(this.animate.bind(this));
    },*/

    //-----------------------------------------------------------
    /*update : function(){
        this.timeStart = Date.now();
        var t0 = new Date();
        this.handleInput();
        this.mouse = this.calculateMouseForPaint();
        var t1 = new Date();

        if (!this.isPaused){
            this.simulation.simFrame();
            this.simulation.updateFrontEnd();
            this.processMessages(this.simulation.messageManager.getMessages());
            this.simulation.spriteManager.moveObjects();
            //U.simulation.spriteManager.moveObjects(U.simulation._constructSimData());
        }
        var t2 = new Date();
        this.sprite = this.calculateSpritesForPaint();
        var t3 = new Date();
        this.gameCanvas.paint(this.mouse, this.sprite, this.isPaused);
        var t4 = new Date();

        this.debug.innerHTML = "input:" +(t1-t0)+" sim:"+(t2-t1)+" sprite:"+(t3-t2)+" paint:"+(t4-t3) +"<br> total:"+(t4-t0)+ "<br>"+this.isPaused ;

       // if(isTimout){
            this.delay = this.timerStep - (Date.now()-this.timeStart);
            this.timer = setTimeout(this.update, this.delay);
      //  }

    }*/
    update : function(U){
        //U.timeStart = Date.now();
        var t0 = new Date();
        U.handleInput();
        U.mouse = U.calculateMouseForPaint();
        var t1 = new Date();

        if (!U.isPaused){
            U.simulation.simFrame();
            U.simulation.updateFrontEnd();
            U.processMessages(U.simulation.messageManager.getMessages());
            U.simulation.spriteManager.moveObjects();
            //U.simulation.spriteManager.moveObjects(U.simulation._constructSimData());
        }
        var t2 = new Date();
        U.sprite = U.calculateSpritesForPaint();
        var t3 = new Date();
        U.gameCanvas.paint(U.mouse, U.sprite, U.isPaused);
        var t4 = new Date();

        U.debug.innerHTML = "input:" +(t1-t0)+" sim:"+(t2-t1)+" sprite:"+(t3-t2)+" paint:"+(t4-t3) +" total:"+(t4-t0)+ " "+U.isPaused ;

      
        //U.delay = U.timerStep - (Date.now()-U.timeStart);
        //U.timer = setTimeout(U.update, U.delay, U);
      

    }


}