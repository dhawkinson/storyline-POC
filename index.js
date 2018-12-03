'use strict';

//  using commonjs notation
//  Library modules
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const config       = require('config');
const express      = require('express');
const passport     = require('passport');
const path         = require('path');
const Sequelize    = require('sequelize');

const Op           = Sequelize.Op;

//  Local modules
const processor    = require('./routes/process');
const index        = require('./routes/index');

const uriPort      = config.get('json.port');


//  establish the db connection
/************************************************** 
 * NOTE: the app is configured to run with SEQUELIZE as an ORM,
 * In development (while offline from LM), using the 'mysql' dialect (it's free).
 * When we bring it into CF for testing, we will reconfigure to run using the 'tedious' dialect.
 * YES 'tedious' is the dialect for MS SQL-server, go figure!
 **************************************************/

const sqlDb       = config.sql.db;
const sqlUser     = config.sql.user;
const sqlPassword = config.sql.password;
const sqlPort     = config.sql.port;
const sqlHost     = config.sql.host;
const sqlDialect  = config.sql.dialect

const sequelize = new Sequelize(sqlDb, sqlUser, sqlPassword, {
    host: `${sqlHost}`,
    dialect: `${sqlDialect}`
});

//  set up app object
const app = express();

// view engine parameters setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');;
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

//  routes
app.use('/api/process', processor);
app.use('/', index);

//  express tells node to listen for activity on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT);

console.log('App listening on port', PORT);