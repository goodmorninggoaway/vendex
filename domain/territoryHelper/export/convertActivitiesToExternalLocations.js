const compact = require('lodash/compact');
const groupBy = require('lodash/groupBy');
const { executeConcurrently } = require('../../util');
const OPERATION = require('../../models/enums/activityOperations');
const Pipeline = require('../../pipeline');
const { DAL } = require('../../dataAccess');
const getActivityAttributes = require('./getActivityAttributes');
const applyRules = require('./applyRules');
const findTerritory = require('./findTerritory');
const convertToExternalLocation = require('./convertToExternalLocation');
const isCongregationAuthorized = require('./isCongregationAuthorized');

exports.requires = [
  'congregationId',
  'congregation',
  'destination',
  'indexedLocations',
  'activities',
  'exportTracer',
];
exports.returns = ['externalLocations', 'exportActivityId'];
exports.handler = async function convertActivitiesToExternalLocations({
  congregationId,
  destination,
  indexedLocations,
  activities,
  congregation,
  exportTracer,
}) {
  const worker = ({
    operation,
    sourceCongregationId,
    locationId,
    congregationLocationActivityId,
  }) =>
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
      .execute();

  const reconciled = await executeConcurrently(activities, worker);

  const {
    [OPERATION.INSERT]: inserts,
    [OPERATION.UPDATE]: updates,
    [OPERATION.DELETE]: deletes,
  } = groupBy(reconciled, 'operation');

  const payload = {
    inserts: inserts ? inserts.map(x => x.externalLocation) : undefined,
    updates: updates ? updates.map(x => x.externalLocation) : undefined,
    deletes: deletes ? deletes.map(x => x.externalLocation) : undefined,
  };

  const summary = {
    inserts: inserts ? inserts.length : 0,
    updates: updates ? updates.length : 0,
    deletes: deletes ? deletes.length : 0,
  };
  // Get congregationLocationActivityId on exported activities
  const ids = compact(
    reconciled.map(x => x.externalLocation && x.congregationLocationActivityId),
  );

  // Get the last one so we know where to start next time
  const lastCongregationLocationActivityId = Math.max(...ids, 0);
  const activity = await DAL.insertExportActivity({
    destination,
    payload,
    summary,
    lastCongregationLocationActivityId,
    congregationId: Number(congregationId),
    timestamp: new Date(),
    key: exportTracer,
  });

  return {
    externalLocations: payload,
    exportActivityId: activity.exportActivityId,
  };
};
