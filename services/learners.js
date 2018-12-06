'use strict';

/*==================================================
    This service BUILDs the set of Learners to be processed to tables in this batch. 
    It builds an array of learner inputs which may contain redundancies.
    Redundancies can happen when a Learner has taken more than one course in the batch.
==================================================*/

//  node modules
const fs          = require('fs');
const config      = require('config');

//  services
const outcomeIds    = require('./idsList');


const uriProtocol = config.get('json.protocol');
//  the following two variables are not used in development env because we are using protocol = file:
//  they are kept in anticipation of moving to test and production where the protocol will be changed to http: or https:
//  and where we will need a port
//const uriHost     = config.get('json.host');
//const uriPort     = config.get('json.port');
const uriPath     = config.get('json.path');
const url         = `${uriProtocol}//${uriPath}/`;

const buildLearners = async (data) => {
    const learnerIp = await Promise.all(data.map(record => loadLearnerIp(record)));
    return learnerIp;
}

let learnersIp = [];
outcomeIds.forEach((outcomeId) => {
    let jsonData;
    let uri = new URL(`${url}${outcomeId}`);
    jsonData = JSON.parse(fs.readFileSync(uri));
    buildLearners(jsonData);
    //  parse learner
    /*let data = { 
        name: jsonData.strLearnerName,
        email: jsonData.strLearnerEmail
    };
    learnersIp.push(data);*/
});
console.log('learnersIp', learnersIp);
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
module.exports = learnersIp;