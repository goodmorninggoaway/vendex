const groupBy = require('lodash/groupBy');
const { CongregationLocationActivity, ExportActivity } = require('../models');

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
    return 'U';
  case 'DU':
  case 'DD':
    return 'D';
  case 'UI':
  case 'II':
    return 'I';
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
    .where('congregationLocationActivityId', '>', minCongregationLocationActivityId)
    .where('congregationId', congregationId)
    .where('source', '!=', destination)
    .orderBy('congregationLocationActivityId');

  return Object.values(groupBy(activities, 'locationId'))
    .reduce((memo, locationActivities) => {
      const range = getActivityRange(locationActivities);
      const operation = determineExportOperation(range);

      memo.push({
        operation,
        congregationLocationActivityId: parseInt(range.terminalActivity.congregationLocationActivityId),
        locationId: range.terminalActivity.locationId,
      });

      return memo;
    }, []);
};
