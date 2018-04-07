const differenceBy = require('lodash/differenceBy');
const uniq = require('lodash/uniq');
const { executeConcurrently } = require('../../util');
const { DAL } = require('../../dataAccess');

exports.requires = [
  'importedLocations',
  'existingLocations',
  'congregationId',
  'source',
];
exports.returns = 'deletedLocations';
exports.handler = async function removeMissingLocations({
  congregationId,
  importedLocations,
  existingLocations,
  source,
}) {
  const deletedLocations = uniq(differenceBy(existingLocations, importedLocations));
  const worker = async ({ locationId }) => {
    await DAL.deleteCongregationLocation({ congregationId, locationId });
    console.log(
      `Deleted "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`,
    );
    await DAL.addCongregationLocationActivity({
      congregationId,
      locationId,
      operation: 'D',
      source,
    });
  };

  executeConcurrently(deletedLocations, worker);
};
