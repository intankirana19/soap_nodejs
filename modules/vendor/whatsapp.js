const request = require('request-promise');
const db = require('../../config/db');
var auth = require('../shared/auth');
const jwt = require('jsonwebtoken');

let checkUser = function(token1) {
  return new Promise(function(resolve, reject) {
      const checkToken = auth.verifyToken(token1);
      //console.log(checkToken)
      if (checkToken.code == 1) {
          resolve(checkToken.user.data);
      }else{
          resolve(0);
      }
  });
}


function inbound(req,res,next){
  var inboundData = req.body;
  console.log('inbound',inboundData)
  
}

function status(req,res,next){
  var statusData = req.body;
  console.log('status', statusData)
}

module.exports = {
  inbound:inbound,
  status:status
}