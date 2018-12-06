'use strict';

/*==================================================
    This service eliminates redundancies in the learnersIn array
    and produces a learnersOut array
==================================================*/

//  node modules
const fs          = require('fs');
const config      = require('config');

//  services
const learnersIp    = require('./learners');
console.log('learnersIp2', learnersIp);
//  eliminate redundancies    
let learnersOp = [... new Set(learnersIp)];
/*let learnersOp = [];
let len = learnersIp.length;
for ( let i = 0; i < len; i++ ) {
    if ( learnersOp.indexOf( learnersIp[i] ) === -1 ) {
        learnersOp.push(learnersIp[i])
    }
}*/
console.log('learnersOp',learnersOp);