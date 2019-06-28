const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../libs/myLibUtils.js');
const { showHighscore } = require('../libs/model.js');
const { showScorePlayer } = require('../libs/model.js');

router.get('/:login', ensureAuthenticated, showScorePlayer);

// Show all users' highscore if the user is logged in
router.get('/', ensureAuthenticated, showHighscore);


module.exports = router;


