const { DAL } = require('../../dataAccess');
const keyBy = require('lodash/keyBy');

exports.requires = ['congregationId'];
exports.returns = 'indexedLocations';
exports.handler = async function getLocations({ congregationId }) {
  let locations = await DAL.getLocationsForCongregation(congregationId);
  locations = keyBy(locations, 'location.locationId');
  return locations;
};
