var express = require('express');
var router = express.Router();

//modules
var index = require('../modules/index');
var upload = require('../modules/vendor/upload');
var auth = require('../modules/shared/auth');
var sms = require('../modules/vendor/sms');
var client = require('../modules/shared/clients');
var report = require('../modules/dashboard/reports')

//check DB
router.get('/ping', index.check_db);

//upload
router.put('/upload', upload.upload);

//user login
router.post('/login', auth.checkUser);

//send SMS
router.post('/sms', sms.sendSMS)


//Clients
router.get('/client', client.getClient);
router.post('/client/add', client.addClient);
router.patch('/client/edit', client.editClient);
router.delete('client/delete', client.deleteClient);

//Report

router.post('/report/save', report.saveReport);
router.patch('/report/update', report.updateReport);
router.get('/report', report.getReport);


module.exports = router;
