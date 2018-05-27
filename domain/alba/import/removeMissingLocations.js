const differenceBy = require('lodash/differenceBy');
const uniq = require('lodash/uniq');
const { executeConcurrently } = require('../../util');
const { CongregationLocation } = require('../../models');

exports.requires = ['importedLocations', 'existingLocations', 'congregationId', 'source'];
exports.returns = 'deletedLocations';
exports.handler = async function removeMissingLocations({ congregationId, importedLocations, existingLocations, source }) {
  const deletedLocations = uniq(differenceBy(existingLocations, importedLocations));
  const worker = ({ locationId }) => CongregationLocation.detachCongregationLocation({ congregationId, locationId, source });

  executeConcurrently(deletedLocations, worker);
};
