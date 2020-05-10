var express = require('express');
const middleware = require('./middleware');
const LabelsControler = require('../../../controlers/labels');
const config = require('config')
var router = express.Router();


router.post('/', middleware.checkToken, async (req, res) => {
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
        await LabelsControler.add(item.key, item);
      }
    }
  }catch(err){
    res.jsonp({code:500, detail:err});
    return;
  }

  res.jsonp({code:0});
  
});

module.exports = router;