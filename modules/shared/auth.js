"use strict";
var crypto = require("crypto");
const db = require('../../config/db');
const jwt = require('jsonwebtoken');

    const keys = new Buffer.from('MitraBizKey17088');
    const ivs = new Buffer('MitraBizInitssss');
    const jwtKey = 'MitraBizKey17088'

    function getAlgorithm() {

        var key = Buffer.from(keys, 'base64');
        switch (key.length) {
            case 16:
                return 'aes-128-cbc';
            case 32:
                return 'aes-256-cbc';   
        }   
        throw new Error('Invalid key length: ' + key.length);
    }

    function encrypt(plainText) {

        var key = Buffer.from(keys, 'base64');
        var iv = Buffer.from(ivs, 'base64');
    
        var cipher = crypto.createCipheriv(getAlgorithm(keys), key, iv);
        let cip = cipher.update(plainText, 'utf8', 'base64')
        cip += cipher.final('base64');
        return cip;
    };
    
    function decrypt (messagebase64) {
        var key = Buffer.from(keys, 'base64');
        var iv = Buffer.from(ivs, 'base64');   
        var decipher = crypto.createDecipheriv(getAlgorithm(keys), key, iv);
        let dec = decipher.update(messagebase64, 'base64');
        dec += decipher.final();
        return dec;
    }

    function checkUser(req,res,next){
        var password = encrypt(req.body.password);
        const email = req.body.email;

        const q1 = 'select a.id, username, a.password, job_position, role_id, r.is_internal AS internal, r.name AS role, client_id, c.name AS client, a.create_at, a.update_at, a.email, a.is_active, a.is_delete from sms.accounts a left join sms.roles r on a.role_id = r.id left join sms.clients c on a.client_id = c.id where a.email = $1 and a.password = $2';

        const q2 = 'SELECT sender FROM sms.clients WHERE id = $1';
        
        const q3 = 'INSERT INTO sms.logs (name, account_id) VALUES ($1, $2)';

        db.dbs.tx(async t => {
            const data = await t.one(q1, [email, password]);
            
            if (data.is_active === false || data.is_delete === true) {
                res.status(200)
                .json({
                    status: 3,
                    message: 'Akun telah dinon-aktifkan'
                });
            } else if(data.length !=0){
                const token = jwt.sign({
                    data: data
                }, jwtKey, { expiresIn: '24h' });
                //console.log(data)
                const c = await t.one(q2, [data.client_id]);
                const log = "Log In" + " - " + c.sender + " - " + data.username;
                await t.none(q3, [log, data.id]);
                res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
                res.status(200)
                .json({
                    status: 1,
                    token: token
                })
                
            } else{
                //console.log('fdafdaf')
                // res.status(200)
                // .json({
                //     status: 2,
                //     message: 'Invalid Username or Password'
                // });
            }
        })
        .then(() => {

            

        })
        .catch(error => {            
            if(error.code===0){
            res.status(200)
                .json({
                    status: 2,
                    message: 'Invalid Username or Password'
                })
            }
        });

    }

    function verifyToken(token1){
        var tokenOne = jwt.verify(token1, jwtKey, (err, verifiedJwt) => {
            
            //console.log(err)
            if(err){
                const data = {
                    code : 0,
                    user : ''
                }
                return data;
            }else{
                // if(verifiedJwt.data.role_id == 1 || verifiedJwt.data.role_id == 2 ){
                    const data = {
                        code : 1,
                        user : verifiedJwt
                    }
                    return data;
                // }else{
                //     const data = {
                //         code : 0,
                //         user : ''
                //     }
                //     return data;
                // }
                
            }
        });
        // var tokenTwo = jwt.verify(token2, jwtKey, (err, verifiedJwt) => {
        //     if(err){
        //         const data = {
        //             code : 0,
        //             user : ''
        //         }
        //         return data;
        //     }else{
        //         if(verifiedJwt.data.role_id == 1 || verifiedJwt.data.role_id == 2 ){
        //             const data = {
        //                 code : 1,
        //                 user : verifiedJwt
        //             }
        //             return data;
        //         }else{
        //             const data = {
        //                 code : 0,
        //                 user : ''
        //             }
        //             return data;
        //         }
        //     }
        // });
        // if(tokenOne.code == 1 && tokenTwo.code == 1){
        //console.log(tokenOne)
        if(tokenOne.code == 1){
            return tokenOne;
        }else{
            return 0;
        }

    }

    function smsUser(){
        const base = Buffer.from(global.gConfig.api_user+':'+global.gConfig.api_password);
        const base64 = base.toString('base64');
        return base64;
    }

    
module.exports = {
    encrypt:encrypt,
    decrypt:decrypt,
    checkUser:checkUser,
    verifyToken:verifyToken,
    smsUser:smsUser
}