'use strict'
const db = require('../../config/db');
var auth = require('../shared/auth');
const jwt = require('jsonwebtoken');
const Nexmo = require('nexmo');
// const pk = require('./private.key');

// const pvString = toString(process.env.PRIVATE_KEY);
// var buf = Buffer.from(pvString);

// const nexmo = new Nexmo({
//     apiKey: process.env.API_KEY,
//     apiSecret: process.env.API_SECRET,
//     applicationId: process.env.APP_ID,
//     privateKey: pk
// }, {
//     apiHost: 'https://messages-sandbox.nexmo.com/v0.1/messages'
// });


const NEXMO_API_KEY='6ba6507b'
const NEXMO_API_SECRET='LXMtE1dA1rdeOcjz'
const NEXMO_NUMBER='14157386170'
const NEXMO_APPLICATION_PRIVATE_KEY_PATH='private.key'
const NEXMO_APPLICATION_ID='fd75a58b-3289-4bad-953a-9cca027d8133'

const nexmo = new Nexmo(
    {
        apiKey: NEXMO_API_KEY,
        apiSecret: NEXMO_API_SECRET,
        applicationId: NEXMO_APPLICATION_ID,
        privateKey: NEXMO_APPLICATION_PRIVATE_KEY_PATH
    },
    {
    apiHost: 'https://messages-sandbox.nexmo.com/v0.1/messages'

    },
    {
        debug:true
    }
);


function sendTextMessage(req,res,next){
    // const token1 = req.header('authorization');
    // const token2 = req.cookies['token'];

    // checkUser(token1).then(function(result){
    //     if(result == 0){
    //         res.status(400)
    //         .json({
    //             status: 'error',
    //             message: 'Not Authorized, Please RE-LOGIN'
    //         });
    //     }else{
            const number = req.body.number;
            const message = req.body.message;
            

            nexmo.channel.send(
                { "type": "whatsapp", "number": number },
                { "type": "whatsapp", "number": NEXMO_NUMBER },
                {
                    "content": {
                    "type": "text",
                    "text": message
                    }
                },
                (err, data) => {
                    if (err) {
                    console.error(err);
                    } else {
                    console.log(data.message_uuid);
                    }
                }
            );
    //     }
    // });
}

module.exports = {
    sendTextMessage:sendTextMessage,
}

// const request = require('request-promise');
// const db = require('../../config/db');
// var auth = require('../shared/auth');
// const jwt = require('jsonwebtoken');

// let checkUser = function(token1) {
//   return new Promise(function(resolve, reject) {
//       const checkToken = auth.verifyToken(token1);
//       //console.log(checkToken)
//       if (checkToken.code == 1) {
//           resolve(checkToken.user.data);
//       }else{
//           resolve(0);
//       }
//   });


// function inbound(req,res,next){
//   var inboundData = req.body;
//   console.log('inbound',inboundData)
  
// }

// function status(req,res,next){
//   var statusData = req.body;
//   console.log('status', statusData)
// }

// module.exports = {
//   inbound:inbound,
//   status:status
// }