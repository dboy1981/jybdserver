var express = require('express');
const uploader = require('../../controlers/uploader');
const Queue = require('../../controlers/queues/image')
const path = require("path")
const multer = require('multer');
var router = express.Router();

router.post('/', (req, res, next) => {
  uploader.upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.jsonp({code:501, detail:err.code});
    } else if (err) {
      console.log(err);
      return res.jsonp({code:500, detail:err});
    }

    var data = {};
    var token = '';
    console.log(req.files, req.body);

    if(!req.files['positive']){
      return res.jsonp({code:100});
    }

    if(req.files['positive'].length > 0){
      var file = req.files['positive'][0];
      token = file.filename;
      data['positive'] = file.path;
    }
    if(req.files['negative'] && req.files['negative'].length > 0){
      var file = req.files['negative'][0];
      data['negative'] = file.path;
    }

    if(data.positive){
      await Queue.addJob(token, data);
    }

    res.jsonp({code:0, token});
  })
})

module.exports = router;