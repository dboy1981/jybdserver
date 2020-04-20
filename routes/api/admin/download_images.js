var express = require('express');
const middleware = require('./middleware');
const moment = require('moment');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
var router = express.Router();


router.get('/', middleware.checkToken, async (req, res) => {
  var day = req.query.day || moment().format('YYYY-MM-DD');
  var dir = path.join(__dirname, '../../../upload/images', day);
  if(!fs.existsSync(dir)){
    res.jsonp({code:400});
    return;
  }

  res.setHeader('Content-disposition', 'attachment; filename=' + day + '.zip');

  var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  
  archive.directory(dir, false);
  archive.pipe(res);
  archive.finalize();
});

module.exports = router;