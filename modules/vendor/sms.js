const request = require('request-promise');
const db = require('../../config/db');
var auth = require('../shared/auth');
const jwt = require('jsonwebtoken');

let checkUser = function(token1) {
  return new Promise(function(resolve, reject) {
      const checkToken = auth.verifyToken(token1);
      //console.log(checkToken)
      if (checkToken.code == 1) {
          resolve(checkToken.user.data);
      }else{
          resolve(0);
      }
  });
}


function sendSMS(req,res,next){

  const token1 = req.header('authorization');
  const token2 = req.cookies['token'];

  checkUser(token1).then(function(result){
      if(result == 0){
          res.status(400)
          .json({
              status: 'error',
              message: 'Not Authorized, Please RE-LOGIN'
          });
      }else{
        db.dbs.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[result.client_id])
        .then(function (token) {
        const tkn = token.amount;

        if (tkn === 0) {
          res.status(200)
          .json({
              status: 3,
              message: 'Token habis. Silahkan Top Up.'
          });
        } else {
          var msg_id = req.body.msg_id;
          const msisdn = req.body.msisdn;
  
          db.dbs.one('select sender from sms.clients where id = $1', [result.client_id])
          .then(function (client) {
  
            db.dbs.one('select text from sms.messages where id = $1', [msg_id])
            .then(function (message) {
  
              let user64 = auth.smsUser();
              if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
                var sender = 'MD Media';
              }else if(global.gConfig.config_id == 'production'){
                var sender = client.sender;
              }
  
              var formData = {
                  sender : sender,
                  message: message.text,
                  msisdn: msisdn,
              };
  
              request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
                // request.post({url: 'http://localhost:5000/sms',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
                if (err) {
                  res.status(400)
                        .json({
                            status: 'error',
                            message: err
                        });
                }else{
                  const resp = JSON.parse(body);
                  console.log(resp);
  
                  if (resp.code === 1) {
                    db.dbs.tx(async t1 => {
                      const dispatch = await t1.one('insert into sms.dispatches (message_id) values ($1) RETURNING id', [msg_id], a => a.id);
  
                      const d = new Date();
                      var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
                      var date = ("0" + d.getDate()).slice(-2).toString();
                      var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                      var ddmm = date + month;
                      var rptuid = ddmm + r;
  
                      await t1.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, msisdn, resp.status, resp.message, dispatch]);
  
                      var tokenRemain = tkn - 1;
                      await t1.none('UPDATE sms.tokens SET amount = $1 WHERE client_id = $2',[tokenRemain, result.client_id]);
  
                      const log = "Send Single Message(" + resp.status + ") - " + client.sender + " - " + result.username;
                      await t1.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                    })
                    .then(() => {
                      res.status(200)
                      .json({
                          status: 1,
                          message: 'Pesan berhasil terkirim.'
                      });
                    })
                    .catch(error => {
                        return next(error);
                    });
                  } else {
                    db.dbs.tx(async t1 => {
                      const dispatch = await t1.one('insert into sms.dispatches (message_id) values ($1) RETURNING id', [msg_id], a => a.id);
  
                      const d = new Date();
                      var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
                      var date = ("0" + d.getDate()).slice(-2).toString();
                      var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                      var ddmm = date + month;
                      var rptuid = ddmm + r;
  
                      await t1.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, msisdn, resp.status, resp.message, dispatch]);
                      const log = "Send Message(" + resp.status + ") - " + client.sender + " - " + result.username;
                      await t1.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                    })
                    .then(() => {
                      res.status(200)
                      .json({
                          status: 2,
                          message: 'Pesan gagal terkirim.'
                      });
                    })
                    .catch(error => {
                        return next(error);
                    });
                  }
                }
              });
            });
          });
  
  
          // db.dbs.one('select * from sms.clients where id = $1', [result.client_id])
          // .then(function (data) {
  
          //   var msg_id = req.body.msg_id;
  
          //   db.dbs.one('select * from sms.messages where id = $1', [msg_id])
          //   .then(function (msg) {
  
          //   let user64 = auth.smsUser();
          //   if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
          //     var sender = 'MD Media';
          //   }else if(global.gConfig.config_id == 'production'){
          //     var sender = data.sender;
          //   }
  
          //     var formData = {
          //         sender : sender,
          //         message: msg.text,
          //         msisdn: req.body.msisdn,
  
          //     };
  
          //     request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
          //       const resp = JSON.parse(body);
          //       console.log(resp.code);
          //       if (err) {
          //         res.status(400)
          //               .json({
          //                   status: 'error',
          //                   message: err
          //               });
          //       }else{
          //         res.status(200)
          //         .json({
          //             status: 'success',
          //             message: JSON.parse(body)
          //         });
          //       }
          //     });
  
          //   });
  
          // });
        }
        });


      }

    });

}

function scheduleSMS(req,res,next){

  const token1 = req.header('authorization');
  const token2 = req.cookies['token'];

  checkUser(token1).then(function(result){
      if(result == 0){
          res.status(400)
          .json({
              status: 'error',
              message: 'Not Authorized, Please RE-LOGIN'
          });
      }else{
        db.dbs.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[result.client_id])
        .then(function (token) {
        const tkn = token.amount;

        if (tkn === 0) {
          res.status(200)
          .json({
              status: 'failed',
              message: 'Token habis. Silahkan Top Up.'
          });
        } else {
          var msg_id = req.body.msg_id;
          const msisdn = req.body.msisdn;
          const send_date = req.body.send_date;
  
          db.dbs.one('select sender from sms.clients where id = $1', [result.client_id])
          .then(function (client) {
  
            db.dbs.one('select text from sms.messages where id = $1', [msg_id])
            .then(function (message) {
  
              db.dbs.tx(async t => {
                var d = new Date();
                var r = ((1 + (Math.floor(Math.random() * 2))) * 10000 + (Math.floor(Math.random() * 10000))).toString();
                var date = ("0" + d.getDate()).slice(-2).toString();
                var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                var mmdd = month + date;
                var schuid = "50" + mmdd + r;

                await t.none('insert into sms.schedules (schuid,message,msisdn,send_date,send_via,status,client_id) values ($1,$2,$3,$4,$5,$6,$7)', [schuid, message.text, msisdn, send_date, 1, 1, result.client_id]);

                const log = "Schedule Single Broadcast" + " - " + client.sender + " - " + result.username;
                await t.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
              })
              .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Pesan berhasil dijadwalkan.'
                });
              })
              .catch(error => {
                  return next(error);
              });
            });
          });
        }
        });


      }

    });
}


function checkToken(req,res,next){
  const token1 = req.header('authorization');
  const token2 = req.cookies['token'];

  console.log('token1', token1);
  console.log('token2');
  checkUser(token1).then(function(result){

      if(result == 0){
          res.status(401)
          .json({
              status: 'error',
              message: 'Not Authorized, Please RE-LOGIN'
          });
      }else{
        var param = {
          username : 'brainworxindo',
          password: '72EP82jA'

        };
        request.post({url: global.gConfig.api_token+'token.json',formData: param}, function optionalCallback(err, httpResponse, body) {
          if (err) {
            res.status(400)
                  .json({
                      status: 'error',
                      message: err
                  });
          }else{
            res.status(200)
            .json({
                status: 'success',
                message: JSON.parse(body)
            });
          }
        });
      }
    });
}


module.exports = {
  sendSMS:sendSMS,
  checkToken:checkToken,
  scheduleSMS:scheduleSMS
}