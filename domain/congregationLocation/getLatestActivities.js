const groupBy = require('lodash/groupBy');
const { DAL } = require('../dataAccess');

const getActivityRange = locationActivities => ({
  initialActivity: locationActivities[0],
  terminalActivity: locationActivities.slice(-1)[0],
});

const determineExportOperation = ({ initialActivity, terminalActivity }) => {
  const operation = `${terminalActivity.operation ||
    ''}${initialActivity.operation || ''}`;
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
exports.handler = async function getStartCongregationLocationActivity({
  congregationId,
  destination,
}) {
  const lastExport = await DAL.getLastExportActivity({
    congregationId,
    destination,
  });
  let minCongregationLocationActivityId = 0;
  if (lastExport) {
    minCongregationLocationActivityId = parseInt(
      lastExport.lastCongregationLocationActivityId,
    );
  }

  // TODO This will eventually overflow and error since it's a 64-bit integer
  minCongregationLocationActivityId++;
  const activities = await DAL.getCongregationLocationActivity({
    congregationId,
    destination,
    minCongregationLocationActivityId,
  });

  return Object.values(groupBy(activities, 'locationId')).reduce(
    (memo, locationActivities) => {
      const range = getActivityRange(locationActivities);
      const operation = determineExportOperation(range);

      memo.push({
        congregationLocationActivityId: parseInt(
          range.terminalActivity.congregationLocationActivityId,
        ),
        operation,
        locationId: range.terminalActivity.locationId,
        sourceCongregationId: range.terminalActivity.congregationId,
      });

      return memo;
    },
    [],
  );
};
