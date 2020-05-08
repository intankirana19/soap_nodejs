"use strict";

const db = require('../../../config/db');
var auth = require('../../shared/auth');

const cron = require('node-cron');

const excel = require('exceljs');


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

function getAllClientSmsToken(req,res,next){
    var page = req.query.page -1;
    var itemperpage = req.query.itemperpage;

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

function downloadAllClientSmsToken(req,res,next){

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
            db.dbs.any('SELECT t.id,amount,t.client_id,c.sender as client,t.create_at,t.update_at FROM sms.tokens t left join sms.clients c on t.client_id = c.id order by update_at desc')
            .then(function (data) {
                if (data.length == 0) {
                    res.status(200)
                    .json({
                        status: 'success',
                        message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                    });
                } else {
                    const jsonData = JSON.parse(JSON.stringify(data));
                    let workbook = new excel.Workbook(); //creating workbook
                    let worksheet = workbook.addWorksheet('CLIENT_BROADCAST_TOKEN_LIST'); //creating worksheet
                    //  WorkSheet Header
                    worksheet.columns = [
                        { header: 'ID Client', key: 'client_id'},
                        { header: 'Client', key: 'client'},
                        { header: 'Token Broadcast', key: 'amount'},
                        { header: 'Terakhir Update/ Top Up/ Reset', key: 'update_at'}
                    ];
                    // Add Array Rows
                    worksheet.addRows(jsonData);

                    const fileName = 'CLIENT_BROADCAST_TOKEN_LIST';

                    res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

                    return workbook.xlsx.write(res)
                        .then(function() {
                                res.status(200).end();
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
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
            var clientId = result.client_id;

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

function topUpClientSmsToken(req,res,next){
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

            const q1 = 'SELECT amount FROM sms.tokens t left join sms.clients c on t.client_id = c.id WHERE c.id = $1';
            const q2 = 'UPDATE sms.tokens SET amount = $1 WHERE client_id = $2';
            const q3 = 'INSERT INTO sms.topups (amount, client_id, status, uid, topup_by) VALUES ($1, $2, $3, $4, $5)';

            const q4 = 'SELECT sender FROM sms.clients WHERE id = $1';
            const q5 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

            db.dbs.tx(async t => {

                var amount = new Number(req.body.amount);

                const cid = req.body.client_id;
                const status = req.body.status;
    
                var d = new Date();
                var r = ((1 + (Math.floor(Math.random() * 2))) * 10000 + (Math.floor(Math.random() * 10000))).toString();
                var date = ("0" + d.getDate()).slice(-2).toString();
                var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                var mmdd = month + date;
                var uid = "49" + mmdd + r;
    
                const by = result.username;

                const token = await t.one(q1, [cid]);

                var tokenQty = new Number(token.amount);
                var amt = new Number (amount)
                var totalAmount = tokenQty + amt;

                await t.none(q2, [totalAmount, cid]);

                await t.none(q3, [amount, cid, status, uid, by]);

                const c = await t.one(q4, [cid]);
                const log = "Top Up Token Broadcast" + " " + c.sender + " - " + result.username;

                await t.none(q5, [log, result.id]);


            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Top Up Token Broadcast Berhasil.' 
                });
            })
            .catch(error => {
                return next(error);
            });
        }

    });
}


function getTopUpHistory(req,res,next){
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

            if(client && datefrom && dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $5 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $5 ORDER BY t.create_at desc', [page,itemperpage,client,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
            } else if(client && datefrom){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $4 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $4 ORDER BY t.create_at desc', [page,itemperpage,client,datefrom])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
            } else if(client && dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $4 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $4 ORDER BY t.create_at desc', [page,itemperpage,client,dateto])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
            } if(datefrom && dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $4 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $4 ORDER BY t.create_at desc', [page,itemperpage,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
            } else if(client){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 ORDER BY t.create_at desc', [page,itemperpage,client])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
            } else if(datefrom){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $3 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $3 ORDER BY t.create_at desc', [page,itemperpage,datefrom])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
            } else if(dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $3 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $3 ORDER BY t.create_at desc', [page,itemperpage,dateto])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.topups t inner join sms.clients c on t.client_id = c.id ORDER BY t.create_at desc', [page,itemperpage])
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
                                    message: 'Berhasil menampilkan daftar riwayat topup token Broadcast ',
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

        }

    });

}

function downloadTopUpHistory(req,res,next){
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

            if(client && datefrom && dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $5 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_TOP_UP_HISTORY_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = client + '_BROADCAST_TOP_UP_HISTORY_' + datefrom + '_to_' + dateto;
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if(client && datefrom){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $4 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_TOP_UP_HISTORY_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = client + '_BROADCAST_TOP_UP_HISTORY_' + datefrom;
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if(client && dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 and t.create_at :: date between $4 and $4 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_TOP_UP_HISTORY_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = client + '_BROADCAST_TOP_UP_HISTORY_' + dateto;
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } if(datefrom && dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $4 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet('TOP_UP_HISTORY_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = 'TOP_UP_HISTORY_' + datefrom + '_to_' + dateto;
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if(client){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE client_id = $3 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet(client + '_TOP_UP_HISTORY'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = client + '_TOP_UP_HISTORY';
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if(datefrom){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $3 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet('TOP_UP_HISTORY_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = 'TOP_UP_HISTORY_' + datefrom;
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if(dateto){
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id WHERE t.create_at :: date between $3 and $3 ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet('TOP_UP_HISTORY_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = 'TOP_UP_HISTORY_' + dateto;
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else {
                db.dbs.any('SELECT t.id,t.uid,amount,c.sender,t.status,t.create_at,t.update_at FROM sms.topups t inner join sms.clients c on t.client_id = c.id ORDER BY t.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                        });
                    } else {
                        const jsonData = JSON.parse(JSON.stringify(data));
                        let workbook = new excel.Workbook(); //creating workbook
                        let worksheet = workbook.addWorksheet('TOP_UP_HISTORY'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'UID', key: 'uid'},
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Client', key: 'sender'},
                            { header: 'Jumlah Top Up', key: 'amount'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);
    
                        const fileName = 'TOP_UP_HISTORY';
    
                        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
                        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    
                        return workbook.xlsx.write(res)
                            .then(function() {
                                    res.status(200).end();
                            });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            }

        }

    });
}

function topupRequest(req,res,next){

}

// Client Broadcast Token Reset Scheduler ( every midnight of every last day of every month)
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

if (today.getMonth() !== tomorrow.getMonth()) {
    cron.schedule('59 23 * * *', function() {
        const q1 = 'SELECT token FROM sms.token_reset_amount WHERE id = 1';
        const q2 = 'UPDATE sms.tokens SET amount = $1 WHERE is_active = true';


                db.dbs.tx(async t => {

                    const amount = await t.one(q1);

                    // console.log(amount.token);
                    
                    await t.none(q2, [amount.token]);
                
                })
                .then(() => {
                    console.log('Broadcast Token Reset Scheduler Success')
                })
                .catch(error => {
                    console.log(error);
                });
    });
}



module.exports={
    getAllClientSmsToken:getAllClientSmsToken,
    getClientSmsToken:getClientSmsToken,
    topUpClientSmsToken:topUpClientSmsToken,
    getTopUpHistory:getTopUpHistory,
    downloadAllClientSmsToken:downloadAllClientSmsToken,
    downloadTopUpHistory:downloadTopUpHistory
}