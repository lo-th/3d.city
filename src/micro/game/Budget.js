/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { EventEmitter, Micro } from '../Micro.js';
import { Messages } from '../Messages.js';

export class Budget {

    constructor () {

        this.roadEffect = Micro.MAX_ROAD_EFFECT;
        this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
        this.fireEffect = Micro.MAX_FIRESTATION_EFFECT;
        this.totalFunds = 0;
        this.cityTax = 7;
        this.cashFlow = 0;
        this.taxFund = 0;

        // These values denote how much money is required to fully maintain the relevant services
        this.roadMaintenanceBudget = 0;
        this.fireMaintenanceBudget = 0;
        this.policeMaintenanceBudget = 0;

        // Percentage of budget used
        this.roadPercent = 1;
        this.firePercent = 1;
        this.policePercent = 1;

        // Cash value of spending. Should equal Math.round(_Fund * _Percent)
        this.roadSpend = 0;
        this.fireSpend = 0;
        this.policeSpend = 0;

        this.awaitingValues = false;
        this.autoBudget = true;

    }

    save (saveData) {
        for (var i = 0, l = Micro.BudgetProps.length; i < l; i++)
            saveData[Micro.BudgetProps[i]] = this[Micro.BudgetProps[i]];
    }

    load (saveData) {
        for (var i = 0, l = Micro.BudgetProps.length; i < l; i++)
            this[Micro.BudgetProps[i]] = saveData[Micro.BudgetProps[i]];

        EventEmitter.emitEvent(Messages.AUTOBUDGET_CHANGED, this.autoBudget);
        EventEmitter.emitEvent(Messages.FUNDS_CHANGED, this.totalFunds);
    } 

    setAutoBudget (value) {
        this.autoBudget = value;
        EventEmitter.emitEvent(Messages.AUTOBUDGET_CHANGED, this.autoBudget);
    }

    // Calculates the best possible outcome in terms of funding the various services
    // given the player's current funds and tax yield. On entry, roadPercent etc. are
    // assumed to contain the desired percentage level, and taxFunds should contain the
    // most recent tax collected. On exit, the *Percent members will be updated with what
    // we can actually afford to spend. Returns an object containing the amount of cash
    // that would be spent on each service.
    _calculateBestPercentages () {

        // How much would we be spending based on current percentages?
        // Note: the *Budget items are updated every January by collectTax
        this.roadSpend = Math.round(this.roadMaintenanceBudget * this.roadPercent);
        this.fireSpend = Math.round(this.fireMaintenanceBudget * this.firePercent);
        this.policeSpend = Math.round(this.policeMaintenanceBudget * this.policePercent);
        var total = this.roadSpend + this.fireSpend + this.policeSpend;

        // If we don't have any services on the map, we can bail early
        if (total === 0) {
            this.roadPercent = 1;
            this.firePercent = 1;
            this.policePercent = 1;
            return {road: 1, fire: 1, police: 1};
        }

        // How much are we actually going to spend?
        var roadCost = 0;
        var fireCost = 0;
        var policeCost = 0;

        var cashRemaining = this.totalFunds + this.taxFund;

        // Spending priorities: road, fire, police
        if (cashRemaining >= this.roadSpend) roadCost = this.roadSpend;
        else roadCost = cashRemaining;
        cashRemaining -= roadCost;

        if (cashRemaining >= this.fireSpend) fireCost = this.fireSpend;
        else fireCost = cashRemaining;
        cashRemaining -= fireCost;

        if (cashRemaining >= this.policeSpend) policeCost = this.policeSpend;
        else policeCost = cashRemaining;
        cashRemaining -= policeCost;

        if (this.roadMaintenanceBudget > 0) this.roadPercent = (roadCost / this.roadMaintenanceBudget).toPrecision(2) - 0;
        else this.roadPercent = 1;

        if (this.fireMaintenanceBudget > 0) this.firePercent = (fireCost / this.fireMaintenanceBudget).toPrecision(2) - 0;
        else this.firePercent = 1;

        if (this.policeMaintenanceBudget > 0) this.policePercent = (policeCost / this.policeMaintenanceBudget).toPrecision(2) - 0;
        else this.policePercent = 1;

        return { road: roadCost, police: policeCost, fire: fireCost };
    }

    // User initiated budget
    doBudgetWindow () { //doBudgetMenu
        return this.doBudgetNow(true);
    }

    doBudgetNow ( fromWindow ) {

        var costs = this._calculateBestPercentages();

        if (!this.autoBudget && !fromWindow) {
            this.autoBudget = false;
            this.awaitingValues = true;
            EventEmitter.emitEvent(Messages.BUDGET_NEEDED);
            return;
        }

        var roadCost = costs.road;
        var policeCost = costs.police;
        var fireCost = costs.fire;
        var totalCost = roadCost + policeCost + fireCost;
        var cashRemaining = this.totalFunds + this.taxFund - totalCost;

        // Autobudget
        if ((cashRemaining > 0 && this.autoBudget) || fromWindow) {
            // Either we were able to fully fund services, or we have just normalised user input. Go ahead and spend.
            this.awaitingValues = false;
            this.doBudgetSpend( roadCost, fireCost, policeCost );
            return;
        }

        // Uh-oh. Not enough money. Make this the user's problem.
        // They don't know it yet, but they're about to get a budget window.
        this.setAutoBudget(false);
        this.awaitingValues = true;
        EventEmitter.emitEvent(Messages.BUDGET_NEEDED);
        EventEmitter.emitEvent(Messages.NO_MONEY);
    }

    doBudgetSpend ( roadValue, fireValue, policeValue  ) {

        this.roadSpend = roadValue;
        this.fireSpend = fireValue;
        this.policeSpend = policeValue;
        var total = this.roadSpend + this.fireSpend + this.policeSpend;

        this.spend(-(this.taxFund - total) );
        this.updateFundEffects();

    }

    updateFundEffects () {
        // The caller is assumed to have correctly set the percentage spend
        this.roadSpend = Math.round(this.roadMaintenanceBudget * this.roadPercent);
        this.fireSpend = Math.round(this.fireMaintenanceBudget * this.firePercent);
        this.policeSpend = Math.round(this.policeMaintenanceBudget * this.policePercent);

        // Update the effect this level of spending will have on infrastructure deterioration
        this.roadEffect = Micro.MAX_ROAD_EFFECT;
        this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
        this.fireEffect = Micro.MAX_FIRESTATION_EFFECT;

        if (this.roadMaintenanceBudget > 0) this.roadEffect = Math.floor(this.roadEffect * this.roadSpend / this.roadMaintenanceBudget);
        if (this.fireMaintenanceBudget > 0) this.fireEffect = Math.floor(this.fireEffect * this.fireSpend / this.fireMaintenanceBudget);
        if (this.policeMaintenanceBudget > 0) this.policeEffect = Math.floor(this.policeEffect * this.policeSpend / this.policeMaintenanceBudget);

    }

    collectTax ( gameLevel, census ) {

        this.cashFlow = 0;
        // How much would it cost to fully fund every service?
        this.policeMaintenanceBudget = census.policeStationPop * Micro.policeMaintenanceCost;
        this.fireMaintenanceBudget = census.fireStationPop * Micro.fireMaintenanceCost;

        var roadCost = census.roadTotal * Micro.roadMaintenanceCost;
        var railCost = census.railTotal * Micro.railMaintenanceCost;
        this.roadMaintenanceBudget = Math.floor((roadCost + railCost) * Micro.RLevels[gameLevel])

        this.taxFund = Math.floor( Math.floor( census.totalPop * census.landValueAverage / 120) * this.cityTax * Micro.FLevels[gameLevel]);

        if (census.totalPop > 0) {
            this.cashFlow = this.taxFund - (this.policeMaintenanceBudget + this.fireMaintenanceBudget + this.roadMaintenanceBudget);
            this.doBudgetNow( false );
        } else {
            // We don't want roads etc deteriorating when population hasn't yet been established
            // (particularly early game)
            this.roadEffect   = Micro.MAX_ROAD_EFFECT;
            this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
            this.fireEffect   = Micro.MAX_FIRESTATION_EFFECT;
        }
    }

    setTax ( amount ) {
        if (amount === this.cityTax) return;
        this.cityTax = amount;
    }

    setFunds ( amount ) {
        if (amount === this.totalFunds) return;
        this.totalFunds = Math.max(0, amount);
        EventEmitter.emitEvent(Messages.FUNDS_CHANGED, this.totalFunds);
        if (this.totalFunds === 0) EventEmitter.emitEvent(Messages.NO_MONEY);
    }

    spend ( amount ) {
        this.setFunds(this.totalFunds - amount);
    }

    shouldDegradeRoad () {
        return this.roadEffect < Math.floor(15 * this.MAX_ROAD_EFFECT / 16);
    }

}
