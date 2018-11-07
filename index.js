'use strict';

//  using commonjs notation
//  Library modules
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const express        = require('express');
const passport       = require('passport');
const path           = require('path');
const Sequelize      = require('sequelize');
//  we may not use these session objects
//  until the decision is made to delete it, we will leave the logic commented out
//const session        = require('express-session');
//const SequelizeStore = require('connect-session-sequelize')(session.Store);
//const serveStatic    = require('serve-static');

//  Local modules
const keys = require('./config/keys');

//  establish the db connection
/************************************************** 
 * NOTE: the app is configured to run with SEQUELIZE as an ORM,
 * In development (while offline from LM), using the 'mysql' dialect (it's free).
 * When we bring it into CF for testing, we will reconfigure to run using the 'tedious' dialect.
 * YES 'tedious' is the dialect for MS SQL-server, go figure!
 **************************************************/

const sequelize = new Sequelize(keys.sqlDB, keys.sqlUser, keys.sqlPassword, {
    host: 'localhost',
    dialect: 'mysql'
});

//  set up app object
const app = express();

// view engine parameters setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//  middleware calls (app.use)  unconditional, these are always called
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
//  test the db connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

app.use(bodyParser.json()); //  ability to parse JSON. Necessary for sending data
app.use(bodyParser.urlencoded({ extended: false })); //  to read data from URLs (GET requests)
app.use(passport.initialize());
app.use(passport.session());

//  routing
require('./routes/index')(app);
//  We may not need the login route
//  the idea is that we haven't really decided whether we will be authenticating users
//  without authentication, there is no need for a login
//  until the decision is made to delete it, we will leave the logic commented out
//require('./routes/login')(app);
require('./routes/process')(app);
//  We may not need the user route
//  the idea is that we will get users from however users are retrieved currently
//  until the decision is made to delete it, we will leave the logic commented out
//require('./routes/user')(app);

//  express tells node to listen for activity on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT);

console.log('App listening on port', PORT);
