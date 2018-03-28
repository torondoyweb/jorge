var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session')

var index = require('./routes/index');
var users = require('./routes/users');
var administracion = require('./routes/administracion')
var mensajeria = require('./routes/mensajeria')
var catalogo = require('./routes/catalogo')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(session({secret: '123456ghfgfd', resave: true, saveUninitialized: true }))

app.use(cookieSession({
  name: 'session', 
  keys: ['12w3456ghfgfd'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use('/', index)
app.use('/', users)
app.use('/', administracion)
app.use('/', mensajeria)
app.use('/', catalogo)
// Esto significa que el cursor o midherwhise busca las solicitudes dentro de index.js,users.js y carrito.js
// si no existe en ningin de los 2 archivos pasa a capturar el error


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
