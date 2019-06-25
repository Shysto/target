const DISPLAY_MAX = 5;

const { connection } = require('../config.js');
const LocalStrategy = require('passport-local').Strategy;

// Here we define the behavior to adopt when we receive the information from the connection interface
const passportLocal = new LocalStrategy(function (username, password, done) {

  const login = "'" + username + "'";
  const pass = "'" + password + "'";

  connection.query(
    "SELECT * FROM users WHERE login=" + login + "and password=" + pass,
    function (err, results, fields) {
      if ((results != "undefined") && (results.length)) {
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
        console.log("L'utilisateur a été ajouté");
      }
      else {
        console.log(err);
      }
    }
  );

}

// Update highScore
function updateHighscore(user, hs) {
  const username = "'" + user + "'";
  const highscore = "'" + hs + "'";
  connection.query(
    "UPDATE users SET highscore=" + highscore + "WHERE login=" + username,
    function (err, results, fields) {
      if (err == null) {
        console.log("Score actualisé");
      }
      else {
        console.log(err);
      }
    }
    // results contains rows returned by server
    // console.log(fields); // fields contains extra meta data about results, if available
  );
}

function showHighscore(req, res) {
  connection.query(
    "SELECT login,highscore FROM users ORDER BY highscore DESC",
    function (err, results, fields) {
      if (results.length) {
        const highscores = { user: [] };
        for (var i = 0; i < DISPLAY_MAX; i++) {
          highscores.user.push({ "name": results[i].login, "highScore": results[i].highscore, "numero": i + 1 }); //we transmit to the view the nickname and the score
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

// Manage access to admin view only for admin user
function isAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    const login = "'" + req["user"].login + "'";
    connection.query(
      "SELECT isAdmin FROM users WHERE login=" + login,
      function (err, results, fields) {
        if (results.length) {
          if (results[0].isAdmin) {
            next();
          } else {
            req.flash('error_msg', "Vous n'êtes pas administrateur");
            res.redirect('/users/'); //Redirection to view index if user isn't admin
          }
        }
        else {
          console.log(err);
        }
      });
  }
  else {
    req.flash('error_msg', "Vous n'êtes pas connecté");
    res.redirect('/users/login'); //Redirection to view login if user isn't logged in
  }
}

module.exports = {
  createUser,
  updateHighscore,
  showHighscore,
  passportLocal,
  saveData,
  isAdmin
};

