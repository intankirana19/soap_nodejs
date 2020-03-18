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

    function checkUser(req,res){
        var password = encrypt(req.body.password);
        db.dbs.one('select * from sms.accounts where username = $1 and password = $2', [req.body.username, password])
        .then(function (data) {
            if(data.length !=0){
                const token = jwt.sign({
                    data: data
                }, jwtKey, { expiresIn: '24h' });
            
                res.cookie('token', token, { maxAge: 3600000, httpOnly: true });
                res.status(200)
                .json({
                    status: 'success',
                    token: token
                }).end();
                
            }else{
                res.status(400)
                .json({
                    status: 'error',
                    message: 'Invalid Username or Password'
                })  
            }
        })

    }

    function verifyToken(token1,token2){
        var tokenOne = jwt.verify(token1, jwtKey, (err, verifiedJwt) => {
            

            if(err){
                const data = {
                    code : 0,
                    user : ''
                }
                return data;
            }else{
                if(verifiedJwt.data.role_id == 1 || verifiedJwt.data.role_id == 2 ){
                    const data = {
                        code : 1,
                        user : verifiedJwt
                    }
                    return data;
                }else{
                    const data = {
                        code : 0,
                        user : ''
                    }
                    return data;
                }
                
            }
        });
        var tokenTwo = jwt.verify(token2, jwtKey, (err, verifiedJwt) => {
            if(err){
                const data = {
                    code : 0,
                    user : ''
                }
                return data;
            }else{
                if(verifiedJwt.data.role_id == 1 || verifiedJwt.data.role_id == 2 ){
                    const data = {
                        code : 1,
                        user : verifiedJwt
                    }
                    return data;
                }else{
                    const data = {
                        code : 0,
                        user : ''
                    }
                    return data;
                }
            }
        });
        if(tokenOne.code == 1 && tokenTwo.code == 1){
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