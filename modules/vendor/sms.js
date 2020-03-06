const request = require('request-promise');
var auth = require('../auth');

function sendSMS(req,res){
  let user64 = auth.smsUser();
  console.log(user64)
  console.log(global.gConfig.api_reg);
//   var options = {
//     method: 'POST',
//     uri: global.gConfig.api_reg+'sendsms',
//     headers: {
//       'Authorization': 'Basic '+user64
//     },
//     body: {
//       sender: 'Sanbox user',
//       msisdn: '081973290873',
//       message: 'test sms fkldafdahflkdhalfhda'
//     },
//     json: true
//   };
//    console.log(options)
//   request(options)
//   .then(function (response) {
//     console.log(response);
//   });
// }
// console.log('eXB0cmlhbDpEQURJMTVkTA==')
var formData = {
  // Pass a simple key-value pair
  username: 'yptrial',
  password: 'DADI15dL',
  sender : 'test',
  message: 'test sms',
  msisdn: '081973290873',

};
request.post({url:'https://api.smsblast.id/v2/reg/sendsms',headers: {'Authorization': 'Basic '+ user64}, formData: formData}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('send failed:', err);
  }
  console.log('Sent successful!  Server responded with:', body);
});
}

// var formData = {
//   // Pass a simple key-value pair
//   username: 'getplus-su',
//   password: 'getplusBwx',
//   message: message,
//   msisdn: '081973290873',

// };
// request.post({url:'http://api.mitrabiz.id:8080/mitraBizSmsV3/api/send_single', formData: formData}, function optionalCallback(err, httpResponse, body) {
//   if (err) {
//     return console.error('send failed:', err);
//   }
//   console.log('Sent successful!  Server responded with:', body);
// });

module.exports = {
  sendSMS:sendSMS
}