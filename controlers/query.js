const redis = require('../libs/redis')({ keyPrefix: 'query:', db:2 });

exports.add = (token, info) => {
  return redis.set(token, JSON.stringify(info));
}

exports.get = (token) => {
  var promise = new Promise((resolve, reject) => {
    redis.get(token, (err, info) => {
      if(err){
        return reject(err);
      }
      resolve(JSON.parse(info));
    })
  });
  return promise;
}

