const config = require('config');

exports.checkToken = (req, res, next) => {
  var token = req.query.token;
  var expeted = config.get('token');
  if(token != expeted){
    res.jsonp({code:401});
    return;
  }
  next();
}