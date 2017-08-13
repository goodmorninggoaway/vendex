require('dotenv').config();
const cli = require('cli');

const options = cli.parse({
    'congregationId': ['c', 'Congregation ID', 'int', 1],
    'file': ['f', 'Absolute path to input file', 'file', '/Users/mjd/code/thalba-sync/.samples/th.xlsx'],
    'source': ['s', 'Data source - "TERRITORY HELPER", "ALBA"', 'string', 'TERRITORY HELPER'],
});

console.log(options);
module.exports = options;
