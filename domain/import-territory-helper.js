const util = require('util');
const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const excelAsJson = require('./excelToJson');
const addressUtils = require('./validateAddress');
const DAL = require('./dataAccess').DAL;
const convertExcelToJson = util.promisify(excelAsJson.processStream);
const { serializeTasks } = require('./util');
const TAGS = require('./models/enums/tags');
const { CongregationLocationActivity, CongregationLocation } = require('./models');

module.exports = async ({ congregationId, fileStream, sourceData }) => {
  const source = 'TERRITORY HELPER';
  const importLocation = async (locations, externalLocation) => {
    // Ignore local-language DNCs
    if (externalLocation.Status !== 'Language') {
      return;
    }

    const attributes = [];
    const address = `${externalLocation.Address} ${externalLocation.City} ${
      externalLocation.State
      } ${externalLocation['Postal code']}`;
    const translatedLocation = addressUtils.getAddressParts(address);

    if (externalLocation['Location Type'] === 'Language') {
      attributes.push(TAGS.FOREIGN_LANGUAGE);
    }

    if (externalLocation.Status === 'Do not call') {
      attributes.push(TAGS.DO_NOT_CALL);
    }

    let translatedCongregationLocation = {
      congregationId,
      source,
      attributes,
      sourceData: externalLocation,
      language: externalLocation.Language.toUpperCase(), // TODO create automanaged enumeration
      sourceLocationId: null,
      isPendingTerritoryMapping: 1,
      isDeleted: 0,
      isActive: 1,
      notes: externalLocation.Notes,
    };

    const addressHash = hash.sha1(translatedLocation);
    let { location, congregationLocation } =
    locations.find(x => x.location.externalLocationId === addressHash) || {};
    // TODO mark the address as "encountered" so we can handle the negative space

    if (!location) {
      location = Object.assign({}, translatedLocation, {
        externalLocationId: addressHash,
        latitude: externalLocation.Latitude,
        longitude: externalLocation.Longitude,
      });
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
      congregationLocation = await DAL.insertCongregationLocation(
        translatedCongregationLocation,
      );
      Logger.log(
        `Created "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`,
      );

      await CongregationLocationActivity.addActivity({
        congregation_id: congregationId,
        location_id: locationId,
        operation: 'I',
        source,
      });
    } else {
      let hasDiff = false;
      const diff = Object.entries(translatedCongregationLocation).reduce(
        (memo, [key, value]) => {
          if (congregationLocation[key] !== value) {
            memo[key] = value;
            hasDiff = true;
          }

          return memo;
        },
        {},
      );

      if (hasDiff) {
        await DAL.updateCongregationLocation(
          { congregationId, locationId },
          diff,
        );
        Logger.log(
          `Updated "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`,
        );

        await CongregationLocationActivity.addActivity({
          congregation_id: congregationId,
          location_id: locationId,
          operation: 'U',
          source,
        });
        congregationLocation = Object.assign({}, congregationLocation, diff);
      }
    }

    return { location, congregationLocation };
  };

  sourceData = sourceData || (await convertExcelToJson(fileStream, null, {}));
  const existingLocations = await DAL.getLocationsForCongregationFromSource(congregationId, source);
  const updatedLocations = await serializeTasks(
    sourceData.map((x, index) => () => {
      console.log(`Processing Territory Helper Location Import ${index + 1}/${sourceData.length}`);
      return importLocation(existingLocations, x);
    }),
  );

  await serializeTasks(
    differenceBy(existingLocations, updatedLocations, 'location.locationId')
      .map(({ location }) => async () => {
        await CongregationLocation.detachCongregationLocation({ congregationId, locationId: location.locationId, source });
      }),
  );
};
