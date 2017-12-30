const { executeConcurrently } = require('../../util');
const Pipeline = require('../../pipeline');
const importTerritory = require('./importTerritory');

exports.requires = ['externalTerritories', 'congregationId', 'source'];
exports.returns = 'updatedTerritories';
exports.handler = async function importTerritories({ externalTerritories, congregationId, source }) {
  const worker = async (externalTerritory) => {
    const { territory } = await new Pipeline({ externalTerritory, congregationId, source })
      .addHandler(importTerritory)
      .execute();

    return territory;
  };

  return await executeConcurrently(externalTerritories, worker);
};
