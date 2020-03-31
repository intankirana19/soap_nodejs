"use strict";

var crypto = require("crypto");
const db = require('../../config/db');
var auth = require('./auth');

    const keys = new Buffer.from('MitraBizKey17088');
    const ivs = new Buffer('MitraBizInitssss');

    function getAlgorithm() {

        var key = Buffer.from(keys, 'base64');
        switch (key.length) {
            case 16:
                return 'aes-128-cbc';
            case 32:
                return 'aes-256-cbc';   
        }   
        throw new Error('Invalid key length: ' + key.length);
    }

    function encrypt(plainText) {

        var key = Buffer.from(keys, 'base64');
        var iv = Buffer.from(ivs, 'base64');
    
        var cipher = crypto.createCipheriv(getAlgorithm(keys), key, iv);
        let cip = cipher.update(plainText, 'utf8', 'base64')
        cip += cipher.final('base64');
        return cip;
    };

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

function getAllAccounts(req,res,next){
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
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            db.dbs.any('SELECT * FROM sms.accounts WHERE is_delete = false LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
            .then(function (data) {
                if (data.length == 0) { 
                    res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Mohon maaf tidak ada data account',
                        itemperpage: itemperpage,
                        pages: 0
                    });
                } else {
                    db.dbs.any('SELECT COUNT(*) FROM sms.accounts WHERE is_delete = false', [page,itemperpage])
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
                                message: 'Berhasil menampilkan daftar akun',
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

function createAccount(req,res,next){
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
            const user = req.body.username;
            var pass = encrypt(req.body.password);
            const position = req.body.position;
            const role = req.body.role;
            const client = req.body.client;
            const email = req.body.email;

            const status = false;

            const query = 'INSERT INTO sms.accounts (username, password, job_position, role_id, client_id, email, is_active, is_delete) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)'
        
            db.dbs.none(query, [user, pass, position, role, client, email, status])
            .then(function (data) {
    
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Akun berhasil dibuat.'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function editAccount(req,res,next){
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
            const id = req.body.id;
            const user = req.body.username;
            const position = req.body.position;
            const role = req.body.role;
            const client = req.body.client;
            const email = req.body.email;
            const query = 'UPDATE sms.accounts SET username = $1, job_position = $2, role_id = $3, client_id = $4, email = $5 WHERE id = $6'
        
            db.dbs.none(query, [user, position, role, client, email, id])
            .then(function (data) {
    
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Data akun berhasil diubah.'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function activateAccount(req,res,next){
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
            const id = req.body.id;
            const isActive = req.body.isActive;
            const query = 'UPDATE sms.accounts SET is_active = $2 WHERE id = $1'
        
            db.dbs.none(query, [id, isActive])
            .then(function (data) {

                if(isActive == 'true') {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Akun berhasil diaktifkan.'
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Akun berhasil dinon-aktifkan.'
                    });
                }
    
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function deleteAccount(req,res,next){
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
            const id = req.body.id;
            const query = 'UPDATE sms.accounts SET is_delete = true WHERE id = $1'
        
            db.dbs.none(query, [id])
            .then(function (data) {
    
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Akun berhasil dihapus.'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function getRoles(req,res,next){
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
            db.dbs.any('SELECT * FROM sms.roles')
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan daftar role'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function accountRole(req,res,next){
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
            var roleId = req.body.role_id;

            db.dbs.one('SELECT * FROM sms.roles WHERE id = $1', [roleId])
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan role'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}


module.exports = {
    getAllAccounts:getAllAccounts,
    createAccount:createAccount,
    editAccount:editAccount,
    activateAccount:activateAccount,
    deleteAccount:deleteAccount,
    getRoles:getRoles,
    accountRole:accountRole
}
