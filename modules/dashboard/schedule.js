"use strict";

const db = require('../../config/db');
var auth = require('../shared/auth');
const excel = require('exceljs');


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

function getSchedule(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;
            var page = req.query.page;
            var itemperpage = req.query.itemperpage;

            // console.log('status', status);
            // console.log('client', client);
            // console.log('datefrom', datefrom);
            // console.log('dateto', dateto);
            // console.log('page', page);
            // if (page) {
            //     console.log(true);
            // } else {
            //     console.log(false);
            // }
            // console.log('itemperpage', itemperpage);
            if (status && client && datefrom && dateto && page && itemperpage) {
                // console.log('1');
                db.dbs.any('SELECT * FROM sms.schedules WHERE status = $1 AND client_id = $2 AND update_at :: DATE BETWEEN DATE $3 AND $4 ORDER BY update_at desc LIMIT $6 OFFSET (($5 - 1) * $6)', [status,client,datefrom,dateto,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE status = $1 AND client_id = $2 AND update_at :: DATE BETWEEN DATE $3 AND $4', [status,client,datefrom,dateto,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
            } else if (status && datefrom && dateto && page && itemperpage) {
                // console.log('2');
                db.dbs.any('SELECT * FROM sms.schedules WHERE status = $1 AND update_at :: DATE BETWEEN DATE $2 AND $3 ORDER BY update_at desc LIMIT $5 OFFSET (($4 - 1) * $5)', [status,datefrom,dateto,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE status = $1 AND update_at :: DATE BETWEEN DATE $2 AND $3', [status,datefrom,dateto,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
            } else if (client && datefrom && dateto && page && itemperpage) {
                // console.log('3');
                db.dbs.any('SELECT * FROM sms.schedules WHERE client_id = $1 AND update_at :: DATE BETWEEN DATE $2 AND $3 ORDER BY update_at desc LIMIT $5 OFFSET (($4 - 1) * $5)', [client,datefrom,dateto,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE client_id = $1 AND update_at :: DATE BETWEEN DATE $2 AND $3', [client,datefrom,dateto,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
            } else if (status && client && page && itemperpage) {
                // console.log('4');
                db.dbs.any('SELECT * FROM sms.schedules WHERE status = $1 AND client_id = $2 ORDER BY update_at desc LIMIT $4 OFFSET (($3 - 1) * $4)', [status,client,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE status = $1 AND client_id = $2 ', [status,client,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
            } else if (datefrom && dateto && page && itemperpage) {
                // console.log('5');
                db.dbs.any('SELECT * FROM sms.schedules WHERE update_at :: DATE BETWEEN DATE $1 AND $2 ORDER BY update_at desc LIMIT $4 OFFSET (($3 - 1) * $4)', [datefrom,dateto,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE update_at :: DATE BETWEEN DATE $1 AND $2', [datefrom,dateto,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
            } else if (status && page && itemperpage) {
                // console.log('6');
                db.dbs.any('SELECT * FROM sms.schedules WHERE status = $1 ORDER BY update_at desc LIMIT $2 OFFSET (($1 - 1) * $2)', [status,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE status = $1', [status,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
            } else if (client && page && itemperpage) {
                // console.log('7');
                db.dbs.any('SELECT * FROM sms.schedules WHERE client_id = $1 ORDER BY update_at desc LIMIT $3 OFFSET (($2 - 1) * $3)', [client,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE client_id = $1', [client,page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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
                // console.log('8');
                db.dbs.any('SELECT * FROM sms.schedules ORDER BY update_at desc LIMIT $2 OFFSET (($1 - 1) * $2)', [page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules', [page,itemperpage])
                        .then(function (dataQty) {
                            let count = dataQty[0].count;
                            var pageQty = (count / itemperpage).toFixed(0);
                            if(pageQty == 0){
                                pageQty = 1
                            }

                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan daftar broadcast schedules',
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

function getScheduleByID(req,res,next){
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

            db.dbs.one('SELECT * FROM sms.schedules WHERE id = $1', [id])
            .then(function (data) {
                res.status(200)
                .json({
                    status: 1,
                    data: data,
                    message: 'Berhasil menampilkan schedule'
                });
            })
            .catch(function (err) {
                return next(err);
            });
        }
    });
}

function changeScheduleTime(req,res,next){
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
            db.dbs.tx(async t => {
                const id = req.body.id;
                const send_date = req.body.send_date;

                const sch = await t.none('UPDATE sms.schedules SET send_date = $1 WHERE id = $2 RETURNING client_id, schuid', [send_date, id]);

                const c = await t.one('SELECT sender FROM sms.clients WHERE id = $1', [sch.client_id]);
                const log = "Modify Schedule(" + sch.schuid + ")" + c.sender + " - " + result.username;

                await t.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);

            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Berhasil Re-schedule.' 
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

function cancelSchedule(req,res,next){
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
            db.dbs.tx(async t => {
                const id = req.body.id;

                const sch = await t.one('UPDATE sms.schedules SET status = $1 WHERE id = $2 RETURNING id, client_id, schuid', [3, id]);
                await t.none('UPDATE sms.messages SET is_sent = $1 WHERE id = $2',[false, sch.id]);
                const c = await t.one('SELECT sender FROM sms.clients WHERE id = $1', [sch.client_id]);
                const log = "Cancel Schedule(" + sch.schuid + ")" + " - " + c.sender + " - " + result.username;

                await t.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);

            })
            .then(() => {
                res.status(200)
                .json({
                    status: 'success',
                    message: 'Schedule dibatalkan.' 
                });
            })
            .catch(error => {
                return next(error);
            });
        }
    });
}

module.exports = {
    getSchedule:getSchedule,
    changeScheduleTime:changeScheduleTime,
    cancelSchedule:cancelSchedule,
    getScheduleByID:getScheduleByID
}