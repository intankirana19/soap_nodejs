var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var indexRouter = require('./routes/index');
var cors = require('cors');

// process.env.NODE_ENV = 'production';

//const config = require('./config/configuration');

var app = express();
app.use(cors());
// app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: false }));
app.use(cookieParser());
//app.use(express.bodyParser);
app.use('/', indexRouter);

app.get('/config', (req, res) => {
  res.json(global.gConfig);
});

app.use(function(req, res, next) {
  next(createError(404));
});


// app.use(function(err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error');
// });

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// view engine setup




module.exports = app;
