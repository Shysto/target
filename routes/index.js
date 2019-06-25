var express= require('express');
var router = express.Router();
var {ensureAuthenticated} = require('../libs/myLibUtils');

//effectue une requête get, on renvoie l'utilisateur loggué ou non sur la vue index
router.get('/', ensureAuthenticated, function(req,res){
  res.render('index');
});

module.exports = router;
