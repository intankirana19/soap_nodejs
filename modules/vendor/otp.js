
const request = require('request-promise');
const db = require('../../config/db');
var auth = require('../shared/auth');

let checkUser = function(token1,token2) {
  return new Promise(function(resolve, reject) {
      const checkToken = auth.verifyToken(token1,token2);
      //console.log(checkToken)
      if (checkToken.code == 1) {
          resolve(checkToken.user.data);
      }else{
          resolve(0);
      }
  });
}

function checkToken(req,res,next){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];
  
    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(401)
            .json({
                status: 'error',
                message: 'Not Authorized, Please RE-LOGIN'
            });
        }else{
          var param = {
            username : 'brainworxpremium',
            password: 'V36x6p37'
  
          };
          request.post({url: global.gConfig.api_token+'token.json',formData: param}, function optionalCallback(err, httpResponse, body) {
            if (err) {
              res.status(400)
                    .json({
                        status: 'error',
                        message: err
                    });
            }else{
              res.status(200)
              .json({
                  status: 'success',
                  message: JSON.parse(body)
              });
            }
          });
        }
      });
  }


  module.exports = {
    checkToken:checkToken
  }