/*****************************************************/
/*                                                   */
/*          Controller and starting servers          */
/*                                                   */
/*****************************************************/

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const logger = require('morgan');

// Init app
const app = express();

// Initializing HTTP server
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { generateCoordinates, uniqueid, isPresent, findRound } = require('./libs/myLibGame.js');

// Road's declaration

const routes = require('./routes/index'); 
const users = require('./routes/users'); 
const game = require('./routes/game'); 
const highscores = require('./routes/highscores');
const chat = require('./routes/chat');
const help = require('./routes/help');
let rounds = [];
let id;

// Configuration for the "handlebars" template engine
app.use(logger('dev'));
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Allowing views to access to the 'public' folder (which contains front end part)
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Init passport
app.use(passport.initialize());
app.use(passport.session());

// Express validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Connect flash (sending messages)
app.use(flash());

// Redirections
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes); // 'localhost:3000' redirect to ./routes/index
app.use('/users', users); // 'localhost:3000/users' redirect to ./routes/users
app.use('/game', game); // 'localhost:3000/game' redirect to ./routes/users
app.use('/highscores', highscores); // 'localhost:3000/highscores' redirect to ./routes/highscores
app.use('/chat', chat); // 'localhost:3000/chat' redirect to ./routes/chat
app.use('/help', help); // 'localhost:3000/help' redirect to ./routes/help

// Use of socket.io
io.on('connection', function(socket) {
    console.log('A user is connected');
    socket.on('setUsername', function(data) {
        console.log('User received');
        console.log(`${data}`);
        if (rounds.length == 0) {
            id = uniqueid();
            rounds.push({ "idRound": id, "players": [{ "login": data, "score": 0 }] });
            socket.emit('idRound', id);
            socket.join(id);
            console.log(id);
        } else {
            if (isPresent(data, rounds)) {
                console.log("User is taken");
                socket.emit("userTaken", "This user is already in a game")
            } else {
                if (rounds[rounds.length - 1]["players"].length < 2) {
                    id = rounds[rounds.length - 1]["idRound"];
                    console.log(id);
                    rounds[rounds.length - 1]["players"].push({ "login": data, "score": 0 });
                    socket.emit('idRound', rounds[rounds.length - 1]["idRound"]);
                    socket.join(rounds[rounds.length - 1]["idRound"]);
                    if (rounds[findRound(id, rounds)]["players"].length == 2) {
                        io.sockets.in(id).emit("Start", id);
                        console.log("start");
                    }
                } else {
                    id = uniqueid();
                    console.log(id);
                    rounds.push({ "idRound": id, "players": [{ "login": data, "score": 0 }] });
                    socket.emit('idRound', id);
                    socket.join(id);
                }
            }
        }
    });
    let start = Date.now();
    console.log("id : " + id);
    socket.on('GO', function(shot) {
        console.log("i = " + findRound(shot.idRound, rounds))
        io.sockets.in(shot.idRound).emit('round', { coordinates: generateCoordinates(), players: rounds[findRound(shot.idRound, rounds)]["players"] });
    })
    socket.on('target', function(shot) {
        if (rounds.length != 0 && rounds[findRound(shot.idRound, rounds)]["players"].length == 2) {
            setTimeout(function() {
                if (Date.now() - start < 90 * 1000) {
                    rounds[findRound(shot.idRound, rounds)]["players"].forEach(function(elt) {
                        if (elt.login == shot.user) {
                            onsole.log("Score de " + elt.login + " : " + elt.score);
                            elt.score = elt.score + 1;
                        }
                    })
                    io.sockets.in(shot.idRound).emit('round', { coordinates: generateCoordinates(), players: rounds[findRound(shot.idRound, rounds)]["players"] });
                    console.log(Date.now() - start)
                } else {
                    io.sockets.in(shot.idRound).emit('end');
                    rounds.splice(findRound(shot.idRound, rounds), 1);
                }
            }, 50);
        }
    })

    socket.on('leaving', function(shot) {
        console.log("Player leaving");
        io.sockets.in(shot.idRound).emit('abort');
        rounds.splice(findRound(shot.idRound, rounds), 1)
    })

});


// Set port
http.listen(3000, function() {
    console.log('Server started on port 3000');
});