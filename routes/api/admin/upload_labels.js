var express = require('express');
const config = require('config');
const LabelsControler = require('../../../controlers/labels');
var router = express.Router();


router.post('/', async (req, res) => {
  var token = req.query.token;
  var expeted = config.get('token');
  if(token != expeted){
    res.jsonp({code:401});
    return;
  }

  var info = req.body;
  if(!info){
    res.jsonp({code:100});
    return;
  }

  try{
    for(var key of Object.keys(info)){
      for(var item of info[key]){
        await LabelsControler.add(item.cate, item);
      }
    }
  }catch(err){
    res.jsonp({code:500, detail:err});
    return;
  }

  res.jsonp({code:0});
  
});

module.exports = router;