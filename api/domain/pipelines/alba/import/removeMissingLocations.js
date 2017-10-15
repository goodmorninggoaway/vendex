const differenceBy = require('lodash/differenceBy');
const { DAL } = require('../../../dataAccess');
const { serializeTasks } = require('../../../util');

exports.requires = ['importedLocations', 'existingLocations', 'congregationId', 'source'];
exports.returns = 'deletedLocations';
exports.handler = async function removeMissingLocations({ congregationId, importedLocations, existingLocations, source }) {
  const deletedLocations = differenceBy(existingLocations, importedLocations, 'location.locationId');
  await serializeTasks(deletedLocations.map(({ location: { locationId } }) => async () => {
    await DAL.deleteCongregationLocation({ congregationId, locationId });

    console.log(`Deleted "congregationLocation": locationId=${locationId}, congregationId=${congregationId}`);

    await DAL.addCongregationLocationActivity({ congregationId, locationId, operation: 'D', source });
  }));
};
