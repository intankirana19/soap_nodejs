const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const multer  = require('multer');
var auth = require('../shared/auth');
const db = require('../../config/db');


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

                            const schedule = await t.one('insert into sms.schedules (schuid,message,msisdn,send_date,send_via,status,client_id) values ($1,$2,$3,$4,$5,$6,$7) RETURNING id', [schuid, message.text, phoneNumber, send_date, 1, 1, result.client_id], a => a.id);

                            for (i = 0; i < phoneNumber.length; i++) {
                                await t.none('insert into sms.phone_containers (phone,client_id,schedule_id) values ($1,$2,$3)', [phoneNumber[i], result.client_id, schedule]);
                            }

                            const log = "Schedule Broadcast" + " - " + client.sender + " - " + result.username;
                            await t.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                        })
                        .then(() => {
                            Fs.unlinkSync(path);
                            res.status(200)
                            .json({
                                status: 'success',
                                message: `Successfully add ${phoneNumber.length} Phone Number`
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
                        for (i = 0; i < phoneNumber.length; i++) {
                            
                        }
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
    }) 
}


module.exports = {
    upload:upload,
    scheduleMultiple:scheduleMultiple
}
