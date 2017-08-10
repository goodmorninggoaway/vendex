require('dotenv').config();
const cli = require('cli');
const jsonfile = require('jsonfile');

const sources = ['alba', 'th'];

console.passthrough = (...args) => {
    console.log(...args);
    return args[0];
};

const options = Object
    .entries(cli.parse({
        'alba-input': [false, 'Path to Alba address export file', 'file', '/Users/mjd/code/thalba-sync/.samples/alba.tsv'],
        'th-input': [false, 'Path to Territory Helper Location export file', 'file', '/Users/mjd/code/thalba-sync/.samples/th.xlsx'],
    }))
    .reduce((memo, [key, value]) => {
        const source = sources.find(x => key.startsWith(x));
        const [_, newKey] = key.split(source + '-');

        memo[source] = memo[source] || {};
        memo[source][newKey] = value;

        return memo;
    }, {});

const alba = require('./lib/alba');
const territoryHelper = require('./lib/territoryHelper');
const genericInterface = require('./lib/genericInterface');

genericInterface.merge(
    alba
        .loadJson(options.alba)
        .then(x => Promise.all(x.slice(0, 2).map(alba.convert.toGeneric))),

    territoryHelper
        .files.load(options.th)
        .then(x => Promise.all(x.slice(0, 2).map(territoryHelper.convert.toGeneric))),
)
    .then(x => x.map(territoryHelper.convert.fromGeneric))
    .then((thResults) => {
        const file = `${process.env.TEMP_DIR}/th_output_${new Date().valueOf()}.json`;
        jsonfile.writeFileSync(file, thResults, { spaces: 2 });
    })
    .catch(console.error);
// territoryHelper.loadJson(options.th).then(x => console.log(x[0]));