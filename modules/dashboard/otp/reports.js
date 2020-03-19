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

function getOtpReport(req,res,next){
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
        }
    });

}

function downloadOtpReport(req,res){

}


module.exports={
    getOtpReport:getOtpReport
}