"use strict";
var crypto = require("crypto");
const db = require('../config/db');
const jwt = require('jsonwebtoken');

    const keys = new Buffer.from('MitraBizKey17088');
    const ivs = new Buffer('MitraBizInitssss');
    const jwtKey = 'MitraBizKey17088'
    const jwtExpirySeconds = 300

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
        console.log(req.body.username);
        console.log(req.body.password)
        var password = encrypt(req.body.password);
        console.log(password)
        db.dbs.one('select * from accounts where username = $1 and password = $2', [req.body.username, password])
        .then(function (data) {
           
            //console.log(data)
            if(data.length !=0){
                const token = jwt.sign({
                    data: data
                }, jwtKey, { expiresIn: '1h' });
              //  console.log(token)
                res.cookie('token', token, { maxAge: 900000, httpOnly: true });
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
        // var data = jwt.verify(token, jwtKey);
        // const user = data.data.username;
        // const password = data.data.password;
        var tokenOne = jwt.verify(token1, jwtKey, (err, verifiedJwt) => {
            if(err){
               // console.log(err)
                return '0';
             // res.send(err.message)
            }else{
               // console.log('this',verifiedJwt)
                return '1';
             // res.send(verifiedJwt)
            }
        });
        var tokenTwo = jwt.verify(token2, jwtKey, (err, verifiedJwt) => {
            if(err){
               // console.log(err)
                return '0';
             // res.send(err.message)
            }else{
               // console.log('this',verifiedJwt)
                return '1';
             // res.send(verifiedJwt)
            }
        });

       // console.log(tokenOne);
        //console.log(tokenTwo);
        if(tokenOne == 1 && tokenTwo == 1){
            return 1;
        }else{
            return 0;
        }

    }

   



    

module.exports = {
    encrypt:encrypt,
    decrypt:decrypt,
    checkUser:checkUser,
    verifyToken:verifyToken
}