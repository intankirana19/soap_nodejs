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

// check MD Media Reguler Token
function getSmsToken(req,res,next){

}

function getAllClientSmsToken(req,res,next){
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
            db.dbs.any('SELECT t.id,amount,t.client_id,c.sender as client,t.create_at,t.update_at FROM sms.tokens t left join sms.clients c on t.client_id = c.id order by update_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
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
                    db.dbs.any('SELECT COUNT(*) FROM sms.tokens t left join sms.clients c on t.client_id = c.id')
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

function getClientSmsToken(req,res,next){
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
            const decode = auth.verifyToken(token1,token2);
            var clientId = decode.user.data.client_id;

            db.dbs.one('SELECT t.id,amount,t.client_id,c.sender as client,t.create_at,t.update_at FROM sms.tokens t left join sms.clients c on t.client_id = c.id WHERE c.id = ' + clientId)
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan sisa token OTP.'
                });
            })
            .catch(function (err) {
                return next(err);
            });

        }
    });
}


function addClientSmsToken(req,res,next){
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
            const decode = auth.verifyToken(token1,token2);
            var clientId = decode.user.data.client_id;

            db.dbs.one('SELECT amount FROM sms.tokens t left join sms.clients c on t.client_id = c.id WHERE c.id = ' + clientId)
            .then(function (dataToken) {
                var tokenQty = new Number(dataToken.amount);
                var amount = new Number(req.body.amount);
                var totalAmount = tokenQty + amount;
                db.dbs.none('UPDATE sms.tokens SET amount = $1 where client_id = $2', [totalAmount,clientId])
                .then(function (data) {
    
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Berhasil menambahkan token.'
                    });
                })
                .catch(function (err) {
                    return next(err);
                });
            })
            .catch(function (err) {
                return next(err);
            });

        }
    });
}

function otpTopupRequest(req,res,next){

}

function resetSmsToken(req,res,next){

}


module.exports={
    getAllClientSmsToken:getAllClientSmsToken,
    getClientSmsToken:getClientSmsToken,
    addClientSmsToken:addClientSmsToken
}