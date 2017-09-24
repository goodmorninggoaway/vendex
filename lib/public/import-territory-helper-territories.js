const differenceBy = require('lodash/differenceBy');
const DAL = require('../dataAccess').DAL;
const { serializeTasks } = require('../util');

module.exports = async ({ congregationId, inputData }) => {
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

    const sourceData = inputData.features;
    const existingTerritories = await DAL.getTerritories({ congregationId, externalTerritorySource: 'TERRITORY HELPER' });
    const updatedTerritories = await serializeTasks(sourceData.map(x => () => importTerritory(x)));

    const deletedTerritories = differenceBy(existingTerritories, updatedTerritories, 'territoryId');
    await serializeTasks(deletedTerritories.map(({ territoryId }) => () => DAL.deleteTerritory(territoryId)));
};