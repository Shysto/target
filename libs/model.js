const DISPLAY_MAX_HIGHSCORE = 5;
const DISPLAY_MAX_MESSAGE = 4;
const { connection } = require('../config.js');
const LocalStrategy = require('passport-local').Strategy;
const messages = null;

// Here we define the behavior to adopt when we receive the information from the connection interface
const passportLocal = new LocalStrategy(function (username, password, done) {

    const login = "'" + username + "'";
    const pass = "'" + password + "'";

    connection.query(
        "SELECT * FROM users WHERE login=" + login + "and password=" + pass,
        function (err, results, fields) {
            if ((results != undefined) && (results.length)) {
                connection.query(
                    "SELECT * FROM `users` WHERE `login` =" + login,
                    function (err, results, fields) {
                        if (err == null) {
                            return done(null, results[0]);
                        }
                    }
                );

            }
            else {
                return done(null, false, { message: 'Identifiants incorrects !' });
            }
        }
    );

});


// Creation of a new user
function createUser(log, pass) {
    const login = "'" + log + "'";
    const password = "'" + pass + "'";
    connection.query(
        "INSERT INTO users (login,password,isAdmin,isBlacklisted,highscore) VALUES (" + login + ',' + password + ',' + '0' + ',' + '0' + ',' + '0' + ')',
        function (err, results, fields) {
            if (err == null) {
                console.log("User added");
            }
            else {
                console.log(err);
            }
        }
    );

}

// High Score updating if the new score is better than the score previously entered
function updateHighscore(user, hs) {
    const username = "'" + user + "'";
    const highscore = "'" + hs + "'";
    connection.query(
        "UPDATE users SET highscore=" + highscore + "WHERE login=" + username + "AND highscore<" + highscore,
        function (err, results, fields) {
            if (err == null) {
                console.log("Score updated");
            }
            else {
                console.log(err);
            }
        }

    );
}

// Display the DISPLAY_MAX logins the associated highscores ordered by descending order
function showHighscore(req, res) {
    connection.query(
        "SELECT login,highscore FROM users ORDER BY highscore DESC LIMIT " + DISPLAY_MAX_HIGHSCORE,
        function (err, results, fields) {
            if (results.length) {
                const highscores = { user: [] };
                for (var i = 0; i < DISPLAY_MAX_HIGHSCORE; i++) {
                    highscores.user.push({ "name": results[i].login, "highScore": results[i].highscore, "numero": i + 1 }); // we transmit to the view the nickname and the score
                }
                console.log(results);
                console.log(highscores);
                res.render('highscores', highscores);
            }
            else {
                console.log(err);
            }
        }
    );
}

// The username and user score provided here are saved in the open session.
// The nickname will be used to retrieve all the user's information via the deserializeUser function
function saveData(passport) {
    passport.serializeUser(function (user, done) {
        done(null, {
            "login": user.login,
            "highScore": user.highScore
        }); // login is stored in a cookie
    });

    passport.deserializeUser(function (username, done) {
        const login = "'" + username.login + "'";
        connection.query(
            "SELECT * FROM `users` WHERE `login` =" + login,
            function (err, results, fields) {
                return done(err, results[0]);
            }
        );
    });
};

// Collect the 6 last messages from the chat to display it
// Messages are available using the global variable messages
function displayChat() {
    connection.query(
        "SELECT loginAuteur, message FROM chat ORDER BY idMessage DESC LIMIT " + DISPLAY_MAX_MESSAGE,
        function (err, results, fields) {
            if (err == null) {
                console.log("Chat loaded");
                // Messages are loaded in ascending order of arrival, for index between 0 and 5
                messages = results;
            }
            else {
                console.log(err);
            }
        }

    );
}

// Insert a new message in the chat
function addChat(login, ms) {
    const loginAuteur = "'" + login + "'";
    const message = "'" + ms + "'";
    connection.query(
        "INSERT INTO chat (loginAuteur,message) VALUES (" + loginAuteur + ',' + message + ')',
        function (err, results, fields) {
            if (err == null) {
                console.log("Message added");
            }
            else {
                console.log(err);
            }
        }

    );
}

// To know if someone is blacklisted
// Return a boolean : true if the user is blacklisted, false otherwise
// Return nothing if the user doesn't exist
function isBlacklisted(user) {
    const username = "'" + user + "'";
    connection.query(
        "SELECT isBlacklisted FROM users WHERE login = " + username,
        function (err, results, fields) {
            if (err == null) {
                console.log("Trying to know if the user is blacklisted");
                if (results[0].isBlacklisted == 0) {
                    console.log("False");
                    return false;
                }
                if (results[0].isBlacklisted == 1) {
                    console.log("True");
                    return true;
                }
            }
            else {
                console.log(err);
            }
        }

    );
}

// To Blacklist someone
// To be used by an admin
function toBlacklist(log) {
    const login = "'" + log + "'";
    connection.query(
        "UPDATE users SET isBlacklisted = 1 WHERE login =" + login,
        function (err, results, fields) {
            if (err == null) {
                console.log("User blacklisted");
            }
            else {
                console.log(err);
            }
        }

    );
}

// To unBlacklist someone
// To be used by an admin
function toFree(log) {
    const login = "'" + log + "'";
    connection.query(
        "UPDATE users SET isBlacklisted = 0 WHERE login =" + login,
        function (err, results, fields) {
            if (err == null) {
                console.log("User can now use the chat");
            }
            else {
                console.log(err);
            }
        }

    );
}

// Check if the user is admin
// Return a boolean : true if the user is admin, false otherwise
// Return nothing if the user doesn't exist
function isAdmin(log) {
    const login = "'" + log + "'";
    connection.query(
        "SELECT isAdmin FROM users WHERE login = " + login,
        function (err, results, fields) {
            if (err == null) {
                console.log("Trying to know if the user is admin : " + results[0].isAdmin);
                return results[0].isAdmin;
            }
            else {
                console.log(err);
            }
        }

    );
}

// Manage access to admin view only for admin user
function ensureAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        const login = "'" + req["user"].login + "'";
        connection.query(
            "SELECT isAdmin FROM users WHERE login=" + login,
            function (err, results, fields) {
                if (results.length) {
                    if (results[0].isAdmin) {
                        next();
                    } else {
                        req.flash('error_msg', "You are not an administrator");
                        res.redirect('/users/'); //Redirection to view index if user isn't admin
                    }
                }
                else {
                    console.log(err);
                }
            });
    }
    else {
        req.flash('error_msg', "You are not logged in");
        res.redirect('/users/login'); //Redirection to view login if user isn't logged in
    }
}

function showAdministrationPage(req, res) {
    const blacklisted = { user: [] };
    const notBlacklisted = { user: [] };
    connection.query(
        "SELECT login FROM users WHERE isBlacklisted = 0",
        function (err, results, fields) {
            if (results.length) {
                for (var i = 0; i < results.length; i++) {
                    notBlacklisted.user.push({ "name": results[i].login, "numero": i + 1 });
                }
                
                connection.query(
                    "SELECT login FROM users WHERE isBlacklisted = 1",
                    function (err, results, fields) {
                        if (results.length) {
                            for (var i = 0; i < results.length; i++) {
                                blacklisted.user.push({ "name": results[i].login, "numero": i + 1 });
                            }
                            
                        }
                        else {
                            console.log(err);
                        }
                        console.log("nbl : " + notBlacklisted.user[0].name);
                        console.log("bl : " + blacklisted.user);
                        res.render('admin', { username: req["user"].login, bl: blacklisted, nbl: notBlacklisted });
                    }
                );
            }
            else {
                console.log(err);
            }
        }
    );
}

module.exports = {
    createUser,
    updateHighscore,
    displayChat,
    addChat,
    isBlacklisted,
    toBlacklist,
    toFree,
    isAdmin,
    showHighscore,
    saveData,
    passportLocal,
    ensureAdmin,
    showAdministrationPage
};