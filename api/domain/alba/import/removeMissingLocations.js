const differenceBy = require('lodash/differenceBy');
const { executeConcurrently } = require('../../util');
const { DAL } = require('../../dataAccess');

exports.requires = ['importedLocations', 'existingLocations', 'congregationId', 'source'];
exports.returns = 'deletedLocations';
exports.handler = async function removeMissingLocations({ congregationId, importedLocations, existingLocations, source }) {
  const deletedLocations = differenceBy(existingLocations, importedLocations, 'location.locationId');
  const worker = async ({ location: { locationId } }) => {
    await DAL.deleteCongregationLocation({ congregationId, locationId });
    console.log(`Deleted "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);
    await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'D', source });
  };

  executeConcurrently(deletedLocations, worker);
};
