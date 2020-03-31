const request = require('request-promise');
const db = require('../../config/db');
var auth = require('../shared/auth');
const jwt = require('jsonwebtoken');

let checkUser = function(token1,token2) {
  return new Promise(function(resolve, reject) {
      const checkToken = auth.verifyToken(token1,token2);
      //console.log(checkToken)
      if (checkToken.code == 1) {
          resolve(checkToken.user.data);
      }else{
          resolve(0);
      }
  });
}


function sendSMS(req,res){

  const token1 = req.header('authorization');
  const token2 = req.cookies['token'];

  checkUser(token1,token2).then(function(result){
      if(result == 0){
          res.status(400)
          .json({
              status: 'error',
              message: 'Not Authorized, Please RE-LOGIN'
          });
      }else{

        db.dbs.one('select * from sms.clients where id = $1', [result.client_id])
        .then(function (data) {

          var msg_id = req.body.msg_id;

          db.dbs.one('select * from sms.messages where id = $1', [msg_id])
          .then(function (msg) {

            let user64 = auth.smsUser();
          if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
            var sender = 'MD Media';
          }else if(global.gConfig.config_id == 'production'){
            var sender = data.sender;
          }
          
            var formData = {
                sender : sender,
                message: msg.text,
                msisdn: req.body.msisdn,

            };

            request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
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

          });
          
        });
      }
    
      
    });

}


module.exports = {
  sendSMS:sendSMS
}