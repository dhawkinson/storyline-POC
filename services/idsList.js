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

const scheme      = config.get('json.scheme')
const jsonPath    = config.get('json.path');
const url         = `${scheme}${jsonPath}/`;
const idsID       = 'ids.json';
const uri         = `${url}${idsID}`;
let idsList = [];

const getList = async (uri) => {
    await fs.readFile(uri, (err, data) => {
        if (err) throw err;
        return jsonData = JSON.parse(data);
        });
}

//  Not sure if this is the right way to 'fire' idsCleared but it needs to be fired
//  The idea is to get the empty array written back to 'ids.json' before returning to 'process.js'
const clearList = async (uri) => {
    let data = {'ids': []}
    await fs.writeFile(uri, data, (err) => {
        if (err) throw err;
        console.log('The ids have been cleared');
        });
}

getList(uri);

clearList(uri)

console.log('end of idsList',idsList);

module.exports = idsList;