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

//edit SMS
router.patch('/sms/edit', dsms.editSms);

// SMS List
router.get('/sms/list', dsms.getMessageList);

// sms by id
router.get('/sms/byid/:id', dsms.getMessageByID);
//send SMS
router.post('/sms', sms.sendSMS);

// // check MD Media SMS Token
router.post('/sms/token', sms.checkToken);

// check MD Media OTP Token
router.post('/otp/token', otp.checkToken);

// //Dashboard-Account
router.get('/account/list', account.getAllAccounts);
router.get('/account/:accid', account.getAccount);
router.post('/account/create', account.createAccount);
router.patch('/account/edit', account.editAccount);
router.patch('/account/activate', account.activateAccount);
router.patch('/account/delete', account.deleteAccount);
router.patch('/account/changepassword', account.changePassword);

// //Dashboard-Account Roles
router.get('/account/roleslist', account.getRoles);
router.get('/account/clientroleslist', account.clientRoleList);
router.get('/account/role/:role_id', account.accountRole);

//Dashboard-Logs
router.get('/account/log', account.getLogs);

//Dashboard-Clients
router.get('/client/list', client.getAllClients);
router.get('/client/otplist', client.otpClientList);
router.get('/client/:id', client.getClient);
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
router.get('/sms/dailyusage', smsReport.getSmsDailyTokenUsage);
router.get('/sms/totalusage', smsReport.getSmsTokenTotalUsage);
router.get('/sms/topuphistory', smsToken.getTopUpHistory);
//Dashboard-otp
router.get('/otp/getreports', otpReport.getOtpReport);
router.get('/otp/reportcount', otpReport.reportCount);
router.get('/otp/gettokenlist', otpToken.getAllClientOtpToken);
router.get('/otp/getclienttoken', otpToken.getClientOtpToken);
router.post('/otp/topupclienttoken', otpToken.topUpClientOtpToken);


router.get('/user/list', account.getUser);
router.get('/otp/dailyusage', otpReport.getOtpDailyTokenUsage);
router.get('/otp/totalusage', otpReport.getOtpTokenTotalUsage);
router.get('/otp/topuphistory', otpToken.getTopUpHistory);

// Download OTP Reports
router.get('/otp/downloadotpreport', otpReport.downloadOtpReport);
router.get('/otp/downloaddailyusage', otpReport.downloadOtpDailyTokenUsage);
router.get('/otp/downloadtotalusage', otpReport.downloadOtpTokenTotalUsage);
router.get('/otp/downloadreportcount', otpReport.downloadReportCount);
router.get('/otp/downloadclienttoken', otpToken.downloadAllClientOtpToken);
router.get('/otp/downloadtopuphistory', otpToken.downloadTopUpHistory);


// Download SMS Reports
router.get('/sms/downloadsmsreport', smsReport.downloadReport);
router.get('/sms/downloadreportcount', smsReport.downloadReportCount);
router.get('/sms/downloadclienttoken', smsToken.downloadAllClientSmsToken);
router.get('/sms/downloaddailyusage', smsReport.downloadSmsDailyTokenUsage);
router.get('/sms/downloadtotalusage', smsReport.downloadSmsTokenTotalUsage);
router.get('/sms/downloadtopuphistory', smsToken.downloadTopUpHistory);

// router.post('/report/save', report.saveReport);
// router.patch('/report/update', report.updateReport);
// router.get('/report', report.getReport);


module.exports = router;
