const compact = require('lodash/compact');
const TAGS = require('../../models/enums/tags');

const locationStatus = {
  [TAGS.DO_NOT_CALL]: 'Do not call',
  [TAGS.FOREIGN_LANGUAGE]: 'Do not call',
  find(attributes) {
    return compact(attributes.map(x => this[x]))[0];
  },
};

const locationType = {
  [TAGS.FOREIGN_LANGUAGE]: 'Language',
  find(attributes) {
    return compact(attributes.map(x => this[x]))[0];
  },
};

exports.requires = ['nextCongregationLocation', 'location', '$messages', 'territory'];
exports.returns = 'externalLocation';
exports.handler = async function convertToExternalLocation({ nextCongregationLocation: congregationLocation, location, $messages, territory }) {
  const notes = `${congregationLocation.notes}\n${$messages.map(({ message, messageLevel }) => `${messageLevel}: ${message}\n`)}`;
  return {
    'Territory type': 'Homes', // TODO This should be a tag on the territory
    'Territory number': (territory && territory.externalTerritoryId) || '',
    'Location type': locationType.find(congregationLocation.attributes),
    'Location Status': locationStatus.find(congregationLocation.attributes),
    'Language': congregationLocation.language,
    'Latitude': location.latitude,
    'Longitude': location.longitude,
    'Address': `${location.number} ${location.street}`,
    'Number': location.number,
    'Street': location.street,
    'City': location.city,
    'Postal code': location.zip,
    'State': location.state,
    'Country code': '',
    'Notes': notes,
  };
};

