'use strict';

//  library modules
const express = require('express');
const Index  = express.Router();

/* GET home page. */
module.exports = (Index) => {
    Index.get('/', function (req, res, next) {
      res.render('index');
    });

    Index.get('/#top', function (req, res, next) {
      res.render('index');
    });
};

