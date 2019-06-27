var express = require('express');
var router = express.Router();

//Call help view

router.get('/', function(req, res) {
    res.render('help');
});

module.exports = router;