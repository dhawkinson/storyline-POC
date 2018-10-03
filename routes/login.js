'use strict';

//  library modules
const express  = require('express');
const Login    = express.Router();
const passport = require('passport');

/* GET home page. */
module.exports = (Login) => {
    Login.post('/login',
        passport.authenticate('local', {
            //  failure
            failureRedirect: '/login'
        }),
        function (req, res) {
            //  success
            res.redirect('/process/' + req.user.username); //  username in this instance is email address
        });
};
