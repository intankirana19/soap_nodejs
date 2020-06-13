const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const multer  = require('multer');
var auth = require('../shared/auth');
const db = require('../../config/db');
const request = require('request-promise');

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

function scheduleMultiple(req,res, next){
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

            var dir = 'data-temp/';
            var date = Date.now();
            var file = 'phonelist-'+date+'.csv';
            var path = dir+''+file;
            var storage =   multer.diskStorage({

                destination: function (req, file, callback) {
                callback(null, dir);
                },
                filename: function (req, file, callback) {
                callback(null, file.fieldname + '-' + date +'.csv');

                }
            });

            var upload = multer({ storage : storage}).single('phonelist');

            upload(req,res,function(err) {
                if(err) {
                    res.status(400)
                    .json({
                        status: 'error',
                        message: 'Error uploading file'
                    })
                }else{
                    let inputStream = Fs.createReadStream(path, 'utf8');
                    var phoneNumber = [];
                    inputStream
                    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
                    .on('data', function (row) {
                        // console.log(row);
                        phoneNumber.push(row.toString());
                    })
                    .on('end', function (data) {
                        // console.log(phoneNumber);
                        db.dbs.tx(async t => {
                            var msg_id = req.body.msg_id;
                            const send_date = req.body.send_date;

                            const client = await t.one('select sender from sms.clients where id = $1', [result.client_id]);

                            const message = await t.one('select text from sms.messages where id = $1', [msg_id]);

                            var d = new Date();
                            var r = ((1 + (Math.floor(Math.random() * 2))) * 10000 + (Math.floor(Math.random() * 10000))).toString();
                            var date = ("0" + d.getDate()).slice(-2).toString();
                            var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                            var mmdd = month + date;
                            var schuid = "50" + mmdd + r;

                            await t.none('insert into sms.schedules (schuid,message,msisdn,send_date,send_via,status,client_id) values ($1,$2,$3,$4,$5,$6,$7)', [schuid, message.text, phoneNumber, send_date, 1, 1, result.client_id]);
                            const batch = await t.one('insert into sms.phone_batches (client_id) values ($1) RETURNING id', [result.client_id], b => b.id);

                            for (i = 0; i < phoneNumber.length; i++) {
                                await t.none('insert into sms.phone_containers (phone,client_id,batch_id) values ($1,$2,$3)', [phoneNumber[i], result.client_id, batch]);
                            }

                            const log = "Schedule Multiple Broadcast" + " - " + client.sender + " - " + result.username;
                            await t.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                        })
                        .then(() => {
                            Fs.unlinkSync(path);
                            res.status(200)
                            .json({
                                status: 'success',
                                message: `Successfully schedule ${phoneNumber.length} receipients Broadcast`
                            });
                        })
                        .catch(error => {
                            return next(error);
                        });

                    });
                }
            });
        }
    });
}

function sendMultiple(req,res, next){
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

            var dir = 'data-temp/';
            var date = Date.now();
            var file = 'phonelist-'+date+'.csv';
            var path = dir+''+file;
            var storage =   multer.diskStorage({

                destination: function (req, file, callback) {
                callback(null, dir);
                },
                filename: function (req, file, callback) {
                callback(null, file.fieldname + '-' + date +'.csv');

                }
            });

            var upload = multer({ storage : storage}).single('phonelist');

            upload(req,res,function(err) {
                if(err) {
                    res.status(400)
                    .json({
                        status: 'error',
                        message: 'Error uploading file'
                    })
                }else{
                    let inputStream = Fs.createReadStream(path, 'utf8');
                    var phoneNumber = [];
                    inputStream
                    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
                    .on('data', function (row) {
                        // console.log(row);
                        phoneNumber.push(row.toString());
                    })
                    .on('end', function (data) {
                        // console.log(phoneNumber);
                        db.dbs.task(async t => {
                            var msg_id = req.body.msg_id;

                            const client = await t.one('select sender from sms.clients where id = $1', [result.client_id]);

                            const message = await t.one('select text from sms.messages where id = $1', [msg_id]);

                            const batch = await t.one('insert into sms.phone_batches (client_id) values ($1) RETURNING id', [result.client_id], b => b.id);

                            const dispatch = await t.one('insert into sms.dispatches (message_id) values ($1) RETURNING id', [msg_id], a => a.id);

                            const token = await t.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[result.client_id]);
                            const tkn = token.amount;

                            if (tkn > 0) {
                                const log = "Send Multiple Broadcast" + " - " + client.sender + " - " + result.username;
                                await t.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                            }

                            for (i = 0; i < phoneNumber.length; i++) {

                                await t.none('insert into sms.phone_containers (phone,client_id,batch_id) values ($1,$2,$3)', [phoneNumber[i], result.client_id, batch]);

                                const token = await t.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[result.client_id]);
                                const tkn = token.amount;

                                if (tkn === 0) {
                                    res.status(400)
                                    .json({
                                        status: 'failed',
                                        message: 'Token Habis. Silahkan Top Up.'
                                    });
                                } else {
                                    let user64 = auth.smsUser();
                                    if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
                                        var sender = 'MD Media';
                                    } else if(global.gConfig.config_id == 'production'){
                                        var sender = client.sender;
                                    }
    
                                    var formData = {
                                        sender : sender,
                                        message: message.text,
                                        msisdn: phoneNumber[i],
                                    };
    
                                    request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
                                        if (err) {
                                            res.status(400)
                                                .json({
                                                    status: 'error',
                                                    message: err
                                                });
                                        } else{
                                            const resp = JSON.parse(body);
                                            console.log(resp);
    
                                            if (resp.code === 1) {
                                                db.dbs.tx(async t1 => {
    
                                                    const d = new Date();
                                                    var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
                                                    var date = ("0" + d.getDate()).slice(-2).toString();
                                                    var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                                                    var ddmm = date + month;
                                                    var rptuid = ddmm + r;
    
                                                    await t1.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, phoneNumber[i], resp.status, resp.message, dispatch]);
    
                                                    var tokenRemain = tkn - 1;
                                                    await t1.none('UPDATE sms.tokens SET amount = $1 WHERE client_id = $2',[tokenRemain, result.client_id]);
    
                                                })
                                                .then(() => {
                                                    Fs.unlinkSync(path);
                                                    res.status(200)
                                                    .json({
                                                        status: 'success',
                                                        message: `Processing broadcast to ${phoneNumber.length} receipients`
                                                    });
                                                })
                                                .catch(error => {
                                                    return next(error);
                                                });
                                            } else {
                                                db.dbs.tx(async t1 => {
    
                                                    const d = new Date();
                                                    var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
                                                    var date = ("0" + d.getDate()).slice(-2).toString();
                                                    var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                                                    var ddmm = date + month;
                                                    var rptuid = ddmm + r;
    
                                                    await t1.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, phoneNumber[i], resp.status, resp.message, dispatch]);
    
                                                })
                                                .then(() => {
                                                    Fs.unlinkSync(path);
                                                    res.status(200)
                                                    .json({
                                                        status: 'success',
                                                        message: `Processing broadcast to ${phoneNumber.length} receipients`
                                                    });
                                                })
                                                .catch(error => {
                                                    return next(error);
                                                });
                                            }
                                        }
                                    });
                                }

                            }

                        });

                    });
                }
            });
        }
    });
}

function upload(req,res){
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
            var dir = 'data-temp/';
            var date = Date.now();
            var file = 'phonelist-'+date+'.csv';
            var path = dir+''+file;
            var storage =   multer.diskStorage({

                destination: function (req, file, callback) {
                callback(null, dir);
                },
                filename: function (req, file, callback) {
                callback(null, file.fieldname + '-' + date +'.csv');

                }
            });

            var upload = multer({ storage : storage}).single('phonelist');

            upload(req,res,function(err) {
                if(err) {
                    res.status(400)
                    .json({
                        status: 'error',
                        message: 'Error uploading file'
                    })
                }else{
                    let inputStream = Fs.createReadStream(path, 'utf8');
                    var phoneNumber = [];
                    inputStream
                    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
                    .on('data', function (row) {
                        // console.log(row);
                        phoneNumber.push(row.toString());
                    })
                    .on('end', function (data) {
                        // console.log(phoneNumber);
                        try {
                            Fs.unlinkSync(path);
                            res.status(200)
                            .json({
                                status: 'success',
                                message: `Successfully add ${phoneNumber.length} Phone Number`
                            });
                        } catch(err) {
                            res.status(400)
                            .json({
                                status: 'error',
                                message: err
                            });
                        }
                    });
                }
            });
        }
    });
}


module.exports = {
    upload:upload,
    scheduleMultiple:scheduleMultiple,
    sendMultiple:sendMultiple
}
