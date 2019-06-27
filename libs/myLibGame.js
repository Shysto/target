function generateCoordinates() {
    return [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)]
}


function uniqueid() {
    // always start with a letter (for DOM friendlyness)
    var idstr = String.fromCharCode(Math.floor((Math.random() * 25) + 65));
    do {
        // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
        var ascicode = Math.floor((Math.random() * 42) + 48);
        if (ascicode < 58 || ascicode > 64) {
            // exclude all chars between : (58) and @ (64)
            idstr += String.fromCharCode(ascicode);
        }
    } while (idstr.length < 32);

    return (idstr);
}

function addScore(user, users) {
    users.forEach(function(elt) {
        if (elt.login == user) {
            console.log("Score de " + elt.login + " : " + elt.score);
            elt.score = elt.score + 1;
        }
    })
}

function isPresent(user, round) {
    var test = false;
    round.forEach(function(game) {
        game.players.forEach(function(player) {
            if (user == player.login) {
                test = true;
            }
        })

    })
    return test;
}

function findRound(idRound, rounds) {
    var found = false;
    var i = 0;
    while (i < rounds.length && !found) {
        if (rounds[i].idRound == idRound) {
            found = true;
        }
        i = i + 1;
    }
    return i - 1;
}



module.exports = {
    generateCoordinates,
    uniqueid,
    addScore,
    isPresent,
    findRound
}