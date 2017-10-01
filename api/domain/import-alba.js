const csv = require('csvtojson');
const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const geocode = require('./geocode');
const addressUtils = require('./validateAddress');
const DAL = require('./dataAccess').DAL;
const { serializeTasks } = require('./util');

const source = 'ALBA';

const loadFile = async (file) => {
  console.log('loading csv inputData', file);
  const result = await new Promise((resolve, reject) => {
    const rows = [];

    csv({ delimiter: '\t' })
      .fromString(file)
      .on('json', (jsonObj) => {
        rows.push(jsonObj);
      })
      .on('done', (error) => {
        if (error) {
          return reject(error);
        }

        resolve(rows);
      });
  });
  console.log('loaded csv inputData', result.length);
  return result;
};

module.exports = async ({ congregationId, inputData }) => {
  const importLocation = async (locations, externalLocation) => {
    const address = `${externalLocation.Address} ${externalLocation.Suite} ${externalLocation.City} ${externalLocation.Province} ${externalLocation['Postal_code']}`;
    const translatedLocation = addressUtils.getAddressParts(address);

    let translatedCongregationLocation = {
      congregationId,
      source,
      sourceData: externalLocation,
      language: externalLocation.Language ? externalLocation.Language.toUpperCase() : 'N/A', // TODO create automanaged enumeration
      sourceLocationId: externalLocation.Address_ID,
      isPendingTerritoryMapping: 0,
      isDeleted: 0,
      isActive: 1,
      notes: externalLocation.Notes,
      userDefined1: externalLocation.Kind,
      userDefined2: externalLocation.Account,
    };

    const addressHash = hash.sha1(translatedLocation);
    let { location, congregationLocation } = locations.find(x => x.location.externalLocationId === addressHash) || {};
    // TODO mark the address as "encountered" so we can handle the negative space

    if (!location) {
      location = Object.assign(
        {},
        translatedLocation,
        await geocode(address),
        {
          externalLocationId: addressHash,
          externalSource: 'ALBA',
        }
      );

      location = await DAL.insertLocation(location);
    }

    const { locationId } = location;
    const territory = null;

    translatedCongregationLocation = Object.assign({}, translatedCongregationLocation, {
      locationId,
      territoryId: territory ? territory.territoryId : null
    });

    if (!congregationLocation) {
      congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
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
        await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'U', source });
        congregationLocation = Object.assign({}, congregationLocation, diff);
      }
    }

    return { location, congregationLocation };
  };

  const sourceData = await loadFile(inputData);
  const existingLocations = await DAL.getLocationsForCongregationFromSource(congregationId, source);
  const updatedLocations = await serializeTasks(sourceData.map(x => () => importLocation(existingLocations, x)));

  const deletedLocations = differenceBy(existingLocations, updatedLocations, 'location.locationId');
  await serializeTasks(deletedLocations.map(({ location: { locationId } }) => async () => {
    await DAL.deleteCongregationLocation({ congregationId, locationId });
    await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'D', source });
  }));
};
