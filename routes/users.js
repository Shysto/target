/******************************************************/
/*                                                    */
/*    File which manages a call to the road /users    */
/*                                                    */
/******************************************************/

const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../libs/model.js');
var {isLoggedIn} = require('../libs/myLibUtils');

// Call register view
router.get('/register', isLoggedIn, function(req, res) {
    res.render('register');
});

// Call login view
router.get('/login', isLoggedIn, function(req, res) {
    res.render('login');

});

// Register a user
router.post('/register', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // Input validations
    req.checkBody('username', 'Username is required').notEmpty(); // report if username is not provided
    req.checkBody('password', 'Password is required').notEmpty(); // report if password is not provided
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password); // check the two passwords are equal

    const errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    User.createUser(username, password, req, res);
  }
});

passport.use(User.passportLocal);
User.saveData(passport);

// We get the information from the logged-in user (his nickname and current score)
router.get('/', function(req, res) {
    if (req["user"] != undefined) {
        const current_user = req["user"].login;
        const current_score = req.user.highScore;
        res.render('index', { username: current_user, highscore: "Your current score is " + current_score });
    } else {
        res.redirect('/users/login');
    }
});

// Verification of the user's identity
router.post('/login', passport.authenticate('local', { successRedirect: '/users', failureRedirect: '/users/login', failureFlash: true }), function(req, res) {
    res.redirect('/');
});

// Logout
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'Logout successfull');
    res.redirect('/users/login');
});

module.exports = router;