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

function getAllClients(req,res,next){
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

            db.dbs.any('SELECT * FROM sms.clients WHERE is_delete = false', [page,itemperpage])
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
                    db.dbs.any('SELECT * FROM sms.clients WHERE is_delete = false LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
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
                return next(err);
            });
        }

    });
}

function addClient(req,res,next){
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

            db.dbs.tx(async t => {
                await t.none(q1, [alias,name,phone,email,pic,sender,pass,status]);
                const client = await t.one(q2, [alias]);
                if ( type == 1) {
                    t.batch([
                        t.none(q3, [0, client.id, true]),
                        t.none(q4, [0, alias, true])
                    ]);
                } else if ( type == 2){
                    t.batch([
                        t.none(q3, [0, client.id, true]),
                        t.none(q4, [0, alias, false])
                    ]);
                } else {
                    t.batch([
                        t.none(q3, [0, client.id, false]),
                        t.none(q4, [0, alias, true])
                    ]);
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
  
    checkUser(token1,token2).then(function(result){
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
            
            const query = 'UPDATE sms.clients SET cltuid = $2, name = $3, phone = $4, email = $5, pic = $6, sender = $7 WHERE id = $1'
        
            db.dbs.none(query, [id,alias,name,phone,email,pic,sender])
            .then(function (data) {
    
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Data berhasil diubah.'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function activateClient(req,res,next){
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
            const query = 'UPDATE sms.clients SET is_active = $2 WHERE id = $1'
        
            db.dbs.none(query, [id, isActive])
            .then(function (data) {

                if(isActive == 'true') {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Berhasil diaktifkan.'
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Berhasil dinon-aktifkan.'
                    });
                }
    
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function deleteClient(req,res,next){
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
            const query = 'UPDATE sms.clients SET is_delete = true WHERE id = $1'
        
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


module.exports = {
    getAllClients:getAllClients,
    addClient:addClient,
    editClient:editClient,
    activateClient:activateClient,
    deleteClient:deleteClient
}
