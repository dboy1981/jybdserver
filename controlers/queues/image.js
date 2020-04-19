const Queue = require('bullmq').Queue;
const Worker = require('bullmq').Worker;

const queueName = 'images';
const myQueue = new Queue(queueName);

//data: {positive:'',negative:''}
exports.addJob = async (name, data) => {
  await myQueue.add(name, data);
}

exports.work = (worker) => {
  return new Worker(queueName, worker);
}