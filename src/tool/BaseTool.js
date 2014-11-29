/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

Micro.BaseTool = function(){
    this.TOOLRESULT_OK = 0;
    this.TOOLRESULT_FAILED = 1;
    this.TOOLRESULT_NO_MONEY = 2;
    this.TOOLRESULT_NEEDS_BULLDOZE = 3;
    this.autoBulldoze = true;
    this.bulldozerCost = 1;
};

Micro.BaseTool.prototype = {
    constructor: Micro.BaseTool,

    init : function(cost, map, shouldAutoBulldoze, IsDraggable) {
        Object.defineProperty(this, 'toolCost', Micro.makeConstantDescriptor(cost));
        this.result = null;
        this.isDraggable = IsDraggable || false;
        this._shouldAutoBulldoze = shouldAutoBulldoze;
        this._map = map;
        this._worldEffects = new Micro.WorldEffects(map);
        this._applicationCost = 0;
    },
    clear : function() {
        this._applicationCost = 0;
        this._worldEffects.clear();
        //this.result = null;
    },
    addCost : function(cost) {
        this._applicationCost += cost;
    },
    doAutoBulldoze : function(x, y) {
        if (!this._shouldAutoBulldoze) return;
        var tile = this._worldEffects.getTile(x, y);
        if (tile.isBulldozable()) {
            tile = Micro.normalizeRoad(tile);
            if ((tile >= Tile.TINYEXP && tile <= Tile.LASTTINYEXP) || (tile < Tile.HBRIDGE && tile !== Tile.DIRT)) {
              this.addCost(1);
              this._worldEffects.setTile(x, y, Tile.DIRT);
            }
        }
    },
    apply : function(budget) {//, messageManager) {
        this._worldEffects.apply();
        budget.spend(this._applicationCost);//, messageManager);
        //messageManager.sendMessage(Messages.DID_TOOL);
        this.clear();
    },
    modifyIfEnoughFunding : function(budget, messageManager) {
        if (this.result !== this.TOOLRESULT_OK) { this.clear(); return false; }
        if (budget.totalFunds < this._applicationCost) { this.result = this.TOOLRESULT_NO_MONEY; this.clear(); return false; }
        this.apply.call(this, budget);//, messageManager);
        this.clear();
        return true;
    },
    setAutoBulldoze: function(value) {
        this.autoBulldoze = value;
    }
};
