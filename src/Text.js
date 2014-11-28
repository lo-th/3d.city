/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 
Micro.Text = function(){
    // TODO Some kind of rudimentary L20N based on navigator.language?

    // Query tool strings
    var densityStrings = ['Low', 'Medium', 'High', 'Very High'];
    var landValueStrings = ['Slum', 'Lower Class', 'Middle Class', 'High'];
    var crimeStrings = ['Safe', 'Light', 'Moderate', 'Dangerous'];
    var pollutionStrings = ['None', 'Moderate', 'Heavy', 'Very Heavy'];
    var rateStrings = ['Declining', 'Stable', 'Slow Growth', 'Fast Growth'];
    var zoneTypes = ['Clear', 'Water', 'Trees', 'Rubble', 'Flood', 'Radioactive Waste',
                   'Fire', 'Road', 'Power', 'Rail', 'Residential', 'Commercial',
                   'Industrial', 'Seaport', 'Airport', 'Coal Power', 'Fire Department',
                   'Police Department', 'Stadium', 'Nuclear Power', 'Draw Bridge',
                   'Radar Dish', 'Fountain', 'Industrial', 'Steelers 38  Bears 3',
                   'Draw Bridge', 'Ur 238'];

    // Evaluation window
    var gameLevel = {};
    gameLevel['' + Micro.LEVEL_EASY] = 'Easy';
    gameLevel['' + Micro.LEVEL_MED] = 'Medium';
    gameLevel['' + Micro.LEVEL_HARD] = 'Hard';
 
    var cityClass = {};
    cityClass[Micro.CC_VILLAGE] = 'VILLAGE';
    cityClass[Micro.CC_TOWN] = 'TOWN';
    cityClass[Micro.CC_CITY] = 'CITY';
    cityClass[Micro.CC_CAPITAL] = 'CAPITAL';
    cityClass[Micro.CC_METROPOLIS] = 'METROPOLIS';
    cityClass[Micro.CC_MEGALOPOLIS] = 'MEGALOPOLIS';

    var problems = {};
    problems[Micro.CRIME] = 'Crime';
    problems[Micro.POLLUTION] = 'Pollution';
    problems[Micro.HOUSING] = 'Housing';
    problems[Micro.TAXES] = 'Taxes';
    problems[Micro.TRAFFIC] = 'Traffic';
    problems[Micro.UNEMPLOYMENT] = 'Unemployment';
    problems[Micro.FIRE] = 'Fire';

    // months
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Tool strings
    var toolMessages = {
        noMoney: 'Insufficient funds to build that',
        needsDoze: 'Area must be bulldozed first'
    };

    // Message strings
    var neutralMessages = {};
    neutralMessages[Messages.FIRE_STATION_NEEDS_FUNDING] = 'Fire departments need funding';
    neutralMessages[Messages.NEED_AIRPORT] = 'Commerce requires an Airport';
    neutralMessages[Messages.NEED_FIRE_STATION] = 'Citizens demand a Fire Department';
    neutralMessages[Messages.NEED_ELECTRICITY] = 'Build a Power Plant';
    neutralMessages[Messages.NEED_MORE_INDUSTRIAL] = 'More industrial zones needed';
    neutralMessages[Messages.NEED_MORE_COMMERCIAL] = 'More commercial zones needed';
    neutralMessages[Messages.NEED_MORE_RESIDENTIAL] = 'More residential zones needed';
    neutralMessages[Messages.NEED_MORE_RAILS] = 'Inadequate rail system';
    neutralMessages[Messages.NEED_MORE_ROADS] = 'More roads required';
    neutralMessages[Messages.NEED_POLICE_STATION] = 'Citizens demand a Police Department';
    neutralMessages[Messages.NEED_SEAPORT] = 'Industry requires a Sea Port';
    neutralMessages[Messages.NEED_STADIUM] = 'Residents demand a Stadium';
    neutralMessages[Messages.ROAD_NEEDS_FUNDING] = 'Roads deteriorating, due to lack of funds';
    neutralMessages[Messages.POLICE_NEEDS_FUNDING] = 'Police departments need funding';
    neutralMessages[Messages.WELCOME] = 'Welcome to 3D City';
    neutralMessages[Messages.WELCOMEBACK] = 'Welcome to 3D City';

    var badMessages = {};
    badMessages[Messages.BLACKOUTS_REPORTED] = 'Brownouts, build another Power Plant';
    badMessages[Messages.COPTER_CRASHED] = 'A helicopter crashed ';
    badMessages[Messages.EARTHQUAKE] = 'Major earthquake reported !!';
    badMessages[Messages.EXPLOSION_REPORTED] = 'Explosion detected ';
    badMessages[Messages.FLOODING_REPORTED] = 'Flooding reported !';
    badMessages[Messages.FIRE_REPORTED] = 'Fire reported ';
    badMessages[Messages.HEAVY_TRAFFIC] = 'Heavy Traffic reported';
    badMessages[Messages.HIGH_CRIME] = 'Crime very high';
    badMessages[Messages.HIGH_POLLUTION] = 'Pollution very high';
    badMessages[Messages.MONSTER_SIGHTED] = 'A Monster has been sighted !';
    badMessages[Messages.NO_MONEY] = 'YOUR CITY HAS GONE BROKE';
    badMessages[Messages.NOT_ENOUGH_POWER] = 'Blackouts reported. insufficient power capacity';
    badMessages[Messages.NUCLEAR_MELTDOWN] = 'A Nuclear Meltdown has occurred !!';
    badMessages[Messages.PLANE_CRASHED] = 'A plane has crashed ';
    badMessages[Messages.SHIP_CRASHED] = 'Shipwreck reported ';
    badMessages[Messages.TAX_TOO_HIGH] = 'Citizens upset. The tax rate is too high';
    badMessages[Messages.TORNADO_SIGHTED] = 'Tornado reported !';
    badMessages[Messages.TRAFFIC_JAMS] = 'Frequent traffic jams reported';
    badMessages[Messages.TRAIN_CRASHED] = 'A train crashed ';

    var goodMessages = ' {}';
    goodMessages[Messages.REACHED_CAPITAL] = 'Population has reached 50,000';
    goodMessages[Messages.REACHED_CITY] = 'Population has reached 10,000';
    goodMessages[Messages.REACHED_MEGALOPOLIS] = 'Population has reached 500,000';
    goodMessages[Messages.REACHED_METROPOLIS] = 'Population has reached 100,000';
    goodMessages[Messages.REACHED_TOWN] = 'Population has reached 2,000';

    return {
        badMessages: badMessages,
        cityClass: cityClass,
        crimeStrings: crimeStrings,
        densityStrings: densityStrings,
        gameLevel: gameLevel,
        goodMessages: goodMessages,
        landValueStrings: landValueStrings,
        months: months,
        neutralMessages: neutralMessages,
        problems: problems,
        pollutionStrings: pollutionStrings,
        rateStrings: rateStrings,
        toolMessages: toolMessages,
        zoneTypes: zoneTypes
    }

};

var TXT = new Micro.Text();