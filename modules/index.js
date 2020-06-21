'use strict';

const db = require('../config/db');

function check_db(req, res, next) {
    db.dbs.connect()
    .then(function (obj) {
        obj.done();
        console.log('DB Connected');
        res.json({
            status: 'success',
            message: 'Development API is Running!'
        });
    })
    .catch(function (error) {
        console.log("ERROR:", error.message);
    });
}

check_db();


module.exports = {
    check_db:check_db
}