const queue = require('async/queue');

/**
 * Generates sequentially resolved promises from an array of task (promise) creators
 * @param taskFactories Array of nilary functions to lazily create a promise
 */
exports.serializeTasks = taskFactories => {
  return taskFactories.reduce((promiseChain, taskFactory) => {
    return promiseChain.then(async chainResults => {
      const currentResult = await taskFactory();
      return [...chainResults, currentResult];
    });
  }, Promise.resolve([]));
};

exports.executeConcurrently = (
  source,
  taskWorker,
  workerCount = process.env.MAX_CONCURRENCY || 4,
) =>
  new Promise((resolve, reject) => {
    const results = [];
    const worker = async task => {
      // console.log('starting a task');
      results.push(await taskWorker(task));
      // console.log('finished a task', `remaining: ${q.length()}, running: ${q.running()}, idle: ${q.idle()}, paused: ${q.paused}`);
    };

    const q = queue(worker, workerCount);
    q.drain = () => {
      // console.log('emptied the queue');
      return resolve(results);
    };
    q.error = e => {
      // console.error('had an error', e && e.message);
      q.kill();
      reject(e);
    };
    q.push(source);
  });

exports.executeSerially = (source, worker) =>
  exports.executeConcurrently(source, worker, 1);
