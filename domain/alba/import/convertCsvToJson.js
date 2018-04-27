const csv = require('csvtojson');

exports.requires = ['tsv'];
exports.returns = 'sourceData';
exports.handler = async function convertCsvToJson({ tsv }) {
  return new Promise((resolve, reject) => {
    const rows = [];

    csv({ delimiter: '\t' })
      .fromString(tsv)
      .on('json', jsonObj => {
        rows.push(jsonObj);
      })
      .on('done', error => {
        if (error) {
          return reject(error);
        }
        resolve(rows);
      });
  });
};
