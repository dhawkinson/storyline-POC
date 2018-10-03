'use strict';
//  prod.js - return prod keys

module.exports = {
    sqlBB: process.env.SQL_DB,
    sqlUser: process.env.SQL_USER,
    sqlPassword: process.env.SQL_PASSWORD,
    sqlPort: process.env.SQL_PORT,
    sqlURI: process.env.SQL_URI,
    sessionSecret: process.env.SESSION_SECRET
};