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
const { generateCoordinates, uniqueid, addScore } = require('./libs/myLibGame.js');

// Road's declaration

const routes = require('./routes/index'); //chemin vers la route index
const users = require('./routes/users'); //chemin vers la route users
const game = require('./routes/game'); //chemin vers la route game
const highscores = require('./routes/highscores'); //chemin vers la route game
const chat = require('./routes/chat');
const messages = require('./routes/messages');

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
app.use('/messages', messages); // 'localhost:3000/chat' redirect to ./routes/messages

// Use of socket.io
io.on('connection', function(socket) {
    console.log('A user is connected');
    socket.on('setUsername', function(data) {
        console.log('user received');
        console.log(`${data}`);
        if (rounds.length == 0) {
            id = uniqueid();
            rounds.push({ "idRound": id, "players": [{ "login": data, "score": 0 }] });
            socket.emit('idRound', id);
            socket.join(id);
        } else {
            if (rounds[rounds.length - 1]["players"].length < 2) {
                id = rounds[rounds.length - 1]["idRound"];
                rounds[rounds.length - 1]["players"].push({ "login": data, "score": 0 });
                socket.emit('idRound', rounds[rounds.length - 1]["idRound"]);
                socket.join(rounds[rounds.length - 1]["idRound"]);
                if (rounds[0]["players"].length == 2) {
                    io.sockets.in(id).emit("Start", id);
                    console.log("start");
                }
            } else {
                id = uniqueid();
                rounds.push({ "idRound": id, "players": [{ "login": data, "score": 0 }] });
                socket.emit('idRound', id);
                socket.join(id);
            }
        }
    });
    let startS = new Date().getSeconds();
    let startM = new Date().getMinutes();
    console.log("id : " + id);
    socket.on('GO', function() {
        io.sockets.in(id).emit('round', { coordinates: generateCoordinates(), players: rounds[0]["players"] });
    })
    socket.on('target', function(user) {
        if (rounds.length != 0 && rounds[0]["players"].length == 2) {
            setTimeout(function() {
                if (new Date().getSeconds() + new Date().getMinutes() * 60 - startS - startM * 60 < 90) {
                    rounds[0]["players"].forEach(function(elt) {
                        if (elt.login == user) {
                            console.log(elt.login + " de score : " + elt.score)
                            elt.score = elt.score + 1;
                        }
                    })
                    io.sockets.in(id).emit('round', { coordinates: generateCoordinates(), players: rounds[0]["players"] });
                    console.log(new Date().getSeconds() + new Date().getMinutes() * 60 - startS - startM * 60)
                } else {
                    io.sockets.in(id).emit('end');
                    rounds = [];
                    id = "";
                }
            }, 50);
        }
    })


});


// Set port
http.listen(3000, function() {
    console.log('Server started on port 3000');
});