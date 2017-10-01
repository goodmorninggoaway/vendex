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
