"use strict";

var soap = require('strong-soap').soap;


    function levelList(res,next){

        var requestArgs = {
        };

        var options = {};
        soap.createClient(global.gConfig.wsdl, options, function(err, client) {
            var method = client['UserLevelList'];
            method(requestArgs, function(err, result, envelope, soapHeader) {
                //response envelope
                // console.log('Response Envelope: \n' + envelope);
                //'result' is the response body
                // console.log('Result: \n' + JSON.stringify(result));
                const rs = JSON.stringify(result);
                const r = JSON.parse(rs);

                if (err) {
                    return next(err);
                } else {
                    res.status(200)
                    .json({
                        status: 1,
                        message: r
                    });
                }
            });
        });

    }


module.exports = {
    levelList:levelList,
}