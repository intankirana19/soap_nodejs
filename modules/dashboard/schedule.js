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
            var page = req.query.page -1;
            var itemperpage = req.query.itemperpage;

            if (status && client && datefrom && dateto) {
                db.dbs.any('SELECT * FROM sms.schedules WHERE status = $1 AND client_id = $2 AND create_at :: DATE BETWEEN DATE $3 AND $4 ORDER BY create_at desc LIMIT $6 OFFSET $5 * $6', [status,client,datefrom,dateto,page,itemperpage])
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
                        db.dbs.any('SELECT COUNT(*) FROM sms.schedules WHERE status = $1 AND client_id = $2 AND create_at :: DATE BETWEEN DATE $3 AND $4', [status,client,datefrom,dateto,page,itemperpage])
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
                
            } else if (client && datefrom && dateto) {
                
            } else if (status && client) {
                
            } else if (datefrom && dateto) {
                
            } else if (status) {
                
            } else if (client) {
                
            } else {
                
            }

            
        }
    });
}