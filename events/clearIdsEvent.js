'use strict';

//  core modules
const EventEmitter = require('events');

//  library modules

//  local modules


class ClearIds extends EventEmitter {
    clear() {
        this.emit('idsClear');
    }
}

module.exports = ClearIds;