const { updateHighscore } = require("./model.js");

function generateCoordinates() {
    return [Math.floor(Math.random() * 96 + 2), Math.floor(Math.random() * 96 + 2)];
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
// Return the index of a round using idRound
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
// Create new round and make the player join
function createRound(rounds, socket, id, data) {
    rounds.push({ "idRound": id, "players": [{ "login": data, "score": 0 }] });
    socket.emit('idRound', id);
    socket.join(id);
}
// Make the player join the last round
function joinRound(rounds, socket, data) {
    rounds[rounds.length - 1]["players"].push({ "login": data, "score": 0 });
    socket.emit('idRound', rounds[rounds.length - 1]["idRound"]);
    socket.join(rounds[rounds.length - 1]["idRound"]);
}

// Create the message to be send through the socket during a round
function createMsgRound(shot, rounds) {
    return { coordinates: generateCoordinates(), players: rounds[findRound(shot.idRound, rounds)]["players"] }
}

//Update the highscores of all players
function updateHighscoreAll(round) {
    round["players"].forEach(function(player) {
        updateHighscore(player["login"], player["score"]);
        console.log("Updating score of player : " + player["login"])
    });
}
// Checks if a player is present in a round, and adds it to a round accordingly

function addPlayer(data, rounds, socket, io) {
    let id;
    // If no round is going on
    if (rounds.length == 0) {
        id = uniqueid();
        createRound(rounds, socket, id, data);
    } else {
        //Checks if player is already in a game
        if (isPresent(data, rounds)) {
            console.log("User is taken");
            socket.emit("userTaken", "This user is already in a game")
        } else {
            //Checks if round is not full with players
            if (rounds[rounds.length - 1]["players"].length < 2) {
                id = rounds[rounds.length - 1]["idRound"];
                joinRound(rounds, socket, data);
                if (rounds[findRound(id, rounds)]["players"].length == 2) {
                    io.sockets.in(id).emit("Start", id);
                    console.log("start");
                    start = Date.now();
                }
            } else {
                id = uniqueid();
                createRound(rounds, socket, id, data);
            }
        }
    }
    return id;
}



module.exports = {
    generateCoordinates,
    addScore,
    findRound,
    updateHighscoreAll,
    addPlayer,
    createMsgRound
}