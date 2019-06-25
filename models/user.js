var express= require('express');
var router = express.Router();


// connexion à la bdd //a sortir dans un fichier config.js
var {connection} = require('../config.js');

//Création d'un nouvel utilisateur

function createUser(log,pass){
      const login="'"+log+"'";
      const password="'"+pass+"'";
  connection.query(
      "INSERT INTO users (login,password,isAdmin,isBlacklisted,highscore) VALUES (" + login + ',' +password+','+ '0' +','+ '0' + ','+'0'+')',
      function(err, results, fields) {
        if (err==null){
          console.log("L'utilisateur a été ajouté");
        }
        else{
          console.log(err);
        }
      }
  );

}

//actualiser high_score
function updateHighscore(user,hs){
  const username="'"+user+"'";
  const highscore="'"+hs+"'";
  connection.query(
      "UPDATE users SET highscore="+highscore+"WHERE login="+username,
      function(err, results, fields) {
        if (err==null){
          console.log("Score actualisé");
        }
        else{
          console.log(err);
        }
      }
      // results contains rows returned by server
      // console.log(fields); // fields contains extra meta data about results, if available
  );
}

module.exports = {
  createUser,
  updateHighscore,
};

