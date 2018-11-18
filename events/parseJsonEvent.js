'use strict';

//  core modules
const EventEmitter = require('events');

//  library modules

//  local modules


class ParseJson extends EventEmitter {
    parse() {
        this.emit('jsonParse');
    }
}

module.exports = ParseJson;