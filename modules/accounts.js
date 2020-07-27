"use strict";

var crypto = require("crypto");
const db = require('../config/db');
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
        let cip = cipher.update(plainText, 'utf8', 'base64');
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
};

function accountListPaging(req,res,next){
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

            db.dbs.any('SELECT a.id, a.member_id, m.name AS member_name, a.username, a.e-mail, a.role_id, r.name AS role, a.is_admin, a.is_active, a.create_at, a.update_at FROM accounts a LEFT JOIN members m ON a.member_id = m.id LEFT JOIN roles r ON a.role_id = r.id WHERE a.is_delete = false ORDER BY a.update_at desc LIMIT $2 OFFSET (($1 - 1) * $2)', [page,itemperpage])
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Tidak ada data'
                    });
                } else {
                    db.dbs.any('SELECT COUNT(*) FROM accounts WHERE is_delete = false', [page,itemperpage])
                    .then(function (dataQty) {
                        let count = dataQty[0].count;
                        var pageQty = (count / itemperpage).toFixed(0);
                        if(pageQty == 0){
                            pageQty = 1;
                        }

                        res.status(200)
                            .json({
                                status: 1,
                                data: data,
                                message: 'Berhasil menampilkan data',
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
                //console.log('error',err)
                return next(err);
            });
        }

    });
}

function accountList(req,res,next){
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

            db.dbs.any('SELECT id, name FROM accounts WHERE is_delete = false ORDER BY update_at desc')
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Tidak ada data'
                    });
                } else {

                        res.status(200)
                            .json({
                                status: 1,
                                data: data,
                                message: 'Berhasil menampilkan data'
                            });
                }
            })
            .catch(function (err) {
                //console.log('error',err)
                return next(err);
            });
        }

    });
}

function accountByID(req,res,next){
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
            const id = req.params.id;

            db.dbs.one('SELECT a.id, a.member_id, m.name AS member_name, a.username, a.e-mail, a.role_id, r.name AS role, a.is_admin, a.is_active, a.create_at, a.update_at FROM accounts a LEFT JOIN members m ON a.member_id = m.id LEFT JOIN roles r ON a.role_id = r.id WHERE a.id = $1', [id])
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Tidak ada data'
                    });
                } else {

                        res.status(200)
                            .json({
                                status: 1,
                                data: data,
                                message: 'Berhasil menampilkan data'
                            });
                }
            })
            .catch(function (err) {
                //console.log('error',err)
                return next(err);
            });
        }

    });
}

function addAccount(req,res,next){
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
            const member_id = req.body.member_id;
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;
            const role_id = req.body.role_id;
            const is_admin = req.body.is_admin;

            db.dbs.any('SELECT username FROM accounts WHERE username = $1', [username])
            .then((a) => {
                if (a.length === 0) {

                    db.dbs.any('SELECT email FROM accounts WHERE email = $1', [email])
                    .then((b) => {
                        if (b.length === 0) {
                            db.dbs.tx(async t => {
                                await t.none('INSERT INTO accounts (member_id,username,email,password,role_id,is_admin) VALUES ($1, $2, $3, $4, $5, $6)', [member_id,username,email,password,role_id,is_admin]);
                                const log = "Tambah akun - " + result.nickname;
                                await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                            })
                            .then(() => {
                                res.status(200)
                                .json({
                                    status: 1,
                                    message: 'Berhasil menambahkan Akun.'
                                });
                            })
                            .catch(error => {
                                return next(error);
                            });
                        } else {
                            res.status(200)
                            .json({
                                status: 2,
                                message: 'E-mail ini sudah terdaftar.'
                            });
                        }
                    })
                    .catch(error => {
                        return next(error);
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Nama ini sudah terdaftar.'
                    });
                }
            })
            .catch(error => {
                return next(error);
            });

        }
    });
}

function editAccount(req,res,next){
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
            const username = req.body.username;
            const email = req.body.email;
            const role_id = req.body.role_id;

            db.dbs.any('SELECT username FROM accounts WHERE username = $1', [username])
            .then((a) => {
                if (a.length === 0) {

                    db.dbs.any('SELECT email FROM accounts WHERE email = $1', [email])
                    .then((b) => {
                        if (b.length === 0) {
                            db.dbs.tx(async t => {
                                await t.none('UPDATE accounts SET username = $1, email = $2, role_id = $3) VALUES ($1, $2, $3)', [username,email,role_id]);
                                const log = "Ubah data akun (" + id + ") - " + result.nickname;
                                await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                            })
                            .then(() => {
                                res.status(200)
                                .json({
                                    status: 1,
                                    message: 'Berhasil mengubah data akun.'
                                });
                            })
                            .catch(error => {
                                return next(error);
                            });
                        } else {
                            res.status(200)
                            .json({
                                status: 2,
                                message: 'E-mail ini sudah terdaftar.'
                            });
                        }
                    })
                    .catch(error => {
                        return next(error);
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Nama ini sudah terdaftar.'
                    });
                }
            })
            .catch(error => {
                return next(error);
            });

        }
    });
}

function accountPasswordByID(req,res,next){
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
            const id = req.params.id;

            db.dbs.one('SELECT password FROM accounts WHERE id = $1', [id])
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Tidak ada data'
                    });
                } else {

                        res.status(200)
                            .json({
                                status: 1,
                                data: data
                            });
                }
            })
            .catch(function (err) {
                //console.log('error',err)
                return next(err);
            });
        }
    });
}

function changePassword(req,res,next){
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
            const password = req.body.password;

            db.dbs.tx(async t => {
                await t.none('UPDATE accounts SET password = $1 WHERE id = $2', [password, id]);

                const log = "Ubah Password (" + id + ") " + " - " + result.nickname;
                await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Password berhasil diubah.'
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

function activateAccount(req,res,next){
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

            db.dbs.tx(async t => {
                await t.none('UPDATE accounts SET is_active = $2 WHERE id = $1', [id, isActive]);

                if(isActive === true) {
                    const log = "Mengaktifkan Akun (" + id + ") " + " - " + result.nickname;
                    await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                } else {
                    const log = "Menonaktifkan Akun (" + id + ") " + " - " + result.nickname;
                    await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                }
            })
            .then(() => {
                if(isActive === true) {
                    res.status(200)
                    .json({
                        status: 1,
                        message: 'Akun berhasil diaktifkan.'
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 1,
                        message: 'Akun berhasil dinon-aktifkan.'
                    });
                }
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

function deleteAccount(req,res,next){
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

            db.dbs.tx(async t => {
                await t.none('UPDATE accounts SET is_delete = true WHERE id = $1', [id]);

                const log = "Hapus Akun (" + id + ") " + " - " + result.nickname;
                await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
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
        }
    });
}


module.exports = {
    accountList:accountList,
    accountListPaging:accountListPaging,
    accountByID:accountByID,
    addAccount:addAccount,
    editAccount:editAccount,
    accountPasswordByID:accountPasswordByID,
    changePassword:changePassword,
    deleteAccount:deleteAccount,
    activateAccount:activateAccount
};
