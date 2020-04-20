var express = require('express');
const Controler = require('../../controlers/query');
const Label = require('../../controlers/labels');
var router = express.Router();


router.get('/', async (req, res) => {
  var token = req.query.token;
  if(!token){
    res.jsonp({code:100});
    return;
  }

  var info = await Controler.get(token);
  if(!info || (!info.positive && !info.negative)){
    res.jsonp({code:401});
    return;
  }

  // {"code":0,"data":{"positive":{"log_id":7294166671487152000,"results":[{"name":"xcsb_xu","score":0.870281457901001},{"name":"xcsb_you","score":0.04519305005669594},{"name":"xcsb_cha","score":0.01805022917687893},{"name":"xcsb_zhuang","score":0.017116505652666092},{"name":"xcsb_di","score":0.012906060554087162}]},"negative":{"log_id":345961257596586050,"results":[{"name":"hwz","score":0.3563573658466339},{"name":"beizhou_buquan","score":0.15262319147586823},{"name":"xcsb_yao","score":0.12576186656951904},{"name":"beizhou_wuxing","score":0.12177497893571854},{"name":"xcsb_xu","score":0.051194850355386734}]}}}

  var labelP = '';
  var labelN = '';
  if(info.positive){
    labelP = info.positive.results[0].name;
  }
  //背面与正面单独训练，背面label必须_0结尾，否则说明是误判
  if(info.negative){
    labelN = info.negative.results[0].name;
    if(!labelN.endsWith('_0')){
      labelN = '';
    }
  }

  if(!labelP && !labelN){
    res.jsonp({code:400});
    return;
  }

  res.jsonp({code:0, data:{
    p: labelP ? await Label.get(labelP) : null,
    n: labelN ? await Label.get(labelN) : null
  }});
  
});

module.exports = router;