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

const util = require('util');
const csv = require('csvtojson');
const differenceBy = require('lodash/differenceBy');
const hash = require('object-hash');
const geocode = require('../geocode');
const validateAddress = require('../validateAddress');
const DAL = require('../dataAccess').DAL;


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

const doStuff = async () => {
    const startAt = await getStartCongregationLocationActivityId();
    const exportActivities = await getRawDataToExport(startAt);

    await Promise.all([
        Promise.all(exportActivities.I.map(applyTerritory)),
        Promise.all(exportActivities.U.map(applyTerritory)),
        Promise.all(exportActivities.D.map(applyTerritory)),
    ]);

    console.log(exportActivities);
};

doStuff()
    .then(x => process.exit(0))
    .catch(x => {
        console.error(x);
        process.exit(1);
    });
