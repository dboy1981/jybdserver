const Query = require('../../controlers/query');
const config = require('config').get('easydl');
const EasyDL = require('easydlclassic')(config.key, config.secret);
const fs = require('fs');

function image2base64(filepath){
  let data = fs.readFileSync(filepath);
  return new Buffer(data).toString('base64');
}


//data: {positive:'',negative:''}
module.exports = async (job) => {
  var data = job.data;
  var token = job.name;
  var ret = {};

  ret.positive = await EasyDL.imageclass_query(config.api, {image:image2base64(data.positive)});
  if(data.negative){
    ret.negative = await EasyDL.imageclass_query(config.api, {image:image2base64(data.negative)});
  }

  console.log(ret);

  await Query.add(token, ret);
}