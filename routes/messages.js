const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../libs/myLibUtils.js');
const { displayChat } = require('../libs/model.js');

// Show the sixth last messages if the user is logged in
router.get('/', ensureAuthenticated, displayChat);


module.exports = router;