const DISPLAY_MAX_HIGHSCORE = 5;
const DISPLAY_MAX_MESSAGE = 6;
const { connection } = require('../config.js');
const LocalStrategy = require('passport-local').Strategy;


// Here we define the behavior to adopt when we receive the information from the connection interface
const passportLocal = new LocalStrategy(function(username, password, done) {

    const login = "'" + username + "'";
    const pass = "'" + password + "'";

    connection.query(
        "SELECT * FROM users WHERE login=" + login + "and password=" + pass,
        function(err, results, fields) {
            if ((results != undefined) && (results.length)) {
                connection.query(
                    "SELECT * FROM `users` WHERE `login` =" + login,
                    function(err, results, fields) {
                        if (err == null) {
                            return done(null, results[0]);
                        }
                    }
                );

            } else {
                return done(null, false, { message: 'Identifiants incorrects !' });
            }
        }
    );
});


// Creation of a new user
function createUser(log, pass, req, res){
    connection.query(
        "SELECT * FROM users WHERE login = ?", [log], function(err, results, fields){
            if ((results != "undefined") && !(results.length)) {
                connection.query(
                    "INSERT INTO users (login, password, isAdmin, isBlacklisted, highscore) VALUES (?, ?, 0, 0, 0)", [log, pass],
                    function(err, results, fields) {
                        if (err == null){
                            console.log("User added");
                            req.flash('success_msg', 'You are registered and can now log in.');
                            res.redirect('/users/login');
                        }
                        else{
                            console.log(err);
                        }
                    }
                );
            }
            else{
                console.log("This username is already taken");
                req.flash('error_msg', 'This user already exists.');
                res.redirect('/users/register');
            }
        }
    );
}

// High Score updating if the new score is better than the score previously entered
function updateHighscore(user, hs){
    connection.query(
        "UPDATE users SET highscore = ? WHERE login = ? AND highscore < ?", [hs, user, hs],
        function(err, results, fields) {
            if (err == null) {
                console.log("Score updated");
            } else {
                console.log(err);
            }
        }

    );
}

// Display the DISPLAY_MAX logins the associated highscores ordered by descending order
function showHighscore(req, res) {
  connection.query(
    "SELECT login,highscore FROM users ORDER BY highscore DESC LIMIT ?", [DISPLAY_MAX_HIGHSCORE],
    function (err, results, fields) {
      if (results.length) {
        const highscores = { user: [] };
        for (var i = 0; i < DISPLAY_MAX_HIGHSCORE; i++) {
          highscores.user.push({ "name": results[i].login, "highScore": results[i].highscore, "numero": i + 1 }); // we transmit to the view the nickname and the score
        }
          res.render('highscores',highscores);
      }
    });
}

// Display the DISPLAY_MAX_MESSAGE the associated last messages
function displayChat(req, res) {
    connection.query(
        // Tried : "SELECT loginAuteur, message FROM (SELECT loginAuteur, message FROM chat ORDER BY idMessage DESC LIMIT" + DISPLAY_MAX_MESSAGE + ') ORDER BY idMessage ASC',
        "SELECT loginAuteur, message FROM chat ORDER BY idMessage DESC LIMIT " + DISPLAY_MAX_MESSAGE,
        function(err, results, fields) {
            if (results.length) {
                console.log(results.length);
                const messages = { user: [] };
                // for (var i = 0; i < DISPLAY_MAX_MESSAGE; i++) {
                for (var i = results.length - 1; i >= 0; i--) {
                    messages.user.push({ "name": results[i].loginAuteur, "message": results[i].message }); // we transmit to the view the nickname and the message
                }
                console.log(results);
                console.log(messages);
                res.render('chat', messages);
            } else {
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
    connection.query(
      "SELECT * FROM users WHERE login = ?", [username.login],
      function (err, results, fields) {
        return done(err, results[0]);
      }
    );
  });
};


// Insert a new message in the chat
function addChat(login, ms){
    connection.query(
        "INSERT INTO chat (loginAuteur,message) VALUES (?, ?)", [login, ms],
        function(err, results, fields) {
            if (err == null) {
                console.log("Message added");
            } else {
                console.log(err);
            }
        }

    );
}

// To know if someone is blacklisted
// Return a boolean : true if the user is blacklisted, false otherwise
// Return nothing if the user doesn't exist
function isBlacklisted(user){
    connection.query(
        "SELECT isBlacklisted FROM users WHERE login = ?", [user],
        function(err, results, fields) {
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
            } else {
                console.log(err);
            }
        }

    );
}

// To Blacklist someone
// To be used by an admin
function toBlacklist(log){
    connection.query(
        "UPDATE users SET isBlacklisted = 1 WHERE login = ?", [log],
        function(err, results, fields) {
            if (err == null) {
                console.log("User blacklisted");
            } else {
                console.log(err);
            }
        }

    );
}

// To unBlacklist someone
// To be used by an admin
function toFree(log){
    connection.query(
        "UPDATE users SET isBlacklisted = 0 WHERE login = ?", [log],
        function(err, results, fields) {
            if (err == null) {
                console.log("User can now use the chat");
            } else {
                console.log(err);
            }
        }

    );
}

// Check if the user is admin
// Return a boolean : true if the user is admin, false otherwise
// Return nothing if the user doesn't exist
function isAdmin(log){
    connection.query(
        "SELECT isAdmin FROM users WHERE login = ?", [log],
        function(err, results, fields) {
            if (err == null) {
                console.log("Trying to know if the user is admin");
                if (results[0].isAdmin == 0) {
                    console.log("False");
                    return false;
                }
                if (results[0].isAdmin == 1) {
                    console.log("True");
                    return true;
                }
            } else {
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
        function(err, results, fields) {
            if (err == null) {
                console.log("Message added");
            } else {
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
        function(err, results, fields) {
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
            } else {
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
        function(err, results, fields) {
            if (err == null) {
                console.log("User blacklisted");
            } else {
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
        function(err, results, fields) {
            if (err == null) {
                console.log("User can now use the chat");
            } else {
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
        function(err, results, fields) {
            if (err == null) {
                console.log("Trying to know if the user is admin");
                if (results[0].isAdmin == 0) {
                    console.log("False");
                    return false;
                }
                if (results[0].isAdmin == 1) {
                    console.log("True");
                    return true;
                }
            } else {
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
    updateHighscore
};
