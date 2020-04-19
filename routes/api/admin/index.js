var express = require('express');
var router = express.Router();

router.use('/uploadlabels', require('./upload_labels'));

module.exports = router;