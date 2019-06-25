const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../libs/myLibUtils.js');
const { showHighscore } = require('../libs/model.js');

// Show all users' highscore if the user is logged in
router.get('/', ensureAuthenticated, showHighscore);

module.exports = router;
