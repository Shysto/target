var express = require('express');
var router = express.Router();
var { ensureAuthenticated } = require('../libs/myLibUtils');
const io = require('socket.io');
const socket = io();

//Call game view if user is connected
router.get('/', ensureAuthenticated, function(req, res) {
    const current_user = req["user"].login;
    res.render('game', { username: current_user });
});







module.exports = router;