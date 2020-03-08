const request = require('request-promise');
var auth = require('../shared/auth');

function sendSMS(req,res){
  let user64 = auth.smsUser();

  var formData = {
    sender : 'MD Media',
    message: 'test sms',
    msisdn: '081973290873',

  };
  request.post({url: global.gConfig.api_reg+'sendsms.json',headers: {'Authorization': 'Basic '+ user64}, form: formData}, function optionalCallback(err, httpResponse, body) {
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


module.exports = {
  sendSMS:sendSMS
}