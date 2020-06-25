
const request = require('request-promise');
const db = require('../../config/db');
var auth = require('../shared/auth');

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


function sendOTP(req,res,next){

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
        db.dbs.one('SELECT amount FROM otp.tokens WHERE cltuid = $1',[result.cltuid])
        .then(function (token) {
        const tkn = token.amount;

        if (tkn === 0) {
          res.status(200)
          .json({
              status: 3,
              message: 'Token habis. Silahkan Top Up.'
          });
        } else {
          var text = req.body.text;
          const msisdn = req.body.msisdn;

          db.dbs.one('select sender from sms.clients where id = $1', [result.client_id])
          .then(function (client) {


              let user64 = auth.smsUser();
              if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
                var sender = 'MD Media';
              }else if(global.gConfig.config_id == 'production'){
                var sender = client.sender;
              }

              var formData = {
                  sender : sender,
                  message: text,
                  msisdn: msisdn,
              };
  
              request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
                if (err) {
                  res.status(400)
                        .json({
                            status: 'error',
                            message: err
                        });
                }else{
                  const resp = JSON.parse(body);
                  console.log(resp);
  
                  if (resp.code === '1') {
                    db.dbs.tx(async t1 => {

                      const d = new Date();
                      var r = ((1 + (Math.floor(Math.random() * 2))) * 1000 + (Math.floor(Math.random() * 1000))).toString();
                      var date = ("0" + d.getDate()).slice(-2).toString();
                      var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                      var year = ("0" + d.getYear()).slice(-2).toString();
                      var yymmdd = year + month + date;
                      var uid = yymmdd + r;
                      
                      const send_date = new Date();

                      const message = await t1.one('INSERT INTO otp.messages (uid, message, msisdn, sender, cltuid, send_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [uid, text, msisdn, result.sender_otp, result.cltuid, send_date], m => m.id);
  
                      await t1.none('insert into otp.reports (code, status, message, msgid, msg_id) values ($1, $2, $3, $4, $5)', [ 1, resp.status, resp.message, resp.msgid, message]);
  
                      var tokenRemain = tkn - 1;
                      await t1.none('UPDATE otp.tokens SET amount = $1 WHERE cltuid = $2',[tokenRemain, result.cltuid]);
                      const log = "Send OTP(" + resp.status + ") - " + client.sender;
                      await t1.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                    })
                    .then(() => {
                      res.status(200)
                      .json({
                          status: 1,
                          message: 'OTP berhasil terkirim.'
                      });
                    })
                    .catch(error => {
                        return next(error);
                    });
                  } else {
                    db.dbs.tx(async t1 => {
                      const d = new Date();
                      var r = ((1 + (Math.floor(Math.random() * 2))) * 1000 + (Math.floor(Math.random() * 1000))).toString();
                      var date = ("0" + d.getDate()).slice(-2).toString();
                      var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                      var year = ("0" + d.getYear()).slice(-2).toString();
                      var yymmdd = year + month + date;
                      var uid = yymmdd + r;

                      const message = await t1.one('INSERT INTO otp.messages (uid, message, msisdn, sender, cltuid) VALUES ($1, $2, $3, $4, $5) RETURNING id', [uid, text, msisdn, result.sender_otp, result.cltuid], m => m.id);
  
                      await t1.none('insert into otp.reports (code, status, message, msgid, msg_id) values ($1, $2, $3, $4, $5)', [ 0, resp.status, resp.message, resp.msgid, message]);
  
                      var tokenRemain = tkn - 1;
                      await t1.none('UPDATE otp.tokens SET amount = $1 WHERE cltuid = $2',[tokenRemain, result.cltuid]);
                      const log = "Send OTP(" + resp.status + ") - " + client.sender;
                      await t1.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                    })
                    .then(() => {
                      res.status(200)
                      .json({
                          status: 2,
                          message: 'OTP gagal terkirim.'
                      });
                    })
                    .catch(error => {
                        return next(error);
                    });
                  }
                }
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
  
    checkUser(token1).then(function(result){
        if(result == 0){
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
          var param = {
            username : 'brainworxpremium',
            password: 'V36x6p37'
  
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
    sendOTP:sendOTP,
    checkToken:checkToken
  }