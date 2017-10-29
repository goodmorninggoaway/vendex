const { DAL } = require('../../dataAccess');
const keyBy = require('lodash/keyBy');

exports.requires = ['congregationId'];
exports.returns = 'indexedLocations';
exports.handler = async function getIndexedLocations({ congregationId }) {
  const locations = await DAL.getLocationsForCongregation(congregationId);
  return keyBy(locations, 'locationId');
};
