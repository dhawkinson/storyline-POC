'use strict';

/*==================================================
    This service GETs the list of ids to the json data files 
    to be processed, from a json file with the id 'ids.json'.
    It returns and exports idsList (an array holding the ids of the json data files)
    It also calls putIdsCleared to clear the 'ids.json' file for the next batch of processing
==================================================*/

//  node modules
const fs          = require('fs');
const config      = require('config');

const uriProtocol = config.get('json.protocol');
//  the following two variables are not used in development env because we are using protocol = file:
//  they are kept in anticipation of moving to test and production where the protocol will be changed to http: or https:
//  and where we will need a port
//const uriHost     = config.get('json.host');
//const uriPort     = config.get('json.port');
const uriPath     = config.get('json.path');
const url         = `${uriProtocol}//${uriPath}/`;
const idsID       = 'ids.json';

const uri = new URL(`${url}${idsID}`);
let dataIn = fs.readFileSync(uri);
const idsList = JSON.parse(dataIn).ids;

let dataOut = JSON.stringify({'ids': []});
fs.writeFileSync(uri, dataOut);

module.exports = idsList;