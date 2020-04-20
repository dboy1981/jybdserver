const Query = require('../../controlers/query');
const config = require('config').get('easydl');
const EasyDL = require('easydlclassic')(config.key, config.secret);
const fs = require('fs');

function image2base64(filepath){
  let data = fs.readFileSync(filepath);
  return new Buffer(data).toString('base64');
}


//ret: {positive:'识别结果',negative:'识别结果',status:'识别状态，用户判断：1=correct 2=wrong',suggest:{用户提交建议}}
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