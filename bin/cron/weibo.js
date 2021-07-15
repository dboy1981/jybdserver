var CronJob = require('cron').CronJob;
const { crawl } = require('../../controlers/weibo')
var job = new CronJob(
	'00 05 00 * * *',
	function() {
		const d = new Date();
		console.log(d)
    crawl();
	}
);
job.start()