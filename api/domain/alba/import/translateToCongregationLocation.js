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
exports.handler = async function translateToCongregationLocation({ externalLocation, congregation, location: { locationId }, source }) {
  const { congregationId } = congregation;
  const attributes = compact([
    sourceKindTagMap[(externalLocation.Kind || '').toLowerCase()],
    sourceStatusTagMap[(externalLocation.Status || '').toLowerCase()],
  ]);

  const { language } = (await DAL.findLanguage(externalLocation.Language)) || { language: 'Unknown' };
  const sourceCongregation = congregation.sources.find(x => x.name.toLowerCase().replace(' ', '') === externalLocation.Account.toLowerCase().replace(' ', ''));
  const sourceCongregationId = sourceCongregation && sourceCongregation.congregationId;

  if (!sourceCongregationId) {
    return null;
  }

  let translatedCongregationLocation = {
    congregationId,
    locationId,
    source,
    language,
    attributes,
    sourceCongregationId,
    sourceData: externalLocation, // TODO remove this
    sourceLocationId: externalLocation.Address_ID,
    isPendingTerritoryMapping: 0,
    isDeleted: 0, // TODO what to do with this?
    isActive: 1, // TODO what to do with this?
    notes: externalLocation.Notes,
    // userDefined2: externalLocation.Account, // TODO add a sourceCongregationId
  };

  let congregationLocation = await DAL.findCongregationLocation({ congregationId, locationId, source });

  if (!congregationLocation) {
    congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
    await DAL.addCongregationLocationActivity({ congregationId: sourceCongregationId, locationId, operation: 'I', source });

  } else {
    // Update only when there is a change
    const diffs = diff(congregationLocation, translatedCongregationLocation);
    if (diffs.length) {
      congregationLocation = await DAL.updateCongregationLocation(congregationId, locationId, translatedCongregationLocation);
      await DAL.addCongregationLocationActivity({ congregationId: sourceCongregationId, locationId, operation: 'U', source });
    }
  }

  return congregationLocation;
};
