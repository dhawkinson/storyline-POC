'use strict';

//  using commonjs notation
//  Library modules
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const express        = require('express');
const passport       = require('passport');
const path           = require('path');
const Sequelize      = require('sequelize');
const session        = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

/************************************************** 
 * NOTE: In development -- while offline from LM, 
 * the app is configured to run with SEQUELIZE, using the 'mysql' dialect (it's free).
 * When we bring it into CF for testing, we will reconfigure
 * to run with SEQUELIZE, using the 'tedious' dialect.
 * YES 'tedious' is the dialect for MS SQL-server, go figure!
 **************************************************/

//  Local modules
const keys = require('./config/keys');
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
//app.use(session(sess));
app.use(cookieParser())
app.use(session({
    secret: `${keys.sessionSecret}`,
    store: new SequelizeStore({
        db: sequelize,
        checkExpirationInterval: 900000, // The interval at which to cleanup expired sessions in milliseconds (15 min).
        expiration: 86400000 // The maximum age (in milliseconds) of a valid session (1 day).
    }),
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    proxy: true // if you do SSL outside of node.
}));
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
require('./routes/login')(app);

//  express tells node to listen for activity on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT);

console.log('App listening on port', PORT)
