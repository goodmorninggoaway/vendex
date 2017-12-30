const Pipeline = require('../../pipeline');
const DAL = require('../../dataAccess').DAL;
const importTerritories = require('./importTerritories');
const removeDeleted = require('./removeDeleted');

const source = 'TERRITORY HELPER';

module.exports = async ({ congregationId, inputData }) => {
  const existingTerritories = await DAL.getTerritories({
    congregationId,
    externalTerritorySource: source,
  }).select('territoryId');

  const pipeline = new Pipeline({
    source,
    congregationId,
    existingTerritories,
    externalTerritories: inputData.features,
  })
    .addHandler(importTerritories)
    .addHandler(removeDeleted);

  return await pipeline.execute();
};
