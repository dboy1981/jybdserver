var CronJob = require('cron').CronJob;
const { crawl } = require('../../controlers/bilibili_act')
var job = new CronJob(
	'* * * * * 1',
	function() {
    crawl();
	},
	null,
	true,
	'America/Los_Angeles'
);