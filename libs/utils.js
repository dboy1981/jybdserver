var crypto = require('crypto');

exports.MD5 = (str) => {
  var md5 = crypto.createHash('md5');
  return md5.update(str).digest('hex');
}