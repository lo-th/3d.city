/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */

import { MiscUtils } from './Micro.js';

var messageData = {
  AUTOBUDGET_CHANGED: MiscUtils.mcd('Autobudget changed'),
  BUDGET_NEEDED: MiscUtils.mcd('User needs to budget'),
  BUDGET_REQUESTED: MiscUtils.mcd('Budget window requested'),
  BUDGET_WINDOW_CLOSED: MiscUtils.mcd('Budget window closed'),
  BLACKOUTS_REPORTED: MiscUtils.mcd('Blackouts reported'),
  CLASSIFICATION_UPDATED: MiscUtils.mcd('Classification updated'),
  CONGRATS_SHOWING: MiscUtils.mcd('Congratulations showing'),
  CONGRATS_WINDOW_CLOSED: MiscUtils.mcd('Congratulations window closed'),
  DATE_UPDATED: MiscUtils.mcd('Date changed'),
  DEBUG_WINDOW_REQUESTED: MiscUtils.mcd('Debug Window Requested'),
  DEBUG_WINDOW_CLOSED: MiscUtils.mcd('Debug Window Closed'),
  DISASTER_REQUESTED: MiscUtils.mcd('Disaster Requested'),
  DISASTER_WINDOW_CLOSED: MiscUtils.mcd('Disaster window closed'),
  EARTHQUAKE: MiscUtils.mcd('Earthquake'),
  EVAL_REQUESTED: MiscUtils.mcd('Evaluation Requested'),
  EVAL_UPDATED: MiscUtils.mcd('Evaluation Updated'),
  EVAL_WINDOW_CLOSED: MiscUtils.mcd('Eval window closed'),
  EXPLOSION_REPORTED: MiscUtils.mcd('Explosion Reported'),
  FIRE_REPORTED: MiscUtils.mcd('Fire!'),
  FIRE_STATION_NEEDS_FUNDING: MiscUtils.mcd('Fire station needs funding'),
  FLOODING_REPORTED: MiscUtils.mcd('Flooding reported'),
  FRONT_END_MESSAGE: MiscUtils.mcd('Front-end Message'),
  FUNDS_CHANGED: MiscUtils.mcd('Total funds has changed'),
  HEAVY_TRAFFIC: MiscUtils.mcd('Heavy traffic in city'),
  HELICOPTER_CRASHED: MiscUtils.mcd('Helicopter crashed'),
  HIGH_CRIME: MiscUtils.mcd('High crime'),
  HIGH_POLLUTION: MiscUtils.mcd('High pollution'),
  MONSTER_SIGHTED: MiscUtils.mcd('Monster sighted'),
  NAG_WINDOW_CLOSED: MiscUtils.mcd('Nag window closed'),
  NEED_AIRPORT: MiscUtils.mcd('Airport needed'),
  NEED_ELECTRICITY: MiscUtils.mcd('More power needed'),
  NEED_FIRE_STATION: MiscUtils.mcd('Fire station needed'),
  NEED_MORE_COMMERCIAL: MiscUtils.mcd('More commercial zones needed'),
  NEED_MORE_INDUSTRIAL: MiscUtils.mcd('More industrial zones needed'),
  NEED_MORE_RAILS: MiscUtils.mcd('More railways needed'),
  NEED_MORE_RESIDENTIAL: MiscUtils.mcd('More residential needed'),
  NEED_MORE_ROADS: MiscUtils.mcd('More roads needed'),
  NEED_POLICE_STATION: MiscUtils.mcd('Police station needed'),
  NEED_SEAPORT: MiscUtils.mcd('Seaport needed'),
  NEED_STADIUM: MiscUtils.mcd('Stadium needed'),
  NO_MONEY: MiscUtils.mcd('No money'),
  NOT_ENOUGH_POWER: MiscUtils.mcd('Not enough power'),
  NUCLEAR_MELTDOWN: MiscUtils.mcd('Nuclear Meltdown'),
  PLANE_CRASHED: MiscUtils.mcd('Plane crashed'),
  POLICE_NEEDS_FUNDING: MiscUtils.mcd('Police need funding'),
  POPULATION_UPDATED: MiscUtils.mcd('Population updated'),
  QUERY_WINDOW_CLOSED: MiscUtils.mcd('Query window closed'),
  QUERY_WINDOW_NEEDED: MiscUtils.mcd('Query window needed'),
  REACHED_CAPITAL: MiscUtils.mcd('Now a capital'),
  REACHED_CITY: MiscUtils.mcd('Now a city'),
  REACHED_METROPOLIS: MiscUtils.mcd('Now a metropolis'),
  REACHED_MEGALOPOLIS: MiscUtils.mcd('Now a megalopolis'),
  REACHED_TOWN: MiscUtils.mcd('Now a town'),
  REACHED_VILLAGE: MiscUtils.mcd('Now a village'),
  ROAD_NEEDS_FUNDING: MiscUtils.mcd('Roads need funding'),
  SAVE_REQUESTED: MiscUtils.mcd('Save requested'),
  SAVE_WINDOW_CLOSED: MiscUtils.mcd('Save window closed'),
  SCORE_UPDATED: MiscUtils.mcd('Score updated'),
  SCREENSHOT_LINK_CLOSED: MiscUtils.mcd('Screenshot link closed'),
  SCREENSHOT_WINDOW_CLOSED: MiscUtils.mcd('Screenshot window closed'),
  SCREENSHOT_WINDOW_REQUESTED: MiscUtils.mcd('Screenshot window requested'),
  SETTINGS_WINDOW_CLOSED: MiscUtils.mcd('Settings window closed'),
  SETTINGS_WINDOW_REQUESTED: MiscUtils.mcd('Settings window requested'),
  SHIP_CRASHED: MiscUtils.mcd('Shipwrecked'),
  SOUND_EXPLOSIONHIGH: MiscUtils.mcd('Explosion! Bang!'),
  SOUND_EXPLOSIONLOW: MiscUtils.mcd('Explosion! Bang!'),
  SOUND_HEAVY_TRAFFIC: MiscUtils.mcd('Heavy Traffic sound'),
  SOUND_HONKHONK: MiscUtils.mcd('HonkHonk sound'),
  SOUND_MONSTER: MiscUtils.mcd('Monster sound'),
  SPEED_CHANGE: MiscUtils.mcd('Speed change'),
  SPRITE_DYING: MiscUtils.mcd('Sprite dying'),
  SPRITE_MOVED: MiscUtils.mcd('Sprite move'),
  TAX_TOO_HIGH: MiscUtils.mcd('Tax too high'),
  TOOL_CLICKED: MiscUtils.mcd('Tool clicked'),
  TORNADO_SIGHTED: MiscUtils.mcd('Tornado sighted'),
  TOUCH_WINDOW_CLOSED: MiscUtils.mcd('Touch Window closed'),
  TRAFFIC_JAMS: MiscUtils.mcd('Traffic jams reported'),
  TRAIN_CRASHED: MiscUtils.mcd('Train crashed'),
  VALVES_UPDATED: MiscUtils.mcd('Valves updated'),
  WELCOME: MiscUtils.mcd('Welcome to micropolisJS'),
  WELCOMEBACK: MiscUtils.mcd('Welcome back to your 3D city')
};

export const Messages = Object.defineProperties({}, messageData);
//var Messages = Object.defineProperties({}, messageData);

var disasterMessages = [Messages.EARTHQUAKE, Messages.EXPLOSION_REPORTED, Messages.FIRE_REPORTED,
                        Messages.FLOODING_REPORTED, Messages.MONSTER_SIGHTED, Messages.NUCLEAR_MELTDOWN,
                        Messages.TORNADO_SIGHTED];
Object.defineProperty(Messages, 'disasterMessages', MiscUtils.mcd(disasterMessages));

var crashes = [Messages.HELICOPTER_CRASHED, Messages.PLANE_CRASHED, Messages.SHIP_CRASHED, Messages.TRAIN_CRASHED];
Object.defineProperty(Messages, 'crashes', MiscUtils.mcd(crashes));


//export { Messages };