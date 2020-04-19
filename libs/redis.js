/**
 * Created by dboy on 2017/10/10.
 */
var Redis = require("ioredis");
var config = require('config');

module.exports = function(options){
    var redisConfig = Object.assign({}, config.get('redis'), options);
    //console.log(redisConfig);
    return new Redis(redisConfig);
};