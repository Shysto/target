var express= require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var {connection} = require('../config.js');

//Comportement de la route register
router.get('/register', function(req,res){
  res.render('register');
});

//Comportement de la route login
router.get('/login', function(req,res){
  res.render('login');
});

//Enregistrement d'un utilisateur
router.post('/register', function(req,res){
var username = req.body.username;
var password = req.body.password;

//validation
req.checkBody('username', 'username is required').notEmpty(); //si le pseudo n'est pas fourni, on le signale
req.checkBody('password', 'password is required').notEmpty(); // idem pour le mot de passe
req.checkBody('password2', 'passwords do not match').equals(req.body.password); //on verifie que les deux mots de passes sont similaires

var errors = req.validationErrors();

if(errors){
res.render('register', {
  errors:errors
});
} else {
    User.createUser(username,password); //On créé le nouvel utilisateur si tout va bien

req.flash('success_msg','You are registered and can now log in.');
res.redirect('/users/login');
}
});


//On définit ici le comportement à adopter quand on recoit les informations de l'interface de connexion
// A METTRE DANS user.js (package model)
passport.use(new LocalStrategy(
    function(username, password, done){

      const login = "'" + username + "'";
      const pass = "'" + password + "'";

      connection.query(
          "SELECT * FROM users WHERE login=" + login + "and password=" + pass,
          function (err, results, fields) {
            if ((results != "undefined") && (results.length)) {
              connection.query(
                  "SELECT * FROM `users` WHERE `login` =" + login,
                  function(err, results, fields) {
                    if (err == null) {
                        return done(null,results[0]);
                    }
                  }
              );

            }
            else{
              return done(null, false, {message:'Identifiants incorrects !'});
            }
          }
      );

    }));


// Le pseudo et le score de l'utilisateur que l'on fournit ici, sont sauvegardé dans la session ouverte.
//Le pseudo servira a retrouver toutes les informations de l'utilisateur via la fonction deserializeUser

passport.serializeUser(function(user, done){
  done(null, {
      "login": user.login,
      "highScore": user.highScore
  }); //le login est stocké dans un cookie
});

passport.deserializeUser(function(username, done){
  const login = "'" + username.login + "'";
  connection.query(
      "SELECT * FROM `users` WHERE `login` =" + login,
      function(err, results, fields) {
        return done(err,results[0]);
      }
  );


});

//On recupère les infos de l'utilisateurs loggé (son pseudo et son score actuel)
router.get('/', function(req, res) {
    if (req["user"]!=undefined){
        var current_user = req["user"].login;
        var current_score = req.user.highScore;
        res.render('index', {username : "Bonjour " + current_user,highscore : "Votre score actuel est de " + current_score});
    }
    else{
        res.redirect('/users/login');
    }
});


//verification de l'identité de l'utilisateur
router.post('/login', passport.authenticate('local', {successRedirect:'/users', failureRedirect:'/users/login', failureFlash: true}), function(req,res){

res.redirect('/');
});


//Déconnexion
router.get('/logout', function(req,res){
  req.logout();
  req.flash('success', 'logout successfull');
  res.redirect('/users/login');
});

module.exports = router;
