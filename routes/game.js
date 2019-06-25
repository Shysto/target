
var express= require('express');
var router = express.Router();
var {ensureAuthenticated} = require('../libs/myLibUtils');

//effectue une requête get, si l'utilisateur est loggé, on affiche la vue index sinon, on affiche la vue "game" -> A CHANGER
router.get('/',ensureAuthenticated, function(req,res){
    res.render('game');
});

module.exports = router;
