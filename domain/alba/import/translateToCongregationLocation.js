const compact = require('lodash/compact');
const { diff } = require('deep-diff');
const { DAL } = require('../../dataAccess');
const TAGS = require('../../models/enums/tags');
const { AlbaIntegration, CongregationLocationActivity } = require('../../models');

const sourceKindTagMap = {
  'foreign-language': TAGS.FOREIGN_LANGUAGE,
};

const sourceStatusTagMap = {
  'Do not call': TAGS.DO_NOT_CALL,
  '': TAGS.PENDING,
};

exports.requires = ['location', 'externalLocation', 'congregation', 'source'];
exports.returns = 'congregationLocation';
exports.handler = async function translateToCongregationLocation({
  externalLocation,
  congregation,
  location: { locationId },
  source,
  albaLocationImportId,
}) {
  const { congregationId } = congregation;
  const attributes = compact([
    sourceKindTagMap[(externalLocation.Kind || '').toLowerCase()],
    sourceStatusTagMap[(externalLocation.Status || '').toLowerCase()],
  ]);

  const { language } = (await DAL.findLanguage(externalLocation.Language)) || { language: 'Unknown' };

  const hasIntegration = await AlbaIntegration.hasIntegration({ congregationId, source, language, account: externalLocation.Account });

  let translatedCongregationLocation = {
    congregationId,
    locationId,
    source,
    language,
    attributes,
    sourceData: null, // TODO remove this
    sourceLocationId: externalLocation.Address_ID,
    isPendingTerritoryMapping: false,
    isDeleted: false, // TODO what to do with this?
    isActive: true, // TODO what to do with this?
    notes: externalLocation.Notes,
    userDefined1: null,
    userDefined2: null,
    territoryId: null,
  };

  let congregationLocation = await DAL.findCongregationLocation({ congregationId, locationId, source });

  // This congregationLocation was imported at one time, but the congregation integration is no longer active.
  // This can happen when the language is changed to another foreign language or the destination congregation's language.
  if (congregationLocation && !hasIntegration) {
    await CongregationLocationActivity.addAlbaActivity(albaLocationImportId, {
      congregation_id: congregationId,
      location_id: locationId,
      operation: 'D',
      source,
    });
    return null;
  } else if (!congregationLocation) {
    if (!hasIntegration) {
      return null;
    }

    // New congregationLocation
    congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);

    await CongregationLocationActivity.addAlbaActivity(albaLocationImportId, {
      congregation_id: congregationId,
      location_id: locationId,
      operation: 'I',
      source,
    });
  } else {
    // Update only when there is a change
    const diffs = diff(congregationLocation, translatedCongregationLocation);
    if (diffs && diffs.length) {
      congregationLocation = await DAL.updateCongregationLocation({ congregationId, locationId }, translatedCongregationLocation);
      await CongregationLocationActivity.addAlbaActivity(albaLocationImportId, {
        congregation_id: congregationId,
        location_id: locationId,
        operation: 'U',
        source,
      });
    }
  }

  return congregationLocation;
};
