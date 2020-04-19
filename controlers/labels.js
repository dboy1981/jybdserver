const redis = require('../libs/redis')({ keyPrefix: 'labels:', db:1 });

exports.add = (label, info) => {
  return redis.set(label, JSON.stringify(info));
}

exports.get = (label) => {
  var promise = new Promise((resolve, reject) => {
    redis.get(label, (err, info) => {
      if(err){
        return reject(err);
      }
      resolve(JSON.parse(info));
    })
  });
  return promise;
}