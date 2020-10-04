"use strict";

var soap = require('strong-soap').soap;


    function checkUser(req,res,next){
        var password = req.body.password;
        const username = req.body.username;

        var requestArgs = {
            username: username,
            pass: password
        };

        var options = {};
        soap.createClient(global.gConfig.wsdl, options, function(err, client) {
            var method = client['CheckUser'];
            method(requestArgs, function(err, result, envelope, soapHeader) {
                //response envelope
                // console.log('Response Envelope: \n' + envelope);
                //'result' is the response body
                // console.log('Result: \n' + JSON.stringify(result));
                const rs = JSON.stringify(result);
                const r = JSON.parse(rs);

                if (err) {
                    return next(err);
                } else if (r.CheckUserResult === "0") {
                    res.status(200)
                    .json({
                        status: 1,
                        message: 'Berhasil Login.'
                    });
                } else {
                    res.status(200)
                    .json({
                        status: 2,
                        message: 'Username atau Password Salah.'
                    });
                }
            });
        });

    }


module.exports = {
    checkUser:checkUser,
}