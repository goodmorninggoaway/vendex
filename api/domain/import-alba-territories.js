const DAL = require('./dataAccess').DAL;

const importTerritory = async (externalTerritory, congregationId) => {
    let vertices = externalTerritory.boundary.map(([longitude, latitude]) => `( ${longitude}, ${latitude} )`);
    const boundary = `( ${vertices.join(', ')} )`;

    let territory = {
        congregationId,
        boundary,
        name: 'Congregation Area',
        externalTerritoryId: 1,
        externalTerritorySource: 'ALBA',
        deleted: 0,
    };

    territory = await DAL.insertTerritory(territory, vertices);
    return territory;
};

module.exports = async ({ congregationId, inputData }) => {
    await importTerritory(inputData.data, congregationId);
};
