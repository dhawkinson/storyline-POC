'use strict';

/*==================================================
    This service GETs the list of ids to the json data files
    It pushes the ids of any outcomes that failed to convert to SQL on to the 'ids' array for reprocessing
    It writes the expanded list back to 'ids.json'
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

const getList = async (uri, idsList) => {
    await fs.readFile(uri, (err, data) => {
        if (err) throw err;
        return idsList = JSON.parse(data);
        });
}

//  Not sure if this is the right way to 'fire' idsCleared but it needs to be fired
//  The idea is to get the empty array written back to 'ids.json' before returning to 'process.js'
const clearList = async (uri, idsList) => {
    idsList.push()
    await fs.writeFile(uri, data, (err) => {
        if (err) throw err;
        console.log('The ids have been updated');
        done();
        });
}

getList(uri, idsList);

clearList(uri, idsList)

console.log('end of failedIds',idsList);

module.exports = idsList;