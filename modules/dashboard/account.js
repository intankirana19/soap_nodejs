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
        if(result == 0){
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            const client = req.query.client;
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            if (client) {
                db.dbs.any('SELECT a.id,a.client_id,a.role_id,a.username,a.job_position,r.name,c.sender,a.email,a.is_active,a.create_at,a.update_at FROM sms.accounts a inner join sms.clients c on a.client_id = c.id inner join sms.roles r on a.role_id = r.id WHERE a.is_delete = false AND client_id = $3 ORDER BY a.update_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.accounts WHERE is_delete = false AND client_id = $3', [page,itemperpage,client])
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
            } else if (page && itemperpage) {
                db.dbs.any('SELECT a.id,a.client_id,a.role_id,a.username,a.job_position,r.name,c.sender,a.email,a.is_active,a.create_at,a.update_at FROM sms.accounts a inner join sms.clients c on a.client_id = c.id inner join sms.roles r on a.role_id = r.id WHERE a.is_delete = false ORDER BY a.update_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
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
            } else {
                db.dbs.any('SELECT a.id,a.client_id,a.role_id,a.username,a.job_position,r.name,c.sender,a.email,a.is_active,a.create_at,a.update_at FROM sms.accounts a inner join sms.clients c on a.client_id = c.id inner join sms.roles r on a.role_id = r.id WHERE a.is_delete = false ORDER BY a.update_at desc')
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf tidak ada data account',
                        });
                    } else {
                            res.status(200)
                                .json({
                                    status: 'success',
                                    data: data,
                                    message: 'Berhasil menampilkan daftar akun',
                                });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            }

        }

        }

    });
}

function createAccount(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];
  
    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(401)
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
            res.status(401)
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

function changePassword(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];

    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            const id = req.body.id;
            var pass = encrypt(req.body.password);

            const q1 = 'UPDATE sms.accounts SET password = $1 WHERE id = $2';

            const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {
                await t.none(q1, [pass,id]);

                const c = await t.one(q2, [result.client_id])
                const log = "Change Password (" + id + ") " + " - " + c.sender + " - " + result.username;
                await t.none(q3, [log, result.id])
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
  
    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(401)
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
            res.status(401)
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
            res.status(401)
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
            res.status(401)
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

function clientRoleList(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];

    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            db.dbs.any('SELECT * FROM sms.roles WHERE is_internal = false')
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

function getRoles(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];
  
    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(401)
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
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            var roleId = req.params.role_id;

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
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            if (client && datefrom && dateto) {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $4 and a.client_id = $5 ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,dateto,client])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $4 and a.client_id = $5', [page,itemperpage,datefrom,dateto,client])
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
                                message: 'Berhasil menampilkan daftar log',
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
            } else if (client && datefrom) {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3 and a.client_id = $4 ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,client])
                .then(function (data) {
                    db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3 and a.client_id = $4', [page,itemperpage,datefrom,client])
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
                            message: 'Berhasil menampilkan daftar log',
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
            } else if (client && dateto) {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3 and a.client_id = $4 ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,dateto,client])
                .then(function (data) {
                    db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3 and a.client_id = $4', [page,itemperpage,dateto,client])
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
                            message: 'Berhasil menampilkan daftar log',
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
            } else if (datefrom && dateto) {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $4 ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $4', [page,itemperpage,datefrom,dateto])
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
                                message: 'Berhasil menampilkan daftar log',
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
            } else if (datefrom) {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3 ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3', [page,itemperpage,datefrom])
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
                                message: 'Berhasil menampilkan daftar log',
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
            } else if (dateto) {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3 ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id where  l.create_at :: date between $3 and $3', [page,itemperpage,dateto])
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
                                message: 'Berhasil menampilkan daftar log',
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
            } else {
                db.dbs.any('select l.name, c.sender, l.create_at from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id ORDER BY create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
                .then(function (data) {
                    db.dbs.any('select count(*) from sms.logs l left join sms.accounts a on l.account_id = a.id left join sms.clients c on a.client_id = c.id', [page,itemperpage])
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
                            message: 'Berhasil menampilkan daftar log',
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
            }

        }
    });
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
    clientRoleList:clientRoleList,
    accountRole:accountRole,
    getLogs:getLogs,
    changePassword:changePassword
}
