


var commons = {};
var ObjectId = require('mongoose').Types.ObjectId;
var nodemailer = require('nodemailer');
var fs = require('fs')
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dyzjcvisn', 
  api_key: '799753188554461', 
  api_secret: 'UV8rnNWOmXuVyOcqahqHl1jwcEc' 
});
// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'sunilmore690@gmail.com',
//         pass: 'anil_sharad90'
//     }
// });
var AWS = require('aws-sdk');
AWS.config.update({ httpOptions: { proxy: 'http://localhost:8080' }});
var s3bucket = new AWS.S3({accessKeyId: 'C7E9022B69DCE2D2C04299441C0FCCE9', secretAccessKey: '8b161b186a2c0a8698fd3ce29238e8ea25aa5284',
  endpoint: 'http://rest.s3for.me'});
var transporter = nodemailer.createTransport('smtps://sunilmore690%40zoho.com:sunil_more90@smtp.zoho.com');

commons.sendMail = function(message,callback){
  message.from = 'NoteStickAndShare <sunilmore690@zoho.com>'
  console.log('message',message)
  transporter.sendMail(message, 
 	  function (error, success) {
      if (error){
        // not much point in attempting to send again, so we give up
        // will need to give the user a mechanism to resend verification
        console.error("Unable to send via Prodonus: " , error.message);
        callback("failure");
      }else{
       callback("success"); 
      }
      //sending succussful then success
      
    });
};
commons.isOBjectId = function(id){
 return ObjectId.isValid(id); //true

}
commons.isLoggedin = function(req,res,next){
  if (req.isAuthenticated()) res.json(req.user)
  else return next({code:401,message:'Please Login to continue'})
}

 commons.fileUpload = function(req,res,next){ 
  console.log('req files',req.files)
  var filekey = req.query.filekey;
  var filePath = req.files[filekey].path;
  var filename = req.files[filekey].originalFilename;
  var fileData = fs.readFileSync(filePath);
  var contentType = req.files[filekey].headers['content-type'];
  fs.unlinkSync(filePath);
  cloudinary.uploader.upload(
    filePath,
    function(result) { 
     console.log('result',result)
     res.send(result);

    },
    {
      public_id: 'sample_id', 
      crop: 'limit',
      width: 2000,
      height: 2000,
      eager: [
        { width: 200, height: 200, crop: 'thumb', gravity: 'face',
          radius: 20, effect: 'sepia' },
        { width: 100, height: 150, crop: 'fit', format: 'png' }
      ],                                     
      tags: ['special', 'for_homepage']
    }      
  )

  //       //Upload file to AWS S3 bucket.
  // var bucketFolder, params;
  // bucketFolder = 'notestickandshare/notes'


  // params = {
  //   Bucket: bucketFolder,
  //   Key: filename,
  //   Body: fileData,
  //   ACL: 'public-read',
  //   ContentType: contentType
  // };
  // s3bucket.putObject(params, function(err, data) {
  //    console.log('Callng to er',err)
  //   if (err) return next(err)
  //   if (data) {
  //     var params1 = {
  //       Bucket: params.Bucket,
  //       Key: params.Key,
  //       // Expires: 60 * 60 * 24 * 365
  //     };
  //     console.log('Callng to eafter')
  //     s3bucket.getSignedUrl('getObject', params1, function(err, url) {
  //       if (err) return next(err)
  //       else  res.send(url);
  //     })
  //   }
  // })
  }
module.exports = commons;