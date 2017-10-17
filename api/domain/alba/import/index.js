const Pipeline = require('../../pipeline');
const convertCsvToJson = require('./convertCsvToJson');
const getExistingLocations = require('./getExistingLocations');
const importLocations = require('./importLocations');
const removeMissingLocations = require('./removeMissingLocations');
const LOCATION_INTERFACES = require('../../models/enums/locationInterfaces');

module.exports = async ({ congregationId, inputData: tsv }) => {
  return await new Pipeline({ tsv, congregationId, source: LOCATION_INTERFACES.ALBA })
    .addHandler(convertCsvToJson)
    .addHandler(getExistingLocations)
    .addHandler(importLocations)
    .addHandler(removeMissingLocations)
    .execute();
};
