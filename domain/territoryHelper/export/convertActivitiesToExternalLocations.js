const compact = require('lodash/compact');
const groupBy = require('lodash/groupBy');
const { executeConcurrently } = require('../../util');
const OPERATION = require('../../models/enums/activityOperations');
const Pipeline = require('../../pipeline');
const { DAL } = require('../../dataAccess');
const { ExportActivity } = require('../../models');
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
  'destinationCongregationId',
  'locationTypes',
  'locationStatuses',
  'locationLanguages'
];
exports.returns = ['externalLocations', 'exportActivityId'];
exports.handler = async function convertActivitiesToExternalLocations({
  congregationId,
  destination,
  indexedLocations,
  activities,
  congregation,
  exportTracer,
  destinationCongregationId,
  locationTypes,
  locationStatuses,
  locationLanguages
}) {
  const worker = ({ operation, locationId, congregationLocationActivityId }) =>
    new Pipeline({
      congregationId,
      destination,
      operation,
      indexedLocations,
      congregation,
      congregationLocationActivityId,
      location: indexedLocations[locationId],
      destinationCongregationId,
      locationTypes,
      locationStatuses,
      locationLanguages
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
    inserts: inserts ? inserts.filter(x => x.externalLocation).map(x => x.externalLocation) : [],
    updates: updates ? updates.filter(x => x.externalLocation).map(x => x.externalLocation) : [],
    deletes: deletes ? deletes.filter(x => x.externalLocation && x.externalLocation.Id).map(x => x.externalLocation) : [],
  };

  const territoryConflictCount = payload.inserts.filter(x => x.Territories.length > 1 && x.TerritoryId == null).length +
    payload.updates.filter(x => x.Territories.length > 1 && x.TerritoryId == null).length;

  const missingTerritoryCount = payload.inserts.filter(x => x.Territories.length === 0 && x.TerritoryId == null).length +
    payload.updates.filter(x => x.Territories.length === 0 && x.TerritoryId == null).length;

  const summary = {
    inserts: inserts ? payload.inserts.length : 0,
    updates: updates ? payload.updates.length : 0,
    deletes: deletes ? payload.deletes.length : 0,
    territoryConflictCount,
    missingTerritoryCount,
    errorCount: 0,
    successCount: 0
  };

  // Get congregationLocationActivityId on exported activities
  const ids = compact(
    reconciled.map(x => x.externalLocation && x.congregationLocationActivityId),
  );

  if (ids.length == 0) {
    const { lastCongregationLocationActivityId } = (await ExportActivity.getLatest(congregationId, destination)) || {};
    if (lastCongregationLocationActivityId) {
      ids.push(lastCongregationLocationActivityId);
    }
  }

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
