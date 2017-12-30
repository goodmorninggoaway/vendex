const DAL = require('../../dataAccess').DAL;
const { Territory } = require('../../models');

exports.requires = ['externalTerritory', 'congregationId', 'source'];
exports.returns = 'territory';
exports.handler = async ({ externalTerritory, congregationId, source }) => {
  const vertices = externalTerritory.geometry.coordinates.reduce(
    (memo, x) => [].concat(x.map(([longitude, latitude]) => `( ${longitude}, ${latitude} )`)), []);
  const boundary = `( ${vertices.join(', ')} )`;

  const externalTerritoryId = `${externalTerritory.properties.TerritoryTypeCode}-${externalTerritory.properties.TerritoryNumber}`;
  let territory = {
    congregationId,
    boundary,
    externalTerritoryId,
    name: externalTerritory.properties.name,
    externalTerritorySource: source,
    deleted: false,
  };

  const existingTerritory = await Territory.query().findOne({
    congregationId,
    externalTerritoryId,
    externalTerritorySource: source,
  });

  if (!existingTerritory) {
    territory = await Territory.query().insert(territory).returning('*').first();
    console.log(`Created "territory": ${territory.territoryId}`);
  } else {
    territory = await Territory.query().where({ territoryId: existingTerritory.territoryId }).patch(territory).returning('*').first();
    console.log(`Updated "territory": ${territory.territoryId}`);
  }

  return territory;
};
