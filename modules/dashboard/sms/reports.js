"use strict";

const db = require('../../../config/db');
var auth = require('../../shared/auth');


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

function getSmsReport(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            if (status && client && datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $5 AND $6 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $5 AND $6', [page,itemperpage,status,client,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status && client && datefrom) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $5 AND $5 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client,datefrom])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $5 AND $5', [page,itemperpage,status,client,datefrom])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status && client && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $5 AND $5 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $5 AND $5', [page,itemperpage,status,client,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status && datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $5 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $5', [page,itemperpage,status,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (client && datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $5 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $5', [page,itemperpage,client,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status && client) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND m.client_id = $4', [page,itemperpage,status,client])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status && datefrom) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,datefrom])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4', [page,itemperpage,status,datefrom])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4', [page,itemperpage,status,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $4 AND d.create_at :: DATE BETWEEN DATE $4 AND $4', [page,itemperpage,client,datefrom])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (client && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4', [page,itemperpage,client,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $3 AND $4 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $3 AND $4', [page,itemperpage,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (status) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $3', [page,itemperpage,status])
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
                                    message: 'Berhasil menampilkan laporan',
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
            } else if (client) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3', [page,itemperpage,client])
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
                                    message: 'Berhasil menampilkan laporan',
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
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $3 AND $3 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $3 AND $3', [page,itemperpage,datefrom])
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
                                    message: 'Berhasil menampilkan laporan',
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
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $3 AND $3 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,dateto])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $3 AND $3', [page,itemperpage,dateto])
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
                                    message: 'Berhasil menampilkan laporan',
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
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id', [page,itemperpage])
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
                                    message: 'Berhasil menampilkan laporan',
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

function downloadReport(req,res){

}


module.exports={
    getSmsReport:getSmsReport
}