'use strict';

//  Library modules
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sequelize     = require('sequelize');

//  Local modules
//const keys = require('../config/keys');

const User = sequelize.model('user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user)
        });
});

//  instruct app how to use passport with the local strategy
//  pulled from http://www.passportjs.org/docs/authenticate/
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Username (email) not found.'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));
