require('dotenv').config();
const cli = require('cli');

const sources = ['alba', 'th'];

const options = Object
    .entries(cli.parse({
        'alba-input': [false, 'Path to Alba address export file', 'file', '/Users/mjd/code/thalba-sync/.samples/alba.tsv'],
        'th-input': [false, 'Path to Territory Helper Location export file', 'file', '/Users/mjd/code/thalba-sync/.samples/th.xlsx'],
        'congregation': [false, 'Congregation ID', 'int', 1],
    }))
    .reduce((memo, [key, value]) => {
        const source = sources.find(x => key.startsWith(x));
        const [_, newKey] = key.split(source + '-');

        memo[source] = memo[source] || {};
        memo[source][newKey] = value;

        return memo;
    }, {});

module.exports = options;