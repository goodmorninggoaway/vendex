const queue = require('async/queue');

/**
 * Generates sequentially resolved promises from an array of task (promise) creators
 * @param taskFactories Array of nilary functions to lazily create a promise
 */
exports.serializeTasks = (taskFactories) => {
  return taskFactories.reduce((promiseChain, taskFactory) => {
    return promiseChain.then(
      async chainResults => {
        const currentResult = await taskFactory();
        return [...chainResults, currentResult];
      }
    );
  }, Promise.resolve([]));
};

exports.executeConcurrently = (source, taskWorker, workerCount = (process.env.MAX_CONCURRENCY || 4)) => new Promise((resolve) => {
  const results = [];
  const worker = async (task, done) => {
    results.push(await taskWorker(task));
    done();
  };

  const q = queue(worker, workerCount);
  q.drain = () => resolve(results);
  q.error = console.error;
  q.push(source);
});

exports.executeSerially = (source, worker) => exports.executeConcurrently(source, worker, 1);
