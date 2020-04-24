const Query = require('../../controlers/query');
const config = require('config').get('easydl');
const EasyDL = require('easydlclassic')(config.key, config.secret);
const QueryCache = require('../../controlers/query_cache');
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

  var pbase64 = image2base64(data.positive)
  var nbase64 = '';

  //相同图片不再重新验证（问题：如果图片识别错误必须删除缓存 解决：缓存1天自动删除）
  //不验证背面图片
  var tokenCache = await QueryCache.getCache(pbase64);
  if(tokenCache){
    await Query.add(token, await Query.get(tokenCache));
    return;
  }

  ret.positive = await EasyDL.imageclass_query(config.api, {image:pbase64});
  if(data.negative){
    nbase64 = image2base64(data.negative);
    ret.negative = await EasyDL.imageclass_query(config.api, {image:nbase64});
  }

  await QueryCache.setCache(pbase64, token);

  console.log(ret);

  await Query.add(token, ret);
}