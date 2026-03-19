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
        // Per-zone tax rates (default to cityTax)
        this.resTaxRate = 7;
        this.comTaxRate = 7;
        this.indTaxRate = 7;
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

        // ── Municipal bonds ───────────────────────────────────────────
        // bondDebt: total outstanding principal across all issued bonds
        // bondInterestRate: annual interest rate applied each tax cycle
        // MAX_BOND_DEBT: cap on borrowing to prevent runaway debt
        this.bondDebt = 0;
        this.bondInterestRate = 0.07;
        this.MAX_BOND_DEBT = 50000;

        // ── Water supply & sewage ─────────────────────────────────────
        this.waterMaintenanceBudget = 0;
        this.waterPercent = 1;
        this.waterSpend = 0;
        this.waterEffect = Micro.MAX_WATER_EFFECT;

        // ── Education (hospitals & schools) ──────────────────────────
        this.educationMaintenanceBudget = 0;
        this.educationPercent = 1;
        this.educationSpend = 0;
        this.educationEffect = Micro.MAX_EDUCATION_EFFECT;

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

    // Convenience aliases used by the UI (budget panel)
    get roadFund () { return this.roadMaintenanceBudget; }
    get fireFund () { return this.fireMaintenanceBudget; }
    get policeFund () { return this.policeMaintenanceBudget; }
    get waterFund () { return this.waterMaintenanceBudget; }
    get educationFund () { return this.educationMaintenanceBudget; }

    // Returns the annual interest payment owed on outstanding bond debt.
    getBondAnnualPayment () {
        return Math.round(this.bondDebt * this.bondInterestRate);
    }

    // Issue a municipal bond: credit the city coffers immediately, add to debt.
    // Returns true if the bond was issued, false if the debt cap would be exceeded.
    issueBond ( amount ) {
        if (amount <= 0) return false;
        if (this.bondDebt + amount > this.MAX_BOND_DEBT) return false;
        this.bondDebt += amount;
        this.setFunds(this.totalFunds + amount);
        return true;
    }

    // Repay a portion (or all) of outstanding bond debt from city funds.
    // Returns the actual amount repaid (capped to available funds and outstanding debt).
    repayBond ( amount ) {
        if (amount <= 0) return 0;
        var actual = Math.min(amount, this.bondDebt, this.totalFunds);
        if (actual <= 0) return 0;
        this.bondDebt -= actual;
        this.setFunds(this.totalFunds - actual);
        return actual;
    }

    setAutoBudget (value) {
        this.autoBudget = value;
        EventEmitter.emitEvent(Messages.AUTOBUDGET_CHANGED, this.autoBudget);
    }

    // Set per-zone tax rates independently (0–20 each)
    setZoneTax (resTax, comTax, indTax) {
        this.resTaxRate = Math.max(0, Math.min(20, Math.round(resTax)));
        this.comTaxRate = Math.max(0, Math.min(20, Math.round(comTax)));
        this.indTaxRate = Math.max(0, Math.min(20, Math.round(indTax)));
        // cityTax is kept as the weighted average for backward-compat checks
        this.cityTax = Math.round((this.resTaxRate + this.comTaxRate + this.indTaxRate) / 3);
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
        this.roadSpend      = Math.round(this.roadMaintenanceBudget      * this.roadPercent);
        this.fireSpend      = Math.round(this.fireMaintenanceBudget      * this.firePercent);
        this.policeSpend    = Math.round(this.policeMaintenanceBudget    * this.policePercent);
        this.waterSpend     = Math.round(this.waterMaintenanceBudget     * this.waterPercent);
        this.educationSpend = Math.round(this.educationMaintenanceBudget * this.educationPercent);
        var total = this.roadSpend + this.fireSpend + this.policeSpend + this.waterSpend + this.educationSpend;

        // If we don't have any services on the map, we can bail early
        if (total === 0) {
            this.roadPercent      = 1;
            this.firePercent      = 1;
            this.policePercent    = 1;
            this.waterPercent     = 1;
            this.educationPercent = 1;
            return {road: 1, fire: 1, police: 1, water: 1, education: 1};
        }

        // How much are we actually going to spend?
        var roadCost      = 0;
        var fireCost      = 0;
        var policeCost    = 0;
        var waterCost     = 0;
        var educationCost = 0;

        var cashRemaining = this.totalFunds + this.taxFund;

        // Spending priorities: road, fire, police, water, education
        if (cashRemaining >= this.roadSpend) roadCost = this.roadSpend;
        else roadCost = cashRemaining;
        cashRemaining -= roadCost;

        if (cashRemaining >= this.fireSpend) fireCost = this.fireSpend;
        else fireCost = cashRemaining;
        cashRemaining -= fireCost;

        if (cashRemaining >= this.policeSpend) policeCost = this.policeSpend;
        else policeCost = cashRemaining;
        cashRemaining -= policeCost;

        if (cashRemaining >= this.waterSpend) waterCost = this.waterSpend;
        else waterCost = cashRemaining;
        cashRemaining -= waterCost;

        if (cashRemaining >= this.educationSpend) educationCost = this.educationSpend;
        else educationCost = cashRemaining;
        cashRemaining -= educationCost;

        if (this.roadMaintenanceBudget > 0)      this.roadPercent      = (roadCost      / this.roadMaintenanceBudget).toPrecision(2)      - 0;
        else this.roadPercent = 1;

        if (this.fireMaintenanceBudget > 0)      this.firePercent      = (fireCost      / this.fireMaintenanceBudget).toPrecision(2)      - 0;
        else this.firePercent = 1;

        if (this.policeMaintenanceBudget > 0)    this.policePercent    = (policeCost    / this.policeMaintenanceBudget).toPrecision(2)    - 0;
        else this.policePercent = 1;

        if (this.waterMaintenanceBudget > 0)     this.waterPercent     = (waterCost     / this.waterMaintenanceBudget).toPrecision(2)     - 0;
        else this.waterPercent = 1;

        if (this.educationMaintenanceBudget > 0) this.educationPercent = (educationCost / this.educationMaintenanceBudget).toPrecision(2) - 0;
        else this.educationPercent = 1;

        return { road: roadCost, police: policeCost, fire: fireCost, water: waterCost, education: educationCost };
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

        var roadCost      = costs.road;
        var policeCost    = costs.police;
        var fireCost      = costs.fire;
        var waterCost     = costs.water || 0;
        var educationCost = costs.education || 0;
        var totalCost = roadCost + policeCost + fireCost + waterCost + educationCost;
        var cashRemaining = this.totalFunds + this.taxFund - totalCost;

        // Autobudget
        if ((cashRemaining > 0 && this.autoBudget) || fromWindow) {
            // Either we were able to fully fund services, or we have just normalised user input. Go ahead and spend.
            this.awaitingValues = false;
            this.doBudgetSpend( roadCost, fireCost, policeCost, waterCost, educationCost );
            return;
        }

        // Uh-oh. Not enough money. Make this the user's problem.
        // They don't know it yet, but they're about to get a budget window.
        this.setAutoBudget(false);
        this.awaitingValues = true;
        EventEmitter.emitEvent(Messages.BUDGET_NEEDED);
        EventEmitter.emitEvent(Messages.NO_MONEY);
    }

    doBudgetSpend ( roadValue, fireValue, policeValue, waterValue, educationValue ) {

        this.roadSpend      = roadValue;
        this.fireSpend      = fireValue;
        this.policeSpend    = policeValue;
        this.waterSpend     = waterValue     || 0;
        this.educationSpend = educationValue || 0;
        var total = this.roadSpend + this.fireSpend + this.policeSpend + this.waterSpend + this.educationSpend;

        this.spend(-(this.taxFund - total) );
        this.updateFundEffects();

    }

    updateFundEffects () {
        // The caller is assumed to have correctly set the percentage spend
        this.roadSpend      = Math.round(this.roadMaintenanceBudget      * this.roadPercent);
        this.fireSpend      = Math.round(this.fireMaintenanceBudget      * this.firePercent);
        this.policeSpend    = Math.round(this.policeMaintenanceBudget    * this.policePercent);
        this.educationSpend = Math.round(this.educationMaintenanceBudget * this.educationPercent);

        // Update the effect this level of spending will have on infrastructure deterioration
        this.roadEffect      = Micro.MAX_ROAD_EFFECT;
        this.policeEffect    = Micro.MAX_POLICESTATION_EFFECT;
        this.fireEffect      = Micro.MAX_FIRESTATION_EFFECT;
        this.waterEffect     = Micro.MAX_WATER_EFFECT;
        this.educationEffect = Micro.MAX_EDUCATION_EFFECT;

        if (this.roadMaintenanceBudget > 0)      this.roadEffect      = Math.floor(this.roadEffect      * this.roadSpend      / this.roadMaintenanceBudget);
        if (this.fireMaintenanceBudget > 0)      this.fireEffect      = Math.floor(this.fireEffect      * this.fireSpend      / this.fireMaintenanceBudget);
        if (this.policeMaintenanceBudget > 0)    this.policeEffect    = Math.floor(this.policeEffect    * this.policeSpend    / this.policeMaintenanceBudget);
        if (this.waterMaintenanceBudget > 0)     this.waterEffect     = Math.floor(this.waterEffect     * this.waterSpend     / this.waterMaintenanceBudget);
        else this.waterEffect = Micro.MAX_WATER_EFFECT;
        if (this.educationMaintenanceBudget > 0) this.educationEffect = Math.floor(this.educationEffect * this.educationSpend / this.educationMaintenanceBudget);
        else this.educationEffect = Micro.MAX_EDUCATION_EFFECT;

    }

    collectTax ( gameLevel, census, comTaxMod, indFx ) {

        this.cashFlow = 0;
        // How much would it cost to fully fund every service?
        this.policeMaintenanceBudget = census.policeStationPop * Micro.policeMaintenanceCost;
        this.fireMaintenanceBudget   = census.fireStationPop   * Micro.fireMaintenanceCost;
        // Water infrastructure: scales with total population (per 1000 residents)
        this.waterMaintenanceBudget = Math.floor(census.totalPop / 1000) * Micro.waterMaintenanceCost;
        // Education: cost per hospital and school (church) in the city
        this.educationMaintenanceBudget = (census.hospitalPop + census.churchPop) * Micro.educationMaintenanceCost;

        var roadCost = census.roadTotal * Micro.roadMaintenanceCost;
        var railCost = census.railTotal * Micro.railMaintenanceCost;
        this.roadMaintenanceBudget = Math.floor((roadCost + railCost) * Micro.RLevels[gameLevel])

        // Compute per-zone tax contributions using individual zone tax rates.
        // comTaxMod (e.g. -0.10 from small business incentive) reduces commercial yield.
        // indFx contains additive tax-rate modifiers from the industry specialization.
        // Residential population is normalised by 8 (one unit ≈ 8 residents) to match Valves.js.
        // The divisor 120 is a per-capita land-value scaling factor carried over from Micropolis.
        var comMod = (comTaxMod !== undefined) ? comTaxMod : 0;
        var specResMod = indFx ? (indFx.resTaxMod || 0) : 0;
        var specComMod = indFx ? (indFx.comTaxMod || 0) : 0;
        var specIndMod = indFx ? (indFx.indTaxMod || 0) : 0;

        var normalizedResPop = Math.floor(census.resPop / 8);
        var lva = census.landValueAverage;
        // Apply specialization modifiers as additive adjustments to effective tax rates (clamped to 0-20)
        var effectiveResTax = Math.max(0, Math.min(20, this.resTaxRate + specResMod));
        var effectiveComTax = Math.max(0, Math.min(20, Math.round(this.comTaxRate * (1 + comMod)) + specComMod));
        var effectiveIndTax = Math.max(0, Math.min(20, this.indTaxRate + specIndMod));

        var resTaxContrib = Math.floor(normalizedResPop * lva / 120) * effectiveResTax;
        var comTaxContrib = Math.floor(census.comPop    * lva / 120) * effectiveComTax;
        var indTaxContrib = Math.floor(census.indPop    * lva / 120) * effectiveIndTax;
        this.taxFund = Math.floor((resTaxContrib + comTaxContrib + indTaxContrib) * Micro.FLevels[gameLevel]);

        if (census.totalPop > 0) {
            this.cashFlow = this.taxFund - (this.policeMaintenanceBudget + this.fireMaintenanceBudget + this.roadMaintenanceBudget);
            this.doBudgetNow( false );
        } else {
            // We don't want roads etc deteriorating when population hasn't yet been established
            // (particularly early game)
            this.roadEffect   = Micro.MAX_ROAD_EFFECT;
            this.policeEffect = Micro.MAX_POLICESTATION_EFFECT;
            this.fireEffect   = Micro.MAX_FIRESTATION_EFFECT;
            this.waterEffect  = Micro.MAX_WATER_EFFECT;
        }
    }

    setTax ( amount ) {
        if (amount === this.cityTax) return;
        this.cityTax = amount;
        // Keep per-zone rates in sync when a global rate is set
        this.resTaxRate = amount;
        this.comTaxRate = amount;
        this.indTaxRate = amount;
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
        return this.roadEffect < Math.floor(15 * Micro.MAX_ROAD_EFFECT / 16);
    }

}
