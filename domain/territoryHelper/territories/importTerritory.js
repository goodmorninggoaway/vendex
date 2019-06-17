const { Territory } = require('../../models');

exports.requires = ['externalTerritory', 'congregationId', 'source'];
exports.returns = 'territory';
exports.handler = async ({ externalTerritory, congregationId, source }) => {
  const territoryTypeCode = (externalTerritory.TerritoryTypeCode || '').toLowerCase();
  // Only include polygon territories and ignore territories that are markers or without a geometry since they cannot contain locations.
  // Also exclude boundary territories with a territory type bdry.
  if (externalTerritory.ShapeType !== 'polygon' || territoryTypeCode === 'bdry') {
    return null;
  }
  const vertices = JSON.parse(externalTerritory.Boundary).map(({ lat, lng }) => `(${lng}, ${lat})`);

  const boundary = `( ${vertices.join(', ')} )`;
  const name = `${externalTerritory.TerritoryTypeName} ${externalTerritory.Number}`;
  const externalTerritoryId = externalTerritory.Id + "";
  const externalTerritoryName = `${externalTerritory.TerritoryTypeCode}-${externalTerritory.Number}`;
  let territory = {
    congregationId,
    boundary,
    externalTerritoryId,
    externalTerritoryName,
    name,
    externalTerritorySource: source,
    deleted: false,
  };

  // First find by external id then by external name for backwards compatibility before territory helper API was used.
  const existingTerritory = await Territory.query().findOne({
    congregationId,
    externalTerritoryId,
    externalTerritorySource: source,
  }) || await Territory.query().findOne({
    congregationId,
    externalTerritoryName,
    externalTerritorySource: source,
  });

  if (!existingTerritory) {
    territory = await Territory.query()
      .insert(territory)
      .returning('*')
      .first();
    console.log(`Created "territory": ${territory.territoryId}`);
  } else {
    territory = await Territory.query()
      .where({ territoryId: existingTerritory.territoryId })
      .patch(territory)
      .returning('*')
      .first();
    console.log(`Updated "territory": ${territory.territoryId}`);
  }

  return territory;
};
