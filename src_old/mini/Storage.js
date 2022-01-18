/* micropolisJS. Adapted by Graeme McCutcheon from Micropolis.
 *
 * This code is released under the GNU GPL v3, with some additional terms.
 * Please see the files LICENSE and COPYING for details. Alternatively,
 * consult http://micropolisjs.graememcc.co.uk/LICENSE and
 * http://micropolisjs.graememcc.co.uk/COPYING
 *
 */
 
Micro.getSavedGame = function() {
    if(Micro.localStorage==null) return;
    var savedGame = Micro.localStorage.getItem(Micro.KEY);
    if (savedGame !== null) { 
        savedGame = JSON.parse(savedGame);
        if (savedGame.version !== Micro.CURRENT_VERSION) this.transitionOldSave(savedGame);
        // Flag as a saved game for Game/Simulation etc...
        savedGame.isSavedGame = true;
    }

    return savedGame;
};

Micro.saveGame = function(gameData) {
    if(Micro.localStorage==null) return;
    gameData.version = Micro.CURRENT_VERSION;
    gameData = JSON.stringify(gameData);
    Micro.localStorage.setItem(Micro.KEY, gameData);
};

Micro.transitionOldSave = function(savedGame) {
    switch (savedGame.version) {
        case 1: savedGame.everClicked = false;
        /* falls through */
        case 2:
            savedGame.pollutionMaxX = Math.floor(savedGame.width / 2);
            savedGame.pollutionMaxY = Math.floor(savedGame.height / 2);
            savedGame.cityCentreX = Math.floor(savedGame.width / 2);
            savedGame.cityCentreY = Math.floor(savedGame.height / 2);
        break;
        //default: throw new Error('Unknown save version!');
    }
};

/*
  var Storage = {
    getSavedGame: getSavedGame,
    saveGame: saveGame,
    transitionOldSave: transitionOldSave
  };


Micro.defineProperty(Storage, 'CURRENT_VERSION', Micro.makeConstantDescriptor(3));
Micro.defineProperty(Storage, 'KEY', Micro.makeConstantDescriptor('micropolisJSGame'));
Micro.defineProperty(Storage, 'canStore', Micro.makeConstantDescriptor(window.localStorage !== undefined));
*/