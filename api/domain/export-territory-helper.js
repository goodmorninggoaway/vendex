const groupBy = require('lodash/groupBy');
const keyBy = require('lodash/keyBy');
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

  return {
    operation,
    congregationLocation,
    congregationLocationActivityId,
    location: location.location,
    otherCongregationLocations: location.congregationLocations.filter(x => x !== congregationLocation),
  };
};

const getStartCongregationLocationActivityId = async (congregationId) => {
  const lastExport = await DAL.getLastExportActivity({ congregationId, destination });
  let minCongregationLocationActivityId = 0;
  if (lastExport) {
    minCongregationLocationActivityId = lastExport.lastCongregationLocationActivityId;
  }

  return minCongregationLocationActivityId + 1;
};

const convert = ({ location, congregationLocation = {}, externals, message }) => Object.assign({
  'Territory type': 'Homes', // TODO This should be a tag on the territory
  'Territory number': location.territoryId, // TODO handle conflicts
  'Location type': 'Language',
  'Location Status': 'Do not call', // TODO setting both because there is a conflict between the sample and export
  'Status': 'Do not call', // TODO setting both because there is a conflict between the sample and export
  'Language': congregationLocation.language,
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
  const isDoNotCall = albaCongregationLocation.sourceData['Status'] === 'Do not call';
  const isForeignLanguageInSource = albaCongregationLocation.sourceData['Language'] && albaCongregationLocation.sourceData['Language'].toUpperCase() !== 'ENGLISH'; // TODO this should be congrgration.language
  const sourceLocationType = congregationLocation ? congregationLocation.sourceData['Location Type'] : null;
  const isForeignLanguageInDestination = sourceLocationType === 'Language';
  const isTrackedByAlbaCongregation = albaCongregationLocation.sourceData['Kind'] === 'Foreign-Language' && albaCongregationLocation.sourceData['Status'] !== '';
  const isPassthroughIgnore = !operation;
  const { isInsert } = booleanOperation(operation);

  if (isPassthroughIgnore) {
    return false;
  }

  if (isDoNotCall && !isForeignLanguageInSource && !isInsert) {
    if (isForeignLanguageInDestination) {
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

  if (!isDoNotCall && !isForeignLanguageInSource && !isForeignLanguageInDestination && !isInsert) {
    return Object.assign({}, attributes, { conflict: true, message: 'This is a foreign-language location in ALBA, but not in TH.' });
  }

  if (!isTrackedByAlbaCongregation && !isForeignLanguageInSource && isForeignLanguageInDestination) {
    if (isInsert) {
      return false; // It was never added, so don't add it
    }

    return Object.assign({}, attributes, { operation: 'D', message: 'This location has transitioned from foreign-language back to local language.' });
  }

  if (isInsert) {
    return Object.assign({}, attributes, { congregationLocation: albaCongregationLocation });
  }

  return attributes;
};

const applyTerritory = async (location) => {
  const containingTerritories = await DAL.findTerritoryContainingPoint(congregationId, location.location);
  const originalTerritoryId = location.otherCongregationLocations.length && location.otherCongregationLocations[0].territoryId;

  if (containingTerritories.length === 1) {
    const { territoryId } = containingTerritories[0];
    if (territoryId === originalTerritoryId) {
      // Nothing changed and it's all good
      return;
    }

    if (!originalTerritoryId) {
      // No territory was set, but we found a single match
      location.congregationLocation.territoryId = territoryId;
      return;
    }
  } else {
    const matchesExistingTerritory = containingTerritories.some(x => x.territoryId === location.congregationLocation.territoryId);
    if (matchesExistingTerritory) {
      // Assume the existing system is already correct and do nothing
      return;
    }
  }

  // All other cases where there was a conflict between source and calculated data OR mutiple matches
  location.territoryMatches = containingTerritories;
};

module.exports = async ({ congregationId, wantsFile }) => {
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

  const createExportFromActivity = async (activity) => {
    await applyTerritory(activity);
    return convert(activity);
  };

  const createExports = (activities) => serializeTasks(activities.map(x => () => createExportFromActivity(x)));

  const startAt = await getStartCongregationLocationActivityId(congregationId);
  const exportActivities = await getRawDataToExport(startAt, congregationId);
  const output = {
    inserts: await createExports(exportActivities.I),
    updates: await createExports(exportActivities.U),
    deletes: await createExports(exportActivities.D),
  };

  return wantsFile ? await createFile(output) : output;
};
