/**
 * Generates sequentially resolved promises from an array of task (promise) creators
 * @param taskFactories Array of nilary functions to lazily create a promise
 */
exports.serializeTasks = (taskFactories) => {
    let counter = 0;
    return taskFactories.reduce((promiseChain, taskFactory) => {
        return promiseChain.then(
            async chainResults => {
                console.log(`Starting ${++counter}`);
                const currentResult = await taskFactory();
                console.log(`Finished ${counter}`);
                return [...chainResults, currentResult];
            }
        );
    }, Promise.resolve([]));
};