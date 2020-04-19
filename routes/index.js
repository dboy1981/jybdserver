var express = require('express');
var router = express.Router();

const api = require('./api');

router.use('/api', api);

module.exports = router;
