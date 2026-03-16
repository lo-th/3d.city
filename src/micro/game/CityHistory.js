/*
 * City History Timeline for 3D City
 * Records major events and milestones
 */

const MAX_HISTORY = 50;

export class CityHistory {

    constructor () {
        this.events = [];
    }

    save (saveData) {
        saveData.cityHistory = this.events;
    }

    load (saveData) {
        if (saveData.cityHistory) {
            this.events = saveData.cityHistory;
        }
    }

    addEvent (type, description, cityTime, startingYear) {
        let year = Math.floor(cityTime / 48) + startingYear;
        let monthIdx = Math.floor(cityTime % 48) >> 2;

        let event = {
            type: type,
            desc: description,
            year: year,
            month: monthIdx,
            cityTime: cityTime
        };

        this.events.push(event);

        // Keep history bounded
        if (this.events.length > MAX_HISTORY) {
            this.events.shift();
        }

        return event;
    }

    getRecent (count) {
        count = count || 10;
        return this.events.slice(-count).reverse();
    }

    getAll () {
        return this.events.slice().reverse();
    }

    clear () {
        this.events = [];
    }
}

// Event type constants
export const HistoryEventType = {
    MILESTONE: 'milestone',
    DISASTER: 'disaster',
    ACHIEVEMENT: 'achievement',
    ECONOMIC: 'economic',
    GROWTH: 'growth',
    SEASON: 'season'
};
