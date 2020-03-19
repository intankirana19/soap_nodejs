var express = require('express');
var router = express.Router();

//modules
var index = require('../modules/index');
var upload = require('../modules/vendor/upload');
var auth = require('../modules/shared/auth');
var sms = require('../modules/vendor/sms');
var client = require('../modules/shared/clients');
var smsReport = require('../modules/dashboard/sms/reports');
var otpReport = require('../modules/dashboard/otp/reports');
var smsToken = require('../modules/dashboard/sms/token');
var otpToken = require('../modules/dashboard/otp/token');

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

//Dashboard-sms
router.get('/sms/getreports', smsReport.getSmsReport);
router.get('/sms/gettokenlist', smsToken.getAllClientSmsToken);
router.get('/sms/getclienttoken', smsToken.getClientSmsToken);
router.put('/sms/addclienttoken', smsToken.addClientSmsToken);

//Dashboard-otp
router.get('/otp/getreports', otpReport.getOtpReport);
router.get('/otp/gettokenlist', otpToken.getAllClientOtpToken);
router.get('/otp/getclienttoken', otpToken.getClientOtpToken);
router.put('/otp/addclienttoken', otpToken.addClientOtpToken);

// router.post('/report/save', report.saveReport);
// router.patch('/report/update', report.updateReport);
// router.get('/report', report.getReport);


module.exports = router;
