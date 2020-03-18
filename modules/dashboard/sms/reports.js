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
    const status = req.query.status;
    const client = req.query.client;
    const datefrom = req.query.datefrom;
    const dateto = req.query.dateto;
    var page = req.query.page -1;
    var itemperpage = req.query.itemperpage;

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
        }
    });
}

function downloadReport(req,res){

}


module.exports={
    getSmsReport:getSmsReport
}