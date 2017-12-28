const differenceBy = require('lodash/differenceBy');
const DAL = require('../../dataAccess').DAL;
const { serializeTasks } = require('../../util');

module.exports.requires = ['updatedTerritories', 'existingTerritories'];
module.exports.returns = [];
module.exports.handler = async function removeDeleted({ updatedTerritories, existingTerritories }) {
  const deletedTerritories = differenceBy(existingTerritories, updatedTerritories, 'territoryId');

  await serializeTasks(deletedTerritories.map(({ territoryId }) => async () => {
    await DAL.deleteTerritory(territoryId);
    console.log(`Deleted "territory": ${territoryId}`);
  }));
};
