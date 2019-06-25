var express= require('express');
var router = express.Router();
var {ensureAuthenticated} = require('../libs/myLibUtils');
var {connection} = require('../config.js');


router.get('/', ensureAuthenticated, function(req,res){
    connection.query(
        "SELECT login,highscore FROM users ORDER BY highscore DESC",
        function(err, results, fields) {
            if (results.length){
                var highscores={user:[]};
                for (var i=0;i<5;i++){
                    highscores.user.push({"name":results[i].login,"highScore":results[i].highscore,"numero":i+1}); //on transmet à la vue highscore le pseudo et le score
                }
                console.log(results);
                console.log(highscores);
                res.render('highscores',highscores);
            }
            else{
                console.log(err);
            }

        }
    );
});

module.exports = router;
