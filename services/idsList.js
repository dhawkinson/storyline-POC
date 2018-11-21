'use strict';

/*==================================================
    This service GETs the list of ids to the json data files 
    to be processed, from a json file with the id 'ids.json'.
    It returns and exports idsList (an array holding the ids of the json data files)
    It also calls putIdsCleared to clear the 'ids.json' file for the next batch of processing
==================================================*/

//  node modules
const express     = require('express');
const fs          = require('fs');
const config      = require('config');

const app         = express();

const uriProtocol = config.get('json.protocol');
const uriHost     = config.get('json.host');
const uriPort     = config.get('json.port');
const uriPath     = config.get('json.path');
const url         = `${uriProtocol}//${uriPath}/`;
const idsID       = 'ids.json';
const uri         = new URL(`${url}${idsID}`);
let idsList       = [];
//let idsEmpty;

const readList = async (uri) => {
    await fs.readFile(uri, (err, data) => {
        if (err) throw err;
        idsList = JSON.parse(data).ids;
        return;
    });
}

//  The idea is to get the empty array written back to 'ids.json' before returning to 'process.js'
const clearList = async (uri) => {
    let data = JSON.stringify({'ids': []});
    await fs.writeFile(uri, data, (err) => {
        if (err) throw err;
    });
}

const processList = async (idsList) => {
    try {
        idsList = await readList(uri);
        //emptyList = await clearList(uri);
        return idsList;
    }
    catch (err) {
        return (console.log( new Error(err) ));
    };
}

processList(idsList);

//idsList = ["5sM5YLnnNMN_1540338527220.json","5sM5YLnnNMN_1540389571029.json","6tN6ZMooONO_1540389269289.json"]

module.exports = idsList;