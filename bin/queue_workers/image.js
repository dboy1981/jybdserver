const queue = require('../../controlers/queues/image');
const worker = require('../../controlers/queue_works/image');

queue.work(worker);