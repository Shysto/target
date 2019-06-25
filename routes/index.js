const express= require('express');
const router = express.Router();

// Call index view
router.get('/', function(req,res){
  res.render('index');
});

module.exports = router;
