const express= require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../libs/myLibUtils');

// Call index view if user is logged in
router.get('/', ensureAuthenticated, function(req,res){
  res.render('index');
});

module.exports = router;
