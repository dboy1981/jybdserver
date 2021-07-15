var CronJob = require('cron').CronJob;
const { crawl } = require('../../controlers/weibo')
var job = new CronJob(
	'00 30 00 * * *',
	function() {
		const d = new Date();
		console.log(d)
    crawl();
	}
);
job.start()