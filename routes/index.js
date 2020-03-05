var express = require('express');
var router = express.Router();

//modules
var index = require('../modules/index');
var upload = require('../modules/vendor/upload');
var auth = require('../modules/auth')

//check DB
router.get('/ping', index.check_db);

//upload
router.put('/upload', upload.upload)

//user login
router.post('/login', auth.checkUser)


module.exports = router;
