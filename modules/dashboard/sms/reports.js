"use strict";

const db = require('../../../config/db');
var auth = require('../../shared/auth');
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

function getSmsReport(req,res,next){
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $3 AND d.create_at :: DATE BETWEEN DATE $4 AND $4', [page,itemperpage,client,datefrom])
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
                            status: 2,
                            data: data,
                            message: 'Data tidak ada',
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
                                    status: 1,
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            if (status && client && datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $4 ORDER BY d.create_at desc', [status,client,datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + dateto;

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
            } else if (status && client && datefrom) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $3 ORDER BY d.create_at desc', [status,client,datefrom])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + dateto;

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
            } else if (status && client && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $3 ORDER BY d.create_at desc', [status,client,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_' + status + '_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_' + status + '_LIST_' + dateto + '_to_' + dateto;

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
            } else if (status && datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $3 ORDER BY d.create_at desc', [status,datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + dateto;

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
            } else if (client && datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $3 ORDER BY d.create_at desc', [client,datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_LIST_' + dateto + '_to_' + dateto;

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
            } else if (status && client) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 ORDER BY d.create_at desc', [status,client])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_' + status + '_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_' + status + '_LIST';

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
            } else if (status && datefrom) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2 ORDER BY d.create_at desc', [status,datefrom])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_' + status + '_LIST_' + datefrom + '_to_' + datefrom;

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
            } else if (status && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2 ORDER BY d.create_at desc', [status,dateto])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_' + status + '_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_' + status + '_LIST_' + dateto + '_to_' + dateto;

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
            } else if (client && datefrom) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2 ORDER BY d.create_at desc', [client,datefrom])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_LIST_' + datefrom + '_to_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_LIST_' + datefrom + '_to_' + datefrom;

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
            } else if (client && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2 ORDER BY d.create_at desc', [client,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_LIST_' + dateto + '_to_' + dateto;

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
            } else if (datefrom && dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $2 ORDER BY d.create_at desc', [datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_LIST_' + datefrom + '_to_' + dateto;

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
            } else if (status) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 ORDER BY d.create_at desc', [status])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_' + status + '_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_' + status + '_LIST';

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
            } else if (client) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 ORDER BY d.create_at desc LIMIT $2 OFFSET $1 * $2', [client])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_LIST';

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
            } else if (datefrom) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $1 ORDER BY d.create_at desc', [datefrom])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_LIST_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_LIST_' + datefrom;

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
            } else if (dateto) {
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $1 ORDER BY d.create_at desc', [dateto])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_LIST_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_LIST_' + dateto;

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
                db.dbs.any('SELECT d.create_at,c.sender,r.msisdn,m.text,r.status,r.message FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id ORDER BY d.create_at desc')
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
                        let worksheet = workbook.addWorksheet('BROADCAST_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'create_at'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_LIST';

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

function reportCount(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            if (status && client && datefrom && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $4', [status,client,datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (status && client && datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $3', [status,client,datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (status && client && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $3', [status,client,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (status && datefrom && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $3', [status,datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (client && datefrom && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $3', [client,datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (status && client) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2', [status,client])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (status && datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [status,datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (status && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [status,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (client && datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [client,datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (client && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [client,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (datefrom && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $2', [datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                
            } else if (status) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1', [status])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (client) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1', [client])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $1', [datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                    
            } else if (dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $1', [dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
                                });
                            }
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id')
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: 0,
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.'
                                });
                            } else {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: count,
                                    message: 'Berhasil menampilkan jumlah laporan.'
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

function downloadReportCount(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            if (status && client && datefrom && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $4', [status,client,datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_' + status + '_BROADCAST_COUNT_' + datefrom + '_to_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_' + status + '_BROADCAST_COUNT_' + datefrom + '_to_' + dateto;
        
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
                   
            } else if (status && client && datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $3', [status,client,datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_' + status + '_BROADCAST_COUNT_' + datefrom); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_' + status + '_BROADCAST_COUNT_' + datefrom;
        
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
                   
            } else if (status && client && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2 AND d.create_at :: DATE BETWEEN DATE $3 AND $3', [status,client,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_' + status + '_BROADCAST_COUNT_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_' + status + '_BROADCAST_COUNT_' + dateto;
        
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
                    
            } else if (status && datefrom && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $3', [status,datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(status + '_BROADCAST_COUNT_' + datefrom + '_to_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = status + '_BROADCAST_COUNT_' + datefrom + '_to_' + dateto;
        
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
                   
            } else if (client && datefrom && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $3', [client,datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_BROADCAST_COUNT_' + datefrom + '_to_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_BROADCAST_COUNT_' + datefrom + '_to_' + dateto;
        
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
                    
            } else if (status && client) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND m.client_id = $2', [status,client])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_' + status + '_BROADCAST_COUNT'); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_' + status + '_BROADCAST_COUNT';
        
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
                   
            } else if (status && datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [status,datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(status + '_BROADCAST_COUNT_' + datefrom); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = status + '_BROADCAST_COUNT_' + datefrom;
        
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
                    
            } else if (status && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [status,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(status + '_BROADCAST_COUNT_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = status + '_BROADCAST_COUNT_' + dateto;
        
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
                    
            } else if (client && datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [client,datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_BROADCAST_COUNT_' + datefrom); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_BROADCAST_COUNT_' + datefrom;
        
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
                    
            } else if (client && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1 AND d.create_at :: DATE BETWEEN DATE $2 AND $2', [client,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_BROADCAST_COUNT_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_BROADCAST_COUNT_' + dateto;
        
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
                    
            } else if (datefrom && dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $2', [datefrom,dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet('BROADCAST_COUNT_' + datefrom + '_to_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = 'BROADCAST_COUNT_' + datefrom + '_to_' + dateto;
        
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
                
            } else if (status) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE r.status = $1', [status])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(status + '_BROADCAST_COUNT'); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = status + '_BROADCAST_COUNT';
        
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
                    
            } else if (client) {
               
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE m.client_id = $1', [client])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet(client + '_BROADCAST_COUNT'); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = client + '_BROADCAST_COUNT';
        
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
                    
            } else if (datefrom) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $1', [datefrom])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet('BROADCAST_COUNT_' + datefrom); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = 'BROADCAST_COUNT_' + datefrom;
        
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
                    
            } else if (dateto) {
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id WHERE d.create_at :: DATE BETWEEN DATE $1 AND $1', [dateto])
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet('BROADCAST_COUNT_' + dateto); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = 'BROADCAST_COUNT_' + dateto;
        
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
                
                        db.dbs.any('SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients c ON m.client_id = c.id')
                        .then(function (dataQty) {
                            var count = new Number(dataQty[0].count);
                            if (data.length == 0) {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                                });
                            } else {
                                const jsonData = JSON.parse(JSON.stringify(data));
                                let workbook = new excel.Workbook(); //creating workbook
                                let worksheet = workbook.addWorksheet('BROADCAST_COUNT'); //creating worksheet
                                //  WorkSheet Header
                                worksheet.columns = [
                                    { header: 'Jumlah Broadcast', key: count}
                                ];
                                // Add Array Rows
                                worksheet.addRows(jsonData);
        
                                const fileName = 'BROADCAST_COUNT';
        
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

function getSmsDailyTokenUsage(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            const q1 = 'SELECT d.create_at :: DATE AS date, c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $6 AND r.update_at :: DATE BETWEEN DATE $3 AND $4 AND m.client_id = $5 GROUP BY date,sender ORDER BY date LIMIT $2 OFFSET $1 * $2';
            const q1c = 'SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $6 AND r.update_at :: DATE BETWEEN DATE $3 AND $4 AND m.client_id = $5';

            const q2 = 'SELECT d.create_at :: DATE AS date, c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $5 AND r.update_at :: DATE BETWEEN DATE $3 AND $4 GROUP BY date,sender ORDER BY date LIMIT $2 OFFSET $1 * $2';
            const q2c = 'SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $5 AND r.update_at :: DATE BETWEEN DATE $3 AND $4';

            const q3 = 'SELECT d.create_at :: DATE AS date, c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $3 GROUP BY date,sender ORDER BY date LIMIT $2 OFFSET $1 * $2';
            const q3c = 'SELECT COUNT(*) FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $3';

            if (client && datefrom && dateto) {
                db.dbs.any(q1, [page,itemperpage,datefrom,dateto,client,status])
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
                        db.dbs.any(q1c, [page,itemperpage,datefrom,dateto,client,status])
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
                                    message: 'Berhasil menampilkan pemakaian token Broadcast harian',
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
                db.dbs.any(q2, [page,itemperpage,datefrom,dateto,status])
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
                        db.dbs.any(q2c, [page,itemperpage,datefrom,dateto,status])
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
                                    message: 'Berhasil menampilkan pemakaian token Broadcast harian',
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
                db.dbs.any(q3, [page,itemperpage,status])
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
                        db.dbs.any(q3c, [page,itemperpage,status])
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
                                    message: 'Berhasil menampilkan pemakaian token Broadcast harian',
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

function downloadSmsDailyTokenUsage(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            const q1 = 'SELECT d.create_at :: DATE AS date, c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $4 AND r.update_at :: DATE BETWEEN DATE $1 AND $2 AND m.client_id = $3 GROUP BY date,sender ORDER BY date';

            const q2 = 'SELECT d.create_at :: DATE AS date, c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $3 AND r.update_at :: DATE BETWEEN DATE $1 AND $2 GROUP BY date,sender ORDER BY date';

            const q3 = 'SELECT d.create_at :: DATE AS date, c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $1 GROUP BY date,sender ORDER BY date';

            if (client && datefrom && dateto) {
                db.dbs.any(q1, [datefrom,dateto,client,status])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_DAILY_USAGE_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'date'},
                            { header: 'Client', key: 'client'},
                            { header: 'Pemakaian Broadcast', key: 'total_usage'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_DAILY_USAGE_' + datefrom + '_to_' + dateto;

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
            } else if (datefrom && dateto) {
                db.dbs.any(q2, [datefrom,dateto,status])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_DAILY_USAGE_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'date'},
                            { header: 'Client', key: 'client'},
                            { header: 'Pemakaian Broadcast', key: 'total_usage'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_DAILY_USAGE_' + datefrom + '_to_' + dateto;

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
                db.dbs.any(q3, [status])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_DAILY_USAGE'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'date'},
                            { header: 'Client', key: 'client'},
                            { header: 'Pemakaian Broadcast', key: 'total_usage'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_DAILY_USAGE';

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

function getSmsTokenTotalUsage(req,res,next){
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
            // var page = req.query.page -1;
            // var itemperpage = req.query.itemperpage;

            const q1 = 'SELECT c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $4 AND r.update_at :: DATE BETWEEN DATE $1 AND $2 AND m.client_id = $3';

            const q2 = 'SELECT c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $3 AND r.update_at :: DATE BETWEEN DATE $1 AND $2';

            const q3 = 'SELECT c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $1';

            if (client && datefrom && dateto) {
                db.dbs.any(q1, [datefrom,dateto,client,status])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada'
                        });
                    } else {
                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan total pemakaian token Broadcast',
                                    // itemperpage: itemperpage,
                                    // pages: pageQty
                                });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if (datefrom && dateto) {
                db.dbs.any(q2, [datefrom,dateto,status])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada'
                        });
                    } else {
                
                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan total pemakaian token Broadcast'
                                });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else {
                db.dbs.any(q3, [status])
                .then(function (data) {
                    if (data.length == 0) { 
                        res.status(200)
                        .json({
                            status: 2,
                            data: data,
                            message: 'Data tidak ada'
                        });
                    } else {
                
                            res.status(200)
                                .json({
                                    status: 1,
                                    data: data,
                                    message: 'Berhasil menampilkan total pemakaian token Broadcast'
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

function downloadSmsTokenTotalUsage(req,res,next){
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
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            const q1 = 'SELECT c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $4 AND r.update_at :: DATE BETWEEN DATE $1 AND $2 AND m.client_id = $3';

            const q2 = 'SELECT c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $3 AND r.update_at :: DATE BETWEEN DATE $1 AND $2';

            const q3 = 'SELECT c.sender AS client, count(r.id) AS total_usage FROM sms.reports r LEFT JOIN sms.dispatches d ON r.dispatch_id = d.id LEFT JOIN sms.messages m ON d.message_id = m.id LEFT JOIN sms.clients ON m.client_id = c.id WHERE r.status = $1';

            if (client && datefrom && dateto) {
                db.dbs.any(q1, [datefrom,dateto,client,status])
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
                        let worksheet = workbook.addWorksheet(client + '_BROADCAST_TOTAL_USAGE_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Client', key: 'client'},
                            { header: 'Pemakaian Broadcast', key: 'total_usage'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_BROADCAST_TOTAL_USAGE_' + datefrom + '_to_' + dateto;

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
            } else if (datefrom && dateto) {
                db.dbs.any(q2, [datefrom,dateto,status])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_TOTAL_USAGE_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Client', key: 'client'},
                            { header: 'Pemakaian Broadcast', key: 'total_usage'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_TOTAL_USAGE_' + datefrom + '_to_' + dateto;

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
                db.dbs.any(q3, [status])
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
                        let worksheet = workbook.addWorksheet('BROADCAST_TOTAL_USAGE'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Client', key: 'client'},
                            { header: 'Pemakaian Broadcast', key: 'total_usage'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'BROADCAST_TOTAL_USAGE';

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


module.exports={
    getSmsReport:getSmsReport,
    getSmsDailyTokenUsage:getSmsDailyTokenUsage,
    getSmsTokenTotalUsage:getSmsTokenTotalUsage,
    reportCount:reportCount,
    downloadReport:downloadReport,
    downloadReportCount:downloadReportCount,
    downloadSmsDailyTokenUsage:downloadSmsDailyTokenUsage,
    downloadSmsTokenTotalUsage:downloadSmsTokenTotalUsage
}