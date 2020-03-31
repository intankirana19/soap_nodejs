var express = require('express');
var router = express.Router();

//modules
var index = require('../modules/index');
var upload = require('../modules/vendor/upload');
var auth = require('../modules/shared/auth');
var sms = require('../modules/vendor/sms');
var dsms = require('../modules/dashboard/sms/sms');
var account = require('../modules/shared/account');
var client = require('../modules/shared/client');
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

//create SMS 
router.post('/sms/create', dsms.createSms)

//send SMS
router.post('/sms', sms.sendSMS)

//Account
router.get('/account/list', account.getAllAccounts);
router.post('/account/create', account.createAccount);
router.patch('/account/edit', account.editAccount);
router.patch('/account/activate', account.activateAccount);
router.patch('/account/delete', account.deleteAccount);

//Account Roles
router.get('/account/roleslist', account.getRoles);
router.get('/account/role', account.accountRole);

//Clients
router.get('/client/list', client.getAllClients);
router.post('/client/add', client.addClient);
router.patch('/client/edit', client.editClient);
router.patch('/client/activate', client.activateClient);
router.patch('/client/delete', client.deleteClient);

//Dashboard-sms
router.get('/sms/getreports', smsReport.getSmsReport);
router.get('/sms/gettokenlist', smsToken.getAllClientSmsToken);
router.get('/sms/getclienttoken', smsToken.getClientSmsToken);
router.patch('/sms/addclienttoken', smsToken.addClientSmsToken);

//Dashboard-otp
router.get('/otp/getreports', otpReport.getOtpReport);
router.get('/otp/gettokenlist', otpToken.getAllClientOtpToken);
router.get('/otp/getclienttoken', otpToken.getClientOtpToken);
router.patch('/otp/addclienttoken', otpToken.addClientOtpToken);

// router.post('/report/save', report.saveReport);
// router.patch('/report/update', report.updateReport);
// router.get('/report', report.getReport);


module.exports = router;
