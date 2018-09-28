'use strict';

//  using commonjs notation
//  Library modules
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const cookieSession = require('cookie-session');
const createError   = require('http-errors');
const express       = require('express');
const logger        = require('morgan');
const passport      = require('passport');
const path          = require('path');
const Sequelize     = require('sequelize');

//  set up app object
const app           = express();

//  Local modules
//  Express trick: we don't need any properties from www/user/passport so set no variables, but we need the modules
require('./bin/www');

const keys = require('./config/keys');

//  connect to db
const sequelize = new Sequelize(keys.sqlDB, keys.sqlUser, keys.sqlPassword, {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false
});
//  test the db connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });


//  middleware calls (app.use)
//  unconditional, these are always called
app.use(bodyParser.json());
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [keys.cookieKey]
    })
);
app.use(passport.initialize());
app.use(passport.session());

//  routing
//require('./routes/authRoutes')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;