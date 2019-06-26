const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../libs/myLibUtils.js');
const { displayChat, addChat } = require('../libs/model.js');

// Show the sixth last messages if the user is logged in
router.get('/', ensureAuthenticated, function(req,res){
    res.render("chat");
});

module.exports = router;

// Register a new message
router.post('/', function (req, res) {
    const message = req.body.message;
    //console.log(message);

// Input validation
    req.checkBody('message', 'message is required').notEmpty(); // report if message is not provided

    const errors = req.validationErrors();

    if (errors) {
        res.render('chat', {
            errors: errors
        });
    } else {
        addChat(req["user"].login, message); // Creation of a new message if all goes well
        res.redirect("/chat");
    }

});