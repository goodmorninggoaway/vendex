const compact = require('lodash/compact');
const TAGS = require('../../models/enums/tags');

// maps location attributes to TH InternalName
const locationStatus = {
  [TAGS.DO_NOT_CALL]: 'DoNotCall',
  [TAGS.FOREIGN_LANGUAGE]: 'DoNotCall',
  find(attributes) {
    return compact(attributes.map(x => this[x]))[0];
  },
};

const locationType = {
  find(attributes) {
    if (attributes.includes(TAGS.FOREIGN_LANGUAGE)) {
      return 'Language';
    } else if (attributes.includes(TAGS.DO_NOT_CALL)) {
      return 'House';
    }
    return null;
  },
};

exports.requires = ['nextCongregationLocation', 'location', '$messages', 'destinationCongregationId', 'locationTypes', 'locationStatuses', 'locationLanguages'];
exports.optional = ['assignedTerritory', 'containingTerritories'];
exports.returns = 'externalLocation';
exports.handler = async function convertToExternalLocation({
  nextCongregationLocation: congregationLocation,
  location,
  $messages,
  assignedTerritory,
  containingTerritories,
  destinationCongregationId,
  locationTypes,
  locationStatuses,
  locationLanguages
}) {
  const internalLocationType = locationType.find(congregationLocation.attributes);
  const { Id: destinationLocationTypeId } = locationTypes.find(lt => lt.InternalName === internalLocationType) || {};

  const internalLocationStatus = locationStatus.find(congregationLocation.attributes);
  const { Id: destinationLocationStatusId } = locationStatuses.find(ls => ls.InternalName === internalLocationStatus) || {};

  const { Id: destinationLocationLanguageId } = locationLanguages.find(ll => ll.Name.toLowerCase() === congregationLocation.language.toLowerCase()) || {};

  const notes = `${congregationLocation.notes}\n${$messages.map(
    ({ message, messageLevel }) => `${messageLevel}: ${message}\n`,
  )}`;

  const territories = (containingTerritories || []).map(t => ({
    territoryId: t.territoryId,
    externalTerritoryId: t.externalTerritoryId,
    externalTerritoryName: t.externalTerritoryName
  }));

  let address = `${location.number || ''} ${location.street}`.trim();
  if (location.sec_unit_num) {
    address = `${address} ${location.sec_unit_type} ${location.sec_unit_num}`;
  }

  return {
    Id: congregationLocation.destinationLocationId,
    CongregationId: destinationCongregationId,
    TerritoryId: (assignedTerritory && assignedTerritory.externalTerritoryId) || null,
    TerritoryName: (assignedTerritory && assignedTerritory.externalTerritoryName) || '',
    Territories: territories,
    TypeId: destinationLocationTypeId,
    LocationTypeName: internalLocationType,
    Approved: true,
    StatusId: destinationLocationStatusId,
    StatusName: internalLocationStatus,
    LanguageId: destinationLocationLanguageId,
    LanguageName: congregationLocation.language,
    Address: address,
    Number: location.number,
    StreetName: location.street,
    City: location.city,
    County: null,
    PostalCode: location.zip,
    State: location.state,
    CountryCode: '',
    LatLng: (location.latitude && location.longitude) ? `{"lat":${location.latitude}, "lng":${location.longitude}}` : null,
    Latitude: location.latitude,
    Longitude: location.longitude,
    Notes: notes,
    DateLastVisited: null,
    Source: congregationLocation.source,
    SourceLocationId: congregationLocation.sourceLocationId,
    SourceAccount: congregationLocation.sourceAccount
  };
};
