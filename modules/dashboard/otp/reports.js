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

function getOtpReport(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];
  
    checkUser(token1,token2).then(function(result){
        if (result == 0) {
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        } else {
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            if (status && client && datefrom && dateto) {
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $5 AND $6 AND sender = $4 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $5 AND $6 AND sender = $4 AND r.status = $3', [page,itemperpage,status,client,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $5 AND $5 AND sender = $4 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $5 AND $5 AND sender = $4 AND r.status = $3', [page,itemperpage,status,client,datefrom])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $5 AND $5 AND sender = $4 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $5 AND $5 AND sender = $4 AND r.status = $3', [page,itemperpage,status,client,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $5 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $5 AND r.status = $3', [page,itemperpage,status,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $5 AND sender = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $5 AND sender = $3', [page,itemperpage,client,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $4 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,client])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $4 AND r.status = $3', [page,itemperpage,status,client])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND r.status = $3', [page,itemperpage,status,datefrom])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND r.status = $3', [page,itemperpage,status,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND sender = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND sender = $3', [page,itemperpage,client,datefrom])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND sender = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $4 AND $4 AND sender = $3', [page,itemperpage,client,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4', [page,itemperpage,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE r.status = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,status])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE r.status = $3', [page,itemperpage,status])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,client])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $3', [page,itemperpage,client])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,datefrom])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3', [page,itemperpage,datefrom])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage,dateto])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3', [page,itemperpage,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id order by sent_date desc LIMIT $2 OFFSET $1 * $2', [page,itemperpage])
                .then(function (data) {
                    if (data.length == 0) {
                        res.status(200)
                        .json({
                            status: 'success',
                            data: data,
                            message: 'Mohon maaf laporan dengan data tersebut tidak ada.',
                            itemperpage: itemperpage,
                            pages: 0
                        });
                    } else {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id', [page,itemperpage])
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
                                    message: 'Berhasil menampilkan laporan.',
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

function reportCount(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];
  
    checkUser(token1,token2).then(function(result){
        if (result == 0) {
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        } else {
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            if (status && client && datefrom && dateto) {
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND sender = $2 AND r.status = $1', [status,client,datefrom,dateto])
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
                
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 AND sender = $2 AND r.status = $1', [status,client,datefrom])
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
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 AND sender = $2 AND r.status = $1', [status,client,dateto])
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
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $3 AND r.status = $1', [status,datefrom,dateto])
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
                
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $3 AND sender = $1', [client,datefrom,dateto])
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
                
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $1 AND r.status = $1', [status,client])
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
              
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND r.status = $1', [status,datefrom])
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
                
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND r.status = $1', [status,dateto])
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
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND sender = $1', [client,datefrom])
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
                                    message: 'Berhasil menampilkan laporan.',
                                    itemperpage: itemperpage,
                                    pages: pageQty
                                });
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (client && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND sender = $1', [client,dateto])
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
                                    message: 'Berhasil menampilkan laporan.',
                                    itemperpage: itemperpage,
                                    pages: pageQty
                                });
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (datefrom && dateto) {
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $1 AND $2', [datefrom,dateto])
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
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE r.status = $1', [status])
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
                                    message: 'Berhasil menampilkan laporan.',
                                    itemperpage: itemperpage,
                                    pages: pageQty
                                });
                        })
                        .catch(function (err) {
                            return next(err);
                        });
                   
            } else if (client) {
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $3', [client])
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
                
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $1 AND $1', [datefrom])
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
                
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $1 AND $1', [dateto])
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
               
                        db.dbs.any('SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id')
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

function downloadOtpReport(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];

    checkUser(token1,token2).then(function(result){
        if (result == 0) {
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        } else {
            const status = req.query.status;
            const client = req.query.client;
            const datefrom = req.query.datefrom;
            const dateto = req.query.dateto;

            if (status && client && datefrom && dateto) {
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND sender = $2 AND r.status = $1 order by sent_date desc', [status,client,datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_' + status + '_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_' + status + '_LIST_' + datefrom + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 AND sender = $2 AND r.status = $1 order by sent_date desc', [status,client,datefrom])
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
                        let worksheet = workbook.addWorksheet('OTP_' + status + '_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_' + status + '_LIST_' + datefrom + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 AND sender = $2 AND r.status = $1 order by sent_date desc', [status,client,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_' + status + '_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_' + status + '_LIST_' + dateto + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $3 AND r.status = $1 order by sent_date desc', [status,datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet('OTP_' + status + '_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_' + status + '_LIST_' + datefrom + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $3 AND sender = $1 order by sent_date desc', [client,datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_LIST_' + dateto + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $2 AND r.status = $1 order by sent_date desc', [status,client])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_' + status + '_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_' + status + '_LIST';

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND r.status = $1 order by sent_date desc', [status,datefrom])
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
                        let worksheet = workbook.addWorksheet('OTP_' + status + '_LIST_' + datefrom + '_to_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_' + status + '_LIST_' + datefrom + '_to_' + datefrom;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND r.status = $1 order by sent_date desc', [status,dateto])
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
                        let worksheet = workbook.addWorksheet('OTP_' + status + '_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_' + status + '_LIST_' + dateto + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND sender = $1 order by sent_date desc', [client,datefrom])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_LIST_' + datefrom + '_to_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_LIST_' + datefrom + '_to_' + datefrom;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $2 AND $2 AND sender = $1 order by sent_date desc', [client,dateto])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_LIST_' + dateto + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_LIST_' + dateto + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $1 AND $2 order by sent_date desc', [datefrom,dateto])
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
                        let worksheet = workbook.addWorksheet('OTP_LIST_' + datefrom + '_to_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_LIST_' + datefrom + '_to_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE r.status = $1 order by sent_date desc', [status])
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
                        let worksheet = workbook.addWorksheet('OTP_' + status + '_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_' + status + '_LIST';

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sender = $1 order by sent_date desc', [client])
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
                        let worksheet = workbook.addWorksheet(client + '_OTP_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = client + '_OTP_LIST';

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $3 order by sent_date desc', [datefrom])
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
                        let worksheet = workbook.addWorksheet('OTP_LIST_' + datefrom); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_LIST_' + datefrom;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $1 AND $1 order by sent_date desc', [dateto])
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
                        let worksheet = workbook.addWorksheet('OTP_LIST_' + dateto); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_LIST_' + dateto;

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
                db.dbs.any('select sent_date, msisdn,sender,r.status,r.message FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id order by sent_date desc')
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
                        let worksheet = workbook.addWorksheet('OTP_LIST'); //creating worksheet
                        //  WorkSheet Header
                        worksheet.columns = [
                            { header: 'Tanggal', key: 'sent_date'},
                            { header: 'Pengirim', key: 'sender'},
                            { header: 'Penerima', key: 'msisdn'},
                            { header: 'Status', key: 'status'},
                            { header: 'Status_Message', key: 'message'}
                        ];
                        // Add Array Rows
                        worksheet.addRows(jsonData);

                        const fileName = 'OTP_LIST';

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

function getOtpDailyTokenUsage(req,res,next){
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

            const q1 = 'SELECT sent_date :: DATE AS date, sender as client, count(uid) AS otp_usage FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND sender = $5 AND r.status = "SENT" GROUP BY date,client ORDER BY date LIMIT $2 OFFSET $1 * $2';
            const q1c = 'SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND sender = $5 AND r.status = "SENT"';
            
            const q2 = 'SELECT sent_date :: DATE AS date, sender as client, count(uid) AS otp_usage FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND r.status = "SENT" GROUP BY date,client ORDER BY date LIMIT $2 OFFSET $1 * $2';
            const q2c = 'SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND r.status = "SENT"';
            
            const q3 = 'SELECT sent_date :: DATE AS date, sender as client, count(uid) AS otp_usage FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE r.status = "SENT" GROUP BY date,client ORDER BY date LIMIT $2 OFFSET $1 * $2';
            const q3c = 'SELECT COUNT(*) FROM otp.messages m INNER JOIN otp.reports r ON m.id = r.msg_id WHERE sent_date :: DATE BETWEEN DATE $3 AND $4 AND r.status = "SENT"';

            if (client && datefrom && dateto) {
                db.dbs.any(q1, [page,itemperpage,datefrom,dateto,client])
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
                        db.dbs.any(q1c, [page,itemperpage,datefrom,dateto,client])
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
                                    message: 'Berhasil menampilkan pemakaian token OTP harian',
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
                db.dbs.any(q2, [page,itemperpage,datefrom,dateto])
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
                        db.dbs.any(q2c, [page,itemperpage,datefrom,dateto])
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
                                    message: 'Berhasil menampilkan pemakaian token OTP harian',
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
                db.dbs.any(q3, [page,itemperpage])
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
                        db.dbs.any(q3c, [page,itemperpage])
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
                                    message: 'Berhasil menampilkan pemakaian token OTP harian',
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

function getOtpTokenTotalUsage(req,res,next){
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

            const q1 = 'SELECT COUNT(uid) AS total_usage FROM otp.messages m INNER JOIN otp.reports r on m.id = r.msg_id WHERE cast(sent_date AS date) :: DATE BETWEEN DATE $1 AND $2 AND sender = $3 AND r.status = "SENT"';
            
            const q2 = 'SELECT COUNT(uid) AS total_usage FROM otp.messages m INNER JOIN otp.reports r on m.id = r.msg_id WHERE cast(sent_date AS date) :: DATE BETWEEN DATE $1 AND $2 AND r.status = "SENT"';
            
            const q3 = 'SELECT COUNT(uid) AS total_usage FROM otp.messages m INNER JOIN otp.reports r on m.id = r.msg_id WHERE r.status = "SENT"';

            if (client && datefrom && dateto) {
                db.dbs.any(q1, [datefrom,dateto,client])
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
                                    message: 'Berhasil menampilkan total pemakaian token OTP'
                                });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else if (datefrom && dateto) {
                db.dbs.any(q2, [datefrom,dateto])
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
                                    message: 'Berhasil menampilkan total pemakaian token OTP'
                                });
                    }
                })
                .catch(function (err) {
                    return next(err);
                });
            } else {
                db.dbs.any(q3)
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
                                    message: 'Berhasil menampilkan total pemakaian token OTP'
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
    getOtpReport:getOtpReport,
    getOtpDailyTokenUsage:getOtpDailyTokenUsage,
    getOtpTokenTotalUsage:getOtpTokenTotalUsage,
    downloadOtpReport:downloadOtpReport,
    reportCount:reportCount
}