'use strict';
//  prod.js - return prod keys

module.exports = {
    localClientID: process.env.LOCAL_CLIENT_ID,
    localClientSecret: process.env.LOCAL_CLIENT_SECRET,
    sqlURI: process.env.SQL_URI,
    cookieKey: process.env.COOKIE_KEY
};