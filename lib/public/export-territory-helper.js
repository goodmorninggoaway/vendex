const { congregationId, file, destination } = require('../options');

const groupBy = require('lodash/groupBy');
const keyBy = require('lodash/keyBy');

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

const getStartCongregationLocationActivityId = async () => {
    const lastExport = await DAL.getLastExportActivity({ congregationId, destination });
    let minCongregationLocationActivityId = 0;
    if (lastExport) {
        minCongregationLocationActivityId = lastExport.lastCongregationLocationActivityId;
    }

    return minCongregationLocationActivityId + 1;
};

const getRawDataToExport = async (startAt) => {
    const activitiesPromise = DAL.getCongregationLocationActivity({ congregationId, source: 'ALBA' }, startAt);
    const locationsPromise = DAL.getLocationsForCongregation(congregationId);
    let [activities, locations] = await Promise.all([activitiesPromise, locationsPromise]);

    locations = keyBy(locations, 'location.locationId');

    const exportActivities = Object.values(groupBy(activities, 'locationId'))
        .reduce((memo, locationActivities) => {
            const initialActivity = locationActivities[0];
            const terminalActivity = locationActivities.slice(-1)[0];

            let operation = `${terminalActivity.operation || ''}${initialActivity.operation || ''}`;
            switch (operation) {
                case 'IU':
                case 'UU':
                case 'ID':
                case 'UD':
                    operation = 'U';
                    break;
                case 'DU':
                case 'DD':
                    operation = 'D';
                    break;
                case 'UI':
                case 'II':
                    operation = 'I';
                    break;
                case 'DI':
                default:
                    return memo;
            }

            terminalActivity.operation = operation;
            memo.push(terminalActivity);
            return memo;
        }, [])
        .reduce((memo, { congregationLocationActivityId, locationId, operation }) => {
            const locationMunge = locations[locationId];
            let congregationLocation;
            if (operation === 'D') {
                if (!locationMunge) { // Never existed in destination
                    memo.congregationLocationActivityId = congregationLocationActivityId;
                    return memo;
                }

                congregationLocation = locationMunge.congregationLocations.find(x => x.source === destination);
            } else {
                congregationLocation = locationMunge.congregationLocations.find(x => x.source !== destination);
            }

            memo[operation].push({
                congregationLocation,
                location: locationMunge.location,
                otherCongregrationLocations: locationMunge.congregationLocations.filter(x => x !== congregationLocation),
            });
            memo.congregationLocationActivityId = congregationLocationActivityId;
            return memo;
        }, { I: [], D: [], U: [], congregationLocationActivityId: 0 });

    return exportActivities;
};

const applyTerritory = async (location) => {
    const containingTerritories = await DAL.findTerritoryContainingPoint(congregationId, location.location);
    const originalTerritoryId = location.otherCongregrationLocations.length && location.otherCongregrationLocations[0].territoryId;

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
    location.congregationLocation.territoryMatches = containingTerritories;
};


const TH_BRIDGE_MAP = {
    id: null,
    territoryType: 'Territory type',
    territoryId: 'Territory number',
    locationType: 'Location type',
    language: 'Language',
    contactType: 'Status',
    latitude: 'Latitude',
    longitude: 'Longitude',
    addressDescription: 'Address',
    addressLine1: 'Number',
    addressLine2: null,
    street: 'Street',
    city: 'City',
    postalCode: 'Postal code',
    state: 'State',
    countryCode: 'Country code',
    notes: 'Notes',
    lastVisit: 'Last visited',
    updated: 'Last updated',
    created: 'Date created',
};
const convert = ({ location, congregationLocation, }) => {
    return {
        'Territory type': 'Homes', // Thios should be a tag on the territory
        'Territory number': location.territoryId, // TODO handle conflicts
        'Location type': 'Language',
        'Location Status': 'Return visit', // TODO setting both because there is a conflict between the sample and export
        'Status': 'Return visit', // TODO setting both because there is a conflict between the sample and export
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
        'Notes': congregationLocation.notes,
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

    const file = `${process.env.TEMP_DIR}/th_output_${new Date().valueOf()}.xlsx`;

    await writeExcelFile(file, workbook);
};

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
    console.log(output);

    await createFile(output);
};

doStuff()
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });
