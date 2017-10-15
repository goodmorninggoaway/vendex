const { DAL } = require('../../../dataAccess');
const { diff } = require('deep-diff');

exports.requires = ['location', 'externalLocation', 'congregationId', 'source'];
exports.returns = 'congregationLocation';
exports.handler = async function translateToCongregationLocation({ externalLocation, congregationId, location: { locationId }, source }) {
  let translatedCongregationLocation = {
    congregationId,
    locationId,
    source,
    sourceData: externalLocation,
    language: externalLocation.Language ? externalLocation.Language.toUpperCase() : 'N/A', // TODO create automanaged enumeration
    sourceLocationId: externalLocation.Address_ID,
    isPendingTerritoryMapping: 0,
    isDeleted: 0, // TODO what to do with this?
    isActive: 1, // TODO what to do with this?
    notes: externalLocation.Notes,
    userDefined1: externalLocation.Kind,
    userDefined2: externalLocation.Account,
  };

  let congregationLocation = await DAL.findCongregationLocation({ congregationId, locationId, source });

  if (!congregationLocation) {
    congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
    await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'I', source });

  } else {
    // Update only when there is a change
    const diffs = diff(congregationLocation, translatedCongregationLocation);
    if (diffs.length) {
      congregationLocation = await DAL.updateCongregationLocation(congregationId, locationId, translatedCongregationLocation);
      await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'U', source });
    }
  }

  return congregationLocation;
};
