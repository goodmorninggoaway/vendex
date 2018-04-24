const compact = require('lodash/compact');
const { diff } = require('deep-diff');
const { DAL } = require('../../dataAccess');
const TAGS = require('../../models/enums/tags');

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

  const { language } = (await DAL.findLanguage(externalLocation.Language)) || {
    language: 'Unknown',
  };
  const sourceCongregation = congregation.integrationSources.find(
    ({ language: integrationLanguage, sourceCongregation }) =>
      sourceCongregation.name.toLowerCase().replace(' ', '') ===
      externalLocation.Account.toLowerCase().replace(' ', '') &&
      (!integrationLanguage ||
        integrationLanguage === language ||
        integrationLanguage.toLowerCase() === 'any'),
  );
  const sourceCongregationId =
    sourceCongregation && sourceCongregation.sourceCongregationId;

  let translatedCongregationLocation = {
    congregationId,
    locationId,
    source,
    language,
    attributes,
    sourceCongregationId,
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
  if (congregationLocation && !sourceCongregationId) {
    await DAL.addCongregationLocationActivity({
      congregationId: congregationLocation.sourceCongregationId,
      locationId,
      operation: 'D',
      source,
      albaLocationImportId,
    });
    return null;
  } else if (!congregationLocation) {
    if (!sourceCongregationId) {
      return null;
    }

    // New congregationLocation
    congregationLocation = await DAL.insertCongregationLocation(
      translatedCongregationLocation,
    );
    await DAL.addCongregationLocationActivity({
      congregationId: sourceCongregationId,
      locationId,
      operation: 'I',
      source,
      albaLocationImportId,
    });
  } else {
    // Update only when there is a change
    const diffs = diff(congregationLocation, translatedCongregationLocation);
    if (diffs && diffs.length) {
      congregationLocation = await DAL.updateCongregationLocation(
        { congregationId, locationId },
        translatedCongregationLocation,
      );
      await DAL.addCongregationLocationActivity({
        congregationId: sourceCongregationId,
        locationId,
        operation: 'U',
        source,
        albaLocationImportId,
      });
    }
  }

  return congregationLocation;
};
