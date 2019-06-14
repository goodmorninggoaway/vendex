const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const { transaction } = require('objection');
const addressUtils = require('./validateAddress');
const DAL = require('./dataAccess').DAL;
const { serializeTasks } = require('./util');
const TAGS = require('./models/enums/tags');
const SOURCES = require('./models/enums/locationInterfaces');
const OPERATIONS = require('./models/enums/activityOperations');
const { diff } = require('deep-diff');
const { CongregationLocationActivity, CongregationLocation } = require('./models');

module.exports = async ({ congregationId, externalLocations }) => {
  const source = SOURCES.TERRITORY_HELPER;
  const importLocation = async (externalLocation) => {
    const attributes = [];
    const address = `${externalLocation.Address || ''} ${externalLocation.City || ''} ${externalLocation.State || ''} ${externalLocation.PostalCode || ''}`.trim();
    const translatedLocation = addressUtils.getAddressParts(address);

    if (externalLocation.TypeName === 'Language') {
      attributes.push(TAGS.FOREIGN_LANGUAGE);
    }

    if (externalLocation.StatusName === 'DoNotCall') {
      attributes.push(TAGS.DO_NOT_CALL);
    }

    let translatedCongregationLocation = {
      congregationId,
      source,
      attributes,
      sourceData: null,
      language: externalLocation.LanguageName.toUpperCase(), // TODO create automanaged enumeration
      sourceLocationId: externalLocation.Id + '',
      isPendingTerritoryMapping: true,
      isDeleted: false,
      isActive: externalLocation.Approved,
      notes: externalLocation.Notes || '',
      userDefined1: null,
      userDefined2: null,
      sourceCongregationId: null,
      deleted: null,
      sourceAccount: externalLocation.CongregationId + ''
    };

    const territory = await DAL.findTerritory({
      congregationId,
      externalTerritorySource: source,
      externalTerritoryId: externalLocation.TerritoryId,
    });

    if (territory) {
      translatedCongregationLocation.territoryId = parseInt(territory.territoryId);
      translatedCongregationLocation.isPendingTerritoryMapping = false;
    }

    const addressHash = hash.sha1(translatedLocation);
    let location = await DAL.findLocation({ externalLocationId: addressHash });
    let congregationLocation = await DAL.findCongregationLocation({ congregationId, source, sourceLocationId: externalLocation.Id });

    if (!location) {
      const { lat, lng } = JSON.parse(externalLocation.LatLng) || {};
      location = Object.assign({}, translatedLocation, {
        externalLocationId: addressHash,
        externalSource: source,
        latitude: lat,
        longitude: lng,
      });
      location = await DAL.insertLocation(location);
      console.log(`Created "location": ${location.locationId}`);
    }

    const { locationId } = location;
    translatedCongregationLocation.locationId = locationId;

    if (!congregationLocation) {
      congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
      console.log(`Created "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);
      await CongregationLocationActivity.addActivity({
        congregation_id: congregationId,
        location_id: locationId,
        operation: OPERATIONS.INSERT,
        source,
      });
    } else {
      congregationLocation.territoryId = congregationLocation.territoryId && parseInt(congregationLocation.territoryId);
      const diffs = diff(congregationLocation, translatedCongregationLocation);
      if (diffs && diffs.length) {
        const result = await DAL.updateCongregationLocation({ congregationId, locationId, source, sourceLocationId: externalLocation.Id }, translatedCongregationLocation);
        congregationLocation = translatedCongregationLocation;
        console.log(`Updated "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

        await CongregationLocationActivity.addActivity({
          congregation_id: congregationId,
          location_id: locationId,
          operation: OPERATIONS.UPDATE,
          source,
        });
      }
    }

    return { Location: location, CongregationLocation: congregationLocation };
  };

  const existingCongregationLocations = await DAL.findCongregationLocations({ congregationId, source, isDeleted: false }).select({ sourceLocationId: 'sourceLocationId', locationId: 'locationId' });
  const updatedLocations = await serializeTasks(
    externalLocations.map((x, index) => () => {
      console.log(`Processing Territory Helper Location Import ${index + 1}/${externalLocations.length}`);
      return importLocation(x);
    }),
  );

  const updatedCongregationLocations = updatedLocations.map(loc => loc.CongregationLocation);
  await transaction(CongregationLocation.knex(), async (trx) => {
    await serializeTasks(
      differenceBy(existingCongregationLocations, updatedCongregationLocations, 'sourceLocationId')
        .map((existingCongregationLocation) => async () => {
          await CongregationLocation.detachCongregationLocationBySource({ congregationId, locationId: existingCongregationLocation.locationId, sourceLocationId: existingCongregationLocation.sourceLocationId, source, trx });
        }),
    );
  });
};
