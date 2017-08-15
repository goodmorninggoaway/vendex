const { congregationId, file, source } = require('../options');

const DAL = require('../dataAccess').DAL;

const loadFile = async (file) => {
    console.log('loading excel file', file);
    const result = require(file);
    console.log('loaded excel file', result.length);
    return result;
};

const importTerritory = async (externalTerritory) => {
    let vertices = externalTerritory.geometry.coordinates.reduce(
        (memo, x, vertexGroup) => [].concat(x.map(([longitude, latitude]) => `( ${longitude}, ${latitude} )`)), []);
    const boundary = `( ${vertices.join(', ')} )`;

    let territory = {
        congregationId,
        boundary,
        name: externalTerritory.properties.name,
        userDefined1: externalTerritory.properties.description,
        userDefined2: externalTerritory.properties.TerritoryNotes,
        externalTerritoryId: externalTerritory.properties.TerritoryNumber,
        externalTerritorySource: 'TERRITORY HELPER',
    };

    territory = await DAL.insertTerritory(territory, vertices);
    return territory;
};

const doStuff = async () => {
    const sourceData = (await loadFile(file)).features;
    return await Promise.all(sourceData.map(importTerritory));
};

doStuff()
    .then(x => console.log(x))
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });