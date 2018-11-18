'use strict';

//  core modules
const EventEmitter = require('events');

//  library modules

//  local modules


class OutcomeFail extends EventEmitter {
    fail() {
        this.emit('outcomeFail');
    }
}

module.exports = OutcomeFail;