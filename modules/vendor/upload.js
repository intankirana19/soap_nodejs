const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const multer  = require('multer');
var auth = require('../auth')


let checkUser = function(token1,token2) {
    return new Promise(function(resolve, reject) {
        const checkToken = auth.verifyToken(token1,token2);

        if (checkToken == 1) {
            resolve(1);
        }else{
            resolve(0);
        }
    });
  }

function upload(req,res){
    const token1 = req.header('authorization');
    const token2 = req.cookies['token'];

    checkUser(token1,token2).then(function(result){
        if(result == 0){
            res.status(400)
            .json({
                status: 'error',
                message: 'Not Authorized'
            });
        }else{
            var dir = 'data-temp/';
            var date = Date.now();
            var file = 'phonelist-'+date+'.csv';
            var path = dir+''+file;
            var storage =   multer.diskStorage({
                
                destination: function (req, file, callback) {
                callback(null, dir);
                },
                filename: function (req, file, callback) {
                callback(null, file.fieldname + '-' + date+'.csv');
                    
                }
            });

            var upload = multer({ storage : storage}).single('phonelist');
            
            upload(req,res,function(err) {
                if(err) {
                    res.status(400)
                    .json({
                        status: 'error',
                        message: 'Error uploading file'
                    })
                }else{
                    let inputStream = Fs.createReadStream(path, 'utf8');
                    var phoneNumber = [];
                    inputStream
                    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
                    .on('data', function (row) {
                        phoneNumber.push(row.toString());
                    })
                    .on('end', function (data) {
                        // console.log(phoneNumber)
                        try {
                            Fs.unlinkSync(path);
                            res.status(200)
                            .json({
                                status: 'success',
                                message: `Successfully add ${phoneNumber.length} Phone Number`
                            });
                        } catch(err) {
                            res.status(400)
                            .json({
                                status: 'error',
                                message: err
                            });
                        }
                    });
                }
            });  
        }
    }) 
}


module.exports = {
    checkUser:checkUser,
    upload:upload
}
