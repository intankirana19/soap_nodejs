"use strict";

var crypto = require("crypto");
const db = require('../../config/db');
var auth = require('../shared/auth');

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
        console.log('result',result)
        if(result == 0){
            res.status(400)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;
            var total = 100;
            db.dbs.any('SELECT * FROM sms.accounts WHERE is_delete = false ')
            .then(function (data) {
                console.log('totalnya:',data.length)
                var total = data.length;
            
            db.dbs.any('SELECT * FROM sms.accounts AS a INNER JOIN sms.roles AS b ON a.role_id = b.id WHERE a.is_delete = false ORDER BY a.update_at desc LIMIT $2 OFFSET $1 * $2  ', [page,itemperpage])
            .then(function (data) {
                if (data.length == 0) { 
                    res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Mohon maaf tidak ada data account',
                        itemperpage: itemperpage,
                        pages: 1
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
                                total: total,
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

            const q1 = 'INSERT INTO sms.accounts (username, password, job_position, role_id, client_id, email, is_active, is_delete) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)';
            
            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [user, pass, position, role, client, email, status]);

                const c = await t.one(q2, [result.client_id])
                const log = "Add New Account" + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Akun berhasil dibuat.'
                });
            })
            .catch(error => {
                return next(error);
            });

            // db.dbs.none(q1, [user, pass, position, role, client, email, status])
            // .then(function (data) {
    
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Akun berhasil dibuat.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
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

            const q1 = 'UPDATE sms.accounts SET username = $1, job_position = $2, role_id = $3, client_id = $4, email = $5 WHERE id = $6';
            
            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [user, position, role, client, email, id]);

                const c = await t.one(q2, [result.client_id])
                const log = "Edit Account (" + id + ") " + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Data akun berhasil diubah.'
                });
            })
            .catch(error => {
                return next(error);
            });

            // db.dbs.none(q1, [user, position, role, client, email, id])
            // .then(function (data) {
    
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Data akun berhasil diubah.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
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
            
            const q1 = 'UPDATE sms.accounts SET is_active = $2 WHERE id = $1';

            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [id, isActive]);

                const c = await t.one(q2, [result.client_id]);

                if(isActive == 'true') {
                    const log = "Activate Account (" + id + ") " + " - " + c.sender + " - " + result.username;
                    await t.none(q3, [log, result.id]);
                } else {
                    const log = "Deactivate Account (" + id + ") " + " - " + c.sender + " - " + result.username;
                    await t.none(q3, [log, result.id]);
                }
            })
            .then(() => {
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
            .catch(error => {
                return next(error);
            });
        
            // db.dbs.none(q1, [id, isActive])
            // .then(function (data) {

            //     if(isActive == 'true') {
            //         res.status(200)
            //         .json({
            //             status: 'success',
            //             message: 'Akun berhasil diaktifkan.'
            //         });
            //     } else {
            //         res.status(200)
            //         .json({
            //             status: 'success',
            //             message: 'Akun berhasil dinon-aktifkan.'
            //         });
            //     }
    
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
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
            const q1 = 'UPDATE sms.accounts SET is_delete = true WHERE id = $1';

            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [id]);

                const c = await t.one(q2, [result.client_id]);
                
                const log = "Delete Account (" + id + ") " + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id]);
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Akun berhasil dihapus.'
                });
            })
            .catch(error => {
                return next(error);
            });
        
            // db.dbs.none(q1, [id])
            // .then(function (data) {
    
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Akun berhasil dihapus.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
        }
    });
}

function createRole(req,res,next){
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
            const name = req.body.name;
            const desc = req.body.desc;
            const type = req.body.type;

            const q1 = 'INSERT INTO sms.roles (name, desc, is_internal) VALUES ($1, $2, $3)';
            
            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [name,desc,type]);

                const log = "Add New Role" + " - " + result.username;
                await t.none(q3, [log, result.id]);
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Role berhasil dibuat.'
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

function editRole(req,res,next){
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
            const name = req.body.name;
            const desc = req.body.desc;
            const type = req.body.type;

            const q1 = 'UPDATE sms.roles SET name = $1, desc = $2, type = $3 WHERE id = $4';
            
            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [name,desc,type,id]);

                const c = await t.one(q2, [result.client_id])
                const log = "Edit Role (" + id + ") " + " - " + result.username;
                await t.none(q3, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Data role berhasil diubah.'
                });
            })
            .catch(error => {
                return next(error);
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


function getLogs(req,res,next){
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

            db.dbs.any('SELECT * FROM sms.logs ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan daftar log'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function getUser(req,res,next){
    db.dbs.any('SELECT * FROM sms.accounts')
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan daftar user'
                });
            })

}

module.exports = {
    getAllAccounts:getAllAccounts,
    createAccount:createAccount,
    editAccount:editAccount,
    activateAccount:activateAccount,
    deleteAccount:deleteAccount,
    createRole:createRole,
    editRole:editRole,
    getRoles:getRoles,
    accountRole:accountRole,
    getLogs:getLogs,
    getUser:getUser
}
