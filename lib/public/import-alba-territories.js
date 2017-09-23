const { congregationId, file } = require('../options');
const path = require('path');
const DAL = require('../dataAccess').DAL;
const { serializeTasks } = require('../util');

const loadFile = async (file) => {
    console.log('loading excel file', file);
    const result = require(path.resolve(file));
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
        deleted: 0,
    };

    territory = await DAL.insertTerritory(territory, vertices);
    return territory;
};

const doStuff = async () => {
    const sourceData = [(await loadFile(file)).data];
    await serializeTasks(sourceData.map(x => () => importTerritory(x)));
};

doStuff()
    .then(x => console.log(x))
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });