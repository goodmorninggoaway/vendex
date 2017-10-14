const Logger = global.Logger;
const util = require('util');
const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const excelAsJson = require('./excelToJson');
const geocode = require('./geocode');
const addressUtils = require('./validateAddress');
const DAL = require('./dataAccess').DAL;
const convertExcelToJson = util.promisify(excelAsJson.processStream);
const { serializeTasks } = require('./util');

module.exports = async ({ congregationId, fileStream }) => {
  const source = 'TERRITORY HELPER';
  const importLocation = async (locations, externalLocation) => {
    // Ignore english DNCs
    if (externalLocation.Status !== 'Language') {
      return;
    }

    const address = `${externalLocation.Address} ${externalLocation.City} ${externalLocation.State} ${externalLocation['Postal code']}`;
    const translatedLocation = addressUtils.getAddressParts(address);

    let translatedCongregationLocation = {
      congregationId,
      source,
      sourceData: externalLocation,
      language: externalLocation.Language.toUpperCase(), // TODO create automanaged enumeration
      sourceLocationId: null,
      isPendingTerritoryMapping: 1,
      isDeleted: 0,
      isActive: 1,
      notes: externalLocation.Notes,
      userDefined1: externalLocation.Status,
    };

    const addressHash = hash.sha1(translatedLocation);
    let { location, congregationLocation } = locations.find(x => x.location.externalLocationId === addressHash) || {};
    // TODO mark the address as "encountered" so we can handle the negative space

    if (!location) {
      location = Object.assign({}, await geocode(address), translatedLocation, { externalLocationId: addressHash });
      location = await DAL.insertLocation(location);
      Logger.log(`Created "location": ${location.locationId}`);
    }

    const { locationId } = location;
    const territory = await DAL.findTerritory({
      congregationId,
      externalTerritorySource: source,
      externalTerritoryId: externalLocation['Territory number'],
    });

    translatedCongregationLocation.locationId = locationId;

    if (territory) {
      translatedCongregationLocation.territoryId = territory.territoryId;
      translatedCongregationLocation.isPendingTerritoryMapping = 0;
    }

    if (!congregationLocation) {
      congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
      Logger.log(`Created "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

      await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'I', source });

    } else {
      let hasDiff = false;
      const diff = Object.entries(translatedCongregationLocation).reduce((memo, [key, value]) => {
        if (congregationLocation[key] !== value) {
          memo[key] = value;
          hasDiff = true;
        }

        return memo;
      }, {});

      if (hasDiff) {
        await DAL.updateCongregationLocation(congregationId, locationId, diff);
        Logger.log(`Updated "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

        await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'U', source });
        congregationLocation = Object.assign({}, congregationLocation, diff);
      }
    }

    return { location, congregationLocation };
  };

  const sourceData = await convertExcelToJson(fileStream, null, {});
  const existingLocations = await DAL.getLocationsForCongregationFromSource(congregationId, source);
  const updatedLocations = await serializeTasks(sourceData.map((x, index) => () => {
    Logger.log(`Processing Territory Helper Location Import ${index + 1}/${sourceData.length}`);
    return importLocation(existingLocations, x);
  }));

  const deletedLocations = differenceBy(existingLocations, updatedLocations, 'location.locationId');
  await serializeTasks(deletedLocations.map(({ location: { locationId } }, index) => async () => {
    await DAL.deleteCongregationLocation({ congregationId, locationId });
    Logger.log(`Deleted "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

    await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'D', source });
  }));
};
