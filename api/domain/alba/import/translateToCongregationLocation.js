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
  const sourceCongregation = congregation.integrationSources.find(({ language: integrationLanguage, sourceCongregation }) => (
    (sourceCongregation.name.toLowerCase().replace(' ', '') === externalLocation.Account.toLowerCase().replace(' ', '')) &&
    (!integrationLanguage || integrationLanguage === language || integrationLanguage.toLowerCase() === 'any')
  ));
  const sourceCongregationId = sourceCongregation && sourceCongregation.sourceCongregationId;

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

  if (!congregationLocation) {
    congregationLocation = await DAL.insertCongregationLocation(translatedCongregationLocation);
    await DAL.addCongregationLocationActivity({ congregationId: sourceCongregationId, locationId, operation: 'I', source });

  } else {
    // Update only when there is a change
    const diffs = diff(congregationLocation, translatedCongregationLocation);
    if (diffs && diffs.length) {
      congregationLocation = await DAL.updateCongregationLocation({ congregationId, locationId }, translatedCongregationLocation);
      await DAL.addCongregationLocationActivity({ congregationId: sourceCongregationId, locationId, operation: 'U', source });
    }
  }

  return congregationLocation;
};
