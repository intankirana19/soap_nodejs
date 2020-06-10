"use strict";

const db = require('../../config/db');
var auth = require('../shared/auth');


let checkUser = function(token1) {
    return new Promise(function(resolve, reject) {
        const checkToken = auth.verifyToken(token1);
        console.log(checkToken)
        if (checkToken.code == 1) {
            resolve(checkToken.user.data);
        }else{
            resolve(0);
        }
    });
}

function getList(req,res,next){
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
            db.dbs.any('SELECT * FROM sms.token_reset_amount ORDER BY update_at desc')
            .then(function (data) {
                if (data.length == 0) { 
                    res.status(200)
                    .json({
                        status: 2,
                        data: data,
                        message: 'Data tidak ada'
                    });
                } else {
                        res.status(200)
                            .json({
                                status: 1,
                                data: data,
                                message: 'success'
                            });
                }
            })
            .catch(function (err) {
                return next(err);
            });
        }

    });
}

function add(req,res,next){
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
            const service = req.body.service;
            var token = req.body.token;

            const q1 = 'INSERT INTO sms.token_reset_amount (service, token, update_by) VALUES ($1, $2, $3)';
            
            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [service,token,result.username]);

                const c = await t.one(q2, [result.client_id])
                const log = "Add token amount" + " - " + result.username;
                await t.none(q3, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success'
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

function edit(req,res,next){
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
            const id = req.body.id;
            const service = req.body.service;
            const token = req.body.token;

            const q1 = 'UPDATE sms.token_reset_amount SET service = $1, token = $2, update_by = $3 WHERE id = $4';
            
            const q2 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [service,token,result.username,id]);

                const log = "Edit Token Reset Amount (" + service + ") " + " - " + result.username;
                await t.none(q2, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Data reset token berhasil diubah.'
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}



module.exports = {
    add:add,
    edit:edit,
    getList:getList
}