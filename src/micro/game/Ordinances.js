/* OpenPublica — City Ordinances / Policies
 *
 * A set of toggleable city ordinances that the player can enact.
 * Each ordinance has an annual cost, and modifiers that are applied
 * to the simulation each year while the ordinance is active.
 *
 * Effects are expressed as deltas applied inside Simulation.updateEducationHealth()
 * and Simulation.simulate() — the Simulation consults this.ordinances.getEffects().
 */

export const ORDINANCE_DEFS = [
    {
        id: 'FREE_CLINICS',
        name: 'Free Clinics',
        description: 'Fund public health clinics. Improves city health rating.',
        annualCost: 200,
        effects: { healthBonus: 20, pollutionMod: 0, educationBonus: 0, trafficMod: 0, comTaxMod: 0 }
    },
    {
        id: 'RECYCLING_PROGRAM',
        name: 'Recycling Program',
        description: 'Mandatory recycling reduces city-wide pollution.',
        annualCost: 150,
        effects: { healthBonus: 5, pollutionMod: -15, educationBonus: 0, trafficMod: 0, comTaxMod: 0 }
    },
    {
        id: 'EDUCATION_SUBSIDIES',
        name: 'Education Subsidies',
        description: 'Subsidise schools and libraries. Improves education and attracts residents.',
        annualCost: 300,
        effects: { healthBonus: 0, pollutionMod: 0, educationBonus: 25, trafficMod: 0, comTaxMod: 0 }
    },
    {
        id: 'NOISE_ORDINANCE',
        name: 'Noise Ordinance',
        description: 'Restrict noise-generating activities. Small happiness boost at no cost.',
        annualCost: 0,
        effects: { healthBonus: 3, pollutionMod: -5, educationBonus: 0, trafficMod: 0, comTaxMod: 0 }
    },
    {
        id: 'SMALL_BIZ_INCENTIVE',
        name: 'Small Business Incentive',
        description: 'Tax breaks encourage commercial growth, but reduce commercial tax yield by 10%.',
        annualCost: 0,
        effects: { healthBonus: 0, pollutionMod: 0, educationBonus: 0, trafficMod: 0, comTaxMod: -0.10 }
    },
    {
        id: 'PUBLIC_TRANSIT_SUBSIDY',
        name: 'Public Transit Subsidy',
        description: 'Fund public buses and trams to reduce road congestion.',
        annualCost: 250,
        effects: { healthBonus: 5, pollutionMod: -8, educationBonus: 0, trafficMod: -10, comTaxMod: 0 }
    },
    {
        id: 'GREEN_BUILDING_CODE',
        name: 'Green Building Code',
        description: 'Require energy-efficient construction. Reduces city-wide pollution and improves health at modest cost.',
        annualCost: 180,
        effects: { healthBonus: 10, pollutionMod: -20, educationBonus: 5, trafficMod: 0, comTaxMod: 0 }
    },
    {
        id: 'SPEED_CAMERAS',
        name: 'Speed Camera Network',
        description: 'Automated enforcement reduces accidents and deters crime in residential areas.',
        annualCost: 100,
        effects: { healthBonus: 5, pollutionMod: 0, educationBonus: 0, trafficMod: -5, comTaxMod: 0, crimeMod: -15 }
    }
];

export class Ordinances {

    constructor () {
        // Map from ordinance id → boolean (active or not)
        this._active = {};
        for (var i = 0; i < ORDINANCE_DEFS.length; i++) {
            this._active[ ORDINANCE_DEFS[i].id ] = false;
        }
    }

    save (saveData) {
        saveData.ordinances = Object.assign({}, this._active);
    }

    load (saveData) {
        if (saveData && saveData.ordinances) {
            var ids = Object.keys(saveData.ordinances);
            for (var i = 0; i < ids.length; i++) {
                if (this._active.hasOwnProperty(ids[i])) {
                    this._active[ ids[i] ] = !!saveData.ordinances[ ids[i] ];
                }
            }
        }
    }

    toggle (id) {
        if (this._active.hasOwnProperty(id)) {
            this._active[id] = !this._active[id];
            return this._active[id];
        }
        return false;
    }

    isActive (id) {
        return !!this._active[id];
    }

    // Returns combined effect object for all active ordinances
    getEffects () {
        var combined = {
            healthBonus:    0,
            pollutionMod:   0,
            educationBonus: 0,
            trafficMod:     0,
            comTaxMod:      0,
            crimeMod:       0
        };
        for (var i = 0; i < ORDINANCE_DEFS.length; i++) {
            var def = ORDINANCE_DEFS[i];
            if (!this._active[def.id]) continue;
            var fx = def.effects;
            combined.healthBonus    += fx.healthBonus    || 0;
            combined.pollutionMod   += fx.pollutionMod   || 0;
            combined.educationBonus += fx.educationBonus || 0;
            combined.trafficMod     += fx.trafficMod     || 0;
            combined.comTaxMod      += fx.comTaxMod      || 0;
            combined.crimeMod       += fx.crimeMod       || 0;
        }
        return combined;
    }

    // Annual cost (deducted from budget each year)
    getAnnualCost () {
        var total = 0;
        for (var i = 0; i < ORDINANCE_DEFS.length; i++) {
            if (this._active[ ORDINANCE_DEFS[i].id ]) {
                total += ORDINANCE_DEFS[i].annualCost;
            }
        }
        return total;
    }

    // Serialisable list of ordinances with their current state (for the UI)
    getList () {
        return ORDINANCE_DEFS.map(function(def) {
            return {
                id:          def.id,
                name:        def.name,
                description: def.description,
                annualCost:  def.annualCost,
                active:      !!this._active[def.id]
            };
        }, this);
    }

}
