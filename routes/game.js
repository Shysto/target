
var express= require('express');
var router = express.Router();
var {ensureAuthenticated} = require('../libs/myLibUtils');

//Call game view if user is connected
router.get('/',ensureAuthenticated, function(req,res){
    res.render('game');
});

module.exports = router;
