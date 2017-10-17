const { serializeTasks } = require('../../util');
const Pipeline = require('../../pipeline');
const getActivityAttributes = require('./getActivityAttributes');

exports.requires = ['congregationId', 'congregation', 'destination', 'indexedLocations', 'activities'];
exports.returns = '';
exports.handler = async function reconcileActivities({ congregationId, destination, indexedLocations, activities, congregation }) {
  return await serializeTasks(activities.map(({ operation, sourceCongregationId, locationId }) => () => (
    new Pipeline({ congregationId, destination, operation, sourceCongregationId, locationId, indexedLocations, congregation })
      .addHandler(getActivityAttributes)
      .addHandler()
      .execute()))
  );
};
