const redis = require('../libs/redis')({ keyPrefix: 'query_cache:', db:2 });
const Utils = require('../libs/utils')

exports.setCache = function(base64image, token){
  var key = Utils.MD5(base64image);
  //（问题：如果图片识别错误必须删除缓存 解决：缓存1天自动删除）
  return redis.set(key, token, "EX", 3600 * 24);
}

exports.getCache = function(base64image){
  var promise = new Promise((resolve, reject) => {
    redis.get(Utils.MD5(base64image), (err, token) => {
      if(err){
        return reject(err);
      }
      resolve(token);
    })
  });
  return promise;
}

exports.del = function(base64image){
  return redis.del(Utils.MD5(base64image));
}