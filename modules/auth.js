"use strict";
var crypto = require("crypto");
const db = require('../config/db');
const jwt = require('jsonwebtoken');

    const keys = new Buffer.from('GJKIKey230720');
    const ivs = new Buffer('GJKIInitssss');
    const jwtKey = 'GJKIKey230720'

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

        db.dbs.tx(async t => {
            const data = await t.one('SELECT a.id, a.member_id, m.name, m.nickname, m.gender, m.group, a.username, a.e-mail, a.role_id, r.name , a.is_admin, a.is_active, a.is_delete FROM accounts a LEFT JOIN roles r ON a.role_id = r.id LEFT JOIN members m ON a.member_id = m.id WHERE a.email = $1 AND a.password = $2', [email, password]);

            if (data.is_active === false || data.is_delete === true) {
                res.status(200)
                .json({
                    status: 3,
                    message: 'Akun telah dinon-aktifkan atau dihapus'
                });
            } else if(data.length !=0){
                if (data.is_admin === true) {
                    const token = jwt.sign({
                        data: data
                    }, jwtKey, { expiresIn: '24h' });
                    //console.log(data)

                    const log = "Admin Log In" + " - " + data.nickname;
                    await t.none('INSERT INTO sms.logs (activity, account_id) VALUES ($1, $2)', [log, data.id]);
                    res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
                    res.status(200)
                    .json({
                        status: 1,
                        token: token
                    })
                } else {
                    const token = jwt.sign({
                        data: data
                    }, jwtKey, { expiresIn: '24h' });
                    //console.log(data)

                    const log = "Member Log In" + " - " + data.nickname;
                    await t.none('INSERT INTO sms.logs (activity, account_id) VALUES ($1, $2)', [log, data.id]);
                    res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
                    res.status(200)
                    .json({
                        status: 1,
                        token: token
                    })
                }

            } else{
                //console.log('fdafdaf')
                // res.status(200)
                // .json({
                //     status: 2,
                //     message: 'Invalid E-mail or Password'
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
                    message: 'Invalid E-mail or Password'
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