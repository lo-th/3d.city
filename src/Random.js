Micro.Random = function(){}

Micro.Random.prototype = {
    constructor: Micro.Random,
    getChance : function(chance) {
      return (this.getRandom16() & chance) === 0;
    },
    getERandom : function(max) {
      var r1 = this.getRandom(max);
      var r2 = this.getRandom(max);
      return Math.min(r1, r2);
    },
    getRandom : function(max) {
      return Math.floor(Math.random() * (max + 1));
    },
    getRandom16 : function() {
      return this.getRandom(65535);
    },
    getRandom16Signed : function() {
      var value = this.getRandom16();
      if (value >= 32768)
        value = 32768 - value;
      return value;
    }
}

var Random = new Micro.Random();
