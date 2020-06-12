"use strict";

const db = require('../../../config/db');

const cron = require('node-cron');

const nodesch = require('node-schedule');

// Multiple Broadcast Scheduler
db.dbs.any('select * from sms.schedules')
.then(function (schedule) {
    // const schedule = await t.any('select * from sms.schedules');

    const time = new Date(schedule.send_date);

    nodesch.scheduleJob(time, function(){
        // const client = await t.one('select sender from sms.clients where id = $1', [schedule.client_id]);

        db.dbs.one('select sender from sms.clients where id = $1', [result.client_id])
        .then(function (client) {
            const phoneNumber = schedule.msisdn;
            for (i = 0; i < phoneNumber.length; i++) {
                    let user64 = auth.smsUser();
                    if(global.gConfig.config_id == 'local' || global.gConfig.config_id == 'development'){
                        var sender = 'MD Media';
                    }else if(global.gConfig.config_id == 'production'){
                        var sender = client.sender;
                    }

                    var formData = {
                        sender : sender,
                        message: schedule.message,
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
                                const dispatch = await t1.one('insert into sms.dispatches (message_id) values ($1) RETURNING id', [msg_id], a => a.id);

                                const d = new Date();
                                var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
                                var date = ("0" + d.getDate()).slice(-2).toString();
                                var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                                var ddmm = date + month;
                                var rptuid = ddmm + r;

                                await t1.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, msisdn, resp.status, resp.message, dispatch]);

                                const token = await t1.one('SELECT amount FROM sms.tokens WHERE client_id = $1',[result.client_id]);
                                var tkn = new Number(token.amount);
                                var tokenRemain = tkn - 1;
                                await t1.none('UPDATE sms.tokens SET amount = $1 WHERE client_id = $2',[tokenRemain, result.client_id]);

                                const log = "Send Message(" + resp.status + ") - " + client.sender + " - " + result.username;
                                await t1.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                            })
                            .then(() => {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    message: 'Pesan berhasil terkirim.'
                                });
                            })
                            .catch(error => {
                                return next(error);
                            });
                            } else {
                                db.dbs.tx(async t1 => {
                                const dispatch = await t1.one('insert into sms.dispatches (message_id) values ($1) RETURNING id', [msg_id], a => a.id);

                                const d = new Date();
                                var r = ((1 + (Math.floor(Math.random() * 2))) * 100000 + (Math.floor(Math.random() * 100000))).toString();
                                var date = ("0" + d.getDate()).slice(-2).toString();
                                var month = ("0" + (d.getMonth() + 1)).slice(-2).toString();
                                var ddmm = date + month;
                                var rptuid = ddmm + r;

                                await t1.none('insert into sms.reports (rptuid, msgid, msisdn, status, message, dispatch_id) values ($1, $2, $3, $4, $5, $6)', [rptuid, resp.msgid, msisdn, resp.status, resp.message, dispatch]);
                                // const log = "Send Message(" + resp.status + ") - " + client.sender + " - " + result.username;
                                // await t1.none('INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)', [log, result.id]);
                                })
                                .then(() => {
                                res.status(200)
                                .json({
                                    status: 'failed',
                                    message: 'Pesan gagal terkirim.'
                                });
                                })
                                .catch(error => {
                                    return next(error);
                                });
                            }
                            }
                        });

            }
        });
    });

});