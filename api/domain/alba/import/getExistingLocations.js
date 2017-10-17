const { DAL } = require('../../dataAccess');

exports.requires = ['congregationId', 'source'];
exports.returns = 'existingLocations';
exports.handler = async function getExistingLocations({ congregationId, source }) {
  return await DAL.getLocationsForCongregationFromSource(congregationId, source);
};
