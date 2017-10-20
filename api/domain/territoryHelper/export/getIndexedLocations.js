const { DAL } = require('../../dataAccess');
const keyBy = require('lodash/keyBy');

exports.requires = ['congregationId'];
exports.returns = 'indexedLocations';
exports.handler = async function getLocations({ congregationId }) {
  let locations = await DAL.getLocationsForCongregation(congregationId);
  locations = locations.map(({ location, congregationLocations }) => Object.assign({}, location, { congregationLocations }));
  locations = keyBy(locations, 'locationId');
  return locations;
};
