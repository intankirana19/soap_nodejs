var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var indexRouter = require('./routes/index');
var cors = require('cors');
const db = require('./config/db');
var schedule = require('node-schedule');
var auth = require('./modules/shared/auth');
const request = require('request-promise');

// process.env.NODE_ENV = 'production';

//const config = require('./config/configuration');

var app = express();
// app.use(cors());
const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
// app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended: false }));
app.use(cookieParser());
//app.use(express.bodyParser);
app.use('/', indexRouter);

app.get('/config', (req, res) => {
  res.json(global.gConfig);
});

app.use(function(req, res, next) {
  next(createError(404));
});


// app.use(function(err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   res.status(err.status || 500);
//   res.render('error');
// });

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
// view engine setup

// BROADCAST SCHEDULER

// var tasking = [];
// //get send_date from sms.schedules
// function getSchedule(){
//   console.log('get schedule')
//   var today = new Date();
//   var bulan = today.getUTCMonth()+1;
//   if(bulan < 10){
//     bulan = '0'+bulan;
//   }
//   var hari = today.getDate();
//   if(hari < 10){
//     hari = '0'+hari;
//   }
//   var jam = today.getHours();
//   if(jam < 10){
//     jam = '0'+jam;
//   }
//   var menit = today.getMinutes();
//   if(menit < 10){
//     menit = '0'+menit;
//   }

//   var now = today.getFullYear()+'-'+bulan+'-'+hari;
//   var tomorrow = today.getFullYear()+'-'+bulan+'-'+(hari+1);
//   var time = jam + ":" + menit + ":" + today.getSeconds();
//   var dateTime = now+' '+time;
//   var dateTime2 = tomorrow+' '+time;
//   console.log('today:', dateTime, 'tomorrow:',dateTime2)
//   db.dbs.any('select * from sms.schedules where send_date between $1 and $2 and status = $3', [dateTime, dateTime2, 1])
//     .then(function (data) {
      
//       if(data.length == 0){
//         setTimeout(function(){getSchedule(); }, 3000);
//       }else{
//         tasking = data;
//         getCloses();
//       }
//     })
//     .catch(function (err) {
//       return err;
//     });
// }

// function getCloses(){
//   var toSend = [];
//   for (let i = 0; i < tasking.length; i++) {
//     var send_date = tasking[i].send_date
//     var sd = send_date.split(" ");
//     var td = sd[1].replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'');
//     toSend.push(td);
//   }
//   //get waktu terdekat
//   var min = Math.min.apply(null, toSend)
//   var index = toSend.findIndex(x => x == min);
//   console.log(toSend)
//   //send waktu terdekat untuk dijalankan
//   theJobs(tasking[index])
// }
// var success = [];
// var failed = [];
// function theJobs(dataToSend){
// //console.log(dataToSend)
// var date = dataToSend.send_date;
// var res = date.split("-", 3);
// var year = res[0];
// var month = res[1];
// var dtemp = res[2].split(" ");
// var day = dtemp[0];
// var times = dtemp[1].split(":");
// var hour = parseInt(times[0]);
// var minute = parseInt(times[1]);
// var second = times[2]
// //set rule untuk jam dan menit (karena sudah dilimit hanya untuk hari ini)
// var rule = new schedule.RecurrenceRule();
// rule.hour = hour;
// rule.minute = minute;
// console.log(rule)

// var j = schedule.scheduleJob(rule, function(){
//   console.log('Broadcast scheduler is running!');
//   //ganti request ke URL untuk send multiple
//   //data untuk dikirim ada di dataToSend
//   //request.post({url: sendmultiple,headers: {'Authorization': token}, form: dataTosend}, function optionalCallback(err, httpResponse, body) {
//   //ini request sample :
    
//     db.dbs.one('insert into sms.dispatches (message_id) values ($1) RETURNING id', [dataToSend.id], a => a.id)
//     .then(function (dispatch) {
//       const msisdnString = dataToSend.msisdn;
      
//       const msisdn = msisdnString.split(',');
//       console.log(msisdn.length)
      
//       for (i = 0; i < msisdn.length; i++) {
//         //console.log('msisdn', msisdn.length);
//         const singleMsisdn = msisdn[i];
//         db.dbs.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[dataToSend.client_id])
//         .then(function (token) {
//           const tkn = parseInt(token.amount);
//           if (tkn <= 0) {
//             const d = new Date();
//             var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
//             var date = ("0" + d.getDate()).slice(-2).toString();
//             var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
//             var ddmm = date + month;
//             var rptuid = ddmm + r;

//             db.dbs.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, dataToSend.id, singleMsisdn, "FAILED", "NOT ENOUGH TOKEN", dispatch]);
//           } else {
//             db.dbs.one('select sender from sms.clients where id = $1', [dataToSend.client_id])
//             .then(function (client) {
//               let user64 = auth.smsUser();
//               if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
//                   var sender = 'MD Media';
//               } else if(global.gConfig.config_id == 'production'){
//                   var sender = client.sender;
//               }

//               var formData = {
//                 sender : sender,
//                 message: dataToSend.message,
//                 msisdn: singleMsisdn,
//               };

//             // request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
//             request.post({url: 'http://localhost:5000/sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
//                     if (err) {
//                       console.log(err)
//                     } else {
//                         const resp = JSON.parse(body);
//                         // console.log(resp);
//                         if (resp.code === 1) {
//                             success.push(i);
//                             const d = new Date();
//                             var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
//                             var date = ("0" + d.getDate()).slice(-2).toString();
//                             var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
//                             var ddmm = date + month;
//                             var rptuid = ddmm + r;
//                             // console.log('msgid', resp.msgid);
//                             // console.log('nomor', singleMsisdn);
//                             db.dbs.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, singleMsisdn, resp.status, resp.message, dispatch]);
//                             // var tokenRemain = tkn - 1;
//                             // console.log(tokenRemain);
//                             // db.dbs.none('UPDATE sms.tokens SET amount = $1 WHERE client_id = $2',[tokenRemain, dataToSend.client_id]);
//                           } else {
//                             failed.push(i);
//                             const d = new Date();
//                             var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
//                             var date = ("0" + d.getDate()).slice(-2).toString();
//                             var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
//                             var ddmm = date + month;
//                             var rptuid = ddmm + r;

//                             db.dbs.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, singleMsisdn, resp.status, resp.message, dispatch]);
//                         }
//                     }
//                 });
//             });

//           }
//         });
//       }
//     })
//     .then(() => {
//       setTimeout(function(){
//         console.log('success', success.length); 
//         console.log('failed', failed.length); 
//         after(dataToSend.id,dataToSend.client_id,success.length);
//       }, 4000);
      
//       setTimeout(function(){getSchedule(); }, 5000);
//     });

//   // request.get({url: 'http://localhost:3000/ping'}, function optionalCallback(err, httpResponse, body) {
//   //   if (err) {
//   //     console.log(err)
//   //   } else{
//   //     console.log(body)
//   //     //set timeout sebelum running ke next schedule time of the day
//   //     setTimeout(function(){getSchedule(); }, 3000);

//   //   }

//   // });
// });

// }

// function after (schedule,client_id,s) {
//   console.log('after')
//   db.dbs.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[client_id])
//   .then(function (token) {
//       const tkn = parseInt(token.amount);
//       var tokenRemain = tkn - s;

//       db.dbs.none('UPDATE sms.tokens SET amount = $1 WHERE client_id = $2',[tokenRemain, client_id]);
//       db.dbs.none('UPDATE sms.schedules SET status = $1 WHERE id = $2', [2, schedule]);
//   });
// }

// getSchedule();




module.exports = app;
