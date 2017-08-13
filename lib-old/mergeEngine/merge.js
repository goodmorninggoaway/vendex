const jsonfile = require('jsonfile');

const passthroughSync = (fn) => (value) => {
    fn(value);
    return value;
};

const writeIntermediateValue = ([alba, th]) => {
    const file = `${process.env.TEMP_DIR}/${new Date().valueOf()}.json`;
    jsonfile.writeFileSync(file, { alba, th }, { spaces: 2 });
};

const mergeFull = (results) => {
    return results.reduce((memo, result) => {
        if (Array.isArray(result)) {
            return result.reduce((memo2, innerResult) => {
                memo2[innerResult.source] = memo2[innerResult.source] || {};
                memo2[innerResult.source][innerResult.id] = innerResult;
                return memo2;
            }, memo);
        }

        return memo;
    }, {});
};

const simpleDiffAlbaToTerritoryHelper = (result) => {
    const { alba, th } = result;
    return Object.entries(alba)
        .reduce((memo, [key, albaEntry]) => {
            if (!th[`th_${key.replace('alba_', '')}`]) {
                memo.push(albaEntry);
            }

            return memo;
        }, []);
};

module.exports = (...promises) => Promise.all(promises)
    .then(passthroughSync(writeIntermediateValue))
    .then(mergeFull)
    .then(simpleDiffAlbaToTerritoryHelper);