var CronJob = require('cron').CronJob;
const { crawl } = require('../../controlers/bilibili_act')
var job = new CronJob(
	'0 5 0 * * *',
	function() {
    crawl();
	},
	null,
	true,
	'America/Los_Angeles'
);
job.start()