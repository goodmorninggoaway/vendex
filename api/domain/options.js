require('dotenv').config();
const cli = require('cli');

const options = cli.parse({
    congregationId: ['c', 'Congregation ID', 'int', 1],
    file: ['f', 'Absolute path to input file', 'file', null],
    outputDirectory: ['o', 'Absolute path to output file directory. ', 'file', null],
    source: ['s', 'Data source - "TERRITORY HELPER", "ALBA"', 'string', null],
    destination: ['d', 'Data destination- "TERRITORY HELPER", "ALBA"', 'string', null],
});

module.exports = options;
