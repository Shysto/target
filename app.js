//CONTROLLEUR

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator=require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
var logger = require('morgan');


//routes
var routes = require('./routes/index'); //chemin vers la route index
var users=require('./routes/users'); //chemin vers la route users
var game = require('./routes/game'); //chemin vers la route game
var highscores = require('./routes/highscores'); //chemin vers la route game

//init app
var app=express();

app.use(logger('dev'));

//Configuration pour le moteur de template "handlebars"
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');


//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Permet aux vues d'accéder au fichier public contenant la partie front-end
app.use(express.static(path.join(__dirname, 'public')));

//utilisation d'une session
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave:true
}));

//initialisation de la session
app.use(passport.initialize());
app.use(passport.session());


//express validator
app.use(expressValidator({
  errorFormatter:function(param, msg, value){
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam+='[' + namespace.shift() + ']';
    }
    return{
      param:formParam,
      msg:msg,
      value:value
    };
    }
}));

//permet d'envoyer des messages flashs
app.use(flash());

//global vars
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes); // 'localhost:3000' renvoie vers la route index
app.use('/users', users); // 'localhost:3000/users' renvoie vers la route users
app.use('/game',game);
app.use('/highscores',highscores);


//Initialisation du serveur http

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { generateCoordinates } = require('./routes/functions');



//utilisation de socket.io pour le jeu
io.on('connection', function(socket) {
  console.log('A user is connected');
  io.emit('coordonnee', generateCoordinates());
  socket.on('cible', function(msg) {
    io.emit('coordonnee', generateCoordinates());
  })
});


//serveur initialisé sur le port 3000
http.listen(3000, function() {
  console.log('Server started on port 3000');
});




