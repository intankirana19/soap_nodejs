const config = require('../config/configuration');
var promise = require('bluebird');
var options = {
    promiseLib: promise
  };
  
var pgp = require('pg-promise')(options);

const cn = {
    host: global.gConfig.pg_host,
    port: global.gConfig.pg_port,
    database: global.gConfig.pg_db,
    user: global.gConfig.pg_user,
    password: global.gConfig.pg_password
  };
const dbs = pgp(cn);

module.exports = {
    dbs:dbs
}