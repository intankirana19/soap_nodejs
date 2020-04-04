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

        // const q1 = 'select * from sms.clients where id = $1';
        // const q2 = 'select * from sms.messages where id = $1';
        // const q3 = 'insert into sms.dispatches (message_id) values ($1) RETURNING id';
        // const q4 = 'insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)';

        // const q5 = 'SELECT sender FROM sms.clients WHERE id = $1';

        // const q6 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

        // db.dbs.tx(async t1 => {
        //   const client = await t1.one(q1, [result.client_id]);

        //   var msg_id = req.body.msg_id;
        //   const msg = await t1.one(q2, [msg_id]);

        //   let user64 = auth.smsUser();
        //   if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
        //     var sender = 'MD Media';
        //   }else if(global.gConfig.config_id == 'production'){
        //     var sender = client.sender;
        //   }
          
        //     var formData = {
        //         sender : sender,
        //         message: msg.text,
        //         msisdn: req.body.msisdn,

        //     };

        //     await request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
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

        //         // const disid = await t.none(q3, [msg_id], a => a.id);
        //         // return {userId, eventId};

        //         t1.tx(async t2 => {
        //           const disId = await t2.none(q3, [msg_id], a => a.id);
        //           return {disId};
        //         })
        //         .then(data => {
        //           const d = new Date();
        //           var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
        //           var date = ("0" + d.getDate()).slice(-2).toString();
        //           var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
        //           var ddmm = date + month;
        //           var rptuid = ddmm + r;
  
        //           const msisdn = req.body.msisdn;
  
        //           const resp = JSON.parse(body);
        //           var msg_id = resp.msgid;
        //           const status = resp.status;
        //           const message = resp.message;
  
        //           const dispatch_id = data.disId;
                  
        //           t2.tx(async t3 => { 
        //             await t3.none(q4, [rptuid, msg_id, msisdn, status, message, dispatch_id]);

        //             const c = await t.one(q5, [result.client_id]);
        //             const log = "Send Message" + " - " + c.sender;
        //             await t3.none(q6, [log, result.id]);
        //           });

        //         })
        //         .catch(error => {
        //           console.log('ERROR:', error); // print error;
        //         });
                
        //       }
        //     });


        // })
        // .then(() => {
    
        // })
        // .catch(error => {
        //     return next(error);
        // });
      }
    
      
    });

}


module.exports = {
  sendSMS:sendSMS
}