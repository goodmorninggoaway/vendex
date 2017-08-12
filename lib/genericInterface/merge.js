const jsonfile = require('jsonfile');

module.exports = (...promises) => {
    return Promise.all(promises)
        .then((results) => {
            const [alba, th] = results;
            const file = `${process.env.TEMP_DIR}/${new Date().valueOf()}.json`;
            jsonfile.writeFileSync(file, { alba, th }, { spaces: 2 });
            return results;
        })
        .then((results) => {
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
        })
        .then((result) => {
            const { alba, th } = result;
            return Object.entries(alba)
                .reduce((memo, [key, albaEntry]) => {
                    if (!th[`th_${key.replace('alba_', '')}`]) {
                        memo.push(albaEntry);
                    }

                    return memo;
                }, []);
        });
};