const Pipeline = require('../../pipeline');
const convertCsvToJson = require('./convertCsvToJson');
const getExistingLocations = require('./getExistingLocations');
const importLocations = require('./importLocations');
const removeMissingLocations = require('./removeMissingLocations');
const getCongregation = require('../../congregation/getCongregation');

module.exports = async ({ congregationId, inputData: tsv, source }) => {
  return await new Pipeline({ tsv, congregationId, source })
    .addHandler(convertCsvToJson)
    .addHandler(getCongregation)
    .addHandler(getExistingLocations)
    .addHandler(importLocations)
    .addHandler(removeMissingLocations)
    .execute();
};
