const { congregationId, file, source } = require('../options');

const pluck = require('lodash/map');
const differenceBy = require('lodash/differenceBy');
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
        deleted: 0,
    };

    const existingTerritory = await DAL.findTerritory({
        congregationId,
        externalTerritoryId: externalTerritory.properties.TerritoryNumber,
        externalTerritorySource: 'TERRITORY HELPER',
    });

    if (!existingTerritory) {
        territory = await DAL.insertTerritory(territory, vertices);
    } else {
        await DAL.updateTerritory({ territoryId: existingTerritory.territoryId }, territory);
        territory = Object.assign(existingTerritory, territory);
    }

    return territory;
};

const doStuff = async () => {
    const sourceData = (await loadFile(file)).features;
    const existingTerritories = await DAL.getTerritories({ congregationId, externalTerritorySource: 'TERRITORY HELPER' });
    const updatedTerritories = await Promise.all(sourceData.map(importTerritory));
    const deletedTerritories = differenceBy(existingTerritories, updatedTerritories, 'territoryId');
    await Promise.all(deletedTerritories.map(x => DAL.deleteTerritory))
};

doStuff()
    .then(x => console.log(x))
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });