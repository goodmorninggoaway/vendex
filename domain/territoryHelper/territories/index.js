const Pipeline = require('../../pipeline');
const DAL = require('../../dataAccess').DAL;
const importTerritories = require('./importTerritories');
const removeDeleted = require('./removeDeleted');
const SOURCES = require('../../models/enums/locationInterfaces');

module.exports = async ({ congregationId, externalTerritories }) => {
  const existingTerritories = await DAL.getTerritories({
    congregationId,
    externalTerritorySource: SOURCES.TERRITORY_HELPER,
  }).select('territoryId');

  const pipeline = new Pipeline({
    source: SOURCES.TERRITORY_HELPER,
    congregationId,
    existingTerritories,
    externalTerritories,
  })
    .addHandler(importTerritories)
    .addHandler(removeDeleted);

  return await pipeline.execute();
};
