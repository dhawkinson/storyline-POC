const fs = require('fs');

module.exports = {
    development: {
        username: 'root',
        password: 'fsjsDB0!745',
        database: 'storyline_dev',
        host: '127.0.0.1',
        port: 3306,
        dialect: 'mysql'
    },
    test: {
        username: 'test',
        password: null,
        database: 'storyline_test',
        host: '127.0.0.1',
        port: 3307,
        dialect: 'mysql'
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
            }
        }
    }
};