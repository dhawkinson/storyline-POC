'use strict';
//  keys.js - figure out what set of credential to return

if (process.env.NODE_ENV === 'production') {
    //  we are in production - return prod set of keys from prod.js
    module.exports = require('./prod');
} else {
    //  we are in development - return dev set of keys from dev.js
    module.exports = require('./dev');
}