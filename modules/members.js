"use strict";

var crypto = require("crypto");
const db = require('../config/db');
var auth = require('./auth');

const keys = new Buffer.from('GJKIKey230720');
const ivs = new Buffer('GJKIInitssss');

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

function memberListPaging(req,res,next){
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

            db.dbs.any('SELECT m.id, m.name, m.nickname, m.gender, m.birth_p, m.birth_d, m.phone, m.email, m.address, m.status, m.mother AS mother_id, x.name AS mother, m.father AS father_id, y.name AS father, m.couple AS couple_id, z.name AS couple, m.married, m.group AS group_id, g.name AS group, m.baptism, m.baptism_d, m.branch AS branch_id, b.name AS branch, m.is_active FROM members m LEFT JOIN members x ON m.mother = x.id LEFT JOIN members y ON m.father = y.id LEFT JOIN members z ON m.couple = z.id LEFT JOIN groups g ON m.group = g.id LEFT JOIN branches b ON m.branch = b.id WHERE m.is_delete = false ORDER BY m.update_at desc LIMIT $2 OFFSET (($1 - 1) * $2)', [page,itemperpage])
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Tidak ada data'
                    });
                } else {
                    db.dbs.any('SELECT COUNT(*) FROM members WHERE is_delete = false', [page,itemperpage])
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

function memberList(req,res,next){
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

            db.dbs.any('SELECT id, name FROM members WHERE is_delete = false ORDER BY update_at desc')
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

function memberByID(req,res,next){
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

            db.dbs.one('SELECT m.id, m.name, m.nickname, m.gender, m.birth_p, m.birth_d, m.phone, m.email, m.address, m.status, m.mother AS mother_id, x.name AS mother, m.father AS father_id, y.name AS father, m.couple AS couple_id, z.name AS couple, m.married, m.group AS group_id, g.name AS group, m.baptism, m.baptism_d, m.branch AS branch_id, b.name AS branch, m.is_active FROM members m LEFT JOIN members x ON m.mother = x.id LEFT JOIN members y ON m.father = y.id LEFT JOIN members z ON m.couple = z.id LEFT JOIN groups g ON m.group = g.id LEFT JOIN branches b ON m.branch = b.id WHERE m.id = $1', [id])
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

function addMember(req,res,next){
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
            const name = req.body.name;
            const nickname = req.body.nickname;
            const gender = req.body.gender;
            const birth_p = req.body.birth_p;
            const birth_d = req.body.birth_d;
            const phone = req.body.phone;
            const email = req.body.email;
            const address = req.body.address;
            const status = req.body.status;
            const mother = req.body.mother;
            const father = req.body.father;
            const couple = req.body.couple;
            const married = req.body.married;
            const group = req.body.group;
            const baptism = req.body.baptism;
            const baptism_d = req.body.baptism_d;
            const branch = req.body.branch;

            db.dbs.any('SELECT name FROM members WHERE name = $1', [name])
            .then((a) => {
                if (a.length === 0) {
                    db.dbs.tx(async t => {
                        await t.none('INSERT INTO members (name,nickname,gender,birth_p,birth_d,phone,email,address,status,mother,father,couple,married,group,baptism,baptism_d,branch) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)', [name,nickname,gender,birth_p,birth_d,phone,email,address,status,mother,father,couple,married,group,baptism,baptism_d,branch]);
                        const log = "Tambah Jemaat - " + result.nickname;
                        await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                    })
                    .then(() => {
                        res.status(200)
                        .json({
                            status: 1,
                            message: 'Berhasil menambahkan jemaat.'
                        });
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

function editMember(req,res,next){
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
            const name = req.body.name;
            const nickname = req.body.nickname;
            const birth_p = req.body.birth_p;
            const birth_d = req.body.birth_d;
            const phone = req.body.phone;
            const email = req.body.email;
            const address = req.body.address;
            const status = req.body.status;
            const mother = req.body.mother;
            const father = req.body.father;
            const couple = req.body.couple;
            const married = req.body.married;
            const group = req.body.group;
            const baptism = req.body.baptism;
            const baptism_d = req.body.baptism_d;
            const branch = req.body.branch;

            db.dbs.any('SELECT name FROM members WHERE name = $1', [name])
            .then((a) => {
                if (a.length === 0) {
                    db.dbs.tx(async t => {
                        await t.none('UPDATE members SET name = $1, nickname = $2, birth_p = $3, birth_d = $4, phone = $5, email = $6, address = $7, status = $8, mother = $9, father = $10, couple = $11, married = $12, group = $13, baptism = $14, baptism_d = $15, branch = $16 WHERE id = $17', [name,nickname,birth_p,birth_d,phone,email,address,status,mother,father,couple,married,group,baptism,baptism_d,branch,id]);
                        const log = "Ubah data jemaat (" + id + ") - " + result.nickname;
                        await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                    })
                    .then(() => {
                        res.status(200)
                        .json({
                            status: 1,
                            message: 'Berhasil mengubah data jemaat.'
                        });
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

function activateMember(req,res,next){
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
                await t.none('UPDATE members SET is_active = $2 WHERE id = $1', [id, isActive]);

                if(isActive === true) {
                    const log = "Mengaktifkan Jemaat (" + id + ") " + " - " + result.nickname;
                    await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                } else {
                    const log = "Menonaktifkan Jemaat (" + id + ") " + " - " + result.nickname;
                    await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
                }
            })
            .then(() => {
                if(isActive === true) {
                    res.status(200)
                    .json({
                        status: 1,
                        message: 'Member berhasil diaktifkan.'
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 1,
                        message: 'Member berhasil dinon-aktifkan.'
                    });
                }
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

function deleteMember(req,res,next){
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
                await t.none('UPDATE members SET is_delete = true WHERE id = $1', [id]);

                const log = "Hapus Jemaat (" + id + ") " + " - " + result.nickname;
                await t.none('INSERT INTO logs (activity, account_id) VALUES ($1, $2)', [log, result.id]);
            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Member berhasil dihapus.'
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}


module.exports = {
    memberList:memberList,
    memberListPaging:memberListPaging,
    memberByID:memberByID,
    addMember:addMember,
    editMember:editMember,
    deleteMember:deleteMember,
    activateMember:activateMember
};
