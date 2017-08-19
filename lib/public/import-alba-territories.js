const { congregationId, file, source } = require('../options');

const DAL = require('../dataAccess').DAL;

const loadFile = async (file) => {
    console.log('loading excel file', file);
    const result = require(file);
    console.log('loaded excel file', result.length);
    return result;
};

const importTerritory = async (externalTerritory) => {
    let vertices = externalTerritory.boundary.map(([longitude, latitude]) => `( ${longitude}, ${latitude} )`);
    const boundary = `( ${vertices.join(', ')} )`;

    let territory = {
        congregationId,
        boundary,
        name: 'Congregation Area',
        externalTerritoryId: 1,
        externalTerritorySource: 'ALBA',
    };

    territory = await DAL.insertTerritory(territory, vertices);
    return territory;
};

const doStuff = async () => {
    const sourceData = [(await loadFile(file)).data];
    return await Promise.all(sourceData.map(importTerritory));
};

doStuff()
    .then(x => console.log(x))
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });