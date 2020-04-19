var express = require('express');
var router = express.Router();

router.use('/admin', require('./admin'));
router.use('/upload', require('./upload'));
router.use('/query', require('./query'));

module.exports = router;