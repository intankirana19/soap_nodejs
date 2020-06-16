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


let checkUser = function(token1) {
    return new Promise(function(resolve, reject) {
        const checkToken = auth.verifyToken(token1);

        if (checkToken.code == 1) {
            resolve(checkToken.user.data);
        }else{
            resolve(0);
        }
    });
}

function getAllClients(req,res,next){
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
            var page = req.query.page;
            var itemperpage = req.query.itemperpage;
            db.dbs.any('SELECT * FROM sms.clients WHERE is_delete = false ')
            .then(function (data) {
                console.log('totalnya:',data.length)
                var total = data.length;
            
            db.dbs.any('SELECT a.cltuid, a.name AS company, a.phone, a.email, a.pic, a.sender, a.create_at, a.update_at, a.is_active, a.is_delete, b.name AS rolename, a.id FROM sms.clients AS a LEFT JOIN sms.roles AS b ON a.type = b.id WHERE a.is_delete = false  ORDER BY a.update_at desc', [page,itemperpage])
            .then(function (data) {
                if (data.length == 0) { 
                    res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Mohon maaf tidak ada data klien',
                        itemperpage: itemperpage,
                        pages: 0
                    });
                } else if (data.length > 10) {
                    db.dbs.any('SELECT a.cltuid, a.name AS company, a.phone, a.email, a.pic, a.sender, a.create_at, a.update_at, a.is_active, a.is_delete, b.name AS rolename, a.id FROM sms.clients AS a LEFT JOIN sms.roles AS b ON a.type = b.id WHERE a.is_delete = false ORDER BY a.update_at desc LIMIT $2 OFFSET (($1 - 1) * $2)', [page,itemperpage])
                    .then(function (data) {
                        db.dbs.any('SELECT COUNT(*) FROM sms.clients WHERE is_delete = false', [page,itemperpage])
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
                                    message: 'Berhasil menampilkan daftar klien',
                                    itemperpage: itemperpage,
                                    pages: pageQty
                                });
                        })
                        .catch(function (err) {
                            return next(err);
                        });

                    })
                    .catch(function (err) {
                        return next(err);
                    });
                
                } else {
                    db.dbs.any('SELECT COUNT(*) FROM sms.clients WHERE is_delete = false', [page,itemperpage])
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
                                message: 'Berhasil menampilkan daftar klien',
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
                console.log('error',err)
                return next(err);
            });
        })
        }

    });
}

function otpClientList(req,res,next){
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
            db.dbs.any('SELECT * FROM sms.clients WHERE is_delete = false ')
            .then(function (data) {
                console.log('totalnya:',data.length)
                var total = data.length;

            db.dbs.any('SELECT distinct o.sender AS otp_sender FROM sms.clients c LEFT JOIN otp.messages o ON c.cltuid = o.cltuid')
            .then(function (data) {
                if (data.length == 0) { 
                    res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'Mohon maaf tidak ada data klien'
                    });
                } else {

                        res.status(200)
                            .json({
                                status: 'success',
                                data: data,
                                message: 'Berhasil menampilkan daftar klien'
                            });
                }
            })
            .catch(function (err) {
                console.log('error',err)
                return next(err);
            });
        })
        }

    });
}

function getClient(req,res,next){
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
            var id = req.params.id;

            db.dbs.one('SELECT * FROM sms.clients WHERE id = $1', [id])
            .then(function (data) {
                res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: 'Berhasil menampilkan client'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function addClient(req,res,next){
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
            const type = req.body.type;

            const alias = req.body.alias;
            const name = req.body.name;
            const phone = req.body.phone;
            const email = req.body.email;
            const pic = req.body.pic;
            const sender = req.body.sender;
            const pass = encrypt(req.body.password);


            const status = false;

            const q1 = 'INSERT INTO sms.clients (cltuid,name,phone,email,pic,sender,password,is_active,is_delete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)';
            const q2 = 'SELECT id FROM sms.clients WHERE cltuid = $1';
            const q3 = 'INSERT INTO sms.tokens (amount, client_id, is_active) VALUES ($1, $2, $3)';
            const q4 = 'INSERT INTO otp.tokens (amount, cltuid, is_active) VALUES ($1, $2, $3)';

            const q5 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [alias,name,phone,email,pic,sender,pass,status]);
                const client = await t.one(q2, [alias]);
                if ( type == 1) {
                    await t.batch([
                        t.none(q3, [0, client.id, true]),
                        t.none(q4, [0, alias, true])
                    ]);

                    const log = "Add Regular & Premium Client" + " - " + result.username;
                    await t.none(q5, [log, result.id]);
                } else if ( type == 2){
                    await t.batch([
                        t.none(q3, [0, client.id, true]),
                        t.none(q4, [0, alias, false])
                    ]);

                    const log = "Add Regular Client" + " - " + result.username;
                    await t.none(q5, [log, result.id]);
                } else {
                    await t.batch([
                        t.none(q3, [0, client.id, false]),
                        t.none(q4, [0, alias, true])
                    ]);

                    const log = "Add Premium Client" + " - " + result.username;
                    await t.none(q5, [log, result.id]);
                }
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Berhasil menambahkan klien.'
                });
            })
            .catch(error => {
                return next(error);
            });
            // db.dbs.none(query, [alias,name,phone,email,pic,sender,pass,status]) 
            // .then(function (data) {
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Berhasil menambahkan klien.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
        }
    });
}

function editClient(req,res,next){
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
            const id = req.body.id;
            const alias = req.body.alias;
            const name = req.body.name;
            const phone = req.body.phone;
            const email = req.body.email;
            const pic = req.body.pic;
            const sender = req.body.sender;
            
            const q1 = 'UPDATE sms.clients SET cltuid = $2, name = $3, phone = $4, email = $5, pic = $6, sender = $7 WHERE id = $1';
            
            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [id,alias,name,phone,email,pic,sender]);

                const c = await t.one(q2, [result.client_id])
                const log = "Edit Client (" + id + ") " + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id])
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Data klien berhasil diubah.'
                });
            })
            .catch(error => {
                return next(error);
            });
        
            // db.dbs.none(q1, [id,alias,name,phone,email,pic,sender])
            // .then(function (data) {
    
            //     res.status(200)
            //     .json({
            //         status: 'success',
            //         message: 'Data klien berhasil diubah.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
        }
    });
}

function activateClient(req,res,next){
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
            const id = req.body.id;
            const isActive = req.body.isActive;
            const q1 = 'UPDATE sms.clients SET is_active = $2 WHERE id = $1';

            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [id, isActive]);

                const c = await t.one(q2, [result.client_id]);

                if(isActive == 'true') {
                    const log = "Activate Client (" + id + ") " + " - " + c.sender + " - " + result.username;
                    await t.none(q3, [log, result.id]);
                } else {
                    const log = "Deactivate Client (" + id + ") " + " - " + c.sender + " - " + result.username;
                    await t.none(q3, [log, result.id]);
                }
            })
            .then(() => {
                if(isActive == 'true') {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Klien berhasil diaktifkan.'
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Klien berhasil dinon-aktifkan.'
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
            //             message: 'Berhasil diaktifkan.'
            //         });
            //     } else {
            //         res.status(200)
            //         .json({
            //             status: 'success',
            //             message: 'Berhasil dinon-aktifkan.'
            //         });
            //     }
    
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
        }
    });
}

function deleteClient(req,res,next){
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
            const id = req.body.id;
            const q1 = 'UPDATE sms.clients SET is_delete = true WHERE id = $1';

            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [id]);

                const c = await t.one(q2, [result.client_id]);
                
                const log = "Delete Client (" + id + ") " + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id]);
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Klien berhasil dihapus.'
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
            //         message: 'Klien berhasil dihapus.'
            //     });
            // })
            // .catch(function (err) {
            //     return next(err);
            // });
        }
    });
}


module.exports = {
    getAllClients:getAllClients,
    getClient:getClient,
    addClient:addClient,
    editClient:editClient,
    activateClient:activateClient,
    deleteClient:deleteClient,
    otpClientList:otpClientList
}
