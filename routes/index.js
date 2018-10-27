'use strict';

//  library modules
const express  = require('express');
const rtIndex  = express.Router();

/* GET home page. */
module.exports = (rtIndex) => {
    rtIndex.get('/', function (req, res, next) {
      res.render('index');
    });

    rtIndex.get('/#top', function (req, res, next) {
      res.render('index');
    });
};

