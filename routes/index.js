var express = require('express');
var router = express.Router();
// const cron = require('node-cron');

//modules
var index = require('../modules/index');
var upload = require('../modules/vendor/upload');
var auth = require('../modules/shared/auth');
var sms = require('../modules/vendor/sms');
var otp = require('../modules/vendor/otp');
var dsms = require('../modules/dashboard/sms/message');
var account = require('../modules/dashboard/account');
var client = require('../modules/dashboard/client');
var tokenReset = require('../modules/dashboard/token');
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
router.post('/sms/create', dsms.createSms);

//send SMS
router.post('/sms', sms.sendSMS);

// check MD Media SMS Token
router.post('/sms/token', sms.checkToken);

// check MD Media OTP Token
router.post('/otp/token', otp.checkToken);

//Dashboard-Account
router.get('/account/list', account.getAllAccounts);
router.post('/account/create', account.createAccount);
router.patch('/account/edit', account.editAccount);
router.patch('/account/activate', account.activateAccount);
router.patch('/account/delete', account.deleteAccount);

//Dashboard-Account Roles
router.get('/account/roleslist', account.getRoles);
router.get('/account/role', account.accountRole);

//Dashboard-Clients
router.get('/client/list', client.getAllClients);
router.post('/client/add', client.addClient);
router.patch('/client/edit', client.editClient);
router.patch('/client/activate', client.activateClient);
router.patch('/client/delete', client.deleteClient);

// Dashboard- Monthly Token Reset Amount
router.get('/reset/list', tokenReset.getList);
router.post('/reset/add', tokenReset.add);
router.patch('/reset/edit', tokenReset.edit);

//Dashboard-sms
router.get('/sms/getreports', smsReport.getSmsReport);
router.get('/sms/reportcount', smsReport.reportCount);
router.get('/sms/gettokenlist', smsToken.getAllClientSmsToken);
router.get('/sms/getclienttoken', smsToken.getClientSmsToken);
router.post('/sms/topupclienttoken', smsToken.topUpClientSmsToken);

//Dashboard-otp
router.get('/otp/getreports', otpReport.getOtpReport);
router.get('/otp/reportcount', otpReport.reportCount);
router.get('/otp/gettokenlist', otpToken.getAllClientOtpToken);
router.get('/otp/getclienttoken', otpToken.getClientOtpToken);
router.post('/otp/topupclienttoken', otpToken.topUpClientOtpToken);

// Download OTP Reports
router.get('/otp/downloadotpreport', otpReport.downloadOtpReport);

// Download SMS Reports
router.get('/sms/downloadreportcount', smsReport.downloadReportCount);

// router.post('/report/save', report.saveReport);
// router.patch('/report/update', report.updateReport);
// router.get('/report', report.getReport);


module.exports = router;
