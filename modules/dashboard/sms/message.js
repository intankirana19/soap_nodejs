"use strict";

const db = require('../../../config/db');
var auth = require('../../shared/auth');


let checkUser = function(token1,token2) {
    return new Promise(function(resolve, reject) {
        const checkToken = auth.verifyToken(token1,token2);
        console.log(checkToken)
        if (checkToken.code == 1) {
            resolve(checkToken.user.data);
        }else{
            resolve(0);
        }
    });
}

function createSms(req,res,next){
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
            const d = new Date();
            var r = ((1 + (Math.floor(Math.random() * 2))) * 1000 + (Math.floor(Math.random() * 1000))).toString();
            var date = ("0" + d.getDate()).slice(-2).toString();
            var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
            var year = ("0" + d.getYear()).slice(-2).toString();
            var yymmdd = year + month + date;
            var msguid = yymmdd + r;

            const text = req.body.text;

            var clientId = result.client_id;

            const q1 = 'INSERT INTO sms.messages (msguid, text, client_id) VALUES ($1, $2, $3)';

            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [msguid, text, clientId]);

                const c = await t.one(q2, [result.client_id])
                const log = "Create Broadcast Message" + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Pesan Broadcast berhasil dibuat.'
                });
            })
            .catch(error => {
                return next(error);
            });
        
            // db.dbs.none(q1, [msguid, text, clientId])
            // .then(function (data) {
    
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Pesan Broadcast berhasil dibuat.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
        }
    });
}






module.exports={
    createSms:createSms
}