
// TODO L20N
Micro.InfoBar = function () {
    var setClass = function(classification) { document.getElementById("cclass").innerHTML = classification; };
    var setDate = function(m, year) { document.getElementById("date").innerHTML = [TXT.months[m], year].join(' '); };
    var setFunds = function(funds) { document.getElementById("funds").innerHTML = funds; };
    var setPopulation = function(pop) { document.getElementById("population").innerHTML = pop; };
    var setScore = function(score) { document.getElementById("score").innerHTML = score; };

    return {
        setClass: setClass,
        setDate: setDate,
        setFunds: setFunds,
        setPopulation: setPopulation,
        setScore: setScore
    }
}

var InfoBar = new Micro.InfoBar();