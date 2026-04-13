/* OpenPublica — Industry Specialization
 *
 * Players choose a city economic focus that shapes how the simulation
 * behaves — affecting tax yields, pollution, unemployment, and growth.
 *
 * Specializations are mutually exclusive (only one active at a time).
 * Effects are returned via getEffects() and applied in Simulation.js.
 */

import { Micro } from '../Micro.js';

export const SPECIALIZATION_DEFS = [
    {
        id: Micro.INDUSTRY_MIXED,
        name: 'Mixed Economy',
        icon: '🏙️',
        description: 'Balanced development across all sectors. No bonuses or penalties.',
        effects: {
            resTaxMod:     0,     // additive modifier on residential tax rate (percentage points)
            comTaxMod:     0,     // additive modifier on commercial tax rate
            indTaxMod:     0,     // additive modifier on industrial tax rate
            pollutionMod:  0,     // city-wide pollution delta
            unemployMod:   0,     // unemployment score delta
            landValueMod:  0,     // land value average delta
            educationMod:  0,     // education level bonus
            healthMod:     0,     // health level bonus
            parkBonus:     0      // bonus per park tile
        }
    },
    {
        id: Micro.INDUSTRY_TECH,
        name: 'Tech Hub',
        icon: '💻',
        description: 'High-skilled jobs, clean industry. Higher commercial/industrial tax, lower pollution, but expensive infrastructure.',
        effects: {
            resTaxMod:     0,
            comTaxMod:     1,     // +1% effective commercial tax rate
            indTaxMod:     1,     // +1% effective industrial tax rate
            pollutionMod: -20,    // cleaner industry
            unemployMod:  -15,    // more jobs
            landValueMod:  10,    // desirable neighbourhood
            educationMod:  20,    // tech culture boosts education
            healthMod:      5,
            parkBonus:      0
        }
    },
    {
        id: Micro.INDUSTRY_MANUFACTURING,
        name: 'Manufacturing',
        icon: '🏭',
        description: 'Heavy industry drives strong tax revenue but creates significant pollution.',
        effects: {
            resTaxMod:     0,
            comTaxMod:     0,
            indTaxMod:     2,     // +2% effective industrial tax rate (more output)
            pollutionMod:  35,    // heavy pollution
            unemployMod:  -20,    // lots of blue-collar jobs
            landValueMod: -10,    // pollution depresses land value
            educationMod: -10,    // brain drain risk
            healthMod:    -15,    // pollution health impact
            parkBonus:      0
        }
    },
    {
        id: Micro.INDUSTRY_TOURISM,
        name: 'Tourism',
        icon: '🌴',
        description: 'Service-economy city. Strong commercial tax base, parks are highly valued; low crime required.',
        effects: {
            resTaxMod:     0,
            comTaxMod:     2,     // +2% effective commercial tax rate (visitor spending)
            indTaxMod:    -1,     // less industry
            pollutionMod: -10,
            unemployMod:   10,    // seasonal / service jobs are unstable
            landValueMod:  15,    // scenic appeal
            educationMod:   5,
            healthMod:     10,    // clean environment
            parkBonus:      3     // each park tile worth 3 extra happiness points
        }
    },
    {
        id: Micro.INDUSTRY_FARMING,
        name: 'Farming & Agriculture',
        icon: '🌾',
        description: 'Rural-focused economy. Low pollution and stable employment, but modest tax yields.',
        effects: {
            resTaxMod:     0,
            comTaxMod:    -1,     // lower commercial activity
            indTaxMod:    -1,     // modest industrial output
            pollutionMod: -25,    // very clean
            unemployMod:  -10,    // stable rural employment
            landValueMod:   5,
            educationMod:   0,
            healthMod:     20,    // clean air / food supply boost
            parkBonus:      2
        }
    }
];

// Build a quick lookup map by id
const _defsById = {};
for (var _i = 0; _i < SPECIALIZATION_DEFS.length; _i++) {
    _defsById[ SPECIALIZATION_DEFS[_i].id ] = SPECIALIZATION_DEFS[_i];
}

export class IndustrySpecialization {

    constructor () {
        this._current = Micro.INDUSTRY_MIXED;
    }

    save (saveData) {
        saveData.industrySpecialization = this._current;
    }

    load (saveData) {
        if (saveData && saveData.industrySpecialization && _defsById[ saveData.industrySpecialization ]) {
            this._current = saveData.industrySpecialization;
        }
    }

    // Returns id of active specialization
    getCurrent () {
        return this._current;
    }

    // Set active specialization by id; returns true if valid
    setSpecialization (id) {
        if (_defsById[id]) {
            this._current = id;
            return true;
        }
        return false;
    }

    // Returns the effect object for the active specialization
    getEffects () {
        var def = _defsById[this._current] || _defsById[Micro.INDUSTRY_MIXED];
        return def.effects;
    }

    // Returns the full definition for the active specialization (name, icon, description, effects)
    getCurrentDef () {
        return _defsById[this._current] || _defsById[Micro.INDUSTRY_MIXED];
    }

    // Returns the full list of all specialization definitions (for UI rendering)
    getList () {
        return SPECIALIZATION_DEFS.map(function(def) {
            return {
                id:          def.id,
                name:        def.name,
                icon:        def.icon,
                description: def.description,
                active:      def.id === this._current
            };
        }, this);
    }

}
