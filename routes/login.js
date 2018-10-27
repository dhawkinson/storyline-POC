'use strict';

//  library modules
const express  = require('express');
const rtLogin = express.Router();
//  We may go with an authentication approach that LM already uses in CF
//  until the decision is made to delete it, we ill leave the logic commented out
//const passport = require('passport');

/* GET home page. */
module.exports = (rtLogin) => {
        //  We may go with an authentication approach that LM already uses in CF
        //  until the decision is made to delete it, we ill leave the logic commented out
        /*rtLogin.post('/login',passport.authenticate('local', {
            //  failure
            failureRedirect: '/login'
        }),
        function (req, res) {
            //  success
            res.redirect('/process/' + req.user.username); //  username in this instance is email address
    });*/
    rtLogin.get('/login', (req, res, next) => {
        res.render('login')
    });
};
