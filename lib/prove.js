const jsonfile = require('jsonfile');
const alba = require('./alba');
const territoryHelper = require('./territoryHelper');
const genericInterface = require('./genericInterface');

module.exports = (options) =>
    genericInterface.merge(
        alba
            .files.load(options.alba)
            .then(x => Promise.all(x.slice(0, 2).map(alba.convert.toGeneric))),

        territoryHelper
            .files.load(options.th)
            .then(x => Promise.all(x.slice(0, 2).map(territoryHelper.convert.toGeneric))),
    )
        .then(x => x.map(territoryHelper.convert.fromGeneric))
        .then((thResults) => {
            const file = `${process.env.TEMP_DIR}/th_output_${new Date().valueOf()}.json`;
            jsonfile.writeFileSync(file, thResults, { spaces: 2 });
            return thResults;
        })
        .then(territoryHelper.files.write)
        .catch(console.error);