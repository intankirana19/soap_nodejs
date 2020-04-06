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


function getAllClientOtpToken(req,res,next){
    var page = req.query.page -1;
    var itemperpage = req.query.itemperpage;

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
            db.dbs.any('SELECT t.id,amount,t.cltuid,c.sender as client,t.create_at,t.update_at FROM otp.tokens t left join sms.clients c on t.cltuid = c.cltuid order by update_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Mohon maaf data token tidak ada.',
                        itemperpage: itemperpage,
                        pages: 0
                    });
                } else {
                    db.dbs.any('SELECT COUNT(*) FROM otp.tokens t left join sms.clients c on t.cltuid = c.cltuid')
                    .then(function (dataQty) {
                        let count = dataQty[0].count;
                        var pageQty = (count / itemperpage).toFixed(0);
                        if(pageQty == 0){
                            pageQty = 1
                        }
            
                        res.status(200)
                            .json({
                                status: 'success',
                                data: data,
                                message: 'Berhasil menampilkan token OTP Clients.',
                                itemperpage: itemperpage,
                                pages: pageQty
                            });
                    })
                    .catch(function (err) {
                        return next(err);
                    });
                }
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function getClientOtpToken(req,res,next){
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
            var clientId = result.client_id;

            db.dbs.one('SELECT t.id,amount,t.cltuid,c.sender as client,t.create_at,t.update_at FROM otp.tokens t left join sms.clients c on t.cltuid = c.cltuid WHERE c.id = ' + clientId)
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan token OTP'
                });
            })
            .catch(function (err) {
                return next(err);
            });

        }
    });
}

function topUpClientOtpToken(req,res,next){
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

            const q1 = 'INSERT INTO otp.topups (uid, amount, status, cltuid, topup_by) VALUES ($1, $2, $3, $4, $5)';
            const q2 = 'SELECT * FROM otp.tokens t left join sms.clients c on t.cltuid = c.cltuid WHERE c.cltuid = $1';
            const q3 = 'UPDATE otp.tokens SET amount = $1 where cltuid = $2';

            const q4 = 'SELECT sender FROM sms.clients WHERE cltuid = $1';
            const q5 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {

                var d = new Date();
                var r = ((1 + (Math.floor(Math.random() * 2))) * 10000 + (Math.floor(Math.random() * 10000))).toString();
                var date = ("0" + d.getDate()).slice(-2).toString();
                var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                var mmdd = month + date;
                var uid = "49" + mmdd + r;
    
                var amount = new Number(req.body.amount);
    
                const status = req.body.status;
                const client = req.body.client;
                const by = result.username;

                const token = await t.one(q2, [client]);

                var tokenQty = new Number(token.amount);
                var amt = new Number (amount)
                var totalAmount = tokenQty + amt;

                await t.none(q3, [totalAmount,client]);
                
                await t.none(q1, [uid, amount, status, client, by]);
    

                const c = await t.one(q4, [client]);
                const log = "Top Up Token OTP" + " " + c.sender + " - " + result.username;

                await t.none(q5, [log, result.id]);
               
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Top Up Token OTP Berhasil.' 
                });
            })
            .catch(error => {
                return next(error);
            });

            // db.dbs.none(query, [uid, amount, status, client, by])
            // .then(function (data) {
    
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Top Up Token OTP Berhasil.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
            
        }
    });
}

// function addClientOtpToken(req,res,next){
//     const token1 = req.header('authorization');
//     const token2 = req.cookies['token'];
  
//     checkUser(token1,token2).then(function(result){
//         if(result == 0){
//             res.status(400)
//             .json({
//                 status: 'error',
//                 message: 'Not Authorized, Please RE-LOGIN'
//             });
//         }else{
//             var clientId = result.client_id;

//             db.dbs.one('SELECT amount,t.cltuid FROM otp.tokens t left join sms.clients c on t.cltuid = c.cltuid WHERE c.id = ' + clientId)
//             .then(function (dataClient) {
//                 var tokenQty = new Number(dataClient.amount);
//                 var amount = new Number(req.body.amount);
//                 var totalAmount = tokenQty + amount;
//                 const client = dataClient.cltuid;

//                 db.dbs.none('UPDATE otp.tokens SET amount = $1 where cltuid = $2', [totalAmount,client])
//                 .then(function (data) {
    
//                     res.status(200)
//                     .json({
//                         status: 'success',
//                         message: 'Berhasil menambahkan token.' 
//                     });
//                 })
//                 .catch(function (err) {
//                     return next(err);
//                 });
//             })
//             .catch(function (err) {
//                 return next(err);
//             });

//         }
//     });
// }

function getTopUpHistory(req,res,next){
    
}


function otpTopupRequest(req,res,next){

}

function resetOtpToken(req,res,next){

}



module.exports={
    getAllClientOtpToken:getAllClientOtpToken,
    getClientOtpToken:getClientOtpToken,
    otpTopupRequest:otpTopupRequest,
    topUpClientOtpToken:topUpClientOtpToken,
    getTopUpHistory:getTopUpHistory,
    resetOtpToken:resetOtpToken
}