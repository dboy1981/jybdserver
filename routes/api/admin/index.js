var express = require('express');
var router = express.Router();

router.use('/uploadlabels', require('./upload_labels'));
router.use('/downloadimages', require('./download_images'));

module.exports = router;