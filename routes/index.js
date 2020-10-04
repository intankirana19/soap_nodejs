var express = require('express');
var router = express.Router();
// const cron = require('node-cron');

//modules
var auth = require('../modules/auth');
var user = require('../modules/user');

router.post('/login', auth.checkUser);

router.get('/levellist', user.levelList);

module.exports = router;
