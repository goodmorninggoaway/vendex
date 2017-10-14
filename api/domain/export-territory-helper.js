const groupBy = require('lodash/groupBy');
const keyBy = require('lodash/keyBy');
const pluck = require('lodash/map');
const { serializeTasks } = require('./util');
const XLSX = require('xlsx');
const DAL = require('./dataAccess').DAL;

const destination = 'TERRITORY HELPER';

const getActivityRange = (locationActivities) => ({
  initialActivity: locationActivities[0],
  terminalActivity: locationActivities.slice(-1)[0]
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

const findActivityAttributes = (locations, operation, { locationId, congregationLocationActivityId }) => {
  if (!operation) {
    return;
  }

  const location = locations[locationId];

  // Somehow this got in the mix even though it's not (or no longer) associated wth the congregation
  if (!location) {
    return;
  }

  const congregationLocation = location.congregationLocations.find(x => x.source === destination);
  const otherCongregationLocations = location.congregationLocations.filter(x => x !== congregationLocation);

  return {
    operation,
    congregationLocation,
    congregationLocationActivityId,
    otherCongregationLocations,
    location: location.location,
  };
};

const getStartCongregationLocationActivityId = async (congregationId) => {
  const lastExport = await DAL.getLastExportActivity({ congregationId, destination });
  let minCongregationLocationActivityId = 0;
  if (lastExport) {
    // TODO Why am I getting a string for a BIGINT lastCongregationLocationActivityId?
    minCongregationLocationActivityId = parseInt(lastExport.lastCongregationLocationActivityId);
  }

  return minCongregationLocationActivityId + 1;
};

const convert = ({ location, congregationLocation = {}, externals, message, otherCongregationLocations }) => Object.assign({
  'Territory type': 'Homes', // TODO This should be a tag on the territory
  'Territory number': congregationLocation.territoryId, // TODO handle conflicts
  'Location type': 'Language',
  'Location Status': 'Do not call', // TODO setting both because there is a conflict between the sample and export
  'Status': 'Do not call', // TODO setting both because there is a conflict between the sample and export
  'Language': congregationLocation.language || otherCongregationLocations[0].sourceData.Language,
  'Latitude': location.latitude,
  'Longitude': location.longitude,
  'Address': `${location.number} ${location.street}`,
  'Number': location.number,
  'Street': location.street,
  'City': location.city,
  'Postal code': location.zip,
  'State': location.state,
  'Country code': location.countryCode,
  'Notes': message || congregationLocation.notes,
}, externals);

const booleanOperation = operation => ({ isDelete: operation === 'D', isUpdate: operation === 'U', isInsert: operation === 'I' });


const createFile = async ({ inserts, updates, deletes }) => {
  const workbook = {
    Sheets: {
      'New': XLSX.utils.json_to_sheet(inserts),
      'Updates': XLSX.utils.json_to_sheet(updates),
      'Deletions': XLSX.utils.json_to_sheet(deletes)
    },
    SheetNames: ['New', 'Updates', 'Deletions'],
  };

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', compression: true });
};

const applyRules = (attributes) => {
  if (!attributes) {
    return;
  }

  const { operation, otherCongregationLocations, congregationLocation } = attributes;
  const [albaCongregationLocation] = otherCongregationLocations.filter(x => x.source === 'ALBA');
  const isDoNotCall = albaCongregationLocation.sourceData['Status'].toLowerCase() === 'do not call';
  const isForeignLanguageInSource = albaCongregationLocation.sourceData['Language'] && albaCongregationLocation.sourceData['Language'].toUpperCase() !== 'ENGLISH'; // TODO this should be congrgration.language
  const isLocalLanguageInSource = albaCongregationLocation.sourceData['Language'] && albaCongregationLocation.sourceData['Language'].toUpperCase() === 'ENGLISH'; // TODO this should be congrgration.language
  const sourceLocationType = congregationLocation ? congregationLocation.sourceData['Location Type'] : null;
  const isForeignLanguageInDestination = sourceLocationType === 'Language';
  const isTrackedByAlbaCongregation = albaCongregationLocation.sourceData['Kind'].toLowerCase() === 'foreign-language' && albaCongregationLocation.sourceData['Status'] !== '';
  const isPassthroughIgnore = !operation;
  const { isInsert } = booleanOperation(operation);
  const existsInDestination = congregationLocation && Object.keys(congregationLocation).length > 1;

  if (isPassthroughIgnore) {
    return false;
  }

  // Converted to a local-language DNC in the foreign-language system, so add/update it as a DNC
  if (isDoNotCall && !isForeignLanguageInSource) {
    if (isForeignLanguageInDestination && !isInsert) {
      // Assume it came from the source
      return false;
    }

    return Object.assign(
      {},
      attributes,
      {
        external: {
          'Location type': 'Home',
          'Location Status': 'Do not call',
          'Status': 'Do not call',
          'Language': 'English',
        },
        message: 'Converting to a regular DNC for this congregation\'s language',
      }
    );
  }

  if (!isDoNotCall && !isForeignLanguageInSource && !isForeignLanguageInDestination) {
    return Object.assign({}, attributes, { operation: 'D', message: 'This location no longer tracked by foreign-language.' });
  }

  if (!isTrackedByAlbaCongregation && !isForeignLanguageInSource && isForeignLanguageInDestination) {
    if (isInsert) {
      return false; // It was never added, so don't add it
    }

    return Object.assign({}, attributes, { operation: 'D', message: 'This location has transitioned from foreign-language back to local language.' });
  }

  if (isInsert) {
    return Object.assign({}, attributes, { congregationLocation: Object.assign({}, albaCongregationLocation, { territoryId: null }) });
  }

  return attributes;
};

const updateWithTerritory = async (location, congregationId) => {
  const containingTerritories = await DAL.findTerritoryContainingPoint(congregationId, location.location);
  const originalTerritoryId = location.congregationLocation ? location.congregationLocation.territoryId : null;

  if (containingTerritories.length === 1) {
    const { externalTerritoryId, territoryId } = containingTerritories[0];
    if (territoryId === originalTerritoryId) {
      // Nothing changed and it's all good
      return;
    }

    if (!originalTerritoryId) {
      // No territory was set, but we found a single match
      location.congregationLocation = location.congregationLocation || {};
      location.congregationLocation.territoryId = externalTerritoryId;
      return;
    }
  } else {
    const matchesExistingTerritory = containingTerritories.some(x => location.congregationLocation && x.territoryId === location.congregationLocation.territoryId);
    if (matchesExistingTerritory) {
      // Assume the existing system is already correct and do nothing
      return;
    }
  }

  // All other cases where there was a conflict between source and calculated data OR mutiple matches
  location.territoryMatches = containingTerritories;
};

const createExportFromActivity = async (activity, congregationId) => {
  await updateWithTerritory(activity, congregationId);
  return convert(activity);
};

const createExports = (activities, congregationId) => serializeTasks(activities.map(x => () => createExportFromActivity(x, congregationId)));

const getRawDataToExport = async (startAt, congregationId) => {
  const activities = await DAL.getCongregationLocationActivity({ congregationId, source: 'ALBA' }, startAt);
  let locations = await DAL.getLocationsForCongregation(congregationId);

  locations = keyBy(locations, 'location.locationId');

  return Object.values(groupBy(activities, 'locationId'))
    .reduce((memo, locationActivities) => {
      const range = getActivityRange(locationActivities);
      const operation = determineExportOperation(range);
      const attributes = applyRules(findActivityAttributes(locations, operation, range.terminalActivity));
      if (attributes) {
        memo[attributes.operation].push(attributes);
        memo.congregationLocationActivityId = attributes.congregationLocationActivityId;
      }

      return memo;
    }, { I: [], D: [], U: [], congregationLocationActivityId: 0 });
};

module.exports = async ({ congregationId, wantsFile }) => {
  const startAt = await getStartCongregationLocationActivityId(congregationId);
  const exportActivities = await getRawDataToExport(startAt, congregationId);
  const output = {
    inserts: await createExports(exportActivities.I, congregationId),
    updates: await createExports(exportActivities.U, congregationId),
    deletes: await createExports(exportActivities.D, congregationId),
  };

  const ids = pluck([...exportActivities.I, ...exportActivities.U, ...exportActivities.D], 'congregationLocationActivityId');
  const lastCongregationLocationActivityId = Math.max(...ids);
  if (lastCongregationLocationActivityId > 0) {
    await DAL.insertExportActivity({ lastCongregationLocationActivityId, destination, congregationId });
  }

  return wantsFile ? await createFile(output) : output;
};
