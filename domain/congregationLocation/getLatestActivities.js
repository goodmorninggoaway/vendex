const groupBy = require('lodash/groupBy');
const { CongregationLocation, CongregationLocationActivity, ExportActivity } = require('../models');
const OPERATION = require('../models/enums/activityOperations');

const getActivityRange = locationActivities => ({
  initialActivity: locationActivities[0],
  terminalActivity: locationActivities.slice(-1)[0],
});

const determineExportOperation = ({ initialActivity, terminalActivity }) => {
  const operation = `${terminalActivity.operation || ''}${initialActivity.operation || ''}`;
  switch (operation) {
  case 'IU':
  case 'UU':
  case 'ID':
  case 'UD':
    return OPERATION.UPDATE;
  case 'DU':
  case 'DD':
    return OPERATION.DELETE;
  case 'UI':
  case 'II':
    return OPERATION.INSERT;
  case 'DI':
  default:
    return false;
  }
};

exports.requires = ['congregationId', 'destination'];
exports.returns = 'activities';
exports.handler = async function getStartCongregationLocationActivity({ congregationId, destination }) {
  const lastExport = await ExportActivity.query()
    .skipUndefined()
    .orderBy('lastCongregationLocationActivityId', 'desc')
    .findOne({ congregationId, destination });

  const minCongregationLocationActivityId = lastExport ? parseInt(lastExport.lastCongregationLocationActivityId) : 0;
  const activities = await CongregationLocationActivity.query()
    .where('congregation_location_activity_id', '>', minCongregationLocationActivityId)
    .where('congregation_id', congregationId)
    .where('source', '!=', destination)
    .orderBy('congregation_location_activity_id');

  return await Object.values(groupBy(activities, 'locationId'))
    .reduce(async (prevPromise, locationActivities) => {
      const memo = await prevPromise;
      const range = getActivityRange(locationActivities);
      let operation = determineExportOperation(range);

      const destinationCongregationLocation = await CongregationLocation.query()
        .findOne({ congregationId, source: destination, locationId: locationActivities[0].locationId });

      // If this location already exists in the destination with a valid id and this is an insert operation change it to an update.
      if (operation === OPERATION.INSERT && destinationCongregationLocation && destinationCongregationLocation.sourceLocationId) {
        operation = OPERATION.UPDATE;
      } else if (operation === OPERATION.UPDATE && (destinationCongregationLocation == null || (destinationCongregationLocation && destinationCongregationLocation.sourceLocationId == null))) {
        // This is a source update but a destination insert.
        operation = OPERATION.INSERT;
      }

      memo.push({
        operation,
        congregationLocationActivityId: parseInt(range.terminalActivity.congregationLocationActivityId),
        locationId: range.terminalActivity.locationId,
      });

      return memo;
    }, Promise.resolve([]));
};
