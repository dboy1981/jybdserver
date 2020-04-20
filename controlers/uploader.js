const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const moment = require('moment');

var allowExt = ['.png', '.jpg', '.bmp', '.jpeg'];
var limits =  {
  fileSize: 1024 * 1024 * 4
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      req.uploadDate = moment().format('YYYY-MM-DD');

      var uploadDir = path.join(__dirname, '../upload/images/', req.uploadDate);

      mkdirp.sync(uploadDir);

      cb(null, uploadDir);
  },
  filename: function(req, file, cb){
      //背面图片使用和正面图片一样的名字+后缀(_negative)
      if(file.fieldname == 'negative' && req._images && req._images.positive){
        return cb(null, req._images.positive + '_negative' + path.extname(file.originalname));
      }
      crypto.randomBytes(32, (err, buf) => {
          if (err) throw err;
          var hex = buf.toString('hex');
          if(file.fieldname == 'positive'){
            req._images = {positive:hex};
          }
          cb(null, hex + path.extname(file.originalname));
      });
  }
});

var fileFilter = function(req, file, cb){
  var ext = path.extname(file.originalname);
  if(!allowExt.find(p => p == ext.toLowerCase()))
      return cb(null, false);
  return cb(null, true);
}

exports.upload = multer({ storage, limits, fileFilter }).fields([
  { name: 'positive', maxCount: 1 },
  { name: 'negative', maxCount: 1 }
]);

