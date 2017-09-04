const { congregationId, outputDirectory, destination } = require('../options');
const path = require('path');
const fs = require('fs');
const groupBy = require('lodash/groupBy');
const keyBy = require('lodash/keyBy');
const { parseLocation } = require('parse-address');

/**
 * Fetch last export metadata
 * Fetch activity since last export
 * Build insert list
 * Build update list
 * Build delete list
 */

const promisify = require('util').promisify;
const XLSX = require('xlsx');
const DAL = require('../dataAccess').DAL;
const writeExcelFile = promisify(XLSX.writeFileAsync);


const isDir = (dpath) => {
    try {
        return fs.lstatSync(dpath).isDirectory();
    } catch (e) {
        return false;
    }
};

const mkdirp = (dirname) => {
    const segments = path.normalize(dirname).split(path.sep);
    segments.forEach((sdir, index) => {
        const pathInQuestion = segments.slice(0, index + 1).join(path.sep);
        if (!isDir(pathInQuestion) && pathInQuestion) {
            fs.mkdirSync(pathInQuestion);
        }
    });
};


const getStartCongregationLocationActivityId = async () => {
    const lastExport = await DAL.getLastExportActivity({ congregationId, destination });
    let minCongregationLocationActivityId = 0;
    if (lastExport) {
        minCongregationLocationActivityId = lastExport.lastCongregationLocationActivityId;
    }

    return minCongregationLocationActivityId + 1;
};

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
    let congregationLocation;
    if (!location) { // Never existed in destination
        return;
    }

    congregationLocation = location.congregationLocations.find(x => x.source === destination);

    return {
        operation,
        congregationLocation,
        congregationLocationActivityId,
        location: location.location,
        otherCongregationLocations: location.congregationLocations.filter(x => x !== congregationLocation),
    };
};

const applyRules = (attributes) => {
    if (!attributes) {
        return;
    }

    const { operation, location, otherCongregationLocations, congregationLocation } = attributes;
    const [albaCongregationLocation] = otherCongregationLocations.filter(x => x.source === 'ALBA');
    const hasMultipleCongregationLocations = otherCongregationLocations.length > 1;
    const isDoNotCall = albaCongregationLocation.sourceData['Status'] === 'Do not call';
    const isForeignLanguageInSource = albaCongregationLocation.sourceData['Language'] && albaCongregationLocation.sourceData['Language'].toUpperCase() !== 'ENGLISH'; // TODO this should be congrgration.language
    const sourceLocationType = congregationLocation ? congregationLocation.sourceData['Location Type'] : null;
    const isForeignLanguageInDestination = sourceLocationType === 'Language';
    const isTrackedByAlbaCongregation = albaCongregationLocation.sourceData['Kind'] === 'Foreign-Language' && albaCongregationLocation.sourceData['Status'] !== '';

    const { isDelete, isUpdate, isInsert } = booleanOperation(operation);


    if (isDoNotCall && !isForeignLanguageInSource && !isInsert) {
        if (isForeignLanguageInDestination) {
            // Assume it came from the source
            return false;
        }

        return {
            ...attributes,
            external: {
                'Location type': 'Home',
                'Location Status': 'Do not call',
                'Status': 'Do not call',
                'Language': 'English',
            },
            message: 'Converting to a regular DNC for this congregation\'s language',
        };
    }

    if (!isDoNotCall && !isForeignLanguageInSource && !isForeignLanguageInDestination && !isInsert) {
        return { ...attributes, conflict: true, message: 'This is a foreign-language location in ALBA, but not in TH.' };
    }

    if (!isTrackedByAlbaCongregation && !isForeignLanguageInSource && isForeignLanguageInDestination) {
        if (isInsert) {
            return false; // It was never added, so don't add it
        }

        return { ...attributes, operation: 'D', message: 'This location has transitioned from foreign-language back to local language.' };
    }

    if (isInsert) {
        return { ...attributes, congregationLocation: albaCongregationLocation };
    }

    return attributes;
};

const getRawDataToExport = async (startAt) => {
    const activitiesPromise = DAL.getCongregationLocationActivity({ congregationId, source: 'ALBA' }, startAt);
    const locationsPromise = DAL.getLocationsForCongregation(congregationId);
    let [activities, locations] = await Promise.all([activitiesPromise, locationsPromise]);

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

const getNormalizedAddressParts = (location) => {
    console.log(location)
    const { addressLine1, addressLine2, city, postalCode, province } = location;
    const address = `${addressLine1 || ''} ${addressLine2 || ''} ${city || ''} ${province || ''} ${postalCode}`;
    return parseLocation(address);
};

const convert = ({ location, congregationLocation = {}, externals, message }) => {
    console.log(getNormalizedAddressParts(location));

    return {
        'Territory type': 'Homes', // TODO This should be a tag on the territory
        'Territory number': location.territoryId, // TODO handle conflicts
        'Location type': 'Language',
        'Location Status': 'Do not call', // TODO setting both because there is a conflict between the sample and export
        'Status': 'Do not call', // TODO setting both because there is a conflict between the sample and export
        'Language': congregationLocation.language,
        'Latitude': location.latitude,
        'Longitude': location.longitude,
        'Address': location.addressLine1 + ' ' + location.addressLine2, // TODO this is a different format so I'll need something more granular than USPS
        'Number': location.addressLine1,
        'Street': location.addressLine1,
        'City': location.city,
        'Postal code': location.postalCode,
        'State': location.state,
        'Country code': location.countryCode,
        'Notes': message || congregationLocation.notes,
        ...(externals || {}),
    }
};

const createFile = async ({ inserts, updates, deletes }) => {
    const insertSheet = XLSX.utils.json_to_sheet(inserts);
    const updateSheet = XLSX.utils.json_to_sheet(updates);
    const deleteSheet = XLSX.utils.json_to_sheet(deletes);

    const workbook = {
        Sheets: { 'New': insertSheet, 'Updates': updateSheet, 'Deletions': deleteSheet },
        SheetNames: ['New', 'Updates', 'Deletions'],
    };

    const dir = path.resolve(outputDirectory);
    mkdirp(dir);

    const file = path.join(dir, `th_output_${new Date().valueOf()}.xlsx`);

    await writeExcelFile(file, workbook);
};

const booleanOperation = operation => ({ isDelete: operation === 'D', isUpdate: operation === 'U', isInsert: operation === 'I' });

const doStuff = async () => {
    const startAt = await getStartCongregationLocationActivityId();
    const exportActivities = await getRawDataToExport(startAt);

    await Promise.all([
        Promise.all(exportActivities.I.map(applyTerritory)),
        Promise.all(exportActivities.U.map(applyTerritory)),
        Promise.all(exportActivities.D.map(applyTerritory)),
    ]);

    const inserts = exportActivities.I.map(convert);
    const updates = exportActivities.U.map(convert);
    const deletes = exportActivities.D.map(convert);

    const output = { inserts, updates, deletes };
    // console.log(output);

    await createFile(output);
};

doStuff()
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });
