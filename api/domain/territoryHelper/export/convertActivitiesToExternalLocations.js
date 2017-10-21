const compact = require('lodash/compact');
const map = require('lodash/map');
const { serializeTasks } = require('../../util');
const Pipeline = require('../../pipeline');
const { DAL } = require('../../dataAccess');
const getActivityAttributes = require('./getActivityAttributes');
const applyRules = require('./applyRules');
const findTerritory = require('./findTerritory');
const convertToExternalLocation = require('./convertToExternalLocation');
const isCongregationAuthorized = require('./isCongregationAuthorized');

exports.requires = ['congregationId', 'congregation', 'destination', 'indexedLocations', 'activities'];
exports.returns = 'externalLocations';
exports.handler = async function convertActivitiesToExternalLocations({ congregationId, destination, indexedLocations, activities, congregation }) {
  const reconciled = await serializeTasks(activities.map(({ operation, sourceCongregationId, locationId, congregationLocationActivityId }) => () => (
    new Pipeline({
      congregationId,
      destination,
      operation,
      sourceCongregationId,
      indexedLocations,
      congregation,
      congregationLocationActivityId,
      location: indexedLocations[locationId],
    })
      .addHandler(getActivityAttributes)
      .addHandler(isCongregationAuthorized)
      .addHandler(applyRules)
      .addHandler(findTerritory)
      .addHandler(convertToExternalLocation)
      .execute()))
  );

  const ids = compact(reconciled.map(x => x.externalLocation && x.congregationLocationActivityId));
  const lastCongregationLocationActivityId = Math.max(...ids);
  if (lastCongregationLocationActivityId > 0) {
    await DAL.insertExportActivity({ lastCongregationLocationActivityId, destination, congregationId });
  }

  return reconciled.map(({ externalLocation, operation }) => ({ externalLocation, operation }));
};
