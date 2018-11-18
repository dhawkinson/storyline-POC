'use strict';

//  core modules
const EventEmitter = require('events');

//  library modules

//  local modules


class KeysList extends EventEmitter {
    list() {
        this.emit('idsList');
    }
}

module.exports = KeysList;