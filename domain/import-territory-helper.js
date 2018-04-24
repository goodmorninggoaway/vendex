const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const addressUtils = require('./validateAddress');
const DAL = require('./dataAccess').DAL;
const { serializeTasks } = require('./util');
const TAGS = require('./models/enums/tags');
const LOCATION_INTERFACES = require('./models/enums/locationInterfaces');
const CongregationLocationActivity = require('./models/CongregationLocationActivity');
const Location = require('./models/Location');
const CongregationLocation = require('./models/CongregationLocation');

const source = LOCATION_INTERFACES.TERRITORY_HELPER;

module.exports = async ({ congregationId, sourceData }) => {
  const importLocation = async (externalLocation) => {
    try {
      // Ignore local-language DNCs
      if (externalLocation.Status !== 'Language') {
        //return;
      }

      const attributes = [];
      const address = `${externalLocation.Address} ${externalLocation.City} ${externalLocation.State} ${externalLocation['Postal code']}`;
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
        language: externalLocation.Language && externalLocation.Language.toUpperCase(), // TODO create automanaged enumeration
        sourceLocationId: null,
        isPendingTerritoryMapping: true,
        isDeleted: false,
        isActive: true,
        notes: externalLocation.Notes || null,
      };

      const addressHash = hash.sha1(translatedLocation);
      //let { location, congregationLocation } = locations.find(x => x.location.externalLocationId === addressHash) || {};

      let congregationLocation;
      let location = await Location.query().findOne({ externalLocationId: addressHash }).eager('[congregationLocations]');
      if (!location) {
        location = Object.assign({}, translatedLocation, {
          externalLocationId: addressHash,
          latitude: +externalLocation.Latitude,
          longitude: +externalLocation.Longitude,
          externalSource: source,
        });
        location = await DAL.insertLocation(location);
        console.log(`Created "location": ${location.locationId}`);
      } else {
        congregationLocation = location.congregationLocations.find(x => x.source === source);
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
        translatedCongregationLocation.isPendingTerritoryMapping = false;
      }

      if (!congregationLocation) {
        congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
        console.log(`Created "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

        await CongregationLocationActivity.query().insert({
          congregationId,
          locationId,
          operation: 'I',
          source,
        });
      } else {
        const diff = Object.entries(translatedCongregationLocation).reduce(
          (memo, [key, value]) => {
            // Array comparison
            if ((Array.isArray(value) || Array.isArray(congregationLocation[key]))) {
              if (differenceBy(value, congregationLocation[key]).length) {
                memo[key] = value;
              }
            } else if (congregationLocation[key] !== value) {
              memo[key] = value;
            }

            return memo;
          }, {});

        if (Object.keys(diff).length) {
          await DAL.updateCongregationLocation({ congregationId, locationId }, diff);
          console.log(`Updated "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

          await CongregationLocationActivity.query().insert({
            congregationId,
            locationId,
            operation: 'U',
            source,
          });

          congregationLocation = Object.assign({}, congregationLocation, diff);
        }
      }

      return location;
    } catch (ex) {
      console.error(ex);
      return null;
    }
  };

  const updatedLocations = (
    await serializeTasks(
      sourceData.map((x, index) => () => {
        console.log(`Processing Territory Helper Location Import ${index + 1}/${sourceData.length}`);
        return importLocation(x);
      })
    )
  ).filter(x => x);

  const existingLocations = await Location.query()
    .select('location.*')
    .innerJoin('congregationLocation', 'location.locationId', '=', 'congregationLocation.locationId')
    .where({ 'congregationLocation.congregationId': congregationId, 'congregationLocation.deleted': false });

  const deletedLocations = differenceBy(existingLocations, updatedLocations, 'locationId');
  await serializeTasks(
    deletedLocations.map(({ locationId }) => async () => {
      await DAL.deleteCongregationLocation({ congregationId, locationId });
      console.log(`Deleted "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

      await CongregationLocationActivity.query().insert({
        congregationId,
        locationId,
        operation: 'D',
        source,
      });
    }),
  );
};
